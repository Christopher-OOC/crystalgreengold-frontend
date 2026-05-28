"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast as hotToast } from "react-hot-toast";

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message?: string;
	duration?: number; // ms — default 4000
}

// ─── State & Actions ──────────────────────────────────────────────────────────

interface UIState {
	sidebarOpen: boolean;
	theme: "light" | "dark" | "system";
	notifications: Notification[];
}

interface UIActions {
	toggleSidebar: () => void;
	setSidebarOpen: (open: boolean) => void;
	setTheme: (theme: UIState["theme"]) => void;
	addNotification: (n: Omit<Notification, "id">) => void;
	removeNotification: (id: string) => void;
	clearNotifications: () => void;
	// shorthand helpers
	toast: {
		success: (title: string, message?: string) => void;
		error: (title: string, message?: string) => void;
		warning: (title: string, message?: string) => void;
		info: (title: string, message?: string) => void;
	};
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIState & UIActions>()(
	persist(
		(set, get) => ({
			sidebarOpen: true,
			theme: "system",
			notifications: [],

			toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
			setSidebarOpen: (open) => set({ sidebarOpen: open }),
			setTheme: (theme) => set({ theme }),

			addNotification: (n) => {
				const id = crypto.randomUUID();
				set((s) => ({ notifications: [...s.notifications, { ...n, id }] }));
				// auto-remove after duration
				const duration = n.duration ?? 4000;
				if (duration > 0) {
					setTimeout(() => get().removeNotification(id), duration);
				}
			},

			removeNotification: (id) =>
				set((s) => ({
					notifications: s.notifications.filter((n) => n.id !== id),
				})),

			clearNotifications: () => set({ notifications: [] }),

			toast: {
				success: (title, message) => {
					get().addNotification({ type: "success", title, message });
					hotToast.success(formatToast(title, message));
				},
				error: (title, message) => {
					get().addNotification({
						type: "error",
						title,
						message,
						duration: 6000,
					});
					hotToast.error(formatToast(title, message));
				},
				warning: (title, message) => {
					get().addNotification({ type: "warning", title, message });
					hotToast(formatToast(title, message), { icon: "!" });
				},
				info: (title, message) => {
					get().addNotification({ type: "info", title, message });
					hotToast(formatToast(title, message));
				},
			},
		}),
		{
			name: "crystalgreengold-ui",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				theme: state.theme,
				sidebarOpen: state.sidebarOpen,
			}),
		},
	),
);

function formatToast(title: string, message?: string) {
	return message ? `${title}: ${message}` : title;
}

