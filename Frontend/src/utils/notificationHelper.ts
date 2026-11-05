export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: "transaction" | "category" | "budget" | "party" | "alert";
    date: string;
    link?: string;
    isRead?: boolean;
}

const STORAGE_KEY = "expense_hub_user_notifications";

export const getActivityNotifications = (): AppNotification[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch {
        return [];
    }
};

export const addActivityNotification = (notification: {
    title: string;
    message: string;
    type: "transaction" | "category" | "budget" | "party" | "alert";
    link?: string;
}) => {
    try {
        const current = getActivityNotifications();
        const newNotification: AppNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            date: new Date().toISOString(),
            link: notification.link,
            isRead: false,
        };

        // keep recent 30
        const updated = [newNotification, ...current].slice(0, 30);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // notify listeners
        window.dispatchEvent(
            new CustomEvent("app_notification_created", {
                detail: newNotification,
            })
        );

        return newNotification;
    } catch {
        return null;
    }
};

export const markNotificationsAsRead = (ids?: string[]) => {
    try {
        const current = getActivityNotifications();
        const updated = current.map((item) =>
            !ids || ids.includes(item.id) ? { ...item, isRead: true } : item
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        window.dispatchEvent(new CustomEvent("app_notification_created"));
    } catch {
        // silent fail
    }
};

