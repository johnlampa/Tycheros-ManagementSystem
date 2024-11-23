"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  MultiItemStockInData,
  MultiItemStockOutData,
  MultiItemUpdateStockData,
  InventoryItem,
} from "../../../lib/types/InventoryItemDataTypes";
import InventoryItemModal from "@/components/InventoryItemModal";
import StockInModal from "@/components/StockInModal";
import StockOutModal from "@/components/StockOutModal";
import UpdateStockModal from "@/components/UpdateStockModal";
import ValidationDialog from "@/components/ValidationDialog";
import axios from "axios";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import InventoryManagementCard from "@/components/ui/InventoryManagementCard";
import Notification from "@/components/Notification";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import FlowBiteSideBar from "@/components/FlowBiteSideBar";

import { IoIosSearch } from "react-icons/io";

export default function InventoryManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedInventoryID, setSelectedInventoryID] = useState<number | null>(
    null
  );
  const [collapsedRows, setCollapsedRows] = useState<number[]>([]); // State to track which rows are collapsed
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [validationDialogVisible, setValidationDialogVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [status, setStatus] = useState<{ [key: number]: boolean }>({});
  const router = useRouter();

  const [sideBarVisibility, setSideBarVisibility] = useState(false);

  // Ensure the user is logged in before they can access this page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (!loggedInEmployeeID) {
        router.push("/login"); // Redirect to login page if not logged in
      }
    }
  }, [router]);

  const initialItemState = {
    inventoryName: "",
    inventoryCategory: "",
    reorderPoint: 0,
    unitOfMeasurementID: 0,
    inventoryStatus: 1,
  };

  const resetNewItem = () => {
    setNewItem(initialItemState);
  };

  const [newItem, setNewItem] = useState<{
    inventoryName: string;
    inventoryCategory: string;
    unitOfMeasurementID: number; // Define as number here
    reorderPoint: number;
    inventoryStatus: number;
  }>({
    inventoryName: "",
    inventoryCategory: "",
    unitOfMeasurementID: 0, // or null if optional
    reorderPoint: 0,
    inventoryStatus: 1,
  });

  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemToEditID, setItemToEditID] = useState<number>(-1);

  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const [showStockInOverlay, setShowStockInOverlay] = useState(false);
  const [stockInData, setStockInData] = useState<MultiItemStockInData>({
    supplierName: "",
    employeeID: "",
    stockInDateTime: new Date().toISOString().split("T")[0],
    inventoryItems: [
      {
        inventoryID: 0,
        quantityOrdered: 0,
        pricePerPOUoM: 0,
        unitOfMeasurementID: 0,
        expiryDate: "",
      },
    ],
  });

  const [showStockOutOverlay, setShowStockOutOverlay] = useState(false);
  const [stockOutData, setStockOutData] = useState<MultiItemStockOutData>({
    employeeID: "",
    stockOutDateTime: new Date().toISOString().split("T")[0],
    inventoryItems: [
      {
        inventoryID: 0,
        quantityToStockOut: 0,
        reason: "",
      },
    ],
  });

  const [uomOptions, setUomOptions] = useState<{ [key: number]: any[] }>({});

  // Fetches UoMs based on the category of the selected inventory item
  const fetchUoMsByCategory = async (
    inventoryID: number,
    itemIndex: number
  ) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/inventoryManagement/getUoMsByCategory/${inventoryID}`
      );
      console.log(
        `Fetched UoMs for inventoryID ${inventoryID}:`,
        response.data
      ); // Log fetched data

      setUomOptions((prevOptions) => ({
        ...prevOptions,
        [itemIndex]: response.data, // Update UoMs for the specific item index
      }));
    } catch (error) {
      console.error("Error fetching UoMs by category:", error);
    }
  };

  // Updates inventory item and fetches UoMs if the item changes
  const handleInventoryChange = (inventoryID: number, index: number) => {
    console.log(
      `handleInventoryChange called with inventoryID ${inventoryID} for index ${index}`
    );
    const updatedItems = stockInData.inventoryItems.map((item, idx) =>
      idx === index ? { ...item, inventoryID, unitOfMeasurementID: 0 } : item
    );
    setStockInData({ ...stockInData, inventoryItems: updatedItems });
    fetchUoMsByCategory(inventoryID, index); // Fetch UoMs by category for this item
    console.log("Updated uomOptions after fetching:", uomOptions);
  };

  const [employees, setEmployees] = useState<
    { employeeID: number; firstName: string; lastName: string }[]
  >([]);

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

  const [showUpdateStockOverlay, setShowUpdateStockOverlay] = useState(false);

  const [updateStockData, setUpdateStockData] =
    useState<MultiItemUpdateStockData>({
      employeeID: "",
      updateStockDateTime: new Date().toISOString().split("T")[0],
      inventoryItems: [
        {
          inventoryID: 0,
          subinventoryID: 0,
          quantityToUpdate: 0,
        },
      ],
    });

  //@adgramirez revise so it accommodates updating multiple stocks
  const handleUpdateStockSubmit = async () => {
    console.log(updateStockData);

    try {
      const response = await fetch(
        "http://localhost:8081/inventoryManagement/updateSubinventoryQuantity",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateStockData),
        }
      );

      if (response.ok) {
        alert("Stock updated successfully");
        const updatedInventory = await fetch(
          "http://localhost:8081/inventoryManagement/getInventoryItem"
        ).then((res) => res.json());
        setUnfilteredInventoryData(updatedInventory);
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert("Error: " + errorData.message);
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Error updating stock");
    }
  };

  const [inventoryNames, setInventoryNames] = useState<
    { inventoryID: number; inventoryName: string }[]
  >([]);
  useEffect(() => {
    const fetchInventoryNames = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/inventoryManagement/getInventoryName"
        );
        setInventoryNames(response.data);
      } catch (error) {
        console.error("Error fetching inventory names:", error);
      }
    };

    fetchInventoryNames();
  }, []);

  const handleStockIn = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/inventoryManagement/stockInInventoryItem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockInData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to stock in item");
      }

      const updatedInventory = await fetch(
        "http://localhost:8081/inventoryManagement/getInventoryItem"
      ).then((res) => res.json());
      setUnfilteredInventoryData(updatedInventory);

      alert("Item stocked in successfully");

      // Reset data only after successful stock-in
      setStockInData({
        supplierName: "",
        employeeID: "",
        stockInDateTime: "",
        inventoryItems: [
          {
            inventoryID: 0,
            quantityOrdered: 0,
            pricePerPOUoM: 0,
            unitOfMeasurementID: 0,
            expiryDate: "",
          },
        ],
      });
    } catch (error) {
      console.error("Error stocking in inventory:", error);
    }
  };

  //TO EDIT
  const handleStockOut = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/inventoryManagement/stockOutInventoryItem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockOutData),
        }
      );

      if (response.ok) {
        alert("Stock-out recorded successfully");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert("Error: " + errorData.message);
      }
    } catch (err) {
      console.error("Error during stock-out:", err);
      alert("Error during stock-out");
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Adjust this as needed

  const [filterByCategory, setFilterByCategory] = useState("");
  const [filterByStatus, setFilterByStatus] = useState<number | null>(null);
  const [filterByStockCount, setFilterByStockCount] = useState({
    lowStock: false,
    noStock: false,
  });

  const [searchByName, setSearchByName] = useState("");

  const [unfilteredInventoryData, setUnfilteredInventoryData] = useState<
    InventoryItem[]
  >([]);
  const [filteredInventoryData, setFilteredInventoryData] = useState<
    InventoryItem[]
  >([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/inventoryManagement/getInventoryItem"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: InventoryItem[] = await response.json();
        setUnfilteredInventoryData(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = unfilteredInventoryData;

      if (searchByName !== "") {
        filtered = filtered.filter(
          (inventoryItem) =>
            inventoryItem.inventoryName
              .toLowerCase() // Convert the item name to lowercase
              .startsWith(searchByName.toLowerCase()) // Check if it starts with the search term
        );
      }

      if (filterByStatus !== null) {
        filtered = filtered.filter(
          (inventoryItem) => inventoryItem.inventoryStatus === filterByStatus
        );
      }

      if (filterByCategory) {
        filtered = filtered.filter(
          (inventoryItem) =>
            inventoryItem.inventoryCategory === filterByCategory
        );
      }

      if (filterByStockCount.noStock || filterByStockCount.lowStock) {
        filtered = filtered.filter((inventoryItem) => {
          const totalQuantity = Number(inventoryItem.totalQuantity);
          const reorderPoint = Number(inventoryItem.reorderPoint);

          // Handle "no stock" and "low stock" independently
          const isNoStock = filterByStockCount.noStock && totalQuantity === 0;
          const isLowStock =
            filterByStockCount.lowStock &&
            totalQuantity <= reorderPoint &&
            totalQuantity !== 0;

          // Keep the item if either condition is true
          return isNoStock || isLowStock;
        });
      }

      console.log("unfiltered inv data: ", unfilteredInventoryData);

      setFilteredInventoryData(filtered);
    };

    applyFilters();
  }, [
    searchByName,
    filterByCategory,
    filterByStatus,
    filterByStockCount,
    unfilteredInventoryData,
  ]);

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredInventoryData.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(filteredInventoryData.length / itemsPerPage);

  // Handle page navigation
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddItem = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/inventoryManagement/postInventoryItem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add inventory item");
      }

      setSuccessMessage(`Successfully added: ${newItem.inventoryName}`);

      // Fetch updated inventory data as before
      setNewItem(initialItemState);
      const updatedInventory = await fetch(
        "http://localhost:8081/inventoryManagement/getInventoryItem"
      ).then((res) => res.json());
      setUnfilteredInventoryData(updatedInventory);
    } catch (error) {
      console.error("Error adding inventory item:", error);
    }
  };

  const handleEditItem = async (id: number) => {
    const item = filteredInventoryData.find((item) => item.inventoryID === id);
    if (item) {
      setItemToEdit(item);
      setItemToEditID(item.inventoryID);
      setShowEditOverlay(true);
      console.log("page, item.inventoryID: ", item.inventoryID);
    } else {
      alert("Item not found");
    }
  };

  const handleSaveChanges = async () => {
    if (itemToEdit) {
      try {
        const response = await fetch(
          `http://localhost:8081/inventoryManagement/putInventoryItem/${itemToEdit.inventoryID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...itemToEdit,
              inventoryStatus: itemToEdit.inventoryStatus ? 1 : 0, // Save status as 1 (active) or 0 (inactive)
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update inventory item");
        }

        const updatedInventory = await fetch(
          "http://localhost:8081/inventoryManagement/getInventoryItem"
        ).then((res) => res.json());
        setUnfilteredInventoryData(updatedInventory);

        setShowEditOverlay(false);
        alert("Inventory item updated successfully");
      } catch (error) {
        console.error("Error updating inventory item:", error);
      }
    }
  };

  const [detailedData, setDetailedData] = useState<{ [key: number]: any }>({}); // Store details for each inventoryID

  const [expandedRow, setExpandedRow] = useState<number | null>(null); // Track the expanded row

  const toggleRow = async (inventoryID: number) => {
    if (expandedRow === inventoryID) {
      // Collapse the currently expanded row
      setExpandedRow(null);
    } else {
      // Expand the selected row and fetch details if not already fetched
      if (!detailedData[inventoryID]) {
        try {
          const response = await axios.get(
            `http://localhost:8081/inventoryManagement/getInventoryItemDetails/${inventoryID}`
          );
          setDetailedData((prev) => ({
            ...prev,
            [inventoryID]: response.data,
          }));
        } catch (error) {
          console.error(
            `Error fetching details for inventory ID ${inventoryID}:`,
            error
          );
        }
      }
      setExpandedRow(inventoryID); // Set the clicked row as the expanded one
    }
  };

  const handleRadioChange = (inventoryID: number) => {
    setSelectedInventoryID(inventoryID);
  };

  const handleValidationDialogClose = () => {
    setValidationDialogVisible(false); // Close the dialog when the user clicks "OK"
  };

  const handleStatusToggle = async (
    inventoryID: number,
    newStatus: boolean
  ) => {
    const updatedStatus = newStatus ? 1 : 0;
    try {
      await axios.put(
        `http://localhost:8081/inventoryManagement/updateStatus/${inventoryID}`,
        {
          inventoryStatus: updatedStatus,
        }
      );

      setUnfilteredInventoryData((prevData) =>
        prevData.map((item) =>
          item.inventoryID === inventoryID
            ? { ...item, inventoryStatus: updatedStatus }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating inventory status:", error);
      alert("Failed to update inventory status");
    }
  };

  const [unitOfMeasurements, setUnitOfMeasurements] = useState<
    { unitOfMeasurementID: number; UoM: string }[]
  >([]);
  useEffect(() => {
    // Fetch UoM data
    const fetchUnitOfMeasurements = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/inventoryManagement/getReferenceUnits"
        );
        setUnitOfMeasurements(response.data);
      } catch (error) {
        console.error("Error fetching units of measurement:", error);
      }
    };

    fetchUnitOfMeasurements();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        <Header text="Inventory" color={"tealGreen"} type={"orders"}>
          <button
            className="mr-3 flex items-center justify-center"
            onClick={() => {
              setSideBarVisibility(true);
            }}
          >
            <GiHamburgerMenu style={{ fontSize: "5vh", color: "white" }} />
          </button>
        </Header>
        <div className="pb-3 w-full bg-tealGreen px-2 sm:px-5">
          <div className="w-full flex justify-center items-center">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Filters Label */}
              <div className="text-xs w-16 md:text-md font-semibold text-white flex justify-center">
                Filters:
              </div>

              {/* Category Dropdown */}
              <select
                value={filterByCategory}
                onChange={(e) => setFilterByCategory(e.target.value)}
                className="h-[25px] text-sm w-min text-black rounded-sm px-1"
              >
                <option value="">All Categories</option>
                <option value="Produce">Produce</option>
                <option value="Dairy and Eggs">Dairy and Eggs</option>
                <option value="Meat and Poultry">Meat and Poultry</option>
                <option value="Seafood">Seafood</option>
                <option value="Canned Goods">Canned Goods</option>
                <option value="Dry Goods">Dry Goods</option>
                <option value="Sauces">Sauces</option>
                <option value="Condiments">Condiments</option>
                <option value="Beverages">Beverages</option>
              </select>

              {/* Divider */}
              <div className="text-white hidden md:block mx-3">|</div>

              {/* Stock Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`${
                    filterByStockCount.lowStock
                      ? "bg-white !text-tealGreen font-semibold"
                      : ""
                  } w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center text-sm text-white`}
                  onClick={() =>
                    setFilterByStockCount((prev) => ({
                      ...prev,
                      lowStock: !prev.lowStock,
                    }))
                  }
                >
                  Low Stock
                </div>
                <div
                  className={`${
                    filterByStockCount.noStock
                      ? "bg-white !text-tealGreen font-semibold"
                      : ""
                  } w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center text-sm text-white`}
                  onClick={() =>
                    setFilterByStockCount((prev) => ({
                      ...prev,
                      noStock: !prev.noStock,
                    }))
                  }
                >
                  No Stock
                </div>
              </div>

              {/* Divider */}
              <div className="text-white hidden md:block mx-3">|</div>

              {/* Status Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`${
                    filterByStatus === 1
                      ? "bg-white !text-tealGreen font-semibold"
                      : ""
                  } w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center text-sm text-white`}
                  onClick={() =>
                    setFilterByStatus((prevStatus) =>
                      prevStatus === 1 ? null : 1
                    )
                  }
                >
                  Active
                </div>
                <div
                  className={`${
                    filterByStatus === 0
                      ? "bg-white !text-tealGreen font-semibold"
                      : ""
                  } w-[88px] h-[25px] rounded-sm border border-white flex justify-center items-center text-sm text-white`}
                  onClick={() =>
                    setFilterByStatus((prevStatus) =>
                      prevStatus === 0 ? null : 0
                    )
                  }
                >
                  Inactive
                </div>
              </div>
            </div>
          </div>
        </div>

        {sideBarVisibility && (
          <FlowBiteSideBar
            setSideBarVisibility={setSideBarVisibility}
          ></FlowBiteSideBar>
        )}

        <div className="md:w-[676px] xl:w-[1032px]">
          <div className="p-4 md:hidden">
            <input
              type="search"
              placeholder="&#x1F50D; Search Inventory Name"
              className="border border-black py-2 px-3 text-sm rounded w-full mb-4"
              onChange={(e) => setSearchByName(e.target.value)}
            ></input>

            <div className="w-[320px]">
              <button
                onClick={() => setShowAddOverlay(true)}
                className="bg-tealGreen text-white py-2 px-3 text-sm font-semibold rounded w-full"
              >
                Add Inventory Item
              </button>

              <div className="grid grid-cols-2 gap-x-2 mt-2">
                <button
                  onClick={() => setShowStockInOverlay(true)}
                  className="bg-white border-2 border-tealGreen text-tealGreen py-1 px-3 text-sm font-semibold rounded w-full"
                >
                  Stock In
                </button>

                <button
                  onClick={() => setShowStockOutOverlay(true)}
                  className="bg-white border-2 border-tealGreen text-tealGreen py-1 px-3 text-sm font-semibold rounded w-full"
                >
                  Stock Out
                </button>
              </div>
              <button
                onClick={() => {
                  setShowUpdateStockOverlay(true);
                  // if (inventoryItem?.inventoryID !== null) {
                  //   handleUpdateStock(inventoryItem.inventoryID.toString()); // Use the selected radio button's inventory ID
                  // }
                }}
                className="mt-2 bg-white border-2 border-tealGreen text-tealGreen py-1 px-3 text-sm font-semibold rounded w-full"
              >
                Update Stock
              </button>
            </div>
          </div>
          <div className="hidden w-full md:flex flex-col gap-y-3 mt-10 mb-10">
            <div className="w-full flex justify-end">
              <input
                type="search"
                placeholder="&#x1F50D; Search Inventory Name"
                className="border border-black py-2 px-3 text-sm rounded w-[320px]"
                onChange={(e) => setSearchByName(e.target.value)}
              ></input>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-x-3">
                <button
                  onClick={() => setShowStockInOverlay(true)}
                  className="bg-tealGreen text-white py-2 px-3 text-xs font-semibold rounded w-[92px]"
                >
                  Stock In
                </button>
                <button
                  onClick={() => setShowStockOutOverlay(true)}
                  className="bg-white text-red border-2 border-red border- py-2 px-3  text-xs font-semibold rounded w-[92px]"
                >
                  Stock Out
                </button>
                <button
                  onClick={() => setShowUpdateStockOverlay(true)}
                  className="bg-white text-black border-2 border-black py-2 px-3 text-xs font-semibold rounded w-[111px]"
                >
                  Update Stock
                </button>
              </div>
              <div>
                <button
                  onClick={() => setShowAddOverlay(true)}
                  className="bg-tealGreen text-white border-2 border-tealGreen py-2 px-3 text-sm font-semibold rounded w-[320px]"
                >
                  Add Inventory Item
                </button>
              </div>
            </div>
          </div>

          {filteredInventoryData.length === 0 ? (
            <div className="flex justify-center mt-40">
              <p className="text-sm text-black">No inventory items found</p>
            </div>
          ) : (
            <div>
              <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:mt-5">
                {currentData.map((item) => (
                  <div key={item.inventoryID} className="mt-8 md:mt-0">
                    <InventoryManagementCard
                      inventoryItem={item}
                      handleEditItem={handleEditItem}
                      expandedRow={expandedRow}
                      setExpandedRow={setExpandedRow}
                      toggleRow={toggleRow}
                      detailedData={detailedData}
                      setDetailedData={setDetailedData}
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
        </div>

        {showAddOverlay && (
          <InventoryItemModal
            modalTitle="Add Inventory Item"
            inventoryItemData={newItem}
            setInventoryItemData={setNewItem}
            onSave={async () => {
              await handleAddItem();
              resetNewItem();
              setShowAddOverlay(false);
            }}
            onCancel={() => {
              setShowAddOverlay(false);
              resetNewItem();
            }}
            unitOfMeasurements={unitOfMeasurements} // Pass the fetched data here
          />
        )}

        {showEditOverlay && itemToEdit && (
          <InventoryItemModal
            modalTitle="Edit Inventory Item"
            inventoryItemData={itemToEdit}
            setInventoryItemData={setItemToEdit}
            onSave={async () => {
              await handleSaveChanges();
            }}
            onCancel={() => setShowEditOverlay(false)}
            handleStatusToggle={handleStatusToggle}
            inventoryData={filteredInventoryData}
            itemToEditID={itemToEditID}
            unitOfMeasurements={unitOfMeasurements} // Pass the fetched data here
          />
        )}

        {showStockInOverlay && (
          <>
            {console.log("Passing uomOptions to StockInModal:", uomOptions)}
            <StockInModal
              stockInData={stockInData}
              setStockInData={(data) => {
                setStockInData((prevData) => ({
                  ...prevData,
                  ...data,
                  inventoryItems: data.inventoryItems.map((item) => ({
                    ...item,
                    expiryDate: item.expiryDate
                      ? format(new Date(item.expiryDate), "yyyy-MM-dd")
                      : "",
                  })),
                }));
              }}
              employees={employees}
              inventoryNames={inventoryNames}
              handleStockIn={handleStockIn}
              onClose={() => {
                setShowStockInOverlay(false);
              }}
              handleInventoryChange={handleInventoryChange}
              uomOptions={uomOptions} // Ensure this prop is passed
            />
          </>
        )}

        {showStockOutOverlay && (
          <>
            <StockOutModal
              stockOutData={stockOutData}
              setStockOutData={setStockOutData}
              inventoryNames={inventoryNames}
              handleStockOut={handleStockOut}
              onClose={() => {
                setShowStockOutOverlay(false);
              }}
              handleInventoryChange={handleInventoryChange}
              employees={employees}
            />
          </>
        )}

        {showUpdateStockOverlay && (
          <UpdateStockModal
            updateStockData={updateStockData}
            setUpdateStockData={setUpdateStockData}
            inventoryNames={inventoryNames}
            handleUpdateStock={handleUpdateStockSubmit}
            onClose={() => setShowUpdateStockOverlay(false)}
            handleInventoryChange={handleInventoryChange}
            employees={employees}
          />
        )}

        {validationDialogVisible && (
          <ValidationDialog
            message={validationMessage}
            onClose={handleValidationDialogClose}
          />
        )}

        {successMessage && (
          <Notification
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
      </div>
    </div>
  );
}
