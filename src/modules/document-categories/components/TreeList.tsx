"use client";

type Category = {
  id: number;
  name: string;
  children?: Category[];
};

function Node({ item, level = 0 }: { item: Category; level?: number }) {
  return (
    <li className="py-1">
      <div style={{ paddingInlineStart: level * 12 }}>{item.name}</div>
      {item.children && item.children.length > 0 && (
        <ul className="list-disc pr-4">
          {item.children.map((ch) => (
            <Node key={ch.id} item={ch} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeList({ items }: { items: Category[] }) {
  return (
    <ul className="list-disc pr-5">
      {items.map((c) => (
        <Node key={c.id} item={c} />
      ))}
    </ul>
  );
}
