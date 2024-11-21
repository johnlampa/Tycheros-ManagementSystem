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
  const router = useRouter();

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

  const [showStockOutOverlay, setShowStockOutOverlay] = useState(false);
  const [stockOutData, setStockOutData] = useState<MultiItemStockOutData>({
    employeeID: "",
    stockOutDateTime: "",
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
      updateStockDateTime: "",
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
      setInventoryData(updatedInventory);
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
        setInventoryData(updatedInventory);

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
          <Link href={"/employee-home"} className="z-10">
            <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>
        <div className="h-[80px] w-full bg-tealGreen flex justify-center items-center">
          <div className=" grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link href={"/uom-management"}>
              <div
                className={`w-[150px] h-[25px] rounded-sm border-lightTealGreen border-2 flex justify-center items-center shadow-xl hover:bg-[#30594f] duration-200 hover:scale-105 text-md
                font-pattaya text-white`}
              >
                Units of Measurement
              </div>
            </Link>
            <Link href={"/stock-in-records"}>
              <div
                className={`w-[150px] h-[25px] rounded-sm border-lightTealGreen border-2 flex justify-center items-center shadow-xl hover:bg-[#30594f] duration-200 hover:scale-105 text-md
                font-pattaya text-white`}
              >
                Stock In Records
              </div>
            </Link>
            <Link href={"/stock-out-records"}>
              <div
                className={`w-[150px] h-[25px] rounded-sm border-lightTealGreen border-2 flex justify-center items-center shadow-xl hover:bg-[#30594f] duration-200 hover:scale-105 text-md
                font-pattaya text-white`}
              >
                Stock Out Records
              </div>
            </Link>
          </div>
        </div>

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

        {inventoryData.length === 0 ? (
          <p className="text-sm text-black">No inventory items found</p>
        ) : (
          <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:mt-5">
            {inventoryData.map((item) => (
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
        )}

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
            inventoryData={inventoryData}
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
