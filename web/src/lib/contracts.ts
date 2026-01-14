// Red Packet Contract Address - Update this after deployment
export const RED_PACKET_ADDRESS = "0x1f2cf075909149640419229f28e3215d65198357" as const;

// Red Packet Contract ABI
export const RED_PACKET_ABI = [
  {
    "inputs": [],
    "name": "createRedPacket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_packetId", "type": "uint256"}],
    "name": "claimRedPacket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_index", "type": "uint256"}],
    "name": "getRedPacketInfo",
    "outputs": [{
      "components": [
        {"name": "owner", "type": "address"},
        {"name": "claimer", "type": "address"},
        {"name": "totalAmount", "type": "uint256"},
        {"name": "claimedAmount", "type": "uint256"},
        {"name": "token", "type": "address"},
        {"name": "isActive", "type": "bool"}
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "packetId", "type": "uint256"},
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": true, "name": "totalAmount", "type": "uint256"},
      {"indexed": true, "name": "token", "type": "address"}
    ],
    "name": "RedPacketCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "packetId", "type": "uint256"},
      {"indexed": true, "name": "sender", "type": "address"},
      {"indexed": true, "name": "amount", "type": "uint256"}
    ],
    "name": "RedPacketClaimed",
    "type": "event"
  }
] as const;

