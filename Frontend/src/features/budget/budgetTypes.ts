export interface PopulatedCategory {
    _id: string;
    category_name: string;
    icon?: string;
    type?: string;
}

export interface Budget {
    _id: string;
    userid: string;
    categoryid: string | PopulatedCategory;
    amount: number;
    month: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BudgetPayload {
    categoryid: string;
    amount: number;
    month: string;
}

export interface BudgetApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}

export interface BudgetState {
    budgets: Budget[];
    selectedBudget: Budget | null;
    loading: boolean;
    error: string | null;
}
