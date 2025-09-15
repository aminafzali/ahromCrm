"use client";
import React from "react";
import { useTeam } from "../hooks/useTeam";
import { columns } from "./columns";
import { DataTable } from "./data-table"; // Assuming it's in the same folder
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TeamsPage = () => {
  const { get } = useTeam();
  const { data, isLoading } = get;

  if (isLoading) return <div>در حال بارگذاری...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>مدیریت تیم‌ها</CardTitle>
        <Button asChild>
          <Link href="/dashboard/teams/create">ایجاد تیم جدید</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data?.data || []} />
      </CardContent>
    </Card>
  );
};

export default TeamsPage;