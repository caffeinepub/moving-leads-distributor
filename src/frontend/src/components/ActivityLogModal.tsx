import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ClipboardList, Clock } from "lucide-react";
import { toast } from "sonner";
import { useGetActivityLog, useAddActivityLog } from "../hooks/useQueries";

interface ActivityLogModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  leadCustomerName: string;
}

function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ms));
}

export default function ActivityLogModal({
  open,
  onClose,
  leadId,
  leadCustomerName,
}: ActivityLogModalProps) {
  const [note, setNote] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: entries = [], isLoading } = useGetActivityLog(leadId);
  const addLog = useAddActivityLog();

  // Sort newest first
  const sortedEntries = [...entries].sort((a, b) =>
    b.timestamp > a.timestamp ? 1 : -1,
  );

  // Reset note when modal closes
  useEffect(() => {
    if (!open) setNote("");
  }, [open]);

  const handleAddNote = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    try {
      await addLog.mutateAsync({ leadId, message: trimmed });
      setNote("");
      textareaRef.current?.focus();
    } catch {
      toast.error("Failed to add note. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md flex flex-col max-h-[80vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            Activity Log
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {leadCustomerName}
          </DialogDescription>
        </DialogHeader>

        {/* Log entries */}
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <ScrollArea className="flex-1 min-h-0 rounded-md border border-border bg-muted/30 p-1">
            <div className="space-y-1 p-2">
              {isLoading ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : sortedEntries.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-25" />
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs mt-0.5 opacity-70">
                    Notes you add will appear here
                  </p>
                </div>
              ) : (
                sortedEntries.map((entry) => (
                  <div
                    key={`${entry.timestamp}-${entry.message.slice(0, 20)}`}
                    className="group px-3 py-2.5 rounded-md hover:bg-background/70 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <span className="text-xs text-muted-foreground/70 font-medium">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-snug">
                      {entry.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Add note */}
          <div className="shrink-0 space-y-2">
            <Textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a note… (Ctrl+Enter to submit)"
              className="text-sm resize-none"
              rows={3}
              disabled={addLog.isPending}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!note.trim() || addLog.isPending}
              >
                {addLog.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : null}
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
