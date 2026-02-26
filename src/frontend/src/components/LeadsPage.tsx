import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Share2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { type Lead, type Company, Status } from "../backend";
import {
  useGetAllLeads,
  useGetAllCompanies,
  useGetLeadAssignments,
  useDeleteLead,
} from "../hooks/useQueries";
import { formatMoveSize, formatStatus, formatDate } from "../utils/formatters";
import LeadModal from "./LeadModal";
import DistributeModal from "./DistributeModal";
import ActivityLogModal from "./ActivityLogModal";

type FilterTab = "all" | Status;

function StatusBadge({ status }: { status: Status }) {
  const variants: Record<Status, string> = {
    [Status.new_]:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    [Status.distributed]:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    [Status.closed]:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function AssignedCompanies({
  leadId,
  companyMap,
}: {
  leadId: string;
  companyMap: Map<string, Company>;
}) {
  const { data: assignedIds = [], isLoading } = useGetLeadAssignments(leadId);
  if (isLoading) return <Skeleton className="h-4 w-20" />;
  if (!assignedIds.length)
    return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {assignedIds.map((id) => {
        const company = companyMap.get(id);
        return (
          <span
            key={id}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground border"
          >
            {company?.name ?? id.slice(0, 8)}
          </span>
        );
      })}
    </div>
  );
}

export default function LeadsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [distributingLead, setDistributingLead] = useState<Lead | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [activityLogLead, setActivityLogLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading, isError } = useGetAllLeads();
  const { data: companies = [] } = useGetAllCompanies();
  const deleteLead = useDeleteLead();

  const companyMap = useMemo(() => {
    const map = new Map<string, Company>();
    for (const c of companies) map.set(c.id, c);
    return map;
  }, [companies]);

  const filteredLeads = useMemo(() => {
    if (filter === "all") return leads;
    return leads.filter((l) => l.status === filter);
  }, [leads, filter]);

  const tabCounts = useMemo(
    () => ({
      all: leads.length,
      [Status.new_]: leads.filter((l) => l.status === Status.new_).length,
      [Status.distributed]: leads.filter(
        (l) => l.status === Status.distributed,
      ).length,
      [Status.closed]: leads.filter((l) => l.status === Status.closed).length,
    }),
    [leads],
  );

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setLeadModalOpen(true);
  };

  const handleDistribute = (lead: Lead) => {
    setDistributingLead(lead);
    setDistributeModalOpen(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    setDeletingLead(lead);
    setDeleteDialogOpen(true);
  };

  const handleActivityLog = (lead: Lead) => {
    setActivityLogLead(lead);
    setActivityLogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLead) return;
    try {
      await deleteLead.mutateAsync(deletingLead.id);
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingLead(null);
    }
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: Status.new_, label: "New" },
    { key: Status.distributed, label: "Distributed" },
    { key: Status.closed, label: "Closed" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Leads</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {leads.length} total lead{leads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingLead(null);
            setLeadModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Lead
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tabCounts[key as keyof typeof tabCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Move Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Route
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                ["r0","r1","r2","r3"].map((rowKey) => (
                  <tr key={rowKey} className="border-b border-border">
                    {["c0","c1","c2","c3","c4","c5","c6","c7"].map((colKey) => (
                      <td key={colKey} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Failed to load leads.</p>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <Share2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      {filter === "all"
                        ? "No leads yet. Click 'Add Lead' to get started."
                        : `No ${filter} leads.`}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {lead.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.email || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {lead.moveDate ? formatDate(lead.moveDate) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatMoveSize(lead.moveSize)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-xs">
                        <span className="truncate">
                          {lead.originAddress || "—"}
                        </span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {lead.destinationAddress || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      <AssignedCompanies
                        leadId={lead.id}
                        companyMap={companyMap}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleEdit(lead)}
                          title="Edit lead"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleDistribute(lead)}
                          title="Distribute lead"
                          disabled={lead.status === Status.closed}
                        >
                          <Share2 className="w-3.5 h-3.5 mr-1" />
                          Distribute
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(lead)}
                          title="Delete lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <LeadModal
        open={leadModalOpen}
        onOpenChange={(open) => {
          setLeadModalOpen(open);
          if (!open) setEditingLead(null);
        }}
        lead={editingLead}
      />

      <DistributeModal
        open={distributeModalOpen}
        onOpenChange={(open) => {
          setDistributeModalOpen(open);
          if (!open) setDistributingLead(null);
        }}
        lead={distributingLead}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead for{" "}
              <strong>{deletingLead?.customerName}</strong>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLead.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
