import Link from "next/link";
import { OrderButtonSectionProps } from "../../../lib/types/props/OrderButtonSectionProps";

const OrderButtonSection: React.FC<OrderButtonSectionProps> = ({
  subtotal,
  handleClick,
}) => {
  return (
    <>
      <div className="w-full h-[105px] mt-[50px] p-5 rounded-xl bg-cream drop-shadow-[0_-5px_3px_rgba(0,0,0,0.15)] drop flex justify-center items-center">
        <div className="w-full lg:w-[698px] lg:flex gap-5">
          <div className="w-full flex justify-between items-center mb-2 lg:mb-0">
            <div>
              <span className="font-bold text-[14px] text-black lg:text-lg">
                Subtotal
              </span>
              <span className="text-[10px] lg:text-base ml-[3px] text-primaryBrown">
                (incl. tax)
              </span>
            </div>
            <div className="font-bold text-[14px] text-black lg:text-lg">
              &#8369; {subtotal.toFixed(2)}
            </div>
          </div>
          <Link href={subtotal === 0 ? "#" : "/checkout"}>
            <button
              className={` w-full lg:w-[380px] h-[39px] bg-tealGreen rounded-md ${subtotal === 0 ? "disabled" : ""}`}
              onClick={handleClick}
            >
              <span className="font-pattaya text-[20px] text-white">
                Place Order
              </span>
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default OrderButtonSection;
