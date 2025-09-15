import { Team, TeamMember, User, WorkspaceUser } from "@prisma/client";

// A TeamMember with the full WorkspaceUser and User details
export interface ITeamMember extends TeamMember {
  workspaceUser: WorkspaceUser & {
    user: User;
  };
}

// The main Team interface including its members
export interface ITeam extends Team {
  members: ITeamMember[];
  _count?: {
    assignedProjects: number;
    assignedTasks: number;
    members: number;
  };
}

// For creating a new team
export interface ITeamCreate {
  name: string;
  description?: string | null;
  // Array of workspaceUser IDs
  members: number[];
}

// For updating an existing team
export type ITeamUpdate = Partial<ITeamCreate>;
