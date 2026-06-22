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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Upload,
  X,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"admin_categories"> & { description?: string | null };
const empty = {
  name: "",
  slug: "",
  description: "",
  image_url: "" as string,
  parent_id: null as string | null,
  sort_order: 0,
  is_active: true,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchAll = async () => {
    const { data } = await supabase
      .from("admin_categories")
      .select("*")
      .order("sort_order");
    setCats(data || []);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  const parents = cats.filter((c) => !c.parent_id);
  const children = (parentId: string) =>
    cats.filter((c) => c.parent_id === parentId);

  const openCreate = (parent_id: string | null = null) => {
    setEditing(null);
    setForm({ ...empty, parent_id });
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: (c as any).description ?? "",
      image_url: c.image_url ?? "",
      parent_id: c.parent_id,
      sort_order: c.sort_order,
      is_active: c.is_active,
    });
    setOpen(true);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max size 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("banners")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("banners").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: publicUrl }));
      toast.success("Logo uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      image_url: form.image_url || null,
    };
    if (editing) {
      const { error } = await supabase
        .from("admin_categories")
        .update(payload)
        .eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Category updated");
    } else {
      const { error } = await supabase.from("admin_categories").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Category created");
    }
    setOpen(false);
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category and all its subcategories?")) return;
    await supabase.from("admin_categories").delete().eq("id", id);
    toast.success("Deleted");
    fetchAll();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openCreate(null)}>
                <Plus className="w-4 h-4 mr-1" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Category" : "Add Category"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <Label>Category Logo</Label>
                  {form.image_url ? (
                    <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/30">
                      <img
                        src={form.image_url}
                        alt="logo"
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                      />
                      <div className="flex-1 text-xs text-muted-foreground truncate">
                        Logo selected
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files && handleFile(e.target.files[0])
                          }
                        />
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-background">
                          Replace
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, image_url: "" }))
                        }
                        className="text-destructive hover:bg-destructive/10 rounded-md p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleFile(f);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files && handleFile(e.target.files[0])
                        }
                      />
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <p className="text-sm font-medium text-foreground">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, SVG up to 5MB
                      </p>
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: form.slug || slugify(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: slugify(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    placeholder="Short description (optional)"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parent Category</Label>
                  <Select
                    value={form.parent_id || "none"}
                    onValueChange={(v) =>
                      setForm({ ...form, parent_id: v === "none" ? null : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None (top-level) —</SelectItem>
                      {cats
                        .filter((c) => !editing || c.id !== editing.id)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.parent_id ? "— " : ""}
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm({ ...form, sort_order: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>
                <Button className="w-full" onClick={save} disabled={uploading}>
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-4 space-y-2">
            {parents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No categories yet — add your first one
              </p>
            ) : (
              parents.map((p) => (
                <div key={p.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-semibold flex-1">{p.name}</span>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openCreate(p.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Sub
                    </Button>
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
                  {children(p.id).length > 0 && (
                    <div className="mt-2 ml-6 space-y-1">
                      {children(p.id).map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-2 text-sm py-1"
                        >
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          {c.image_url && (
                            <img
                              src={c.image_url}
                              alt={c.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="flex-1">{c.name}</span>
                          <Badge
                            variant={c.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {c.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => remove(c.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
