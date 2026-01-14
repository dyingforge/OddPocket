import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { RED_PACKET_ADDRESS, RED_PACKET_ABI } from '@/lib/contracts';
import { parseEther } from 'viem';

export function useRedPacketInfo(packetId: number) {
  return useReadContract({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    functionName: 'getRedPacketInfo',
    args: [BigInt(packetId)],
  });
}

export function useCreateRedPacket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createRedPacket = async (totalAmount: string, token: `0x${string}`) => {
    writeContract({
      address: RED_PACKET_ADDRESS,
      abi: RED_PACKET_ABI,
      functionName: 'createRedPacket',
      args: [totalAmount, token] as any,
    });
  };

  return {
    createRedPacket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useClaimRedPacket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimRedPacket = async (packetId: number) => {
    writeContract({
      address: RED_PACKET_ADDRESS,
      abi: RED_PACKET_ABI,
      functionName: 'claimRedPacket',
      args: [BigInt(packetId)],
    });
  };

  return {
    claimRedPacket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

