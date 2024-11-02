import { ModalProps } from "../../../lib/types/props/ModalProps";

const Modal: React.FC<ModalProps> = ({
  modalIsVisible,
  setModalVisibility,
  children,
}) => {
  return (
    <>
      {modalIsVisible && (
        <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full overflow-y-auto">
          {/* Background Overlay */}
          <div
            onClick={() => setModalVisibility(false)}
            className="absolute inset-0 bg-black/20"
          ></div>

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-xl shadow-lg p-0 m-0 max-h-[90vh] overflow-y-auto overflow-x-hidden" // Removed all padding/margin
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
