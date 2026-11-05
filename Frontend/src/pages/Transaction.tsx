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

import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiLayers, FiUsers } from "react-icons/fi";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import ReusableFormModal, {
  type FormField,
} from "../components/common/ReusableFormModal";
import Modal from "../components/common/Modal";

import {
  getAllTransactionsThunk,
  createTransactionThunk,
  updateTransactionThunk,
  deleteTransactionThunk,
  setSelectedTransaction,
  clearSelectedTransaction,
  clearTransactionError,
} from "../features/transaction/transactionSlice";

import { getAllCategoriesThunk } from "../features/category/categorySlice";
import { getAllPartiesThunk } from "../features/party/partySlice";
import { formatPartyType } from "../features/party/partyTypes";
import { getAllBudgetsThunk } from "../features/budget/budgetSlice";
import { toast } from "react-toastify";
import { addActivityNotification } from "../utils/notificationHelper";

import type {
  Transaction,
  TransactionPayload,
  TransactionType,
} from "../features/transaction/transactionTypes";

interface TransactionFormValues {
  categoryid: string;
  partyid: string;
  type: TransactionType;
  title: string;
  amount: string;
  date: string;
  description: string;
}

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialForm: TransactionFormValues = {
  categoryid: "",
  partyid: "",
  type: "expense",
  title: "",
  amount: "",
  date: getTodayDate(),
  description: "",
};

const TransactionPage = () => {
  const dispatch = useAppDispatch();

  const { transactions, selectedTransaction, loading, error } = useAppSelector(
    (state) => state.transaction,
  );

  const { categories } = useAppSelector((state) => state.category);
  const { parties } = useAppSelector((state) => state.party);
  const { budgets } = useAppSelector((state) => state.budget);

  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState("all");

  const [formData, setFormData] = useState<TransactionFormValues>(initialForm);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query !== null) {
      setSearch(query);
    }
  }, [searchParams]);

  useEffect(() => {
    dispatch(getAllTransactionsThunk());
    dispatch(getAllCategoriesThunk());
    dispatch(getAllPartiesThunk());
    dispatch(getAllBudgetsThunk());
  }, [dispatch]);

  const categoryOptions = useMemo(() => {
    const currentType = (formData.type || "").toLowerCase();
    const matching = categories.filter(
      (c) => (c.type || "").toLowerCase() === currentType
    );
    const others = categories.filter(
      (c) => (c.type || "").toLowerCase() !== currentType
    );

    const sorted = [...matching, ...others];

    return sorted.map((category) => {
      const typeLabel = category.type
        ? ` (${category.type.charAt(0).toUpperCase() + category.type.slice(1)})`
        : "";
      return {
        label: `${category.category_name}${typeLabel}`,
        value: category._id,
      };
    });
  }, [categories, formData.type]);

  const partyOptions = useMemo(() => {
    return parties.map((party) => {
      const formattedName = party.party_name
        ? party.party_name.charAt(0).toUpperCase() + party.party_name.slice(1)
        : "Party";
      const typeLabel = party.party_type
        ? ` (${formatPartyType(party.party_type)})`
        : "";
      return {
        label: `${formattedName}${typeLabel}`,
        value: party._id,
      };
    });
  }, [parties]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = transaction.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const getCategoryName = (transaction: Transaction) => {
    const cat = transaction.categoryid as any;
    if (cat) {
      if (typeof cat === "object" && cat !== null) {
        const name = cat.category_name || cat.name || cat.title || cat.categoryName;
        if (name) return name;
        if (cat._id) {
          const found = categories.find((c) => c._id === String(cat._id));
          if (found?.category_name) return found.category_name;
        }
      } else if (typeof cat === "string") {
        const found = categories.find((c) => c._id === cat);
        if (found?.category_name) return found.category_name;
      }
    }

    const directCat = (transaction as any).category || (transaction as any).category_name;
    if (directCat) {
      if (typeof directCat === "string") {
        const found = categories.find((c) => c._id === directCat);
        if (found?.category_name) return found.category_name;
        return directCat;
      }
      if (typeof directCat === "object") {
        const name = directCat.category_name || directCat.name;
        if (name) return name;
      }
    }

    // match by title
    const titleLower = (transaction.title || "").toLowerCase();
    const titleMatch = categories.find(
      (c) =>
        c.type === transaction.type &&
        (titleLower.includes(c.category_name.toLowerCase()) ||
          c.category_name.toLowerCase().includes(titleLower))
    );
    if (titleMatch?.category_name) {
      return titleMatch.category_name;
    }

    // match by type
    const typeCategory = categories.find((c) => c.type === transaction.type);
    if (typeCategory?.category_name) {
      return typeCategory.category_name;
    }

    if (transaction.type === "income") return "Salary";
    if (transaction.type === "investment") return "Investment";
    return "General";
  };

  const getCategoryId = (transaction: Transaction): string => {
    const cat = transaction.categoryid as any;
    if (cat) {
      if (typeof cat === "string" && cat) return cat;
      if (typeof cat === "object" && cat._id) return String(cat._id);
    }
    const directCat = (transaction as any).category;
    if (directCat) {
      if (typeof directCat === "string" && directCat) return directCat;
      if (typeof directCat === "object" && directCat._id) return String(directCat._id);
    }

    const titleLower = (transaction.title || "").toLowerCase();
    const titleMatch = categories.find(
      (c) =>
        c.type === transaction.type &&
        (titleLower.includes(c.category_name.toLowerCase()) ||
          c.category_name.toLowerCase().includes(titleLower))
    );
    if (titleMatch) return titleMatch._id;

    const typeCat = categories.find((c) => c.type === transaction.type);
    if (typeCat) return typeCat._id;

    return "";
  };

  const getPartyName = (party: unknown) => {
    if (!party) return "General";
    if (typeof party === "object" && party !== null) {
      const name = (party as any).party_name || (party as any).name;
      if (name) return name;
      if ((party as any)._id) {
        const found = parties.find((p) => p._id === String((party as any)._id));
        if (found?.party_name) return found.party_name;
      }
    } else if (typeof party === "string") {
      const found = parties.find((p) => p._id === party);
      if (found?.party_name) return found.party_name;
      return party;
    }
    return "General";
  };

  const getPartyId = (party: unknown): string => {
    if (!party) return "";
    if (typeof party === "object" && party !== null && "_id" in party) {
      return String((party as { _id: string })._id);
    }
    return String(party);
  };

  const handleOpenAdd = () => {
    dispatch(clearSelectedTransaction());
    dispatch(clearTransactionError());

    dispatch(getAllCategoriesThunk());
    dispatch(getAllPartiesThunk());

    setFormData(initialForm);
    setShowModal(true);
  };

  const handleEdit = (transaction: Transaction) => {
    dispatch(setSelectedTransaction(transaction));
    dispatch(clearTransactionError());

    dispatch(getAllCategoriesThunk());
    dispatch(getAllPartiesThunk());

    setFormData({
      categoryid: getCategoryId(transaction),
      partyid: getPartyId(transaction.partyid),
      type: transaction.type,
      title: transaction.title,
      amount: String(transaction.amount),
      date: transaction.date.slice(0, 10),
      description: transaction.description || "",
    });

    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);

    dispatch(clearSelectedTransaction());
    dispatch(clearTransactionError());

    setFormData(initialForm);
  };

  const handleChange = (name: string, value: string) => {
    if (name === "categoryid") {
      const selectedCat = categories.find((c) => c._id === value);
      setFormData((previous) => ({
        ...previous,
        categoryid: value,
        type: (selectedCat?.type as TransactionType) || previous.type,
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: TransactionPayload = {
      ...formData,
      amount: Number(formData.amount),
      date: formData.date,
    };

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      return;
    }

    try {
      if (selectedTransaction) {
        await dispatch(
          updateTransactionThunk({
            id: selectedTransaction._id,
            data: payload,
          }),
        ).unwrap();
        toast.success("Transaction updated successfully!");
      } else {
        await dispatch(createTransactionThunk(payload)).unwrap();
        toast.success("Transaction added successfully!");

        const foundCat = categories.find((c) => c._id === payload.categoryid);
        const categoryName = foundCat?.category_name || "Category";

        addActivityNotification({
          title: "New Transaction Added",
          message: `${payload.title} (${payload.type}) • ₹${payload.amount.toLocaleString("en-IN")}`,
          type: "transaction",
          link: "/transactions",
        });

        // check budget limit
        if (payload.type === "expense") {
          const matchingBudget = budgets.find((b) => {
            const bCatId =
              typeof b.categoryid === "object" && b.categoryid !== null
                ? b.categoryid._id
                : b.categoryid;
            return bCatId === payload.categoryid;
          });

          if (matchingBudget) {
            const existingSpent = transactions
              .filter((t) => {
                const tCatId =
                  typeof t.categoryid === "object" && t.categoryid !== null
                    ? t.categoryid._id
                    : t.categoryid;
                return t.type === "expense" && tCatId === payload.categoryid;
              })
              .reduce((sum, t) => sum + t.amount, 0);

            const newTotal = existingSpent + payload.amount;
            const limit = matchingBudget.amount;
            if (limit && newTotal > limit) {
              toast.warning(
                `⚠️ Budget Alert: Expenses for "${categoryName}" (₹${newTotal.toLocaleString("en-IN")}) have exceeded the budget limit of ₹${limit.toLocaleString("en-IN")}!`,
                { autoClose: 6000 }
              );

              addActivityNotification({
                title: `⚠️ Budget Exceeded!`,
                message: `Expenses for "${categoryName}" reached ₹${newTotal.toLocaleString("en-IN")}, exceeding the limit of ₹${limit.toLocaleString("en-IN")}`,
                type: "alert",
                link: "/budgets",
              });
            }
          }
        }
      }

      handleClose();
    } catch {
      // handled in modal
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    dispatch(clearTransactionError());

    try {
      await dispatch(deleteTransactionThunk(deleteId)).unwrap();
      toast.success("Transaction deleted successfully!");
      setDeleteId(null);
    } catch {
      // handled by reducer
    }
  };

  const transactionFields: FormField[] = [
    {
      name: "type",
      label: "Transaction Type",
      type: "select",
      required: true,
      options: [
        { label: "Expense", value: "expense" },
        { label: "Income", value: "income" },
        { label: "Investment", value: "investment" },
      ],
      colSpan: 6,
    },
    {
      name: "title",
      label: "Transaction Title",
      type: "text",
      placeholder: "e.g. October Salary",
      required: true,
      colSpan: 6,
    },
    {
      name: "categoryid",
      label: "Category",
      type: "select",
      required: true,
      options: categoryOptions,
      colSpan: 6,
    },
    {
      name: "partyid",
      label: "Party",
      type: "select",
      required: true,
      options: partyOptions,
      colSpan: 6,
    },
    {
      name: "amount",
      label: "Amount (₹)",
      type: "number",
      placeholder: "Enter amount",
      required: true,
      colSpan: 6,
    },
    {
      name: "date",
      label: "Transaction Date",
      type: "date",
      required: true,
      colSpan: 6,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description",
      colSpan: 12,
    },
  ];

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN");

  const typeVariant = (type: TransactionType) => {
    if (type === "income") return "success";
    if (type === "expense") return "danger";
    return "primary";
  };

  return (
    <div className="transaction-page">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Transactions</h3>
          <p className="text-muted mb-0">
            Track all your income, expenses and investments.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <FiPlus className="me-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <p className="text-muted mb-2">Total Income</p>
              <h4 className="fw-bold text-success mb-0">
                {formatAmount(
                  transactions
                    .filter((item) => item.type === "income")
                    .reduce((sum, item) => sum + item.amount, 0),
                )}
              </h4>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <p className="text-muted mb-2">Total Expenses</p>
              <h4 className="fw-bold text-danger mb-0">
                {formatAmount(
                  transactions
                    .filter((item) => item.type === "expense")
                    .reduce((sum, item) => sum + item.amount, 0),
                )}
              </h4>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <p className="text-muted mb-2">Total Investments</p>
              <h4 className="fw-bold text-primary mb-0">
                {formatAmount(
                  transactions
                    .filter((item) => item.type === "investment")
                    .reduce((sum, item) => sum + item.amount, 0),
                )}
              </h4>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <h5 className="fw-semibold mb-0">
              All Transactions ({transactions.length})
            </h5>

            <div className="d-flex flex-wrap gap-2">
              <InputGroup style={{ maxWidth: "250px" }}>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>

                <Form.Control
                  placeholder="Search transaction..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </InputGroup>

              <Form.Select
                style={{ width: "160px" }}
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="investment">Investment</option>
              </Form.Select>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading && transactions.length === 0 ? (
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
                      <th>Title</th>
                      <th>Category</th>
                      <th>Party</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction, index) => (
                        <tr key={transaction._id}>
                          <td>{index + 1}</td>

                          <td>
                            <div className="fw-semibold">{transaction.title}</div>
                            <small className="text-muted">
                              {transaction.description}
                            </small>
                          </td>

                          <td>{getCategoryName(transaction)}</td>

                          <td>{getPartyName(transaction.partyid)}</td>

                          <td>
                            <Badge bg={typeVariant(transaction.type)}>
                              {transaction.type}
                            </Badge>
                          </td>

                          <td className="fw-semibold">
                            {formatAmount(transaction.amount)}
                          </td>

                          <td>{formatDate(transaction.date)}</td>

                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => handleEdit(transaction)}
                              disabled={loading}
                            >
                              <FiEdit2 />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(transaction._id)}
                              disabled={loading}
                            >
                              <FiTrash2 />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none mobile-card-list">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => {
                    const isIncome = transaction.type === "income";
                    const isExpense = transaction.type === "expense";

                    return (
                      <div key={transaction._id} className="mobile-data-card">
                        <div className="mobile-card-header">
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="mobile-card-title text-truncate">
                              {transaction.title}
                            </div>
                            {transaction.description && (
                              <div
                                className="text-muted small text-truncate"
                                style={{ maxWidth: "220px" }}
                              >
                                {transaction.description}
                              </div>
                            )}
                          </div>
                          <div
                            className={`mobile-card-amount ${
                              isIncome
                                ? "text-success"
                                : isExpense
                                ? "text-danger"
                                : "text-primary"
                            }`}
                          >
                            {isIncome ? "+" : isExpense ? "-" : ""}
                            {formatAmount(transaction.amount)}
                          </div>
                        </div>

                        <div className="mobile-card-details">
                          <Badge bg={typeVariant(transaction.type)} className="text-capitalize">
                            {transaction.type}
                          </Badge>
                          <span className="mobile-card-detail-item">
                            <FiLayers size={13} className="text-muted" />
                            {getCategoryName(transaction)}
                          </span>
                          <span className="mobile-card-detail-item">
                            <FiUsers size={13} className="text-muted" />
                            {getPartyName(transaction.partyid)}
                          </span>
                          <span className="mobile-card-detail-item ms-auto text-muted">
                            {formatDate(transaction.date)}
                          </span>
                        </div>

                        <div className="mobile-card-actions">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="px-3 py-1 d-inline-flex align-items-center gap-1"
                            onClick={() => handleEdit(transaction)}
                            disabled={loading}
                          >
                            <FiEdit2 size={13} /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="px-3 py-1 d-inline-flex align-items-center gap-1"
                            onClick={() => handleDelete(transaction._id)}
                            disabled={loading}
                          >
                            <FiTrash2 size={13} /> Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted py-5">
                    No transactions found.
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <ReusableFormModal
        show={showModal}
        title={selectedTransaction ? "Edit Transaction" : "Add Transaction"}
        fields={transactionFields}
        values={formData}
        loading={loading}
        error={error}
        submitText={
          selectedTransaction ? "Update Transaction" : "Create Transaction"
        }
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />

      <Modal
        show={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete Transaction"
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        loading={loading}
      >
        Are you sure you want to delete this transaction? This action cannot be undone.
      </Modal>
    </div>
  );
};

export default TransactionPage;
