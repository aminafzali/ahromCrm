// مسیر فایل: src/app/workspaces/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { Button } from "ndui-ahrom";
import { useRouter } from "next/navigation";

export default function WorkspacesHubPage() {
  const { workspaces, setActiveWorkspace, isLoading } = useWorkspace();
  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  const handleSelect = (ws: any) => {
    setActiveWorkspace(ws);
    if (ws.role.name === "USER") {
      router.push("/panel");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="card shadow-sm w-100" style={{ maxWidth: "600px" }}>
      <div className="card-body p-4 p-md-5">
        <h3 className="card-title text-center mb-4">انتخاب ورک‌اسپیس</h3>
        {workspaces.length > 0 ? (
          <>
            <p className="text-muted text-center mb-4">
              برای ادامه، وارد یکی از ورک‌اسپیس‌های خود شوید.
            </p>
            <div className="list-group">
              {workspaces.map((ws) => (
                <button
                  key={ws.workspaceId}
                  type="button"
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => handleSelect(ws)}
                >
                  <div>
                    <p className="mb-0 fw-bold">{ws.workspace.name}</p>
                    <small className="text-muted">
                      نقش شما: {ws.role.name}
                    </small>
                  </div>
                  <DIcon icon="fa-chevron-left" cdi={false} />
                </button>
              ))}
            </div>
            <div className="text-center mt-4">
              <hr />
              <Button
                className="btn-link mt-3"
                onClick={() => router.push("/workspaces/create")}
              >
                یا یک ورک‌اسپیس جدید بسازید
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted mb-4">
              شما هنوز هیچ ورک‌اسپیسی نساخته‌اید یا به آن دعوت نشده‌اید.
            </p>
            <Button
              className="btn btn-primary btn-lg"
              onClick={() => router.push("/workspaces/create")}
            >
              <DIcon icon="fa-plus" cdi={false} classCustom="me-2" />
              ساخت اولین ورک‌اسپیس
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
