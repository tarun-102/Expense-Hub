
import axiosInstance from "../../services/axiosInstance";

import type {
    Category,
    CategoryPayload,
    CategoryApiResponse,
} from "./categoryTypes";

// GET ALL CATEGORIES
export const getAllCategories = async () => {
    const response = await axiosInstance.get<
        CategoryApiResponse<Category[]>
    >("/api/category/getallcategory");

    return response.data;
};

// CREATE CATEGORY
export const createCategory = async (data: CategoryPayload) => {
    const response = await axiosInstance.post<
        CategoryApiResponse<Category>
    >("/api/category/createcategory", data);

    return response.data;
};

// UPDATE CATEGORY
export const updateCategory = async (
    id: string,
    data: Partial<CategoryPayload>
) => {
    const response = await axiosInstance.patch<
        CategoryApiResponse<Category>
    >(`/api/category/updatecatory/${id}`, data);

    return response.data;
};

// DELETE CATEGORY
export const deleteCategory = async (id: string) => {
    const response = await axiosInstance.delete<
        CategoryApiResponse<unknown>
    >(`/api/category/deletecategory/${id}`);

    return response.data;
};
