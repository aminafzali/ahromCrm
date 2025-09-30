"use client";

import { useToast } from "@/components/ui/toaster-provider"; // <-- Change the import path
import axios from "axios";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface FetchConfig {
  key: string;
  api: string;
  apiId: (id: number | string) => string;
}

export function useModuleCrud<T, TCreate = Partial<T>, TUpdate = Partial<T>>(
  config: FetchConfig
) {
  const { toast } = useToast();

  // --- Define Fetchers ---
  const createFetcher = (url: string, { arg }: { arg: TCreate }) => {
    return axios.post(url, arg).then((res) => res.data);
  };

  const updateFetcher = (
    key: string,
    { arg }: { arg: { id: number | string } & TUpdate }
  ) => {
    const { id, ...updateData } = arg;
    return axios.put(config.apiId(id), updateData).then((res) => res.data);
  };

  const deleteFetcher = (
    key: string,
    { arg: id }: { arg: number | string }
  ) => {
    return axios.delete(config.apiId(id)).then((res) => res.data);
  };

  // --- SWR Hooks ---
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<any, Error>(config.api, fetcher);

  // --- Mutations with TYPE ASSERTION ---

  const { trigger: createTrigger, isMutating: isCreating } = useSWRMutation(
    config.api,
    createFetcher
  );
  // We assert the type of the trigger function to remove ambiguity
  const createItem = createTrigger as (arg: TCreate) => Promise<T | undefined>;

  const { trigger: updateTrigger, isMutating: isUpdating } = useSWRMutation(
    config.api,
    updateFetcher
  );
  // We assert the type for the update trigger as well
  const updateItem = updateTrigger as (
    arg: { id: number | string } & TUpdate
  ) => Promise<T | undefined>;

  const { trigger: deleteTrigger, isMutating: isDeleting } = useSWRMutation(
    config.api,
    deleteFetcher
  );
  // And for the delete trigger
  const deleteItem = deleteTrigger as (
    arg: number | string
  ) => Promise<any | undefined>;

  // --- Handler Functions (These will now work correctly) ---
  const handleCreate = async (newData: TCreate) => {
    try {
      const result = await createItem(newData);
      toast({ title: "موفقیت", description: "با موفقیت ایجاد شد." });
      refresh();
      return result;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "خطا در ایجاد آیتم.",
      });
      throw error;
    }
  };

  const handleUpdate = async (id: number | string, updatedData: TUpdate) => {
    try {
      const result = await updateItem({ id, ...updatedData });
      toast({ title: "موفقیت", description: "با موفقیت ویرایش شد." });
      refresh();
      return result;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "خطا در ویرایش آیتم.",
      });
      throw error;
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteItem(id);
      toast({ title: "موفقیت", description: "با موفقیت حذف شد." });
      refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message || "خطا در حذف آیتم.",
      });
      throw error;
    }
  };

  return {
    data,
    error,
    isLoading,
    create: handleCreate,
    update: handleUpdate,
    remove: handleDelete,
    isCreating,
    isUpdating,
    isDeleting,
    refresh,
    config,
  };
}
