"use client";
import { createContext, useContext, useState, ReactNode } from "react";

import { Order } from "../types/OrderDataTypes";

type OrderContext = {
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
};

const OrderContext = createContext<OrderContext | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [order, setOrder] = useState<Order>({
    employeeID: 1,
    date: new Date().toISOString(),
    status: "Unpaid",
    orderItems: [],
  });

  return (
    <OrderContext.Provider value={{ order, setOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within a OrderProvider");
  }
  return context;
};
