import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MoveSize, type Lead } from "../backend";
import { useCreateLead, useUpdateLead } from "../hooks/useQueries";

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
}

interface FormData {
  customerName: string;
  phone: string;
  email: string;
  moveDate: string;
  originAddress: string;
  destinationAddress: string;
  moveSize: MoveSize;
  notes: string;
}

const DEFAULT_FORM: FormData = {
  customerName: "",
  phone: "",
  email: "",
  moveDate: "",
  originAddress: "",
  destinationAddress: "",
  moveSize: MoveSize.studio,
  notes: "",
};

export default function LeadModal({ open, onOpenChange, lead }: LeadModalProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const isEditing = !!lead;
  const isPending = createLead.isPending || updateLead.isPending;

  useEffect(() => {
    if (lead) {
      setForm({
        customerName: lead.customerName,
        phone: lead.phone,
        email: lead.email,
        moveDate: lead.moveDate,
        originAddress: lead.originAddress,
        destinationAddress: lead.destinationAddress,
        moveSize: lead.moveSize,
        notes: lead.notes,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [lead]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    try {
      if (isEditing && lead) {
        await updateLead.mutateAsync({ id: lead.id, ...form });
        toast.success("Lead updated successfully");
      } else {
        await createLead.mutateAsync(form);
        toast.success("Lead created successfully");
      }
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? "Edit Lead" : "Add New Lead"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label htmlFor="customerName" className="text-xs font-medium">
              Customer Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              value={form.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
              placeholder="Jane Smith"
              className="h-9 text-sm"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(555) 000-0000"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="jane@example.com"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Move Date & Move Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="moveDate" className="text-xs font-medium">
                Move Date
              </Label>
              <Input
                id="moveDate"
                type="date"
                value={form.moveDate}
                onChange={(e) => handleChange("moveDate", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="moveSize" className="text-xs font-medium">
                Move Size
              </Label>
              <Select
                value={form.moveSize}
                onValueChange={(v) => handleChange("moveSize", v)}
              >
                <SelectTrigger id="moveSize" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MoveSize.studio}>Studio</SelectItem>
                  <SelectItem value={MoveSize.oneBR}>1 BR</SelectItem>
                  <SelectItem value={MoveSize.twoBR}>2 BR</SelectItem>
                  <SelectItem value={MoveSize.threeBRPlus}>3 BR+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Origin Address */}
          <div className="space-y-1.5">
            <Label htmlFor="originAddress" className="text-xs font-medium">
              Origin Address
            </Label>
            <Input
              id="originAddress"
              value={form.originAddress}
              onChange={(e) => handleChange("originAddress", e.target.value)}
              placeholder="123 Current St, City, ST 00000"
              className="h-9 text-sm"
            />
          </div>

          {/* Destination Address */}
          <div className="space-y-1.5">
            <Label htmlFor="destinationAddress" className="text-xs font-medium">
              Destination Address
            </Label>
            <Input
              id="destinationAddress"
              value={form.destinationAddress}
              onChange={(e) =>
                handleChange("destinationAddress", e.target.value)
              }
              placeholder="456 New Ave, City, ST 00000"
              className="h-9 text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any special requirements or notes..."
              className="text-sm resize-none"
              rows={3}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
