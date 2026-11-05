
    import { useEffect, useMemo, useState } from "react";
    import { useSearchParams } from "react-router-dom";
    import type { FormEvent } from "react";
    import { Button, Card, Form, Table, Badge, Spinner } from "react-bootstrap";
    import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiLayers } from "react-icons/fi";
    import { toast } from "react-toastify";

    import { useAppDispatch, useAppSelector } from "../app/hooks";

    import {
        getAllCategoriesThunk,
        createCategoryThunk,
        updateCategoryThunk,
        deleteCategoryThunk,
    } from "../features/category/categorySlice";

    import type {
        Category,
        CategoryPayload,
        CategoryType,
    } from "../features/category/categoryTypes";

    import ReusableFormModal from "../components/common/ReusableFormModal";
    import Modal from "../components/common/Modal";
    import { addActivityNotification } from "../utils/notificationHelper";

    const CategoryPage = () => {
        const dispatch = useAppDispatch();

        const { categories, loading, error } = useAppSelector(
            (state) => state.category
        );

        const [searchParams] = useSearchParams();
        const [showModal, setShowModal] = useState(false);
        const [deleteId, setDeleteId] = useState<string | null>(null);
        const [editingCategory, setEditingCategory] =
            useState<Category | null>(null);

        const [search, setSearch] = useState(() => searchParams.get("search") || "");

        useEffect(() => {
            const q = searchParams.get("search");
            if (q !== null) setSearch(q);
        }, [searchParams]);

        const initialFormData: CategoryPayload = {
            category_name: "",
            type: "expense",
        };

        const [formData, setFormData] =
            useState<CategoryPayload>(initialFormData);

        useEffect(() => {
            dispatch(getAllCategoriesThunk());
        }, [dispatch]);

        const filteredCategories = useMemo(() => {
            return categories.filter((category) =>
                category.category_name
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }, [categories, search]);

        const handleAdd = () => {
            setEditingCategory(null);
            dispatch(getAllCategoriesThunk());
            setFormData(initialFormData);
            setShowModal(true);
        };

        const handleEdit = (category: Category) => {
            setEditingCategory(category);

            setFormData({
                category_name: category.category_name,
                type: category.type,
            });

            setShowModal(true);
        };

        const handleChange = (name: string, value: string) => {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        };

        const handleClose = () => {
            setShowModal(false);
            setEditingCategory(null);
            setFormData(initialFormData);
        };

        const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!formData.category_name.trim()) {
                toast.error("Please enter category name");
                return;
            }

            const payload: CategoryPayload = {
                category_name: formData.category_name.trim(),
                type: formData.type,
            };

            try {
                if (editingCategory) {
                    await dispatch(
                        updateCategoryThunk({
                            id: editingCategory._id,
                            data: payload,
                        })
                    ).unwrap();

                    toast.success("Category updated successfully");
                } else {
                    await dispatch(
                        createCategoryThunk(payload)
                    ).unwrap();

                    toast.success("Category created successfully");

                    addActivityNotification({
                        title: "New Category Added",
                        message: `Category "${payload.category_name}" (${payload.type}) created.`,
                        type: "category",
                        link: "/categories",
                    });
                }

                handleClose();
            } catch (err) {
                toast.error(
                    typeof err === "string"
                        ? err
                        : "Something went wrong"
                );
            }
        };

        const handleDelete = (id: string) => {
            setDeleteId(id);
        };

        const handleConfirmDelete = async () => {
            if (!deleteId) return;

            try {
                await dispatch(deleteCategoryThunk(deleteId)).unwrap();
                toast.success("Category deleted successfully");
                setDeleteId(null);
            } catch (err) {
                toast.error(
                    typeof err === "string"
                        ? err
                        : "Unable to delete category"
                );
            }
        };

        const getTypeBadge = (type: CategoryType) => {
            switch (type) {
                case "income":
                    return <Badge bg="success">Income</Badge>;

                case "expense":
                    return <Badge bg="danger">Expense</Badge>;

                case "investment":
                    return <Badge bg="primary">Investment</Badge>;

                default:
                    return <Badge bg="secondary">{type}</Badge>;
            }
        };

        const fields = [
            {
                name: "category_name",
                label: "Category Name",
                type: "text" as const,
                placeholder: "Enter category name",
                required: true,
                colSpan: 6 as const,
            },
            {
                name: "type",
                label: "Category Type",
                type: "select" as const,
                required: true,
                options: [
                    { label: "Expense", value: "expense" },
                    { label: "Income", value: "income" },
                    { label: "Investment", value: "investment" },
                ],
                colSpan: 6 as const,
            },
        ];

        return (
            <div className="container-fluid py-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-1">Categories</h3>
                        <p className="text-muted mb-0">
                            Manage your income, expense and investment categories
                        </p>
                    </div>

                    <Button variant="primary" onClick={handleAdd}>
                        <FiPlus className="me-2" />
                        Add Category
                    </Button>
                </div>

                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        <div className="mb-3" style={{ maxWidth: "350px" }}>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FiSearch />
                                </span>

                                <Form.Control
                                    type="text"
                                    placeholder="Search category..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" />
                                <p className="mt-2 text-muted">
                                    Loading categories...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="d-none d-md-block table-responsive">
                                    <Table hover className="align-middle">
                                        <thead>
                                            <tr>
                                                <th>No.</th>
                                                <th>Icon</th>
                                                <th>Category Name</th>
                                                <th>Type</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredCategories.length > 0 ? (
                                                filteredCategories.map(
                                                    (category, index) => (
                                                        <tr key={category._id}>
                                                            <td>{index + 1}</td>

                                                            <td>
                                                                {category.icon ? (
                                                                    <img
                                                                        src={category.icon}
                                                                        alt={category.category_name}
                                                                        width={28}
                                                                        height={28}
                                                                        style={{
                                                                            objectFit: "contain",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span className="text-muted">
                                                                        —
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td className="fw-semibold">
                                                                {category.category_name}
                                                            </td>

                                                            <td>
                                                                {getTypeBadge(category.type)}
                                                            </td>

                                                            <td className="text-end">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-primary"
                                                                    className="me-2"
                                                                    onClick={() =>
                                                                        handleEdit(category)
                                                                    }
                                                                >
                                                                    <FiEdit2 />
                                                                </Button>

                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-danger"
                                                                    onClick={() =>
                                                                        handleDelete(category._id)
                                                                    }
                                                                >
                                                                    <FiTrash2 />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="text-center py-4 text-muted"
                                                    >
                                                        No categories found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="d-md-none mobile-card-list">
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((category) => (
                                            <div key={category._id} className="mobile-data-card">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
                                                        {category.icon ? (
                                                            <div
                                                                style={{
                                                                    width: "42px",
                                                                    height: "42px",
                                                                    borderRadius: "10px",
                                                                    background: "#f8fafc",
                                                                    display: "grid",
                                                                    placeItems: "center",
                                                                    border: "1px solid #edf0f5",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <img
                                                                    src={category.icon}
                                                                    alt={category.category_name}
                                                                    width={24}
                                                                    height={24}
                                                                    style={{ objectFit: "contain" }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                style={{
                                                                    width: "42px",
                                                                    height: "42px",
                                                                    borderRadius: "10px",
                                                                    background: "#f1f5f9",
                                                                    display: "grid",
                                                                    placeItems: "center",
                                                                    color: "#64748b",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <FiLayers size={18} />
                                                            </div>
                                                        )}

                                                        <div style={{ minWidth: 0 }}>
                                                            <div className="mobile-card-title text-truncate mb-1">
                                                                {category.category_name}
                                                            </div>
                                                            <div>{getTypeBadge(category.type)}</div>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex gap-2 ms-2 flex-shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            className="px-2 py-1"
                                                            onClick={() => handleEdit(category)}
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 size={14} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            className="px-2 py-1"
                                                            onClick={() => handleDelete(category._id)}
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            No categories found
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>

                <ReusableFormModal<CategoryPayload>
                    show={showModal}
                    title={
                        editingCategory
                            ? "Edit Category"
                            : "Add Category"
                    }
                    fields={fields}
                    values={formData}
                    loading={loading}
                    error={error}
                    submitText={
                        editingCategory
                            ? "Update Category"
                            : "Create Category"
                    }
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onClose={handleClose}
                />

                <Modal
                    show={Boolean(deleteId)}
                    onClose={() => setDeleteId(null)}
                    title="Delete Category"
                    confirmText="Delete"
                    confirmVariant="danger"
                    onConfirm={handleConfirmDelete}
                    loading={loading}
                >
                    Are you sure you want to delete this category? This action cannot be undone.
                </Modal>
            </div>
        );
    };

export default CategoryPage;
