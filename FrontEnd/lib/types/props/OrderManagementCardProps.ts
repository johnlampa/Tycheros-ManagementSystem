import { Order } from "../OrderDataTypes"
import { Payment } from "../PaymentDataTypes";
import { ProductDataTypes } from "../ProductDataTypes"

export type OrderManagementCardProps = {
    order: Order,
    menuData: ProductDataTypes[],
    orders: Order[],
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

    type: string,
    discountAmount?: number

    setCancelOrderModalVisibility?: React.Dispatch<React.SetStateAction<boolean>>;
    setOrderToEdit?: React.Dispatch<React.SetStateAction<Order | undefined>> 

    payments?: Payment[];
}