
import {
    createSlice,
    createAsyncThunk,
} from "@reduxjs/toolkit";

import axios from "axios";

import {
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
} from "./authService";

import type {
    AuthState,
    LoginPayload,
    RegisterPayload,
    User,
} from "./authTypes";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    initialized: false,
    error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

// LOGIN
export const loginThunk = createAsyncThunk<
    User,
    LoginPayload,
    { rejectValue: string }
>("auth/login", async (data, { rejectWithValue }) => {
    try {
        const response = await loginUser(data);

        if (!response.data.user) {
            return rejectWithValue("User data not found");
        }

        return response.data.user;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error, "Login failed"));
    }
});

// REGISTER
export const registerThunk = createAsyncThunk<
    User,
    RegisterPayload,
    { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
    try {
        const response = await registerUser(data);

        if (!response.data || !("_id" in response.data)) {
            return rejectWithValue("User data not found");
        }

        return response.data as User;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Registration failed")
        );
    }
});

// GET CURRENT USER
export const getCurrentUserThunk = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
    try {
        const response = await getCurrentUser();

        if (!response.data || !("_id" in response.data)) {
            return rejectWithValue("User data not found");
        }

        return response.data as User;
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Session expired")
        );
    }
});

// LOGOUT
export const logoutThunk = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
    try {
        await logoutUser();
    } catch (error) {
        return rejectWithValue(
            getErrorMessage(error, "Logout failed")
        );
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // LOGIN
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.initialized = true;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Login failed";
            })

            // REGISTER
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.initialized = true;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Registration failed";
            })

            // GET CURRENT USER
            .addCase(getCurrentUserThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUserThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.initialized = true;
            })
            .addCase(getCurrentUserThunk.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.initialized = true;
            })

            // LOGOUT
            .addCase(logoutThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.initialized = true;
            })
            .addCase(logoutThunk.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload || "Logout failed";
            });
    },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;