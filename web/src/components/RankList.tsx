import type React from "react"
import type { LeaderboardItem } from "@/types"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardProps {
  items: LeaderboardItem[]
}

const Leaderboard: React.FC<LeaderboardProps> = ({ items }) => {
  // Sort items by amount in descending order
  const sortedItems = [...items].sort((a, b) => b.amount - a.amount)

  const formatAmount = (amount: number) => {
    return (amount / 1e18).toFixed(4);
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {sortedItems.slice(0, 3).length > 0 && (
          <div className="flex justify-around mb-8">
            {/* Second Place */}
            {sortedItems.length > 1 && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2 border-2 border-gray-300">
                    <Medal size={24} className="text-gray-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center border border-gray-300">
                    <span className="text-xs font-bold">2</span>
                  </div>
                </div>
                <span className="text-sm font-medium mt-1 text-center" style={{ fontFamily: "DynaPuff, cursive" }}>
                  {sortedItems[1].name.length > 8 ? `${sortedItems[1].name.substring(0, 8)}...` : sortedItems[1].name}
                </span>
                <span className="text-xs text-red-600 font-bold">
                  {formatAmount(sortedItems[1].amount)} ETH
                </span>
              </div>
            )}

            {/* First Place */}
            {sortedItems.length > 0 && (
              <div className="flex flex-col items-center -mt-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-2 border-2 border-yellow-400 shadow-lg">
                    <Trophy size={32} className="text-yellow-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full w-7 h-7 flex items-center justify-center border border-yellow-500">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                </div>
                <span className="text-sm font-medium mt-1 text-center" style={{ fontFamily: "DynaPuff, cursive" }}>
                  {sortedItems[0].name.length > 8 ? `${sortedItems[0].name.substring(0, 8)}...` : sortedItems[0].name}
                </span>
                <span className="text-xs text-red-600 font-bold">
                  {formatAmount(sortedItems[0].amount)} ETH
                </span>
              </div>
            )}

            {/* Third Place */}
            {sortedItems.length > 2 && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-2 border-2 border-orange-300">
                    <Award size={24} className="text-orange-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-orange-200 rounded-full w-6 h-6 flex items-center justify-center border border-orange-300">
                    <span className="text-xs font-bold">3</span>
                  </div>
                </div>
                <span className="text-sm font-medium mt-1 text-center" style={{ fontFamily: "DynaPuff, cursive" }}>
                  {sortedItems[2].name.length > 8 ? `${sortedItems[2].name.substring(0, 8)}...` : sortedItems[2].name}
                </span>
                <span className="text-xs text-red-600 font-bold">
                  {formatAmount(sortedItems[2].amount)} ETH
                </span>
              </div>
            )}
          </div>
        )}

        {/* Rest of the leaderboard */}
        <div className="bg-red-50 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-red-100 py-2 px-3 border-b border-red-200 text-xs font-medium text-red-800">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Name</div>
            <div className="col-span-4 text-right">Amount</div>
          </div>

          <div className="divide-y divide-red-100 max-h-[300px] overflow-y-auto">
            {sortedItems.slice(3).map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 py-3 px-3 items-center hover:bg-red-50/50">
                <div className="col-span-2 text-center font-medium text-gray-500">{index + 4}</div>
                <div className="col-span-6 truncate" style={{ fontFamily: "DynaPuff, cursive" }}>
                  {item.name}
                </div>
                <div className="col-span-4 text-right font-medium text-red-600">
                  {formatAmount(item.amount)} ETH
                </div>
              </div>
            ))}

            {sortedItems.length <= 3 && (
              <div className="py-4 text-center text-gray-500 text-sm">No more entries to display</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard

