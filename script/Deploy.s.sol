// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {RedPacket} from "../src/RedPacket.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract Deploy is Script {
    function run() public {
        deployRedPacket();
    }

    function deployRedPacket() public returns (RedPacket, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();
        vm.startBroadcast();
        RedPacket redPacket = new RedPacket(
            networkConfig.keyHash,
            networkConfig.subscriptionId,
            networkConfig.callbackGasLimit,
            networkConfig.vrfCoordinator
        );
        vm.stopBroadcast();
        return (redPacket, helperConfig);
    }
}
