// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {
    VRFConsumerBaseV2Plus
} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {
    VRFV2PlusClient
} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract RedPacket is VRFConsumerBaseV2Plus {
    //errors
    error RedPacket_TotalAmountMustBeGreaterThanZero();
    error RedPacket_NotOwner();
    error RedPacket_AlreadyClaimed();
    error RedPacket_TransferFailed();

    /**
     * @dev Struct to store information about a red packet
     * @param owner The owner of the red packet
     * @param totalAmount The total amount of the red packet
     * @param totalParticipants The total number of participants in the red packet
     * @param remainingAmount The remaining amount of the red packet
     * @param isActive Whether the red packet is active
     */
    struct RedPacketInfo {
        string description;
        address owner;
        address claimer;
        uint256 totalAmount;
        uint256 claimedAmount;
        address token;
        bool isActive;
    }

    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint256 private packetId;
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    mapping(address => uint256) private participantRedPacketCount;
    mapping(uint256 => RedPacketInfo) private redPackets;
    //requestId to packetId
    mapping(uint256 => uint256) private redPacketRequestIds;
    mapping(address => uint256) private participantClaimedAmount;
    mapping(address => uint256) private participantSendAmount;

    //event to emit when a new red packet is created
    event RedPacketCreated(uint256 packetId, address indexed owner, uint256 indexed totalAmount, address indexed token);
    event RedPacketClaimed(uint256 packetId, address indexed sender, uint256 indexed amount);

    constructor(bytes32 keyHash, uint256 subscriptionId, uint32 callbackGasLimit, address vrfCoordinator)
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    //public
    /**
     * @notice Create a new red packet
     * @param _totalAmount The total amount of the red packet
     * @param _token The token of the red packet
     */
    function createRedPacket(uint256 _totalAmount, address _token, string memory _description) public {
        createRedPacket_(msg.sender, _totalAmount, _token, _description);
    }

    function claimRedPacket(uint256 _packetId) public {
        claimRedPacket_(msg.sender, _packetId);
    }

    //private
    /**
     * @notice Create a new red packet
     * @param _owner The owner of the red packet
     * @param _totalAmount The total amount of the red packet
     * @param _token The token of the red packet
     */
    function createRedPacket_(address _owner, uint256 _totalAmount, address _token, string memory _description) internal {
        require(_totalAmount > 0, RedPacket_TotalAmountMustBeGreaterThanZero());
        RedPacketInfo memory redPacketInfo = RedPacketInfo({
            description: _description,
            owner: _owner,
            claimer: address(0),
            totalAmount: _totalAmount,
            claimedAmount: 0,
            token: _token,
            isActive: true
        });
        redPackets[packetId] = redPacketInfo;
        participantSendAmount[_owner] = _totalAmount;
        emit RedPacketCreated(packetId, _owner, _totalAmount, _token);
        packetId = packetId + 1;

        bool success = IERC20(_token).transferFrom(_owner, address(this), _totalAmount);
        require(success, RedPacket_TransferFailed());
    }

    /**
     * @notice Claim a red packet
     * @param claimer The address of the claimer
     * @param _packetId The id of the red packet
     */
    function claimRedPacket_(address claimer, uint256 _packetId) internal {
        RedPacketInfo memory redPacketInfo = redPackets[_packetId];
        require(redPacketInfo.isActive, RedPacket_AlreadyClaimed());

        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest({
            keyHash: i_keyHash,
            subId: i_subscriptionId,
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: i_callbackGasLimit,
            numWords: NUM_WORDS,
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
        });
        uint256 requestId = s_vrfCoordinator.requestRandomWords(request);
        redPacketRequestIds[requestId] = _packetId;
        redPackets[_packetId].claimer = claimer;
        participantSendAmount[claimer] = redPackets[_packetId].totalAmount;

        uint256 max = redPackets[_packetId].totalAmount * 250 / 100;
        bool success =  IERC20(redPacketInfo.token).transferFrom(claimer, address(this), max);
        require(success, RedPacket_TransferFailed());
    }

    /**
     * @notice Fulfill the random words
     * @param requestId The id of the request
     * @param randomWords The random words
     * @dev This function is called by the VRFCoordinator when the random words are ready
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 _packetId = redPacketRequestIds[requestId];
        address claimer = redPackets[_packetId].claimer;
        address owner = redPackets[_packetId].owner;
        uint256 min = redPackets[_packetId].totalAmount * 30 / 100;
        uint256 max = redPackets[_packetId].totalAmount * 250 / 100;
        uint256 amount = min + randomWords[0] % (max - min);
        redPackets[_packetId].claimedAmount = amount;
        uint256 send_amount = redPackets[_packetId].totalAmount + max - amount;
        redPackets[_packetId].isActive = false;
        emit RedPacketClaimed(_packetId, claimer, amount);

        bool success_claim = IERC20(redPackets[_packetId].token).transfer(claimer, send_amount);
        bool success_return = IERC20(redPackets[_packetId].token).transfer(owner, amount);

        require(success_claim && success_return, RedPacket_TransferFailed());
    }

    //getters
    function getRedPacketInfo(uint256 _index) public view returns (RedPacketInfo memory) {
        return redPackets[_index];
    }

    function getRedPacketRequestIds(uint256 _requestId) public view returns (uint256) {
        return redPacketRequestIds[_requestId];
    }

    function getParticipantClaimedAmount(address _participant) public view returns (uint256) {
        return participantClaimedAmount[_participant];
    }

    function getParticipantSendAmount(address _participant) public view returns (uint256) {
        return participantSendAmount[_participant];
    }
}
