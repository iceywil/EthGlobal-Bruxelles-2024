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

    mapping(uint256 => bool) internal nullifierHashes;
    mapping(address => bool) internal moduleEnableds;
    mapping(address => mapping(address => uint256)) internal proofsPerAccount;

    event Verified(uint256 nullifierHash);

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
        // set mapping address => bool to true for the caller
        moduleEnableds[msg.sender] = true;
    }

    /**
     * De-initialize the module with the given data
     *
     * @param data The data to de-initialize the module with
     */
    function onUninstall(bytes calldata data) external override {
        // set mapping address => bool to false if the account has enabled recovery
        moduleEnableds[msg.sender] = false;
    }

    /**
     * Check if the module is initialized
     * @param smartAccount The smart account to check
     *
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) external view returns (bool) {
        // check in the mapping address => bool if the module is enabled
        return moduleEnableds[smartAccount];
    }

    function isRecoveryEnabled(address smartAccount, address signer) external view returns (bool) {
        // check in the mapping address => bool if the recovery is enabled from a signer
        return proofsPerAccount[smartAccount][signer] > 0;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * Execute the given data
     * @dev This is an example function that can be used to execute arbitrary data
     * @dev This function is not part of the ERC-7579 standard
     *
     */
    function recover(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    )
        external
    {
        if (nullifierHashes[nullifierHash]) revert DuplicateNullifier(nullifierHash);
        // check if person has the recovery enabled

        nullifierHashes[nullifierHash] = true;

        SafeL2(account).execTransactionFromModule(
            account,
            0,
            abi.encodeWithSelector(
                SafeL2(account).swapOwner.selector,
                0x0000000000000000000000000000000000000001, // get value before in the linked list
                0xAfE56A12c037f3787637CDB7DeEcacf3080cb35d, // get the old wallet linked to the id
                msg.sender
            ),
            Enum.Operation.Call
        );
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
        return true;
    }
}
