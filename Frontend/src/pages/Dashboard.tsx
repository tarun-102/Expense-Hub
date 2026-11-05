
import { useEffect, useMemo } from "react";

import {
    Badge,
    Card,
    Col,
    Row,
    Spinner,
    Table,
} from "react-bootstrap";

import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiPieChart,
} from "react-icons/fi";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import { getAllTransactionsThunk } from "../features/transaction/transactionSlice";
import { getAllCategoriesThunk } from "../features/category/categorySlice";
import { getAllPartiesThunk } from "../features/party/partySlice";
import { getAllBudgetsThunk } from "../features/budget/budgetSlice";

import IncomeExpenseChart from "../components/charts/IncomeExpenseChart";
import CategoryExpenseChart from "../components/charts/CategoryExpenseChart";

const Dashboard = () => {
    const dispatch = useAppDispatch();

    const {
        transactions,
        loading: transactionLoading,
    } = useAppSelector((state) => state.transaction);

    const { categories } = useAppSelector((state) => state.category);
    const { parties } = useAppSelector((state) => state.party);
    const { budgets } = useAppSelector((state) => state.budget);

    useEffect(() => {
        dispatch(getAllTransactionsThunk());
        dispatch(getAllCategoriesThunk());
        dispatch(getAllPartiesThunk());
        dispatch(getAllBudgetsThunk());
    }, [dispatch]);

    const income = transactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

    const expense = transactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

    const investment = transactions
        .filter((item) => item.type === "investment")
        .reduce((sum, item) => sum + item.amount, 0);

    const balance = income - expense - investment;

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            });
        } catch {
            return "";
        }
    };

    const getCategoryName = (item: any) => {
        if (!item) return "General";
        const cat = item.categoryid || item;
        if (cat) {
            if (typeof cat === "object" && cat !== null) {
                const name = cat.category_name || cat.name || cat.title;
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
        if (typeof item === "object" && item !== null && item.title) {
            const titleLower = item.title.toLowerCase();
            const titleMatch = categories.find(
                (c) =>
                    c.type === item.type &&
                    (titleLower.includes(c.category_name.toLowerCase()) ||
                        c.category_name.toLowerCase().includes(titleLower))
            );
            if (titleMatch?.category_name) return titleMatch.category_name;
            const typeCat = categories.find((c) => c.type === item.type);
            if (typeCat?.category_name) return typeCat.category_name;
            if (item.type === "income") return "Salary";
            if (item.type === "investment") return "Investment";
        }
        return "General";
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

    const chartData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, index) => {
            const date = new Date();
            date.setDate(1);
            date.setMonth(date.getMonth() - (5 - index));

            return {
                key: `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`,
                label: date.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "2-digit",
                }),
            };
        });

        return {
            labels: months.map((month) => month.label),
            income: months.map((month) =>
                transactions
                    .filter((item) =>
                        item.type === "income" &&
                        item.date.slice(0, 7) === month.key
                    )
                    .reduce((sum, item) => sum + item.amount, 0)
            ),
            expense: months.map((month) =>
                transactions
                    .filter((item) =>
                        item.type === "expense" &&
                        item.date.slice(0, 7) === month.key
                    )
                    .reduce((sum, item) => sum + item.amount, 0)
            ),
        };
    }, [transactions]);

    const categoryExpenses = useMemo(() => {
        const expenseTransactions = transactions.filter(
            (item) => item.type === "expense"
        );

        const totals = new Map<string, number>();

        expenseTransactions.forEach((item) => {
            const catId =
                typeof item.categoryid === "object" &&
                item.categoryid !== null &&
                "_id" in item.categoryid
                    ? (item.categoryid as { _id: string })._id
                    : String(item.categoryid);
            totals.set(
                catId,
                (totals.get(catId) || 0) + item.amount
            );
        });

        return Array.from(totals.entries()).map(([id, amount]) => ({
            label: getCategoryName(id),
            amount,
        }));
    }, [transactions, categories]);

    const recentTransactions = [...transactions]
        .sort(
            (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime()
        )
        .slice(0, 5);

    const summaryCards = [
        {
            title: "Total Income",
            amount: income,
            icon: <FiTrendingUp size={22} />,
            color: "success",
        },
        {
            title: "Total Expenses",
            amount: expense,
            icon: <FiTrendingDown size={22} />,
            color: "danger",
        },
        {
            title: "Total Investment",
            amount: investment,
            icon: <FiPieChart size={22} />,
            color: "primary",
        },
        {
            title: "Available Balance",
            amount: balance,
            icon: <FiDollarSign size={22} />,
            color: "info",
        },
    ] as const;

    return (
        <div className="dashboard-page">

            <div className="mb-4">
                <h3 className="fw-bold mb-1">Dashboard</h3>
                <p className="text-muted mb-0">
                    Here's your financial overview.
                </p>
            </div>

            {transactionLoading && transactions.length === 0 ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                    <p className="text-muted mt-3">
                        Loading dashboard...
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <Row className="g-2 g-md-3 mb-4">
                        {summaryCards.map((item) => (
                            <Col xs={6} md={6} xl={3} key={item.title}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small fw-medium text-truncate me-1">
                                                {item.title}
                                            </span>

                                            <span className={`text-${item.color}`}>
                                                {item.icon}
                                            </span>
                                        </div>

                                        <h4 className="fw-bold mb-0 fs-5 fs-sm-4">
                                            {formatAmount(item.amount)}
                                        </h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Charts */}
                    <Row className="g-3 mb-4">
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <h5 className="fw-semibold mb-4">
                                        Income vs Expenses
                                    </h5>

                                    <IncomeExpenseChart
                                        labels={chartData.labels}
                                        income={chartData.income}
                                        expense={chartData.expense}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <h5 className="fw-semibold mb-4">
                                        Expense by Category
                                    </h5>

                                    {categoryExpenses.length > 0 ? (
                                        <CategoryExpenseChart
                                            labels={categoryExpenses.map(
                                                (item) => item.label
                                            )}
                                            amounts={categoryExpenses.map(
                                                (item) => item.amount
                                            )}
                                        />
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            No expense data available.
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Recent Transactions */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-semibold mb-0">
                                    Recent Transactions
                                </h5>

                                <Badge bg="light" text="dark">
                                    Latest 5
                                </Badge>
                            </div>

                            {/* Desktop View */}
                            <div className="d-none d-md-block">
                                <Table responsive hover className="align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Party</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentTransactions.length > 0 ? (
                                            recentTransactions.map((item) => (
                                                <tr key={item._id}>
                                                    <td className="fw-semibold">{item.title}</td>

                                                    <td>
                                                        {getCategoryName(item)}
                                                    </td>

                                                    <td>
                                                        {getPartyName(item.partyid)}
                                                    </td>

                                                    <td>
                                                        <Badge
                                                            bg={
                                                                item.type === "income"
                                                                    ? "success"
                                                                    : item.type === "expense"
                                                                    ? "danger"
                                                                    : "primary"
                                                            }
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                    </td>

                                                    <td className="fw-semibold">
                                                        {formatAmount(item.amount)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4 text-muted">
                                                    No transactions available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Mobile View */}
                            <div className="d-md-none">
                                {recentTransactions.length > 0 ? (
                                    <div>
                                        {recentTransactions.map((item, index) => {
                                            const categoryName = getCategoryName(item);
                                            const partyName = getPartyName(item.partyid);
                                            const isIncome = item.type === "income";
                                            const isExpense = item.type === "expense";
                                            const formattedDate = formatDate(item.date);

                                            return (
                                                <div
                                                    key={item._id}
                                                    className={`d-flex align-items-center justify-content-between ${
                                                        index !== recentTransactions.length - 1
                                                            ? "border-bottom"
                                                            : ""
                                                    }`}
                                                    style={{ padding: "10px 0" }}
                                                >
                                                    <div className="me-2" style={{ minWidth: 0, flex: 1 }}>
                                                        <div
                                                            className="fw-semibold text-dark text-truncate"
                                                            style={{ fontSize: "14px", lineHeight: "1.3" }}
                                                        >
                                                            {item.title}
                                                        </div>
                                                        <div
                                                            className="text-muted text-truncate"
                                                            style={{ fontSize: "12px", marginTop: "2px" }}
                                                        >
                                                            <span>{categoryName}</span>
                                                            {partyName && partyName !== "Unknown" && (
                                                                <span className="text-secondary"> • {partyName}</span>
                                                            )}
                                                            {formattedDate && (
                                                                <span className="text-muted"> • {formattedDate}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-end flex-shrink-0 ms-2">
                                                        <div
                                                            className={`fw-bold ${
                                                                isIncome
                                                                    ? "text-success"
                                                                    : isExpense
                                                                    ? "text-danger"
                                                                    : "text-primary"
                                                            }`}
                                                            style={{ fontSize: "14px", lineHeight: "1.3" }}
                                                        >
                                                            {isIncome ? "+" : isExpense ? "-" : ""}
                                                            {formatAmount(item.amount)}
                                                        </div>
                                                        <Badge
                                                            bg={
                                                                isIncome
                                                                    ? "success"
                                                                    : isExpense
                                                                    ? "danger"
                                                                    : "primary"
                                                            }
                                                            className="text-capitalize"
                                                            style={{
                                                                fontSize: "10px",
                                                                padding: "2px 6px",
                                                                fontWeight: 500,
                                                                marginTop: "2px",
                                                            }}
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        No transactions available.
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Budget Overview */}
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-semibold mb-3">
                                Budget Overview
                            </h5>

                            <Row className="g-3">
                                <Col md={6}>
                                    <p className="text-muted mb-1">
                                        Total Budget Records
                                    </p>
                                    <h4 className="fw-bold">
                                        {budgets.length}
                                    </h4>
                                </Col>

                                <Col md={6}>
                                    <p className="text-muted mb-1">
                                        Total Budget Amount
                                    </p>
                                    <h4 className="fw-bold">
                                        {formatAmount(
                                            budgets.reduce(
                                                (sum, item) => sum + item.amount,
                                                0
                                            )
                                        )}
                                    </h4>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;
