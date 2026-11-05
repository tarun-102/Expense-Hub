
import type {
    LoginFormValues,
    RegisterFormValues,
} from "./validation/authValidation";

export type LoginPayload = LoginFormValues;

export type RegisterPayload = Omit<
    RegisterFormValues,
    "confirmPassword"
>;

export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data: {
        user?: User;
        accesstoken?: string;
        refreshtoken?: string;
    };
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    initialized: boolean;
    error: string | null;
}