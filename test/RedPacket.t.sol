// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {RedPacket} from "../src/RedPacket.sol";
import {Deploy} from "../script/Deploy.s.sol";
import {HelperConfig} from "../script/HelperConfig.s.sol";
import {LinkToken} from "./LinkToken.sol";
import {
    VRFCoordinatorV2_5Mock
} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract RedPacketTest is Test {
    RedPacket public redPacket;
    HelperConfig public helperConfig;
    LinkToken public linkToken;
    VRFCoordinatorV2_5Mock public vrfCoordinator;

    address public owner = makeAddr("owner");
    address public claimer = makeAddr("claimer");
    uint256 public constant STARTING_BALANCE = 100 ether;
    uint256 public constant RED_PACKET_AMOUNT = 10 ether;

    // 事件定义
    event RedPacketCreated(uint256 packetId, address indexed owner, uint256 indexed totalAmount, address indexed token);
    event RedPacketClaimed(uint256 packetId, address indexed sender, uint256 indexed amount);

    function setUp() public {
        // 先获取配置以访问 VRF Coordinator
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        vrfCoordinator = VRFCoordinatorV2_5Mock(config.vrfCoordinator);

        // 创建 VRF subscription
        uint256 subId = vrfCoordinator.createSubscription();
        vrfCoordinator.fundSubscription(subId, 100 ether);

        // 使用新的 subscription ID 部署 RedPacket
        redPacket = new RedPacket(
            config.keyHash,
            subId, // 使用我们刚创建的 subscription ID
            config.callbackGasLimit,
            config.vrfCoordinator
        );

        // 添加合约为 consumer
        vrfCoordinator.addConsumer(subId, address(redPacket));

        // 部署 LinkToken 作为测试代币
        linkToken = new LinkToken();

        // 为 owner 和 claimer 分配代币
        linkToken.mint(owner, STARTING_BALANCE);
        linkToken.mint(claimer, STARTING_BALANCE);
    }

    /*//////////////////////////////////////////////////////////////
                            CREATE RED PACKET
    //////////////////////////////////////////////////////////////*/

    function testCreateRedPacket() public {
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), RED_PACKET_AMOUNT);

        vm.expectEmit(true, true, true, false);
        emit RedPacketCreated(0, owner, RED_PACKET_AMOUNT, address(linkToken));

        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();

        // 验证红包信息
        RedPacket.RedPacketInfo memory info = redPacket.getRedPacketInfo(0);
        assertEq(info.owner, owner);
        assertEq(info.totalAmount, RED_PACKET_AMOUNT);
        assertEq(info.token, address(linkToken));
        assertEq(info.isActive, true);
        assertEq(info.claimedAmount, 0);
        assertEq(info.claimer, address(0));

        // 验证代币转账
        assertEq(linkToken.balanceOf(address(redPacket)), RED_PACKET_AMOUNT);
        assertEq(linkToken.balanceOf(owner), STARTING_BALANCE - RED_PACKET_AMOUNT);
    }

    function testCreateRedPacketRevertsIfAmountIsZero() public {
        vm.startPrank(owner);
        vm.expectRevert();
        redPacket.createRedPacket(0, address(linkToken), "Test Description");
        vm.stopPrank();
    }

    function testCreateRedPacketRevertsIfNoApproval() public {
        vm.startPrank(owner);
        // 没有 approve
        vm.expectRevert();
        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();
    }

    function testCreateMultipleRedPackets() public {
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), RED_PACKET_AMOUNT * 3);

        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();

        // 验证三个红包都被创建
        RedPacket.RedPacketInfo memory info0 = redPacket.getRedPacketInfo(0);
        RedPacket.RedPacketInfo memory info1 = redPacket.getRedPacketInfo(1);
        RedPacket.RedPacketInfo memory info2 = redPacket.getRedPacketInfo(2);

        assertEq(info0.owner, owner);
        assertEq(info1.owner, owner);
        assertEq(info2.owner, owner);
        assertEq(linkToken.balanceOf(address(redPacket)), RED_PACKET_AMOUNT * 3);
    }

    /*//////////////////////////////////////////////////////////////
                            CLAIM RED PACKET
    //////////////////////////////////////////////////////////////*/

    function testClaimRedPacket() public {
        // 先创建红包
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), RED_PACKET_AMOUNT);
        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();

        // 领取红包（需要支付 250% totalAmount）
        uint256 claimAmount = RED_PACKET_AMOUNT * 250 / 100; // 25 ether
        vm.startPrank(claimer);
        linkToken.approve(address(redPacket), claimAmount);
        redPacket.claimRedPacket(0);
        vm.stopPrank();

        // 验证状态
        RedPacket.RedPacketInfo memory info = redPacket.getRedPacketInfo(0);
        assertEq(info.claimer, claimer);

        // 验证代币转账
        assertEq(linkToken.balanceOf(address(redPacket)), RED_PACKET_AMOUNT + claimAmount); // 10 + 25 = 35
        assertEq(linkToken.balanceOf(claimer), STARTING_BALANCE - claimAmount); // 100 - 25 = 75
    }

    function testClaimRedPacketRevertsIfAlreadyClaimed() public {
        // 创建红包
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), RED_PACKET_AMOUNT);
        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();

        // 第一次领取
        uint256 claimAmount = RED_PACKET_AMOUNT * 250 / 100;
        vm.startPrank(claimer);
        linkToken.approve(address(redPacket), claimAmount * 2);
        redPacket.claimRedPacket(0);

        // 模拟 VRF 回调，将 isActive 设为 false
        vm.stopPrank();
        fulfillRandomWords(0);

        // 第二次领取应该失败
        vm.startPrank(claimer);
        vm.expectRevert(RedPacket.RedPacket_AlreadyClaimed.selector);
        redPacket.claimRedPacket(0);
        vm.stopPrank();
    }

    function testClaimRedPacketRevertsIfInsufficientBalance() public {
        // 创建红包
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), RED_PACKET_AMOUNT);
        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();

        // 创建一个余额不足的用户
        address poorUser = makeAddr("poorUser");
        linkToken.mint(poorUser, 1 ether); // 只给 1 ether，不够支付 25 ether

        vm.startPrank(poorUser);
        linkToken.approve(address(redPacket), 100 ether);
        vm.expectRevert();
        redPacket.claimRedPacket(0);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        FULFILL RANDOM WORDS (VRF)
    //////////////////////////////////////////////////////////////*/

    function testFulfillRandomWordsDistributesTokensCorrectly() public {
        // 创建并领取红包
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), RED_PACKET_AMOUNT);
        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();

        uint256 claimAmount = RED_PACKET_AMOUNT * 250 / 100;
        vm.startPrank(claimer);
        linkToken.approve(address(redPacket), claimAmount);
        redPacket.claimRedPacket(0);
        vm.stopPrank();

        // 记录领取前的余额
        uint256 claimerBalanceBefore = linkToken.balanceOf(claimer);
        uint256 ownerBalanceBefore = linkToken.balanceOf(owner);

        // 模拟 VRF 回调
        fulfillRandomWords(0);

        // 验证红包状态
        RedPacket.RedPacketInfo memory info = redPacket.getRedPacketInfo(0);
        assertEq(info.isActive, false);
        assertTrue(info.claimedAmount >= RED_PACKET_AMOUNT * 30 / 100); // >= 30%
        assertTrue(info.claimedAmount <= RED_PACKET_AMOUNT * 250 / 100); // <= 250%

        // 验证代币分配
        uint256 claimerBalanceAfter = linkToken.balanceOf(claimer);
        uint256 ownerBalanceAfter = linkToken.balanceOf(owner);

        // claimer 应该收到：totalAmount + max - amount
        // owner 应该收到：amount
        assertTrue(claimerBalanceAfter > claimerBalanceBefore);
        assertTrue(ownerBalanceAfter > ownerBalanceBefore);

        // 验证总金额守恒
        uint256 totalDistributed = (claimerBalanceAfter - claimerBalanceBefore) + 
                                    (ownerBalanceAfter - ownerBalanceBefore);
        assertEq(totalDistributed, RED_PACKET_AMOUNT + claimAmount); // 35 ether
    }

    function testFulfillRandomWordsEmitsEvent() public {
        // 创建并领取红包
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), RED_PACKET_AMOUNT);
        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();

        uint256 claimAmount = RED_PACKET_AMOUNT * 250 / 100;
        vm.startPrank(claimer);
        linkToken.approve(address(redPacket), claimAmount);
        redPacket.claimRedPacket(0);
        vm.stopPrank();

        // 预期事件
        vm.expectEmit(true, false, false, false);
        emit RedPacketClaimed(0, claimer, 0); // amount 是随机的，所以不检查

        fulfillRandomWords(0);
    }

    /*//////////////////////////////////////////////////////////////
                            HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function fulfillRandomWords(uint256 /* packetId */) internal {
        // 获取最新的 requestId（这里简化处理，假设 requestId 从 1 开始）
        uint256 requestId = 1;

        // 调用 VRF Coordinator 的 fulfillRandomWords（Mock 会自动生成随机数）
        vrfCoordinator.fulfillRandomWords(requestId, address(redPacket));
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function testGetRedPacketInfo() public {
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), RED_PACKET_AMOUNT);
        redPacket.createRedPacket(RED_PACKET_AMOUNT, address(linkToken), "Test Description");
        vm.stopPrank();

        RedPacket.RedPacketInfo memory info = redPacket.getRedPacketInfo(0);
        assertEq(info.owner, owner);
        assertEq(info.totalAmount, RED_PACKET_AMOUNT);
        assertEq(info.token, address(linkToken));
        assertEq(info.isActive, true);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTING
    //////////////////////////////////////////////////////////////*/

    function testFuzzCreateRedPacket(uint256 amount) public {
        // 限制金额范围：1 wei 到 STARTING_BALANCE
        amount = bound(amount, 1, STARTING_BALANCE);

        vm.startPrank(owner);
        linkToken.approve(address(redPacket), amount);
        redPacket.createRedPacket(amount, address(linkToken), "Test Description");
        vm.stopPrank();

        RedPacket.RedPacketInfo memory info = redPacket.getRedPacketInfo(0);
        assertEq(info.totalAmount, amount);
        assertEq(linkToken.balanceOf(address(redPacket)), amount);
    }

    function testFuzzClaimRedPacket(uint256 redPacketAmount) public {
        // 限制金额范围
        redPacketAmount = bound(redPacketAmount, 1 ether, 10 ether);

        // 创建红包
        vm.startPrank(owner);
        linkToken.approve(address(redPacket), redPacketAmount);
        redPacket.createRedPacket(redPacketAmount, address(linkToken), "Test Description");
        vm.stopPrank();

        // 领取红包
        uint256 claimAmount = redPacketAmount * 250 / 100;
        vm.startPrank(claimer);
        linkToken.approve(address(redPacket), claimAmount);
        redPacket.claimRedPacket(0);
        vm.stopPrank();

        // 验证
        RedPacket.RedPacketInfo memory info = redPacket.getRedPacketInfo(0);
        assertEq(info.claimer, claimer);
        assertEq(linkToken.balanceOf(address(redPacket)), redPacketAmount + claimAmount);
    }
}
