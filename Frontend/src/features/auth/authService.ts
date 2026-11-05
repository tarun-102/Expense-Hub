
import axiosInstance from "../../services/axiosInstance";

import type {
    LoginPayload,
    RegisterPayload,
    AuthResponse,
} from "./authTypes";

// LOGIN
export const loginUser = async (
    data: LoginPayload
): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
        "/api/v1/users/login",
        data
    );

    return response.data;
};

// REGISTER
export const registerUser = async (
    data: RegisterPayload
): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
        "/api/v1/users/register",
        data
    );

    return response.data;
};

// GET CURRENT USER
export const getCurrentUser = async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>(
        "/api/v1/users/get-me"
    );

    return response.data;
};

// LOGOUT
export const logoutUser = async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>(
        "/api/v1/users/logout"
    );

    return response.data;
};
