import { useState } from "react";
import Modal from "@/components/ui/Modal";
import React from "react";
import ValidationDialog from "@/components/ValidationDialog";

interface AddUOMCategoryModalProps {
  addUOMCategoryModalIsVisible: boolean;
  setAddUOMCategoryModalVisibility: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  modalTitle: string;
  systemName: string;
}

const AddUOMCategoryModal: React.FC<AddUOMCategoryModalProps> = ({
  addUOMCategoryModalIsVisible,
  setAddUOMCategoryModalVisibility,
  modalTitle,
  systemName,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [referenceUOMName, setReferenceUOMName] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const validateForm = () => {
    if (!categoryName.trim()) {
      setValidationMessage("Category name is required.");
      return false;
    }
    if (!referenceUOMName.trim()) {
      setValidationMessage("Reference UoM is required.");
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!validateForm()) return;

    const payload = {
      categoryName,
      referenceUOMName,
      systemName, // Use the systemName passed as a prop
      status: 1,
    };

    console.log("Payload sent to the backend:", payload);

    try {
      const response = await fetch(
        "http://localhost:8081/inventoryManagement/addUoMCategory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred.");
      }

      const result = await response.json();
      console.log("Successfully added category and UOM:", result);
      setValidationMessage("Category and UOM added successfully!");
      window.location.reload();

      // Clear input fields and close modal
      setCategoryName("");
      setReferenceUOMName("");
      setAddUOMCategoryModalVisibility(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding category and UOM:", error.message);
        setValidationMessage(`Failed to add category and UOM. Error: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        setValidationMessage("An unknown error occurred.");
      }
    }
  };

  const handleCancel = () => {
    setAddUOMCategoryModalVisibility(false);
    setCategoryName("");
    setReferenceUOMName("");
  };

  return (
    <>
      <Modal
        modalIsVisible={addUOMCategoryModalIsVisible}
        setModalVisibility={setAddUOMCategoryModalVisibility}
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

export default AddUOMCategoryModal;
