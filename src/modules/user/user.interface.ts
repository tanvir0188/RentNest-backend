import type { Role } from "../../../generated/prisma/enums";

export interface RegisterUserPayload {
    name: string;
    email: string;
    role: Role;
    password: string;
    profilePhoto?: string;
}