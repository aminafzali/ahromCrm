export const include = {
  user: {
    select: { id: true, displayName: true, user: { select: { name: true } } },
  },
  assignedAdmin: {
    select: { id: true, displayName: true, user: { select: { name: true } } },
  },
  assignedTeam: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  labels: true,
};
export const searchFileds = ["title", "status"];
export const relations: string[] = [];
export const connects = [
  "user",
  "assignedAdmin",
  "assignedTeam",
  "category",
  "labels",
];
