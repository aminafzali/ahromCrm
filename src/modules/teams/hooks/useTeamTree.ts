import { useMemo } from "react";
import { TeamWithRelations } from "../types"; // فرض می‌شود این تایپ موجود است

// تعریف ساختار هر گره در درخت
export interface TeamTreeNode {
  id: number;
  name: string;
  children: TeamTreeNode[];
}

// تابعی برای ساخت ساختار درختی از لیست تخت
const buildTree = (teams: TeamWithRelations[]): TeamTreeNode[] => {
  const teamMap = new Map<number, TeamTreeNode>();
  const rootNodes: TeamTreeNode[] = [];

  // ابتدا تمام تیم‌ها را به صورت گره‌های تکی در map قرار می‌دهیم
  teams.forEach((team) => {
    teamMap.set(team.id, {
      id: team.id,
      name: team.name,
      children: [],
    });
  });

  // سپس با پیمایش دوباره، هر گره را به والد خود متصل می‌کنیم
  teams.forEach((team) => {
    if (team.parentId && teamMap.has(team.parentId)) {
      const parentNode = teamMap.get(team.parentId);
      const childNode = teamMap.get(team.id);
      if (parentNode && childNode) {
        parentNode.children.push(childNode);
      }
    } else {
      // اگر تیمی والد نداشت، یک گره ریشه است
      const node = teamMap.get(team.id);
      if (node) {
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
};

export const useTeamTree = (teams: TeamWithRelations[]) => {
  const treeData = useMemo(() => buildTree(teams), []);

  return { treeData };
};
