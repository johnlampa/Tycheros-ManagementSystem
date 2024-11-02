import Link from "next/link";
import { OrderDetailsSectionProps } from "../../../lib/types/props/OrderDetailsSectionProps";

const OrderDetailsSection: React.FC<OrderDetailsSectionProps> = ({
  orderID,
  date,
  subtotal,
}) => {
  return (
    <>
      <div className="flex flex-col w-[300px] mt-[20px]">
        <div className="flex justify-between">
          <span className="text-[15px] font-bold text-black">Subtotal:</span>
          <span className="text-[15px] text-black font-bold">
            &#8369; {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[15px] font-bold text-black">Order ID:</span>
          <span className="text-[15px] text-black">{orderID}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[15px] font-bold text-black">Date:</span>
          <span className="text-[15px] text-black">
            {date.substring(0, 10)}
          </span>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsSection;
