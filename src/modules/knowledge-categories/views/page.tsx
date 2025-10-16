"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { columnsForAdmin } from "../data/table";

class Repo extends BaseRepository<any, number> {
  constructor() {
    super("knowledge-categories");
  }
}

export default function IndexPage() {
  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new Repo()}
      title="دسته‌بندی‌های پایگاه دانش"
    />
  );
}
