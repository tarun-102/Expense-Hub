
import { NavLink, useNavigate } from "react-router-dom";
import {
    FiGrid,
    FiRepeat,
    FiLayers,
    FiTarget,
    FiUsers,
    FiSettings,
    FiLogOut,
    FiCreditCard,
    FiUser,
    FiMenu,
} from "react-icons/fi";

import { useAppDispatch } from "../../app/hooks";
import { logoutThunk } from "../../features/auth/authSlice";

import "../../styles/sidebar.css";

const menuItems = [
    { title: "Dashboard", path: "/dashboard", icon: FiGrid },
    { title: "Transactions", path: "/transactions", icon: FiRepeat },
    { title: "Categories", path: "/categories", icon: FiLayers },
    { title: "Budgets", path: "/budgets", icon: FiTarget },
    { title: "Parties", path: "/parties", icon: FiUsers },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    onToggle?: () => void;
}

const Sidebar = ({ isOpen = false, onClose, onToggle }: SidebarProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        onClose?.();
        await dispatch(logoutThunk());
        navigate("/login");
    };

    return (
        <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-brand">
                <div className="sidebar-brand-content">
                    <div className="brand-icon">
                        <FiCreditCard />
                    </div>

                    <h4>
                        Expense<span>Hub</span>
                    </h4>
                </div>

                <button
                    type="button"
                    className="sidebar-toggle-btn"
                    onClick={() => {
                        if (window.innerWidth <= 768) {
                            onClose?.();
                        } else {
                            onToggle?.();
                        }
                    }}
                    aria-label="Toggle navigation menu"
                    title="Toggle sidebar"
                >
                    <FiMenu size={20} />
                </button>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-label">MAIN MENU</p>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >
                                <Icon size={19} />
                                <span>{item.title}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-bottom">
                <NavLink
                    to="/profile"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <FiUser size={19} />
                    <span>Profile</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <FiSettings size={19} />
                    <span>Settings</span>
                </NavLink>

                <button
                    type="button"
                    className="sidebar-link logout-link"
                    onClick={handleLogout}
                >
                    <FiLogOut size={19} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;