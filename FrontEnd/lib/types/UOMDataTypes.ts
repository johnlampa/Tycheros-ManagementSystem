export type UOMCategory = {
    categoryID: number,
    categoryName: string,
    status: number
}

export type UOM = {
    UOMID: number,
    categoryID: number,
    UOMName: string,
    ratio: number,
    status: number
}