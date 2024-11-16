export type OrderItemDataTypes = {
    productID: number,
    quantity: number
}

export type SubitemUsed = {
    subitemID: number;
    quantityUsed: number
}

export type Order = {
    orderID?: number,
    paymentID?: number,
    employeeID: number,
    date: string,
    status: "Unpaid" | "Pending" | "Completed" | "Cancelled",
    amount?: number
    method?: string,
    orderItems?: OrderItemDataTypes[]

    cancellationReason?: string;
    cancellationType?: "Unpaid" | "Pending" | "Completed" | "Cancelled"; //doesnt make sense pero cant make it work if only "Pending" || "Completed"
    subitemsUsed?: SubitemUsed[];
}