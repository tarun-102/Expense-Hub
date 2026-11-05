import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form } from "react-bootstrap";
import { useFormik, FormikProvider } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import {
    FiCreditCard,
    FiTrendingUp,
    FiTarget,
    FiShield,
    FiUserCheck,
} from "react-icons/fi";

import FormikInput from "../components/common/FormikInput";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { registerThunk, loginThunk } from "../features/auth/authSlice";

import {
    registerValidationSchema,
    type RegisterFormValues
} from "../features/auth/validation/authValidation";

const Register = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { loading } = useAppSelector(
        (state) => state.auth
    );

    const formik = useFormik<RegisterFormValues>({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },

        validationSchema: registerValidationSchema,

        onSubmit: async (values) => {

            try {

                const { confirmPassword, ...registerData } = values;

                await dispatch(registerThunk(registerData)).unwrap();

                // auto login
                await dispatch(
                    loginThunk({
                        email: registerData.email,
                        password: registerData.password,
                    })
                ).unwrap();

                toast.success("Account created successfully!");
                navigate("/dashboard");

            } catch (error) {

                toast.error(
                    typeof error === "string"
                        ? error
                        : "Registration failed. Please try again."
                );

            }
        }
    });

    return (
        <FormikProvider value={formik}>

            <div className="auth-page">

                <div className="auth-brand">

                    <div className="brand-logo ms-md-4 ps-md-4">
                        <div className="brand-icon-box">
                            <FiCreditCard size={22} />
                        </div>
                        <span>Expense<span className="text-primary">Hub</span></span>
                    </div>

                    <div className="brand-content ms-md-4 ps-md-4">
                        <div className="auth-badge">
                            <span>✦ Join ExpenseHub Today</span>
                        </div>

                        <h1>
                            Start Your Financial <span className="gradient-text">Journey.</span>
                        </h1>

                        <p>
                            Create an account in seconds and unlock automated insights for all your expenses.
                        </p>

                        <div className="auth-features">
                            <div className="auth-feature-item">
                                <div className="auth-feature-icon primary">
                                    <FiTrendingUp />
                                </div>
                                <div className="auth-feature-text">
                                    <strong>Ready-made Categories</strong>
                                    <small>Pre-configured with essential expense & income tags</small>
                                </div>
                            </div>

                            <div className="auth-feature-item">
                                <div className="auth-feature-icon success">
                                    <FiTarget />
                                </div>
                                <div className="auth-feature-text">
                                    <strong>Multi-Party Tracking</strong>
                                    <small>Organize transactions by banks, merchants & friends</small>
                                </div>
                            </div>

                            <div className="auth-feature-item">
                                <div className="auth-feature-icon warning">
                                    <FiShield />
                                </div>
                                <div className="auth-feature-text">
                                    <strong>Instant Dashboard</strong>
                                    <small>Direct access right after registration</small>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="auth-form-wrapper">

                    <Card className="auth-card border-0">

                        <Card.Body className="p-4 p-md-5">

                            <div className="auth-card-badge">
                                <FiUserCheck />
                            </div>

                            <h2 className="auth-title">
                                Create Account
                            </h2>

                            <p className="auth-subtitle">
                                Join us and take control of your finances
                            </p>

                            <Form onSubmit={formik.handleSubmit}>

                                <FormikInput
                                    name="name"
                                    label="Username"
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                />

                                <FormikInput
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />

                                <div className="password-wrapper">

                                    <FormikInput
                                        name="password"
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create password"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(prev => !prev)
                                        }
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>

                                </div>

                                <div className="password-wrapper">

                                    <FormikInput
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm password"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(prev => !prev)
                                        }
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        {showConfirmPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>

                                </div>

                                <Button
                                    type="submit"
                                    className="auth-submit w-100 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                </Button>

                            </Form>

                            <div className="auth-footer">
                                Already have an account?
                                {" "}
                                <Link to="/login" className="auth-link">
                                    Sign In
                                </Link>
                            </div>

                        </Card.Body>

                    </Card>

                </div>

            </div>

        </FormikProvider>
    );
};

export default Register;
