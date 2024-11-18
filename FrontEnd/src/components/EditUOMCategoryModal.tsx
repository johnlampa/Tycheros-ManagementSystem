import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import React from "react";
import axios from "axios";
import { UOM, UOMCategory } from "../../lib/types/UOMDataTypes";
import Toggle from "react-toggle";
import ValidationDialog from "@/components/ValidationDialog";
import "react-toggle/style.css";

interface EditUOMCategoryModalProps {
  editUOMCategoryModalIsVisible: boolean;
  setEditUOMCategoryModalVisibility: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  modalTitle: string;
  categoryToEdit: UOMCategory | undefined;
  UOM: UOM[];
}

const EditUOMCategoryModal: React.FC<EditUOMCategoryModalProps> = ({
  editUOMCategoryModalIsVisible,
  setEditUOMCategoryModalVisibility,
  modalTitle,
  categoryToEdit,
  UOM,
}) => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Reset state when categoryToEdit changes
    setCategoryName(categoryToEdit?.categoryName || "");
    setIsChecked(categoryToEdit?.status === 1);
  }, [categoryToEdit]);

  const validateForm = () => {
    if (!categoryName.trim()) {
      setValidationMessage("Category name is required.");
      return false;
    }
    setValidationMessage(null);
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updatedCategory = {
      categoryName,
      status: isChecked ? 1 : 0,
    };

    try {
      const response = await axios.put(
        `http://localhost:8081/inventoryManagement/updateUoMCategory/${categoryToEdit?.categoryID}`,
        updatedCategory
      );

      if (response.status === 200) {
        alert("Category updated successfully!");
        setEditUOMCategoryModalVisibility(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      setValidationMessage("Failed to update category. Please try again.");
    }
  };

  const handleCancel = () => {
    // Restore original values
    setCategoryName(categoryToEdit?.categoryName || "");
    setIsChecked(categoryToEdit?.status === 1);
    setValidationMessage(null);
    setEditUOMCategoryModalVisibility(false);
  };

  return (
    <>
      <Modal
        modalIsVisible={editUOMCategoryModalIsVisible}
        setModalVisibility={setEditUOMCategoryModalVisibility}
      >
        <form onSubmit={handleSave} className="w-[340px] p-6 mx-auto rounded">
          <p className="text-center text-xl font-bold text-black mb-4">
            {modalTitle}
          </p>

          <div className="flex justify-between items-center mb-4 text-black">
            <label htmlFor="categoryName" className="pr-4">
              Category Name
            </label>
          </div>

          <input
            type="text"
            name="categoryName"
            id="categoryName"
            placeholder="Enter category name"
            className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />

          <div className="flex gap-x-2 text-black mb-5">
            <p>Active: </p>
            <Toggle
              checked={isChecked}
              icons={false}
              onChange={(e) => {
                setIsChecked(e.target.checked);
              }}
            />
          </div>

          <button
            type="submit"
            className="bg-tealGreen hover:bg-tealGreen text-white font-semibold py-2 px-4 rounded w-full mt-5"
          >
            Save
          </button>

          <div className="mt-2 text-center">
            <button
              type="button"
              className="bg-white hover:bg-gray hover:text-white text-gray border-2 border-gray font-semibold py-2 px-4 w-full rounded"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>

        {validationMessage && (
          <ValidationDialog
            message={validationMessage}
            onClose={() => setValidationMessage(null)}
          />
        )}
      </Modal>
    </>
  );
};

export default EditUOMCategoryModal;