"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { useAccount, usePublicClient } from 'wagmi'
import Image from "next/image"
import RedPacketCard from "@/components/RedPacketCard"
import { Coins, Gift, Send, User } from "lucide-react"
import type { RedPacketInfo } from "@/types"
import { 
  useReadRedPacketGetParticipantClaimedAmount,
  useReadRedPacketGetParticipantSendAmount,
  useReadRedPacketGetUserRedPackets,
  redPacketAddress,
} from "@/generated";

interface DisplayProfile {
  name: string;
  claimAmount: number;
  sendAmount: number;
}

export default function Profile() {
  const router = useRouter();
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(true)
  const [myRedPackets, setMyRedPackets] = useState<RedPacketInfo[]>([])
  
  // 从合约读取用户数据
  const { data: userClaimedAmount } = useReadRedPacketGetParticipantClaimedAmount({
    args: address ? [address] : undefined,
  });
  
  const { data: userSendAmount } = useReadRedPacketGetParticipantSendAmount({
    args: address ? [address] : undefined,
  });
  
  // 获取用户创建的红包 ID 列表
  const { data: userRedPacketIds } = useReadRedPacketGetUserRedPackets({
    args: address ? [address] : undefined,
  });
  
  // 显示的用户资料
  const [displayProfile, setDisplayProfile] = useState<DisplayProfile>({
    name: "WealthWarrior",
    claimAmount: 0,
    sendAmount: 0,
  })

  // 获取用户创建的红包详情
  const fetchUserRedPackets = async () => {
    if (!publicClient || !userRedPacketIds || userRedPacketIds.length === 0) {
      setMyRedPackets([]);
      return;
    }

    try {
      const packets: RedPacketInfo[] = [];
      
      for (const packetId of userRedPacketIds) {
        try {
          const packetInfo = await publicClient.readContract({
            address: redPacketAddress[421614],
            abi: [
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
              }
            ],
            functionName: 'getRedPacketInfo',
            args: [packetId],
          }) as any;

          if (packetInfo.owner !== '0x0000000000000000000000000000000000000000') {
            packets.push({
              id: packetId.toString(),
              description: packetInfo.description,
              owner: packetInfo.owner,
              claimer: packetInfo.claimer,
              totalAmount: packetInfo.totalAmount,
              claimedAmount: packetInfo.claimedAmount,
              token: packetInfo.token,
              isActive: packetInfo.isActive,
              timestamp: BigInt(0),
            });
          }
        } catch (err) {
          console.error(`Failed to fetch packet ${packetId}:`, err);
        }
      }
      
      console.log('Fetched user red packets:', packets);
      setMyRedPackets(packets);
    } catch (error) {
      console.error('Error fetching user red packets:', error);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    
    // 更新用户数据
    if (userClaimedAmount !== undefined && userSendAmount !== undefined) {
      setDisplayProfile(prev => ({
        ...prev,
        claimAmount: Number(userClaimedAmount) / 1e18,
        sendAmount: Number(userSendAmount) / 1e18,
      }));
    }
    
    // 模拟加载延迟
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [isConnected, router, userClaimedAmount, userSendAmount])

  // 获取用户红包列表
  useEffect(() => {
    if (isConnected && publicClient && userRedPacketIds !== undefined) {
      fetchUserRedPackets();
    }
  }, [isConnected, publicClient, userRedPacketIds])

  return (
    <main
      className="flex min-h-screen flex-col bg-center"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-red-500/95 backdrop-blur-sm shadow-lg p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full overflow-hidden">
              <Image src="/logo.png" alt="Logo" width={80} height={40} />
            </div>
            <h1 className="text-white text-xl font-bold hidden sm:block font-DynaPuff">
              WealthGod
            </h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : isConnected ? (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 font-DynaPuff">
                Welcome to Your WealthGod!
              </h2>
              <p className="text-red-100">Manage your wealth and share prosperity</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-red-100 p-4 border-b border-red-200">
                <h3 className="text-red-600 text-lg font-semibold flex items-center gap-2 font-DynaPuff">
                  <User size={20} /> Profile Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-red-400 text-sm mb-1">Address</span>
                    <span className="text-red-600 text-sm font-bold font-mono break-all text-center">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                    </span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-green-400 text-sm mb-1 flex items-center gap-1">
                      <Gift size={14} /> Total Claimed
                    </span>
                    <span className="text-green-600 text-xl font-bold font-DynaPuff">
                      {displayProfile.claimAmount.toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-red-400 text-sm mb-1 flex items-center gap-1">
                      <Send size={14} /> Total Sent
                    </span>
                    <span className="text-red-600 text-xl font-bold font-DynaPuff">
                      {displayProfile.sendAmount.toFixed(4)} ETH
                    </span>
                  </div>
                </div>
                
                {/* 利润统计 */}
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="text-center">
                    <span className="text-purple-600 text-sm font-medium">Net Profit/Loss</span>
                    <div className={`text-2xl font-bold font-DynaPuff mt-1 ${
                      displayProfile.claimAmount - displayProfile.sendAmount >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {displayProfile.claimAmount - displayProfile.sendAmount >= 0 ? '+' : ''}
                      {(displayProfile.claimAmount - displayProfile.sendAmount).toFixed(4)} ETH
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Red Packets */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-red-100 p-4 border-b border-red-200">
                <h3 className="text-red-600 text-lg font-semibold flex items-center gap-2 font-DynaPuff">
                  <Coins size={20} /> Your Red Packets
                </h3>
              </div>
              <div className="p-4">
                {myRedPackets.length > 0 ? (
                  <div className="border-2 border-red-500 rounded-lg p-4">
                    <RedPacketCard items={myRedPackets} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven&apos;t created any red packets yet.</p>
                    <p className="mt-2">Send or claim some to get started!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/open"
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg text-white font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 font-DynaPuff"
              >
                <Gift size={20} />
                <span>Claim</span>
              </Link>
              <Link
                href="/send"
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg text-white font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 font-DynaPuff"
              >
                <Send size={20} />
                <span>Send</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4 font-DynaPuff">
              Please Connect Your Wallet
            </h2>
          </div>
        )}
      </div>
    </main>
  )
}
