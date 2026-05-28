
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Member } from '@/lib/types/member.types';
import { tokenStorage } from '@/lib/api/client';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AuthState {
  member: Member | null;
  memberId?: string;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface AuthActions {
  setAuth: (member: Member, accessToken: string, refreshToken?: string | null, memberId?: string) => void;
  setMember: (member: Member) => void;
  updateMember: (updates: Partial<Member>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  member: null,
  memberId: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ✅ SET AUTH (CLEAN + SAFE)
      setAuth: (member, accessToken, refreshToken, memberId) => {
        const nextMemberId = memberId ?? member.memberId ?? member.id;

        // Clear stale current-session token keys before writing the replacement session.
        tokenStorage.clearTokens();
        tokenStorage.setTokens(accessToken, refreshToken);

        if (typeof window !== 'undefined' && nextMemberId) {
          window.localStorage.removeItem('crystalgreengold-auth');
          window.sessionStorage.setItem('crystalgreengold_member_id', nextMemberId);
          window.localStorage.setItem('crystalgreengold_member_id', nextMemberId);
        }

        set({
          member,
          memberId: nextMemberId,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          error: null,
        });
      },

      setMember: (member) => set({ member }),

      updateMember: (updates) => {
        const current = get().member;
        if (!current) return;
        set({ member: { ...current, ...updates } });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      // ✅ FULL CLEAN LOGOUT
      clearAuth: () => {
        tokenStorage.clearTokens();

        // 🔥 Remove persisted state completely
        sessionStorage.removeItem('crystalgreengold-auth');
        localStorage.removeItem('crystalgreengold-auth');
        sessionStorage.removeItem('crystalgreengold_member_id');
        localStorage.removeItem('crystalgreengold_member_id');

        set(initialState);
      },
    }),

    {
      name: 'crystalgreengold-auth',
      storage: createJSONStorage(() => sessionStorage),

      // ✅ Persist only needed fields
      partialize: (state) => ({
        member: state.member,
        memberId: state.memberId,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),

      // ✅ CRITICAL FIX: Restore tokens on refresh
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          tokenStorage.setTokens(state.accessToken, state.refreshToken);
        }
      },
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────

// Basic
export const selectMember = (s: AuthState & AuthActions) => s.member;
export const selectIsAuthenticated = (s: AuthState & AuthActions) => s.isAuthenticated;
export const selectMemberId = (s: AuthState & AuthActions) => s.member?.memberId ?? s.member?.id;

// ✅ ROLE-BASED (Option B)
export const selectMemberType = (s: AuthState & AuthActions) => s.member?.memberType;

export const selectIsAdmin = (s: AuthState & AuthActions) => {
  const type = s.member?.memberType?.toUpperCase() || '';
  return ['ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(type);
};

