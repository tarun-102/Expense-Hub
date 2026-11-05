
import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "react-bootstrap";

import { useAppSelector } from "../app/hooks";

const PublicRoute = () => {
    const { isAuthenticated, initialized } = useAppSelector(
        (state) => state.auth
    );

    if (!initialized) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : <Outlet />;
};

export default PublicRoute;