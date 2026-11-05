import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Badge,
    Button,
    Card,
    Form,
    InputGroup,
    Spinner,
    Table,
} from "react-bootstrap";
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import ReusableFormModal, {
    type FormField,
} from "../components/common/ReusableFormModal";
import Modal from "../components/common/Modal";
import {
    getAllBudgetsThunk,
    createBudgetThunk,
    updateBudgetThunk,
    deleteBudgetThunk,
    setSelectedBudget,
    clearSelectedBudget,
    clearBudgetError,
} from "../features/budget/budgetSlice";
import { getAllCategoriesThunk } from "../features/category/categorySlice";
import { addActivityNotification } from "../utils/notificationHelper";
import type {
    Budget,
    BudgetPayload,
} from "../features/budget/budgetTypes";

interface BudgetFormValues {
    categoryid: string;
    amount: string;
    month: string;
}

const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const initialForm: BudgetFormValues = {
    categoryid: "",
    amount: "",
    month: getCurrentMonth(),
};

const BudgetPage = () => {
    const dispatch = useAppDispatch();

    const {
        budgets,
        selectedBudget,
        loading,
        error,
    } = useAppSelector((state) => state.budget);

    const { categories } = useAppSelector((state) => state.category);

    const [searchParams] = useSearchParams();
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [search, setSearch] = useState(() => searchParams.get("search") || "");
    const [monthFilter, setMonthFilter] = useState("all");

    useEffect(() => {
        const q = searchParams.get("search");
        if (q !== null) setSearch(q);
    }, [searchParams]);

    const [formData, setFormData] = useState<BudgetFormValues>(initialForm);

    useEffect(() => {
        dispatch(getAllBudgetsThunk());
        dispatch(getAllCategoriesThunk());
    }, [dispatch]);

    const getCategoryId = (cat: unknown): string => {
        if (!cat) return "";
        if (typeof cat === "object" && cat !== null && "_id" in cat) {
            return String((cat as { _id: string })._id);
        }
        return String(cat);
    };

    const getCategoryName = (cat: unknown) => {
        if (!cat) return "Category";
        if (typeof cat === "object" && cat !== null && "category_name" in cat) {
            return (cat as { category_name: string }).category_name || "Category";
        }
        const id = getCategoryId(cat);
        return (
            categories.find((category) => category._id === id)
                ?.category_name || "Category"
        );
    };

    const getCategoryType = (cat: unknown): string => {
        if (typeof cat === "object" && cat !== null && "type" in cat) {
            const t = (cat as { type?: string }).type;
            if (t) return t;
        }
        const id = getCategoryId(cat);
        const found = categories.find((category) => category._id === id);
        return found?.type || "expense";
    };

    const getCategoryTypeBadge = (cat: unknown) => {
        const type = getCategoryType(cat).toLowerCase();
        if (type === "income") {
            return <Badge bg="success" className="text-capitalize">Income</Badge>;
        }
        if (type === "investment") {
            return <Badge bg="primary" className="text-capitalize">Investment</Badge>;
        }
        return <Badge bg="danger" className="text-capitalize">Expense</Badge>;
    };

    const filteredBudgets = useMemo(() => {
        return budgets.filter((budget) => {
            const categoryName = getCategoryName(budget.categoryid);
            const matchesSearch = categoryName
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesMonth =
                monthFilter === "all" || budget.month === monthFilter;

            return matchesSearch && matchesMonth;
        });
    }, [budgets, categories, search, monthFilter]);

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatMonth = (month: string) => {
        const [year, monthNumber] = month.split("-").map(Number);
        return new Date(year, monthNumber - 1).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
        });
    };

    const budgetFields: FormField[] = [
        {
            name: "categoryid",
            label: "Category",
            type: "select",
            required: true,
            options: categories.map((category) => {
                const typeLabel = category.type
                    ? ` (${category.type.charAt(0).toUpperCase() + category.type.slice(1)})`
                    : "";
                return {
                    label: `${category.category_name}${typeLabel}`,
                    value: category._id,
                };
            }),
            colSpan: 6,
        },
        {
            name: "month",
            label: "Budget Month",
            type: "month",
            required: true,
            colSpan: 6,
        },
        {
            name: "amount",
            label: "Budget Amount (₹)",
            type: "number",
            placeholder: "Enter budget amount",
            required: true,
            colSpan: 12,
        },
    ];

    const handleOpenAdd = () => {
        dispatch(clearSelectedBudget());
        dispatch(clearBudgetError());
        dispatch(getAllCategoriesThunk());
        setFormData(initialForm);
        setShowModal(true);
    };

    const handleEdit = (budget: Budget) => {
        dispatch(setSelectedBudget(budget));
        dispatch(clearBudgetError());
        dispatch(getAllCategoriesThunk());
        setFormData({
            categoryid: getCategoryId(budget.categoryid),
            amount: String(budget.amount),
            month: budget.month,
        });
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        dispatch(clearSelectedBudget());
        dispatch(clearBudgetError());
        setFormData(initialForm);
    };

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const amount = Number(formData.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const payload: BudgetPayload = {
            categoryid: formData.categoryid,
            amount,
            month: formData.month,
        };

        try {
            if (selectedBudget) {
                await dispatch(
                    updateBudgetThunk({
                        id: selectedBudget._id,
                        data: payload,
                    })
                ).unwrap();
                toast.success("Budget updated successfully!");
            } else {
                await dispatch(createBudgetThunk(payload)).unwrap();
                toast.success("Budget created successfully!");

                const cat = categories.find((c) => c._id === payload.categoryid);
                addActivityNotification({
                    title: "New Budget Created",
                    message: `Budget of ₹${Number(payload.amount).toLocaleString("en-IN")} set for ${cat?.category_name || "Category"}.`,
                    type: "budget",
                    link: "/budgets",
                });
            }

            handleClose();
        } catch {
            // handled by reducer
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        dispatch(clearBudgetError());

        try {
            await dispatch(deleteBudgetThunk(deleteId)).unwrap();
            toast.success("Budget deleted successfully!");
            setDeleteId(null);
        } catch {
            // handled by reducer
        }
    };

    const totalBudget = filteredBudgets.reduce(
        (sum, budget) => sum + budget.amount,
        0
    );

    return (
        <div className="budget-page">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Budgets</h3>
                    <p className="text-muted mb-0">
                        Plan and manage your monthly category budgets.
                    </p>
                </div>

                <Button onClick={handleOpenAdd}>
                    <FiPlus className="me-2" />
                    Add Budget
                </Button>
            </div>

            {/* Summary */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <p className="text-muted mb-2">
                        Total Budget (Filtered)
                    </p>
                    <h3 className="fw-bold mb-0">
                        {formatAmount(totalBudget)}
                    </h3>
                    <small className="text-muted">
                        {filteredBudgets.length} budget records
                    </small>
                </Card.Body>
            </Card>

            {/* Budget Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                        <h5 className="fw-semibold mb-0">
                            All Budgets ({budgets.length})
                        </h5>

                        <div className="d-flex flex-wrap gap-2">
                            <InputGroup style={{ maxWidth: "240px" }}>
                                <InputGroup.Text>
                                    <FiSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search category..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>

                            <Form.Select
                                style={{ width: "190px" }}
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                            >
                                <option value="all">All Months</option>
                                {[...new Set(budgets.map((b) => b.month))]
                                    .sort()
                                    .reverse()
                                    .map((month) => (
                                        <option key={month} value={month}>
                                            {formatMonth(month)}
                                        </option>
                                    ))}
                            </Form.Select>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {loading && budgets.length === 0 ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="d-none d-md-block">
                                <Table responsive hover className="align-middle">
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Category</th>
                                            <th>Category Type</th>
                                            <th>Month</th>
                                            <th>Budget Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredBudgets.length > 0 ? (
                                            filteredBudgets.map((budget, index) => (
                                                <tr key={budget._id}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-semibold">
                                                        {getCategoryName(budget.categoryid)}
                                                    </td>
                                                    <td>
                                                        {getCategoryTypeBadge(budget.categoryid)}
                                                    </td>
                                                    <td>
                                                        {formatMonth(budget.month)}
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {formatAmount(budget.amount)}
                                                    </td>
                                                    <td>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            className="me-2"
                                                            onClick={() => handleEdit(budget)}
                                                            disabled={loading}
                                                        >
                                                            <FiEdit2 />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => handleDelete(budget._id)}
                                                            disabled={loading}
                                                        >
                                                            <FiTrash2 />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-5 text-muted">
                                                    No budgets found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="d-md-none mobile-card-list">
                                {filteredBudgets.length > 0 ? (
                                    filteredBudgets.map((budget) => (
                                        <div key={budget._id} className="mobile-data-card">
                                            <div className="mobile-card-header">
                                                <div>
                                                    <div className="mobile-card-title">
                                                        {getCategoryName(budget.categoryid)}
                                                    </div>
                                                    <div className="mt-1">
                                                        {getCategoryTypeBadge(budget.categoryid)}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="mobile-card-amount text-primary">
                                                        {formatAmount(budget.amount)}
                                                    </div>
                                                    <small className="text-muted d-block mt-1">
                                                        {formatMonth(budget.month)}
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="mobile-card-actions">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="px-3 py-1 d-inline-flex align-items-center gap-1"
                                                    onClick={() => handleEdit(budget)}
                                                    disabled={loading}
                                                >
                                                    <FiEdit2 size={13} /> Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="px-3 py-1 d-inline-flex align-items-center gap-1"
                                                    onClick={() => handleDelete(budget._id)}
                                                    disabled={loading}
                                                >
                                                    <FiTrash2 size={13} /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        No budgets found.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            <ReusableFormModal
                show={showModal}
                title={selectedBudget ? "Edit Budget" : "Add Budget"}
                fields={budgetFields}
                values={formData}
                loading={loading}
                error={error}
                submitText={selectedBudget ? "Update Budget" : "Create Budget"}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={handleClose}
            />

            <Modal
                show={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                title="Delete Budget"
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                loading={loading}
            >
                Are you sure you want to delete this budget? This action cannot be undone.
            </Modal>
        </div>
    );
};

export default BudgetPage;
