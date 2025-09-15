"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeam } from "../../hooks/useTeam";
import { TeamSchema } from "../../validation/schema";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";
import { useModuleCrud } from "@/@Client/hooks/useModuleCrud"; // هوک عمومی ما

// ========= FIX IS HERE (Part 1) =========
// 1. Define the complete and correct FetchConfig for workspace-users
const workspaceUsersConfig = {
  key: "workspace-users", // This is just a unique key for SWR caching
  api: "/api/workspace-users", // This is the actual API endpoint
  apiId: (id: string | number) => `/api/workspace-users/${id}`, // Required by the hook's type
};
// ==========================================

const TeamCreatePage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { create, isCreating } = useTeam(); // isCreating is from the destructured hook

  const [userOptions, setUserOptions] = useState<OptionType[]>([]);

  // ========= FIX IS HERE (Part 2) =========
  // 2. Use the correct config to fetch users.
  // The hook directly returns `data`, which contains the API response.
  const { data: usersApiResponse, isLoading: usersLoading } = useModuleCrud(workspaceUsersConfig);
  // ==========================================

  useEffect(() => {
    // The API response for lists is an object { data: [], pagination: {} }
    // We check if it exists and then map over the `data` property.
    if (usersApiResponse?.data) {
      setUserOptions(
        usersApiResponse.data.map((u: any) => ({
          label: u.user.name || u.user.phone,
          value: u.id,
        }))
      );
    }
  }, [usersApiResponse]); // Effect runs when user data arrives

  const form = useForm<z.infer<typeof TeamSchema>>({
    resolver: zodResolver(TeamSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
    },
  });

  async function onSubmit(values: z.infer<typeof TeamSchema>) {
    try {
      await create(values);
      toast({
        title: "موفقیت",
        description: "تیم با موفقیت ایجاد شد.",
      });
      router.push("/dashboard/teams");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "خطایی در ایجاد تیم رخ داد.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ایجاد تیم جدید</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام تیم</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: تیم بازاریابی" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وظایف اصلی این تیم را شرح دهید..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="members"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اعضای تیم</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={userOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder={usersLoading ? "در حال بارگذاری کاربران..." : "اعضا را انتخاب کنید..."}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isCreating}>
              {isCreating ? "در حال ذخیره..." : "ایجاد تیم"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TeamCreatePage;