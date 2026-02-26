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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type Company } from "../backend";
import { useCreateCompany, useUpdateCompany } from "../hooks/useQueries";

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
}

interface FormData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  pricePerLead: string;
}

const DEFAULT_FORM: FormData = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  pricePerLead: "",
};

export default function CompanyModal({
  open,
  onOpenChange,
  company,
}: CompanyModalProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const isEditing = !!company;
  const isPending = createCompany.isPending || updateCompany.isPending;

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        contactName: company.contactName,
        phone: company.phone,
        email: company.email,
        pricePerLead: (Number(company.pricePerLead) / 100).toFixed(2),
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [company]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    const pricePerLead = BigInt(
      Math.round(parseFloat(form.pricePerLead || "0") * 100),
    );
    try {
      if (isEditing && company) {
        await updateCompany.mutateAsync({
          id: company.id,
          name: form.name,
          contactName: form.contactName,
          phone: form.phone,
          email: form.email,
          pricePerLead,
        });
        toast.success("Company updated successfully");
      } else {
        await createCompany.mutateAsync({
          name: form.name,
          contactName: form.contactName,
          phone: form.phone,
          email: form.email,
          pricePerLead,
        });
        toast.success("Company created successfully");
      }
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? "Edit Company" : "Add Moving Company"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="companyName" className="text-xs font-medium">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="ABC Moving Co."
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactName" className="text-xs font-medium">
              Contact Name
            </Label>
            <Input
              id="contactName"
              value={form.contactName}
              onChange={(e) => handleChange("contactName", e.target.value)}
              placeholder="John Doe"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="companyPhone" className="text-xs font-medium">
                Phone
              </Label>
              <Input
                id="companyPhone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(555) 000-0000"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyEmail" className="text-xs font-medium">
                Email
              </Label>
              <Input
                id="companyEmail"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contact@abc.com"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pricePerLead" className="text-xs font-medium">
              Price Per Lead ($)
            </Label>
            <Input
              id="pricePerLead"
              type="number"
              step="0.01"
              min="0"
              value={form.pricePerLead}
              onChange={(e) => handleChange("pricePerLead", e.target.value)}
              placeholder="0.00"
              className="h-9 text-sm"
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
              {isPending && (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              )}
              {isEditing ? "Save Changes" : "Add Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
