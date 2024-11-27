"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import StockInRecordCard from "@/components/ui/StockInRecordCard";
import { GiHamburgerMenu } from "react-icons/gi";
import FlowBiteSideBar from "@/components/FlowBiteSideBar";
import axios from "axios";
import { Employee } from "../../../lib/types/EmployeeDataTypes";
import { format } from "date-fns";

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
  const [employees, setEmployees] = useState<Employee[]>();
  const [sideBarVisibility, setSideBarVisibility] = useState(false);

  const [filterByDate, setFilterByDate] = useState("");
  const [filterByEmployee, setFilterByEmployee] = useState("");
  const [searchBySupplierName, setSearchBySupplierName] = useState("");

  const [unfilteredStockInData, setUnfilteredStockInData] = useState<StockIn[]>(
    []
  );
  const [filteredStockInData, setFilteredStockInData] = useState<StockIn[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Adjust this as needed

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/employeemanagement/getEmployee"
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch data
  useEffect(() => {
    fetch("http://localhost:8081/inventoryManagement/getStockInRecords")
      .then((response) => response.json())
      .then((data) => setUnfilteredStockInData(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = unfilteredStockInData;

      if (searchBySupplierName !== "") {
        filtered = filtered.filter(
          (stockIn) =>
            stockIn.supplierName
              .toLowerCase() // Convert the item name to lowercase
              .startsWith(searchBySupplierName.toLowerCase()) // Check if it starts with the search term
        );
      }

      // Apply date filter if filterByDate has a value
      if (filterByDate) {
        const formattedFilterDate = format(filterByDate, "MM/dd/yyyy");

        filtered = filtered.filter(
          (stockIn) =>
            stockIn.stockInDateTime.substring(0, 10) === formattedFilterDate
        );
      }

      if (filterByEmployee) {
        filtered = filtered.filter((stockIn) => {
          const fullName = `${stockIn.employeeLastName}, ${stockIn.employeeFirstName}`;
          return fullName === filterByEmployee;
        });
      }

      setFilteredStockInData(filtered);
      console.log("unfiltered: ", unfilteredStockInData);
      console.log("filtered: ", filteredStockInData);
      console.log("datefilter: ", filterByDate);
    };

    applyFilters();
  }, [
    searchBySupplierName,
    filterByDate,
    filterByEmployee,
    unfilteredStockInData,
  ]);

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredStockInData.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(filteredStockInData.length / itemsPerPage);

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
        <div className="pb-3 w-full bg-tealGreen px-2 sm:px-5">
          <div className="w-full flex justify-center items-center ">
            <div className="text-xs w-16 md:text-md font-semibold text-white">
              Filters:
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-x-3 sm:gap-y-3">
              <input
                placeholder=""
                type="date"
                id="dateFilter"
                className="rounded-md border border-gray text-sm text-black text-center w-[120px] h-[25px] hidden md:block"
                onChange={(e) => setFilterByDate(e.target.value)}
              ></input>
              <select
                value={filterByEmployee}
                onChange={(e) => setFilterByEmployee(e.target.value)}
                className="h-[25px] text-sm w-min text-black rounded-sm px-1"
              >
                <option value="">All Employees</option>
                {employees?.map((emp) => (
                  <option
                    key={emp.employeeID}
                    value={`${emp.lastName}, ${emp.firstName}`}
                  >
                    {`${emp.lastName}, ${emp.firstName}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <input
          type="search"
          placeholder="&#x1F50D; Search Supplier Name"
          className="border border-black py-2 px-3 text-sm rounded w-[320px] mt-5"
          onChange={(e) => setSearchBySupplierName(e.target.value)}
        ></input>

        <div className="flex justify-center items-center md:mt-6 lg:mt-10">
          {filteredStockInData.length === 0 ? (
            <p className="text-sm text-black">No data found</p>
          ) : (
            <div>
              <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:mt-5">
                {currentData.map((item, index) => (
                  <div key={index} className="mt-8 md:mt-0">
                    <StockInRecordCard stockInData={item}></StockInRecordCard>
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
