
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiSettings,
  FiCheck,
  FiRepeat,
  FiAlertTriangle,
  FiLayers,
  FiTarget,
  FiUsers,
  FiX,
  FiGrid,
} from "react-icons/fi";

import {
  Dropdown,
  Form,
  InputGroup,
  Badge,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logoutThunk } from "../../features/auth/authSlice";
import { getAllTransactionsThunk } from "../../features/transaction/transactionSlice";
import { getAllBudgetsThunk } from "../../features/budget/budgetSlice";
import { getAllCategoriesThunk } from "../../features/category/categorySlice";
import { getAllPartiesThunk } from "../../features/party/partySlice";
import { formatPartyType } from "../../features/party/partyTypes";
import {
  getActivityNotifications,
  markNotificationsAsRead,
  type AppNotification,
} from "../../utils/notificationHelper";

import "../../styles/topbar.css";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

const Topbar = ({ onToggleSidebar }: TopbarProps) => {
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [storedNotifications, setStoredNotifications] = useState<AppNotification[]>(() =>
    getActivityNotifications()
  );

  const [readNotifications, setReadNotifications] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("expense_hub_read_notif_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { transactions } = useAppSelector((state) => state.transaction);
  const { budgets } = useAppSelector((state) => state.budget);
  const { categories } = useAppSelector((state) => state.category);
  const { parties } = useAppSelector((state) => state.party);

  useEffect(() => {
    if (transactions.length === 0) dispatch(getAllTransactionsThunk());
    if (budgets.length === 0) dispatch(getAllBudgetsThunk());
    if (categories.length === 0) dispatch(getAllCategoriesThunk());
    if (parties.length === 0) dispatch(getAllPartiesThunk());
  }, [dispatch, transactions.length, budgets.length, categories.length, parties.length]);

  // notifications listener
  useEffect(() => {
    const handleNotifUpdate = () => {
      setStoredNotifications(getActivityNotifications());
    };
    window.addEventListener("app_notification_created", handleNotifUpdate);
    return () => window.removeEventListener("app_notification_created", handleNotifUpdate);
  }, []);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // search results
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return {
        pages: [],
        transactions: [],
        categories: [],
        parties: [],
        budgets: [],
        total: 0,
      };
    }

    const pages = [
      { title: "Dashboard", path: "/dashboard", desc: "Overview & Charts", icon: FiGrid },
      { title: "Transactions", path: "/transactions", desc: "All Income & Expenses", icon: FiRepeat },
      { title: "Categories", path: "/categories", desc: "Expense & Income Categories", icon: FiLayers },
      { title: "Budgets", path: "/budgets", desc: "Monthly Budget Limits", icon: FiTarget },
      { title: "Parties", path: "/parties", desc: "Payers & Payees", icon: FiUsers },
      { title: "Profile", path: "/profile", desc: "User Account Details", icon: FiUser },
      { title: "Settings", path: "/settings", desc: "Preferences & Password", icon: FiSettings },
    ].filter(
      (p) => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );

    const matchedTransactions = transactions
      .filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q);
        const amountMatch = String(t.amount).includes(q);
        const typeMatch = t.type.toLowerCase().includes(q);
        return titleMatch || descMatch || amountMatch || typeMatch;
      })
      .slice(0, 5);

    const matchedCategories = categories
      .filter((c) => {
        return (
          c.category_name.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q)
        );
      })
      .slice(0, 4);

    const matchedParties = parties
      .filter((p) => {
        return (
          p.party_name.toLowerCase().includes(q) ||
          p.party_type.toLowerCase().includes(q) ||
          p.title?.toLowerCase().includes(q)
        );
      })
      .slice(0, 4);

    const matchedBudgets = budgets
      .filter((b) => {
        const bCatId =
          typeof b.categoryid === "object" && b.categoryid !== null
            ? b.categoryid._id
            : b.categoryid;
        const cat = categories.find((c) => c._id === bCatId);
        const catName = cat?.category_name || "";
        return (
          catName.toLowerCase().includes(q) ||
          b.month.toLowerCase().includes(q) ||
          String(b.amount).includes(q)
        );
      })
      .slice(0, 4);

    const total =
      pages.length +
      matchedTransactions.length +
      matchedCategories.length +
      matchedParties.length +
      matchedBudgets.length;

    return {
      pages,
      transactions: matchedTransactions,
      categories: matchedCategories,
      parties: matchedParties,
      budgets: matchedBudgets,
      total,
    };
  }, [search, transactions, categories, parties, budgets]);

  const handleSelectResult = (path: string, queryParam?: string) => {
    setIsSearchOpen(false);
    setSearch("");
    if (queryParam) {
      navigate(`${path}?search=${encodeURIComponent(queryParam)}`);
    } else {
      navigate(path);
    }
  };

  const handleSearchSubmit = () => {
    if (!search.trim()) return;
    setIsSearchOpen(false);
    navigate(`/transactions?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  const userInitials = user?.name
    ? user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "U";

  // budget exceeded check
  const budgetAlerts = useMemo(() => {
    const alerts: AppNotification[] = [];

    budgets.forEach((budget) => {
      const bCatId =
        typeof budget.categoryid === "object" && budget.categoryid !== null
          ? budget.categoryid._id
          : budget.categoryid;

      const cat = categories.find((c) => c._id === bCatId);
      const catName = cat?.category_name || "Category";

      const totalSpent = transactions
        .filter((t) => {
          const tCatId =
            typeof t.categoryid === "object" && t.categoryid !== null
              ? t.categoryid._id
              : t.categoryid;
          return t.type === "expense" && tCatId === bCatId;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const budgetLimit = budget.amount;
      if (budgetLimit && totalSpent > budgetLimit) {
        alerts.push({
          id: `alert-budget-${budget._id}`,
          title: `⚠️ Budget Exceeded: ${catName}`,
          message: `Spent ₹${totalSpent.toLocaleString("en-IN")} of ₹${budgetLimit.toLocaleString("en-IN")} limit (${Math.round((totalSpent / budgetLimit) * 100)}%)`,
          type: "alert",
          date: new Date().toISOString(),
          link: "/budgets",
        });
      }
    });

    return alerts;
  }, [budgets, categories, transactions]);

  // notifications list
  const notifications: AppNotification[] = useMemo(() => {
    const combined = [...budgetAlerts, ...storedNotifications];

    if (combined.length === 0) {
      return transactions.slice(0, 6).map((t) => ({
        id: `tx-${t._id}`,
        title: `Transaction: ${t.title}`,
        message: `${t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}₹${t.amount.toLocaleString("en-IN")}`,
        type: "transaction" as const,
        date: t.date,
        link: "/transactions",
        isRead: true,
      }));
    }

    return combined.slice(0, 20);
  }, [budgetAlerts, storedNotifications, transactions]);

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.isRead && !readNotifications.includes(notification.id)
  ).length;

  const markAllAsRead = () => {
    const allIds = notifications.map((item) => item.id);
    setReadNotifications((prev) => {
      const updated = [...new Set([...prev, ...allIds])];
      try {
        localStorage.setItem("expense_hub_read_notif_ids", JSON.stringify(updated));
      } catch {
        // silent fail
      }
      return updated;
    });
    markNotificationsAsRead(allIds);
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <FiAlertTriangle size={18} />;
      case "category":
        return <FiLayers size={18} />;
      case "budget":
        return <FiTarget size={18} />;
      case "party":
        return <FiUsers size={18} />;
      default:
        return <FiRepeat size={18} />;
    }
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Toggle sidebar"
        >
          <FiMenu size={22} />
        </button>

        <div className="topbar-search-wrapper" ref={searchWrapperRef}>
          <InputGroup className="topbar-search">
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>

            <Form.Control
              ref={searchInputRef}
              placeholder="Search anything..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (search.trim()) {
                  setIsSearchOpen(true);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearchSubmit();
                } else if (event.key === "Escape") {
                  setIsSearchOpen(false);
                  searchInputRef.current?.blur();
                }
              }}
            />

            {search && (
              <button
                type="button"
                className="topbar-search-clear"
                onClick={() => {
                  setSearch("");
                  setIsSearchOpen(false);
                  searchInputRef.current?.focus();
                }}
                title="Clear"
              >
                <FiX size={14} />
              </button>
            )}
          </InputGroup>

          {/* Search Dropdown */}
          {isSearchOpen && search.trim().length > 0 && (
            <div className="topbar-search-dropdown shadow-lg">
              <div className="topbar-search-header d-flex align-items-center justify-content-between">
                <span className="small text-muted">
                  Results for <strong>"{search.trim()}"</strong>
                </span>
                <Badge bg="primary" style={{ fontSize: "10px" }}>
                  {searchResults.total} found
                </Badge>
              </div>

              <div className="topbar-search-results-list">
                {searchResults.total > 0 ? (
                  <>
                    {/* Pages */}
                    {searchResults.pages.length > 0 && (
                      <div className="search-group">
                        <div className="search-group-title">Pages</div>
                        {searchResults.pages.map((p) => {
                          const Icon = p.icon;
                          return (
                            <div
                              key={p.path}
                              className="search-result-item"
                              onClick={() => handleSelectResult(p.path)}
                            >
                              <div className="search-result-icon">
                                <Icon size={15} />
                              </div>
                              <div className="search-result-info">
                                <div className="search-result-title">{p.title}</div>
                                <div className="search-result-sub">{p.desc}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Transactions */}
                    {searchResults.transactions.length > 0 && (
                      <div className="search-group">
                        <div className="search-group-title">Transactions</div>
                        {searchResults.transactions.map((t) => (
                          <div
                            key={t._id}
                            className="search-result-item"
                            onClick={() => handleSelectResult("/transactions", t.title)}
                          >
                            <div className={`search-result-icon transaction ${t.type}`}>
                              <FiRepeat size={15} />
                            </div>
                            <div className="search-result-info">
                              <div className="search-result-title">{t.title}</div>
                              <div className="search-result-sub">
                                {t.type} • {formatDate(t.date)}
                              </div>
                            </div>
                            <div className="search-result-extra">
                              <span
                                className={`fw-bold small ${
                                  t.type === "income"
                                    ? "text-success"
                                    : t.type === "expense"
                                    ? "text-danger"
                                    : "text-primary"
                                }`}
                              >
                                {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                                {formatAmount(t.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Categories */}
                    {searchResults.categories.length > 0 && (
                      <div className="search-group">
                        <div className="search-group-title">Categories</div>
                        {searchResults.categories.map((c) => (
                          <div
                            key={c._id}
                            className="search-result-item"
                            onClick={() => handleSelectResult("/categories", c.category_name)}
                          >
                            <div className="search-result-icon category">
                              <FiLayers size={15} />
                            </div>
                            <div className="search-result-info">
                              <div className="search-result-title">{c.category_name}</div>
                              <div className="search-result-sub">{c.type} category</div>
                            </div>
                            <div className="search-result-extra">
                              <Badge bg={c.type === "income" ? "success" : "danger"} style={{ fontSize: "10px" }}>
                                {c.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Parties */}
                    {searchResults.parties.length > 0 && (
                      <div className="search-group">
                        <div className="search-group-title">Parties</div>
                        {searchResults.parties.map((p) => (
                          <div
                            key={p._id}
                            className="search-result-item"
                            onClick={() => handleSelectResult("/parties", p.party_name)}
                          >
                            <div className="search-result-icon party">
                              <FiUsers size={15} />
                            </div>
                            <div className="search-result-info">
                              <div className="search-result-title">{p.party_name}</div>
                              <div className="search-result-sub">
                                {formatPartyType(p.party_type)} {p.title ? `• ${p.title}` : ""}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Budgets */}
                    {searchResults.budgets.length > 0 && (
                      <div className="search-group">
                        <div className="search-group-title">Budgets</div>
                        {searchResults.budgets.map((b) => {
                          const bCatId =
                            typeof b.categoryid === "object" && b.categoryid !== null
                              ? b.categoryid._id
                              : b.categoryid;
                          const cat = categories.find((c) => c._id === bCatId);
                          return (
                            <div
                              key={b._id}
                              className="search-result-item"
                              onClick={() => handleSelectResult("/budgets", cat?.category_name)}
                            >
                              <div className="search-result-icon budget">
                                <FiTarget size={15} />
                              </div>
                              <div className="search-result-info">
                                <div className="search-result-title">
                                  {cat?.category_name || "Category"} Budget
                                </div>
                                <div className="search-result-sub">Month: {b.month}</div>
                              </div>
                              <div className="search-result-extra">
                                <span className="fw-semibold text-dark small">
                                  {formatAmount(b.amount)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 px-3 text-muted">
                    <FiSearch size={24} className="mb-2 opacity-50" />
                    <p className="mb-1 fw-medium small">No results found for "{search.trim()}"</p>
                    <small className="text-muted">
                      Try searching by title, category, party or amount
                    </small>
                  </div>
                )}
              </div>

              <div
                className="search-dropdown-footer"
                onClick={handleSearchSubmit}
              >
                <span>Press <strong>Enter</strong> to search in Transactions</span>
                <span>↵</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right ">
        {/* Notifications */}
        <Dropdown
          align="end"
          autoClose="outside"
          onToggle={(isOpen) => {
            if (!isOpen && unreadCount > 0) {
              markAllAsRead();
            }
          }}
        >
          <Dropdown.Toggle
            variant="light"
            className="notification-btn"
            id="notification-dropdown"
          >
            <FiBell size={19} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="notification-menu">
            <div className="notification-header">
              <div>
                <strong>Notifications</strong>
                <div className="small text-muted">
                  Activity & budget alerts
                </div>
              </div>

              {unreadCount > 0 && (
                <Badge bg="danger" pill className="px-2 py-1">
                  {unreadCount} New
                </Badge>
              )}
            </div>

            <Dropdown.Divider className="my-1" />

            <div className="notification-items-scroll">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const isRead = Boolean(
                    notification.isRead ||
                    readNotifications.includes(notification.id)
                  );

                  return (
                    <Dropdown.Item
                      key={notification.id}
                      className={`notification-item ${isRead ? "read" : "unread"}`}
                      onClick={() => {
                        setReadNotifications((previous) => {
                          const updated = previous.includes(notification.id)
                            ? previous
                            : [...previous, notification.id];
                          try {
                            localStorage.setItem(
                              "expense_hub_read_notif_ids",
                              JSON.stringify(updated)
                            );
                          } catch {
                            // silent
                          }
                          return updated;
                        });
                        markNotificationsAsRead([notification.id]);

                        if (notification.link) {
                          navigate(notification.link);
                        } else {
                          navigate("/transactions");
                        }
                      }}
                    >
                      <div className={`notification-icon ${notification.type}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="notification-content">
                        <div className="d-flex align-items-center justify-content-between gap-1">
                          <strong className="text-truncate">
                            {notification.title}
                          </strong>
                          {notification.type === "alert" && (
                            <Badge bg="danger" style={{ fontSize: "9px" }}>
                              Alert
                            </Badge>
                          )}
                        </div>

                        <div className="small text-muted text-truncate">
                          {notification.message}
                        </div>

                        <small className="text-muted" style={{ fontSize: "11px" }}>
                          {formatDate(notification.date)}
                        </small>
                      </div>

                      {!isRead && (
                        <span className="notification-unread-dot" />
                      )}
                    </Dropdown.Item>
                  );
                })
              ) : (
                <div className="text-center text-muted py-4 px-3">
                  <FiBell size={25} className="mb-2" />
                  <p className="mb-0">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <>
                <Dropdown.Divider className="my-1" />

                <Dropdown.Item
                  className="text-center text-primary small py-2"
                  onClick={markAllAsRead}
                >
                  <FiCheck className="me-2" />
                  Mark all as read
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>

        {/* Profile */}
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="profile-dropdown"
            id="profile-dropdown"
          >
            <div className="profile-avatar">
              {userInitials}
            </div>

            <span className="profile-name">
              {user?.name || "Account"}
            </span>

            <FiChevronDown className="profile-chevron" size={13} />
          </Dropdown.Toggle>

          <Dropdown.Menu className="profile-dropdown-menu shadow-sm">
            <div className="px-3 py-2 border-bottom">
              <strong className="d-block text-dark small">{user?.name || "My Account"}</strong>
              <small className="text-muted" style={{ fontSize: "11px" }}>{user?.email || "Personal"}</small>
            </div>

            <Dropdown.Item onClick={() => navigate("/profile")}>
              <FiUser className="me-2 text-secondary" size={14} />
              My Profile
            </Dropdown.Item>

            <Dropdown.Item onClick={() => navigate("/settings")}>
              <FiSettings className="me-2 text-secondary" size={14} />
              Settings
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <FiLogOut className="me-2" size={14} />
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Topbar;
