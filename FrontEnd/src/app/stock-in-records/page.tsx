"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import StockInRecordCard from "@/components/ui/StockInRecordCard";

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
  const [stockInData, setStockInData] = useState<StockIn[]>([
    {
      purchaseOrderID: 1,
      stockInDateTime: "2024-11-02 16:41:51",
      employeeFirstName: "Agustine",
      employeeLastName: "Salcedo",
      supplierName: "Apple",
      purchaseOrderItems: [
        {
          purchaseOrderItemName: "Apple",
          pricePerPOUoM: 150,
          unitOfMeasurement: "dozens",
          expiryDate: "2024-12-02",
          quantityOrdered: 3,
        },
        {
          purchaseOrderItemName: "Banana",
          pricePerPOUoM: 150,
          unitOfMeasurement: "dozens",
          expiryDate: "2024-12-02",
          quantityOrdered: 1,
        },
      ],
    },
    {
      purchaseOrderID: 1,
      stockInDateTime: "2024-11-02 16:41:51",
      employeeFirstName: "John Kyle",
      employeeLastName: "Lampa",
      supplierName: "Appler",
      purchaseOrderItems: [
        {
          purchaseOrderItemName: "Apple",
          pricePerPOUoM: 150,
          unitOfMeasurement: "dozens",
          expiryDate: "2024-12-02",
          quantityOrdered: 2,
        },
        {
          purchaseOrderItemName: "Banana",
          pricePerPOUoM: 150,
          unitOfMeasurement: "dozens",
          expiryDate: "2024-12-02",
          quantityOrdered: 3,
        },
      ],
    },
    {
      purchaseOrderID: 1,
      stockInDateTime: "2024-11-02 16:41:51",
      employeeFirstName: "John Kyle",
      employeeLastName: "Lampa",
      supplierName: "Applest",
      purchaseOrderItems: [
        {
          purchaseOrderItemName: "Apple",
          pricePerPOUoM: 150,
          unitOfMeasurement: "dozens",
          expiryDate: "2024-12-02",
          quantityOrdered: 3,
        },
        {
          purchaseOrderItemName: "Banana",
          pricePerPOUoM: 150,
          unitOfMeasurement: "dozens",
          expiryDate: "2024-12-02",
          quantityOrdered: 3,
        },
      ],
    },
  ]);

  // useEffect(() => {
  //   fetch("http://localhost:8081/inventoryManagement/getStockInRecords")
  //     .then((response) => response.json())
  //     .then((data) => setStockInData(data))
  //     .catch((error) => console.error("Error fetching menu data:", error));
  // }, []);

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        <Header text="Stock In Records" color={"tealGreen"} type={"orders"}>
          <Link href={"/inventory-management"} className="z-10">
            <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>

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
