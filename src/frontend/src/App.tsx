import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend";
import CartDrawer from "./components/CartDrawer";
import { CartProvider, useCart } from "./context/CartContext";
import type { DisplayProduct } from "./context/CartContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAdminCount,
  useClaimInitialAdmin,
  useGetAllProducts,
  useIsAdmin,
} from "./hooks/useQueries";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

const HARDCODED_PRODUCTS: DisplayProduct[] = [
  {
    id: 1n,
    name: "Classic Polo Shirt",
    brand: "Ralph Lauren",
    price: 7900n,
    category: "Shirts",
    description:
      "Signature polo with embroidered pony logo. Crafted from premium cotton piqué.",
    imageUrl: "/assets/generated/polo-shirt-product.dim_600x600.jpg",
  },
  {
    id: 2n,
    name: "Heritage Suit",
    brand: "Jos. A. Bank",
    price: 39900n,
    category: "Suits",
    description:
      "Two-button classic fit suit in Italian wool blend. Timeless sophistication.",
    imageUrl: "/assets/generated/classic-suit-product.dim_600x600.jpg",
  },
  {
    id: 3n,
    name: "Silk Dress Shirt",
    brand: "Ralph Lauren",
    price: 14900n,
    category: "Shirts",
    description:
      "Crisp white dress shirt with French cuffs. Woven from Egyptian cotton.",
    imageUrl: "/assets/generated/dress-shirt-product.dim_600x600.jpg",
  },
  {
    id: 4n,
    name: "Woven Silk Tie",
    brand: "Jos. A. Bank",
    price: 5900n,
    category: "Accessories",
    description:
      "Hand-finished silk tie with geometric pattern. The perfect finishing touch.",
    imageUrl: "/assets/generated/silk-tie-product.dim_600x600.jpg",
  },
  {
    id: 5n,
    name: "Tech Fleece Jogger",
    brand: "Nike",
    price: 11000n,
    category: "Shirts",
    description:
      "Engineered Tech Fleece fabric delivers lightweight warmth with a streamlined fit.",
    imageUrl: "/assets/generated/nike-jogger-product.dim_600x600.jpg",
  },
  {
    id: 6n,
    name: "Ultraboost Sneaker",
    brand: "Adidas",
    price: 19000n,
    category: "Accessories",
    description:
      "Responsive Boost midsole and Primeknit upper for all-day comfort and style.",
    imageUrl: "/assets/generated/adidas-sneaker-product.dim_600x600.jpg",
  },
];

const NAV_LINKS = [
  { label: "Home", href: "#home", ocid: "nav.home.link" },
  { label: "Shop", href: "#products", ocid: "nav.shop.link" },
  { label: "Suits", href: "#products", ocid: "nav.suits.link" },
  { label: "Shirts", href: "#products", ocid: "nav.shirts.link" },
  { label: "Accessories", href: "#products", ocid: "nav.accessories.link" },
  { label: "Contact", href: "#contact", ocid: "nav.contact.link" },
];

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Authentic Products",
    desc: "Every item is 100% genuine, sourced directly from official brand distributors.",
  },
  {
    icon: Star,
    title: "Quality Menswear",
    desc: "Curated selection of premium pieces that stand the test of time.",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "Complimentary shipping on all orders over $200 across the continental US.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "30-day hassle-free returns on all unworn items in original packaging.",
  },
];

function scrollTo(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { data: isAdmin } = useIsAdmin();
  const { data: adminCount } = useAdminCount();
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { mutate: claimAdmin } = useClaimInitialAdmin();
  const { cartCount } = useCart();
  const prevIdentityRef = useRef<typeof identity>(undefined);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Auto-claim admin when first user logs in and no admins exist
  useEffect(() => {
    const wasLoggedOut = !prevIdentityRef.current;
    const isNowLoggedIn = !!identity;
    prevIdentityRef.current = identity;

    if (
      wasLoggedOut &&
      isNowLoggedIn &&
      adminCount !== undefined &&
      adminCount === 0n
    ) {
      claimAdmin();
    }
  }, [identity, adminCount, claimAdmin]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    scrollTo(href);
  };

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-navy-deep/95 backdrop-blur-md shadow-luxury"
            : "bg-navy-deep"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <button
              type="button"
              className="flex-shrink-0 bg-transparent border-0 p-0 cursor-pointer"
              onClick={() => handleNavClick("#home")}
            >
              <img
                src="/assets/generated/ismael-express-logo-transparent.dim_400x120.png"
                alt="Ismael Express"
                className="h-12 w-auto object-contain"
              />
            </button>

            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  data-ocid={link.ocid}
                  className="nav-link font-sans text-sm font-medium tracking-widest uppercase text-foreground/70 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                >
                  {link.label}
                </a>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  data-ocid="nav.admin.link"
                  className="flex items-center gap-1.5 font-sans text-sm font-medium tracking-widest uppercase text-primary hover:text-gold-light transition-colors"
                >
                  <LayoutDashboard size={14} />
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {/* Cart button */}
              <button
                type="button"
                data-ocid="nav.cart_button"
                onClick={() => setCartOpen(true)}
                className="relative text-foreground/70 hover:text-primary transition-colors p-1"
                aria-label="Open cart"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              {/* Auth button */}
              {identity ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="font-sans text-xs text-muted-foreground tracking-wide">
                    {shortPrincipal}
                  </span>
                  <button
                    type="button"
                    data-ocid="nav.logout_button"
                    onClick={() => clear()}
                    className="flex items-center gap-1.5 font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Button
                  size="sm"
                  data-ocid="nav.login_button"
                  onClick={() => login()}
                  disabled={isLoggingIn}
                  className="hidden md:flex items-center gap-1.5 bg-transparent border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-sans text-xs tracking-widest uppercase transition-all duration-200 h-8 px-3"
                >
                  <LogIn size={13} />
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
              )}

              <button
                type="button"
                className="md:hidden text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-navy-deep border-t border-border"
            >
              <nav className="flex flex-col px-6 py-4 gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    data-ocid={link.ocid}
                    className="font-sans text-sm font-medium tracking-widest uppercase text-foreground/70 hover:text-primary transition-colors py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                  >
                    {link.label}
                  </a>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    data-ocid="nav.admin.link"
                    className="flex items-center gap-1.5 font-sans text-sm font-medium tracking-widest uppercase text-primary py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard size={14} />
                    Admin
                  </Link>
                )}
                {identity ? (
                  <button
                    type="button"
                    data-ocid="nav.logout_button"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-1.5 font-sans text-sm font-medium tracking-widest uppercase text-muted-foreground hover:text-destructive transition-colors py-2 text-left"
                  >
                    <LogOut size={14} />
                    Sign Out ({shortPrincipal})
                  </button>
                ) : (
                  <button
                    type="button"
                    data-ocid="nav.login_button"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-1.5 font-sans text-sm font-medium tracking-widest uppercase text-primary py-2"
                  >
                    <LogIn size={14} />
                    Sign In
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}

function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-background.dim_1600x800.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-navy-deep/70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, oklch(0.08 0.015 252 / 0.8) 100%)",
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-primary" />
            <span className="font-sans text-primary text-xs tracking-[0.3em] uppercase">
              Est. 2024
            </span>
            <div className="h-px w-16 bg-primary" />
          </div>

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold text-foreground mb-4 leading-none tracking-tight">
            Luxury
            <br />
            <span className="text-primary">Menswear</span>
          </h1>

          <p className="font-serif text-lg sm:text-xl text-foreground/60 mb-4 italic tracking-wide">
            Ralph Lauren &nbsp;|&nbsp; Jos. A. Bank &nbsp;|&nbsp; Nike
            &nbsp;|&nbsp; Adidas
          </p>

          <p className="font-sans text-foreground/50 text-sm tracking-widest uppercase mb-10">
            Curated for the modern gentleman
          </p>

          <Button
            size="lg"
            data-ocid="hero.primary_button"
            onClick={() => scrollTo("#products")}
            className="bg-primary text-primary-foreground hover:bg-gold-light font-sans text-sm tracking-[0.2em] uppercase px-10 py-6 transition-all duration-300 hover:shadow-gold"
          >
            Shop Now
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
      >
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent mx-auto" />
      </motion.div>
    </section>
  );
}

function ProductCard({
  product,
  index,
}: { product: DisplayProduct; index: number }) {
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();

  const imageSrc = product.imageUrl ?? null;

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      data-ocid={`products.item.${index}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden"
      style={{ boxShadow: "0 4px 24px oklch(0 0 0 / 0.3)" }}
    >
      <div className="relative h-72 overflow-hidden bg-muted">
        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy-light">
            <span className="font-display text-primary/30 text-4xl">IE</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-navy-deep/80 text-primary border-primary/30 font-sans text-xs tracking-wider backdrop-blur-sm">
            {product.brand}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <p className="font-sans text-muted-foreground text-xs tracking-widest uppercase mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="font-sans text-muted-foreground text-sm mb-4 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl text-primary font-bold">
            ${(Number(product.price) / 100).toFixed(2)}
          </span>
          <Button
            variant="outline"
            size="sm"
            data-ocid={`products.add_to_cart_button.${index}`}
            onClick={handleAddToCart}
            className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-sans text-xs tracking-widest uppercase transition-all duration-200"
          >
            <ShoppingCart size={13} className="mr-1.5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ProductsSection() {
  const { data: backendProducts, isLoading } = useGetAllProducts();

  const products: DisplayProduct[] =
    backendProducts && backendProducts.length > 0
      ? backendProducts.map((p: Product) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          category: p.category,
          description: p.description,
        }))
      : HARDCODED_PRODUCTS;

  return (
    <section id="products" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-primary" />
            <span className="font-sans text-primary text-xs tracking-[0.3em] uppercase">
              Our Collection
            </span>
            <div className="h-px w-12 bg-primary" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-4">
            Featured Products
          </h2>
          <p className="font-sans text-muted-foreground max-w-md mx-auto">
            Handpicked pieces from the world's finest menswear brands.
          </p>
        </motion.div>

        {isLoading ? (
          <div
            data-ocid="products.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card border border-border overflow-hidden"
              >
                <Skeleton className="h-72 w-full bg-muted" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20 bg-muted" />
                  <Skeleton className="h-6 w-40 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            data-ocid="products.list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.map((product, i) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-24 px-4 bg-navy-light relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(0.74 0.12 75) 0px, oklch(0.74 0.12 75) 1px, transparent 1px, transparent 20px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-primary" />
            <span className="font-sans text-primary text-xs tracking-[0.3em] uppercase">
              Our Promise
            </span>
            <div className="h-px w-12 bg-primary" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">
            Why Shop With Us
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-5 border border-primary/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <item.icon className="text-primary" size={28} />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">
                {item.title}
              </h3>
              <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactFooter() {
  return (
    <footer
      id="contact"
      data-ocid="contact.section"
      className="bg-navy-deep border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <img
            src="/assets/generated/ismael-express-logo-transparent.dim_400x120.png"
            alt="Ismael Express"
            className="h-10 w-auto object-contain mb-4"
          />
          <p className="font-sans text-muted-foreground text-sm leading-relaxed">
            The premier destination for authentic Ralph Lauren, Jos. A. Bank,
            Nike, and Adidas menswear.
          </p>
        </div>

        <div>
          <h4 className="font-display text-foreground text-lg mb-4">
            Contact Us
          </h4>
          <ul className="space-y-2 font-sans text-muted-foreground text-sm">
            <li>📍 123 Fashion Avenue, New York, NY 10001</li>
            <li>📞 (212) 555-0192</li>
            <li>✉️ info@ismaelexpress.com</li>
            <li>🕐 Mon–Sat: 10AM – 8PM</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-foreground text-lg mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-sans text-muted-foreground text-sm hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-sans text-muted-foreground text-xs">
            © {new Date().getFullYear()} Ismael Express. All rights reserved.
          </p>
          <p className="font-sans text-muted-foreground text-xs">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function AdminFloatingButton() {
  const { data: isAdmin } = useIsAdmin();

  if (!isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <Link
        to="/admin"
        data-ocid="admin.dashboard_button"
        className="flex items-center gap-2.5 bg-primary text-primary-foreground font-sans text-sm font-semibold tracking-widest uppercase px-6 py-3 rounded-full shadow-[0_4px_24px_oklch(0.74_0.12_75_/_0.45)] hover:bg-gold-light hover:shadow-[0_6px_32px_oklch(0.74_0.12_75_/_0.6)] transition-all duration-300"
      >
        <LayoutDashboard size={16} />
        Admin Dashboard
      </Link>
    </motion.div>
  );
}

function ShopPage() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header />
      <main>
        <Hero />
        <ProductsSection />
        <TrustSection />
      </main>
      <ContactFooter />
      <AdminFloatingButton />
    </div>
  );
}

// TanStack Router setup
const rootRoute = createRootRoute({
  component: Outlet,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ShopPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminLoginRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
