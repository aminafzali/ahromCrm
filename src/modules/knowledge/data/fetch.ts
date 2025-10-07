export const include = {
  category: { select: { id: true, name: true } },
  labels: {
    select: {
      label: { select: { id: true, name: true, color: true } },
    },
  },
  assignees: {
    select: {
      workspaceUser: {
        select: {
          id: true,
          displayName: true,
          user: { select: { name: true } },
        },
      },
    },
  },
  teamACL: {
    select: {
      team: {
        select: { id: true, name: true },
      },
    },
  },
} as any;

export const searchFileds = ["title", "slug", "excerpt", "content"];
export const relations: string[] = [];
export const connects = ["category"];
