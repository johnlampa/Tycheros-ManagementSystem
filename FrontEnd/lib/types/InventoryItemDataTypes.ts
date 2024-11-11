export type InventoryItem = {
    inventoryID: number;
    inventoryName: string;
    inventoryCategory : string;
    reorderPoint: number;
    unitOfMeasure: string;
    unitOfMeasurementID: number;
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
  stockInDateTime: string;
  inventoryItems: {
    inventoryID: number;
    quantityOrdered: number;
    pricePerPOUoM: number;
    unitOfMeasurementID: number;
    expiryDate: string;
  }[];
};

export type MultiItemStockOutData = {
  stockOutDateTime: string;
  inventoryItems: {
    inventoryID: number;
    quantityToStockOut: number
    reason: string;
  }[];

}
  