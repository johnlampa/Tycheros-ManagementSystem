import ValidationDialog from "@/components/ValidationDialog";
import React, { useEffect, useState } from "react";
import Toggle from "react-toggle";
import { InventoryItem } from "../../lib/types/InventoryItemDataTypes";

interface SubitemModalProps {
  modalTitle: string;
  subitemData: {
    inventoryName: string;
    inventoryCategory: string;
    reorderPoint: number;
    unitOfMeasure: string;
  };
  itemToEditID?: number;
  setSubitemData: (newData: any) => void;
  onSave: () => void;
  onCancel: () => void;

  handleStatusToggle?: Function;

  inventoryData?: InventoryItem[];
}

const SubitemModal: React.FC<SubitemModalProps> = ({
  modalTitle,
  subitemData,
  setSubitemData,
  onSave,
  onCancel,
  handleStatusToggle,
  inventoryData,
  itemToEditID,
}) => {
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const [handleStatusToggleParams, setHandleStatusToggleParams] = useState<{
    inventoryID: number | undefined;
    checked: boolean;
  }>();

  const [subitemDataFromInventoryData, setSubitemDataFromInventoryData] =
    useState<InventoryItem>();

  const [isChecked, setIsChecked] = useState(
    subitemDataFromInventoryData?.inventoryStatus === 1
  );

  useEffect(() => {
    setIsChecked(subitemDataFromInventoryData?.inventoryStatus === 1);
  }, [subitemDataFromInventoryData]);

  useEffect(() => {
    const matchingItem = inventoryData?.find(
      (item) => item.inventoryID === itemToEditID
    );

    if (matchingItem) {
      setSubitemDataFromInventoryData(matchingItem);
    } else {
      setSubitemDataFromInventoryData(undefined);
    }

    console.log("inventoryData: ", inventoryData);
    console.log("itemToEditID: ", itemToEditID);
    console.log("subitemDataFromInventoryData:", subitemDataFromInventoryData);
  }, [inventoryData, itemToEditID]);

  const validateForm = () => {
    const missingFields: string[] = [];

    if (!subitemData.inventoryName.trim()) {
      missingFields.push("Inventory Name");
    }
    if (!subitemData.inventoryCategory.trim()) {
      missingFields.push("Inventory Category");
    }
    if (subitemData.reorderPoint <= 0) {
      missingFields.push("Reorder Point");
    }
    if (!subitemData.unitOfMeasure.trim()) {
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
    }
    if (handleStatusToggle && handleStatusToggleParams) {
      handleStatusToggle(
        handleStatusToggleParams.inventoryID,
        handleStatusToggleParams.checked
      );
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
            value={subitemData.inventoryName}
            onChange={(e) =>
              setSubitemData({ ...subitemData, inventoryName: e.target.value })
            }
            className="mb-2 p-2 w-full text-black"
          />
          <select
            value={subitemData.inventoryCategory}
            onChange={(e) =>
              setSubitemData({
                ...subitemData,
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
            value={
              subitemData.reorderPoint === 0 ? "" : subitemData.reorderPoint
            }
            onChange={(e) =>
              setSubitemData({
                ...subitemData,
                reorderPoint:
                  e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            className="mb-2 p-2 w-full text-black"
            min="0"
          />

          <input
            type="text"
            placeholder="Unit of Measure"
            value={subitemData.unitOfMeasure}
            onChange={(e) =>
              setSubitemData({ ...subitemData, unitOfMeasure: e.target.value })
            }
            className="mb-2 p-2 w-full text-black"
          />

          <div className="flex gap-x-2 text-black mb-5">
            <p>Status: </p>
            <Toggle
              checked={isChecked}
              icons={false}
              onChange={(e) => {
                const newChecked = e.target.checked;
                setIsChecked(newChecked);

                console.log(e);
                if (handleStatusToggle) {
                  setHandleStatusToggleParams({
                    inventoryID: subitemDataFromInventoryData?.inventoryID,
                    checked: e.target.checked,
                  });
                }
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

export default SubitemModal;
