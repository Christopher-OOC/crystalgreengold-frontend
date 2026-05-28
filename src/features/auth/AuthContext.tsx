// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { authService } from '@/lib/api/services/auth.service';
import { adminService } from '@/lib/api/services/admin.service';
import {
  clearImpersonationSession,
  readAdminSnapshot,
  readImpersonationTarget,
  normalizeImpersonatedMember,
  selectImpersonatedMember,
  saveAdminSnapshot,
  saveImpersonationTarget,
  type AdminSessionSnapshot,
} from '@/features/auth/impersonationSession';
import { useAuthStore } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';
import apiClient, { tokenStorage } from '@/lib/api/client';
import type { LoginRequest } from '@/lib/types/auth.types';
import type { Member } from '@/lib/types/member.types';

interface AuthContextValue {
  member: Member | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  memberId: string | undefined;
  memberType: string | undefined;
  isAdmin: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;

    //(impersonation)
  impersonating: boolean;
  impersonatedUser: Member | null;
  loginAsUser: (memberId: string, member?: Partial<Member>) => Promise<void>;
  exitImpersonation: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Session timeout: 30 minutes of inactivity ────────────────────────────
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [adminSnapshot, setAdminSnapshot] = useState<AdminSessionSnapshot | null>(() => readAdminSnapshot());
  const store = useAuthStore();
  const { toast } = useUIStore();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync tokens from Zustand to localStorage whenever they change
  useEffect(() => {
    const token = store.accessToken;
    const refreshToken = store.refreshToken;
    
    console.log('AuthProvider sync - Token in store:', token ? `${token.substring(0, 30)}...` : 'null');
    
    if (token) {
      tokenStorage.setAccess(token);
      tokenStorage.setRefresh(refreshToken ?? null);
    } else {
      // Only clear if we're not authenticated
      if (!store.isAuthenticated) {
        // Don't clear automatically - only if explicitly logged out
      }
    }
  }, [store.accessToken, store.refreshToken, store.isAuthenticated]);

  // Monitor token in localStorage and restore if cleared
  useEffect(() => {
    const checkToken = setInterval(() => {
      const localToken = tokenStorage.getAccess();
      const storeToken = store.accessToken;
      
      if (storeToken && !localToken) {
        console.warn('⚠️ Token missing from localStorage but exists in store! Restoring...');
        tokenStorage.setAccess(storeToken);
        tokenStorage.setRefresh(store.refreshToken ?? null);
      }
    }, 1000);
    
    return () => clearInterval(checkToken);
  }, [store.accessToken, store.refreshToken]);

  // 🔥 Auto-refresh profile to ensure correct ID and latest data
  useEffect(() => {
    const refreshProfile = async () => {
      if (store.isAuthenticated && store.member?.id) {
        if (adminSnapshot && readImpersonationTarget()) {
          return;
        }

        try {
          const { data } = await apiClient.get(`/api/v1/members/${store.member.id}`);
          const profileData = data.data || data;
          
          if (profileData) {
            const currentMember = store.member;
            const isImpersonating = !!adminSnapshot;
            const currentIds = new Set(
              [currentMember?.id, currentMember?.memberId].filter(Boolean),
            );
            const profileId = profileData.memberId || profileData.id;

            if (isImpersonating && profileId && !currentIds.has(profileId)) {
              console.warn('[Auth] Ignored impersonation profile refresh because it returned a different member.');
              return;
            }

            // Do not carry admin roles/details into an impersonated member session.
            const currentRoles = isImpersonating ? [] : currentMember?.roles || [];
            const newRoles = profileData.roles || [];
            const allRoles = isImpersonating ? newRoles : [...newRoles, ...currentRoles];

            const roleNames = allRoles.map((r: any) => 
              (typeof r === 'string' ? r : (r.name || r.authority || '')).toUpperCase()
            );

            let detectedType = profileData.memberType || (isImpersonating ? undefined : currentMember?.memberType);

            // Priority-based role promotion
            if (roleNames.some(r => r === 'ROLE_SUPER_ADMIN' || r === 'SUPER_ADMIN')) detectedType = 'SUPER_ADMIN';
            else if (roleNames.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN')) detectedType = 'ADMIN';
            else if (roleNames.some(r => r === 'ROLE_PREMIUM_STORE' || r === 'PREMIUM_STORE')) detectedType = 'PREMIUM_STORE';
            else if (roleNames.some(r => r === 'ROLE_SERVICE_CENTER' || r === 'SERVICE_CENTER')) detectedType = 'SERVICE_CENTER';

            const normalizedMemberId = isImpersonating
              ? profileData.memberId || currentMember?.memberId || currentMember?.id
              : profileData.id || profileData.memberId || currentMember?.id;

            const updatedProfile = {
              ...profileData,
              id: normalizedMemberId,
              memberId: isImpersonating
                ? normalizedMemberId
                : profileData.memberId || profileData.id || currentMember?.memberId || currentMember?.id,
              roles: newRoles.length > 0 ? newRoles : currentRoles,
              memberType: detectedType || 'REGULAR_MEMBER'
            };

            store.updateMember(updatedProfile);
            console.log(`[Auth] Profile refreshed. ID: ${store.member.id}, Role: ${detectedType}`);
          }
        } catch (err) {
          console.error('❌ Failed to auto-refresh profile:', err);
        }
      }
    };

    refreshProfile();
  }, [store.isAuthenticated, store.member?.id, adminSnapshot]);

  // ─── Inactivity auto-logout ───────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      authService.logout();
      store.clearAuth();
      setAdminSnapshot(null);
      clearImpersonationSession();
      toast.warning('Session expired', 'You were logged out due to inactivity.');
    }, INACTIVITY_TIMEOUT_MS);
  }, [store, toast]);

  useEffect(() => {
    if (!store.isAuthenticated) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    resetInactivityTimer(); // start on login

    activityEvents.forEach((event) => window.addEventListener(event, resetInactivityTimer, { passive: true }));

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [store.isAuthenticated, resetInactivityTimer]);

  const login = useCallback(async (payload: LoginRequest) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const res = await authService.login(payload);
      // This will trigger the useEffect above to sync to localStorage
      store.setAuth(res.member, res.accessToken, res.refreshToken);
      
      const firstName = res.member?.firstName ?? res.member?.username ?? 'back';
      toast.success('Welcome back', `Hi ${firstName}!`);
    } catch (err: unknown) {
      const message = extractMessage(err, 'Invalid credentials. Please try again.');
      store.setError(message);
      toast.error('Login failed', message);
      throw new Error(message);
    } finally {
      store.setLoading(false);
    }
  }, [store, toast]);

  const logout = useCallback(() => {
    authService.logout();
    store.clearAuth();
    setAdminSnapshot(null);
    clearImpersonationSession();
    toast.info('Logged out successfully');
  }, [store, toast]);

const loginAsUser = useCallback(async (memberId: string, memberHint?: Partial<Member>) => {
  try {
    if (!memberId) {
      throw new Error('No member was selected');
    }

    const currentToken = store.accessToken;
    const currentRefreshToken = store.refreshToken;
    const currentUser = store.member;

    if (!currentToken || !currentUser) {
      throw new Error('No admin session found');
    }

    const adminId = currentUser.memberId || currentUser.id;
    const res = await adminService.loginAsUser(
      memberId,
      adminId
    );

    const { token, refreshToken, member } = res;
    if (!token) {
      throw new Error('Impersonation response did not include a session token');
    }

    if (token === currentToken) {
      throw new Error('Impersonation response returned the admin token instead of a member token');
    }

    const selectedMember = selectImpersonatedMember(member, memberHint, memberId);
    const impersonatedMember = normalizeImpersonatedMember(selectedMember, memberId);

    const snapshot = {
      token: currentToken,
      refreshToken: currentRefreshToken,
      user: currentUser,
    };

    // Save admin session to state and storage
    setAdminSnapshot(snapshot);
    saveAdminSnapshot(snapshot);
    saveImpersonationTarget(memberId, impersonatedMember);

    // Switch to impersonated user
    store.setAuth(impersonatedMember, token, refreshToken ?? null, impersonatedMember.memberId);
    tokenStorage.setAccess(token);
    tokenStorage.setRefresh(refreshToken ?? null);

    toast.info('Impersonation started', `Signed in as ${impersonatedMember.username || 'member'}.`);
    
    setTimeout(() => {
      window.location.href = '/dashboard/login-as-user'; 
    }, 500);
  } catch (err) {
    const message = extractMessage(err, 'Failed to impersonate user');
    toast.error('Error', message);
  }
}, [store, toast]);

// 🔥 ADDED
const exitImpersonation = useCallback(() => {
  if (!adminSnapshot) return;

  // Restore admin session
  store.setAuth(adminSnapshot.user, adminSnapshot.token, adminSnapshot.refreshToken ?? null);
  tokenStorage.setAccess(adminSnapshot.token);
  tokenStorage.setRefresh(adminSnapshot.refreshToken ?? null);

  setAdminSnapshot(null);
  clearImpersonationSession();
  
  toast.info('Returned to admin account');
  
  setTimeout(() => {
    window.location.href = '/dashboard/admin/member';
  }, 500);
}, [adminSnapshot, store, toast]);


  const value: AuthContextValue = {
    member: store.member,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    memberId: store.member?.memberId ?? store.member?.id,
    memberType: store.member?.memberType,
    isAdmin: !adminSnapshot && (
      store.member?.memberType?.toUpperCase() === 'ADMIN' || 
      store.member?.memberType?.toUpperCase() === 'SUPER_ADMIN' ||
      store.member?.memberType?.toUpperCase() === 'ROLE_ADMIN' ||
      store.member?.memberType?.toUpperCase() === 'ROLE_SUPER_ADMIN'
    ),
    login,
    logout,

     impersonating: !!adminSnapshot,
  impersonatedUser: adminSnapshot ? store.member : null,
  loginAsUser,
  exitImpersonation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider> 
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const e = err as { response?: { data?: { message?: string; error?: string } } };
    return e.response?.data?.message ?? e.response?.data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
