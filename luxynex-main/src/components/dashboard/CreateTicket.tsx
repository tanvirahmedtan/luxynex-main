import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UploadCloud } from "lucide-react";

const topics = [
  "Shipping",
  "Order issue",
  "Payment",
  "Product quality",
  "Other",
];

interface CreateTicketProps {
  userId: string;
}

export default function CreateTicket({ userId }: CreateTicketProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide a title and description.");
      return;
    }

    if (typeof window === "undefined") return;

    const storageKey = `luxynex_support_tickets_${userId}`;
    const existing = window.localStorage.getItem(storageKey);
    let tickets = [] as Array<{
      id: string;
      title: string;
      topic: string;
      status: "Pending" | "Solved" | "Open" | "Closed";
      createdAt: string;
      attachmentName?: string;
    }>;

    if (existing) {
      try {
        tickets = JSON.parse(existing);
      } catch {
        tickets = [];
      }
    }

    const newTicket = {
      id: `TKT-${Date.now()}`,
      title: title.trim(),
      topic,
      status: "Pending" as const,
      createdAt: new Date().toISOString(),
      attachmentName: attachment?.name,
    };

    tickets.unshift(newTicket);
    window.localStorage.setItem(storageKey, JSON.stringify(tickets));
    toast.success("Ticket created successfully.");
    navigate("/profile?section=support-tickets");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl bg-slate-950 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-semibold text-white">Create ticket</p>
          <p className="mt-1 text-sm text-slate-400">
            Let us know what went wrong and our support team will follow up.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/profile?section=support-tickets")}
          className="rounded-2xl border-slate-700 text-slate-200 hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to tickets
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Ticket title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ticket title here"
              />
            </div>
            <div className="space-y-2">
              <Label>Select topic</Label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {topics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ticket description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issues.."
              className="min-h-[180px]"
            />
          </div>

          <div>
            <Label>Upload attachment</Label>
            <label className="mt-2 flex min-h-[120px] cursor-pointer items-center justify-center rounded-3xl border border-dashed border-border bg-slate-950 px-4 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-900">
              <input
                type="file"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
              <div className="flex items-center gap-3">
                <UploadCloud className="h-5 w-5 text-slate-300" />
                <div className="space-y-1 text-left">
                  <p className="font-medium text-slate-100">Upload photo</p>
                  <p className="text-xs text-slate-500">
                    JPG, PNG or PDF. Max file size 10MB.
                  </p>
                </div>
              </div>
            </label>
            {attachment && (
              <p className="mt-2 text-sm text-slate-300">
                Selected file: {attachment.name}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <Button
              variant="default"
              onClick={handleSubmit}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-800"
            >
              + CREATE TICKET
            </Button>
            <div className="text-sm text-slate-500">
              Once submitted, our support team will respond within 24 hours.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
