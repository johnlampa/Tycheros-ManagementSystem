import { ProductDataTypes } from "../ProductDataTypes";
import { InventoryDataTypes } from "../InventoryDataTypes";

export type MenuManagementCardProps = {
    categoryName: string;
    menuData: ProductDataTypes[];
    setMenuData: React.Dispatch<React.SetStateAction<ProductDataTypes[]>>;
    menuProductHolder: ProductDataTypes | null;
    setMenuProductHolder: React.Dispatch<React.SetStateAction<ProductDataTypes | null >>;
    
    inventoryData: InventoryDataTypes[];
    setInventoryData: React.Dispatch<React.SetStateAction<InventoryDataTypes[]>>;
    
    setProductIDForPriceRecords: React.Dispatch<React.SetStateAction<number | undefined>>;
    setPriceRecordsModalIsVisible: React.Dispatch<React.SetStateAction<boolean>>
  };
