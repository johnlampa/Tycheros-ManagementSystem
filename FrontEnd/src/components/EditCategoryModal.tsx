import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { CategoriesDataTypes } from "../../lib/types/CategoriesDataTypes";
import React from "react";
import Toggle from "react-toggle";
import ValidationDialog from "@/components/ValidationDialog";

interface EditCategoryModalProps {
  editCategoryModalIsVisible: boolean;
  setEditCategoryModalIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalTitle: string;
  categoryToEdit?: CategoriesDataTypes;
  setCategoryHolder?: React.Dispatch<
    React.SetStateAction<CategoriesDataTypes | null>
  >;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  editCategoryModalIsVisible,
  setEditCategoryModalIsVisible,
  modalTitle,
  categoryToEdit,
  setCategoryHolder,
}) => {
  const [categoryName, setCategoryName] = useState<string>(
    categoryToEdit?.categoryName || ""
  );
  const [isChecked, setIsChecked] = useState<boolean>(
    categoryToEdit?.status === 1
  );

  useEffect(() => {
    if (categoryToEdit) {
      setCategoryName(categoryToEdit.categoryName || "");
      setIsChecked(categoryToEdit.status === 1);
    }
  }, [categoryToEdit]);

  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const handleSave = () => {
    const validationErrors: string[] = [];

    // Validate category name
    if (!categoryName.trim()) {
      validationErrors.push("Category name is required.");
    }

    // If there are validation errors, display them and stop submission
    if (validationErrors.length > 0) {
      setValidationMessage(
        `Please fill out the following:\n${validationErrors.join("\n")}`
      );
      return false;
    }

    //@adgramirez replace this code with function that edits the category in the DB

    // if (setCategoryHolder) {
    //   setCategoryHolder({
    //     ...categoryToEdit,
    //     categoryName,
    //     status: isChecked ? 1 : 0,
    //   });
    // }

    setEditCategoryModalIsVisible(false);
  };

  const handleCancel = () => {
    setEditCategoryModalIsVisible(false);
  };

  return (
    <Modal
      modalIsVisible={editCategoryModalIsVisible}
      setModalVisibility={setEditCategoryModalIsVisible}
    >
      <form
        id="editCategoryForm"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="w-[340px] p-6 mx-auto rounded"
      >
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
            onChange={(e) => setIsChecked(e.target.checked)}
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
  );
};

export default EditCategoryModal;
