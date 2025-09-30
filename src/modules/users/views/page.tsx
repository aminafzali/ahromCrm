import Loading from "@/@Client/Components/common/Loading";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { FilterOption } from "@/@Client/types";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { LabelWithRelations } from "@/modules/labels/types";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { UserGroupWithRelations } from "@/modules/user-groups/types";
import { useEffect, useState } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";
import { UserRepository } from "../repo/UserRepository";
export default function IndexPage({ isAdmin = true, title = "مخاطبین" }) {
  const { getAll: getAllL, loading: loadingLabels } = useLabel();
  const { getAll: getAllG, loading: loadingG } = useUserGroup();

  const [labels, setLabels] = useState<LabelWithRelations[]>([]);
  const [groups, setGroups] = useState<UserGroupWithRelations[]>([]);

  useEffect(() => {
    get();
  }, []);

  const get = async () => {
    try {
      const data = await getAllL();
      const dataG = await getAllG();

      setLabels(data?.data || []);
      setGroups(dataG?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (loadingLabels || loadingG) return <Loading />;

  const filters: FilterOption[] = [];

  if (labels.length > 0) {
    const options = [
      {
        value: "all",
        label: "همه",
      },
    ];
    labels.map((item) =>
      options.push({
        value: String(item.id),
        label: item.name,
      })
    );
    filters.push({
      name: "labels",
      label: "برچسب",
      options: options, // تبدیل id به string
    });
  }

  if (groups.length > 0) {
    const options = [
      {
        value: "all",
        label: "همه",
      },
    ];
    groups.map((item) =>
      options.push({
        value: String(item.id),
        label: item.name,
      })
    );
    filters.push({
      name: "groups",
      label: "گروه کاربری",
      options: options, // تبدیل id به string
    });
  }

  return (
    <IndexWrapper
      columns={columnsForAdmin}
      listItemRender={listItemRender}
      filterOptions={filters.length > 0 ? filters : undefined}
      repo={new UserRepository()}
    />
  );
}
