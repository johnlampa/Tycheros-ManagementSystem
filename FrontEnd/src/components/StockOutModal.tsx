import React, { useEffect, useState } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import {
  InventoryItem,
  MultiItemStockOutData,
} from "../../lib/types/InventoryItemDataTypes"; // Assuming your type for multi-item stock out
import ValidationDialog from "@/components/ValidationDialog"; // Importing your ValidationDialog for validation messages
import { WiDirectionDown } from "react-icons/wi";
import { FaTrashAlt } from "react-icons/fa";

interface StockOutModalProps {
  stockOutData: MultiItemStockOutData;
  setStockOutData: (data: MultiItemStockOutData) => void;
  handleStockOut: () => Promise<void>;
  onClose: () => void;
  inventoryNames: { inventoryID: number; inventoryName: string }[];
  handleInventoryChange: (inventoryID: number, index: number) => void;
  employees: { employeeID: number; firstName: string; lastName: string }[];
}

const StockOutModal: React.FC<StockOutModalProps> = ({
  stockOutData,
  setStockOutData,
  handleStockOut,
  onClose,
  inventoryNames,
  handleInventoryChange,
  employees,
}) => {
  const [inventoryItems, setInventoryItems] = useState(
    stockOutData.inventoryItems.map((item) => ({
      ...item,
      expanded: true, // Expanding item details by default
    }))
  );

  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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

  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const addInventoryItem = () => {
    setInventoryItems([
      ...inventoryItems,
      {
        inventoryID: 0,
        quantityToStockOut: 0,
        reason: "",
        expanded: true,
      },
    ]);
  };

  const handleDeleteInventoryItem = (index: number) => {
    setInventoryItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const toggleExpandItem = (index: number) => {
    const newInventoryItems = [...inventoryItems];
    newInventoryItems[index].expanded = !newInventoryItems[index].expanded;
    setInventoryItems(newInventoryItems);
  };

  const updateInventoryItem = (index: number, updatedItem: any) => {
    const newInventoryItems = [...inventoryItems];
    newInventoryItems[index] = { ...newInventoryItems[index], ...updatedItem };
    setInventoryItems(newInventoryItems);
    setStockOutData({ ...stockOutData, inventoryItems: newInventoryItems });
  };

  const validateForm = () => {
    const missingFields: string[] = [];
    const quantityExceedsFields: string[] = [];
    const processedInventoryIDs = new Set<number>();

    // Validate general fields
    if (
      !stockOutData.stockOutDateTime ||
      stockOutData.stockOutDateTime.trim() === ""
    ) {
      missingFields.push("Stock Out Date");
    }

    // Aggregate quantities for each inventoryID
    const aggregatedQuantities = inventoryItems.reduce(
      (acc, item) => {
        if (item.inventoryID) {
          acc[item.inventoryID] =
            (acc[item.inventoryID] || 0) + item.quantityToStockOut;
        }
        return acc;
      },
      {} as { [key: number]: number }
    );

    // Validate each inventory item
    inventoryItems.forEach((item, index) => {
      const inventory = inventoryData.find(
        (inv) => inv.inventoryID === item.inventoryID
      );
      const inventoryName =
        inventoryNames.find((inv) => inv.inventoryID === item.inventoryID)
          ?.inventoryName || `Item ${index + 1}`;

      if (!item.inventoryID || item.inventoryID === 0) {
        missingFields.push(`Inventory Name for ${inventoryName}`);
      }

      if (item.quantityToStockOut <= 0) {
        missingFields.push(`Quantity for ${inventoryName}`);
      }

      // Check if aggregated quantity exceeds the available total and avoid duplicate messages
      if (
        inventory &&
        aggregatedQuantities[item.inventoryID] > inventory.totalQuantity &&
        !processedInventoryIDs.has(item.inventoryID)
      ) {
        quantityExceedsFields.push(
          `Total quantity for ${inventoryName} exceeds available total (${inventory.totalQuantity}).`
        );
        processedInventoryIDs.add(item.inventoryID); // Mark this inventoryID as processed
      }
    });

    if (missingFields.length > 0 || quantityExceedsFields.length > 0) {
      setValidationMessage(
        `Please address the following issues:\n${missingFields
          .concat(quantityExceedsFields)
          .join("\n")}`
      );
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      console.log("Stock Out Data:", inventoryItems);
      await handleStockOut();
      onClose(); // Close the modal after submission
    }
  };

  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(1);
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (loggedInEmployeeID) {
        setLoggedInEmployeeID(parseInt(loggedInEmployeeID));
      }
    }

    if (loggedInEmployeeID) {
      setStockOutData({
        ...stockOutData,
        employeeID: loggedInEmployeeID.toString(),
      });

      // Find employee with matching ID
      const employee = employees.find(
        (emp) => emp.employeeID === loggedInEmployeeID
      );

      if (employee) {
        // Set the employee's name in state
        setLoggedInEmployeeName(employee.lastName + ", " + employee.firstName);
      }
    }
  }, [employees, loggedInEmployeeID]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg w-96 max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-black">Stock Out</h2>
          <div className="flex items-center">
            Date: {stockOutData.stockOutDateTime}
          </div>
        </div>

        <div className="mb-3">
          Employee: {loggedInEmployeeName || "No employee found."}
        </div>

        {inventoryItems.map((item, index) => (
          <div key={index} className="mb-4 p-2 border border-black bg-cream">
            <div className="flex justify-between items-center">
              <select
                value={item.inventoryID}
                onChange={(e) => {
                  const newInventoryID = parseInt(e.target.value);
                  handleInventoryChange(newInventoryID, index); // Update the inventory item selection
                  updateInventoryItem(index, { inventoryID: newInventoryID });
                }}
                className="mb-2 mt-2 p-2 w-full text-black border border-black"
              >
                <option value="0" disabled>
                  Select Inventory Item
                </option>
                {inventoryNames.map((inv) => (
                  <option key={inv.inventoryID} value={inv.inventoryID}>
                    {inv.inventoryName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleDeleteInventoryItem(index)}
                className="text-black ml-4"
              >
                <FaTrashAlt />
              </button>

              <button onClick={() => toggleExpandItem(index)} className="ml-2">
                {item.expanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </button>
            </div>

            {item.expanded && (
              <div>
                <div className="mb-2">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={
                      item.quantityToStockOut === 0
                        ? ""
                        : item.quantityToStockOut
                    }
                    min="0"
                    onChange={(e) =>
                      updateInventoryItem(index, {
                        quantityToStockOut: parseInt(e.target.value) || 0, // Ensure it updates correctly
                      })
                    }
                    className="p-2 w-full text-black border border-black"
                  />
                </div>

                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Reason"
                    value={item.reason}
                    onChange={(e) =>
                      updateInventoryItem(index, { reason: e.target.value })
                    }
                    className="p-2 w-full text-black border border-black"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addInventoryItem}
          className="bg-tealGreen text-black py-2 px-4 rounded mb-4 w-full"
        >
          Add Inventory Item
        </button>

        <div className="flex justify-between">
          <button
            onClick={handleSubmit}
            className="bg-tealGreen text-black py-2 px-4 rounded"
          >
            Stock Out
          </button>
          <button
            onClick={onClose}
            className="bg-tealGreen text-black py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>

      {validationMessage && (
        <ValidationDialog
          message={validationMessage}
          onClose={() => setValidationMessage(null)}
        />
      )}
    </div>
  );
};

export default StockOutModal;
