import React, { useEffect, useState } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import {
  InventoryItem,
  MultiItemUpdateStockData,
} from "../../lib/types/InventoryItemDataTypes"; // Assuming your type for multi-item stock out
import ValidationDialog from "@/components/ValidationDialog"; // Importing your ValidationDialog for validation messages
import axios from "axios";

interface UpdateStockModalProps {
  updateStockData: MultiItemUpdateStockData;
  setUpdateStockData: (data: MultiItemUpdateStockData) => void;
  handleUpdateStock: () => Promise<void>;
  onClose: () => void;
  inventoryNames: { inventoryID: number; inventoryName: string }[];
  handleInventoryChange: (inventoryID: number, index: number) => void;
  employees: { employeeID: number; firstName: string; lastName: string }[];
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  updateStockData,
  setUpdateStockData,
  handleUpdateStock,
  onClose,
  inventoryNames,
  handleInventoryChange,
  employees,
}) => {
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

  const updateInventoryItem = (index: number, updatedItem: any) => {
    const newInventoryItems = [...inventoryItems];
    newInventoryItems[index] = { ...newInventoryItems[index], ...updatedItem };
    setInventoryItems(newInventoryItems);
    setUpdateStockData({
      ...updateStockData,
      inventoryItems: newInventoryItems,
    });
    console.log("new inv items: ", newInventoryItems);
  };

  const [inventoryItems, setInventoryItems] = useState(
    updateStockData.inventoryItems.map((item) => ({
      ...item,
      expanded: true, // Expanding item details by default
    }))
  );

  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const addInventoryItem = () => {
    setInventoryItems([
      ...inventoryItems,
      {
        inventoryID: 0,
        subinventoryID: 0,
        quantityToUpdate: 0,
        expanded: true,
      },
    ]);
  };

  const toggleExpandItem = (index: number) => {
    const newInventoryItems = [...inventoryItems];
    newInventoryItems[index].expanded = !newInventoryItems[index].expanded;
    setInventoryItems(newInventoryItems);
  };

  const validateForm = () => {
    const missingFields: string[] = [];

    // Validate general fields
    if (
      !updateStockData.updateStockDateTime ||
      updateStockData.updateStockDateTime.trim() === ""
    ) {
      missingFields.push("> Update Stock Date");
    }

    // Validate each inventory item
    inventoryItems.forEach((item, index) => {
      const inventoryName =
        inventoryNames.find((inv) => inv.inventoryID === item.inventoryID)
          ?.inventoryName || `Item ${index + 1}`;

      if (!item.inventoryID || item.inventoryID === 0) {
        missingFields.push(`Inventory Name for ${inventoryName}`);
      }

      if (item.quantityToUpdate <= 0) {
        missingFields.push(`Quantity for ${inventoryName}`);
      }

      const inventoryItem = inventoryData.find(
        (inv) => inv.inventoryID === item.inventoryID
      );

      if (inventoryItem?.totalQuantity) {
        if (item.quantityToUpdate <= inventoryItem?.totalQuantity) {
          missingFields.push(
            `> Quantity to update for ${inventoryItem?.inventoryName} should be greater than ${inventoryItem?.totalQuantity} ${inventoryItem?.unitOfMeasure}.`
          );
        }
        console.log("chosen inventory item: ", item);
        console.log("matching inventory item", inventoryItem);
        console.log("total quantity: ", inventoryItem?.totalQuantity);
      }
    });

    if (missingFields.length > 0) {
      setValidationMessage(
        `Please address the following:\n\n${missingFields.join("\n")}`
      );
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      console.log("Update Data:", inventoryItems);
      await handleUpdateStock();
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
      setUpdateStockData({
        ...updateStockData,
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

  const [selectedInventories, setSelectedInventories] = useState<number[]>([]);
  const [detailedData, setDetailedData] = useState<{ [key: number]: any }>({}); // Store details for each inventoryID

  // Function to fetch detailed data for a selected inventory item
  const populateDetailedData = async (inventoryID: number) => {
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
  };

  const updateSelectedInventories = (index: number, newInventoryID: number) => {
    setSelectedInventories((prev) => {
      const updated = [...prev];
      updated[index] = newInventoryID; // Update the inventory selection at the specified index
      return updated;
    });
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg w-96 max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-black">Update Stock</h2>
          <div className="flex items-center">
            <label htmlFor="updateStockDate" className="text-black mr-2">
              Date:
            </label>
            <input
              type="date"
              id="updateStockDate"
              onChange={(e) => {
                const newValue = e.target.value;
                setUpdateStockData({
                  ...updateStockData,
                  updateStockDateTime: newValue,
                });
              }}
              defaultValue={new Date().toISOString().split("T")[0]} // Sets to current date in 'YYYY-MM-DD' format
              className="p-2 text-black border border-black"
            />
          </div>
        </div>
        <div className="mb-3 text-black">
          Employee: {loggedInEmployeeName || "No employee found."}
        </div>

        {inventoryItems.map((item, index) => (
          <div key={index} className="mb-4 p-2 border border-black bg-cream">
            <div className="flex justify-between items-center text-black">
              <div>Inventory Item</div>
              <button onClick={() => toggleExpandItem(index)}>
                {item.expanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </button>
            </div>
            <select
              value={item.inventoryID}
              onChange={(e) => {
                const newInventoryID = parseInt(e.target.value);
                handleInventoryChange(newInventoryID, index); // Update the inventory item selection
                updateInventoryItem(index, { inventoryID: newInventoryID });
                updateSelectedInventories(index, newInventoryID); // Update selected inventories
                populateDetailedData(newInventoryID); // Fetch detailed data
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
            {item.expanded && (
              <div className="text-black">
                <div className="mb-2">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={
                      item.quantityToUpdate === 0 ? "" : item.quantityToUpdate
                    }
                    min="0"
                    onChange={(e) =>
                      updateInventoryItem(index, {
                        quantityToUpdate: parseInt(e.target.value) || 0, // Ensure it updates correctly
                      })
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
            Update Stock
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

export default UpdateStockModal;
