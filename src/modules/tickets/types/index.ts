import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { Ticket, TicketPriority, TicketStatus } from "@prisma/client";

export type TicketWithRelations = Ticket & {
  workspaceUser?: WorkspaceUserWithRelations | null;
  guestUser?: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  assignedTo?: WorkspaceUserWithRelations | null;
  category?: { id: number; name: string } | null;
  labels?: { id: number; name: string; color?: string | null }[];
};

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: number;
  categoryId?: number;
}

export { TicketPriority, TicketStatus };
