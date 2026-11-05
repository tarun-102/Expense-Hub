import type { ChangeEvent, FormEvent } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import Modal from "./Modal";

export interface FormField {
    name: string;
    label: string;
    type?:
        | "text"
        | "number"
        | "email"
        | "date"
        | "month"
        | "url"
        | "select"
        | "textarea";
    placeholder?: string;
    required?: boolean;
    options?: {
        label: string;
        value: string;
    }[];
    colSpan?: 6 | 12;
}

interface ReusableFormModalProps<T extends object> {
    show: boolean;
    title: string;
    fields: FormField[];
    values: T;
    loading?: boolean;
    error?: string | null;
    submitText?: string;
    size?: "sm" | "lg" | "xl";
    onChange: (name: string, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}

const ReusableFormModal = <T extends object>({
    show,
    title,
    fields,
    values,
    loading = false,
    error,
    submitText = "Save",
    size = "lg",
    onChange,
    onSubmit,
    onClose,
}: ReusableFormModalProps<T>) => {
    const getValue = (name: string): string => {
        const record = values as Record<string, unknown>;
        return String(record[name] ?? "");
    };

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        onChange(event.target.name, event.target.value);
    };

    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size={size}
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="reusable-modal-form"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Saving...
                            </>
                        ) : (
                            submitText
                        )}
                    </Button>
                </>
            }
        >
            <Form id="reusable-modal-form" onSubmit={onSubmit}>
                <Row className="g-3">
                    {fields.map((field) => {
                        const isTextarea = field.type === "textarea";
                        const mdCols = field.colSpan || (isTextarea ? 12 : 6);

                        return (
                            <Col xs={12} md={mdCols} key={field.name}>
                                <Form.Group>
                                    <Form.Label className="fw-medium small text-dark mb-1">
                                        {field.label}
                                        {field.required && (
                                            <span className="text-danger ms-1">*</span>
                                        )}
                                    </Form.Label>

                                    {field.type === "select" ? (
                                        <Form.Select
                                            name={field.name}
                                            value={getValue(field.name)}
                                            onChange={handleChange}
                                            required={field.required}
                                        >
                                            <option value="">
                                                Select {field.label}
                                            </option>

                                            {field.options?.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    ) : field.type === "textarea" ? (
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name={field.name}
                                            value={getValue(field.name)}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                        />
                                    ) : (
                                        <Form.Control
                                            type={field.type || "text"}
                                            name={field.name}
                                            value={getValue(field.name)}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            min={field.type === "number" ? 0 : undefined}
                                        />
                                    )}
                                </Form.Group>
                            </Col>
                        );
                    })}
                </Row>

                {error && (
                    <div className="alert alert-danger mt-3 mb-0">
                        {error}
                    </div>
                )}
            </Form>
        </Modal>
    );
};

export default ReusableFormModal;
