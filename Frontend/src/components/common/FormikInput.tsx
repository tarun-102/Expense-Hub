
import { Form } from "react-bootstrap";
import { useField } from "formik";

interface FormikInputProps {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
}

const FormikInput = ({
    label,
    type = "text",
    ...props
}: FormikInputProps) => {

    const [field, meta] = useField(props.name);

    const showError = meta.touched && Boolean(meta.error);

    return (
        <Form.Group className="mb-3">

            <Form.Label className="fw-semibold">
                {label}
            </Form.Label>

            <Form.Control
                {...field}
                {...props}
                type={type}
                disabled={props.disabled}
                isInvalid={showError}
                className="auth-input"
            />

            {showError && (
                <Form.Control.Feedback type="invalid">
                    {meta.error}
                </Form.Control.Feedback>
            )}

        </Form.Group>
    );
};

export default FormikInput;
