"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrderCard from "@/components/OrderCard";
import { Order, OrderItemDataTypes } from "../../../lib/types/OrderDataTypes";
import {
  ProductDataTypes,
  SubitemForStockInDataTypes,
} from "../../../lib/types/ProductDataTypes";
import Header from "@/components/Header";
import Link from "next/link";
import OrderButtonSection from "@/components/section/OrderButtonSection";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

function OrderSummaryPage() {
  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);
  const date = new Date();
  const time =
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  const dateTime = date.toISOString() + " " + time;

  const [order, setOrder] = useState<Order>({
    employeeID: 1,
    date: dateTime,
    status: "Unpaid",
    orderItems: [],
  });
  const [subtotal, setSubtotal] = useState(0);
  const [quantityModalVisibility, setQuantityModalVisibility] = useState(false);
  const [previousPage, setPreviousPage] = useState("/");
  const searchParams = useSearchParams();
  const [orderID, setOrderID] = useState(-1);
  const [orderInventoryIDs, setOrderInventoryIDs] = useState<number[]>([]);
  const [cart, setCart] = useState<OrderItemDataTypes[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("http://localhost:8081/ordering/getCustomerMenu")
      .then((response) => response.json())
      .then((data) => setMenuData(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  // Load cart and previous page from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      const storedPreviousPage = localStorage.getItem("previousPage");

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        localStorage.setItem("cart", JSON.stringify([]));
      }

      if (storedPreviousPage) {
        setPreviousPage(storedPreviousPage);
      }
    }
  }, []);

  // Function to create an order by sending data to the backend
  const createOrder = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/ordering/createOrder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderitems: cart }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Order created:", data);
        setOrderID(data.orderID);

        if (typeof window !== "undefined") {
          localStorage.setItem("orderID", data.orderID.toString());
        }
      } else {
        console.error("Failed to create order");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    localStorage.removeItem("cart");
  };

  const fetchNecessarySubinventoryIDs = async (
    inventoryID: number,
    totalNeeded: number
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/orderManagement/getSubinventoryID",
        {
          inventoryID: inventoryID,
          totalInventoryQuantityNeeded: totalNeeded,
        }
      );

      if (response.status === 200) {
        const { necessarySubinventoryIDs, totalQuantityRemaining } =
          response.data;
        console.log(
          `Necessary subinventoryIDs for inventoryID ${inventoryID}:`,
          necessarySubinventoryIDs
        );
        return necessarySubinventoryIDs;
      } else {
        console.error(
          "Failed to fetch necessary subinventory IDs:",
          response.data
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching necessary subinventory IDs:", error);
      return [];
    }
  };

  // Function to fetch subinventory details for products in the cart
  const fetchSubinventoryDetails = async (productIDs: number[]) => {
    try {
      // Make a single POST request to the new endpoint
      const response = await axios.post(
        "http://localhost:8081/orderManagement/getSubinventoryDetails",
        { productIDs }
      );

      // Check if the response is okay
      if (response.status === 200) {
        const subinventoryDetails = response.data; // Directly use the response data
        console.log("Fetched subinventory details:", subinventoryDetails);
        return subinventoryDetails;
      } else {
        console.error("Failed to fetch subinventory details:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching subinventory details:", error);
      return [];
    }
  };

  // Define the type for an update
  type UpdateType = {
    subinventoryID: number;
    quantityToReduce: number;
  };

  // Modified updateInventoryAfterOrder function
  const updateInventoryAfterOrder = async (
    totalInventoryQuantityNeeded: { [inventoryID: number]: number },
    subinventoryDetails: SubitemForStockInDataTypes[]
  ) => {
    try {
      let updates: UpdateType[] = [];

      // Process each inventoryID to update quantities in subinventories
      for (const [inventoryID, totalNeeded] of Object.entries(
        totalInventoryQuantityNeeded
      )) {
        let remainingNeeded = totalNeeded;

        // Fetch necessary subinventory IDs for the current inventoryID
        const necessarySubinventoryIDs = await fetchNecessarySubinventoryIDs(
          parseInt(inventoryID),
          totalNeeded
        );

        console.log(
          `Necessary subinventoryIDs for inventoryID ${inventoryID}:`,
          necessarySubinventoryIDs
        );

        // Loop through necessary subinventory IDs to build updates array
        for (const {
          subinventoryID,
          quantityToUse,
        } of necessarySubinventoryIDs) {
          if (remainingNeeded <= 0) break;

          // Find the corresponding subinventory details to get the quantityToReduce
          const subinventoryDetail = subinventoryDetails.find(
            (sub) =>
              sub.subinventoryID === subinventoryID &&
              sub.inventoryID === parseInt(inventoryID)
          );

          if (subinventoryDetail) {
            // Calculate the quantity to reduce from the fetched subinventory details
            const quantityToReduce = Math.min(
              quantityToUse,
              remainingNeeded,
              subinventoryDetail.quantityRemaining
            );

            updates.push({
              subinventoryID: subinventoryID,
              quantityToReduce: quantityToReduce,
            });

            console.log(
              `Adding update: subinventoryID ${subinventoryID}, quantityToReduce ${quantityToReduce}`
            );

            // Update remainingNeeded
            remainingNeeded -= quantityToReduce;
          }
        }

        // If remainingNeeded is still greater than 0, log a warning
        if (remainingNeeded > 0) {
          console.warn(
            `Not enough stock available for inventoryID ${inventoryID}. ${remainingNeeded} still needed.`
          );
        }
      }

      console.log(
        "Final updates to be sent to backend:",
        JSON.stringify({ updates }, null, 2)
      );

      // Send the updates to the backend
      const response = await fetch(
        "http://localhost:8081/orderManagement/updateMultipleSubitemQuantities",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updates }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update inventory quantities:", errorData);
        throw new Error("Failed to update inventory quantities");
      }

      console.log("Inventory updated successfully");
    } catch (error) {
      console.error("Error updating inventory quantities:", error);
    }
  };

  // Function to fetch subitems for each productID using the new endpoint
  const fetchSubitemsForProducts = async (productIDs: number[]) => {
    try {
      // Initialize an empty array to store all subitems
      let allSubitems: SubitemForStockInDataTypes[] = [];
      let orderInventoryIDs = new Set<number>(); // Use a Set to track unique inventoryIDs

      // Iterate over each productID and make individual GET requests
      for (const productID of productIDs) {
        console.log("productID: ", productID);
        const response = await axios.get(
          `http://localhost:8081/menuManagement/getSpecificSubitems/${productID}`
        );

        const fetchedSubitems: SubitemForStockInDataTypes[] = response.data;
        console.log("fetchedSubitems: ", fetchedSubitems);

        // Filter and add unique inventoryIDs to the allSubitems array
        fetchedSubitems.forEach((subitem) => {
          allSubitems.push(subitem); // Add the subitem to the allSubitems array
          if (!orderInventoryIDs.has(subitem.inventoryID)) {
            orderInventoryIDs.add(subitem.inventoryID); // Add unique inventoryID to the Set
          }
        });

        console.log("All Subitems: ", allSubitems);
        console.log("Order Inventory IDs: ", Array.from(orderInventoryIDs));
      }

      console.log("Fetched subitems for inventory update:", allSubitems);
      return allSubitems;
    } catch (error) {
      console.error("Error fetching subitems for products:", error);
      return [];
    }
  };

  // Updated handleClick function
  const handleClick = async () => {
    await createOrder(); // Place the order

    // After creating the order, process inventory updates
    if (cart.length > 0) {
      try {
        const productIDs = cart.map((product) => product.productID);
        console.log("Product IDs: ", productIDs);

        // Step 1: Fetch subitems for each productID to calculate totalQuantityNeeded
        const allSubitems = await fetchSubitemsForProducts(productIDs);

        // Calculate totalQuantityNeeded for each inventoryID
        const totalInventoryQuantityNeeded: { [inventoryID: number]: number } =
          {};
        allSubitems.forEach((subitem) => {
          const cartItem = cart.find(
            (item) => item.productID === subitem.productID
          );
          if (!cartItem) return;

          const totalSubitemQuantityNeeded =
            subitem.quantityNeeded * cartItem.quantity;

          if (totalInventoryQuantityNeeded[subitem.inventoryID]) {
            totalInventoryQuantityNeeded[subitem.inventoryID] +=
              totalSubitemQuantityNeeded;
          } else {
            totalInventoryQuantityNeeded[subitem.inventoryID] =
              totalSubitemQuantityNeeded;
          }
        });

        // Step 2: Fetch subinventory details for each productID using the updated endpoint
        const subinventoryDetails = await fetchSubinventoryDetails(productIDs);

        console.log(
          "Total inventory quantities needed:",
          totalInventoryQuantityNeeded,
          " Subinventory Details: ",
          subinventoryDetails
        );

        // Step 3: Update inventory quantities based on totalInventoryQuantityNeeded and subinventoryDetails
        await updateInventoryAfterOrder(
          totalInventoryQuantityNeeded,
          subinventoryDetails
        );
      } catch (error) {
        console.error("Error updating inventory after order:", error);
      }
    }

    // Remove the cart after the order is created
    localStorage.removeItem("cart");
  };

  useEffect(() => {
    console.log("Updated order: ", order);
  }, [order]);

  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      <div className="w-full flex flex-col items-center gap-3 bg-white min-h-screen">
        <Header text="Order Summary" color={"tealGreen"} type={"order_summary"}>
          <Link href={"/"}>
            <button className="mr-3 border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>
        <OrderCard
          cart={cart}
          setCart={setCart}
          setOrder={setOrder}
          menuData={menuData}
          quantityModalIsVisible={quantityModalVisibility}
          setQuantityModalVisibility={setQuantityModalVisibility}
          subtotal={subtotal}
          setSubtotal={setSubtotal}
          type={"summary"}
        />
        <div className="fixed bottom-0 w-full">
          <OrderButtonSection
            subtotal={subtotal}
            handleClick={handleClick}
          ></OrderButtonSection>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSummaryPage />
    </Suspense>
  );
}
