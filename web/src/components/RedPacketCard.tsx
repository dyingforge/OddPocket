import Image from "next/image";
import { RedPacketInfo } from "@/types";

interface RedPacketCardProps {
  items: RedPacketInfo[];
  handleOpen?: (index: number) => void;
}

const RedPacketCard: React.FC<RedPacketCardProps> = ({ items, handleOpen = () => {} }) => {
  
  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1e18).toFixed(4);
  }

  return (
    <div className="flex flex-wrap gap-5">
      {items.map((item, index) => (
        <div
          key={index}
          className="text-center bg-white rounded-lg p-1 mb-4 cursor-pointer flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
          onClick={() => handleOpen(index)}
        >
          {!item.isActive ? (
            <div>
              <Image
                src="/opened.png" 
                alt="opened" 
                width={80}
                height={80}
              />
              <h2 className="text-[8px] font-DynaPuff text-green-600">
                Claimed: {formatAmount(item.claimedAmount)} ETH
              </h2>
              <h2 className="text-[10px] font-DynaPuff text-gray-600">
                Total: {formatAmount(item.totalAmount)} ETH
              </h2>
            </div>
          ) : (
            <Image src="/god.png" alt="红包" width={80} height={60} />
          )}
          <h1 className="mt-2 text-[8px] font-DynaPuff text-red-600">
            {item.description || "Mystery Blessing"}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default RedPacketCard;

