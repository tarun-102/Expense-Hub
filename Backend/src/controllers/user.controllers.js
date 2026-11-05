
import jwt from "jsonwebtoken";

import { User } from "../models/users.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { cookiesOption } from "../constants.js";
import { createDefaultUserData } from "../utils/defaultUserData.js";

// Generate Access Token and Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accesstoken = user.generateAccessToken();
        const refreshtoken = user.generateRefreshToken();

        user.refreshtoken = refreshtoken;

        await user.save({
            validateBeforeSave: false,
        });

        return { accesstoken, refreshtoken };

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            error.message || "Failed to generate tokens"
        );
    }
};


// REGISTER USER
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (
        [name, email, password].some(
            (field) => typeof field !== "string" || !field.trim()
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existedUser = await User.findOne({
        email: normalizedEmail,
    });

    if (existedUser) {
        throw new ApiError(409, "User already registered");
    }

    // Create new user
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
    });

    try {
        // Automatically create default categories and parties
        await createDefaultUserData(user._id);

    } catch (error) {
        // Rollback user creation if default data creation fails
        await User.findByIdAndDelete(user._id);

        throw new ApiError(
            500,
            error.message || "Failed to create default user data"
        );
    }

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully with default categories and parties"
        )
    );
});


// LOGIN USER
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new ApiError(400, "Email and password are required");
    }

    const existedUser = await User.findOne({
        email: email.trim().toLowerCase(),
    });

    if (!existedUser) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid =
        await existedUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accesstoken, refreshtoken } =
        await generateAccessAndRefreshToken(existedUser._id);

    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshtoken"
    );

    return res
        .status(200)
        .cookie("accesstoken", accesstoken, cookiesOption)
        .cookie("refreshtoken", refreshtoken, cookiesOption)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accesstoken,
                    refreshtoken,
                },
                "User logged in successfully"
            )
        );
});


// LOGOUT USER
const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshtoken: 1,
            },
        }
    );

    return res
        .status(200)
        .clearCookie("accesstoken", cookiesOption)
        .clearCookie("refreshtoken", cookiesOption)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});


// REFRESH ACCESS TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshtoken || req.body?.refreshtoken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshtoken) {
            throw new ApiError(401, "Refresh token expired or invalid");
        }

        const { accesstoken, refreshtoken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accesstoken", accesstoken, cookiesOption)
            .cookie("refreshtoken", refreshtoken, cookiesOption)
            .json(
                new ApiResponse(
                    200,
                    {
                        accesstoken,
                        refreshtoken,
                    },
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            401,
            error.message || "Invalid or expired refresh token"
        );
    }
});


// GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        )
    );
});


// CHANGE CURRENT PASSWORD
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (
        typeof oldPassword !== "string" ||
        !oldPassword ||
        typeof newPassword !== "string" ||
        !newPassword
    ) {
        throw new ApiError(
            400,
            "Old password and new password are required"
        );
    }

    if (oldPassword === newPassword) {
        throw new ApiError(
            400,
            "New password must be different from old password"
        );
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect =
        await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;

    await user.save({
        validateBeforeSave: true,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    );
});


export {
    register,
    login,
    logout,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
};
