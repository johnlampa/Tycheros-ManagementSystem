"use client";

import { useEffect, useState } from "react";
import OrderManagementCard from "@/components/ui/OrderManagementCard";
import { Order } from "../../../../lib/types/OrderDataTypes";
import { ProductDataTypes } from "../../../../lib/types/ProductDataTypes";
import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import CancelOrderModal from "@/components/CancelOrderModal";

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [cancelOrderModalIsVisible, setCancelOrderModalVisibility] =
    useState<boolean>(false);
  const [orderToEdit, setOrderToEdit] = useState<Order>();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/orderManagement/getOrders"
        );
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    const fetchMenuData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/orderManagement/getMenuData"
        );
        if (!response.ok) throw new Error("Failed to fetch menu data");
        const data = await response.json();
        setMenuData(data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setError("Error fetching menu data");
      }
    };

    fetchOrders();
    fetchMenuData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const completedOrders = orders.filter((order) => order.status === "Completed");

  return (
    <div className="flex justify-center items-center w-full pb-7 min-h-screen">
      <div className="w-[360px] flex flex-col items-center bg-white min-h-screen">
        <Header text="Completed" color={"tealGreen"} type={"orders"}>
          <Link href={"/order-management"} className="z-100">
            <button className="mr-3 border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>

        {completedOrders.length === 0 ? (
          <div className="text-center text-black mt-7">
            No completed orders yet.
          </div>
        ) : (
          completedOrders.map((order, orderIndex) => (
            <div key={orderIndex} className="mt-7">
              <OrderManagementCard
                order={order}
                menuData={menuData}
                orders={orders}
                setOrders={setOrders}
                type={"management"}
                setCancelOrderModalVisibility={setCancelOrderModalVisibility}
                setOrderToEdit={setOrderToEdit}
              />
            </div>
          ))
        )}

        <CancelOrderModal
          cancelOrderModalIsVisible={cancelOrderModalIsVisible}
          setCancelOrderModalVisibility={setCancelOrderModalVisibility}
          modalTitle="Cancel Order"
          orderToEdit={orderToEdit}
          orders={orders}
          setOrders={setOrders}
        ></CancelOrderModal>
      </div>
    </div>
  );
}
