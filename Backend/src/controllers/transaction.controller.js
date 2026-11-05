
import mongoose from "mongoose";
import { Transactions } from "../models/transections.models.js";
import { PartyMaster } from "../models/partymaster.model.js";
import { Categories } from "../models/categories.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const allowedType = ["expense", "income", "investment"];


// Create Transaction

const createTransaction = asyncHandler(async (req, res) => {

    const {
        categoryid,
        partyid,
        type,
        title,
        amount,
        date,
        description
    } = req.body;

    if (
        !categoryid ||
        !partyid ||
        !type ||
        !title?.trim() ||
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        throw new ApiError(400, "All required fields are needed");
    }

    if (
        typeof type !== "string" ||
        !allowedType.includes(type.trim().toLowerCase())
    ) {
        throw new ApiError(400, "Invalid transaction type");
    }

    if (
        !mongoose.Types.ObjectId.isValid(categoryid) ||
        !mongoose.Types.ObjectId.isValid(partyid)
    ) {
        throw new ApiError(400, "Invalid category ID or party ID");
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
        throw new ApiError(400, "Amount must be a valid non-negative number");
    }

    const category = await Categories.findOne({
        _id: categoryid,
        userid: req.user._id
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    const party = await PartyMaster.findOne({
        _id: partyid,
        userid: req.user._id
    });

    if (!party) {
        throw new ApiError(404, "Party not found");
    }

    const normalizedType = type.trim().toLowerCase();

    if (category.type !== normalizedType) {
        throw new ApiError(400, "Category type and transaction type must match");
    }

    const transactionDate = date ? new Date(date) : new Date();

    if (Number.isNaN(transactionDate.getTime())) {
        throw new ApiError(400, "Invalid transaction date");
    }

    const transaction = await Transactions.create({
        userid: req.user._id,
        categoryid,
        partyid,
        type: normalizedType,
        title: title.trim(),
        amount: numericAmount,
        date: transactionDate,
        description
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            transaction,
            "Transaction created successfully"
        )
    );
});


// Get All Transactions

const getAllTransaction = asyncHandler(async (req, res) => {

    const filter = {
        userid: req.user._id
    };

    if (req.query.type) {
        const type = req.query.type.toLowerCase();

        if (!allowedType.includes(type)) {
            throw new ApiError(400, "Invalid transaction type");
        }

        filter.type = type;
    }

    const transactions = await Transactions.find(filter)
        .populate("categoryid", "category_name icon type")
        .populate("partyid", "party_name party_type")
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            transactions,
            "Transactions fetched successfully"
        )
    );
});


// Get Single Transaction

const getSingleTransaction = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid transaction ID");
    }

    const transaction = await Transactions.findOne({
        _id: id,
        userid: req.user._id
    })
        .populate("categoryid", "category_name icon type")
        .populate("partyid", "party_name party_type");

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            transaction,
            "Transaction fetched successfully"
        )
    );
});


// Update Transaction

const updateTransactiopn = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        categoryid,
        partyid,
        type,
        title,
        amount,
        date,
        description
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid transaction ID");
    }

    const transaction = await Transactions.findOne({
        _id: id,
        userid: req.user._id
    });

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    if (categoryid !== undefined) {

        if (!mongoose.Types.ObjectId.isValid(categoryid)) {
            throw new ApiError(400, "Invalid category ID");
        }

        const category = await Categories.findOne({
            _id: categoryid,
            userid: req.user._id
        });

        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        transaction.categoryid = categoryid;
    }

    if (partyid !== undefined) {

        if (!mongoose.Types.ObjectId.isValid(partyid)) {
            throw new ApiError(400, "Invalid party ID");
        }

        const party = await PartyMaster.findOne({
            _id: partyid,
            userid: req.user._id
        });

        if (!party) {
            throw new ApiError(404, "Party not found");
        }

        transaction.partyid = partyid;
    }

    if (type !== undefined) {

        if (
            typeof type !== "string" ||
            !allowedType.includes(type.trim().toLowerCase())
        ) {
            throw new ApiError(400, "Invalid transaction type");
        }

        transaction.type = type.trim().toLowerCase();
    }

    if (title !== undefined) {

        if (typeof title !== "string" || !title.trim()) {
            throw new ApiError(400, "Title cannot be empty");
        }

        transaction.title = title.trim();
    }

    if (amount !== undefined) {

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount < 0) {
            throw new ApiError(400, "Invalid amount");
        }

        transaction.amount = numericAmount;
    }

    if (date !== undefined) {

        const transactionDate = new Date(date);

        if (Number.isNaN(transactionDate.getTime())) {
            throw new ApiError(400, "Invalid transaction date");
        }

        transaction.date = transactionDate;
    }

    if (description !== undefined) {
        transaction.description = description;
    }

    // Check category type and transaction type match
    const finalCategory = await Categories.findOne({
        _id: transaction.categoryid,
        userid: req.user._id
    });

    if (!finalCategory) {
        throw new ApiError(404, "Category not found");
    }

    if (finalCategory.type !== transaction.type) {
        throw new ApiError(400, "Category type and transaction type must match");
    }

    await transaction.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            transaction,
            "Transaction updated successfully"
        )
    );
});


// Delete Transaction

const deleteTransaction = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid transaction ID");
    }

    const transaction = await Transactions.findOneAndDelete({
        _id: id,
        userid: req.user._id
    });

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            transaction,
            "Transaction deleted successfully"
        )
    );
});


export {
    createTransaction,
    getAllTransaction,
    getSingleTransaction,
    updateTransactiopn,
    deleteTransaction
};
