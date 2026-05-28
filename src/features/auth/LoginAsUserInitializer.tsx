'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';
import { memberService } from '@/lib/api/services/member.service';
import { useAuthStore } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';
import { Button } from '@/shared/ui/Button';
import {
  clearImpersonationTarget,
  isSameMember,
  normalizeImpersonatedMember,
  readImpersonationMember,
  readImpersonationTarget,
} from '@/features/auth/impersonationSession';
import type { Member } from '@/lib/types/member.types';

function getMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const error = err as { response?: { data?: { message?: string; error?: string } } };
    return error.response?.data?.message ?? error.response?.data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

function getStatus(err: unknown) {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    return (err as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

export function LoginAsUserInitializer() {
  const currentMember = useAuthStore((state) => state.member);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const toast = useUIStore((state) => state.toast);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const initializeMember = useCallback(async () => {
    const targetMemberId = readImpersonationTarget() || currentMember?.memberId || currentMember?.id;

    if (!targetMemberId || !accessToken) {
      setError('The member session could not be initialized. Please return to admin and try again.');
      setIsInitializing(false);
      return;
    }

    setError(null);
    setIsInitializing(true);

    try {
      const savedMember = readImpersonationMember();
      const seededMember = isSameMember(savedMember, targetMemberId)
        ? savedMember
        : isSameMember(currentMember, targetMemberId)
          ? currentMember
          : undefined;
      let profile: Partial<Member> | null | undefined = seededMember;

      try {
        const fetchedProfile = await memberService.getById(targetMemberId);
        if (isSameMember(fetchedProfile, targetMemberId)) {
          profile = fetchedProfile;
        } else {
          console.warn('[Auth] Ignored fetched impersonation profile because it did not match the selected member.');
        }
      } catch (fetchError) {
        const status = getStatus(fetchError);
        if (status === 401 || status === 403) {
          throw fetchError;
        }

        console.warn('[Auth] Could not fetch impersonated member profile during initialization:', fetchError);
      }

      const initializedMember = normalizeImpersonatedMember(profile, targetMemberId);
      setAuth(initializedMember, accessToken, refreshToken, initializedMember.memberId);
      clearImpersonationTarget();

      toast.success('Member session ready', `Signed in as ${initializedMember.username}.`);
      window.location.replace('/dashboard');
    } catch (err) {
      setError(getMessage(err, 'Failed to initialize the member session.'));
      setIsInitializing(false);
    }
  }, [accessToken, currentMember, refreshToken, setAuth, toast]);

  useEffect(() => {
    void initializeMember();
  }, [initializeMember]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/20">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
          {error ? <AlertCircle size={28} /> : isInitializing ? <Loader2 size={28} className="animate-spin" /> : <LogIn size={28} />}
        </div>

        <h1 className="text-lg font-black tracking-tight">
          {error ? 'Member Session Failed' : 'Initializing Member Session'}
        </h1>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          {error || 'Preparing the selected user account before opening the dashboard.'}
        </p>

        {error && (
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => window.location.replace('/dashboard/admin/member')}
              className="rounded-xl px-4 py-2 text-xs"
            >
              Back to Admin
            </Button>
            <Button
              onClick={() => void initializeMember()}
              className="rounded-xl px-4 py-2 text-xs"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
