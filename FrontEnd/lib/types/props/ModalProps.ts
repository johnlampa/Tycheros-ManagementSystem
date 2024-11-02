import { MouseEventHandler } from "react";

export type ModalProps = {
  modalIsVisible: boolean;
  setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
};