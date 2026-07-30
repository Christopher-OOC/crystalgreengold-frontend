import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  BellRing,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { eventService } from '@/lib/api/services/misc.service';
import type { AdminEvent } from '@/lib/types/event.types';

interface EventManagementProps {
  onBack: () => void;
}

const formatDisplayValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
};

const getEventSummary = (event: AdminEvent) => {
  return (
    event.message ||
    event.description ||
    event.details ||
    event.summary ||
    event.title ||
    'No event details available'
  );
};

const getEventTitle = (event: AdminEvent) => {
  return event.title || event.eventType || event.type || 'System Event';
};

const formatDate = (value?: string) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const EventManagement: React.FC<EventManagementProps> = ({ onBack }) => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcknowledgingId, setIsAcknowledgingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await eventService.getUnacknowledged();
      setEvents(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAcknowledge = async (event: AdminEvent) => {
    const eventId = event.id ?? event.eventId;
    if (!eventId || isAcknowledgingId) return;

    setIsAcknowledgingId(String(eventId));
    setError(null);

    try {
      await eventService.acknowledge(String(eventId));
      await fetchEvents();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to acknowledge event.');
    } finally {
      setIsAcknowledgingId(null);
    }
  };

  const unacknowledgedCount = useMemo(() => events.length, [events]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">
          Loading Events...
        </p>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <ErrorState
        title="Events Error"
        message={error}
        onRetry={fetchEvents}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-emerald-600 hover:text-amber-400 transition-colors font-bold text-sm mb-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tight">
            Admin Events
          </h1>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
            Review unacknowledged system alerts and confirm them when resolved.
          </p>
        </div>

        <Button
          onClick={fetchEvents}
          disabled={isLoading}
          className="justify-center whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-1.5 font-black uppercase tracking-wider text-[10px] shadow-lg shadow-emerald-600/20"
        >
          {isLoading ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <BellRing className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Pending</span>
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-white">{unacknowledgedCount}</p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <Clock3 className="text-amber-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Latest</span>
          </div>
          <p className="text-sm font-black text-emerald-950 dark:text-white">
            {events[0]
              ? formatDate(String(events[0].eventDate || events[0].createdAt || events[0].createdOn))
              : 'No events'}
          </p>
        </Card>

        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <Sparkles className="text-yellow-500" size={20} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Status</span>
          </div>
          <p className="text-sm font-black text-emerald-950 dark:text-white">Awaiting acknowledgment</p>
        </Card>
      </div>

      <Card noPadding className="overflow-hidden border-none shadow-2xl">
        {events.length === 0 ? (
          <div className="py-16 text-center">
            <BellRing className="mx-auto text-emerald-200 mb-4" size={48} />
            <p className="text-sm font-black text-emerald-950 dark:text-white">No unacknowledged events</p>
            <p className="text-xs text-emerald-500 mt-1">Everything looks clear for now.</p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-50 dark:divide-white/5">
            {events.map((event, index) => {
              const eventId = event.id ?? event.eventId;
              const isAcknowledging = isAcknowledgingId === String(eventId);

              return (
                <motion.div
                  key={eventId ?? `${getEventTitle(event)}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600">
                        {formatDisplayValue(getEventTitle(event))}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-500">
                        {formatDate(event.eventDate || event.createdAt || event.createdOn)}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-emerald-950 dark:text-white">
                      {formatDisplayValue(getEventTitle(event))}
                    </h3>
                    <p className="text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                      {getEventSummary(event)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                      <Clock3 size={12} />
                      Pending
                    </div>
                    <Button
                      onClick={() => handleAcknowledge(event)}
                      disabled={isAcknowledging || !eventId}
                      className="justify-center whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-1.5 font-black uppercase tracking-wider text-[10px]"
                    >
                      {isAcknowledging ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                      <span>{isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}</span>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
