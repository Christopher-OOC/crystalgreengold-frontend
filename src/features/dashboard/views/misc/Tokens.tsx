'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore, selectMember } from '@/lib/store/authStore';
import { formatCurrency } from '@/lib/utils/format';

type Transfer = { id: number; amount: number; sender: string; recipient: string; transferredAt?: string };

export const Tokens: React.FC = () => {
  const member = useAuthStore(selectMember);
  const [amount, setAmount] = useState('');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [created, setCreated] = useState<Transfer | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<Transfer[]>([]);
  const [received, setReceived] = useState<Transfer[]>([]);
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

  const generate = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice(''); setCreated(null);
    try {
      const { data } = await apiClient.post(ENDPOINTS.TOKENS.SEND, { amount: Number(amount), recipientUsername });
      setCreated(data.data);
      const sentAmount = Number(data.data?.amount ?? amount);
      useAuthStore.getState().updateMember({ tokens: Math.round((Number(member?.tokens ?? 0) - sentAmount) * 100) / 100 });
      setAmount('');
      setRecipientUsername('');
      setNotice('Tokens sent successfully. They are now available in the recipient’s balance.');
      void refreshHistory();
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Could not send tokens.'); }
    finally { setBusy(false); }
  };

  return <div className="max-w-3xl mx-auto space-y-5">
    <div className="rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 p-6">
      <div className="flex items-center gap-3"><Ticket className="text-amber-500"/><div><h1 className="text-xl font-bold">Tokens</h1><p className="text-sm text-emerald-600">Your token balance</p></div></div>
      <p className="mt-4 text-3xl font-bold">{formatCurrency(tokenBalance)}</p>
    </div>
    {canGenerate && <form onSubmit={generate} className="rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 p-6 space-y-4">
      <h2 className="font-bold">Send tokens</h2>
      <label className="block text-sm">Amount<input required type="number" min="0.01" step="0.01" max={tokenBalance} value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full rounded-lg border p-2 bg-transparent"/></label>
      <label className="block text-sm">Recipient username<input required value={recipientUsername} onChange={e => setRecipientUsername(e.target.value)} placeholder="Member username" className="mt-1 block w-full rounded-lg border p-2 bg-transparent"/></label>
      <p className="text-sm text-emerald-600">Available token balance: {formatCurrency(tokenBalance)}</p>
      <button disabled={busy || !amount || Number(amount) <= 0 || Number(amount) > tokenBalance || !recipientUsername.trim()} className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send tokens'}</button>
      {created && <div className="rounded-xl bg-emerald-50 dark:bg-white/5 p-4 space-y-1"><p className="font-semibold">{formatCurrency(created.amount)} sent to {created.recipient}</p><p className="text-xs">The tokens are available in their balance now.</p></div>}
    </form>}
    <section className="rounded-2xl bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 p-6 space-y-5">
      <div className="flex items-center justify-between"><h2 className="font-bold">Token history</h2><button type="button" onClick={() => void refreshHistory()} disabled={historyBusy} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={15} className={historyBusy ? 'animate-spin' : ''}/>Refresh</button></div>
      {([['Sent to me', received, 'sender'], ['Sent by me', issued, 'recipient']] as const).map(([title, transfers, party]) => <div key={title} className="space-y-2"><h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{title}</h3>{transfers.length === 0 ? <p className="text-sm text-gray-500">No token transfers found.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-gray-500"><th className="py-2 pr-4">Amount</th><th className="py-2 pr-4">{party === 'sender' ? 'From' : 'To'}</th><th className="py-2 pr-4">Status</th><th className="py-2">Date</th></tr></thead><tbody>{transfers.map(transfer => <tr key={transfer.id} className="border-b last:border-0"><td className="py-2 pr-4">{formatCurrency(transfer.amount)}</td><td className="py-2 pr-4">{transfer[party]}</td><td className="py-2 pr-4">Completed</td><td className="py-2">{transfer.transferredAt ? new Date(transfer.transferredAt).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div>}</div>)}
    </section>
    {(notice || error) && <p role="status" className={error ? 'text-red-600' : 'text-emerald-700'}>{error || notice}</p>}
  </div>;
};
