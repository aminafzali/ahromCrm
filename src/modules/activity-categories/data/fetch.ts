export const include = {
  parent: { select: { id: true, name: true } },
  children: { select: { id: true, name: true } },
};
export const searchFileds = ["name"];
export const relations: string[] = [];
export const connects = ["parent"];
