import { cva, VariantProps } from "class-variance-authority";
import { FC, ReactNode } from "react";

const headerStyles = cva("w-full h-[90px] flex justify-center items-center", {
  variants: {
    color: {
      tealGreen: "bg-[#59988D] text-white",
      cream: "bg-[#EDE9D8] text-black",
    },
    type: {
      home: "lg:text-5xl md:text-4xl text-3xl",
      order_summary: "text-3xl ",
      checkout: "text-3xl ",
      orders: "text-4xl ",
      payment_details: "text-3xl ",
      menu: "text-5xl ",
    },
  },
  defaultVariants: {
    color: "tealGreen",
  },
});

interface HeaderProps extends VariantProps<typeof headerStyles> {
  text: string;
  children?: ReactNode;
}

const Header: FC<HeaderProps> = ({ text, color, type, children }) => {
  const textContainerWidth = type === "home" ? "w-[190px] text-center" : "";
  const fontFamily = type === "menu" ? "font-pattaya" : "font-pattaya";

  return (
    <header className={headerStyles({ color })}>
      <div className="w-full grid grid-cols-[1fr_16fr]">
        <div className="flex items-center py-[20px] pl-9 z-100">
          <div className="rounded-full w-[40px] h-[40px] flex justify-center items-center z-10">
            {children}
          </div>
        </div>
        <div
          className={`ml-[-75px] flex items-center justify-center z-0 text-pretty ${fontFamily}`}
        >
          <div
            className={`${headerStyles({ type, color })} ${textContainerWidth}`}
          >
            <span className="drop-shadow-md">{text}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
