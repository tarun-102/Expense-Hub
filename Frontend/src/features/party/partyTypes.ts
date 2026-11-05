export type PartyType =
    | "person"
    | "family"
    | "customer"
    | "supplier"
    | "vendor"
    | "company"
    | "employer"
    | "employee"
    | "client"
    | "store"
    | "supermarket"
    | "bank"
    | "lender"
    | "borrower"
    | "creditcard"
    | "lifeinsurance"
    | "vehicleinsurance"
    | "healthinsurance"
    | "government"
    | "hospital"
    | "doctor"
    | "school"
    | "college"
    | "landlord"
    | "tenant"
    | "utility"
    | "serviceprovider"
    | "broker"
    | "investmentfirm"
    | "other";

export const PARTY_TYPE_LABELS: Record<PartyType, string> = {
    person: "Person",
    family: "Family",
    customer: "Customer",
    supplier: "Supplier",
    vendor: "Vendor",
    company: "Company",
    employer: "Employer",
    employee: "Employee",
    client: "Client",
    store: "Store",
    supermarket: "Supermarket",
    bank: "Bank",
    lender: "Lender",
    borrower: "Borrower",
    creditcard: "Credit Card",
    lifeinsurance: "Life Insurance",
    vehicleinsurance: "Vehicle Insurance",
    healthinsurance: "Health Insurance",
    government: "Government",
    hospital: "Hospital",
    doctor: "Doctor",
    school: "School",
    college: "College",
    landlord: "Landlord",
    tenant: "Tenant",
    utility: "Utility",
    serviceprovider: "Service Provider",
    broker: "Broker",
    investmentfirm: "Investment Firm",
    other: "Other",
};

export const PARTY_TYPE_OPTIONS = (
    Object.keys(PARTY_TYPE_LABELS) as PartyType[]
).map((key) => ({
    label: PARTY_TYPE_LABELS[key],
    value: key,
}));

export const formatPartyType = (type?: string): string => {
    if (!type) return "Other";
    return (
        PARTY_TYPE_LABELS[type as PartyType] ||
        type.charAt(0).toUpperCase() + type.slice(1)
    );
};

export interface Party {
    _id: string;
    party_type: PartyType;
    party_name: string;
    title: string;
    userid: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PartyPayload {
    party_type: PartyType;
    party_name: string;
    title: string;
}

export interface PartyApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}

export interface PartyState {
    parties: Party[];
    selectedParty: Party | null;
    loading: boolean;
    error: string | null;
}
