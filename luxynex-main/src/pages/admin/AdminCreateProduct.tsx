import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  X,
  Plus,
  Trash2,
  ArrowLeft,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"admin_categories">;

interface Attribute {
  name: string;
  values: string[];
}
interface Variant {
  combo: string;
  regular_price: number | "";
  sale_price: number | "";
  sku: string;
}

const ORDER_TYPES = ["Both", "POS Only", "Website Only", "Pre-Order"];
const OFFER_TAG_OPTIONS = [
  "New Arrival",
  "Hot Deal",
  "Best Seller",
  "Limited Stock",
  "Featured",
  "Flash Sale",
];

export default function AdminCreateProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingSlider, setUploadingSlider] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const sliderInputRef = useRef<HTMLInputElement>(null);

  // Product Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // General Setup
  const [parentCatId, setParentCatId] = useState<string>("");
  const [subCatId, setSubCatId] = useState<string>("");
  const [offerTags, setOfferTags] = useState<string[]>([]);
  const [orderType, setOrderType] = useState<string>("Both");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchTagInput, setSearchTagInput] = useState("");
  const [minQty, setMinQty] = useState<number>(1);
  const [maxQty, setMaxQty] = useState<number | "">("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);

  // Sale Channels
  const [posAvailable, setPosAvailable] = useState(true);
  const [websiteAvailable, setWebsiteAvailable] = useState(true);

  // Warranty / Return
  const [warranty, setWarranty] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");

  // Images
  const [thumbnail, setThumbnail] = useState<string>("");
  const [sliderImages, setSliderImages] = useState<string[]>([]);

  // Attributes & Variants
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [defaultRegular, setDefaultRegular] = useState<number | "">("");
  const [defaultSale, setDefaultSale] = useState<number | "">("");
  const [rootSku, setRootSku] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Load categories
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      setCategories(data || []);
    })();
  }, []);

  // Load existing product if editing
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("admin_products")
        .select("*")
        .eq("id", id)
        .single();
      if (!data) return;
      setName(data.name);
      setDescription(data.description || "");
      setOfferTags(data.offer_tags || []);
      setOrderType(data.order_type || "Both");
      setSearchTags(data.search_tags || []);
      setMinQty(data.min_order_qty || 1);
      setMaxQty(data.max_order_qty || "");
      setDeliveryTime(data.delivery_time || "");
      setIsFreeDelivery(data.is_free_delivery || false);
      setPosAvailable(data.pos_available ?? true);
      setWebsiteAvailable(data.website_available ?? true);
      setWarranty(data.warranty || "");
      setReturnPolicy(data.return_policy || "");
      setThumbnail(data.thumbnail || "");
      setSliderImages(data.images || []);
      setAttributes((data.attributes as unknown as Attribute[]) || []);
      setVariants((data.variants as unknown as Variant[]) || []);
      setDefaultRegular(data.regular_price ? Number(data.regular_price) : "");
      setDefaultSale(data.sale_price ? Number(data.sale_price) : "");
      setRootSku(data.root_sku || "");
      setStock(data.stock || 0);
      setIsActive(data.is_active ?? true);
      if (data.subcategory_id) {
        const sub = (
          await supabase
            .from("admin_categories")
            .select("*")
            .eq("id", data.subcategory_id)
            .maybeSingle()
        ).data;
        if (sub) {
          setSubCatId(sub.id);
          setParentCatId(sub.parent_id || sub.id);
        }
      } else {
        const m = (
          await supabase
            .from("admin_categories")
            .select("*")
            .eq("name", data.category)
            .maybeSingle()
        ).data;
        if (m) setParentCatId(m.id);
      }
    })();
  }, [id]);

  const parentCategories = categories.filter((c) => !c.parent_id);
  const subCategories = parentCatId
    ? categories.filter((c) => c.parent_id === parentCatId)
    : [];

  // Generate variant combos from attributes
  const generatedCombos = useMemo(() => {
    const active = attributes.filter((a) => a.name.trim() && a.values.length);
    if (!active.length) return [];
    let combos: string[][] = [[]];
    active.forEach((a) => {
      combos = combos.flatMap((c) => a.values.map((v) => [...c, v]));
    });
    return combos.map((c) => c.join(" - "));
  }, [attributes]);

  // Sync variants when combos change
  useEffect(() => {
    setVariants((prev) => {
      const map = new Map(prev.map((v) => [v.combo, v]));
      return generatedCombos.map(
        (combo) =>
          map.get(combo) || {
            combo,
            regular_price: "",
            sale_price: "",
            sku: "",
          },
      );
    });
  }, [generatedCombos.join("|")]);

  // === Attribute helpers ===
  const addAttribute = () =>
    setAttributes([...attributes, { name: "", values: [] }]);
  const updateAttribute = (i: number, patch: Partial<Attribute>) => {
    setAttributes(
      attributes.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    );
  };
  const removeAttribute = (i: number) =>
    setAttributes(attributes.filter((_, idx) => idx !== i));
  const addAttributeValue = (i: number, v: string) => {
    const val = v.trim();
    if (!val) return;
    const a = attributes[i];
    if (a.values.includes(val)) return;
    updateAttribute(i, { values: [...a.values, val] });
  };
  const removeAttributeValue = (i: number, vi: number) => {
    const a = attributes[i];
    updateAttribute(i, { values: a.values.filter((_, j) => j !== vi) });
  };

  // === Search tags ===
  const addSearchTag = () => {
    const v = searchTagInput.trim();
    if (!v || searchTags.includes(v)) return;
    setSearchTags([...searchTags, v]);
    setSearchTagInput("");
  };

  // === Offer tags ===
  const toggleOfferTag = (t: string) => {
    setOfferTags(
      offerTags.includes(t)
        ? offerTags.filter((x) => x !== t)
        : [...offerTags, t],
    );
  };

  // === Image uploads ===
  const uploadFile = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      return null;
    }
    return supabase.storage.from("product-images").getPublicUrl(path).data
      .publicUrl;
  };

  const handleThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(f.type)) {
      toast.error("Invalid file type. Please upload PNG, JPG, JPEG, SVG, or WEBP");
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
      return;
    }

    // Validate file size (max 5MB)
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB");
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
      return;
    }

    setUploadingThumb(true);
    const url = await uploadFile(f);
    if (url) {
      setThumbnail(url);
      toast.success("Thumbnail uploaded successfully");
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    } else {
      toast.error("Failed to upload thumbnail");
    }
    setUploadingThumb(false);
  };

  const handleRemoveThumbnail = async () => {
    try {
      if (isEdit && id && thumbnail) {
        // If editing and thumbnail exists, update database to remove it
        const { error } = await supabase
          .from("admin_products")
          .update({ thumbnail: null })
          .eq("id", id);
        if (error) {
          toast.error("Failed to remove thumbnail: " + error.message);
          return;
        }
      }
      setThumbnail("");
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
      toast.success("Thumbnail removed");
    } catch (error) {
      console.error("Error removing thumbnail:", error);
      toast.error("Error removing thumbnail");
    }
  };

  const handleSlider = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadingSlider(true);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      const url = await uploadFile(f);
      if (url) added.push(url);
    }
    setSliderImages([...sliderImages, ...added]);
    setUploadingSlider(false);
  };

  // === Rich text helpers (lightweight WYSIWYG via contentEditable) ===
  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    const el = document.getElementById("rich-editor");
    if (el) setDescription(el.innerHTML);
  };

  // === Apply to all variants ===
  const applyToAll = () => {
    setVariants(
      variants.map((v) => ({
        ...v,
        regular_price: defaultRegular === "" ? v.regular_price : defaultRegular,
        sale_price: defaultSale === "" ? v.sale_price : defaultSale,
        sku: rootSku ? `${rootSku}-${v.combo.replace(/\s*-\s*/g, "-")}` : v.sku,
      })),
    );
    toast.success("Applied to all variants");
  };

  // === Save ===
  const save = async () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!parentCatId) {
      toast.error("Please select a category");
      return;
    }
    const parentCat = categories.find((c) => c.id === parentCatId);
    const subCat = subCatId ? categories.find((c) => c.id === subCatId) : null;
    const finalPrice =
      defaultSale !== ""
        ? Number(defaultSale)
        : defaultRegular !== ""
          ? Number(defaultRegular)
          : 0;

    const payload = {
      name: name.trim(),
      description: description || null,
      category: parentCat?.name || "Gadgets",
      subcategory_id: subCat?.id || null,
      price: finalPrice,
      original_price: defaultRegular !== "" ? Number(defaultRegular) : null,
      regular_price: defaultRegular !== "" ? Number(defaultRegular) : null,
      sale_price: defaultSale !== "" ? Number(defaultSale) : null,
      root_sku: rootSku || null,
      sku: rootSku || null,
      stock,
      thumbnail: thumbnail || null,
      images: sliderImages,
      offer_tags: offerTags,
      order_type: orderType,
      search_tags: searchTags,
      min_order_qty: minQty,
      max_order_qty: maxQty === "" ? null : Number(maxQty),
      delivery_time: deliveryTime || null,
      is_free_delivery: isFreeDelivery,
      pos_available: posAvailable,
      website_available: websiteAvailable,
      warranty: warranty || null,
      return_policy: returnPolicy || null,
      attributes:
        attributes as unknown as Tables<"admin_products">["attributes"],
      variants: variants as unknown as Tables<"admin_products">["variants"],
      sizes: attributes.find((a) => /size/i.test(a.name))?.values || [],
      colors:
        attributes.find((a) => /color|colour/i.test(a.name))?.values || [],
      is_active: isActive,
    };

    setSaving(true);
    if (isEdit && id) {
      const { error } = await supabase
        .from("admin_products")
        .update(payload)
        .eq("id", id);
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("admin_products").insert(payload);
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Product created");
    }
    navigate("/admin/products");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/products")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit Product" : "Create Product"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-sm">Active</Label>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Product"
                  : "Save Product"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info & Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Product Info & Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="border rounded-lg bg-background">
                    <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => exec("bold")}
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => exec("italic")}
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => exec("insertUnorderedList")}
                      >
                        <List className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          const u = prompt("URL");
                          if (u) exec("createLink", u);
                        }}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </Button>
                      <select
                        className="text-xs border rounded px-1 py-0.5 ml-1"
                        onChange={(e) => exec("formatBlock", e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Paragraph</option>
                        <option value="H1">Heading 1</option>
                        <option value="H2">Heading 2</option>
                        <option value="H3">Heading 3</option>
                      </select>
                    </div>
                    <div
                      id="rich-editor"
                      className="min-h-[160px] p-3 text-sm outline-none prose prose-sm max-w-none"
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: description }}
                      onBlur={(e) =>
                        setDescription((e.target as HTMLDivElement).innerHTML)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">General Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={parentCatId}
                      onValueChange={(v) => {
                        setParentCatId(v);
                        setSubCatId("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sub Category</Label>
                    <Select
                      value={subCatId || "none"}
                      onValueChange={(v) => setSubCatId(v === "none" ? "" : v)}
                      disabled={!subCategories.length}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            subCategories.length
                              ? "Optional"
                              : "No subcategories"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {subCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Offer Tags</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {OFFER_TAG_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleOfferTag(t)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                            offerTags.includes(t)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-muted"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Search Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={searchTagInput}
                        onChange={(e) => setSearchTagInput(e.target.value)}
                        placeholder="Type tag and press Enter"
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addSearchTag())
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSearchTag}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchTags.map((t, i) => (
                        <Badge
                          key={i}
                          className="cursor-pointer bg-white text-foreground border border-gray-200 hover:bg-gray-50 max-w-[150px] truncate px-2 py-1 text-xs"
                          onClick={() =>
                            setSearchTags(searchTags.filter((_, j) => j !== i))
                          }
                        >
                          {t} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Order Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      value={minQty}
                      onChange={(e) => setMinQty(Number(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Order Qty</Label>
                    <Input
                      type="number"
                      min={0}
                      value={maxQty}
                      onChange={(e) =>
                        setMaxQty(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      placeholder="No limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Time</Label>
                    <Input
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      placeholder="e.g. 2-3 days"
                    />
                  </div>
                  <div className="flex items-center justify-between md:col-span-2 border rounded-lg px-3 py-2.5">
                    <Label className="text-sm">Is Free Delivery?</Label>
                    <Switch
                      checked={isFreeDelivery}
                      onCheckedChange={setIsFreeDelivery}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warranty & Return */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Warranty & Return Policy{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Warranty</Label>
                  <Textarea
                    rows={3}
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="e.g. 1-year manufacturer warranty"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Policy</Label>
                  <Textarea
                    rows={3}
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    placeholder="e.g. 7-day easy return"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Attributes & Variants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  Product Attributes & Variants
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addAttribute}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Attribute
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {attributes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">
                    No attributes added. Click "Add Attribute" to create
                    variants like Size or Color.
                  </p>
                )}
                {attributes.map((a, i) => (
                  <AttributeRow
                    key={i}
                    attribute={a}
                    onChangeName={(n) => updateAttribute(i, { name: n })}
                    onAddValue={(v) => addAttributeValue(i, v)}
                    onRemoveValue={(vi) => removeAttributeValue(i, vi)}
                    onRemove={() => removeAttribute(i)}
                  />
                ))}

                {/* Variant Matrix */}
                {variants.length > 0 && (
                  <div className="space-y-3 pt-2 border-t">
                    <h3 className="text-sm font-semibold">Variant Matrix</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Default Regular Price (BDT)
                        </Label>
                        <Input
                          type="number"
                          value={defaultRegular}
                          onChange={(e) =>
                            setDefaultRegular(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Default Sale Price (BDT)
                        </Label>
                        <Input
                          type="number"
                          value={defaultSale}
                          onChange={(e) =>
                            setDefaultSale(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Root Level SKU</Label>
                        <Input
                          value={rootSku}
                          onChange={(e) => setRootSku(e.target.value)}
                          placeholder="e.g. LXV-001"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          className="w-full"
                          onClick={applyToAll}
                        >
                          Apply to All
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variant</TableHead>
                            <TableHead>Regular Price</TableHead>
                            <TableHead>Sale Price</TableHead>
                            <TableHead>SKU</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variants.map((v, i) => (
                            <TableRow key={v.combo}>
                              <TableCell className="font-medium">
                                {v.combo}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={v.regular_price}
                                  onChange={(e) =>
                                    setVariants(
                                      variants.map((x, j) =>
                                        j === i
                                          ? {
                                              ...x,
                                              regular_price:
                                                e.target.value === ""
                                                  ? ""
                                                  : Number(e.target.value),
                                            }
                                          : x,
                                      ),
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={v.sale_price}
                                  onChange={(e) =>
                                    setVariants(
                                      variants.map((x, j) =>
                                        j === i
                                          ? {
                                              ...x,
                                              sale_price:
                                                e.target.value === ""
                                                  ? ""
                                                  : Number(e.target.value),
                                            }
                                          : x,
                                      ),
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={v.sku}
                                  onChange={(e) =>
                                    setVariants(
                                      variants.map((x, j) =>
                                        j === i
                                          ? { ...x, sku: e.target.value }
                                          : x,
                                      ),
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Sale Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sale Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between border rounded-lg px-3 py-2.5">
                  <Label className="text-sm">POS</Label>
                  <Switch
                    checked={posAvailable}
                    onCheckedChange={setPosAvailable}
                  />
                </div>
                <div className="flex items-center justify-between border rounded-lg px-3 py-2.5">
                  <Label className="text-sm">Website</Label>
                  <Switch
                    checked={websiteAvailable}
                    onCheckedChange={setWebsiteAvailable}
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-sm">Stock Quantity</Label>
                  <Input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                {thumbnail ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={thumbnail}
                      alt="thumb"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      disabled={uploadingThumb}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center hover:bg-destructive/90 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors disabled:opacity-50">
                    <Upload className="w-7 h-7 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {uploadingThumb ? "Uploading..." : "Click to upload or drag & drop"}
                    </span>
                    <span className="text-xs text-muted-foreground/70 mt-1">
                      PNG, JPG, JPEG, SVG, WEBP (Max 5MB)
                    </span>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleThumbnail}
                      disabled={uploadingThumb}
                    />
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Slider Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Slider Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-1.5" />
                  <span className="text-sm text-muted-foreground">
                    {uploadingSlider ? "Uploading..." : "Drop images here"}
                  </span>
                  <span className="text-xs text-muted-foreground/70 mt-0.5">
                    png, jpg, jpeg, svg, webp
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.svg,.webp"
                    onChange={handleSlider}
                    disabled={uploadingSlider}
                  />
                </label>
                {sliderImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {sliderImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSliderImages(
                              sliderImages.filter((_, j) => j !== i),
                            )
                          }
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AttributeRow({
  attribute,
  onChangeName,
  onAddValue,
  onRemoveValue,
  onRemove,
}: {
  attribute: Attribute;
  onChangeName: (n: string) => void;
  onAddValue: (v: string) => void;
  onRemoveValue: (i: number) => void;
  onRemove: () => void;
}) {
  const [input, setInput] = useState("");
  const submit = () => {
    if (input.trim()) {
      onAddValue(input);
      setInput("");
    }
  };
  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
      <div className="flex items-center gap-2">
        <Input
          value={attribute.name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Attribute name (e.g. Size, Color)"
          className="flex-1"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Tags / Values</Label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add value (e.g. 35, Black)"
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), submit())
            }
          />
          <Button type="button" variant="outline" onClick={submit}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {attribute.values.map((v, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onRemoveValue(i)}
            >
              {v} ×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
