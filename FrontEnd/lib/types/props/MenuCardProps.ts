import { ProductDataTypes } from "../ProductDataTypes";
import { Order } from "../OrderDataTypes";

export type MenuCardProps = {
    product: ProductDataTypes,
    setProductToAdd: React.Dispatch<React.SetStateAction<ProductDataTypes>>;
    quantityModalIsVisible: boolean,
    setQuantityModalVisibility: React.Dispatch<React.SetStateAction<boolean>>
}