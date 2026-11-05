
import mongoose from "mongoose";

import { Budgets } from "../models/budgets.models.js";
import { Categories } from "../models/categories.models.js";

import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// CREATE BUDGET
const createBudgets = asyncHandler(async (req, res) => {
    const { categoryid, amount, month } = req.body;

    // Required fields validation
    if (!categoryid || amount === undefined || !month?.trim()) {
        throw new ApiError(400, "All fields are required");
    }

    // Category ID validation
    if (!mongoose.Types.ObjectId.isValid(categoryid)) {
        throw new ApiError(400, "Invalid category ID");
    }

    // Amount validation
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new ApiError(400, "Amount must be greater than 0");
    }

    // Check category belongs to logged-in user
    const category = await Categories.findOne({
        _id: categoryid,
        userid: req.user._id
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Create budget
    const budget = await Budgets.create({
        userid: req.user._id,
        categoryid,
        amount: numericAmount,
        month: month.trim()
    });

    return res.status(201).json(
        new ApiResponse(201, budget, "Budget created successfully")
    );
});


// GET ALL BUDGETS
const getAllBudgets = asyncHandler(async (req, res) => {

    const budgets = await Budgets.find({
        userid: req.user._id
    })
        .populate("categoryid", "category_name type icon")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, budgets, "Budgets fetched successfully")
    );
});


// GET SINGLE BUDGET
const getSingleBudget = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid budget ID");
    }

    const budget = await Budgets.findOne({
        _id: id,
        userid: req.user._id
    }).populate("categoryid", "category_name type icon");

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    return res.status(200).json(
        new ApiResponse(200, budget, "Budget fetched successfully")
    );
});


// UPDATE BUDGET
const updateBudgets = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { categoryid, amount, month } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid budget ID");
    }

    // Check whether budget exists for logged-in user
    const existingBudget = await Budgets.findOne({
        _id: id,
        userid: req.user._id
    });

    if (!existingBudget) {
        throw new ApiError(404, "Budget not found");
    }

    const updateData = {};

    // Validate category if provided
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

        updateData.categoryid = categoryid;
    }

    // Validate amount if provided
    if (amount !== undefined) {

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            throw new ApiError(400, "Amount must be greater than 0");
        }

        updateData.amount = numericAmount;
    }

    // Validate month if provided
    if (month !== undefined) {

        if (typeof month !== "string" || !month.trim()) {
            throw new ApiError(400, "Invalid month");
        }

        updateData.month = month.trim();
    }

    const updatedBudget = await Budgets.findOneAndUpdate(
        {
            _id: id,
            userid: req.user._id
        },
        {
            $set: updateData
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("categoryid", "category_name type icon");

    return res.status(200).json(
        new ApiResponse(200, updatedBudget, "Budget updated successfully")
    );
});


// DELETE BUDGET
const deleteBudgets = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid budget ID");
    }

    const budget = await Budgets.findOneAndDelete({
        _id: id,
        userid: req.user._id
    });

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    return res.status(200).json(
        new ApiResponse(200, budget, "Budget deleted successfully")
    );
});


export {
    createBudgets,
    getAllBudgets,
    getSingleBudget,
    updateBudgets,
    deleteBudgets
};
