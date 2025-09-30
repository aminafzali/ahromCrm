import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام مخاطب",
    render: (row) => row.name || "نامشخص",
  },
  {
    name: "phone",
    field: "phone",
    label: "شماره تماس",
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام مخاطب",
    render: (row) => row.name || "نامشخص",
  },
  {
    name: "phone",
    field: "phone",
    label: "شماره تماس",
  },
  {
    name: "labels",
    label: "برچسپ ها",
    render: (row) => (
      <span>
        {row.labels && row.labels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {row.labels.map((item) => (
              <span
                key={item.id}
                className={` p-2 rounded-lg py-1 border-[1px]`}
                style={{ borderColor: item.color, color: item.color }}
              >
                {" "}
                {item.name}
              </span>
            ))}
          </div>
        ) : (
          <p>-</p>
        )}
      </span>
    ),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/users/${row.id}`}
        onEdit={`/dashboard/users/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold text-md">{row.name || "نامشخص"}</h3>

        {row.address && (
          <p className="text-gray-500 text-sm mt-1">
            <DIcon icon="fa-location-dot" cdi={false} classCustom="ml-1" />
            {row.address}
          </p>
        )}
      </div>
      <div className="flex justify-between py-1 rounded-lg border-[1px] border-primary text-primary px-2">
        <a href={`tel:${row.phone}`} className="text-primary text-lg flex">
          {row.phone || "نامشخص"}
          <DIcon
            icon="fa-phone"
            cdi={false}
            classCustom="!mx-1 text-primary text-lg"
          />
        </a>
      </div>
    </div>
    {row.labels && row.labels.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {row.labels.map((item) => (
          <span
            key={item.id}
            className={` p-2 rounded-lg py-1 border-[1px]`}
            style={{ borderColor: item.color, color: item.color }}
          >
            {" "}
            {item.name}
          </span>
        ))}
      </div>
    )}
    <div className="flex justify-end items-center mt-2">
      <div className="flex justify-end items-center mt-4 border-t-2 pt-4 w-full">
        <ActionsTable
          actions={["view", "edit", "delete"]}
          row={row}
          onView={`/dashboard/users/${row.id}`}
          onEdit={`/dashboard/users/${row.id}/update`}
          showLabels
          className="justify-between px-4 w-full "
        />
      </div>
    </div>
  </div>
);
