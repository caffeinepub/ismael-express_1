import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ShoppingItem } from "../backend";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const { identity, login } = useInternetIdentity();
  const { actor } = useActor();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!identity) {
      toast.info("Please sign in to checkout");
      login();
      return;
    }

    if (!actor) return;

    setCheckingOut(true);
    try {
      const isConfigured = await actor.isStripeConfigured();
      if (!isConfigured) {
        toast.error("Checkout not yet configured");
        return;
      }

      const items: ShoppingItem[] = cartItems.map((i) => ({
        productName: i.product.name,
        productDescription: i.product.description,
        priceInCents: i.product.price,
        quantity: BigInt(i.quantity),
        currency: "usd",
      }));

      const successUrl = `${window.location.origin}/?checkout=success`;
      const cancelUrl = `${window.location.origin}/?checkout=cancel`;
      const url = await actor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      clearCart();
      window.location.href = url;
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="cart.sheet"
        side="right"
        className="w-full sm:max-w-md bg-[oklch(0.12_0.02_250)] border-l border-[oklch(0.22_0.03_248)] flex flex-col p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[oklch(0.22_0.03_248)]">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl text-foreground flex items-center gap-2">
              <ShoppingBag className="text-primary" size={20} />
              Your Cart
            </SheetTitle>
            <button
              type="button"
              data-ocid="cart.close_button"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </SheetHeader>

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
              onClick={() => onOpenChange(false)}
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
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <span className="font-display text-primary font-bold text-sm">
                          $
                          {(
                            (Number(item.product.price) * item.quantity) /
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

            <div className="px-6 py-5 border-t border-[oklch(0.22_0.03_248)] space-y-4">
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
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-primary text-primary-foreground hover:bg-[oklch(0.85_0.1_80)] font-sans text-sm tracking-[0.2em] uppercase py-6 transition-all duration-300"
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : identity ? (
                  "Proceed to Checkout"
                ) : (
                  "Sign In to Checkout"
                )}
              </Button>

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
      </SheetContent>
    </Sheet>
  );
}
