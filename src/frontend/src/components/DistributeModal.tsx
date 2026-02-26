import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Building2, MapPin, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { type Lead, type Company } from "../backend";
import {
  useGetLeadAssignments,
  useDistributeLead,
  useGetAllCompanies,
} from "../hooks/useQueries";
import { formatMoveSize, formatDate } from "../utils/formatters";

interface DistributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

export default function DistributeModal({
  open,
  onOpenChange,
  lead,
}: DistributeModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: companies = [], isLoading: loadingCompanies } =
    useGetAllCompanies();
  const { data: assignedIds = [], isLoading: loadingAssignments } =
    useGetLeadAssignments(lead?.id ?? "");
  const distributeLead = useDistributeLead();

  const isPending = distributeLead.isPending;

  // Sync checked state when assignments are loaded
  useEffect(() => {
    if (assignedIds) {
      setSelectedIds(new Set(assignedIds));
    }
  }, [assignedIds]);

  // Reset on modal open
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
    }
  }, [open]);

  const toggleCompany = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!lead) return;
    const original = new Set(assignedIds);
    const toAdd = [...selectedIds].filter((id) => !original.has(id));
    const toRemove = [...original].filter((id) => !selectedIds.has(id));

    try {
      await distributeLead.mutateAsync({
        leadId: lead.id,
        companyIdsToAdd: toAdd,
        companyIdsToRemove: toRemove,
      });
      const total = selectedIds.size;
      toast.success(
        total > 0
          ? `Lead distributed to ${total} compan${total === 1 ? "y" : "ies"}`
          : "All company assignments removed",
      );
      onOpenChange(false);
    } catch {
      toast.error("Failed to update assignments. Please try again.");
    }
  };

  if (!lead) return null;

  const isLoading = loadingCompanies || loadingAssignments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Distribute Lead
          </DialogTitle>
          <DialogDescription className="sr-only">
            Assign this lead to moving companies
          </DialogDescription>
        </DialogHeader>

        {/* Lead summary */}
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3 space-y-1.5">
          <p className="font-semibold text-sm text-foreground">
            {lead.customerName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{lead.originAddress || "—"}</span>
            <ArrowRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{lead.destinationAddress || "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatMoveSize(lead.moveSize)}</span>
            {lead.moveDate && (
              <>
                <span className="text-border">·</span>
                <span>{formatDate(lead.moveDate)}</span>
              </>
            )}
          </div>
        </div>

        {/* Company list */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Assign to companies
          </p>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No companies found.</p>
              <p className="text-xs mt-0.5">Add companies first.</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {companies.map((company: Company) => (
                <label
                  key={company.id}
                  htmlFor={`company-${company.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-accent/60 transition-colors border border-transparent has-[input:checked]:border-border has-[input:checked]:bg-accent/40"
                >
                  <Checkbox
                    id={`company-${company.id}`}
                    checked={selectedIds.has(company.id)}
                    onCheckedChange={() => toggleCompany(company.id)}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {company.contactName}
                      {company.phone ? ` · ${company.phone}` : ""}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending || isLoading}
          >
            {isPending && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
