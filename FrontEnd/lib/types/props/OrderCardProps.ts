import { Order, OrderItemDataTypes } from "../OrderDataTypes"
import { ProductDataTypes } from "../ProductDataTypes";

export type OrderCardProps = {
    cart: OrderItemDataTypes[];
    setCart?: React.Dispatch<React.SetStateAction<OrderItemDataTypes[]>>;
    order?: Order;
    setOrder: React.Dispatch<React.SetStateAction<Order>>;
    menuData: ProductDataTypes[];
    quantityModalIsVisible: boolean;
    setQuantityModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;

    subtotal: number;
    setSubtotal: React.Dispatch<React.SetStateAction<number>>;

    type: String;
    
}