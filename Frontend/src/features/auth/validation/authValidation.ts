import * as Yup from "yup";

// Login Validation
export const loginValidationSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),

    password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
});

// Register Validation
export const registerValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required("Username is required")
        .min(3, "Name must be at least 3 characters"),

    email: Yup.string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),

    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),

    confirmPassword: Yup.string()
        .required("Confirm password is required")
        .oneOf(
            [Yup.ref("password")],
            "Passwords do not match"
        ),
});

// TypeScript Types
export type LoginFormValues =
    Yup.InferType<typeof loginValidationSchema>;

export type RegisterFormValues =
    Yup.InferType<typeof registerValidationSchema>;