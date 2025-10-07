"use client";

import React from "react";
import WorkspaceSupportButton from "./WorkspaceSupportButton";

export default function WorkspaceSupportButtonClient(
  props: React.ComponentProps<typeof WorkspaceSupportButton>
) {
  return <WorkspaceSupportButton {...props} />;
}
