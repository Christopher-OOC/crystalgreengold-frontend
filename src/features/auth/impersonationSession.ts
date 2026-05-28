import type { Member } from '@/lib/types/member.types';

export const ADMIN_SNAPSHOT_KEY = 'crystalgreengold_admin_snapshot';
export const IMPERSONATION_TARGET_KEY = 'crystalgreengold_impersonation_target';
export const IMPERSONATION_MEMBER_KEY = 'crystalgreengold_impersonation_member';

export interface AdminSessionSnapshot {
  token: string;
  refreshToken?: string | null;
  user: Member;
}

function getSessionStorage() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

function readJson<T>(key: string): T | null {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const value = storage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
}

export function readAdminSnapshot() {
  return readJson<AdminSessionSnapshot>(ADMIN_SNAPSHOT_KEY);
}

export function saveAdminSnapshot(snapshot: AdminSessionSnapshot) {
  writeJson(ADMIN_SNAPSHOT_KEY, snapshot);
}

export function saveImpersonationTarget(memberId: string, member?: Partial<Member> | null) {
  const storage = getSessionStorage();
  if (!storage) return;

  storage.setItem(IMPERSONATION_TARGET_KEY, memberId);
  if (member) {
    writeJson(IMPERSONATION_MEMBER_KEY, member);
  } else {
    storage.removeItem(IMPERSONATION_MEMBER_KEY);
  }
}

export function readImpersonationTarget() {
  return getSessionStorage()?.getItem(IMPERSONATION_TARGET_KEY) ?? null;
}

export function readImpersonationMember() {
  return readJson<Partial<Member>>(IMPERSONATION_MEMBER_KEY);
}

export function clearImpersonationTarget() {
  const storage = getSessionStorage();
  if (!storage) return;

  storage.removeItem(IMPERSONATION_TARGET_KEY);
  storage.removeItem(IMPERSONATION_MEMBER_KEY);
}

export function clearImpersonationSession() {
  const storage = getSessionStorage();
  if (!storage) return;

  storage.removeItem(ADMIN_SNAPSHOT_KEY);
  clearImpersonationTarget();
}

export function isSameMember(rawMember: Partial<Member> | null | undefined, memberId: string) {
  const ids = [rawMember?.id, rawMember?.memberId].filter(Boolean);
  return ids.length === 0 || ids.includes(memberId);
}

export function selectImpersonatedMember(
  responseMember: Partial<Member> | null | undefined,
  selectedMember: Partial<Member> | null | undefined,
  memberId: string,
) {
  if (responseMember && isSameMember(responseMember, memberId)) return responseMember;
  if (selectedMember && isSameMember(selectedMember, memberId)) return selectedMember;
  return null;
}

export function normalizeImpersonatedMember(rawMember: Partial<Member> | null | undefined, fallbackId: string): Member {
  const member =
    rawMember && typeof rawMember === 'object' && isSameMember(rawMember, fallbackId)
      ? rawMember
      : {};
  const memberId = fallbackId || member.memberId || member.id;

  return {
    ...member,
    // Most dashboard feature APIs use member.id, so impersonation must expose
    // the selected API member id here even when the table row also has another id.
    id: memberId,
    memberId,
    username: member.username || member.email || 'member',
    memberType: member.memberType || 'REGULAR_MEMBER',
    roles: member.roles ?? [],
  };
}

