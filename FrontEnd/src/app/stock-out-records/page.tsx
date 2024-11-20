"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import StockOutRecordCard from "@/components/ui/StockOutRecordCard";

export type StockOut = {
  stockOutDateTime: string;
  employeeFirstName: string;
  employeeLastName: string;
  stockOutItems: {
    stockOutItemName: string;
    reason: string;
    quantity: number;
    unitOfMeasurement: string;
  }[];
};

export default function InventoryManagementPage() {
  const [stockOutData, setStockOutData] = useState<StockOut[]>([
    {
      stockOutDateTime: "2024-11-02 16:41:51",
      employeeFirstName: "Agustine",
      employeeLastName: "Salcedo",
      stockOutItems: [
        {
          stockOutItemName: "Apple",
          reason: "Rotten",
          quantity: 3,
          unitOfMeasurement: "dozens",
        },
        {
          stockOutItemName: "Banana",
          reason: "Production discrepancy",
          quantity: 3,
          unitOfMeasurement: "pcs",
        },
      ],
    },
  ]);

  // useEffect(() => {
  //   fetch("http://localhost:8081/inventoryManagement/getStockOutRecords")
  //     .then((response) => response.json())
  //     .then((data) => setStockOutData(data))
  //     .catch((error) => console.error("Error fetching menu data:", error));
  // }, []);

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        <Header text="Stock Out Records" color={"tealGreen"} type={"orders"}>
          <Link href={"/inventory-management"} className="z-10">
            <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>

        <div className="flex justify-center items-center md:mt-6 lg:mt-12">
          {stockOutData.length === 0 ? (
            <p className="text-sm text-black">No data found</p>
          ) : (
            <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:mt-5">
              {stockOutData.map((item, index) => (
                <div key={index} className="mt-8 md:mt-0">
                  <StockOutRecordCard stockOutData={item}></StockOutRecordCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
