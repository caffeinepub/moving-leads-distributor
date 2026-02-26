import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { useGetBillingSummary } from "../hooks/useQueries";

export default function BillingPage() {
  const { data: summary = [], isLoading, isError } = useGetBillingSummary();

  const grandTotalLeads = summary.reduce(
    (acc, row) => acc + Number(row.totalLeads),
    0,
  );
  const grandTotalAmount = summary.reduce(
    (acc, row) => acc + Number(row.totalAmount),
    0,
  );

  const hasData = summary.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Billing Summary
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-calculated based on distributed leads
          </p>
        </div>
        {hasData && !isLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Grand Total: ${(grandTotalAmount / 100).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Studio
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  1BR
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  2BR
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  3BR+
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Leads
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Price/Lead
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Billing
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                ["r0", "r1", "r2"].map((rowKey) => (
                  <tr key={rowKey} className="border-b border-border">
                    {["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7"].map(
                      (colKey) => (
                        <td key={colKey} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ),
                    )}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Failed to load billing data.</p>
                  </td>
                </tr>
              ) : !hasData ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No billing data yet.</p>
                    <p className="text-xs mt-1 opacity-70">
                      Add companies and distribute leads to see billing
                      summaries.
                    </p>
                  </td>
                </tr>
              ) : (
                <>
                  {summary.map((row) => (
                    <tr
                      key={row.companyId}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.companyName}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                        {Number(row.studioCount)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                        {Number(row.oneBRCount)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                        {Number(row.twoBRCount)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                        {Number(row.threeBRPlusCount)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                        {Number(row.totalLeads)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        ${(Number(row.pricePerLead) / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">
                        ${(Number(row.totalAmount) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Grand Total Row */}
                  <tr className="bg-muted/60 border-t-2 border-border">
                    <td className="px-4 py-3 font-bold text-foreground">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-foreground">
                      {grandTotalLeads}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-foreground">
                      ${(grandTotalAmount / 100).toFixed(2)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
