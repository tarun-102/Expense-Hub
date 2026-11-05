
import { Categories } from "../models/categories.models.js";
import { PartyMaster } from "../models/partymaster.model.js";

// Default categories for every new user
const defaultCategories = [
    // EXPENSE
    { category_name: "Food", type: "expense", icon: "cup-hot" },
    { category_name: "Groceries", type: "expense", icon: "basket" },
    { category_name: "Rent", type: "expense", icon: "house" },
    { category_name: "Transport", type: "expense", icon: "bus-front" },
    { category_name: "Fuel", type: "expense", icon: "fuel-pump" },
    { category_name: "Shopping", type: "expense", icon: "bag" },
    { category_name: "Medical", type: "expense", icon: "heart-pulse" },
    { category_name: "Electricity", type: "expense", icon: "lightning-charge" },
    { category_name: "Mobile Recharge", type: "expense", icon: "phone" },
    { category_name: "Entertainment", type: "expense", icon: "controller" },

    // INCOME
    { category_name: "Salary", type: "income", icon: "wallet2" },
    { category_name: "Business Income", type: "income", icon: "briefcase" },
    { category_name: "Freelancing", type: "income", icon: "laptop" },
    { category_name: "Other Income", type: "income", icon: "cash-coin" },

    // INVESTMENT
    { category_name: "Savings", type: "investment", icon: "piggy-bank" },
    { category_name: "Mutual Fund", type: "investment", icon: "graph-up-arrow" },
    { category_name: "Stocks", type: "investment", icon: "graph-up" },
    { category_name: "Life Insurance", type: "investment", icon: "shield-check" },
];

// Default parties for every new user
const defaultParties = [
    {
        party_type: "person",
        party_name: "Personal",
        title: "Personal Transactions",
    },
    {
        party_type: "store",
        party_name: "General Store",
        title: "Daily Shopping",
    },
    {
        party_type: "company",
        party_name: "Employer",
        title: "Salary and Income",
    },
    {
        party_type: "bank",
        party_name: "Bank Account",
        title: "Banking Transactions",
    },
    {
        party_type: "lifeinsurance",
        party_name: "Life Insurance",
        title: "Life Insurance Payments",
    },
    {
        party_type: "vehicleinsurance",
        party_name: "Vehicle Insurance",
        title: "Vehicle Insurance Payments",
    },
];

// Generate Bootstrap icon URL
const getIconUrl = (iconName) => {
    return `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${iconName}.svg`;
};

// Create default categories and parties for a new user
const createDefaultUserData = async (userId) => {
    const categoriesToCreate = defaultCategories.map((category) => ({
        ...category,
        icon: getIconUrl(category.icon),
        userid: userId,
    }));

    const partiesToCreate = defaultParties.map((party) => ({
        ...party,
        userid: userId,
    }));

    await Promise.all([
        Categories.insertMany(categoriesToCreate),
        PartyMaster.insertMany(partiesToCreate),
    ]);

    return true;
};

export { createDefaultUserData };
