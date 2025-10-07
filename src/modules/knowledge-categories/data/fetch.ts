export const include = {
  parent: { select: { id: true, name: true } },
  children: { select: { id: true, name: true, parentId: true } },
};

export const searchFileds = ["name", "description"];
export const relations: string[] = [];
export const connects = ["parent"];


