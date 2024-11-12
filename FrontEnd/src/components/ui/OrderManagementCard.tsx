"use client";
import React, { useEffect, useState, useCallback } from "react";
import { OrderManagementCardProps } from "../../../lib/types/props/OrderManagementCardProps";
import Link from "next/link";
import { Order } from "../../../lib/types/OrderDataTypes";
import { Payment } from "../../../lib/types/PaymentDataTypes";

const OrderManagementCard: React.FC<OrderManagementCardProps> = React.memo(
  ({
    order,
    menuData,
    orders,
    setOrders,
    payments,
    type,
    discountAmount,
    setCancelOrderModalVisibility,
    setOrderToEdit,
  }) => {
    const [total, setTotal] = useState(0);
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
      // Calculate total price first without applying discount
      const calculatedTotal = order.orderItems?.reduce(
        (acc, { productID, quantity }) => {
          const product = menuData.find((item) => item.productID === productID);
          return product ? acc + product.sellingPrice * quantity : acc;
        },
        0
      );

      // Apply the discount to the final total once
      setTotal(calculatedTotal ? calculatedTotal - (discountAmount || 0) : 0);
    }, [order, menuData, discountAmount]);

    const payment = payments?.find(
      (p: Payment) => p.paymentID === order.paymentID
    );

    const updateOrderStatus = async (
      newStatus: "Unpaid" | "Pending" | "Completed" | "Cancelled"
    ) => {
      try {
        const response = await fetch(
          "http://localhost:8081/orderManagement/updateOrderStatus",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderID: order.orderID,
              newStatus,
              //employeeID: loggedInEmployeeID
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update order status");
        }

        alert(`Order status updated to ${newStatus}`);

        // Update the UI locally
        const updatedOrder: Order = {
          ...order,
          status: newStatus,
        };
        setOrders?.(
          orders.map((o) => (o.orderID === order.orderID ? updatedOrder : o))
        );
      } catch (error) {
        console.error("Error updating order status:", error);
        alert("Error updating order status");
      }
    };

    const handleCompleteOrder = useCallback(async () => {
      try {
        // API call to complete order
        await updateOrderStatus("Completed");
      } catch (error) {
        console.error("Error completing order:", error);
      }
    }, [order]);

    const handleCancelOrder = useCallback(() => {
      if (order.status === "Unpaid" || order.status === "Pending") {
        if (setCancelOrderModalVisibility) {
          setCancelOrderModalVisibility(true);
          if (setOrderToEdit) {
            setOrderToEdit(order);
          }
        }
      } else if (order.status === "Completed") {
        if (setCancelOrderModalVisibility) {
          setCancelOrderModalVisibility(true);
          if (setOrderToEdit) {
            setOrderToEdit(order);
          }
        }
      }
    }, [order, setCancelOrderModalVisibility, setOrderToEdit]);

    const [orderStatusLabel, setOrderStatusLabel] = useState<string>(
      order.status
    );

    useEffect(() => {
      if (order.status === "Cancelled") {
        setOrderStatusLabel(order.paymentID ? "Refunded" : "Cancelled");
      } else {
        setOrderStatusLabel(order.status);
      }
    }, [order.status, order.paymentID]);

    return (
      <>
        <div className="w-[320px]">
          <div className="flex justify-between p-1 text-sm text-black">
            <div>
              <span className="font-semibold">Order ID: </span>
              <span>{order.orderID}</span>
            </div>
            <div>
              <span className="font-semibold">Date: </span>
              <span>{order.date.substring(0, 10)}</span>
            </div>
          </div>

          {order.status === "Pending" || order.status === "Completed" ? (
            <>
              <div className="flex justify-between px-1 mb-3 text-sm text-black">
                <div>
                  <span className="font-semibold">MOP: </span>
                  <span>{payment?.method}</span>
                </div>
                {payment?.referenceNumber && (
                  <div>
                    <span className="font-semibold">Reference: </span>
                    <span>{payment?.referenceNumber}</span>
                  </div>
                )}
              </div>
            </>
          ) : null}

          <div className="rounded-md p-3 bg-cream text-black">
            <div className="py-1 px-2 rounded-md bg-primaryBrown w-min text-xs text-white mb-2">
              {orderStatusLabel}
            </div>
            <div className="grid grid-cols-[3fr_1fr_1fr_2fr] gap-2 font-semibold mb-3">
              <div className="text-[15px] text-black">Name</div>
              <div className="flex items-center justify-center text-[15px]">
                Price
              </div>
              <div className="flex items-center justify-center text-[15px]">
                Qty
              </div>
              <div className="text-right text-[15px]">Subtotal</div>
            </div>

            {order.orderItems?.map(({ productID, quantity }, itemIndex) => {
              const product = menuData.find(
                (item) => item.productID === productID
              );
              if (!product) return null;

              const subtotal = product.sellingPrice * quantity;

              return (
                <div
                  key={itemIndex}
                  className="grid grid-cols-[3fr_1fr_1fr_2fr] gap-2"
                >
                  <div className="text-sm truncate">{product.productName}</div>
                  <div className="flex justify-center items-center text-[12px]">
                    {product.sellingPrice}
                  </div>
                  <div className="flex justify-center items-center text-[12px]">
                    {quantity}
                  </div>
                  <div className="text-right text-[12px] font-bold">
                    &#8369; {subtotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {type === "payment" && (
            <div className="w-[320px] bg-cream rounded-md mt-1 px-3 py-1 grid grid-cols-[3fr_1fr_1fr_2fr] gap-2 text-black">
              <div className="text-sm">Discount </div>
              <div></div>
              <div></div>
              <div className="text-right text-[12px]">
                &#8369; {discountAmount?.toFixed(2)}
              </div>
            </div>
          )}

          {type === "management" &&
            order.paymentID &&
            payment?.discountType && (
              <div className="w-[320px] bg-cream rounded-md mt-1 px-3 py-1 flex justify-between text-black">
                <div className="text-sm">Discount ({payment.discountType})</div>
                <div className="text-right text-[12px]">
                  &#8369; {payment.discountAmount}
                </div>
              </div>
            )}

          <div className="w-[320px] bg-cream rounded-md mt-1 px-3 py-1 grid grid-cols-[3fr_1fr_1fr_2fr] gap-2 text-black">
            <div className="text-sm">Total</div>
            <div></div>
            <div></div>
            <div className="text-right text-[12px] font-bold">
              &#8369; {total.toFixed(2)}
            </div>
          </div>

          {type === "management" && (
            <>
              {order.status === "Unpaid" && (
                <div className="flex flex-col">
                  <div>
                    <Link
                      href={{
                        pathname: "/payment-details",
                        query: { order: JSON.stringify(order) },
                      }}
                    >
                      <button className="px-2 py-1 rounded-md mt-1 float-right text-xs w-[130px] h-[28px] font-semibold bg-tealGreen text-white hover:text-tealGreen hover:bg-white hover:border hover:border-tealGreen duration-200">
                        Confirm Payment
                      </button>
                    </Link>
                  </div>
                  <div>
                    <button
                      className="px-2 py-1 rounded-md mt-1 mb-5 float-right text-xs w-[130px] h-[28px] font-semibold border border-red bg-white text-red hover:text-white hover:bg-red hover:border duration-200"
                      onClick={handleCancelOrder}
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}

              {order.status === "Pending" && (
                <div className="flex flex-col float-right">
                  <button
                    className="px-2 py-1 rounded-md mt-1 float-right text-xs w-[130px] h-[28px] font-semibold bg-tealGreen text-white"
                    onClick={handleCompleteOrder}
                  >
                    Complete Order
                  </button>

                  <button
                    className="px-2 py-1 rounded-md mt-1 mb-5 float-right text-xs w-[130px] h-[28px] font-semibold border border-red bg-white text-red hover:text-white hover:bg-red hover:border duration-200"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </button>
                </div>
              )}

              {order.status === "Completed" && (
                <div>
                  <button
                    className="px-2 py-1 rounded-md mt-1 mb-5 float-right text-xs w-[130px] h-[28px] font-semibold border border-red bg-white text-red hover:text-white hover:bg-red hover:border duration-200"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  }
);

OrderManagementCard.displayName = "OrderManagementCard";

export default OrderManagementCard;
