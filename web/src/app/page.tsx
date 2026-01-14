'use client'

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleButtonClick = () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    router.push('/profile');
  };

  return (
    <main
      className="flex min-h-screen flex-col p-8"
      style={{ backgroundImage: "url(/bg.png)", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <header className="flex justify-between items-center p-4 bg-red-500 rounded-2xl shadow-md mb-40">
        <div className="flex items-center rounded-full overflow-hidden">
          <Image src="/logo.png" alt="Logo" width={80} height={40} />
        </div>
        <ConnectButton />
      </header>

      {/* 主要内容 */}
      <div className="flex flex-col items-center justify-center text-center">
        <h1
          className="text-4xl font-DynaPuff md:text-6xl mb-16 mt-8 transition-all duration-500 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-transparent bg-clip-text animate-gradient"
          style={{ backgroundSize: '200% 200%' }}
        >
          Unwrap the mystery with every red envelope!
        </h1>

        <button
          onClick={handleButtonClick}
          className="bg-gray-800 text-white px-12 py-4 rounded-md text-xl font-medium relative overflow-hidden group"
        >
          <span className="relative z-10 font-DynaPuff">
            Start journey
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
        </button>
      </div>
    </main>
  );
}

