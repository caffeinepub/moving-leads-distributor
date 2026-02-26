import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Truck } from "lucide-react";
import LeadsPage from "./components/LeadsPage";
import CompaniesPage from "./components/CompaniesPage";

type Tab = "leads" | "companies";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("leads");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-xs">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center gap-6 h-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mr-4">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground whitespace-nowrap hidden sm:block">
              Moving Leads Distributor
            </span>
            <span className="font-semibold text-sm tracking-tight text-foreground whitespace-nowrap sm:hidden">
              MLD
            </span>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("leads")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "leads"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              Leads
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("companies")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "companies"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              Companies
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {activeTab === "leads" ? <LeadsPage /> : <CompaniesPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto text-center text-xs text-muted-foreground">
          © 2026. Built with ♥ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
