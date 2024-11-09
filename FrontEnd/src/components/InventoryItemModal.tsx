import ValidationDialog from "@/components/ValidationDialog";
import React, { useEffect, useState } from "react";
import Toggle from "react-toggle";
import { InventoryItem } from "../../lib/types/InventoryItemDataTypes";

interface InventoryItemModalProps {
  modalTitle: string;
  inventoryItemData: {
    inventoryName: string;
    inventoryCategory: string;
    reorderPoint: number;
    unitOfMeasurementID: number;
    inventoryStatus: number;
  };
  unitOfMeasurements: { unitOfMeasurementID: number; UoM: string }[];
  itemToEditID?: number;
  setInventoryItemData: (newData: any) => void;
  onSave: () => void;
  onCancel: () => void;
  handleStatusToggle?: (inventoryID: number, newStatus: boolean) => void;
  inventoryData?: InventoryItem[];
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  modalTitle,
  inventoryItemData,
  unitOfMeasurements,
  setInventoryItemData,
  onSave,
  onCancel,
  handleStatusToggle,
  inventoryData,
  itemToEditID,
}) => {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(inventoryItemData.inventoryStatus === 1);

  useEffect(() => {
    setIsChecked(inventoryItemData.inventoryStatus === 1);
  }, [inventoryItemData.inventoryStatus]);

  const validateForm = () => {
    const missingFields: string[] = [];

    if (!inventoryItemData.inventoryName.trim()) {
      missingFields.push("Inventory Name");
    }
    if (!inventoryItemData.inventoryCategory.trim()) {
      missingFields.push("Inventory Category");
    }
    if (inventoryItemData.reorderPoint <= 0) {
      missingFields.push("Reorder Point");
    }
    if (!inventoryItemData.unitOfMeasurementID) {
      missingFields.push("Unit of Measure");
    }

    if (missingFields.length > 0) {
      setValidationMessage(
        `Please fill out the following:\n${missingFields.join("\n")}`
      );
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
      if (handleStatusToggle && itemToEditID !== undefined) {
        handleStatusToggle(itemToEditID, isChecked);
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg w-72">
        <h2 className="text-black">{modalTitle}</h2>
        <div>
          <input
            type="text"
            placeholder="Inventory Name"
            value={inventoryItemData.inventoryName}
            onChange={(e) =>
              setInventoryItemData({ ...inventoryItemData, inventoryName: e.target.value })
            }
            className="mb-2 p-2 w-full text-black"
          />
          <select
            value={inventoryItemData.inventoryCategory}
            onChange={(e) =>
              setInventoryItemData({
                ...inventoryItemData,
                inventoryCategory: e.target.value,
              })
            }
            className="mb-2 p-2 w-full text-black"
          >
            <option value="" disabled>
              Select Inventory Category
            </option>
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
          <input
            type="number"
            placeholder="Reorder Point"
            value={inventoryItemData.reorderPoint === 0 ? "" : inventoryItemData.reorderPoint}
            onChange={(e) =>
              setInventoryItemData({
                ...inventoryItemData,
                reorderPoint: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            className="mb-2 p-2 w-full text-black"
            min="0"
          />

          <select
            value={inventoryItemData.unitOfMeasurementID || 0} 
            onChange={(e) =>
              setInventoryItemData({
                ...inventoryItemData,
                unitOfMeasurementID: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="mb-2 p-2 w-full text-black"
          >
            <option value="0" disabled>
              Select Unit of Measure
            </option>
            {unitOfMeasurements.map((uom) => (
              <option key={uom.unitOfMeasurementID} value={uom.unitOfMeasurementID}>
                {uom.UoM}
              </option>
            ))}
          </select>

          <div className="flex gap-x-2 text-black mb-5">
            <p>Status: </p>
            <Toggle
              checked={isChecked}
              icons={false}
              onChange={(e) => {
                const newStatus = e.target.checked ? 1 : 0;
                setIsChecked(e.target.checked);
                setInventoryItemData({
                  ...inventoryItemData,
                  inventoryStatus: newStatus,
                });
              }}
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleSave}
              className="bg-black text-white py-2 px-4 rounded cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="bg-black text-white py-2 px-4 rounded cursor-pointer"
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

export default InventoryItemModal;
