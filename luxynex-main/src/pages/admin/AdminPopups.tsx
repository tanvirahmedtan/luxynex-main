import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Popup = Tables<"admin_popups">;
const empty = {
  title: "",
  description: "",
  image_url: "",
  button_text: "Shop Now",
  button_link: "/shop",
  is_active: true,
};

export default function AdminPopups() {
  const [items, setItems] = useState<Popup[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Popup | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);

  const fetchAll = async () => {
    const { data } = await supabase
      .from("admin_popups")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (p: Popup) => {
    setEditing(p);
    setForm({
      title: p.title || "",
      description: p.description || "",
      image_url: p.image_url || "",
      button_text: p.button_text || "",
      button_link: p.button_link || "",
      is_active: p.is_active,
    });
    setOpen(true);
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `popup-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("banners").upload(path, file);
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("banners").getPublicUrl(path);
    setForm({ ...form, image_url: data.publicUrl });
    setUploading(false);
    toast.success("Image uploaded");
  };

  const save = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    if (editing) {
      const { error } = await supabase
        .from("admin_popups")
        .update(form)
        .eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Popup updated");
    } else {
      const { error } = await supabase.from("admin_popups").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Popup created");
    }
    setOpen(false);
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this popup?")) return;
    await supabase.from("admin_popups").delete().eq("id", id);
    toast.success("Popup deleted");
    fetchAll();
  };

  const toggle = async (p: Popup) => {
    await supabase
      .from("admin_popups")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    fetchAll();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Promotional Popups
          </h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-1" /> Add Popup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Popup" : "Add Popup"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    className="w-full border rounded-lg p-2 text-sm min-h-[80px] bg-background"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={form.button_text}
                      onChange={(e) =>
                        setForm({ ...form, button_text: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Link</Label>
                    <Input
                      value={form.button_link}
                      onChange={(e) =>
                        setForm({ ...form, button_link: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Image (optional)</Label>
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted text-sm w-fit">
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={upload}
                      disabled={uploading}
                    />
                  </label>
                  {form.image_url && (
                    <img
                      src={form.image_url}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <Label>Active (visible to visitors)</Label>
                </div>
                <Button className="w-full" onClick={save}>
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No popups yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell>
                          <button onClick={() => toggle(p)}>
                            <Badge
                              variant={p.is_active ? "default" : "secondary"}
                            >
                              {p.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(p)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => remove(p.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
