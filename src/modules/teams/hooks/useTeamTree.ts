import { useMemo } from "react";
import { TeamWithRelations } from "../types";

export interface TeamTreeNode {
  id: number;
  name: string;
  children: TeamTreeNode[];
}

const buildTree = (teams: TeamWithRelations[]): TeamTreeNode[] => {
  const teamMap = new Map<number, TeamTreeNode>();
  const rootNodes: TeamTreeNode[] = [];

  teams.forEach((team) => {
    teamMap.set(team.id, {
      id: team.id,
      name: team.name,
      children: [],
    });
  });

  teams.forEach((team) => {
    if (team.parentId && teamMap.has(team.parentId)) {
      const parentNode = teamMap.get(team.parentId);
      const childNode = teamMap.get(team.id);
      if (parentNode && childNode) {
        parentNode.children.push(childNode);
      }
    } else {
      const node = teamMap.get(team.id);
      if (node) {
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
};

export const useTeamTree = (teams: TeamWithRelations[]) => {
  const treeData = useMemo(() => buildTree(teams), [teams]);
  return { treeData };
};
