"use client";

import { useState, useEffect, useCallback } from "react";
import { memberService } from "@/lib/api/services/member.service";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import type {
	Member,
	UpdateMemberRequest,
	TransferFundsRequest,
	ChangePasswordRequest,
} from "@/lib/types/member.types";

export function useMember(memberId?: string) {
	const { member: sessionMember, updateMember } = useAuthStore();
	const { toast } = useUIStore();

	const id = memberId ?? sessionMember?.id ?? "";

	const [member, setMember] = useState<Member | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetch = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		try {
			const data = await memberService.getById(id);
			setMember(data);
			// if fetching own profile, keep store in sync
			if (id === sessionMember?.id) updateMember(data);
		} catch {
			setError("Failed to load member");
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetch();
	}, [fetch]);

	const update = async (payload: UpdateMemberRequest) => {
		setLoading(true);
		try {
			const updated = await memberService.update(id, payload);
			setMember(updated);
			if (id === sessionMember?.id) updateMember(updated);
			toast.success("Profile updated");
			return updated;
		} catch {
			toast.error("Update failed");
		} finally {
			setLoading(false);
		}
	};

	const transferFunds = async (payload: TransferFundsRequest) => {
		setLoading(true);
		try {
			await memberService.transferFunds(id, payload);
			toast.success(
				"Transfer successful",
				`Sent ₦${payload.amount} to ${payload.recipientUsername}`,
			);
		} catch (err: unknown) {
			const msg = extractMessage(err, "Transfer failed");
			toast.error("Transfer failed", msg);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const changePassword = async (payload: ChangePasswordRequest) => {
		setLoading(true);
		try {
			await memberService.changePassword(id, payload);
			toast.success("Password changed successfully");
		} catch {
			toast.error("Failed to change password");
		} finally {
			setLoading(false);
		}
	};

	return {
		member: member ?? sessionMember,
		loading,
		error,
		refetch: fetch,
		update,
		transferFunds,
		changePassword,
	};
}

// ─── useGenealogy ─────────────────────────────────────────────────────────────

export function useGenealogy(memberId: string) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!memberId) return;
		setLoading(true);
		memberService
			.getGenealogy(memberId)
			.then(setData)
			.catch(() => setError("Failed to load genealogy"))
			.finally(() => setLoading(false));
	}, [memberId]);

	return { data, loading, error };
}

// ─── useAnalysis ──────────────────────────────────────────────────────────────

export function useAnalysis(memberId: string) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!memberId) return;
		setLoading(true);
		memberService
			.getAnalysis(memberId)
			.then(setData)
			.catch(() => setError("Failed to load analysis"))
			.finally(() => setLoading(false));
	}, [memberId]);

	return { data, loading, error };
}

function extractMessage(err: unknown, fallback: string): string {
	if (typeof err === "object" && err !== null && "response" in err) {
		const e = err as { response?: { data?: { message?: string } } };
		return e.response?.data?.message ?? fallback;
	}
	return fallback;
}
