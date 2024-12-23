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
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import FlowBiteSideBar from "@/components/FlowBiteSideBar";
import { GiHamburgerMenu } from "react-icons/gi";
import { AxiosError } from "axios";

export default function Page() {
  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sideBarVisibility, setSideBarVisibility] = useState(false);

  const [cancelOrderModalIsVisible, setCancelOrderModalVisibility] =
    useState<boolean>(false);
  const [orderToEdit, setOrderToEdit] = useState<Order>();

  const [statusRecordsModalIsVisible, setStatusRecordsModalIsVisible] =
    useState(false);
  const [orderIDForStatusRecords, setOrderIDForStatusRecords] = useState<
    number | undefined
  >(0);

  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(-1);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust this as needed

  const [filterByDate, setFilterByDate] = useState("");
  const [filterByStatus, setFilterByStatus] = useState({
    Unpaid: false,
    Pending: false,
    Completed: false,
    Cancelled: false,
  });

  const [unfilteredOrders, setUnfilteredOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  useEffect(() => {
    const applyFilters = () => {
      let filtered = unfilteredOrders;

      // Apply date filter if filterByDate has a value
      if (filterByDate) {
        filtered = filtered.filter(
          (order) => order.date.substring(0, 10) === filterByDate
        );
      }

      // Apply status filter if any status is active
      const activeStatuses = Object.entries(filterByStatus)
        .filter(([_, isActive]) => isActive) // Filter for active statuses
        .map(([status]) => status); // Extract the status names

      if (activeStatuses.length > 0) {
        filtered = filtered.filter((order) =>
          activeStatuses.includes(order.status)
        );
      }

      console.log(activeStatuses);
      setFilteredOrders(filtered);
    };

    applyFilters();
  }, [filterByDate, filterByStatus, unfilteredOrders]);

  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const router = useRouter();
  // Check if the user is logged inz`
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (loggedInEmployeeID) {
        setIsAuthenticated(true); // Mark as authenticated
      } else {
        router.push("/login"); // Redirect to login immediately
      }
    }
  }, [router]);

  // Fetch data only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/orderManagement/getOrders"
        );
        setUnfilteredOrders(response.data);
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
        if (
          response.status === 200 &&
          response.data &&
          response.data.length > 0
        ) {
          setPayments(response.data);
        } else {
          setPayments([]); // Default to an empty array if no data is returned
          console.log("No payment details available."); // Log instead of showing an error
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Handle AxiosError specifically
          if (error.response && error.response.status === 404) {
            setPayments([]);
            console.log(error.response.data.message); // Log the no-data message
          } else {
            console.error("Error fetching payment details:", error.message);
            setError("Error fetching payment details.");
          }
        } else if (error instanceof Error) {
          // Handle generic errors
          console.error("Error fetching payment details:", error.message);
          setError(error.message);
        } else {
          // Handle unknown errors
          console.error("An unknown error occurred:", error);
          setError("An unknown error occurred.");
        }
      }
    };

    fetchOrders();
    fetchMenuData();
    fetchPayments();
  }
}, [isAuthenticated]);

// Render nothing while checking authentication
if (!isAuthenticated) {
  return null; // Prevent rendering until authentication is confirmed
}

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

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredOrders.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handle page navigation
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center w-full pb-7 min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen">
        <Header text="Orders" color={"tealGreen"} type={"orders"}>
          <button
            className="mr-3 flex items-center justify-center"
            onClick={() => {
              setSideBarVisibility(true);
            }}
          >
            <GiHamburgerMenu style={{ fontSize: "5vh", color: "white" }} />
          </button>
        </Header>
        {sideBarVisibility && (
          <FlowBiteSideBar
            setSideBarVisibility={setSideBarVisibility}
          ></FlowBiteSideBar>
        )}

        <div className="pb-3 w-full bg-tealGreen px-2 sm:px-5">
          <div className="w-full flex justify-center items-center ">
            <div className="text-xs w-16 md:text-md font-semibold text-white">
              Filters:
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-x-3 sm:gap-y-3">
              <div
                className={`${
                  filterByStatus.Unpaid === true
                    ? "bg-white !text-tealGreen font-semibold"
                    : ""
                } w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center text-sm text-white `}
                onClick={() =>
                  filterByStatus.Unpaid === false
                    ? setFilterByStatus((prev) => ({ ...prev, Unpaid: true }))
                    : setFilterByStatus((prev) => ({
                        ...prev,
                        Unpaid: false,
                      }))
                }
              >
                Unpaid
              </div>

              <div
                className={`${
                  filterByStatus.Pending === true
                    ? "bg-white !text-tealGreen font-semibold"
                    : ""
                } w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center text-sm text-white `}
                onClick={() =>
                  filterByStatus.Pending === false
                    ? setFilterByStatus((prev) => ({
                        ...prev,
                        Pending: true,
                      }))
                    : setFilterByStatus((prev) => ({
                        ...prev,
                        Pending: false,
                      }))
                }
              >
                Pending
              </div>

              <div
                className={`${
                  filterByStatus.Completed === true
                    ? "bg-white !text-tealGreen font-semibold"
                    : ""
                } w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center text-sm text-white `}
                onClick={() =>
                  filterByStatus.Completed === false
                    ? setFilterByStatus((prev) => ({
                        ...prev,
                        Completed: true,
                      }))
                    : setFilterByStatus((prev) => ({
                        ...prev,
                        Completed: false,
                      }))
                }
              >
                Completed
              </div>

              <div
                className={`${
                  filterByStatus.Cancelled === true
                    ? "bg-white !text-tealGreen font-semibold"
                    : ""
                } w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center text-sm text-white `}
                onClick={() =>
                  filterByStatus.Cancelled === false
                    ? setFilterByStatus((prev) => ({
                        ...prev,
                        Cancelled: true,
                      }))
                    : setFilterByStatus((prev) => ({
                        ...prev,
                        Cancelled: false,
                      }))
                }
              >
                Cancelled
              </div>
              <div className="text-white">|</div>

              <input
                placeholder=""
                type="date"
                id="dateFilter"
                className="rounded-md border border-gray text-sm text-black text-center w-[120px] h-[25px] hidden md:block"
                onChange={(e) => setFilterByDate(e.target.value)}
              ></input>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            <input
              placeholder=""
              type="date"
              id="dateFilter"
              className="rounded-md border border-gray text-sm text-black text-center w-[120px] h-[25px] block md:hidden"
              onChange={(e) => setFilterByDate(e.target.value)}
            ></input>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center text-black mt-7">
            No orders available.
          </div>
        ) : (
          <div>
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-28 xl:gap-x-36 lg:gap-y-14 lg:mt-10">
              {currentData.map((order, orderIndex) => (
                <div key={orderIndex} className="mt-8 lg:mt-0">
                  <OrderManagementCard
                    order={order}
                    menuData={menuData}
                    orders={filteredOrders}
                    setOrders={setFilteredOrders}
                    type={"management"}
                    setCancelOrderModalVisibility={() =>
                      handleCancelOrder(order)
                    }
                    setOrderToEdit={setOrderToEdit}
                    payments={payments}
                    setOrderIDForStatusRecords={setOrderIDForStatusRecords}
                    setStatusRecordsModalIsVisible={
                      setStatusRecordsModalIsVisible
                    }
                  />
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm w-[65px] ${
                  currentPage === 1 ? "text-white" : "underline"
                }`}
              >
                Back
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm w-[65px] ${
                  currentPage === totalPages ? "text-white" : "underline"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        <CancelOrderModal
          cancelOrderModalIsVisible={cancelOrderModalIsVisible}
          setCancelOrderModalVisibility={setCancelOrderModalVisibility}
          modalTitle="Cancel Order"
          orderToEdit={orderToEdit}
          orders={filteredOrders}
          setOrders={setFilteredOrders}
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
