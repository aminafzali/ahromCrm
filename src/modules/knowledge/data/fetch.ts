export const include = {
  category: { select: { id: true, name: true } },
  labels: { select: { id: true, name: true, color: true } },
  assignees: {
    select: {
      id: true,
      displayName: true,
      user: { select: { name: true } },
    },
  },
  assigneesTeams: {
    select: { id: true, name: true },
  },
} as any;

export const searchFileds = ["title", "slug", "excerpt", "content"];
export const relations: string[] = [];
export const connects = ["category"];
