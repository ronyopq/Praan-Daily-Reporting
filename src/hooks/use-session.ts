"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: api.session,
    staleTime: 60_000,
  });
}
