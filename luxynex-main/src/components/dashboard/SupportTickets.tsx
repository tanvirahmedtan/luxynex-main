import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus } from "lucide-react";

interface TicketItem {
  id: string;
  title: string;
  topic: string;
  status: "Pending" | "Solved" | "Open" | "Closed";
  createdAt: string;
}

interface SupportTicketsProps {
  userId: string;
}

function ticketBadge(status: TicketItem["status"]) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Solved":
      return "bg-emerald-100 text-emerald-700";
    case "Open":
      return "bg-sky-100 text-sky-700";
    case "Closed":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function SupportTickets({ userId }: SupportTicketsProps) {
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    const saved = window.localStorage.getItem(`luxynex_support_tickets_${userId}`);
    if (!saved) {
      setTickets([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as TicketItem[];
      setTickets(parsed);
    } catch {
      setTickets([]);
    }
  }, [userId]);

  const hasTickets = tickets.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl bg-slate-950 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-semibold text-white">Support tickets</p>
          <p className="mt-1 text-sm text-slate-400">
            Create and track support requests from your account dashboard.
          </p>
        </div>
        <Button asChild variant="secondary" className="rounded-2xl bg-slate-800 text-white hover:bg-slate-700">
          <Link to="/profile?section=support-tickets&action=create">
            <Plus className="h-4 w-4" /> Create ticket
          </Link>
        </Button>
      </div>

      {!hasTickets ? (
        <Card>
          <CardContent className="rounded-3xl border border-dashed border-border bg-background p-16 text-center">
            <Ticket className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-foreground">
              No Support Ticket Found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by creating a new support ticket so we can help resolve your issue.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your tickets</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-muted-foreground">
              <thead>
                <tr className="border-b border-border text-slate-500">
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="bg-slate-950 text-white">
                    <td className="px-4 py-4 font-medium">{ticket.id}</td>
                    <td className="px-4 py-4">{ticket.title}</td>
                    <td className="px-4 py-4">{ticket.topic}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ticketBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
