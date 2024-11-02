"use client";

import { useEffect, useState } from "react";
import OrderManagementCard from "@/components/ui/OrderManagementCard";
import { Order } from "../../../lib/types/OrderDataTypes";
import { ProductDataTypes } from "../../../lib/types/ProductDataTypes";
import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import CancelOrderModal from "@/components/CancelOrderModal";
import axios from "axios";
import { Payment } from "../../../lib/types/PaymentDataTypes";

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [cancelOrderModalIsVisible, setCancelOrderModalVisibility] =
    useState<boolean>(false);
  const [orderToEdit, setOrderToEdit] = useState<Order>();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/orderManagement/getOrders"
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    const fetchMenuData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/orderManagement/getMenuData"
        );
        setMenuData(response.data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setError("Error fetching menu data");
      }
    };

    const fetchPayments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/orderManagement/getPaymentDetails"
        );
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching payment details:", error);
        setError("Error fetching payment details");
      }
    };

    fetchOrders();
    fetchMenuData();
    fetchPayments();
  }, []);

  useEffect(() => {
    console.log("Orders fetched:", orders);
  }, [orders]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleCancelOrder = (order: Order) => {
    setOrderToEdit(order);
    setCancelOrderModalVisibility(true);
  };

  return (
    <div className="flex justify-center items-center w-full pb-7 min-h-screen">
      <div className="w-[360px] flex flex-col items-center bg-white min-h-screen">
        <Header text="Orders" color={"tealGreen"} type={"orders"}>
          <Link href={"/employee-home"} className="z-100">
            <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>
        <div className="pb-3 w-full bg-tealGreen flex justify-center items-center">
          <div className="w-max grid grid-cols-3 gap-x-5 gap-y-5">
            {/* Status Links */}
            <Link href={"/order-management/unpaid"}>
              <div
                className={`w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center font-pattaya text-white`}
              >
                Unpaid
              </div>
            </Link>
            <Link href={"/order-management/pending"}>
              <div
                className={`w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center font-pattaya text-white`}
              >
                Pending
              </div>
            </Link>
            <Link href={"/order-management/completed"}>
              <div
                className={`w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center font-pattaya text-white`}
              >
                Completed
              </div>
            </Link>
            <div></div>
            <Link href={"/order-management/cancelled"}>
              <div
                className={`w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center font-pattaya text-white`}
              >
                Cancelled
              </div>
            </Link>
          </div>
        </div>
        {orders.toReversed().map((order, orderIndex) => (
          <div key={orderIndex} className="mt-7">
            <OrderManagementCard
              order={order}
              menuData={menuData}
              orders={orders}
              setOrders={setOrders}
              type={"management"}
              setCancelOrderModalVisibility={() => handleCancelOrder(order)}
              setOrderToEdit={setOrderToEdit}
              payments={payments}
            />
          </div>
        ))}
        <CancelOrderModal
          cancelOrderModalIsVisible={cancelOrderModalIsVisible}
          setCancelOrderModalVisibility={setCancelOrderModalVisibility}
          modalTitle="Cancel Order"
          orderToEdit={orderToEdit}
          orders={orders}
          setOrders={setOrders}
        />
      </div>
    </div>
  );
}
