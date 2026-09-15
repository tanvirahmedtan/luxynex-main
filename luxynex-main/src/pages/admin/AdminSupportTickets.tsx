import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, RefreshCcw } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type SupportTicket = Tables<"support_tickets">;

const STATUS_OPTIONS = ["open", "in_progress", "resolved"] as const;

const statusClass = (status: string) => {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-amber-100 text-amber-800";
    case "resolved":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [status, setStatus] = useState<SupportTicket["status"]>("open");
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    setTickets(data || []);
  };

  useEffect(() => {
    fetchTickets();
    const channel = supabase
      .channel("admin_support_tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => fetchTickets(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const selectedTicket = activeTicket;

  const openDialog = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    setStatus(ticket.status);
    setReply(ticket.admin_reply ?? "");
  };

  const saveChanges = async () => {
    if (!selectedTicket) return;
    setSaving(true);
    const { error } = await supabase
      .from("support_tickets")
      .update({ status, admin_reply: reply })
      .eq("id", selectedTicket.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ticket updated successfully.");
    setActiveTicket(null);
    fetchTickets();
  };

  const sortedTickets = useMemo(() => tickets, [tickets]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
            <p className="text-sm text-muted-foreground">
              Manage customer tickets, review attachments, update status, and reply.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTickets}>
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No support tickets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>
                          {ticket.customer_name}
                          <div className="text-xs text-muted-foreground">
                            {ticket.customer_email || ticket.customer_phone}
                          </div>
                        </TableCell>
                        <TableCell>{ticket.topic}</TableCell>
                        <TableCell>
                          <Badge className={statusClass(ticket.status)}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="inline-flex items-center gap-2">
                                <Eye className="h-4 w-4" /> View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ticket details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                <div>
                                  <p className="text-sm font-semibold">Title</p>
                                  <p className="text-sm text-muted-foreground">{ticket.title}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Topic</p>
                                  <p className="text-sm text-muted-foreground">{ticket.topic}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Customer</p>
                                  <p className="text-sm text-muted-foreground">
                                    {ticket.customer_name}
                                    {ticket.customer_email ? ` · ${ticket.customer_email}` : ""}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Description</p>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {ticket.description}
                                  </p>
                                </div>
                                {ticket.attachment_url && (
                                  <div>
                                    <p className="text-sm font-semibold">Attachment</p>
                                    <a
                                      href={ticket.attachment_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-primary text-sm"
                                    >
                                      Open attachment
                                    </a>
                                  </div>
                                )}
                                <div className="grid gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="admin-reply">Reply</Label>
                                    <Textarea
                                      id="admin-reply"
                                      value={activeTicket?.id === ticket.id ? reply : ticket.admin_reply ?? ""}
                                      onChange={(event) => setReply(event.target.value)}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="ticket-status">Status</Label>
                                    <select
                                      id="ticket-status"
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                      value={activeTicket?.id === ticket.id ? status : ticket.status}
                                      onChange={(event) =>
                                        setStatus(
                                          STATUS_OPTIONS.find(
                                            (value) => value === event.target.value,
                                          ) ?? "open",
                                        )
                                      }
                                    >
                                      {STATUS_OPTIONS.map((value) => (
                                        <option key={value} value={value}>
                                          {value.replace("_", " ")}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => openDialog(ticket)}
                                  >
                                    Refresh
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={saveChanges}
                                    disabled={saving}
                                  >
                                    {saving ? "Saving..." : "Save changes"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
