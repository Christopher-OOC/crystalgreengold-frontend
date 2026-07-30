export interface AdminEvent {
  id?: string | number;
  eventId?: string | number;
  type?: string;
  eventType?: string;
  title?: string;
  message?: string;
  description?: string;
  details?: string;
  summary?: string;
  createdAt?: string;
  createdOn?: string;
  eventDate?: string;
  acknowledged?: boolean;
  isAcknowledged?: boolean;
  status?: string;
  [key: string]: unknown;
}
