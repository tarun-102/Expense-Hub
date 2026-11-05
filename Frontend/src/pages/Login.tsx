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
    FiLock,
} from "react-icons/fi";

import FormikInput from "../components/common/FormikInput";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loginThunk } from "../features/auth/authSlice";

import {
    loginValidationSchema,
    type LoginFormValues
} from "../features/auth/validation/authValidation";

const Login = () => {

    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { loading } = useAppSelector(
        (state) => state.auth
    );

    const formik = useFormik<LoginFormValues>({
        initialValues: {
            email: "",
            password: ""
        },

        validationSchema: loginValidationSchema,

        onSubmit: async (values) => {
            try {
                await dispatch(loginThunk(values)).unwrap();

                toast.success("Login successful!");
                navigate("/dashboard");

            } catch (error) {
                toast.error(
                    typeof error === "string"
                        ? error
                        : "Login failed. Please try again."
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
                            <span>✦ Smart Financial Management</span>
                        </div>

                        <h1>
                            Manage Your Money <span className="gradient-text">Smartly.</span>
                        </h1>

                        <p>
                            Track income & expenses, plan budgets with ease, and achieve financial freedom.
                        </p>

                        <div className="auth-features">
                            <div className="auth-feature-item">
                                <div className="auth-feature-icon primary">
                                    <FiTrendingUp />
                                </div>
                                <div className="auth-feature-text">
                                    <strong>Real-time Tracking</strong>
                                    <small>Instant updates for income, expenses & investments</small>
                                </div>
                            </div>

                            <div className="auth-feature-item">
                                <div className="auth-feature-icon success">
                                    <FiTarget />
                                </div>
                                <div className="auth-feature-text">
                                    <strong>Target-based Budgets</strong>
                                    <small>Set monthly limits and keep your savings on target</small>
                                </div>
                            </div>

                            <div className="auth-feature-item">
                                <div className="auth-feature-icon warning">
                                    <FiShield />
                                </div>
                                <div className="auth-feature-text">
                                    <strong>Secure & Private</strong>
                                    <small>Your financial records are encrypted and protected</small>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="auth-form-wrapper">

                    <Card className="auth-card border-0">

                        <Card.Body className="p-4 p-md-5">

                            <div className="auth-card-badge">
                                <FiLock />
                            </div>

                            <h2 className="auth-title">
                                Welcome Back
                            </h2>

                            <p className="auth-subtitle">
                                Enter your credentials to access your account
                            </p>

                            <Form onSubmit={formik.handleSubmit}>

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
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
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

                                <Button
                                    type="submit"
                                    className="auth-submit w-100 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? "Signing In..." : "Sign In"}
                                </Button>

                            </Form>

                            <div className="auth-footer">
                                Don't have an account?
                                {" "}
                                <Link to="/register" className="auth-link">
                                    Sign Up
                                </Link>
                            </div>

                        </Card.Body>

                    </Card>

                </div>

            </div>

        </FormikProvider>
    );
};

export default Login;
