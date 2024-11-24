import { ProductDataTypes } from "../ProductDataTypes";
import { InventoryDataTypes } from "../InventoryDataTypes";

export type ProductModalProps = {
  productModalIsVisible: boolean;
  setProductModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  type: string;
  categoryName: string;

  modalTitle: string;

  menuProductToEdit?: ProductDataTypes;
  setMenuProductHolder?: React.Dispatch<
    React.SetStateAction<ProductDataTypes | null>
  >;

  menuData: ProductDataTypes[];
  setMenuData: React.Dispatch<React.SetStateAction<ProductDataTypes[]>>;

  setProductIDForPriceRecords: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  setPriceRecordsModalIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (message: string) => void; // Add this line
};
