import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RedPacket
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const redPacketAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'keyHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'subscriptionId', internalType: 'uint256', type: 'uint256' },
      { name: 'callbackGasLimit', internalType: 'uint32', type: 'uint32' },
      { name: 'vrfCoordinator', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packetId', internalType: 'uint256', type: 'uint256' }],
    name: 'claimRedPacket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_totalAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_description', internalType: 'string', type: 'string' },
    ],
    name: 'createRedPacket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_participant', internalType: 'address', type: 'address' },
    ],
    name: 'getParticipantClaimedAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_participant', internalType: 'address', type: 'address' },
    ],
    name: 'getParticipantSendAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_index', internalType: 'uint256', type: 'uint256' }],
    name: 'getRedPacketInfo',
    outputs: [
      {
        name: '',
        internalType: 'struct RedPacket.RedPacketInfo',
        type: 'tuple',
        components: [
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'owner', internalType: 'address', type: 'address' },
          { name: 'claimer', internalType: 'address', type: 'address' },
          { name: 'totalAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'claimedAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'isActive', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_requestId', internalType: 'uint256', type: 'uint256' }],
    name: 'getRedPacketRequestIds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_participant', internalType: 'address', type: 'address' },
    ],
    name: 'getUserRedPackets',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requestId', internalType: 'uint256', type: 'uint256' },
      { name: 'randomWords', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'rawFulfillRandomWords',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_vrfCoordinator',
    outputs: [
      {
        name: '',
        internalType: 'contract IVRFCoordinatorV2Plus',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_vrfCoordinator', internalType: 'address', type: 'address' },
    ],
    name: 'setCoordinator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'vrfCoordinator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CoordinatorSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packetId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'RedPacketClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packetId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'totalAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RedPacketCreated',
  },
  {
    type: 'error',
    inputs: [
      { name: 'have', internalType: 'address', type: 'address' },
      { name: 'want', internalType: 'address', type: 'address' },
    ],
    name: 'OnlyCoordinatorCanFulfill',
  },
  {
    type: 'error',
    inputs: [
      { name: 'have', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'coordinator', internalType: 'address', type: 'address' },
    ],
    name: 'OnlyOwnerOrCoordinator',
  },
  { type: 'error', inputs: [], name: 'RedPacket_AlreadyClaimed' },
  { type: 'error', inputs: [], name: 'RedPacket_NotOwner' },
  { type: 'error', inputs: [], name: 'RedPacket_PacketNotExist' },
  {
    type: 'error',
    inputs: [],
    name: 'RedPacket_TotalAmountMustBeGreaterThanZero',
  },
  { type: 'error', inputs: [], name: 'RedPacket_TransferFailed' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
] as const

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const redPacketAddress = {
  421614: '0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55',
} as const

/**
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const redPacketConfig = {
  address: redPacketAddress,
  abi: redPacketAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link redPacketAbi}__
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useReadRedPacket = /*#__PURE__*/ createUseReadContract({
  abi: redPacketAbi,
  address: redPacketAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"getParticipantClaimedAmount"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useReadRedPacketGetParticipantClaimedAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'getParticipantClaimedAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"getParticipantSendAmount"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useReadRedPacketGetParticipantSendAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'getParticipantSendAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"getRedPacketInfo"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useReadRedPacketGetRedPacketInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'getRedPacketInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"getRedPacketRequestIds"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useReadRedPacketGetRedPacketRequestIds =
  /*#__PURE__*/ createUseReadContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'getRedPacketRequestIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"getUserRedPackets"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useReadRedPacketGetUserRedPackets =
  /*#__PURE__*/ createUseReadContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'getUserRedPackets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useReadRedPacketOwner = /*#__PURE__*/ createUseReadContract({
  abi: redPacketAbi,
  address: redPacketAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"s_vrfCoordinator"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useReadRedPacketSVrfCoordinator =
  /*#__PURE__*/ createUseReadContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 's_vrfCoordinator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link redPacketAbi}__
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWriteRedPacket = /*#__PURE__*/ createUseWriteContract({
  abi: redPacketAbi,
  address: redPacketAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWriteRedPacketAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"claimRedPacket"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWriteRedPacketClaimRedPacket =
  /*#__PURE__*/ createUseWriteContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'claimRedPacket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"createRedPacket"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWriteRedPacketCreateRedPacket =
  /*#__PURE__*/ createUseWriteContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'createRedPacket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"rawFulfillRandomWords"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWriteRedPacketRawFulfillRandomWords =
  /*#__PURE__*/ createUseWriteContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'rawFulfillRandomWords',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"setCoordinator"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWriteRedPacketSetCoordinator =
  /*#__PURE__*/ createUseWriteContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'setCoordinator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWriteRedPacketTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link redPacketAbi}__
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useSimulateRedPacket = /*#__PURE__*/ createUseSimulateContract({
  abi: redPacketAbi,
  address: redPacketAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useSimulateRedPacketAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"claimRedPacket"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useSimulateRedPacketClaimRedPacket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'claimRedPacket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"createRedPacket"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useSimulateRedPacketCreateRedPacket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'createRedPacket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"rawFulfillRandomWords"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useSimulateRedPacketRawFulfillRandomWords =
  /*#__PURE__*/ createUseSimulateContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'rawFulfillRandomWords',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"setCoordinator"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useSimulateRedPacketSetCoordinator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'setCoordinator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link redPacketAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useSimulateRedPacketTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: redPacketAbi,
    address: redPacketAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link redPacketAbi}__
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWatchRedPacketEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: redPacketAbi, address: redPacketAddress },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link redPacketAbi}__ and `eventName` set to `"CoordinatorSet"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWatchRedPacketCoordinatorSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: redPacketAbi,
    address: redPacketAddress,
    eventName: 'CoordinatorSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link redPacketAbi}__ and `eventName` set to `"OwnershipTransferRequested"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWatchRedPacketOwnershipTransferRequestedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: redPacketAbi,
    address: redPacketAddress,
    eventName: 'OwnershipTransferRequested',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link redPacketAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWatchRedPacketOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: redPacketAbi,
    address: redPacketAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link redPacketAbi}__ and `eventName` set to `"RedPacketClaimed"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWatchRedPacketRedPacketClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: redPacketAbi,
    address: redPacketAddress,
    eventName: 'RedPacketClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link redPacketAbi}__ and `eventName` set to `"RedPacketCreated"`
 *
 * [__View Contract on Arbitrum Sepolia Arbiscan__](https://sepolia.arbiscan.io/address/0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55)
 */
export const useWatchRedPacketRedPacketCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: redPacketAbi,
    address: redPacketAddress,
    eventName: 'RedPacketCreated',
  })
