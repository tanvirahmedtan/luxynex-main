import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Paperclip, MessageSquare } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type SupportTicket = Tables<"support_tickets">;

const TOPICS = [
  "Order Issue",
  "Payment Issue",
  "Product Issue",
  "Delivery Problem",
  "Other",
];

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    resolved: "bg-emerald-100 text-emerald-800",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

export default function SupportTickets() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    topic: TOPICS[0],
    description: "",
    attachment: null as File | null,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/signin");
    }
  }, [loading, user, navigate]);

  const fetchTickets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTickets(data || []);
  };

  useEffect(() => {
    fetchTickets();
    if (!user) return;
    const channel = supabase
      .channel(`support_tickets_${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets", filter: `user_id=eq.${user.id}` },
        () => fetchTickets(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createTicket = async () => {
    if (!user || !profile) {
      toast.error("Please sign in to create a ticket.");
      return;
    }

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    let attachmentUrl: string | null = null;

    if (form.attachment) {
      try {
        const path = `support-ticket-attachments/${user.id}/${Date.now()}-${form.attachment.name}`;
        const { error: uploadError } = await supabase.storage
          .from("support-ticket-attachments")
          .upload(path, form.attachment);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("support-ticket-attachments")
          .getPublicUrl(path);
        attachmentUrl = data.publicUrl;
      } catch (error: any) {
        toast.error(error.message || "Attachment upload failed");
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.from("support_tickets").insert([
      {
        user_id: user.id,
        customer_name: profile.full_name || "Customer",
        customer_email: user.email,
        customer_phone: profile.phone,
        title,
        topic: form.topic,
        description,
        attachment_url: attachmentUrl,
      },
    ]);

    if (error) {
      toast.error(error.message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Support ticket created successfully.");
    setForm({ title: "", topic: TOPICS[0], description: "", attachment: null });
    fetchTickets();
    setIsSubmitting(false);
  };

  const ticketCount = tickets.length;
  const sortedTickets = useMemo(() => tickets, [tickets]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Create a ticket for product, order, payment, or delivery issues.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Submit your issue and our admin team will reply here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ticket-title">Title</Label>
                <Input
                  id="ticket-title"
                  placeholder="Describe your issue"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-topic">Topic</Label>
                <select
                  id="ticket-topic"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={form.topic}
                  onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                >
                  {TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-description">Description</Label>
                <Textarea
                  id="ticket-description"
                  placeholder="Explain the issue in detail"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-attachment">Attachment</Label>
                <input
                  id="ticket-attachment"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      attachment: e.target.files?.[0] ?? null,
                    }))
                  }
                  className="file:border-0 file:bg-transparent file:text-sm file:font-medium"
                />
                <p className="text-xs text-muted-foreground">
                  Optional image or screenshot.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setForm((prev) => ({ ...prev }))}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={createTicket}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Create Ticket"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-lg">
                My tickets
                <Badge>{ticketCount}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="space-y-3 p-4">
                  {sortedTickets.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      No Support Ticket Found
                    </div>
                  ) : (
                    sortedTickets.map((ticket) => (
                      <div key={ticket.id} className="rounded-3xl border border-border p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {ticket.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{ticket.topic}</p>
                          </div>
                          <Badge className={statusLabel(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                          {ticket.description}
                        </p>
                        {ticket.admin_reply && (
                          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Admin reply
                            </p>
                            <p className="mt-2">{ticket.admin_reply}</p>
                          </div>
                        )}
                        {ticket.attachment_url && (
                          <a
                            href={ticket.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
                          >
                            <Paperclip className="h-4 w-4" /> View attachment
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-primary">
              <MessageSquare className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">Need help fast?</p>
                <p className="text-sm text-muted-foreground">
                  Use the form to create a ticket and we’ll respond quickly.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Ticket categories</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {TOPICS.map((topic) => (
                  <li key={topic}>• {topic}</li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
