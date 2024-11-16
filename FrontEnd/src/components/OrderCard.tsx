import { useState, useEffect } from "react";
import { OrderCardProps } from "../../lib/types/props/OrderCardProps";
import { ProductDataTypes } from "../../lib/types/ProductDataTypes";
import QuantityModal from "@/components/QuantityModal";
import Link from "next/link";
import { FaTrashAlt } from "react-icons/fa";

const OrderCard: React.FC<OrderCardProps> = ({
  cart,
  setCart,
  order,
  setOrder,
  menuData,
  quantityModalIsVisible,
  setQuantityModalVisibility,
  subtotal,
  setSubtotal,
  type,
}) => {
  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (loggedInEmployeeID) {
        setLoggedInEmployeeID(parseInt(loggedInEmployeeID));
      }
    }
  }, [loggedInEmployeeID]);

  const [productToAdd, setProductToAdd] = useState<ProductDataTypes>({
    productID: 1,
    productName: "Matcha",
    categoryName: "Milk Tea",
    categoryID: 7,
    sellingPrice: 90.0,
    imageUrl: "/assets/images/MilkTea.jpg",
    status: 1,
    employeeID: loggedInEmployeeID,
  });

  // Update subtotal whenever cart or menuData changes
  useEffect(() => {
    const newSubtotal = cart.reduce((acc, item) => {
      const { productID, quantity } = item;
      const product = menuData.find((p) => p.productID === productID);
      return acc + (product?.sellingPrice || 0) * quantity;
    }, 0);

    setSubtotal(newSubtotal || 0);
  }, [cart, menuData, setSubtotal]);

  // Function to delete a product from the cart
  const handleDeleteProduct = (productID: number) => {
    // Check if setCart is defined
    if (setCart) {
      const updatedCart = cart.filter((item) => item.productID !== productID);
      setCart(updatedCart);

      // Update localStorage after deleting the product
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      console.error("setCart is undefined");
    }
  };

  return (
    <>
      <div
        className={`md:w-[620px] ${type === "summary" ? "lg:w-[745px]" : "lg:w-[620px]"} ${type === "summary" ? "h-min" : "lg:h-[200px]"}  lg: flex flex-col items-center rounded-lg bg-cream p-2 md:p-4`}
      >
        <div
          className={`w-[303.75px] md:w-[580px] ${type === "summary" ? "lg:w-[698px]" : "lg:w-[580px]"} md:h-12 rounded-md p-2 grid text-[13px] md:text-sm ${
            type === "summary" && cart.length > 0
              ? "grid-cols-[1fr_2fr_1fr_1fr]"
              : "grid-cols-[1fr_2fr_1fr]"
          } bg-[#59988D] `}
        >
          <div className="flex items-center justify-center ">
            <span className=" text-white font-semibold">Quantity</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-white font-semibold">Name</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-white font-semibold text-center">
              Product Total
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-black">
          {cart.map((item, index) => {
            const { productID, quantity } = item;
            const product = menuData.find((p) => p.productID === productID);

            return (
              <div key={index}>
                <div
                  className={`grid ${
                    type === "summary"
                      ? "grid-cols-[1fr_2fr_1fr_1fr]"
                      : "grid-cols-[1fr_2fr_1fr]"
                  } w-[303.75px] md:w-[580px] ${type === "summary" ? "lg:w-[698px]" : "lg:w-[580px]"} rounded-sm p-2 h-[50px]`}
                >
                  {type === "summary" ? (
                    <div className="flex items-center justify-center">
                      <button
                        className="w-[26.33px] h-[21.11px] border border-[#B2AB99] text-black text-sm bg-[#EDE9D8] hover:bg-gray-50 hover:text-gray-600"
                        onClick={() => {
                          if (product) {
                            setProductToAdd(product);
                            setQuantityModalVisibility(true);
                          } else {
                            console.warn(
                              "Product not found for ID:",
                              productID
                            );
                          }
                        }}
                      >
                        <span className="text-[11px]">{quantity}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-black text-sm flex items-center justify-center ">
                      <span className="text-[11px]">{quantity}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center text-sm italic text-[11px] overflow-hidden">
                    <span className="text-[12px]">
                      {product?.productName || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-[11px]">
                    <span className="text-[12px]">
                      &#8369;{" "}
                      {product ? product.sellingPrice * quantity : "N/A"}
                    </span>
                  </div>
                  {type === "summary" && (
                    <div className="flex justify-center items-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (product?.productID !== undefined) {
                            handleDeleteProduct(product.productID);
                          }
                        }}
                        className="text-black ml-4"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  )}

                  <QuantityModal
                    productToAdd={productToAdd}
                    quantityModalIsVisible={quantityModalIsVisible}
                    setQuantityModalVisibility={setQuantityModalVisibility}
                    previousQuantity={quantity}
                    type="edit"
                    // cartState={cart}
                    // setCartState={setCart}
                  />
                </div>
                {type === "summary" ? (
                  <div className="h-[1px] w-full bg-[#59988D] mt-[-6px]"></div>
                ) : null}
                {type !== "summary" && index < cart.length - 1 ? (
                  <div className="h-[1px] w-full bg-[#59988D]"></div>
                ) : null}
              </div>
            );
          })}
        </div>
        {type === "summary" ? (
          <div className="md:w-[580px] w-[303.75px] mt-[10px]">
            <Link href={"/"}>
              <div className=" text-black">
                <span className="text-[11px] font-bold underline">
                  Add more items
                </span>
              </div>
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default OrderCard;
