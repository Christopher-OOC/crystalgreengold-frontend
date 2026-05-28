import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ZoomIn, ZoomOut, Maximize2, Copy, Check, X, Link2, GitBranch, User, ChevronLeft, Users } from 'lucide-react';
import * as d3 from 'd3';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuth } from '@/features/auth/AuthContext';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberRecord {
  memberId: string;
  username: string;
  firstName: string;
  lastName: string;
  sponsorUsername: string;
  placerUsername: string;
  leftLegId?: string | null;
  rightLegId?: string | null;
  leftMemberId?: string | null;
  rightMemberId?: string | null;
  image: string | null;
  enabled: boolean;
  currentPackage: { name: string } | null;
}

interface TreeNode {
  memberId: string;
  username: string;
  firstName: string;
  lastName: string;
  sponsorUsername: string;
  placerUsername: string;
  packageName: string | null;
  image: string | null;
  left?: TreeNode;
  right?: TreeNode;
  isEmpty?: boolean;
  isLeftSlot?: boolean;
  isRightSlot?: boolean;
  parentUsername?: string;
}

interface TreeData extends TreeNode {
  children?: TreeData[];
}

interface SlotInfo {
  sponsorUsername: string;
  placerUsername: string;
  leg: 'left' | 'right';
}

const buildRegistrationUrl = (slot: SlotInfo): string => {
  const params = new URLSearchParams({
    sponsor: slot.sponsorUsername,
    placer: slot.placerUsername,
    leg: slot.leg.toUpperCase(),
  });
  return `${window.location.origin}/signup?${params.toString()}`;
};

// ─── Service ──────────────────────────────────────────────────────────────────

async function fetchMember(memberId: string): Promise<MemberRecord | null> {
  try {
    const { data } = await apiClient.get(`/api/v1/members/${memberId}`);
    const payload = data?.data || data;
    if (Array.isArray(payload)) return payload[0] ?? null;
    return payload ?? null;
  } catch (err) {
    console.error('FetchMember Error:', err);
    return null;
  }
}

async function buildTree(
  memberId: string,
  depth: number,
  maxDepth: number,
  cache: Map<string, MemberRecord>,
): Promise<TreeNode | null> {
  if (depth > maxDepth) return null;

  let record = cache.get(memberId);
  if (!record) {
    const fetched = await fetchMember(memberId);
    if (!fetched) return null;
    cache.set(memberId, fetched);
    record = fetched;
  }

  const leftId  = record.leftLegId  || record.leftMemberId  || (record as any).left_leg_id;
  const rightId = record.rightLegId || record.rightMemberId || (record as any).right_leg_id;

  const node: TreeNode = {
    memberId: record.memberId,
    username: record.username,
    firstName: record.firstName?.trim() ?? '',
    lastName:  record.lastName?.trim()  ?? '',
    sponsorUsername: record.sponsorUsername,
    placerUsername:  record.placerUsername,
    packageName: record.currentPackage?.name ?? null,
    image: record.image,
  };

  if (depth < maxDepth) {
    const [left, right] = await Promise.all([
      leftId  ? buildTree(leftId,  depth + 1, maxDepth, cache) : null,
      rightId ? buildTree(rightId, depth + 1, maxDepth, cache) : null,
    ]);
    if (left)  node.left  = left;
    if (right) node.right = right;
  }

  return node;
}

// ─── Invite URL Modal ─────────────────────────────────────────────────────────

const UrlModal: React.FC<{ slot: SlotInfo | null; onClose: () => void }> = ({ slot, onClose }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (slot) setCopied(false); }, [slot]);
  if (!slot) return null;

  const url = buildRegistrationUrl(slot);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl border border-emerald-50 dark:border-white/10 w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />
          <div className="p-7 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center">
                  <Link2 size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-white">Invite Link</h3>
                  <p className="text-xs text-emerald-600 mt-0.5">Ready for signup</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/10 transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Placer',  value: `@${slot.placerUsername}`  },
                { label: 'Leg',     value: slot.leg.toUpperCase(), color: 'text-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl bg-white dark:bg-white/5 border border-emerald-50 dark:border-white/5 p-2.5 text-center">
                  <p className="text-[9px] uppercase font-bold text-emerald-400 mb-0.5">{label}</p>
                  <p className={`text-[10px] font-bold truncate ${color || 'text-emerald-800 dark:text-emerald-100'}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white dark:bg-white/5 border border-dashed border-emerald-100 dark:border-white/10 p-3.5 text-center">
               <p className="text-[10px] font-mono break-all text-emerald-600 dark:text-emerald-400 select-all leading-relaxed">{url}</p>
            </div>

            <button
              onClick={handleCopy}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-amber-400 hover:bg-amber-400 text-white'
              }`}
            >
              {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Invite Link</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const R      = 28;   // member bubble radius
const R_EMPTY = 18;  // empty slot bubble radius

// ─── Props ────────────────────────────────────────────────────────────────────

interface GenealogyProps {
  memberId: string;
  sponsorUsername: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const Genealogys: React.FC<GenealogyProps> = ({ memberId, sponsorUsername }) => {
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [rootNode, setRootNode]     = useState<TreeNode | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);
  const [dims, setDims]             = useState({ width: 1000, height: 700 });
  const [zoom, setZoom]             = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

  const [currentRootId, setCurrentRootId] = useState(memberId);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setCurrentRootId(memberId);
    setHistory([]);
  }, [memberId]);

  const fetchTree = useCallback(async () => {
    if (!currentRootId) return;
    setIsLoading(true);
    setError(null);
    try {
      const cache = new Map<string, MemberRecord>();
      const tree  = await buildTree(currentRootId, 0, 2, cache);
      if (!tree) throw new Error('Tree construction failed.');
      setRootNode(tree);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentRootId]);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  const handleNodeClick = (nodeData: TreeNode, depth: number) => {
    if (depth > 0) {
      setHistory(prev => [...prev, currentRootId]);
      setCurrentRootId(nodeData.memberId);
    }
  };

  const handleBackUp = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevRoot = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentRootId(prevRoot);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 300) {
          setDims({ width: entry.contentRect.width, height: entry.contentRect.height || 700 });
        }
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const treeLayout = useMemo(() => {
    if (!rootNode) return null;

    const toD3 = (node: TreeNode): TreeData => {
      const nodeId = node.memberId || node.username || 'unknown';
      const children: TreeData[] = [];
      if (node.left) {
        children.push(toD3(node.left));
      } else {
        children.push({
          memberId: `e-l-${nodeId}`, username: '+', isEmpty: true, isLeftSlot: true,
          parentUsername: node.username, firstName: '', lastName: '', sponsorUsername,
          placerUsername: node.username, packageName: null, image: null
        });
      }
      if (node.right) {
        children.push(toD3(node.right));
      } else {
        children.push({
          memberId: `e-r-${nodeId}`, username: '+', isEmpty: true, isRightSlot: true,
          parentUsername: node.username, firstName: '', lastName: '', sponsorUsername,
          placerUsername: node.username, packageName: null, image: null
        });
      }
      return { ...node, children };
    };

    const h = d3.hierarchy(toD3(rootNode));
    const layout = d3.tree<TreeData>()
      .size([dims.width - 200, 480])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

    return layout(h);
  }, [rootNode, dims.width, sponsorUsername]);

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center flex-col gap-3">
      <div className="w-10 h-10 border-4 border-amber-400/10 border-t-amber-400 rounded-full animate-spin" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Loading Tree...</p>
    </div>
  );

  if (!rootNode) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="max-w-md p-10 text-center space-y-6 border-dashed border-2">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-white/5 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <Users size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-emerald-950 dark:text-white">Empty Network</h3>
            <p className="text-sm text-emerald-600">
              You don't have any members in your downline yet. 
              Start sharing your registration link to grow your network!
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) return (
    <div className="p-8">
      <ErrorState message={error} onRetry={fetchTree} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-20">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {history.length > 0 ? (
            <Button variant="secondary" className="rounded-xl px-4 py-2 flex items-center gap-1" onClick={handleBackUp}>
              <ChevronLeft size={16} /> Back Up
            </Button>
          ) : (
            <Button variant="secondary" className="rounded-xl px-4 py-2 flex items-center gap-1" onClick={() => window.history.back()}>
              <ChevronLeft size={16} /> Back
            </Button>
          )}
           <h2 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">Binary Genealogy</h2>
        </div>
        <div className="flex bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-white/10 rounded-xl p-1 shadow-sm">
           <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 text-emerald-400 hover:text-amber-400 transition-colors"><ZoomOut size={16} /></button>
           <button onClick={() => setZoom(1)} className="p-2 text-emerald-400 hover:text-amber-400 transition-colors"><Maximize2 size={16} /></button>
           <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="p-2 text-emerald-400 hover:text-amber-400 transition-colors"><ZoomIn size={16} /></button>
        </div>
      </div>

      <Card className="relative h-[720px] bg-white dark:bg-emerald-950 border-none shadow-inner overflow-hidden" noPadding>
        <div ref={containerRef} className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing">
           {treeLayout && (
             <svg width="100%" height="700" viewBox={`0 0 ${dims.width} 700`}>
                <g transform={`translate(100, 80) scale(${zoom})`}>
                   {/* Connections */}
                   {treeLayout.links().map((link, i) => {
                     const { source, target } = link;
                     const midY = (source.y + target.y) / 2;
                     return (
                       <path key={`link-${i}`}
                         d={`M ${source.x} ${source.y + R} V ${midY} H ${target.x} V ${target.y - (target.data.isEmpty ? R_EMPTY : R)}`}
                         fill="none" stroke="#cbd5e1" strokeWidth={1.5} opacity={target.data.isEmpty ? 0.3 : 0.8}
                       />
                     );
                   })}

                   {/* Nodes */}
                   {treeLayout.descendants().map((node, i) => {
                     const isRoot = node.depth === 0;
                     const isEmpty = !!node.data.isEmpty;
                     const r = isEmpty ? R_EMPTY : R;
                     const nodeKey = [
                       node.data.memberId || node.data.username || 'node',
                       node.data.parentUsername || 'root',
                       node.data.isLeftSlot ? 'left' : node.data.isRightSlot ? 'right' : 'member',
                       node.depth,
                       i,
                     ].join('-');
                     
                     return (
                       <g key={nodeKey} transform={`translate(${node.x}, ${node.y})`}>
                         {isEmpty ? (
                           <>
                             <circle r={r} fill="white" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4,4" className={`dark:fill-emerald-900 animate-pulse`}
                               onClick={() => setSelectedSlot({ sponsorUsername, placerUsername: node.data.parentUsername!, leg: node.data.isLeftSlot ? 'left' : 'right' })}
                               style={{ cursor: 'pointer' }}
                             />
                             <text dominantBaseline="central" textAnchor="middle" fontSize="14" fill="#94a3b8" pointerEvents="none">+</text>
                           </>
                         ) : (
                           <g onClick={!isRoot ? () => handleNodeClick(node.data, node.depth) : undefined} style={!isRoot ? { cursor: 'pointer' } : undefined}>
                             <circle r={r + 4} fill={isRoot ? '#f59e0b22' : '#fb923c22'} />
                             <circle r={r} fill={isRoot ? '#f59e0b' : '#fb923c'} stroke="white" strokeWidth={2} />
                             <foreignObject x={-10} y={-10} width={20} height={20}>
                               <div className="w-full h-full flex items-center justify-center text-white"><User size={14} /></div>
                             </foreignObject>
                             <text y={r + 14} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569" className="dark:fill-emerald-400">@{node.data.username}</text>
                             {isRoot && <text y={r + 26} textAnchor="middle" fontSize="8" fontWeight="black" fill="#f59e0b" letterSpacing="0.12em">SPONSOR</text>}
                             {!isRoot && node.depth === 1 && <text y={r + 26} textAnchor="middle" fontSize="8" fontWeight="black" fill="#fb923c" letterSpacing="0.12em">PLACER</text>}
                             {!isRoot && node.depth === 2 && <text y={r + 26} textAnchor="middle" fontSize="8" fontWeight="black" fill="#fb923c" letterSpacing="0.12em">CLICK TO EXPAND</text>}
                           </g>
                         )}
                       </g>
                     );
                   })}
                </g>
             </svg>
           )}
        </div>
      </Card>

      {selectedSlot && <UrlModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />}
    </div>
  );
};
