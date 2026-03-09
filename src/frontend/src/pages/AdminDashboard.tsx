import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useDeleteProduct,
  useGetAllProducts,
  useIsAdmin,
  useStripeSessionStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

type ProductFormData = {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  imageFile: File | null;
};

const EMPTY_FORM: ProductFormData = {
  name: "",
  brand: "",
  category: "",
  description: "",
  price: "",
  imageFile: null,
};

const CATEGORIES = ["Suits", "Shirts", "Accessories", "Shoes", "Outerwear"];
const BRANDS = ["Ralph Lauren", "Jos. A. Bank", "Nike", "Adidas", "Other"];

const HOW_IT_WORKS = [
  "Customers initiate checkout via the shop — a Stripe session is created.",
  "Upon successful payment, Stripe redirects to the success URL with ?session_id=...",
  "The session ID is stored locally in the customer browser session.",
  "Paste a session ID below to retrieve its current status from Stripe.",
];

function ProductFormDialog({
  open,
  onClose,
  editProduct,
}: {
  open: boolean;
  onClose: () => void;
  editProduct: Product | null;
}) {
  const [form, setForm] = useState<ProductFormData>(() =>
    editProduct
      ? {
          name: editProduct.name,
          brand: editProduct.brand,
          category: editProduct.category,
          description: editProduct.description,
          price: (Number(editProduct.price) / 100).toString(),
          imageFile: null,
        }
      : { ...EMPTY_FORM },
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const isPending = addProduct.isPending || updateProduct.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, imageFile: file }));
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number.parseFloat(form.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) return;

    if (editProduct) {
      await updateProduct.mutateAsync({
        id: editProduct.id,
        name: form.name,
        brand: form.brand,
        category: form.category,
        description: form.description,
        price: priceNum,
        imageFile: form.imageFile,
      });
    } else {
      await addProduct.mutateAsync({
        name: form.name,
        brand: form.brand,
        category: form.category,
        description: form.description,
        price: priceNum,
        imageFile: form.imageFile,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="admin.product.dialog"
        className="bg-card border-border max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            {editProduct ? "Edit Product" : "New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Product Name
              </Label>
              <Input
                data-ocid="admin.product.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
                className="bg-background border-border"
                placeholder="Classic Polo Shirt"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Brand
              </Label>
              <Select
                value={form.brand}
                onValueChange={(v) => setForm((p) => ({ ...p, brand: v }))}
              >
                <SelectTrigger
                  data-ocid="admin.product.brand.select"
                  className="bg-background border-border"
                >
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger
                  data-ocid="admin.product.category.select"
                  className="bg-background border-border"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                Price (USD)
              </Label>
              <Input
                data-ocid="admin.product.price.input"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
                required
                className="bg-background border-border"
                placeholder="99.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
              Description
            </Label>
            <Textarea
              data-ocid="admin.product.description.textarea"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="bg-background border-border resize-none"
              rows={3}
              placeholder="Product description..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
              Product Image
            </Label>
            <button
              type="button"
              data-ocid="admin.product.dropzone"
              onClick={triggerFileInput}
              className="w-full border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer p-6 flex flex-col items-center gap-2 bg-background/50"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-24 w-24 object-cover"
                />
              ) : editProduct?.image ? (
                <img
                  src={editProduct.image.getDirectURL()}
                  alt="Current"
                  className="h-24 w-24 object-cover opacity-60"
                />
              ) : (
                <Upload className="text-muted-foreground" size={32} />
              )}
              <p className="font-sans text-muted-foreground text-xs text-center">
                {form.imageFile ? form.imageFile.name : "Click to upload image"}
              </p>
            </button>
            <input
              ref={fileInputRef}
              data-ocid="admin.product.upload_button"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.product.cancel_button"
              onClick={onClose}
              className="border-border font-sans text-xs tracking-widest uppercase"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="admin.product.save_button"
              disabled={
                isPending || !form.name || !form.brand || !form.category
              }
              className="bg-primary text-primary-foreground hover:bg-gold-light font-sans text-xs tracking-widest uppercase"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : editProduct ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProductsTab() {
  const { data: products, isLoading, isError } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditProduct(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-foreground">Products</h2>
          <p className="font-sans text-muted-foreground text-sm mt-0.5">
            {products?.length ?? 0} items in catalogue
          </p>
        </div>
        <Button
          data-ocid="admin.products.open_modal_button"
          onClick={handleNew}
          className="bg-primary text-primary-foreground hover:bg-gold-light font-sans text-xs tracking-widest uppercase gap-2"
        >
          <Plus size={16} />
          New Product
        </Button>
      </div>

      {isLoading ? (
        <div data-ocid="admin.products.loading_state" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <div
          data-ocid="admin.products.error_state"
          className="border border-destructive/30 bg-destructive/10 px-4 py-6 text-center"
        >
          <p className="font-sans text-destructive-foreground text-sm">
            Failed to load products. Please try again.
          </p>
        </div>
      ) : !products || products.length === 0 ? (
        <div
          data-ocid="admin.products.empty_state"
          className="border border-dashed border-border px-4 py-12 text-center"
        >
          <Package className="text-muted-foreground mx-auto mb-3" size={32} />
          <p className="font-sans text-muted-foreground text-sm">
            No products yet. Add your first product.
          </p>
        </div>
      ) : (
        <div
          data-ocid="admin.products.table"
          className="border border-border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Product
                </TableHead>
                <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Brand
                </TableHead>
                <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Price
                </TableHead>
                <TableHead className="font-sans text-xs tracking-widest uppercase text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, i) => (
                <TableRow
                  key={product.id.toString()}
                  data-ocid={`admin.products.row.${i + 1}`}
                  className="border-border hover:bg-muted/30"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image.getDirectURL()}
                          alt={product.name}
                          className="w-10 h-10 object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted border border-border flex items-center justify-center">
                          <Package
                            size={16}
                            className="text-muted-foreground"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-sans text-sm text-foreground font-medium">
                          {product.name}
                        </p>
                        <p className="font-sans text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-navy-light text-primary border-primary/20 font-sans text-xs">
                      {product.brand}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-sans text-sm text-muted-foreground">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-display text-primary font-bold">
                      ${(Number(product.price) / 100).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`admin.products.edit_button.${i + 1}`}
                        onClick={() => handleEdit(product)}
                        className="border-border h-8 w-8 p-0 hover:border-primary/50"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`admin.products.delete_button.${i + 1}`}
                        onClick={() => setDeleteTarget(product)}
                        className="border-border h-8 w-8 p-0 hover:border-destructive/50 hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onClose={handleClose}
        editProduct={editProduct}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="admin.delete.dialog"
          className="bg-card border-border"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl text-foreground">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.delete.cancel_button"
              className="border-border font-sans text-xs tracking-widest uppercase"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete.confirm_button"
              onClick={() => {
                if (deleteTarget) {
                  deleteProduct.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans text-xs tracking-widest uppercase"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PaymentsTab() {
  const [sessionId, setSessionId] = useState("");
  const [lookupId, setLookupId] = useState<string | null>(null);
  const {
    data: sessionStatus,
    isLoading,
    isError,
  } = useStripeSessionStatus(lookupId);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupId(sessionId.trim() || null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-foreground">
          Payment Sessions
        </h2>
        <p className="font-sans text-muted-foreground text-sm mt-0.5">
          Look up Stripe checkout session status by session ID.
        </p>
      </div>

      <div className="border border-border bg-muted/20 p-6 space-y-3">
        <h3 className="font-sans text-xs tracking-widest uppercase text-primary">
          How Stripe Payments Work
        </h3>
        <ul className="space-y-2">
          {HOW_IT_WORKS.map((step) => (
            <li key={step} className="flex items-start gap-3">
              <span className="font-display text-primary text-sm mt-0.5">
                {HOW_IT_WORKS.indexOf(step) + 1}.
              </span>
              <span className="font-sans text-muted-foreground text-sm">
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleLookup} className="space-y-3">
        <Label className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
          Session ID
        </Label>
        <div className="flex gap-3">
          <Input
            data-ocid="admin.payments.search_input"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="cs_live_..."
            className="bg-background border-border font-mono text-sm"
          />
          <Button
            type="submit"
            data-ocid="admin.payments.primary_button"
            disabled={!sessionId.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-gold-light font-sans text-xs tracking-widest uppercase gap-2 whitespace-nowrap"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Look Up
          </Button>
        </div>
      </form>

      {isLoading && (
        <div data-ocid="admin.payments.loading_state" className="space-y-2">
          <Skeleton className="h-24 w-full bg-muted" />
        </div>
      )}

      {isError && (
        <div
          data-ocid="admin.payments.error_state"
          className="border border-destructive/30 bg-destructive/10 px-4 py-4"
        >
          <p className="font-sans text-destructive-foreground text-sm">
            Failed to retrieve session. Check the ID and try again.
          </p>
        </div>
      )}

      {sessionStatus && !isLoading && (
        <div
          data-ocid="admin.payments.success_state"
          className="border border-border overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <span className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
              Session
            </span>
            <code className="font-mono text-xs text-primary">{lookupId}</code>
            <Badge
              className={
                sessionStatus.__kind__ === "completed"
                  ? "bg-green-900/40 text-green-400 border-green-700/40"
                  : "bg-destructive/20 text-destructive-foreground border-destructive/30"
              }
            >
              {sessionStatus.__kind__ === "completed" ? "Completed" : "Failed"}
            </Badge>
          </div>
          <div className="p-4">
            {sessionStatus.__kind__ === "completed" ? (
              <div className="space-y-2">
                {sessionStatus.completed.userPrincipal && (
                  <div className="flex items-start gap-3">
                    <span className="font-sans text-xs tracking-widest uppercase text-muted-foreground w-28 shrink-0">
                      Principal
                    </span>
                    <code className="font-mono text-xs text-foreground break-all">
                      {sessionStatus.completed.userPrincipal}
                    </code>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="font-sans text-xs tracking-widest uppercase text-muted-foreground w-28 shrink-0">
                    Response
                  </span>
                  <pre className="font-mono text-xs text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        return JSON.stringify(
                          JSON.parse(sessionStatus.completed.response),
                          null,
                          2,
                        );
                      } catch {
                        return sessionStatus.completed.response;
                      }
                    })()}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="font-sans text-xs tracking-widest uppercase text-muted-foreground w-28 shrink-0">
                  Error
                </span>
                <span className="font-sans text-sm text-destructive-foreground">
                  {sessionStatus.failed.error}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const [activeTab, setActiveTab] = useState("products");

  if (!isInitializing && !identity) {
    window.location.href = "/admin/login";
    return null;
  }

  if (!checkingAdmin && isAdmin === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-sans text-destructive-foreground">
            Access denied. Admin privileges required.
          </p>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
            variant="outline"
          >
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  if (isInitializing || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          data-ocid="admin.loading_state"
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-sans text-muted-foreground text-sm tracking-widest uppercase">
            Loading Dashboard
          </p>
        </div>
      </div>
    );
  }

  const principal = identity?.getPrincipal().toString();

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 bg-navy-deep border-r border-border flex flex-col shrink-0">
          <div className="p-6 border-b border-border">
            <Link to="/" data-ocid="admin.home.link">
              <img
                src="/assets/generated/ismael-express-logo-transparent.dim_400x120.png"
                alt="Ismael Express"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center gap-2 mt-3">
              <ShieldCheck size={14} className="text-primary" />
              <Badge className="bg-primary/10 text-primary border-primary/20 font-sans text-xs">
                Admin
              </Badge>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <button
              type="button"
              data-ocid="admin.products.tab"
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-sans text-sm transition-colors ${
                activeTab === "products"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <Package size={16} />
              Products
            </button>
            <button
              type="button"
              data-ocid="admin.payments.tab"
              onClick={() => setActiveTab("payments")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-sans text-sm transition-colors ${
                activeTab === "payments"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <CreditCard size={16} />
              Payments
            </button>
          </nav>

          <div className="p-4 border-t border-border">
            <div className="mb-3">
              <p className="font-sans text-xs text-muted-foreground tracking-widest uppercase mb-1">
                Principal
              </p>
              <p
                className="font-mono text-xs text-foreground/60 truncate"
                title={principal}
              >
                {principal ? `${principal.slice(0, 10)}...` : "—"}
              </p>
            </div>
            <Button
              data-ocid="admin.logout.button"
              onClick={clear}
              variant="outline"
              size="sm"
              className="w-full border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 font-sans text-xs tracking-widest uppercase gap-2"
            >
              <LogOut size={14} />
              Sign Out
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div
            className="sticky top-0 z-10 px-8 py-4 border-b border-border flex items-center justify-between"
            style={{
              background: "oklch(0.12 0.02 250 / 0.95)",
              backdropFilter: "blur(8px)",
            }}
          >
            <h1 className="font-display text-2xl text-foreground">
              {activeTab === "products"
                ? "Product Management"
                : "Payment Sessions"}
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="font-sans text-xs text-muted-foreground">
                Live
              </span>
            </div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-8"
          >
            {activeTab === "products" ? <ProductsTab /> : <PaymentsTab />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
