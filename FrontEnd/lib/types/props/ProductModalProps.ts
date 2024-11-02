import { ProductDataTypes } from "../ProductDataTypes";
import { InventoryDataTypes } from "../InventoryDataTypes";

export type ProductModalProps = {
  productModalIsVisible: boolean;
  setProductModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  type: string;
  categoryName: string;

  modalTitle: string;
  inventoryData: InventoryDataTypes[];

  menuProductToEdit?: ProductDataTypes;
  
  setMenuProductHolder?: React.Dispatch<React.SetStateAction<ProductDataTypes | null>>;

  menuData: ProductDataTypes[];
  setMenuData: React.Dispatch<React.SetStateAction<ProductDataTypes[]>>;
}