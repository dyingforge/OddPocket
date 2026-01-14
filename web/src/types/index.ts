export interface RedPacketInfo {
  id: string;
  description: string;
  owner: string;
  claimer: string;
  totalAmount: bigint;
  claimedAmount: bigint;
  token: string;
  isActive: boolean;
  timestamp: bigint;
}

export interface LeaderboardItem {
  id: string;
  name: string;
  amount: number;
}

export interface UserProfile {
  id: string;
  address: string;
  name: string;
  sendAmount: number;
  claimAmount: number;
  createdAt: bigint;
}

