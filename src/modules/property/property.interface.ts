export interface CreatePropertyPayload {
    price: number;
    title: string;
    type: string;
    location: string;
    landLordId: string;
    categoryId: string;
    isAvailable: boolean;
    amenities?: string[];
}

export interface UpdatePropertyPayload {
    price?: number;
    title?: string;
    type?: string;
    location?: string;
    categoryId?: string;
    isAvailable?: boolean;
    amenities?: string[];
}

export interface CategoryPayload {
    title: string;
}
