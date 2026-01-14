'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Gift, Send } from 'lucide-react';
import { usePopup } from "@/context/PopupProvider";
import Leaderboard from "@/components/RankList";
import RedPacketCard from "@/components/RedPacketCard";
import { 
  useWriteRedPacketClaimRedPacket,
  useReadRedPacketGetParticipantClaimedAmount,
  useWatchRedPacketRedPacketCreatedEvent,
  redPacketAddress,
} from "@/generated";
import { useAccount, useWaitForTransactionReceipt, usePublicClient, useBalance, useWriteContract, useReadContract } from 'wagmi';
import type { RedPacketInfo } from "@/types";
import { parseAbiItem, erc20Abi, parseEther } from 'viem';

export default function OpenRedEnvelope() {
  const { showPopup } = usePopup();
  const { address, isConnected } = useAccount();
  const [redPackets, setRedPackets] = useState<RedPacketInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const publicClient = usePublicClient();
  
  const wrapSuccessHandled = useRef(false);
  const approveSuccessHandled = useRef(false);
  const claimSuccessHandled = useRef(false);
  const pendingPacketIdRef = useRef<bigint | null>(null);
  const pendingMaxAmountRef = useRef<bigint>(BigInt(0));
  
  const WETH_ADDRESS = '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73' as const;
  
  const wethAbi = [
    {
      name: 'deposit',
      type: 'function',
      stateMutability: 'payable',
      inputs: [],
      outputs: [],
    },
    ...erc20Abi,
  ] as const;
  
  const { data: ethBalance } = useBalance({ address: address });
  
  const { data: wethBalance, refetch: refetchWethBalance } = useReadContract({
    address: WETH_ADDRESS,
    abi: wethAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  
  const { data: wethAllowance, refetch: refetchAllowance } = useReadContract({
    address: WETH_ADDRESS,
    abi: wethAbi,
    functionName: 'allowance',
    args: address ? [address, redPacketAddress[421614]] : undefined,
  });
  
  const { writeContract: wrapEth, data: wrapHash } = useWriteContract();
  const { isLoading: isWrapping, isSuccess: isWrapSuccess } = useWaitForTransactionReceipt({ hash: wrapHash });
  
  const { writeContract: approveWeth, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  
  // 领取红包
  const { writeContract: claimRedPacket, data: claimHash, isPending, error } = useWriteRedPacketClaimRedPacket();
  const { isLoading: isConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });
  
  // 获取用户领取总额
  const { data: userClaimedAmount } = useReadRedPacketGetParticipantClaimedAmount({
    args: address ? [address] : undefined,
  });

  // Mock leaderboard data - 可以后续通过监听事件来填充
  const [leaderboardData] = useState([
    { id: "1", name: "Alice", amount: 1000000000000000000 },
    { id: "2", name: "Bob", amount: 500000000000000000 },
  ]);

  // 监听新创建的红包事件
  useWatchRedPacketRedPacketCreatedEvent({
    onLogs(logs) {
      console.log('New red packet created!', logs);
      // 刷新红包列表
      fetchRedPackets();
    },
  });

  // 获取红包列表（通过事件查询）
  const fetchRedPackets = async () => {
    if (!publicClient) return;
    
    setIsLoading(true);
    try {
      // 1. 通过事件获取所有创建的红包
      const logs = await publicClient.getLogs({
        address: redPacketAddress[421614],
        event: parseAbiItem('event RedPacketCreated(uint256 packetId, address indexed owner, uint256 indexed totalAmount, address indexed token)'),
        fromBlock: BigInt(0),
        toBlock: 'latest'
      });

      console.log('Found red packet events:', logs.length);

      // 2. 获取每个红包的详细信息
      const packets: RedPacketInfo[] = [];
      for (const log of logs) {
        const packetId = log.args.packetId as bigint | undefined;
        if (!packetId) continue;
        
        try {
          // 查询红包信息
          const packetInfo = await publicClient.readContract({
            address: redPacketAddress[421614],
            abi: [{
              name: 'getRedPacketInfo',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ name: '_index', type: 'uint256' }],
              outputs: [{
                type: 'tuple',
                components: [
                  { name: 'description', type: 'string' },
                  { name: 'owner', type: 'address' },
                  { name: 'claimer', type: 'address' },
                  { name: 'totalAmount', type: 'uint256' },
                  { name: 'claimedAmount', type: 'uint256' },
                  { name: 'token', type: 'address' },
                  { name: 'isActive', type: 'bool' }
                ]
              }]
            }],
            functionName: 'getRedPacketInfo',
            args: [packetId]
          }) as any;

          // 只显示仍然活跃的红包
          if (packetInfo.isActive) {
            packets.push({
              id: packetId?.toString() || '0',
              description: packetInfo.description || '',
              owner: packetInfo.owner,
              claimer: packetInfo.claimer,
              totalAmount: BigInt(packetInfo.totalAmount?.toString() || '0'),
              claimedAmount: BigInt(packetInfo.claimedAmount?.toString() || '0'),
              token: packetInfo.token,
              isActive: packetInfo.isActive,
              timestamp: BigInt(0)
            });
          }
        } catch (err) {
          console.error(`Error fetching packet ${packetId}:`, err);
        }
      }

      console.log('Active red packets:', packets);
      setRedPackets(packets);
    } catch (error) {
      console.error('Error fetching red packets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载红包列表
  useEffect(() => {
    if (isConnected && publicClient) {
      fetchRedPackets();
    }
  }, [isConnected, publicClient]);

  const handleOpen = async (index: number) => {
    if (!address || !isConnected) {
      showPopup(() => {}, () => {}, "Please connect your wallet first!", false);
      return;
    }

    const packet = redPackets[index];
    if (!packet || !packet.isActive) {
      showPopup(() => {}, () => {}, "This red packet has been claimed!", false);
      return;
    }

    // 计算最大金额 (250% of totalAmount)
    const maxAmount = (packet.totalAmount * BigInt(250)) / BigInt(100);
    
    // 检查 ETH 余额
    if (!ethBalance || ethBalance.value < maxAmount) {
      showPopup(
        () => {},
        () => {},
        `Insufficient ETH balance. You need ${(Number(maxAmount) / 1e18).toFixed(4)} ETH (250% of ${(Number(packet.totalAmount) / 1e18).toFixed(4)} ETH) to claim this red packet.`,
        false
      );
      return;
    }

    // 保存待处理的红包信息
    pendingPacketIdRef.current = BigInt(packet.id);
    pendingMaxAmountRef.current = maxAmount;

    await refetchWethBalance();
    const latestAllowance = await refetchAllowance();

    try {
      setProcessing(true);
      
      // 步骤 1: 检查 WETH 余额，如果不足则包装
      if (!wethBalance || wethBalance < maxAmount) {
        const needToWrap = maxAmount - (wethBalance || BigInt(0));
        console.log(`Wrapping ${(Number(needToWrap) / 1e18).toFixed(4)} ETH to WETH...`);
        wrapEth({
          address: WETH_ADDRESS,
          abi: wethAbi,
          functionName: 'deposit',
          value: needToWrap,
        });
        return;
      }
      
      // 步骤 2: 检查 allowance，如果不足则 approve
      const currentAllowanceValue = latestAllowance.data || wethAllowance;
      if (!currentAllowanceValue || currentAllowanceValue < maxAmount) {
        console.log('Approving WETH...');
        const approveAmount = parseEther("1000");
        approveWeth({
          address: WETH_ADDRESS,
          abi: wethAbi,
          functionName: 'approve',
          args: [redPacketAddress[421614], approveAmount],
        });
        return;
      }
      
      // 步骤 3: 领取红包
      console.log('Claiming red packet...');
      claimRedPacket({
        args: [BigInt(packet.id)],
      });
      console.log('dddd',packet.id)
    } catch (err) {
      console.error("Error in claim process:", err);
      setProcessing(false);
    }
  };

  // 监听 wrap 成功，自动进入下一步
  useEffect(() => {
    if (isWrapSuccess && !wrapSuccessHandled.current) {
      wrapSuccessHandled.current = true;
      
      const continueFlow = async () => {
        await refetchWethBalance();
        setTimeout(async () => {
          const maxAmount = pendingMaxAmountRef.current;
          const latestAllowance = await refetchAllowance();
          const currentAllowanceValue = latestAllowance.data || wethAllowance;
          
          if (!currentAllowanceValue || currentAllowanceValue < maxAmount) {
            const approveAmount = parseEther("1000");
            approveWeth({
              address: WETH_ADDRESS,
              abi: wethAbi,
              functionName: 'approve',
              args: [redPacketAddress[421614], approveAmount],
            });
          } else {
            console.log('Auto claiming after wrap...');
            claimRedPacket({
              args: [pendingPacketIdRef.current!],
            });
          }
          wrapSuccessHandled.current = false;
        }, 1000);
      };
      
      continueFlow();
    }
  }, [isWrapSuccess]);

  // 监听 approve 成功，自动领取红包
  useEffect(() => {
    if (isApproveSuccess && !approveSuccessHandled.current) {
      approveSuccessHandled.current = true;
      
      const claimPacket = async () => {
        await refetchAllowance();
        setTimeout(() => {
          console.log('Auto claiming after approve...');
          claimRedPacket({
            args: [pendingPacketIdRef.current!],
          });
          approveSuccessHandled.current = false;
        }, 1000);
      };
      
      claimPacket();
    }
  }, [isApproveSuccess]);

  // 监听领取成功
  useEffect(() => {
    if (isClaimSuccess && !claimSuccessHandled.current) {
      claimSuccessHandled.current = true;
      setProcessing(false);
      showPopup(
        () => {
          claimSuccessHandled.current = false;
          pendingPacketIdRef.current = null;
          pendingMaxAmountRef.current = BigInt(0);
          fetchRedPackets();
          refetchWethBalance();
          refetchAllowance();
        },
        () => {
          claimSuccessHandled.current = false;
        },
        "✅ Blessing claimed successfully! 🎉",
        false
      );
    }
  }, [isClaimSuccess]);
  
  // 监听错误，重置状态
  useEffect(() => {
    if (error) {
      setProcessing(false);
    }
  }, [error]);

  return (
    <main
      className="flex min-h-screen flex-col bg-cover bg-center"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      <header className="sticky top-0 z-10 bg-red-500/95 backdrop-blur-sm shadow-lg p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={80} height={40} />
            <h1 className="text-white text-xl font-bold hidden sm:block font-DynaPuff">
              WealthGod
            </h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <Link
              href="/send"
              className="flex items-center gap-1 py-2 px-4 bg-white rounded-lg shadow-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors font-DynaPuff"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </Link>
          </div>
          
          {/* 显示用户领取总额 */}
          {userClaimedAmount !== undefined && (
            <div className="text-white bg-green-600/80 px-4 py-2 rounded-lg font-DynaPuff text-sm">
              Total Claimed: {(Number(userClaimedAmount) / 1e18).toFixed(4)} ETH
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-100 p-4 border-b border-red-200">
              <h2 className="text-red-600 text-lg font-semibold flex items-center gap-2 font-DynaPuff">
                <Gift size={20} /> Available Blessings
              </h2>
            </div>

            <div className="p-4">
              {/* 处理中提示 */}
              {processing && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                  Processing transaction...
                </div>
              )}
              
              {/* 错误显示 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  ❌ Error: {error.message}
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : redPackets.length > 0 ? (
                <RedPacketCard items={redPackets} handleOpen={handleOpen} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Gift size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No blessings available</p>
                  <p className="text-sm">Be the first to send a blessing!</p>
                  <Link
                    href="/send"
                    className="mt-6 inline-flex items-center gap-2 py-2 px-4 bg-red-100 rounded-lg text-red-600 hover:bg-red-200 transition-colors font-DynaPuff"
                  >
                    <Send size={16} />
                    <span>Send a Blessing</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-100 p-4 border-b border-red-200">
              <h2 className="text-red-600 text-lg font-semibold flex items-center gap-2 font-DynaPuff">
                Claim Leaderboard
              </h2>
            </div>
            <div className="p-4">
              <Leaderboard items={leaderboardData} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

