// مسیر فایل: src/app/select-workspace/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { Button } from "ndui-ahrom";
import { useRouter } from "next/navigation";

export default function SelectWorkspacePage() {
  const { workspaces, setActiveWorkspace, isLoading } = useWorkspace();
  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="card shadow-sm"
        style={{ minWidth: "400px", maxWidth: "90%" }}
      >
        <div className="card-body p-4 p-md-5">
          <h3 className="card-title text-center mb-4">انتخاب ورک‌اسپیس</h3>

          {workspaces.length > 0 ? (
            <>
              <p className="text-muted text-center mb-4">
                لطفاً یکی از ورک‌اسپیس‌های خود را برای ادامه انتخاب کنید.
              </p>
              <div className="list-group">
                {workspaces.map((ws) => (
                  <button
                    key={ws.workspaceId}
                    type="button"
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    onClick={() => setActiveWorkspace(ws)}
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
                  onClick={() => router.push("/dashboard/workspaces/create")}
                >
                  یا یک ورک‌اسپیس جدید بسازید
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted mb-4">
                شما هنوز در هیچ ورک‌اسپیسی عضو نیستید.
              </p>
              <Button
                className="btn btn-primary btn-lg"
                onClick={() => router.push("/dashboard/workspaces/create")}
              >
                <DIcon icon="fa-plus" cdi={false} classCustom="me-2" />
                ساخت اولین ورک‌اسپیس
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
