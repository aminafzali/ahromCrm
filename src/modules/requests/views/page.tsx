import Loading from "@/@Client/Components/common/Loading";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { FilterOption } from "@/@Client/types";
import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
import { ServiceType } from "@/modules/service-types/types";
import { useStatus } from "@/modules/statuses/hooks/useStatus";
import { Status } from "@/modules/statuses/types";
import { useEffect, useState } from "react";
import {
  columnsForAdmin,
  columnsForUser,
  listItemRender,
  listItemRenderUser,
} from "../data/table";
import { useRequest } from "../hooks/useRequest";
import { RequestWithRelations } from "../types";

export default function IndexPage({ isAdmin = false, title = "درخواست‌ها" }) {
  const { getAll, loading, error } = useRequest();
  const { getAll: getAllG, loading: loadingG } = useServiceType();
  const { getAll: getAllS, loading: loadingS } = useStatus();
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [statuses, setSatus] = useState<Status[]>([]);

  useEffect(() => {
    get();
  }, []);

  const get = async () => {
    try {
      const dataG = await getAllG();
      const dataS = await getAllS();

      setTypes(dataG?.data || []);
      setSatus(dataS?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (loadingG || loadingG) return <Loading />;

  const filters: FilterOption[] = [];

  if (types.length > 0) {
    const options: { value: string | number; label: string }[] = [
      {
        value: "all",
        label: "همه",
      },
    ];

    types.map((item) =>
      options.push({
        value: item.id,
        label: item.name,
      })
    );

    filters.push({
      name: "serviceTypeId_in",
      label: "نوع سرویس",
      options: options, // تبدیل id به string
    });
  }

  if (statuses.length > 0) {
    const options: { value: string | number; label: string }[] = [
      {
        value: "all",
        label: "همه",
      }
    ];
    statuses.map((item) =>
      options.push({
        value: item.id,
        label: item.name,
      })
    );
    filters.push({
      name: "statusId_in",
      label: "وضعیت",
      options: options, // تبدیل id به string
    });
  }

  return (
    <DataTableWrapper<RequestWithRelations>
      columns={isAdmin ? columnsForAdmin : columnsForUser}
      createUrl={
        isAdmin ? "/dashboard/requests/create" : "/panel/requests/create"
      }
      listItemRender={isAdmin ? listItemRender : listItemRenderUser}
      loading={loading}
      error={error}
      title={title}
      fetcher={getAll}
      showIconViews={isAdmin}
      filterOptions={filters}
    />
  );
}
