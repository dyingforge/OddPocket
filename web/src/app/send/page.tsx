'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { Gift, Send } from 'lucide-react';
import { usePopup } from "@/context/PopupProvider";
import Leaderboard from "@/components/RankList";
import { 
  useWriteRedPacketCreateRedPacket,
  useReadRedPacketGetParticipantSendAmount,
  redPacketAddress,
} from "@/generated";
import { parseEther, erc20Abi } from 'viem';
import { useWriteContract, useReadContract, useBalance } from 'wagmi';

export default function SendRedEnvelope() {
  const { isConnected, address } = useAccount();
  const { showPopup } = usePopup();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("0.01");
  const [processing, setProcessing] = useState(false);
  
  // 使用 ref 追踪是否已处理成功事件
  const wrapSuccessHandled = useRef(false);
  const approveSuccessHandled = useRef(false);
  const createSuccessHandled = useRef(false);
  
  // 存储待执行的数据
  const pendingAmountRef = useRef<string>('');
  const pendingDescriptionRef = useRef<string>('');
  
  // Arbitrum Sepolia WETH 地址
  const WETH_ADDRESS = '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73' as const;
  
  // WETH ABI（只需要 deposit, approve, balanceOf）
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
  
  // 获取 ETH 余额
  const { data: ethBalance } = useBalance({
    address: address,
  });
  
  // 获取 WETH 余额
  const { data: wethBalance, refetch: refetchWethBalance } = useReadContract({
    address: WETH_ADDRESS,
    abi: wethAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  
  // 检查 WETH allowance
  const { data: wethAllowance, refetch: refetchAllowance } = useReadContract({
    address: WETH_ADDRESS,
    abi: wethAbi,
    functionName: 'allowance',
    args: address ? [address, redPacketAddress[421614]] : undefined,
  });
  
  // Wrap ETH to WETH
  const { writeContract: wrapEth, data: wrapHash } = useWriteContract();
  const { isLoading: isWrapping, isSuccess: isWrapSuccess } = useWaitForTransactionReceipt({ 
    hash: wrapHash,
  });
  
  // Approve WETH
  const { writeContract: approveWeth, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ 
    hash: approveHash,
  });
  
  // 创建红包
  const { writeContract: createRedPacket, data: createHash, isPending, error } = useWriteRedPacketCreateRedPacket();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: createHash,
  });
  
  // 获取用户发送总额
  const { data: userSendAmount } = useReadRedPacketGetParticipantSendAmount({
    args: address ? [address] : undefined,
  });

  // Mock leaderboard data - TODO: Replace with actual data from contract
  const [leaderboardData] = useState([
    { id: "1", name: "Alice", amount: 1000000000000000000 },
    { id: "2", name: "Bob", amount: 500000000000000000 },
  ]);

  const handleSend = async () => {
    if (!isConnected || !address) {
      showPopup(() => {}, () => {}, "Please connect your wallet first!", false);
      return;
    }

    if (!description.trim()) {
      showPopup(() => {}, () => {}, "Please enter a description", false);
      return;
    }

    if (parseFloat(amount) <= 0) {
      showPopup(() => {}, () => {}, "Please enter a valid amount", false);
      return;
    }

    const amountWei = parseEther(amount);
    
    // 检查 ETH 余额
    if (!ethBalance || ethBalance.value < amountWei) {
      showPopup(() => {}, () => {}, `Insufficient ETH balance. You need ${amount} ETH.`, false);
      return;
    }

    // 保存当前数据
    pendingAmountRef.current = amount;
    pendingDescriptionRef.current = description;

    // 刷新最新的 WETH 余额和 allowance
    await refetchWethBalance();
    const latestAllowance = await refetchAllowance();

    try {
      setProcessing(true);
      
      // 步骤 1: 检查 WETH 余额，如果不足则包装
      if (!wethBalance || wethBalance < amountWei) {
        const needToWrap = amountWei - (wethBalance || BigInt(0));
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
      console.log('currentAllowanceValue',currentAllowanceValue)
      console.log("latestAllowance.data",latestAllowance.data);
      console.log('wethAllowance',wethAllowance)
      if (!currentAllowanceValue || currentAllowanceValue < amountWei) {
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
      
      // 步骤 3: 创建红包
      console.log('Creating red packet...');
      createRedPacket({
        args: [amountWei, WETH_ADDRESS, description],
      });
    } catch (err) {
      console.error("Error in send process:", err);
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
          const amountWei = parseEther(pendingAmountRef.current);
          const latestAllowance = await refetchAllowance();
          const currentAllowanceValue = latestAllowance.data || wethAllowance;
          
          if (!currentAllowanceValue || currentAllowanceValue < amountWei) {
            console.log('Auto approving WETH after wrap...');
            const approveAmount = parseEther("1000");
            approveWeth({
              address: WETH_ADDRESS,
              abi: wethAbi,
              functionName: 'approve',
              args: [redPacketAddress[421614], approveAmount],
            });
          } else {
            console.log('Auto creating after wrap...');
            createRedPacket({
              args: [amountWei, WETH_ADDRESS, pendingDescriptionRef.current],
            });
          }
          wrapSuccessHandled.current = false;
        }, 1000);
      };
      
      continueFlow();
    }
  }, [isWrapSuccess]);

  // 监听 approve 成功，自动创建红包
  useEffect(() => {
    if (isApproveSuccess && !approveSuccessHandled.current) {
      approveSuccessHandled.current = true;
      
      const createPacket = async () => {
        await refetchAllowance();
        setTimeout(() => {
          console.log('Auto creating after approve...');
          const amountWei = parseEther(pendingAmountRef.current);
          createRedPacket({
            args: [amountWei, WETH_ADDRESS, pendingDescriptionRef.current],
          });
          approveSuccessHandled.current = false;
        }, 1000);
      };
      
      createPacket();
    }
  }, [isApproveSuccess]);

  // 监听创建成功
  useEffect(() => {
    if (isSuccess && !createSuccessHandled.current) {
      createSuccessHandled.current = true;
      setProcessing(false);
      showPopup(
        () => {
          createSuccessHandled.current = false;
          setDescription("");
          setAmount("0.01");
          pendingAmountRef.current = '';
          pendingDescriptionRef.current = '';
          refetchWethBalance();
          refetchAllowance();
        },
        () => {
          createSuccessHandled.current = false;
        },
        "✅ Blessing sent successfully! 🎉",
        false
      );
    }
  }, [isSuccess]);
  
  // 监听错误，重置状态
  useEffect(() => {
    if (error) {
      setProcessing(false);
    }
  }, [error]);

  return (
    <main
      className="flex min-h-screen flex-col bg-center"
      style={{ backgroundImage: "url(/bg.png)", backgroundSize: 'cover' }}
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
              href="/open"
              className="flex items-center gap-1 py-2 px-4 bg-white rounded-lg shadow-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors font-DynaPuff"
            >
              <Gift size={16} />
              <span className="hidden sm:inline">Claim</span>
            </Link>
          </div>
          
          {/* 显示用户发送总额 */}
          {userSendAmount !== undefined && (
            <div className="text-white bg-red-600/80 px-4 py-2 rounded-lg font-DynaPuff text-sm">
              Total Sent: {(Number(userSendAmount) / 1e18).toFixed(4)} ETH
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-100 p-4 border-b border-red-200">
              <h2 className="text-red-600 text-lg font-semibold flex items-center gap-2 font-DynaPuff">
                <Send size={20} /> Send Blessing
              </h2>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl text-red-600 mb-3 font-DynaPuff">
                  Begin to pray for blessing!
                </h3>
                <div className="relative w-40 h-40 mx-auto">
                  <Image src="/god.png" alt="Wealth God" fill className="object-contain" />
                </div>
              </div>

              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-DynaPuff">
                    Your Blessing Message
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Write your blessing message here..."
                    className="w-full px-4 py-3 rounded-lg border-2 border-red-200 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                    disabled={isPending || isConfirming}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-DynaPuff">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.01"
                    className="w-full px-4 py-3 rounded-lg border-2 border-red-200 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    disabled={processing}
                  />
                  <div className="mt-2 text-xs space-y-1">
                    <p className="text-gray-600">
                      💰 ETH Balance: {ethBalance ? (Number(ethBalance.value) / 1e18).toFixed(4) : '0'} ETH
                    </p>
                    <p className="text-blue-600">
                      🔄 WETH Balance: {wethBalance ? (Number(wethBalance) / 1e18).toFixed(4) : '0'} WETH
                    </p>
                  </div>
                </div>

                {/* 处理中提示 */}
                {processing && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                    Processing transaction...
                  </div>
                )}

                {/* 错误显示 */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    ❌ Error: {error.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-md text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-colors font-DynaPuff ${
                    processing ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {processing ? "⏳ Processing..." : "🎁 Send Blessing"}
                </button>
                
                <p className="text-xs text-center text-gray-500 mt-2">
                  💡 One-click process: Auto wrap + approve + create
                </p>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-100 p-4 border-b border-red-200">
              <h2 className="text-red-600 text-lg font-semibold flex items-center gap-2 font-DynaPuff">
                Leaderboard
              </h2>
            </div>
            <div className="p-6">
              <Leaderboard items={leaderboardData} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

