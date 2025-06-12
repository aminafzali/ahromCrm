import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailWrapper } from "@/@Client/Components/wrappers";
import { listItemRender as listItemRenderLabel } from "@/modules/labels/data/table";
import { listItemRender as listItemRenderGroup } from "@/modules/user-groups/data/table";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { UserWithRelations } from "../../types";

interface UserDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

export default function DetailPage({ id }: UserDetailsViewProps) {
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useUser();
  const [user, setUser] = useState<UserWithRelations>({} as UserWithRelations);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const data = await getById(id);
      setUser(data);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const customRenderers = {
    labels: (value: []) => (
      <div>
        {value && value.length > 0 && (
          <div className="my-4">
            <h3>برچسپ ها</h3>
            <div className="grid lg:grid-cols-3 gap-2 my-2">
              {value.map((item, index) => (
                <div key={index}>{listItemRenderLabel(item)}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    groups: (value: []) => (
      <div>
        {value && value.length > 0 && (
          <div className="my-4">
            <h3>گروه ها</h3>
            <div className="grid lg:grid-cols-3 gap-2 my-2">
              {value.map((item, index) => (
                <div key={index}>{listItemRenderGroup(item)}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    phone: (value: string) => (
      <div className="flex justify-between py-1 rounded-lg bg-primary text-white px-2">
        <a href={`tel:${value}`} className="text-white text-lg flex">
          {value || "نامشخص"}
          <DIcon
            icon="fa-phone"
            cdi={false}
            classCustom="!mx-2 text-white text-lg"
          />
        </a>
      </div>
    ),
    serviceType: (value: { id; name }) => (
      <div className="flex text-primary underline py-1 rounded-lg px-2">
        <Link href={`/dashboard/service-types/${value.id}`}>
          {value?.name || "نامشخص"}
        </Link>
      </div>
    ),
    status: (value: { id; name; color }) => (
      <span
        className={` p-2 rounded-lg py-1 border-[1px]`}
        style={{ borderColor: value.color, color: value.color }}
      >
        {" "}
        {value.name}
      </span>
    ),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailWrapper
      data={user}
      title="مخاطب"
      excludeFields={["id", "createdAt", "_count", "labels", "groups"]}
      loading={loading}
      error={error}
      success={success}
      customRenderers={customRenderers}
      editUrl={`/dashboard/users/${id}/update`}
      showDefaultActions
    />
  );
}
