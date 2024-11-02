export type Payment = {
    paymentID?: number,
    amount: number,
    method: string,
    referenceNumber: string,
    discountType: string,
    discountAmount: number
}