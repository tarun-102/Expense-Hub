
import axiosInstance from "../../services/axiosInstance";

import type {
    Transaction,
    TransactionPayload,
    TransactionApiResponse,
} from "./transactionTypes";

// GET ALL TRANSACTIONS
export const getAllTransactions = async () => {
    const response = await axiosInstance.get<
        TransactionApiResponse<Transaction[]>
    >("/api/transaction/getalltransaction");

    return response.data;
};

// GET SINGLE TRANSACTION
export const getSingleTransaction = async (id: string) => {
    const response = await axiosInstance.get<
        TransactionApiResponse<Transaction>
    >(`/api/transaction/singletransaction/${id}`);

    return response.data;
};

// CREATE TRANSACTION
export const createTransaction = async (data: TransactionPayload) => {
    const response = await axiosInstance.post<
        TransactionApiResponse<Transaction>
    >("/api/transaction/createtransaction", data);

    return response.data;
};

// UPDATE TRANSACTION
export const updateTransaction = async (
    id: string,
    data: Partial<TransactionPayload>
) => {
    const response = await axiosInstance.patch<
        TransactionApiResponse<Transaction>
    >(`/api/transaction/updatetransaction/${id}`, data);

    return response.data;
};

// DELETE TRANSACTION
export const deleteTransaction = async (id: string) => {
    const response = await axiosInstance.delete<
        TransactionApiResponse<unknown>
    >(`/api/transaction/deletetransaction/${id}`);

    return response.data;
};