// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {
    VRFCoordinatorV2_5Mock
} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {MockLinkToken} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/mocks/MockLinkToken.sol";

abstract contract CodeConstants {
    uint96 public constant BASE_FEE = 0.25 ether;
    uint96 public constant GAS_PRICE_LINK = 1e9;
    int256 public constant WEI_PER_UNIT_LINK = 4e15;

    uint256 public constant arbitrum_sepolia_CHAIN_ID = 421614;
    uint256 public constant arbitrum_one_CHAIN_ID = 42161;
    uint256 public constant ANVIL_CHAIN_ID = 31337;
}

contract HelperConfig is Script, CodeConstants {
    struct NetworkConfig {
        uint256 chainId;
        address vrfCoordinator;
        bytes32 keyHash;
        uint256 subscriptionId;
        uint32 callbackGasLimit;
        address link;
    }

    NetworkConfig public activeNetworkConfig;
    mapping(uint256 => NetworkConfig) public networkConfigs;

    constructor() {
        networkConfigs[arbitrum_sepolia_CHAIN_ID] = get_arbitrum_sepolia_network_config();
        networkConfigs[ANVIL_CHAIN_ID] = getOrCreateAnvilConfig();
    }

    function get_arbitrum_sepolia_network_config() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            chainId: arbitrum_sepolia_CHAIN_ID,
            vrfCoordinator: 0x41034678D6C633D8a95c75e1138A360a28bA15d1,
            keyHash: 0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be,
            subscriptionId: 115099438455386338205306979556334760441128316125757931006981360425487999328401,
            callbackGasLimit: 1000000,
            link: 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E
        });
    }

    function getOrCreateAnvilConfig() public returns (NetworkConfig memory) {
        if (activeNetworkConfig.vrfCoordinator != address(0)) {
            return activeNetworkConfig;
        }
        //Deploy mock
        VRFCoordinatorV2_5Mock vrfCoordinatorV2Mock =
        new VRFCoordinatorV2_5Mock(BASE_FEE, GAS_PRICE_LINK, WEI_PER_UNIT_LINK);
        MockLinkToken linkToken = new MockLinkToken();
        vm.startBroadcast();
        activeNetworkConfig = NetworkConfig({
            chainId: ANVIL_CHAIN_ID,
            vrfCoordinator: address(vrfCoordinatorV2Mock),
            keyHash: 0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be,
            subscriptionId: 115099438455386338205306979556334760441128316125757931006981360425487999328401,
            callbackGasLimit: 2500000,
            link: address(linkToken)
        });
        vm.stopBroadcast();
        networkConfigs[ANVIL_CHAIN_ID] = activeNetworkConfig;
        return activeNetworkConfig;
    }

    function getActiveNetworkConfig() public view returns (NetworkConfig memory) {
        return networkConfigs[block.chainid];
    }
}
