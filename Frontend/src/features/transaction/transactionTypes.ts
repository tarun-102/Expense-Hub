export type TransactionType = "income" | "expense" | "investment";

export interface PopulatedCategory {
    _id: string;
    category_name: string;
    icon?: string;
    type?: string;
}

export interface PopulatedParty {
    _id: string;
    party_name: string;
    party_type?: string;
}

export interface Transaction {
    _id: string;
    userid: string;
    categoryid: string | PopulatedCategory;
    partyid: string | PopulatedParty;
    type: TransactionType;
    title: string;
    amount: number;
    date: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TransactionPayload {
    categoryid: string;
    partyid: string;
    type: TransactionType;
    title: string;
    amount: number;
    date: string;
    description: string;
}

export interface TransactionApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}

export interface TransactionState {
    transactions: Transaction[];
    selectedTransaction: Transaction | null;
    loading: boolean;
    error: string | null;
}
