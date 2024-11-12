import Link from "next/link";
import { MenuHeaderSectionProps } from "../../../lib/types/props/MenuHeaderSectionProps";
import Header from "@/components/Header";
import { FaArrowLeft } from "react-icons/fa";

const MenuHeaderSection: React.FC<MenuHeaderSectionProps> = ({
  menuType,
  categories,
}) => {
  let text = "";
  if (menuType === "food") {
    text = "Food Menu";
  }
  if (menuType === "bar") {
    text = "Bar Menu";
  }

  return (
    <>
      <Header text={text} type={"menu"} color={"tealGreen"}>
        <Link href={"/"} className="z-100">
          <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
            <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
          </button>
        </Link>
      </Header>
      <div className="h-[100px] bg-tealGreen flex justify-center items-center">
        <div className="w-max grid grid-cols-3 md:grid-cols-5 gap-x-5 gap-y-4">
          {categories
            .filter((item) => item.status === 1)
            .map((category) => (
              <Link
                key={category.categoryID}
                href={`#${category.categoryName}`}
              >
                <div
                  className={`w-[90px] sm:w-36 md:w-24 xl:sm:w-36 h-[25px] py-3 rounded-sm border-lightTealGreen border-2 flex justify-center items-center shadow-xl hover:bg-[#30594f] duration-200 hover:scale-105 ${
                    category.categoryID === 4 ? "text-md" : "text-lg"
                  }  font-pattaya text-white`}
                >
                  {category.categoryName}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </>
  );
};

export default MenuHeaderSection;
