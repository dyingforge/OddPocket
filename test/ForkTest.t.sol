// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {RedPacket} from "../src/RedPacket.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/**
 * @title ForkTest
 * @notice 使用 Fork 测试已部署的合约
 * @dev 运行命令: forge test --fork-url https://sepolia-rollup.arbitrum.io/rpc --match-contract ForkTest -vvv
 */
contract ForkTest is Test {
    RedPacket public redPacket = RedPacket(0x9Ada12453663fd9B2d4d55986B519C9A558f5a95);
    
    address public constant WETH = 0x980B62Da83eFf3D4576C647993b0c1D7faf17c73;
    
    address public constant VRF_COORDINATOR = 0x5CE8D5A2BC84beb22a398CCA51996F7930313D61;
    
    // 测试用户
    address public owner;
    address public claimer;
    
    function setUp() public {
        // 创建测试用户
        owner = makeAddr("owner");
        claimer = makeAddr("claimer");
        
        // 给测试用户一些 ETH
        vm.deal(owner, 100 ether);
        vm.deal(claimer, 100 ether);
        
        console.log("=== Fork Test Setup ===");
        console.log("RedPacket Address:", address(redPacket));
        console.log("WETH Address:", WETH);
        console.log("Owner:", owner);
        console.log("Claimer:", claimer);
    }
    
    /**
     * @notice 测试完整的创建和领取流程
     */
    function test_FullFlow() public {
        uint256 amount = 0.01 ether;
        
        console.log("\n=== Step 1: Owner wraps ETH to WETH ===");
        vm.startPrank(owner);
        
        // 包装 ETH 到 WETH
        (bool success,) = WETH.call{value: amount}(abi.encodeWithSignature("deposit()"));
        require(success, "Wrap ETH failed");
        
        uint256 wethBalance = IERC20(WETH).balanceOf(owner);
        console.log("Owner WETH balance:", wethBalance);
        require(wethBalance >= amount, "WETH balance insufficient");
        
        console.log("\n=== Step 2: Owner approves WETH ===");
        // Approve WETH 给 RedPacket 合约
        IERC20(WETH).approve(address(redPacket), amount);
        console.log("Approved:", IERC20(WETH).allowance(owner, address(redPacket)));
        
        console.log("\n=== Step 3: Owner creates red packet ===");
        // 创建红包
        uint256 packetIdBefore = redPacket.getRedPacketInfo(0).totalAmount > 0 ? 1 : 0;
        
        try redPacket.createRedPacket(amount, WETH, "Test Red Packet") {
            console.log("Red packet created successfully!");
            console.log("Packet ID:", packetIdBefore);
        } catch Error(string memory reason) {
            console.log("Create failed:", reason);
            revert(reason);
        } catch (bytes memory lowLevelData) {
            console.log("Create failed with low level error");
            console.logBytes(lowLevelData);
            revert("Create failed");
        }
        
        vm.stopPrank();
        
        // 验证红包创建成功
        RedPacket.RedPacketInfo memory packet = redPacket.getRedPacketInfo(packetIdBefore);
        console.log("\n=== Red Packet Info ===");
        console.log("Owner:", packet.owner);
        console.log("Total Amount:", packet.totalAmount);
        console.log("Token:", packet.token);
        console.log("Is Active:", packet.isActive);
        
        require(packet.owner == owner, "Owner mismatch");
        require(packet.totalAmount == amount, "Amount mismatch");
        require(packet.isActive, "Packet not active");
        
        console.log("\n=== Step 4: Claimer wraps ETH to WETH (250% of amount) ===");
        vm.startPrank(claimer);
        
        uint256 maxAmount = amount * 250 / 100; // 250%
        console.log("Required WETH for claim:", maxAmount);
        
        // Claimer 包装 ETH 到 WETH
        (success,) = WETH.call{value: maxAmount}(abi.encodeWithSignature("deposit()"));
        require(success, "Claimer wrap ETH failed");
        
        uint256 claimerWethBalance = IERC20(WETH).balanceOf(claimer);
        console.log("Claimer WETH balance:", claimerWethBalance);
        require(claimerWethBalance >= maxAmount, "Claimer WETH balance insufficient");
        
        console.log("\n=== Step 5: Claimer approves WETH ===");
        IERC20(WETH).approve(address(redPacket), maxAmount);
        console.log("Claimer approved:", IERC20(WETH).allowance(claimer, address(redPacket)));
        
        console.log("\n=== Step 6: Claimer claims red packet ===");
        try redPacket.claimRedPacket(packetIdBefore) {
            console.log("Claim transaction sent successfully!");
            console.log("Note: VRF callback will happen later");
        } catch Error(string memory reason) {
            console.log("Claim failed:", reason);
            
            // 解析常见错误
            if (keccak256(bytes(reason)) == keccak256(bytes("RedPacket_AlreadyClaimed()"))) {
                console.log("=> Red packet already claimed");
            } else if (keccak256(bytes(reason)) == keccak256(bytes("RedPacket_TransferFailed()"))) {
                console.log("=> WETH transfer failed. Check balance and allowance");
            }
            
            revert(reason);
        } catch (bytes memory lowLevelData) {
            console.log("Claim failed with low level error:");
            console.logBytes(lowLevelData);
            
            // 解析错误选择器
            if (lowLevelData.length >= 4) {
                bytes4 errorSelector;
                assembly {
                    errorSelector := mload(add(lowLevelData, 0x20))
                }
                console.log("Error selector:");
                console.logBytes4(errorSelector);
                
                // RedPacket_AlreadyClaimed() = 0x3b7faa1f
                // RedPacket_TransferFailed() = 0x1a0e2859
                if (errorSelector == 0x3b7faa1f) {
                    console.log("=> Red packet already claimed");
                } else if (errorSelector == 0x1a0e2859) {
                    console.log("=> WETH transfer failed");
                }
            }
            
            revert("Claim failed");
        }
        
        vm.stopPrank();
        
        // 验证状态
        packet = redPacket.getRedPacketInfo(packetIdBefore);
        console.log("\n=== After Claim ===");
        console.log("Claimer:", packet.claimer);
        console.log("Is Active:", packet.isActive);
        
        require(packet.claimer == claimer, "Claimer not set");
    }
    
    /**
     * @notice 测试查看现有红包
     */
    function test_ViewExistingPackets() public view {
        console.log("\n=== Existing Red Packets ===");
        
        // 查询前 5 个红包
        for (uint256 i = 0; i < 5; i++) {
            try redPacket.getRedPacketInfo(i) returns (RedPacket.RedPacketInfo memory packet) {
                if (packet.totalAmount > 0) {
                    console.log("\nPacket ID:", i);
                    console.log("Owner:", packet.owner);
                    console.log("Claimer:", packet.claimer);
                    console.log("Total Amount:", packet.totalAmount);
                    console.log("Claimed Amount:", packet.claimedAmount);
                    console.log("Token:", packet.token);
                    console.log("Is Active:", packet.isActive);
                    console.log("Description:", packet.description);
                }
            } catch {
                console.log("Packet", i, "does not exist");
                break;
            }
        }
    }
    
    /**
     * @notice 模拟 VRF 回调
     * @dev 需要使用 vm.prank(VRF_COORDINATOR) 来模拟 VRF Coordinator 调用
     */
    function test_SimulateVRFCallback() public {
        // 首先创建一个红包并 claim
        uint256 amount = 0.01 ether;
        
        // Owner 创建红包
        vm.startPrank(owner);
        (bool success,) = WETH.call{value: amount}(abi.encodeWithSignature("deposit()"));
        require(success);
        IERC20(WETH).approve(address(redPacket), amount);
        redPacket.createRedPacket(amount, WETH, "Test for VRF");
        vm.stopPrank();
        
        uint256 packetId = 0; // 假设是第一个红包
        
        // Claimer claim 红包
        vm.startPrank(claimer);
        uint256 maxAmount = amount * 250 / 100;
        (success,) = WETH.call{value: maxAmount}(abi.encodeWithSignature("deposit()"));
        require(success);
        IERC20(WETH).approve(address(redPacket), maxAmount);
        redPacket.claimRedPacket(packetId);
        vm.stopPrank();
        
        console.log("\n=== Simulating VRF Callback ===");
        console.log("Note: In production, this is called by VRF Coordinator");
        console.log("You need to wait for actual VRF response on testnet");
        
        // 注意：在 Fork 测试中，我们无法直接调用 fulfillRandomWords
        // 因为它是 internal 且只能由 VRF Coordinator 调用
        // 在真实环境中，需要等待 VRF Coordinator 的回调
    }
    
    /**
     * @notice 检查 WETH 余额和 allowance
     */
    function test_CheckWETHStatus() public {
        address user = makeAddr("testUser");
        vm.deal(user, 1 ether);
        
        console.log("\n=== WETH Status Check ===");
        console.log("User:", user);
        console.log("ETH Balance:", user.balance);
        
        vm.startPrank(user);
        
        // 包装 ETH
        uint256 wrapAmount = 0.1 ether;
        (bool success,) = WETH.call{value: wrapAmount}(abi.encodeWithSignature("deposit()"));
        require(success, "Wrap failed");
        
        console.log("WETH Balance:", IERC20(WETH).balanceOf(user));
        
        // Approve
        IERC20(WETH).approve(address(redPacket), wrapAmount);
        console.log("Allowance:", IERC20(WETH).allowance(user, address(redPacket)));
        
        vm.stopPrank();
    }
}

