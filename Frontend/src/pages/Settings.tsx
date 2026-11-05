import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "../app/hooks";
import { logoutThunk } from "../features/auth/authSlice";
import axiosInstance from "../services/axiosInstance";

interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const Settings = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<PasswordForm>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !formData.oldPassword ||
            !formData.newPassword ||
            !formData.confirmPassword
        ) {
            toast.error("Please fill all password fields");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            toast.error("New password must be different from old password");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }

        try {
            setLoading(true);

            const response = await axiosInstance.patch(
                "/api/v1/users/reset-password",
                {
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                }
            );

            toast.success(
                response.data?.message || "Password changed successfully! Please log in with your new password."
            );

            setFormData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            await dispatch(logoutThunk());
            navigate("/login");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Unable to change password"
                );
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-3">
            <div className="mb-4">
                <h3 className="fw-bold mb-1">Settings</h3>
                <p className="text-muted mb-0">
                    Manage your account security and password.
                </p>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="rounded-3 p-3 bg-light">
                                    <FiLock size={24} />
                                </div>

                                <div>
                                    <h5 className="fw-bold mb-1">
                                        Change Password
                                    </h5>
                                    <p className="text-muted mb-0 small">
                                        Update your account password.
                                    </p>
                                </div>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Current Password
                                    </Form.Label>

                                    <div className="position-relative">
                                        <Form.Control
                                            type={
                                                showOldPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="oldPassword"
                                            value={formData.oldPassword}
                                            onChange={handleChange}
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                        />

                                        <Button
                                            type="button"
                                            variant="link"
                                            className="position-absolute top-50 end-0 translate-middle-y text-muted"
                                            onClick={() =>
                                                setShowOldPassword(!showOldPassword)
                                            }
                                        >
                                            {showOldPassword ? (
                                                <FiEyeOff />
                                            ) : (
                                                <FiEye />
                                            )}
                                        </Button>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        New Password
                                    </Form.Label>

                                    <div className="position-relative">
                                        <Form.Control
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />

                                        <Button
                                            type="button"
                                            variant="link"
                                            className="position-absolute top-50 end-0 translate-middle-y text-muted"
                                            onClick={() =>
                                                setShowNewPassword(!showNewPassword)
                                            }
                                        >
                                            {showNewPassword ? (
                                                <FiEyeOff />
                                            ) : (
                                                <FiEye />
                                            )}
                                        </Button>
                                    </div>

                                    <Form.Text className="text-muted">
                                        Minimum 6 characters.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        Confirm New Password
                                    </Form.Label>

                                    <div className="position-relative">
                                        <Form.Control
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                        />

                                        <Button
                                            type="button"
                                            variant="link"
                                            className="position-absolute top-50 end-0 translate-middle-y text-muted"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <FiEyeOff />
                                            ) : (
                                                <FiEye />
                                            )}
                                        </Button>
                                    </div>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        background: "#4A315D",
                                        borderColor: "#4A315D",
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                size="sm"
                                                className="me-2"
                                            />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div
                                className="rounded-3 p-3 mb-3 d-inline-flex"
                                style={{
                                    background: "#F1EEE8",
                                    color: "#4A315D",
                                }}
                            >
                                <FiShield size={25} />
                            </div>

                            <h5 className="fw-bold">
                                Account Security
                            </h5>

                            <p className="text-muted small mb-3">
                                Keep your account safe by using a strong,
                                unique password.
                            </p>

                            <ul className="text-muted small ps-3 mb-0">
                                <li className="mb-2">
                                    Use at least 6 characters.
                                </li>
                                <li className="mb-2">
                                    Avoid sharing your password.
                                </li>
                                <li>
                                    Change your password if you suspect
                                    unauthorized access.
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Settings;
