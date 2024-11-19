"use client";
import { Suspense, useEffect, useState } from "react";
import { Order } from "../../../lib/types/OrderDataTypes";
import { useSearchParams } from "next/navigation";
import { ProductDataTypes } from "../../../lib/types/ProductDataTypes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import OrderCard from "@/components/OrderCard";
import OrderManagementCard from "@/components/ui/OrderManagementCard";
import { FaArrowLeft } from "react-icons/fa";
import ValidationDialog from "@/components/ValidationDialog";
import { Payment } from "../../../lib/types/PaymentDataTypes";

function PaymentDetailsPage() {
  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);
  const [order, setOrder] = useState<Order>({
    employeeID: 1,
    date: new Date().toISOString(),
    status: "Unpaid",
    method: "Cash",
    orderItems: [],
  });
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const [payments, setPayments] = useState<Payment[]>([]);

  const [showDialog, setShowDialog] = useState(false); // State for dialog visibility
  const [validationMessage, setValidationMessage] = useState(""); // Message for the dialog

  const [orders, setOrders] = useState<Order[]>([]); //for component purposes. to remove when OrderManagementCard is refactored

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(-1);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (loggedInEmployeeID) {
        setLoggedInEmployeeID(parseInt(loggedInEmployeeID));
      }
    }
  }, []);

  useEffect(() => {
    console.log("loggedInEmployeeID: ", loggedInEmployeeID);
  }, [loggedInEmployeeID]);

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

  useEffect(() => {
    const orderParams = searchParams.get("order");
    if (orderParams) {
      const orderHolder = JSON.parse(orderParams) as Order;
      setOrder(orderHolder);
    }
  }, [searchParams]);

  useEffect(() => {
    const calculatedTotal = order.orderItems?.reduce(
      (acc, { productID, quantity }) => {
        const product = menuData.find((item) => item.productID === productID);
        return product ? acc + product.sellingPrice * quantity : acc;
      },
      0
    );
    setTotal(calculatedTotal || 0);
  }, [order, menuData]);

  const handleConfirmPayment = async () => {
    // Check if discount type is entered without a discount amount
    if (discountType && discountAmount === 0) {
      setValidationMessage("Please provide the discount amount.");
      setShowDialog(true);
      return; // Stop further processing
    } else if (!discountType && discountAmount > 0) {
      setValidationMessage("Please provide the discount type.");
      setShowDialog(true);
      return; // Stop further processing
    }

    // Check if payment method is Cash and reference number is provided
    if (paymentMethod === "Cash" && referenceNumber) {
      setValidationMessage("Cash payments don't have a reference number.");
      setShowDialog(true);
      return; // Stop further processing
    }

    const finalAmount = total - (discountAmount || 0);

    console.log("orderID: ", order.orderID);
    console.log("amount: ", finalAmount);
    console.log("method: ", paymentMethod);
    console.log("reference number: ", referenceNumber);
    console.log("discount type: ", discountType);
    console.log("discount amount: ", discountAmount);

    try {
      // Process payment
      const paymentResponse = await fetch(
        "http://localhost:8081/orderManagement/processPayment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderID: order.orderID,
            amount: finalAmount,
            method: paymentMethod,
            referenceNumber,
            discountType: discountType,
            discountAmount: discountAmount,
            employeeID: loggedInEmployeeID,
          }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to process payment");
      }

      alert("Payment processed and order status updated successfully");
      router.push("/order-management");
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing payment or updating order status");
    }
  };

  const handleDiscountAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    // If the input is empty, set discountAmount to 0, but allow the field to appear empty
    if (value === "") {
      setDiscountAmount(0);
      setValidationMessage(""); // Clear validation message if input is empty
      return;
    }

    // Perform validation for non-numeric input
    const parsedValue = parseFloat(value);

    if (isNaN(parsedValue)) {
      setValidationMessage(
        "Invalid discount amount. Please enter a valid number."
      );
      setShowDialog(true); // Show validation dialog
    } else if (parsedValue < 0) {
      setValidationMessage(
        "Invalid discount amount. Discount cannot be negative."
      );
      setShowDialog(true); // Show validation dialog
    } else {
      setDiscountAmount(parsedValue);
      setValidationMessage(""); // Clear validation message if input is valid
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showDialog && (
        <ValidationDialog
          message={validationMessage}
          onClose={() => setShowDialog(false)}
        />
      )}
      <div className="flex flex-col flex-grow justify-center items-center">
        <div className="w-full flex flex-col flex-grow items-center gap-3 pb-3">
          <Header
            text="Payment Details"
            color={"tealGreen"}
            type={"payment_details"}
          >
            <Link href={"/order-management"} className="z-100">
              <button className="mr-3 border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
                <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
              </button>
            </Link>
          </Header>
          <div className="w-min text-black md:mt-16">
            <div className="md:flex gap-x-10 lg:gap-x-32">
              <div className="md:flex md:flex-col md:gap-y-10">
                <div className="w-[320px] bg-cream rounded-md p-3 mb-4 md:mb-0 ">
                  <p className="font-semibold mb-1">Discounts</p>
                  <div className="grid grid-cols-[2fr_1fr] gap-x-2 justify-center items-center ">
                    <label htmlFor="discountTypeInput" className="text-xs">
                      Type
                    </label>
                    <label htmlFor="discountAmountInput" className="text-xs">
                      Amount
                    </label>
                    <input
                      className="text-black rounded-md w-full my-1 text-xs py-1 px-2"
                      placeholder="Enter Discount Type Here"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      id="discountTypeInput"
                      name="discountTypeInput"
                    />
                    <input
                      className="text-black rounded-md w-full my-1 text-xs py-1 px-2"
                      value={discountAmount}
                      type="text" // Change this to text to allow full control
                      onChange={handleDiscountAmountChange}
                      id="discountAmountInput"
                      name="discountAmountInput"
                    />
                  </div>
                </div>

                <div className="w-[320px] bg-cream rounded-md p-3">
                  <p className="font-semibold mb-2">Payment Method</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <input
                          type="radio"
                          id="gcash"
                          name="paymentMethod"
                          value="GCash"
                          className="mr-2 text-blue-600 border-gray-300 focus:ring-blue-500"
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="gcash" className="text-gray-700">
                          GCash
                        </label>
                      </div>
                      <div>&#8369; {total.toFixed(2)}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <input
                          type="radio"
                          id="card"
                          name="paymentMethod"
                          value="Card"
                          className="mr-2 text-blue-600 border-gray-300 focus:ring-blue-500"
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="card" className="text-gray-700">
                          Card
                        </label>
                      </div>
                      <div>&#8369; {total.toFixed(2)}</div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <input
                          type="radio"
                          id="cash"
                          name="paymentMethod"
                          value="Cash"
                          className="mr-2 text-blue-600 border-gray-300 focus:ring-blue-500"
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label htmlFor="cash" className="text-gray-700">
                          Cash
                        </label>
                      </div>
                      <div>&#8369; {total.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <div className="flex flex-col justify-center">
                      <div className="text-xs font-semibold w-max">
                        Enter Reference Number:
                      </div>
                      <div className="text-xs">(for GCash or Card)</div>
                    </div>
                    <input
                      className="text-black rounded-md w-full my-1 text-xs py-1 px-2"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Reference"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center mt-7 md:mt-0">
                <div className="w-[320px] flex flex-col">
                  <div className="mb-1  font-semibold text-[25px]">
                    Order Summary
                  </div>
                  <OrderManagementCard
                    menuData={menuData}
                    order={order}
                    orders={orders}
                    setOrders={setOrders}
                    type={"payment"}
                    discountAmount={discountAmount}
                    payments={payments}
                  ></OrderManagementCard>
                </div>
              </div>
            </div>
            <div className="mt-5 md:mt-32">
              <button
                className="w-full h-[39px] bg-tealGreen rounded-md p-3 flex justify-center items-center"
                onClick={handleConfirmPayment}
              >
                <span className="font-pattaya text-[20px] text-white">
                  Confirm Payment
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentDetailsPage />
    </Suspense>
  );
}
