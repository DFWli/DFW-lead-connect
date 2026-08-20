export const LEAD_TYPES = [
  "missed_call",
  "web_form",
  "estimate_followup",
  "reactivation",
] as const;

export type LeadType = (typeof LEAD_TYPES)[number];

export interface LeadRow {
  id: number;
  name: string | null;
  phone: string;
  source: string | null;
  message: string | null;
  lead_type: LeadType;
  status: string;
  created_at: string;
}

export interface Lead {
  id: number;
  name: string | null;
  phone: string;
  source: string | null;
  message: string | null;
  leadType: LeadType;
  status: string;
  createdAt: string;
}

export function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    source: row.source,
    message: row.message,
    leadType: row.lead_type,
    status: row.status,
    createdAt: row.created_at,
  };
}
