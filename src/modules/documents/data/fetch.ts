export const include = {
  category: {
    select: { id: true, name: true, parentId: true },
  },
};

export const searchFileds = [
  "originalName",
  "filename",
  "mimeType",
  "type",
  "entityType",
];

export const relations = [
  // no extra relations beyond category for now
];

export const connects = ["category"];
