
type Role = "LANDLORD" | "TENANT";
export interface RegisterUserPayload {
    name: string;
    email: string;
    role: Role;
    password: string;
    profilePhoto?: string;
}

export interface UpdateProfilePayload {
    name?: string;
    email?: string;
    profilePhoto?: string;
    bio?: string;
}