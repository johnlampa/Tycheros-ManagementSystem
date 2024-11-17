export type InventoryDataTypes = {
    inventoryID: number;
    inventoryName: string;
    inventoryCategory: "Produce" | "Dairy and Eggs" | "Meat and Poultry" | "Seafood" | "Canned Goods" | "Dry Goods" | "Sauces" | "Condiments" | "Beverages";
    reorderPoint: number;
    unitOfMeasure: string;
    
    
    inventoryStatus: number;
}
