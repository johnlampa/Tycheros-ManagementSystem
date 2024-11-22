"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import StockInRecordCard from "@/components/ui/StockInRecordCard";
import { GiHamburgerMenu } from "react-icons/gi";
import FlowBiteSideBar from "@/components/FlowBiteSideBar";

export type StockIn = {
  purchaseOrderID: number;
  stockInDateTime: string;
  employeeFirstName: string;
  employeeLastName: string;
  supplierName: string;
  purchaseOrderItems: {
    purchaseOrderItemName: string;
    pricePerPOUoM: number;
    unitOfMeasurement: string;
    expiryDate: string;
    quantityOrdered: number;
  }[];
};

export default function InventoryManagementPage() {
  const [stockInData, setStockInData] = useState<StockIn[]>([]);
  const [sideBarVisibility, setSideBarVisibility] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8081/inventoryManagement/getStockInRecords")
      .then((response) => response.json())
      .then((data) => setStockInData(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        <Header text="Stock In Records" color={"tealGreen"} type={"orders"}>
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

        <div className="flex justify-center items-center md:mt-6 lg:mt-12">
          {stockInData.length === 0 ? (
            <p className="text-sm text-black">No data found</p>
          ) : (
            <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:mt-5">
              {stockInData.map((item, index) => (
                <div key={index} className="mt-8 md:mt-0">
                  <StockInRecordCard stockInData={item}></StockInRecordCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
