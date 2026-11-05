
import {
    createBrowserRouter,
    Navigate,
    Outlet,
} from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/common/Loader";

import { useAppSelector } from "../app/hooks";

import Login from "../pages/Login";
import Register from "../pages/Register";
import CategoryPage from "../pages/Category";
import PartyPage from "../pages/Party";
import TransactionPage from "../pages/Transaction";
import BudgetPage from "../pages/Budget";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
const PublicRoute = () => {
    const { isAuthenticated, initialized } = useAppSelector(
        (state) => state.auth
    );

    if (!initialized) return <Loader />;

    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : <Outlet />;
};

const ProtectedRoute = () => {
    const { isAuthenticated, initialized } = useAppSelector(
        (state) => state.auth
    );

    if (!initialized) return <Loader />;

    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: "/login",
                        element: <Login />,
                    },
                    {
                        path: "/register",
                        element: <Register />,
                    },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        path: "/dashboard",
                        element: <Dashboard />
                    },
                    {
                        path: "/categories",
                        element: <CategoryPage />,
                    },
                    {
                        path: "/parties",
                        element: <PartyPage />,
                    },
                    {
                        path: "/transactions",
                        element: <TransactionPage />,
                    },
                    {
                        path: "/budgets",
                        element: <BudgetPage />,
                    },
                    {
                        path: "profile",
                        element: <Profile />,
                    },
                    {
                        path: "settings",
                        element: <Settings />,
                    },
                ],
            },
        ],
    },
    {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
    },
]);

export default router;