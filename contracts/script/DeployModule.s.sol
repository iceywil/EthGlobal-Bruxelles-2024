// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import { RegistryDeployer } from "modulekit/deployment/RegistryDeployer.sol";

// Import modules here
import { SafeModule } from "src/SafeModule.sol";

/// @title DeployModuleScript
contract DeployModuleScript is Script, RegistryDeployer {
    function run() public {
        // Setup module bytecode, deploy params, and data
        bytes memory bytecode = type(SafeModule).creationCode;
        bytes memory deployParams = "";
        bytes memory data = "";

        // Get private key for deployment
        vm.startBroadcast(vm.envUint("PK"));

        // Deploy module
        SafeModule module = new SafeModule();

        // Stop broadcast and log module address
        vm.stopBroadcast();
        console.log("Deploying module at: %s", address(module));
    }
}
