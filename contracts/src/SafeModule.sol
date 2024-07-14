// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { ERC7579ModuleBase } from "modulekit/Modules.sol";
import { SafeL2 } from "@safe-global/safe-contracts/contracts/SafeL2.sol";
import { Enum } from "@safe-global/safe-contracts/contracts/common/Enum.sol";
import { IERC7579Account } from "modulekit/Accounts.sol";
import { ModeLib } from "erc7579/lib/ModeLib.sol";
import { ByteHasher } from "./helpers/ByteHasher.sol";
import { IWorldID } from "./interfaces/IWorldID.sol";

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
     * Initialize the module with the given data
     *
     * @param data The data to initialize the module with
     */
    function onInstall(bytes calldata data) external override {
        // if (isInitialized(msg.sender)) {
        //     if (data.length == 0) {
        //         return;
        //     } else {
        //         revert("ModuleAlreadyInitialized");
        //     }
        // }

        smartAccounts[msg.sender].moduleEnabled = true;

        emit ModuleInitialized(msg.sender);
    }

    /**
     * De-initialize the module with the given data
     *
     * @param data The data to de-initialize the module with
     */
    function onUninstall(bytes calldata data) external override {
        require(isInitialized(msg.sender), "Module already uninstalled");

        smartAccounts[msg.sender].moduleEnabled = false;

        delete smartAccounts[msg.sender];

        emit ModuleUninitialized(msg.sender);
    }

    /**
     * Check if the module is initialized
     * @param smartAccount The smart account to check
     *
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) public view returns (bool) {
        return smartAccounts[smartAccount].moduleEnabled;
    }

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
        require(isSigner, "Signer not in Safe");
        _;
    }

    modifier isModuleEnabled(address smartAccount) {
        require(isInitialized(smartAccount), "Module uninintialized");
        _;
    }

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
        require(
            !smartAccounts[smartAccount].signers[msg.sender].recoveryEnabled,
            "Recovery already configurated"
        );

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

    function disableRecovery(address smartAccount)
        external
        isModuleEnabled(smartAccount)
        isSafeSigner(smartAccount, msg.sender)
    {
        require(isRecoveryEnabled(smartAccount, msg.sender), "Recovery not enabled for this signer");

        delete smartAccounts[smartAccount].signers[msg.sender];
    }

    /**
     * Execute the given data
     * @dev This is an example function that can be used to execute arbitrary data
     * @dev This function is not part of the ERC-7579 standard
     *
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
        require(
            isRecoveryEnabled(smartAccount, signerToRecover), "Recovery not enabled for this signer"
        );
        require(
            smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash],
            "User not authorized to recover this signer"
        );

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
        require(isRecoveryEnabled(smartAccount, msg.sender), "Recovery not enabled for this signer");
        require(
            !smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash],
            "User already added to the list of recoverants"
        );

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

    function removeRecoverUser(
        address smartAccount,
        uint256 nullifierHash
    )
        external
        isModuleEnabled(smartAccount)
        isSafeSigner(smartAccount, msg.sender)
    {
        require(isRecoveryEnabled(smartAccount, msg.sender), "Recovery not enabled for this signer");
        require(
            smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash],
            "User not in the list of recoverants"
        );

        smartAccounts[smartAccount].signers[msg.sender].nullifierHashesTrusted[nullifierHash] =
            false;

        emit RecoverUserRemoved(smartAccount, msg.sender);
    }

    /**
     * Change the recovery threshold for a specific signer of a smart account
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
        require(isRecoveryEnabled(smartAccount, msg.sender), "Recovery not enabled for this signer");
        require(newThreshold > 0, "Threshold cannot be lower or equal to 0");

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
     * The name of the module
     *
     * @return name The name of the module
     */
    function name() external pure returns (string memory) {
        return "SafeModule";
    }

    /**
     * The version of the module
     *
     * @return version The version of the module
     */
    function version() external pure returns (string memory) {
        return "0.0.1";
    }

    /**
     * Check if the module is of a certain type
     *
     * @param typeID The type ID to check
     *
     * @return true if the module is of the given type, false otherwise
     */
    function isModuleType(uint256 typeID) external pure override returns (bool) {
        return typeID == TYPE_VALIDATOR || typeID == TYPE_EXECUTOR || typeID == TYPE_FALLBACK
            || typeID == TYPE_HOOK;
    }
}
