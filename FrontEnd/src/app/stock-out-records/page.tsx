"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import StockOutRecordCard from "@/components/ui/StockOutRecordCard";
import { GiHamburgerMenu } from "react-icons/gi";
import FlowBiteSideBar from "@/components/FlowBiteSideBar";

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
  const [stockOutData, setStockOutData] = useState<StockOut[]>([]);
  const [sideBarVisibility, setSideBarVisibility] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Adjust this as needed

  // Fetch data
  useEffect(() => {
    fetch("http://localhost:8081/inventoryManagement/getStockOutRecords")
      .then((response) => response.json())
      .then((data) => setStockOutData(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = stockOutData.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(stockOutData.length / itemsPerPage);

  // Handle page navigation
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        <Header text="Stock Out Records" color={"tealGreen"} type={"orders"}>
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
          {stockOutData.length === 0 ? (
            <p className="text-sm text-black">No data found</p>
          ) : (
            <div>
              <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:mt-5">
                {currentData.map((item, index) => (
                  <div key={index} className="mt-8 md:mt-0">
                    <StockOutRecordCard
                      stockOutData={item}
                    ></StockOutRecordCard>
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
        </div>
      </div>
    </div>
  );
}
