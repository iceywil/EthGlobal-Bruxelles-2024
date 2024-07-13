// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { Test } from "forge-std/Test.sol";
import {
RhinestoneModuleKit,
ModuleKitHelpers,
ModuleKitUserOp,
AccountInstance
} from "modulekit/ModuleKit.sol";
import { MODULE_TYPE_EXECUTOR } from "modulekit/external/ERC7579.sol";
import { SafeModule } from "../src/SafeModule.sol";
import { MockWorldID } from "../src/MockWorldID.sol";
import { MockSafeL2 } from "../src/MockSafeL2.sol";
import { IWorldID } from "../src/interfaces/IWorldId.sol";

contract SafeModuleTest is RhinestoneModuleKit, Test {
    using ModuleKitHelpers for *;
    using ModuleKitUserOp for *;

    // account and modules
    AccountInstance internal instance;
    SafeModule internal executor;
    MockWorldID internal mockWorldID;
    MockSafeL2 internal mockSafeL2;

    address owner = address(0x1);
    address addr1 = address(0x2);
    address addr2 = address(0x3);
    address addr3 = address(0x4);

    function setUp() public {
        init();

        // Deploy mock contracts
        mockWorldID = new MockWorldID();
        mockSafeL2 = new MockSafeL2([owner, addr1, addr2]);

        // Create the executor
        executor = new SafeModule(IWorldID(address(mockWorldID)), "appId", "actionId");
        vm.label(address(executor), "SafeModule");

        // Create the account and install the executor
        instance = makeAccountInstance("SafeModule");
        vm.deal(address(instance.account), 10 ether);
        instance.installModule({
            moduleTypeId: MODULE_TYPE_EXECUTOR,
            module: address(executor),
            data: ""
        });
    }

    function testExec() public {
        // Create a target address and send some ether to it
        address target = makeAddr("target");
        uint256 value = 1 ether;

        // Get the current balance of the target
        uint256 prevBalance = target.balance;

        // Encode the execution data sent to the account
        bytes memory callData = abi.encodeWithSignature("testFunc()");

        // Execute the call using the recover function
        instance.exec({
            target: address(executor),
            value: 0,
            callData: abi.encodeWithSelector(SafeModule.recover.selector, address(instance.account), address(target), 0, 0, [uint256(0)])
        });

        // Check if the balance of the target has increased
        assertEq(target.balance, prevBalance + value);
    }

    function testAddRecoverUser() public {
        vm.startPrank(owner);
        executor.onInstall("");
        executor.addRecoverUser(address(instance.account), addr1);
        vm.stopPrank();

        assertTrue(executor.authorizedSigners(address(instance.account), addr1));
    }

    function testAddRecoverUserNotAuthorized() public {
        vm.startPrank(addr3);
        vm.expectRevert("Caller is not an authorized signer");
        executor.addRecoverUser(address(instance.account), addr1);
        vm.stopPrank();
    }

    function testRemoveRecoverUser() public {
        vm.startPrank(owner);
        executor.onInstall("");
        executor.addRecoverUser(address(instance.account), addr1);
        executor.removeRecoverUser(address(instance.account), addr1);
        vm.stopPrank();

        assertFalse(executor.authorizedSigners(address(instance.account), addr1));
    }

    function testRemoveRecoverUserNotAuthorized() public {
        vm.startPrank(owner);
        executor.onInstall("");
        executor.addRecoverUser(address(instance.account), addr1);
        vm.stopPrank();

        vm.startPrank(addr3);
        vm.expectRevert("Caller is not an authorized signer");
        executor.removeRecoverUser(address(instance.account), addr1);
        vm.stopPrank();
    }

    function testChangeRecoveryThreshold() public {
        vm.startPrank(owner);
        executor.onInstall("");
        executor.addRecoverUser(address(instance.account), addr1);
        vm.stopPrank();

        vm.startPrank(addr1);
        executor.changeRecoveryThreshold(address(instance.account), addr1, 2);
        vm.stopPrank();

        assertEq(executor.recoveryThresholds(address(instance.account), addr1), 2);
    }

    function testChangeRecoveryThresholdNotAuthorized() public {
        vm.startPrank(owner);
        executor.onInstall("");
        executor.addRecoverUser(address(instance.account), addr1);
        vm.stopPrank();

        vm.startPrank(addr3);
        vm.expectRevert("Not authorized to change recovery threshold");
        executor.changeRecoveryThreshold(address(instance.account), addr1, 2);
        vm.stopPrank();
    }

    function testChangeRecoveryThresholdNotSigner() public {
        vm.startPrank(owner);
        executor.onInstall("");
        executor.addRecoverUser(address(instance.account), addr3); // addr3 is not a signer
        vm.stopPrank();

        vm.startPrank(addr3);
        vm.expectRevert("Signer not authorized for this account");
        executor.changeRecoveryThreshold(address(instance.account), addr3, 2);
        vm.stopPrank();
    }
}
