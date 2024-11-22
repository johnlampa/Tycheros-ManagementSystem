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
import StatusRecordsModal from "@/components/StatusRecords.Modal";
import { useRouter } from "next/navigation";  // Import useRouter for redirection

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [cancelOrderModalIsVisible, setCancelOrderModalVisibility] = useState<boolean>(false);
  const [orderToEdit, setOrderToEdit] = useState<Order>();

  const [statusRecordsModalIsVisible, setStatusRecordsModalIsVisible] = useState(false);
  const [orderIDForStatusRecords, setOrderIDForStatusRecords] = useState<number | undefined>(0);

  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(-1);
  const router = useRouter();  // Initialize the router for redirection

  // Check if the user is logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");

      if (!loggedInEmployeeID) {
        // Redirect to login if not logged in
        router.push("/login");
        return;  // Exit the useEffect if not logged in
      }

      setLoggedInEmployeeID(parseInt(loggedInEmployeeID)); // Set the logged-in employee ID
    }
  }, [router]);

  // Fetch data only if the user is logged in
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8081/orderManagement/getOrders");
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
        const response = await axios.get("http://localhost:8081/orderManagement/getMenuData");
        setMenuData(response.data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setError("Error fetching menu data");
      }
    };

    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:8081/orderManagement/getPaymentDetails");
        if (response.data && response.data.length > 0) {
          setPayments(response.data);
        } else {
          setPayments([]); // Handle empty response
          console.warn("No payment details found");
        }
      } catch (error: unknown) {
        console.error("Error fetching payment details:", error);
        setError("Error fetching payment details");
      }
    };

    fetchOrders();
    fetchMenuData();
    fetchPayments();
  }, []);  // Empty dependency ensures the fetch only runs once on page load

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
      <div className="w-full flex flex-col items-center bg-white min-h-screen">
        <Header text="Orders" color={"tealGreen"} type={"orders"}>
          <Link href={"/employee-home"} className="z-100">
            <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>

        <div className="pb-3 w-full bg-tealGreen flex justify-center items-center">
          <div className="w-max grid grid-cols-3 sm:grid-cols-4 gap-x-5 gap-y-5 sm:pb-3">
            {/* Status Links */}
            <Link href={"/order-management/unpaid"}>Unpaid</Link>
            <Link href={"/order-management/pending"}>Pending</Link>
            <Link href={"/order-management/completed"}>Completed</Link>
            <Link href={"/order-management/cancelled"}>Cancelled</Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center text-black mt-7">No orders available.</div>
        ) : (
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-28 xl:gap-x-36 lg:gap-y-14 lg:mt-10">
            {orders.toReversed().map((order, orderIndex) => (
              <div key={orderIndex} className="mt-8 lg:mt-0">
                <OrderManagementCard
                  order={order}
                  menuData={menuData}
                  orders={orders}
                  setOrders={setOrders}
                  type={"management"}
                  setCancelOrderModalVisibility={() => handleCancelOrder(order)}
                  setOrderToEdit={setOrderToEdit}
                  payments={payments}
                  setOrderIDForStatusRecords={setOrderIDForStatusRecords}
                  setStatusRecordsModalIsVisible={setStatusRecordsModalIsVisible}
                />
              </div>
            ))}
          </div>
        )}

        <CancelOrderModal
          cancelOrderModalIsVisible={cancelOrderModalIsVisible}
          setCancelOrderModalVisibility={setCancelOrderModalVisibility}
          modalTitle="Cancel Order"
          orderToEdit={orderToEdit}
          orders={orders}
          setOrders={setOrders}
          loggedInEmployeeID={loggedInEmployeeID}
        />

        <StatusRecordsModal
          orderID={orderIDForStatusRecords}
          statusRecordsModalIsVisible={statusRecordsModalIsVisible}
          setStatusRecordsModalIsVisible={setStatusRecordsModalIsVisible}
        />
      </div>
    </div>
  );
}
