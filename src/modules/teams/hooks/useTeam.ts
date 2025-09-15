import useSWR from "swr";
import { useCrud } from "@/@Client/hooks/useCrud"; // Import the new generic hook
import { ITeam, ITeamCreate, ITeamUpdate } from "../types";
import axios from "axios";
import { useModuleCrud } from "@/@Client/hooks/useModuleCrud";

// A simple fetcher for fetching a single item by ID
const singleFetcher = (url: string) => axios.get(url).then((res) => res.data);

// API configuration for the teams module
const TeamFetchConfig = {
  key: "teams",
  api: "/api/teams",
  apiId: (id: number | string) => `/api/teams/${id}`,
};

export function useTeam() {
  const {
    data,
    isLoading,
    error,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
    refresh
  } = useModuleCrud<ITeam, ITeamCreate, ITeamUpdate>(TeamFetchConfig);

  // Hook for fetching a single team by its ID
  const getById = (id: number | string) => {
    const { 
      data: singleData, 
      error: singleError, 
      isLoading: singleIsLoading, 
      mutate 
    } = useSWR<ITeam>(id ? TeamFetchConfig.apiId(id) : null, singleFetcher);
    
    return { data: singleData, error: singleError, isLoading: singleIsLoading, mutate };
  };

  return {
    // List data and state
    get: { data, isLoading, error, refresh },
    
    // Single item data
    getById,
    
    // CRUD operations
    create,
    update,
    remove,

    // Mutation states
    isCreating,
    isUpdating,
    isDeleting,
  };
}