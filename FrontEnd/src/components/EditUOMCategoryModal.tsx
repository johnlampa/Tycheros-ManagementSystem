import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import React from "react";
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
  const [categoryName, setCategoryName] = useState(
    categoryToEdit?.categoryName
  );
  const [referenceUOMName, setReferenceUOMName] = useState("");
  const [isChecked, setIsChecked] = useState<boolean>();

  useEffect(() => {
    // Update categoryName when categoryToEdit changes
    setCategoryName(categoryToEdit?.categoryName || "");

    // Find the reference UOM where categoryID matches and ratio equals 1
    const referenceUOM = UOM.find(
      (uom) =>
        uom.categoryID === categoryToEdit?.categoryID &&
        parseInt(uom.ratio.toString()) === 1
    );

    // Update the state with the UOMName, or default to an empty string if not found
    setReferenceUOMName(referenceUOM ? referenceUOM.UOMName : "");

    setIsChecked(categoryToEdit?.status === 1);
  }, [categoryToEdit, UOM]); // Dependencies include categoryToEdit and UOM

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName?.trim()) {
      alert("Category name is required");
      return;
    }

    const newCategory = {
      categoryName,
      referenceUOMName,
      status: isChecked ? 1 : 0,
    };

    //@adgramirez add code that adds the new category to the DB

    setCategoryName("");
    setReferenceUOMName("");
    setEditUOMCategoryModalVisibility(false);
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

        <div className="flex justify-between items-center mb-4 text-black">
          <label htmlFor="referenceUOMName" className="pr-4">
            Reference UOM Name
          </label>
        </div>

        <input
          type="text"
          name="referenceUOMName"
          id="referenceUOMName"
          placeholder="Enter reference UOM name"
          className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
          value={referenceUOMName}
          onChange={(e) => setReferenceUOMName(e.target.value)}
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
