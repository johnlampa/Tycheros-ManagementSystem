import Link from "next/link";
import { OrderDetailsSectionProps } from "../../../lib/types/props/OrderDetailsSectionProps";

const OrderDetailsSection: React.FC<OrderDetailsSectionProps> = ({
  orderID,
  date,
  subtotal,
}) => {
  return (
    <>
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col w-[300px] lg:w-[200px] mt-[20px] lg:mt-0 gap-y-2 lg:gap-y-3">
          <div className="hidden lg:block text-base font-bold mb-4">
            Order details:
          </div>
          <div className="flex justify-between text-xs md:text-sm lg:text-base">
            <span className=" font-bold lg:font-normal text-black">
              Subtotal:
            </span>
            <span className=" text-black font-bold">
              &#8369; {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs md:text-sm lg:text-base">
            <span className=" font-bold lg:font-normal text-black">
              Order ID:
            </span>
            <span className=" text-black">{orderID}</span>
          </div>
          <div className="flex justify-between text-xs md:text-sm lg:text-base">
            <span className=" font-bold lg:font-normal text-black">Date:</span>
            <span className=" text-black">{date.substring(0, 10)}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsSection;
