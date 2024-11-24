import React, { useEffect, useState } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { format } from "date-fns";
import { MultiItemStockInData } from "../../lib/types/InventoryItemDataTypes";
import ValidationDialog from "@/components/ValidationDialog";
import { FaTrashAlt } from "react-icons/fa";

interface StockInModalProps {
  stockInData: MultiItemStockInData;
  setStockInData: (data: MultiItemStockInData) => void;
  employees: { employeeID: number; firstName: string; lastName: string }[];
  inventoryNames: { inventoryID: number; inventoryName: string }[];
  handleStockIn: () => Promise<void>;
  onClose: () => void;
  handleInventoryChange: (inventoryID: number, index: number) => void;
  uomOptions: { [key: number]: any[] };
}

const StockInModal: React.FC<StockInModalProps> = ({
  stockInData,
  setStockInData,
  employees,
  inventoryNames,
  handleStockIn,
  onClose,
  handleInventoryChange,
  uomOptions,
}) => {
  console.log("uomOptions in StockInModal:", uomOptions);
  const [inventoryItems, setInventoryItems] = useState(
    stockInData.inventoryItems.map((item) => ({
      ...item,
      expiryDate:
        typeof item.expiryDate === "string"
          ? item.expiryDate
          : format(item.expiryDate, "yyyy-MM-dd"),
      expanded: true,
    }))
  );

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
      setStockInData({
        ...stockInData,
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

  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  ); // For dialog visibility

  const addInventoryItem = () => {
    setInventoryItems([
      ...inventoryItems,
      {
        inventoryID: 0,
        quantityOrdered: 0,
        pricePerPOUoM: 0,
        unitOfMeasurementID: 0,
        expiryDate: format(new Date(), "yyyy-MM-dd"),
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
    setStockInData({ ...stockInData, inventoryItems: newInventoryItems });
  };

  const updateAllInventoryItems = (updatedData: any) => {
    const newInventoryItems = inventoryItems.map((item) => ({
      ...item,
      ...updatedData,
    }));
    setInventoryItems(newInventoryItems);
    setStockInData({ ...stockInData, inventoryItems: newInventoryItems });
  };

  const validateForm = () => {
    const missingFields: string[] = [];

    // Validate stockInData fields
    if (!stockInData.stockInDateTime) {
      missingFields.push("Stock In Date");
    }

    if (!stockInData.supplierName || stockInData.supplierName.trim() === "") {
      missingFields.push("Supplier Name");
    }

    if (!stockInData.employeeID) {
      missingFields.push("Employee");
    }

    // Validate each inventory item
    inventoryItems.forEach((item, index) => {
      const inventoryName =
        inventoryNames.find((inv) => inv.inventoryID === item.inventoryID)
          ?.inventoryName || `Item ${index + 1}`;

      if (!item.inventoryID || item.inventoryID === 0) {
        missingFields.push(`Inventory Name: ${inventoryName}`);
      }

      if (item.quantityOrdered <= 0) {
        missingFields.push(`Quantity Ordered for ${inventoryName}`);
      }

      if (!item.unitOfMeasurementID || item.unitOfMeasurementID === 0) {
        missingFields.push(`UoM for ${inventoryName}`);
      }

      if (!item.pricePerPOUoM || item.pricePerPOUoM <= 0) {
        missingFields.push(`Price Per PO UoM for ${inventoryName}`);
      }

      if (!item.expiryDate || item.expiryDate.trim() === "") {
        missingFields.push(`Expiry Date for ${inventoryName}`);
      }
    });

    if (missingFields.length > 0) {
      setValidationMessage(
        `Please fill out the following:\n${missingFields.join("\n")}`
      );
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      console.log("Stock In Data:", inventoryItems);
      console.log("Stock In DateTime:", stockInData.stockInDateTime);
      await handleStockIn();
      onClose();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg w-96 max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-black">Stock In</h2>
          <div className="flex items-center text-black">
            Date: {stockInData.stockInDateTime}
          </div>
        </div>
        <div>
          <div className="mb-3 text-black">
            Employee: {loggedInEmployeeName || "No employee found."}
          </div>
          <input
            type="text"
            placeholder="Supplier Name"
            value={stockInData.supplierName}
            onChange={(e) => {
              const newValue = e.target.value;
              setStockInData({ ...stockInData, supplierName: newValue });
            }}
            className="mb-2 p-2 w-full text-black border border-black rounded"
          />

          {inventoryItems.map((item, index) => (
            <div
              key={index}
              className="inventoryItem mb-4 border border-black bg-cream p-2 rounded"
            >
              <div className="flex justify-between items-center">
                <select
                  value={item.inventoryID}
                  onChange={(e) => {
                    const newInventoryID = parseInt(e.target.value);
                    updateInventoryItem(index, { inventoryID: newInventoryID });
                    handleInventoryChange(newInventoryID, index); // Call handleInventoryChange after updating
                  }}
                  className="mb-2 mt-2 p-2 w-full text-black border border-black rounded"
                >
                  <option value="0" disabled>
                    Select Item
                  </option>
                  {inventoryNames.map((inventory) => (
                    <option
                      key={inventory.inventoryID}
                      value={inventory.inventoryID}
                    >
                      {inventory.inventoryName}
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

                <button
                  onClick={() => toggleExpandItem(index)}
                  className="ml-2"
                >
                  {item.expanded ? (
                    <IoIosArrowUp className="text-black" />
                  ) : (
                    <IoIosArrowDown className="text-black" />
                  )}
                </button>
              </div>
              {item.expanded && (
                <div>
                  <div className="grid grid-cols-[3fr_2fr] gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Quantity Ordered"
                      value={
                        item.quantityOrdered === 0 ? "" : item.quantityOrdered
                      }
                      min="0"
                      onChange={(e) =>
                        updateInventoryItem(index, {
                          quantityOrdered: parseInt(e.target.value),
                        })
                      }
                      className="p-2 text-black border border-black h-10 w-full rounded" // Takes remaining space
                    />

                    <select
                      value={item.unitOfMeasurementID}
                      onChange={(e) =>
                        updateInventoryItem(index, {
                          unitOfMeasurementID: parseInt(e.target.value),
                        })
                      }
                      className="p-2 text-black border border-black h-10 w-full rounded" // Adjusted to 1/4 of the container
                    >
                      <option value="0" disabled>
                        Select UoM
                      </option>
                      {(uomOptions[index] || []).map((uom) => (
                        <option
                          key={uom.unitOfMeasurementID}
                          value={uom.unitOfMeasurementID}
                        >
                          {uom.UoM}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="number"
                    placeholder="Price Per PO UoM"
                    value={item.pricePerPOUoM === 0 ? "" : item.pricePerPOUoM}
                    min="0"
                    onChange={(e) =>
                      updateInventoryItem(index, {
                        pricePerPOUoM: parseFloat(e.target.value),
                      })
                    }
                    className="mb-2 p-2 w-full text-black border border-black rounded"
                  />
                  <label className="text-black">Expiry Date </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    placeholder="Expiry Date"
                    value={
                      item.expiryDate === "dd/mm/yyyy" ? "" : item.expiryDate
                    }
                    onChange={(e) =>
                      updateInventoryItem(index, {
                        expiryDate: e.target.value,
                      })
                    }
                    className="mb-2 p-2 w-full text-black border border-black rounded"
                  />
                </div>
              )}
            </div>
          ))}
          <button
            onClick={addInventoryItem}
            className="bg-tealGreen text-black py-2 px-4 rounded mb-4 border-none cursor-pointer mx-auto block"
          >
            Add Inventory Item
          </button>
          <div className="flex justify-between">
            <button
              onClick={handleSubmit}
              className="bg-tealGreen text-black py-2 px-4 rounded border-none cursor-pointer"
            >
              Stock In
            </button>
            <button
              onClick={onClose}
              className="bg-tealGreen text-black py-2 px-4 rounded border-none cursor-pointer"
            >
              Cancel
            </button>
          </div>
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

export default StockInModal;
