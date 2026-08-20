export type MessageDirection = "outbound" | "inbound";

export interface MessageRow {
  id: number;
  lead_id: number;
  direction: MessageDirection;
  content: string;
  created_at: string;
}

export interface Message {
  id: number;
  leadId: number;
  direction: MessageDirection;
  content: string;
  createdAt: string;
}

export function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    leadId: row.lead_id,
    direction: row.direction,
    content: row.content,
    createdAt: row.created_at,
  };
}
