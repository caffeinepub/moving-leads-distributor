import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { type Lead, type Company, MoveSize, Status } from "../backend";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  leads: ["leads"] as const,
  companies: ["companies"] as const,
  leadAssignments: (leadId: string) => ["leadAssignments", leadId] as const,
  isAdmin: ["isAdmin"] as const,
  activityLog: (leadId: string) => ["activityLog", leadId] as const,
};

// ── Admin Check ───────────────────────────────────────────────────────────────
export function useIsCallerAdmin(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: QUERY_KEYS.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && enabled,
    retry: false,
  });
}

// ── Activity Log ──────────────────────────────────────────────────────────────
export function useGetActivityLog(leadId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.activityLog(leadId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityLog(leadId);
    },
    enabled: !!actor && !isFetching && !!leadId,
  });
}

export function useAddActivityLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { leadId: string; message: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addActivityLog(params.leadId, params.message);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.activityLog(variables.leadId),
      });
    },
  });
}

// ── Leads ────────────────────────────────────────────────────────────────────
export function useGetAllLeads() {
  const { actor, isFetching } = useActor();
  return useQuery<Lead[]>({
    queryKey: QUERY_KEYS.leads,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string;
      phone: string;
      email: string;
      moveDate: string;
      originAddress: string;
      destinationAddress: string;
      moveSize: MoveSize;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const id = crypto.randomUUID();
      await actor.createLead(
        id,
        params.customerName,
        params.phone,
        params.email,
        params.moveDate,
        params.originAddress,
        params.destinationAddress,
        params.moveSize,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
    },
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      customerName: string;
      phone: string;
      email: string;
      moveDate: string;
      originAddress: string;
      destinationAddress: string;
      moveSize: MoveSize;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateLead(
        params.id,
        params.customerName,
        params.phone,
        params.email,
        params.moveDate,
        params.originAddress,
        params.destinationAddress,
        params.moveSize,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteLead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
    },
  });
}

// ── Companies ─────────────────────────────────────────────────────────────────
export function useGetAllCompanies() {
  const { actor, isFetching } = useActor();
  return useQuery<Company[]>({
    queryKey: QUERY_KEYS.companies,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCompanies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCompany() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      contactName: string;
      phone: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const id = crypto.randomUUID();
      await actor.createCompany(
        id,
        params.name,
        params.contactName,
        params.phone,
        params.email,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies });
    },
  });
}

export function useUpdateCompany() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      contactName: string;
      phone: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateCompany(
        params.id,
        params.name,
        params.contactName,
        params.phone,
        params.email,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies });
    },
  });
}

export function useDeleteCompany() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteCompany(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies });
    },
  });
}

// ── Assignments ───────────────────────────────────────────────────────────────
export function useGetLeadAssignments(leadId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: QUERY_KEYS.leadAssignments(leadId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompanyAssignmentsForLead(leadId);
    },
    enabled: !!actor && !isFetching && !!leadId,
  });
}

export function useDistributeLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      leadId: string;
      companyIdsToAdd: string[];
      companyIdsToRemove: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      await Promise.all([
        ...params.companyIdsToAdd.map((cid) =>
          actor.assignLeadToCompany(params.leadId, cid),
        ),
        ...params.companyIdsToRemove.map((cid) =>
          actor.removeCompanyAssignment(params.leadId, cid),
        ),
      ]);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.leadAssignments(variables.leadId),
      });
    },
  });
}

export { MoveSize, Status };
export type { Lead, Company };
