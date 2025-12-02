"use client";

import Loading from "@/@Client/Components/common/Loading";
import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { useEffect, useState } from "react";
import { columnsForAdmin } from "../data/table";
import { BankAccountRepository } from "../repo/BankAccountRepository";

export default function BankAccountsPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return <Loading />;

  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new BankAccountRepository()}
      title="حساب‌های بانکی"
    />
  );
}
