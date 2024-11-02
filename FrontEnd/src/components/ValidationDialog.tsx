import React from "react";

type ValidationDialogProps = {
  message: string;
  onClose: () => void;
};

const ValidationDialog: React.FC<ValidationDialogProps> = ({
  message,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-5 rounded-lg w-80">
      <h2 className="text-black font-bold mb-4 text-2xl">Error</h2>
      <div className="text-black whitespace-pre-wrap">{message}</div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="bg-tealGreen text-black py-2 px-4 rounded cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

export default ValidationDialog;
