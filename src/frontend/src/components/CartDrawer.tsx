import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { ArrowLeft, CheckCircle, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

type DrawerView = "cart" | "checkout" | "success";

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const { identity, login } = useInternetIdentity();
  const [view, setView] = useState<DrawerView>("cart");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    shippingAddress: "",
    size: "",
    notes: "",
  });

  const inputClass =
    "w-full bg-[#111111] border border-[#FFD700]/40 text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 px-4 py-3 text-sm transition-all duration-200 rounded-none";
  const labelClass =
    "block text-[#FFD700] font-sans text-xs tracking-widest uppercase mb-2";

  const handleOpenChange = (val: boolean) => {
    if (!val) setView("cart");
    onOpenChange(val);
  };

  const handleProceedToCheckout = () => {
    if (!identity) {
      toast.info("Please sign in to checkout");
      login();
      return;
    }
    setView("checkout");
  };

  const handleGuestCheckout = () => {
    setView("checkout");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Your order has been submitted! We'll be in touch shortly.");
    clearCart();
    setForm({
      fullName: "",
      email: "",
      shippingAddress: "",
      size: "",
      notes: "",
    });
    setView("success");
  };

  const drawerTitle = view === "cart" ? "Your Cart" : "Secure Checkout";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        data-ocid="cart.sheet"
        side="right"
        className="w-full sm:max-w-md bg-[oklch(0.12_0.02_250)] border-l border-[oklch(0.22_0.03_248)] flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[oklch(0.22_0.03_248)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl text-foreground flex items-center gap-2">
              {view === "checkout" ? (
                <>
                  <span className="text-[#FFD700]">✦</span>
                  {drawerTitle}
                </>
              ) : (
                <>
                  <ShoppingBag className="text-primary" size={20} />
                  {drawerTitle}
                </>
              )}
            </SheetTitle>
            <button
              type="button"
              data-ocid="cart.close_button"
              onClick={() => handleOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </SheetHeader>

        {/* Flex container filling remaining height */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ── CART VIEW ── */}
            {view === "cart" && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col flex-1 min-h-0 h-full"
              >
                {cartItems.length === 0 ? (
                  <div
                    data-ocid="cart.empty_state"
                    className="flex-1 flex flex-col items-center justify-center gap-4 px-6"
                  >
                    <div className="w-20 h-20 border border-primary/20 flex items-center justify-center">
                      <ShoppingBag className="text-primary/40" size={36} />
                    </div>
                    <p className="font-sans text-muted-foreground text-sm text-center">
                      Your cart is empty.
                      <br />
                      Add some luxury items to get started.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenChange(false)}
                      className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-sans text-xs tracking-widest uppercase"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 px-6 py-4">
                      <div className="space-y-4">
                        {cartItems.map((item, idx) => (
                          <div
                            key={item.product.id.toString()}
                            data-ocid={`cart.item.${idx + 1}`}
                            className="flex gap-4 items-start"
                          >
                            <div className="w-16 h-16 bg-[oklch(0.15_0.025_245)] flex-shrink-0 overflow-hidden">
                              {item.product.imageUrl ? (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="font-display text-primary/30 text-lg">
                                    IE
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-sans text-xs text-primary tracking-wider uppercase">
                                {item.product.brand}
                              </p>
                              <p className="font-display text-foreground text-sm mt-0.5 truncate">
                                {item.product.name}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-sans text-xs text-muted-foreground">
                                  Qty: {item.quantity}
                                </span>
                                <span className="font-display text-primary font-bold text-sm">
                                  $
                                  {(
                                    (Number(item.product.price) *
                                      item.quantity) /
                                    100
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors mt-1 flex-shrink-0"
                              aria-label="Remove item"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="px-6 py-5 border-t border-[oklch(0.22_0.03_248)] space-y-4 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-muted-foreground text-sm tracking-widest uppercase">
                          Total
                        </span>
                        <span className="font-display text-primary text-2xl font-bold">
                          ${(cartTotal / 100).toFixed(2)}
                        </span>
                      </div>

                      <Button
                        data-ocid="cart.checkout_button"
                        onClick={handleProceedToCheckout}
                        className="w-full bg-primary text-primary-foreground hover:bg-[oklch(0.85_0.1_80)] font-sans text-sm tracking-[0.2em] uppercase py-6 transition-all duration-300"
                      >
                        {identity
                          ? "Proceed to Checkout"
                          : "Sign In to Checkout"}
                      </Button>

                      {!identity && (
                        <Button
                          data-ocid="cart.guest_checkout_button"
                          onClick={handleGuestCheckout}
                          variant="outline"
                          className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-sans text-sm tracking-[0.2em] uppercase py-6 transition-all duration-300"
                        >
                          Checkout as Guest
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={clearCart}
                        className="w-full text-center font-sans text-xs text-muted-foreground hover:text-destructive transition-colors tracking-wider uppercase py-1"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── CHECKOUT FORM VIEW ── */}
            {view === "checkout" && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col flex-1 min-h-0 h-full"
              >
                <ScrollArea className="flex-1 h-full">
                  <div className="px-6 py-5 pb-10">
                    {/* Back link */}
                    <button
                      type="button"
                      data-ocid="cart.checkout.back_button"
                      onClick={() => setView("cart")}
                      className="flex items-center gap-1.5 text-[#FFD700]/70 hover:text-[#FFD700] font-sans text-xs tracking-widest uppercase transition-colors mb-6"
                    >
                      <ArrowLeft size={13} />
                      Back to Cart
                    </button>

                    {/* Order summary strip */}
                    <div className="border border-[#FFD700]/20 bg-[#0a0a0a] px-4 py-3 mb-6">
                      <p className="font-sans text-[#FFD700]/60 text-xs tracking-widest uppercase mb-2">
                        Order Summary
                      </p>
                      <div className="space-y-1">
                        {cartItems.map((item) => (
                          <div
                            key={item.product.id.toString()}
                            className="flex justify-between"
                          >
                            <span className="font-sans text-white/60 text-xs truncate max-w-[160px]">
                              {item.product.name} × {item.quantity}
                            </span>
                            <span className="font-sans text-white/80 text-xs">
                              $
                              {(
                                (Number(item.product.price) * item.quantity) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-3 pt-3 border-t border-[#FFD700]/20">
                        <span className="font-sans text-[#FFD700] text-xs tracking-widest uppercase">
                          Total
                        </span>
                        <span className="font-display text-[#FFD700] font-bold">
                          ${(cartTotal / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-white/40 text-xs text-center leading-relaxed mb-6 tracking-wide">
                      Please enter your details below to place your order.
                      Payment instructions will be provided shortly.
                    </p>

                    {/* Form */}
                    <form
                      data-ocid="cart.checkout_form"
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div>
                        <label htmlFor="co-fullName" className={labelClass}>
                          Full Name
                        </label>
                        <input
                          id="co-fullName"
                          name="fullName"
                          type="text"
                          required
                          placeholder="John Doe"
                          value={form.fullName}
                          onChange={handleChange}
                          data-ocid="cart.checkout.full_name.input"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="co-email" className={labelClass}>
                          Email Address
                        </label>
                        <input
                          id="co-email"
                          name="email"
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={form.email}
                          onChange={handleChange}
                          data-ocid="cart.checkout.email.input"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="co-shippingAddress"
                          className={labelClass}
                        >
                          Shipping Address
                        </label>
                        <textarea
                          id="co-shippingAddress"
                          name="shippingAddress"
                          rows={3}
                          required
                          placeholder="123 Main St, City, State, ZIP"
                          value={form.shippingAddress}
                          onChange={handleChange}
                          data-ocid="cart.checkout.shipping_address.textarea"
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <label htmlFor="co-size" className={labelClass}>
                          Size
                        </label>
                        <select
                          id="co-size"
                          name="size"
                          required
                          value={form.size}
                          onChange={handleChange}
                          data-ocid="cart.checkout.size.select"
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          <option value="" disabled>
                            Select a size
                          </option>
                          {SIZE_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-[#111111]">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="co-notes" className={labelClass}>
                          Additional Notes
                        </label>
                        <textarea
                          id="co-notes"
                          name="notes"
                          rows={3}
                          placeholder="Any special requests or instructions…"
                          value={form.notes}
                          onChange={handleChange}
                          data-ocid="cart.checkout.notes.textarea"
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <button
                        type="submit"
                        data-ocid="cart.checkout.submit_button"
                        className="bg-[#FFD700] text-black hover:bg-yellow-300 font-sans text-sm tracking-[0.2em] uppercase w-full py-4 transition-all duration-200 font-semibold mt-2 rounded-none"
                      >
                        Submit Order
                      </button>
                    </form>
                  </div>
                </ScrollArea>
              </motion.div>
            )}

            {/* ── SUCCESS VIEW ── */}
            {view === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                data-ocid="cart.checkout.success_state"
                className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5"
              >
                <div className="w-20 h-20 border border-[#FFD700]/50 flex items-center justify-center">
                  <CheckCircle className="text-[#FFD700]" size={36} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-white mb-2">
                    Order Submitted
                  </h3>
                  <p className="font-sans text-white/50 text-sm leading-relaxed">
                    Thank you for your order. We'll be in touch with payment
                    instructions shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setView("cart");
                    handleOpenChange(false);
                  }}
                  className="font-sans text-xs tracking-widest uppercase text-[#FFD700] border border-[#FFD700]/40 px-6 py-3 hover:bg-[#FFD700]/10 transition-all duration-200"
                >
                  Continue Shopping
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
