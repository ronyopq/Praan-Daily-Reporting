"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { clearSessionSnapshot, readSessionSnapshot, writeSessionSnapshot } from "@/lib/session-cache";

export function useSession() {
  const cachedUser = readSessionSnapshot();

  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await api.session();

      if (response.user) {
        writeSessionSnapshot(response.user);
      } else {
        clearSessionSnapshot();
      }

      return response;
    },
    initialData: cachedUser
      ? {
          user: cachedUser,
        }
      : undefined,
    staleTime: 1000 * 60 * 5,
  });
}
