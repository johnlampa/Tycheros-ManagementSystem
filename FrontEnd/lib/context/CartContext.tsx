"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { OrderItemDataTypes } from "../types/OrderDataTypes";

type CartContextType = {
  cart: OrderItemDataTypes[];
  setCart: React.Dispatch<React.SetStateAction<OrderItemDataTypes[]>>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<OrderItemDataTypes[]>([]);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};
