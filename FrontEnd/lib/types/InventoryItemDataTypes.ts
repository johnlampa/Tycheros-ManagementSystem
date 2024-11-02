export type InventoryItem = {
    inventoryID: number;
    inventoryName: string;
    inventoryCategory : string;
    reorderPoint: number;
    unitOfMeasure: string;
    purchaseOrderID: number;
    totalQuantity: number;
    inventoryStatus: number;
    quantityRemaining: number;
    pricePerUnit: number;
    stockInDate: string;
    expiryDate: string;
    supplierName: string;
    employeeName: string;
  }

  export type MultiItemStockInData = {
    supplierName: string;
    employeeID: string;
    stockInDate: string;
    inventoryItems: {
      inventoryID: number;
      quantityOrdered: number;
      actualQuantity: number;
      pricePerUnit: number;
      expiryDate: string;
    }[];
  };
  