// src/modules/received-devices/components/SelectUser.tsx

"use client";
import DIcon from "@/@Client/Components/common/DIcon";
import { columnsForSelect as userColumns } from "@/modules/users/data/table";
import { useUser } from "@/modules/users/hooks/useUser";
import { UserWithRelations } from "@/modules/users/types";
import DataTable from "ndui-ahrom";
import { useEffect, useRef, useState } from "react";

export default function SelectUser({ value, onChange, disabled }: any) {
  const { getAll } = useUser();
  const [users, setUsers] = useState<UserWithRelations[]>([]);
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    getAll({ page: 1, limit: 500 }).then((res) => setUsers(res.data));
  }, []);

  const handleSelect = (row: any) => {
    onChange(row);
    modalRef.current?.close();
  };

  return (
    <div>
      <button
        type="button"
        className="btn btn-outline w-full justify-between font-normal"
        onClick={() => modalRef.current?.showModal()}
        disabled={disabled}
      >
        <span>
          {value?.name || value?.phone || (
            <span className="text-base-content/60">انتخاب مشتری</span>
          )}
        </span>
        <DIcon icon="fa-chevron-down" cdi={false} />
      </button>
      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          <h3 className="font-bold text-lg mb-4">انتخاب مشتری</h3>
          <div className="overflow-y-auto max-h-[60vh]">
            <DataTable
              columns={userColumns}
              data={users}
              onRowClicked={handleSelect}
              hAuto
              rowClassName="cursor-pointer hover:bg-base-200"
            />
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => modalRef.current?.close()}
            >
              بستن
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
