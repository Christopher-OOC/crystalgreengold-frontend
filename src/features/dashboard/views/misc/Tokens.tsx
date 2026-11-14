'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Ticket, Loader2, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore, selectMember } from '@/lib/store/authStore';
import { formatCurrency } from '@/lib/utils/format';
import type { Package } from '@/lib/types/package.types';

type Voucher = { code: string; packageName: string; quantity: number; value: number; loaded: boolean; generatedAt?: string; loadedAt?: string; issuedBy?: string; sentTo?: string };

export const Tokens: React.FC = () => {
  const member = useAuthStore(selectMember);
  const [packages, setPackages] = useState<Package[]>([]);
  const [packageId, setPackageId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [code, setCode] = useState('');
  const [created, setCreated] = useState<Voucher | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<Voucher[]>([]);
  const [received, setReceived] = useState<Voucher[]>([]);
  const [historyBusy, setHistoryBusy] = useState(false);

  const roles = useMemo(() => {
    const all = [member?.memberType ?? '', ...(member?.roles ?? []).map(role => typeof role === 'string' ? role : role.name ?? '')];
    return all.map(role => role.toUpperCase().replace(/^ROLE_/, ''));
  }, [member]);
  const canGenerate = roles.some(role => ['ADMIN', 'SUPER_ADMIN', 'PREMIUM_STORE', 'SERVICE_CENTER'].includes(role));
  const tokenBalance = Number(member?.tokens ?? 0);

  const refreshHistory = async () => {
    setHistoryBusy(true);
    try {
      const [issuedResponse, receivedResponse] = await Promise.all([
        apiClient.get(ENDPOINTS.TOKENS.ISSUED),
        apiClient.get(ENDPOINTS.TOKENS.RECEIVED),
      ]);
      setIssued(issuedResponse.data.data ?? []);
      setReceived(receivedResponse.data.data ?? []);
    } catch { setError('Unable to load token history.'); }
    finally { setHistoryBusy(false); }
  };

  useEffect(() => { void refreshHistory(); }, []);

  useEffect(() => {
    if (canGenerate) apiClient.get(ENDPOINTS.PACKAGES.BASE).then(({ data }) => setPackages(data.data ?? [])).catch(() => setError('Unable to load packages.'));
  }, [canGenerate]);

  const generate = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice(''); setCreated(null);
    try {
      const { data } = await apiClient.post(ENDPOINTS.TOKENS.GENERATE, { packageId: Number(packageId), quantity, recipientUsername });
      setCreated(data.data); setNotice('Token generated. Share this code with the member so they can load it.');
      void refreshHistory();
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Could not generate token.'); }
    finally { setBusy(false); }
  };

  const load = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const { data } = await apiClient.post(ENDPOINTS.TOKENS.LOAD, { code });
      const updatedBalance = Number(member?.tokens ?? 0) + Number(data.data?.value ?? 0);
      useAuthStore.getState().updateMember({ tokens: updatedBalance });
      setNotice(`Token loaded successfully. ${formatCurrency(Number(data.data?.value ?? 0))} added to your token balance.`);
      setCode('');
      void refreshHistory();
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Could not load token. Check the code and try again.'); }
    finally { setBusy(false); }
  };

  const copyCode = async () => { if (created?.code) { await navigator.clipboard.writeText(created.code); setNotice('Token code copied to clipboard.'); } };

  return <div className="max-w-3xl mx-auto space-y-5">
    <div className="rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 p-6">
      <div className="flex items-center gap-3"><Ticket className="text-amber-500"/><div><h1 className="text-xl font-bold">Tokens</h1><p className="text-sm text-emerald-600">Your token balance</p></div></div>
      <p className="mt-4 text-3xl font-bold">{formatCurrency(tokenBalance)}</p>
    </div>
    {canGenerate && <form onSubmit={generate} className="rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 p-6 space-y-4">
      <h2 className="font-bold">Generate token</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">Package<select required value={packageId} onChange={e => setPackageId(e.target.value)} className="mt-1 block w-full rounded-lg border p-2 bg-transparent"><option value="">Select a package</option>{packages.map(item => <option key={item.id} value={item.id}>{item.name} · {formatCurrency(item.price)}</option>)}</select></label>
        <label className="text-sm">Quantity<input required type="number" min="1" max="10000" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="mt-1 block w-full rounded-lg border p-2 bg-transparent"/></label>
      </div>
      <label className="block text-sm">Recipient username<input required value={recipientUsername} onChange={e => setRecipientUsername(e.target.value)} placeholder="Member username" className="mt-1 block w-full rounded-lg border p-2 bg-transparent"/></label>
      <p className="text-sm text-emerald-600">Token value: {formatCurrency((packages.find(item => String(item.id) === packageId)?.price ?? 0) * quantity)} (package price × quantity)</p>
      <button disabled={busy || !packageId || !recipientUsername.trim()} className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Generating…' : 'Generate and email token'}</button>
      {created && <div className="rounded-xl bg-emerald-50 dark:bg-white/5 p-4 space-y-2"><p className="text-xs">{created.packageName} · quantity {created.quantity} · value {formatCurrency(created.value)}</p><div className="flex items-center gap-3"><code className="text-xl font-bold tracking-widest">{created.code}</code><button type="button" onClick={copyCode} aria-label="Copy token code"><Copy size={18}/></button></div><p className="text-xs">Share this code with the member to load.</p></div>}
    </form>}
    <section className="rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 p-6 space-y-5">
      <div className="flex items-center justify-between"><h2 className="font-bold">Token history</h2><button type="button" onClick={() => void refreshHistory()} disabled={historyBusy} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={15} className={historyBusy ? 'animate-spin' : ''}/>Refresh</button></div>
      {([['Sent to me', received, 'issuedBy'], ['Issued by me', issued, 'sentTo']] as const).map(([title, vouchers, party]) => <div key={title} className="space-y-2"><h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{title}</h3>{vouchers.length === 0 ? <p className="text-sm text-gray-500">No tokens found.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-gray-500"><th className="py-2 pr-4">Code</th><th className="py-2 pr-4">Package</th><th className="py-2 pr-4">Quantity</th><th className="py-2 pr-4">Value</th><th className="py-2 pr-4">{party === 'issuedBy' ? 'From' : 'To'}</th><th className="py-2 pr-4">Status</th><th className="py-2">Date</th></tr></thead><tbody>{vouchers.map(voucher => <tr key={voucher.code} className="border-b last:border-0"><td className="py-2 pr-4 font-mono font-semibold">{voucher.code}</td><td className="py-2 pr-4">{voucher.packageName}</td><td className="py-2 pr-4">{voucher.quantity}</td><td className="py-2 pr-4">{formatCurrency(voucher.value)}</td><td className="py-2 pr-4">{voucher[party] ?? '—'}</td><td className="py-2 pr-4">{voucher.loaded ? `Loaded${voucher.loadedAt ? ` · ${new Date(voucher.loadedAt).toLocaleDateString()}` : ''}` : 'Available'}</td><td className="py-2">{voucher.generatedAt ? new Date(voucher.generatedAt).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div>}</div>)}
    </section>
    <form onSubmit={load} className="rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 p-6 space-y-4">
      <h2 className="font-bold">Load token</h2><p className="text-sm text-emerald-600">Enter a 10 character token code to add its value to your balance.</p>
      <div className="flex flex-col sm:flex-row gap-3"><input required maxLength={10} minLength={10} autoCapitalize="characters" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="XXXXXXXXXX" className="flex-1 rounded-lg border p-2 bg-transparent uppercase tracking-widest"/><button disabled={busy || code.length !== 10} className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin"/> : 'Load token'}</button></div>
    </form>
    {(notice || error) && <p role="status" className={error ? 'text-red-600' : 'text-emerald-700'}>{error || notice}</p>}
  </div>;
};
