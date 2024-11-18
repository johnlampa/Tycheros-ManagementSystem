export type UOMCategory = {
    categoryID: number,
    categoryName: string,
    status: number
}

export type UOM = {
    unitOfMeasurementID: number,
    categoryID: number,
    UoM: string,
    type: string,
    ratio: number,
    status: number
}