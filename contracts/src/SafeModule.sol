// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { ERC7579ModuleBase } from "modulekit/Modules.sol";
import { SafeL2 } from "@safe-global/safe-contracts/contracts/SafeL2.sol";
import { Enum } from "@safe-global/safe-contracts/contracts/common/Enum.sol";
import { IERC7579Account } from "modulekit/Accounts.sol";
import { ModeLib } from "erc7579/lib/ModeLib.sol";
import { ByteHasher } from "./helpers/ByteHasher.sol";
import { IWorldID } from "./interfaces/IWorldID.sol";

/**
 * @title SafeModule
 * @dev A module for managing recovery and inheritance for Safe accounts using WorldID and biometrics.
 */
contract SafeModule is ERC7579ModuleBase {
    using ByteHasher for bytes;

    /*//////////////////////////////////////////////////////////////////////////
                            CONSTANTS & STORAGE
    //////////////////////////////////////////////////////////////////////////*/
    IWorldID internal immutable worldId;

    uint256 internal immutable externalNullifier;

    uint256 internal immutable groupId = 1;

    struct Signer {
        uint256 recoveryTreshold;
        uint256 signaturesCount;
        bool recoveryEnabled;
        mapping(uint256 => bool) nullifierHashesTrusted;
    }

    struct SmartAccount {
        mapping(address => Signer) signers;
        bool moduleEnabled;
    }

    mapping(address => SmartAccount) internal smartAccounts;

    event ModuleInitialized(address indexed smartAccount);
    event ModuleUninitialized(address indexed smartAccount);
    // mapping for recovery proc

    event Verified(uint256 nullifierHash);

    // event for recovery proc
    event RecoveryThresholdChanged(
        address indexed smartAccount, address indexed signer, uint256 newThreshold
    );
    event RecoverUserAdded(address indexed smartAccount, address indexed signer);
    event RecoverUserRemoved(address indexed smartAccount, address indexed signer);

    constructor() {
        worldId = IWorldID(0x469449f251692E0779667583026b5A1E99512157);
        externalNullifier = abi.encodePacked(
            abi.encodePacked("app_staging_bb04a3642c04eeac26c5098e96879d83").hashToField(),
            "init-safe"
        ).hashToField();
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     CONFIG
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * @dev Initialize the module with the given data
     * @param data The data to initialize the module with
     */
    function onInstall(bytes calldata data) external override {
        smartAccounts[msg.sender].moduleEnabled = true;
        emit ModuleInitialized(msg.sender);
    }

    /**
     * @dev De-initialize the module with the given data
     * @param data The data to de-initialize the module with
     */
    function onUninstall(bytes calldata data) external override {
        if (!isInitialized(msg.sender)) revert("Module already uninstalled");
        smartAccounts[msg.sender].moduleEnabled = false;
        delete smartAccounts[msg.sender];
        emit ModuleUninitialized(msg.sender);
    }

    /**
     * @dev Check if the module is initialized
     * @param smartAccount The smart account to check
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) public view returns (bool) {
        return smartAccounts[smartAccount].moduleEnabled;
    }

    /**
     * @dev Check if recovery is enabled for a specific signer
     * @param smartAccount The smart account to check
     * @param signer The signer to check
     * @return true if recovery is enabled, false otherwise
     */
    function isRecoveryEnabled(address smartAccount, address signer) public view returns (bool) {
        return smartAccounts[smartAccount].signers[signer].recoveryEnabled;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/

    modifier isSafeSigner(address smartAccount, address signer) {
        address[] memory signers = SafeL2(payable(smartAccount)).getOwners();
        bool isSigner = false;
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signer) {
                isSigner = true;
                break;
            }
        }
        if (!isSigner) {
            revert("Signer not in Safe");
        }
        _;
    }

    modifier isModuleEnabled(address smartAccount) {
        if (!isInitialized(smartAccount)) {
            revert("Module uninintialized");
        }
        _;
    }

    /**
     * @dev Set up recovery for a smart account
     * @param smartAccount The smart account to set up recovery for
     * @param root The root of the Merkle tree
     * @param nullifierHash The nullifier hash
     * @param proof The zero-knowledge proof
     */
    function setupRecovery(
        address smartAccount,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    )
    external
    isModuleEnabled(smartAccount)
    isSafeSigner(smartAccount, msg.sender)
    {
        if (smartAccounts[smartAccount].signers[msg.sender].recoveryEnabled) revert("Recovery already configurated");

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(msg.sender).hashToField(),
            nullifierHash,
            externalNullifier,
            proof
        );

        smartAccounts[smartAccount].signers[msg.sender].recoveryEnabled = true;
        smartAccounts[smartAccount].signers[msg.sender].recoveryTreshold = 1;
        smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash] = true;
    }

    /**
     * @dev Disable recovery for a smart account
     * @param smartAccount The smart account to disable recovery for
     */
    function disableRecovery(address smartAccount)
    external
    isModuleEnabled(smartAccount)
    isSafeSigner(smartAccount, msg.sender)
    {
        if (!isRecoveryEnabled(smartAccount, msg.sender)) revert("Recovery not enabled for this signer");
        delete smartAccounts[smartAccount].signers[msg.sender];
    }

    /**
     * @dev Try to recover a smart account
     * @param smartAccount The smart account to recover
     * @param signerToRecover The signer to recover
     * @param root The root of the Merkle tree
     * @param nullifierHash The nullifier hash
     * @param proof The zero-knowledge proof
     */
    function tryRecovery(
        address smartAccount,
        address signerToRecover,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    )
    external
    isModuleEnabled(smartAccount)
    isSafeSigner(smartAccount, signerToRecover)
    {
        if (!isRecoveryEnabled(smartAccount, signerToRecover)) revert("Recovery not enabled for this signer");
        if (!smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash]) revert("User not authorized to recover this signer");

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(address(0)).hashToField(),
            nullifierHash,
            externalNullifier,
            proof
        );

        smartAccounts[smartAccount].signers[signerToRecover].signaturesCount++;

        if (
            smartAccounts[smartAccount].signers[signerToRecover].signaturesCount
            == smartAccounts[smartAccount].signers[signerToRecover].recoveryTreshold
        ) {
            SafeL2(payable(smartAccount)).execTransactionFromModule(
                smartAccount,
                0,
                abi.encodeWithSelector(
                    SafeL2(payable(smartAccount)).swapOwner.selector,
                    0x0000000000000000000000000000000000000001, // old
                    signerToRecover,
                    msg.sender // new signer
                ),
                Enum.Operation.Call
            );
        }
    }

    /**
     * @dev Add a user to the recovery list
     * @param smartAccount The smart account to add the user to
     * @param root The root of the Merkle tree
     * @param nullifierHash The nullifier hash
     * @param proof The zero-knowledge proof
     */
    function addRecoverUser(
        address smartAccount,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    )
    external
    isModuleEnabled(smartAccount)
    isSafeSigner(smartAccount, msg.sender)
    {
        if (!isRecoveryEnabled(smartAccount, msg.sender)) revert("Recovery not enabled for this signer");
        if (smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash]) revert("User already added to the list of recoverants");

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(address(0)).hashToField(),
            nullifierHash,
            externalNullifier,
            proof
        );

        smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash] = true;

        emit RecoverUserAdded(smartAccount, msg.sender);
    }

    /**
     * @dev Remove a user from the recovery list
     * @param smartAccount The smart account to remove the user from
     * @param nullifierHash The nullifier hash
     */
    function removeRecoverUser(
        address smartAccount,
        uint256 nullifierHash
    )
    external
    isModuleEnabled(smartAccount)
    isSafeSigner(smartAccount, msg.sender)
    {
        if (!isRecoveryEnabled(smartAccount, msg.sender)) revert("Recovery not enabled for this signer");
        if (!smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash]) revert("User not in the list of recoverants");

        smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash] = false;

        emit RecoverUserRemoved(smartAccount, msg.sender);
    }

    /**
     * @dev Change the recovery threshold for a specific signer of a smart account
     * @param smartAccount The smart account for which to change the threshold
     * @param newThreshold The new threshold of required signatures
     */
    function changeRecoveryThreshold(
        address payable smartAccount,
        uint256 newThreshold
    )
    external
    isModuleEnabled(smartAccount)
    isSafeSigner(smartAccount, msg.sender)
    {
        if (!isRecoveryEnabled(smartAccount, msg.sender)) revert("Recovery not enabled for this signer");
        if (newThreshold <= 0) revert("Threshold cannot be lower or equal to 0");

        smartAccounts[smartAccount].signers[msg.sender].recoveryTreshold = newThreshold;
        smartAccounts[smartAccount].signers[msg.sender].signaturesCount = 0;

        emit RecoveryThresholdChanged(smartAccount, msg.sender, newThreshold);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     INTERNAL
    //////////////////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////////////////
                                     METADATA
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * @dev The name of the module
     * @return name The name of the module
     */
    function name() external pure returns (string memory) {
        return "SafeModule";
    }

    /**
     * @dev The version of the module
     * @return version The version of the module
     */
    function version() external pure returns (string memory) {
        return "0.0.1";
    }

    /**
     * @dev Check if the module is of a certain type
     * @param typeID The type ID to check
     * @return true if the module is of the given type, false otherwise
     */
    function isModuleType(uint256 typeID) external pure override returns (bool) {
        return typeID == TYPE_VALIDATOR || typeID == TYPE_EXECUTOR || typeID == TYPE_FALLBACK
            || typeID == TYPE_HOOK;
    }
}
