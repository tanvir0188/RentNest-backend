export interface CreatePropertyPayload {
    price: number;
    type: string;
    location: string;
    landLordId: string;
    categoryId: string;
    isAvailable: boolean;
}

export interface UpdatePropertyPayload {
    price?: number;
    type?: string;
    location?: string;
    categoryId?: string;
    isAvailable?: boolean;
}
