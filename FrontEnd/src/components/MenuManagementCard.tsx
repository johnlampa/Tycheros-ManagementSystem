import Image from "next/image";
import React, { useState } from "react";
import ProductModal from "@/components/ProductModal";

import type { ProductDataTypes } from "../../lib/types/ProductDataTypes";
import type { InventoryDataTypes } from "../../lib/types/InventoryDataTypes";
import { MenuManagementCardProps } from "../../lib/types/props/MenuManagementCardProps";

const MenuManagementCard: React.FC<MenuManagementCardProps> = ({
  menuData,
  setMenuData,
  categoryName,
  menuProductHolder,
  setMenuProductHolder,
  inventoryData,
  setInventoryData,
}) => {
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [productModalIsVisible, setProductModalVisibility] = useState(false);
  const [menuProductToEdit, setMenuProductToEdit] =
    useState<ProductDataTypes>();

  const toggleEdit = (productID?: number) => {
    if (productID === undefined) {
      console.error("Product ID is undefined");
      return; // Early return or handle the case where productID is undefined
    }

    setModalType("edit");
    setModalTitle("Edit Product");

    setProductModalVisibility(!productModalIsVisible);

    const menuProduct = menuData.find(
      (product) => product.productID === productID
    );
    setMenuProductToEdit(menuProduct);
  };

  const toggleAdd = () => {
    setModalType("add");
    setModalTitle("Add Product");
    setProductModalVisibility(true);
  };

  return (
    <>
      <div className="rounded-md p-4 bg-cream w-[310px]">
        <div className="grid grid-cols-[3fr_2fr_2fr] gap-2 text-base font-semibold mb-3">
          <p className="justify-normal items-center text-black">Name</p>
          <p className="flex ml-auto text-black">Price</p>
          <p></p>
        </div>
        {menuData
          .filter((item) => item.categoryName === categoryName)
          .map((item) => (
            <div
              key={item.productID}
              className="grid grid-cols-[3fr_2fr_2fr] gap-2 mb-3"
            >
              <p className="my-auto text-black truncate text-sm">
                {item.productName}
              </p>
              <p className="flex ml-auto items-center text-black text-sm">
                &#8369; {item.sellingPrice}
              </p>
              <div className="ml-3">
                <button
                  onClick={() => toggleEdit(item.productID)}
                  className="w-min px-4 py-1 rounded-full text-black text-sm bg-cream border-2 border-lightTealGreen hover:text-black hover:bg-lightTealGreen"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        <div className="flex justify-center items-center">
          <button
            className="mt-3 px-3 py-1 rounded-md w-full text-black text-sm bg-lightTealGreen hover:bg-gray-50 hover:bg-lightTealGreen"
            onClick={toggleAdd}
          >
            Add Product
          </button>
        </div>
      </div>
      {productModalIsVisible && (
        <ProductModal
          productModalIsVisible={productModalIsVisible}
          setProductModalVisibility={setProductModalVisibility}
          modalTitle={modalTitle}
          setMenuProductHolder={setMenuProductHolder}
          inventoryData={inventoryData}
          menuProductToEdit={menuProductToEdit}
          type={modalType}
          categoryName={categoryName}
          menuData={menuData}
          setMenuData={setMenuData}
        ></ProductModal>
      )}
    </>
  );
};

export default MenuManagementCard;
