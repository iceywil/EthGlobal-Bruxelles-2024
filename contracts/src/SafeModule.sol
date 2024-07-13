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
    error DuplicateNullifier(uint256 nullifierHash);

    IWorldID internal immutable worldId;

    uint256 internal immutable externalNullifier;

    uint256 internal immutable groupId = 1;

    mapping(address => bool) internal moduleEnableds;
    // smartAccount => signer => proofs number
    mapping(address => mapping(address => uint256)) internal proofsPerAccount;
    // smartAccount => signer => nullifierHash => authorized
    mapping(address => mapping(address => mapping(uint256 => bool))) internal
        recoveryEnabledForNullifier;

    event ModuleInitialized(address indexed smartAccount);
    event ModuleUninitialized(address indexed smartAccount);

    constructor(IWorldID _worldId, string memory _appId, string memory _actionId) {
        worldId = _worldId;
        externalNullifier =
            abi.encodePacked(abi.encodePacked(_appId).hashToField(), _actionId).hashToField();
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
        if (isInitialized(msg.sender)) {
            if (data.length == 0) {
                return;
            } else {
                revert("ModuleAlreadyInitialized");
            }
        }

        moduleEnableds[msg.sender] = true;

        emit ModuleInitialized(msg.sender);
    }

    /**
     * De-initialize the module with the given data
     *
     * @param data The data to de-initialize the module with
     */
    function onUninstall(bytes calldata data) external override {
        require(isInitialized(msg.sender), "Module already uninstalled");
        moduleEnableds[msg.sender] = false;

        emit ModuleUninitialized(msg.sender);
    }

    /**
     * Check if the module is initialized
     * @param smartAccount The smart account to check
     *
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) external view returns (bool) {
        return moduleEnableds[smartAccount];
    }

    function isRecoveryEnabled(address smartAccount, address signer) external view returns (bool) {
        // check in the mapping address => bool if the recovery is enabled from a signer
        return proofsPerAccount[smartAccount][signer] > 0;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/

    function setupRecovery(
        address smartAccount,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    )
        external
    {
        // check if msg.sender is member of the safe
        // think about logic
        require(proofsPerAccount[smartAccount][msg.sender] == 0, "Recovery already configurated");
        require(recoveryEnabledForNullifier[smartAccount][msg.sender][nullifierHash], "Fuck");

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        proofsPerAccount[smartAccount][msg.sender] = 1;
    }

    /**
     * Execute the given data
     * @dev This is an example function that can be used to execute arbitrary data
     * @dev This function is not part of the ERC-7579 standard
     *
     */
    function tryRecover(
        address smartAccount,
        address signerToSwap,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    )
        external
    {
        // check if signerToSwap has recovery enabled
        require(
            recoveryEnabledForNullifier[smartAccount][signerToSwap][nullifierHash],
            "Fuck nullifier can't recover this signer"
        );

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // if tryRecoveryCount == treshold => exec the swap
        // SafeL2(account).execTransactionFromModule(
        //     account,
        //     0,
        //     abi.encodeWithSelector(
        //         SafeL2(account).swapOwner.selector,
        //         0x0000000000000000000000000000000000000001,
        //         0xAfE56A12c037f3787637CDB7DeEcacf3080cb35d,
        //         msg.sender
        //     ),
        //     Enum.Operation.Call
        // );
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
        return typeID == TYPE_HOOK;
    }
}
