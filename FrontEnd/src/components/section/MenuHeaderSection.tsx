import Link from "next/link";
import { MenuHeaderSectionProps } from "../../../lib/types/props/MenuHeaderSectionProps";
import Header from "@/components/Header";
import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ProductDataTypes } from "../../../lib/types/ProductDataTypes";

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

  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);

  useEffect(() => {
    fetch("http://localhost:8081/ordering/getCustomerMenu")
      .then((response) => response.json())
      .then((data) => setMenuData(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  return (
    <>
      <Header text={text} type={"menu"} color={"tealGreen"}>
        <Link href={"/"} className="z-100">
          <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
            <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
          </button>
        </Link>
      </Header>
      <div className="h-min bg-tealGreen flex justify-center items-center py-4">
        <div className="w-full flex flex-wrap justify-center gap-x-5 gap-y-4">
          {categories
            .filter((category) => {
              // Filter active categories and check if they have menu items
              return (
                category.status === 1 &&
                menuData.some(
                  (menuItem) => menuItem.categoryName === category.categoryName
                )
              );
            })
            .map((category) => (
              <Link
                key={category.categoryID}
                href={`#${category.categoryName}`}
              >
                <div
                  className={`w-[90px] sm:w-36 md:w-24 xl:sm:w-36 h-[25px] py-3 rounded-sm border-lightTealGreen border-2 flex justify-center items-center shadow-xl hover:bg-[#30594f] duration-200 hover:scale-105 ${
                    category.categoryID === 4 ? "text-md" : "text-lg"
                  } font-pattaya text-white`}
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
