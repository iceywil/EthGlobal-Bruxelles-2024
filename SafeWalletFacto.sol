pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";

contract SafeWalletFactory is Ownable {
    event SafeCreated(address indexed owner, address safe);

    function createSafeWallet(bytes memory data) external onlyOwner returns (address) {
        GnosisSafe safe = new GnosisSafe();
        safe.setup(data);
        emit SafeCreated(msg.sender, address(safe));
        return address(safe);
    }
}
