import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import React from "react";
import axios from "axios";
import { UOM, UOMCategory } from "../../lib/types/UOMDataTypes";
import Toggle from "react-toggle";
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
  const [categoryName, setCategoryName] = useState<string>(
    categoryToEdit?.categoryName || ""
  );
  const [isChecked, setIsChecked] = useState<boolean>(
    categoryToEdit?.status === 1
  );

  useEffect(() => {
    // Update state when categoryToEdit changes
    setCategoryName(categoryToEdit?.categoryName || "");
    setIsChecked(categoryToEdit?.status === 1);
  }, [categoryToEdit]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }

    const updatedCategory = {
      categoryName,
      status: isChecked ? 1 : 0,
    };

    try {
      // Make the PUT request to update the category
      const response = await axios.put(
        `http://localhost:8081/inventoryManagement/updateUoMCategory/${categoryToEdit?.categoryID}`,
        updatedCategory
      );

      if (response.status === 200) {
        alert("Category updated successfully!");
        setEditUOMCategoryModalVisibility(false); // Close the modal on success
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditUOMCategoryModalVisibility(false);
    setCategoryName("");
  };

  return (
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
            className="bg-white hover:bg-gray hover:text-white text-gray border-2 border-gray font-semibold py-2 px-4 w-full rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>  
  );
};

export default EditUOMCategoryModal;
