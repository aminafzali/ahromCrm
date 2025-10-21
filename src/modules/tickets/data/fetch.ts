export const include = {
  workspaceUser: {
    select: { id: true, displayName: true, user: { select: { name: true } } },
  },
  guestUser: {
    select: { id: true, name: true, email: true, phone: true },
  },
  assignedTo: {
    select: { id: true, displayName: true, user: { select: { name: true } } },
  },
  category: { select: { id: true, name: true } },
  labels: true,
};
export const searchFileds = ["subject", "status"];
export const relations: string[] = [];
export const connects = [
  "workspaceUser",
  "guestUser",
  "assignedTo",
  "category",
  "labels",
];
