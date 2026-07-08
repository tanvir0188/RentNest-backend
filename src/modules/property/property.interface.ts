export interface CreatePropertyPayload {
    price: number;
    title: string;
    type: string;
    location: string;
    landLordId: string;
    categoryId: string;
    isAvailable: boolean;
}

export interface UpdatePropertyPayload {
    price?: number;
    title?: string;
    type?: string;
    location?: string;
    categoryId?: string;
    isAvailable?: boolean;
}
