"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  MultiItemStockInData,
  InventoryItem,
} from "../../../lib/types/InventoryItemDataTypes";
import SubitemModal from "@/components/SubitemModal";
import StockInModal from "@/components/StockInModal";
import StockOutModal from "@/components/StockOutModal";
import UpdateStockModal from "@/components/UpdateStockModal";
import ValidationDialog from "@/components/ValidationDialog";
import axios from "axios";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import InventoryManagementCard from "@/components/ui/InventoryManagementCard";

import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function InventoryManagementPage() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
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

  const initialItemState = {
    inventoryName: "",
    inventoryCategory: "",
    reorderPoint: 0,
    unitOfMeasure: "",
    inventoryStatus: 1,
  };

  const resetNewItem = () => {
    setNewItem(initialItemState);
  };

  const [newItem, setNewItem] = useState<{
    inventoryName: string;
    inventoryCategory: string;
    unitOfMeasure: string;
    reorderPoint: number;
    inventoryStatus: number;
  }>({
    inventoryName: "",
    inventoryCategory: "",
    unitOfMeasure: "",
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
    stockInDate: "",
    inventoryItems: [
      {
        inventoryID: 0,
        quantityOrdered: 0,
        actualQuantity: 0,
        pricePerUnit: 0,
        expiryDate: "",
      },
    ],
  });

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
      setInventoryData(updatedInventory);

      alert("Item stocked in successfully");

      // Reset data only after successful stock-in
      setStockInData({
        supplierName: "",
        employeeID: "",
        stockInDate: "",
        inventoryItems: [
          {
            inventoryID: 0,
            quantityOrdered: 0,
            actualQuantity: 0,
            pricePerUnit: 0,
            expiryDate: "",
          },
        ],
      });
    } catch (error) {
      console.error("Error stocking in subitem:", error);
    }
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
  const [updateStockData, setUpdateStockData] = useState({
    inventoryID: "",
    quantity: 0,
  });

  const handleUpdateStock = (inventoryID: string) => {
    // Find the item in inventoryData based on the entered inventoryID
    const item = inventoryData.find(
      (item) => item.inventoryID.toString() === inventoryID
    );

    if (item) {
      // If the item is found, proceed with setting update stock data
      setUpdateStockData({ ...updateStockData, inventoryID });
      setShowUpdateStockOverlay(true);
    } else {
      // If the item is not found, alert the user
      alert("Item not found");
    }
  };

  const handleUpdateStockSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/inventoryManagement/updateSubitemQuantity",
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
        setInventoryData(updatedInventory);
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

  const [showStockOutOverlay, setShowStockOutOverlay] = useState(false);
  const [stockOutData, setStockOutData] = useState({
    inventoryID: 0,
    quantity: 0,
    reason: "",
    stockOutDate: "",
  });

  const handleStockOut = (inventoryID: number) => {
    // Find the item in inventoryData based on the entered inventoryID
    const item = inventoryData.find((item) => item.inventoryID === inventoryID);

    if (item) {
      // If the item is found, proceed with setting stock out data
      setStockOutData({
        ...stockOutData,
        inventoryID,
        stockOutDate: new Date().toISOString().split("T")[0], // Initialize with today's date
      });
      setShowStockOutOverlay(true);
    } else {
      // If the item is not found, alert the user
      alert("Item not found");
    }
  };

  const handleStockOutSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/inventoryManagement/stockOutSubitem",
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
        setInventoryData(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleAddItem = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/inventoryManagement/postSubitem",
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

      setNewItem({
        inventoryName: "",
        inventoryCategory: "",
        unitOfMeasure: "",
        reorderPoint: 0,
        inventoryStatus: 1,
      });

      const updatedInventory = await fetch(
        "http://localhost:8081/inventoryManagement/getInventoryItem"
      ).then((res) => res.json());
      setInventoryData(updatedInventory);
      setShowAddOverlay(false);

      alert("Inventory item added successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error adding inventory item:", error);
    }
  };

  const handleEditItem = async (id: number) => {
    const item = inventoryData.find((item) => item.inventoryID === id);
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
          `http://localhost:8081/inventoryManagement/putSubitem/${itemToEdit.inventoryID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(itemToEdit),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update subitem");
        }

        const updatedInventory = await fetch(
          "http://localhost:8081/inventoryManagement/getInventoryItem"
        ).then((res) => res.json());
        setInventoryData(updatedInventory);

        setShowEditOverlay(false);
        alert("Subitem updated successfully");
      } catch (error) {
        console.error("Error updating subitem:", error);
      }
    }
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      try {
        const response = await fetch(
          `http://localhost:8081/inventoryManagement/deleteSubitem/${itemToDelete.inventoryID}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete subitem");
        }

        const updatedInventory = await fetch(
          "http://localhost:8081/inventoryManagement/getInventoryItem"
        ).then((res) => res.json());
        setInventoryData(updatedInventory);

        setShowDeleteOverlay(false);
        alert("Subitem deleted successfully");
      } catch (error) {
        console.error("Error deleting subitem:", error);
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

      setInventoryData((prevData) =>
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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-[360px] flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        <Header text="Inventory" color={"tealGreen"} type={"orders"}>
          <Link href={"/employee-home"} className="z-100">
            <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>
        <div className="p-4">
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
                onClick={() => {
                  if (selectedInventoryID !== null) {
                    handleStockOut(selectedInventoryID);
                  } else {
                    // Show validation dialog when no item is selected
                    setValidationMessage(
                      "Please select an inventory item to stock out."
                    );
                    setValidationDialogVisible(true);
                  }
                }}
                className="bg-white border-2 border-tealGreen text-tealGreen py-1 px-3 text-sm font-semibold rounded w-full"
              >
                Stock Out
              </button>
            </div>
          </div>
        </div>

        {inventoryData.length === 0 ? (
          <p className="text-sm text-black">No inventory items found</p>
        ) : (
          inventoryData.map((item) => (
            <div className="mb-3" key={item.inventoryID}>
              <InventoryManagementCard
                inventoryItem={item}
                handleEditItem={handleEditItem}
                handleUpdateStock={handleUpdateStock}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
                toggleRow={toggleRow}
                detailedData={detailedData}
                setDetailedData={setDetailedData}
              />
            </div>
          ))
        )}

        {showAddOverlay && (
          <SubitemModal
            modalTitle="Add Inventory Item"
            subitemData={newItem}
            setSubitemData={setNewItem}
            onSave={async () => {
              await handleAddItem();
              resetNewItem();
            }}
            onCancel={() => {
              setShowAddOverlay(false);
              resetNewItem();
            }}
          />
        )}

        {showEditOverlay && itemToEdit && (
          <SubitemModal
            modalTitle="Edit Inventory Item"
            subitemData={itemToEdit}
            setSubitemData={setItemToEdit}
            onSave={async () => {
              await handleSaveChanges();
            }}
            onCancel={() => setShowEditOverlay(false)}
            handleStatusToggle={handleStatusToggle}
            inventoryData={inventoryData}
            itemToEditID={itemToEditID}
          />
        )}

        {showDeleteOverlay && itemToDelete && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-72">
              <h2 className="text-black text-sm">Delete Inventory Item</h2>
              <p className="text-black text-xs">
                Are you sure you want to delete the following item?
              </p>
              <p className="text-black text-xs">
                <strong>ID:</strong> {itemToDelete.inventoryID}
              </p>
              <p className="text-black text-xs">
                <strong>Name:</strong> {itemToDelete.inventoryName}
              </p>
              <p className="text-black text-xs">
                <strong>Category:</strong> {itemToDelete.inventoryCategory}
              </p>
              <p className="text-black text-xs">
                <strong>Reorder Point:</strong> {itemToDelete.reorderPoint}
              </p>
              <p className="text-black text-xs">
                <strong>Unit:</strong> {itemToDelete.unitOfMeasure}
              </p>
              <div className="flex justify-between">
                <button
                  onClick={async () => {
                    await handleDeleteItem();
                    setShowDeleteOverlay(false);
                  }}
                  className="bg-black text-white py-1 px-2 text-xs rounded"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteOverlay(false)}
                  className="bg-black text-white py-1 px-2 text-xs rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showStockInOverlay && (
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
          />
        )}

        {showStockOutOverlay && (
          <StockOutModal
            stockOutData={stockOutData}
            setStockOutData={setStockOutData}
            handleStockOutSubmit={handleStockOutSubmit}
            onClose={() => setShowStockOutOverlay(false)}
            inventoryNames={inventoryNames}
          />
        )}

        {showUpdateStockOverlay && (
          <UpdateStockModal
            updateStockData={updateStockData}
            setUpdateStockData={setUpdateStockData}
            handleUpdateStockSubmit={handleUpdateStockSubmit}
            onClose={() => setShowUpdateStockOverlay(false)}
          />
        )}

        {validationDialogVisible && (
          <ValidationDialog
            message={validationMessage}
            onClose={handleValidationDialogClose}
          />
        )}
      </div>
    </div>
  );
}
