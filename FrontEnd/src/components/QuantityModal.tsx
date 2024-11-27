"use client"; // Ensures this is a client component

import { useState, useEffect } from "react";
import { QuantityModalProps } from "../../lib/types/props/QuantityModalProps";
import Modal from "@/components/ui/Modal";
import { OrderItemDataTypes } from "../../lib/types/OrderDataTypes";
import { usePathname } from "next/navigation";
import { SubitemDataTypes } from "../../lib/types/ProductDataTypes";
import { InventoryItem } from "../../lib/types/InventoryItemDataTypes";
import axios from "axios";
import Notification from "./Notification";

const QuantityModal: React.FC<QuantityModalProps> = ({
  productToAdd,
  quantityModalIsVisible,
  setQuantityModalVisibility,
  type,
}) => {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [subitems, setSubitems] = useState<SubitemDataTypes[]>([]);
  const [cart, setCart] = useState<OrderItemDataTypes[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState<number>(Infinity);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [correctType, setCorrectType] = useState(type);

  useEffect(() => {
    console.log("productToAdd: ", productToAdd);
  }, []);

  // Fetch subitems for the given product
  useEffect(() => {
    axios
      .get(
        `http://localhost:8081/menuManagement/getSpecificSubitems/${productToAdd.productID}`
      )
      .then((response) => {
        setSubitems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching subitems:", error);
        setError(error);
      });
  }, [productToAdd]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/inventoryManagement/getInventoryItem"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: InventoryItem[] = await response.json();
        setInventoryData(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Check for the product in the cart and set the correct type ('edit' or 'add')
  useEffect(() => {
    const itemInCart = cart.find(
      (item) => item.productID === productToAdd.productID
    );
    if (itemInCart) {
      setCorrectType("edit"); // Set type to "edit" if product is in cart
    }
  }, [cart, productToAdd]);

  // Load the cart from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [quantityModalIsVisible]); // Ensure the cart is reloaded when the modal is opened

  // Listen to cart changes to update the modal quantity when it's opened
  useEffect(() => {
    if (
      correctType === "edit" &&
      quantityModalIsVisible &&
      productToAdd.productID
    ) {
      const item = cart.find(
        (item) => item.productID === productToAdd.productID
      );
      if (item) {
        setQuantity(item.quantity ?? 0); // Default to 0 if undefined
      } else {
        setQuantity(0);
      }
    } else if (correctType !== "edit") {
      setQuantity(0);
    }
  }, [correctType, quantityModalIsVisible, productToAdd, cart]);

  // Fetch subitems for other products in the cart
  useEffect(() => {
    const fetchSubitemsForCart = async () => {
      try {
        const allSubitems = await Promise.all(
          cart.map(async (cartItem) => {
            const response = await axios.get(
              `http://localhost:8081/menuManagement/getSpecificSubitems/${cartItem.productID}`
            );
            return {
              productID: cartItem.productID.toString(),
              subitems: response.data,
            }; // Convert productID to string here
          })
        );

        return allSubitems;
      } catch (error) {
        console.error("Error fetching subitems for cart:", error);
        return [];
      }
    };

    fetchSubitemsForCart().then((cartSubitems) => {
      calculateMaxQuantity(cartSubitems);
    });
  }, [cart, subitems, inventoryData, productToAdd]);

  const calculateMaxQuantity = (
    cartSubitems: { productID: string; subitems: SubitemDataTypes[] }[]
  ) => {
    if (
      subitems &&
      inventoryData &&
      subitems.length > 0 &&
      inventoryData.length > 0
    ) {
      const maxQuantities = subitems.map((subitem) => {
        const inventoryItem = inventoryData.find(
          (item) => item.inventoryID === subitem.inventoryID
        );

        if (inventoryItem) {
          // Calculate reserved quantity by other products in the cart
          const reservedQuantity = cartSubitems.reduce((total, cartItem) => {
            if (cartItem.productID !== productToAdd.productID?.toString()) {
              // Only consider other products in the cart
              const matchingSubitem = cartItem.subitems.find(
                (item) => item.inventoryID === subitem.inventoryID
              );

              if (matchingSubitem) {
                // Add the quantity of this subitem needed for the cart item
                const cartItemQuantity =
                  cart.find(
                    (item) => item.productID.toString() === cartItem.productID
                  )?.quantity ?? 0;

                return (
                  total + matchingSubitem.quantityNeeded * cartItemQuantity
                );
              }
            }
            return total;
          }, 0);

          // Calculate available quantity for this subitem after subtracting reserved amount
          const availableQuantity =
            inventoryItem.totalQuantity - reservedQuantity;

          return Math.floor(availableQuantity / subitem.quantityNeeded);
        }
        return 0;
      });

      const maxPossibleQuantity = Math.min(...maxQuantities);
      setMaxQuantity(maxPossibleQuantity);

      console.log(
        "Max quantity of ",
        productToAdd.productName,
        " is ",
        maxPossibleQuantity
      );
    } else {
      console.log("Max quantity unknown.");
      setMaxQuantity(Infinity); // Set to Infinity if no limitation is found
    }
  };

  let pathname = usePathname();

  const handleSave = () => {
    console.log("Current cart before save:", cart);

    if (productToAdd.productID) {
      const itemIndex = cart.findIndex(
        (item) => item.productID === productToAdd.productID
      );

      console.log("Item index in cart:", itemIndex);

      const updatedCart = [...cart];

      if (correctType === "edit") {
        if (quantity === 0) {
          if (itemIndex !== -1) {
            updatedCart.splice(itemIndex, 1); // Remove item if quantity is 0
            console.log("Item removed due to zero quantity:", updatedCart);
          }
        } else if (itemIndex !== -1) {
          updatedCart[itemIndex].quantity = quantity; // Update the quantity
          console.log("Item quantity updated:", updatedCart);
        }
      } else {
        if (quantity > 0) {
          if (itemIndex !== -1) {
            updatedCart[itemIndex].quantity += quantity; // Add to existing quantity
            console.log("Quantity added to existing item:", updatedCart);
          } else {
            const newOrderItem: OrderItemDataTypes = {
              productID: productToAdd.productID,
              quantity: quantity ?? 1, // Fallback to 0 if undefined
            };
            updatedCart.push(newOrderItem);
            console.log("New item added:", updatedCart);
          }
        }
      }

      setCart(updatedCart);
      console.log("Updated cart state:", updatedCart);

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      console.log(
        "Cart saved to localStorage:",
        JSON.parse(localStorage.getItem("cart") || "[]")
      );
      setSuccessMessage(`${quantity}x ${productToAdd.productName} successfully added to the cart!`);
    }

    setQuantityModalVisibility(false);
    setQuantity(0);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="w-full">
      <Modal
        modalIsVisible={quantityModalIsVisible}
        setModalVisibility={setQuantityModalVisibility}
      >
        <div className="flex flex-col gap-3 justify-center items-center w-[250px] p-5 bg-white rounded-md shadow-lg m-0 border-black">
          <div className="font-bold text-2xl text-black text-center">
            {productToAdd.productName}
          </div>
          <div className="text-black text-center">Select Quantity</div>
          <div className="flex justify-center items-center">
            <button
              className="px-3 py-1 rounded-full text-black text-sm shadow-xl hover:scale-110 active:bg-secondaryBrown duration-200 bg-cream"
              onClick={() => setQuantity((prev) => Math.max(prev - 1, 0))}
              disabled={quantity <= 0}
            >
              -
            </button>
            <div className="text-black flex flex-col items-center justify-center w-14">
              {quantity}
            </div>
            <button
              className="px-3 py-1 rounded-full text-black text-sm shadow-xl hover:scale-110 active:bg-secondaryBrown duration-200 bg-cream"
              onClick={() => setQuantity((prev) => prev + 1)}
              disabled={quantity >= maxQuantity}
            >
              +
            </button>
          </div>
          {quantity >= maxQuantity && (
            <p className="text-gray text-xs text-center mt-3">
              Maximum quantity reached
            </p>
          )}
          <button
            className="w-full px-4 py-2 rounded-full bg-secondaryBrown hover:scale-110 duration-200 active:bg-primaryBrown text-white font-bold text-sm shadow-lg"
            onClick={handleSave}
            disabled={quantity > maxQuantity || quantity === 0}
          >
            {correctType === "edit" ? "Confirm" : "Add to Order"}
          </button>
        </div>
      </Modal>
      {successMessage && (
        <Notification
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
};

export default QuantityModal;
