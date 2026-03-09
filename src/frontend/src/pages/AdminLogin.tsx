import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function AdminLogin() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();

  useEffect(() => {
    if (identity && isAdmin === true) {
      window.location.href = "/admin";
    }
  }, [identity, isAdmin]);

  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, oklch(0.18 0.03 248 / 0.8) 0%, oklch(0.08 0.015 252) 70%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.74 0.12 75) 1px, transparent 1px), linear-gradient(90deg, oklch(0.74 0.12 75) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" data-ocid="admin-login.home.link">
            <img
              src="/assets/generated/ismael-express-logo-transparent.dim_400x120.png"
              alt="Ismael Express"
              className="h-12 w-auto object-contain mx-auto mb-4"
            />
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShieldCheck className="text-primary" size={20} />
            <span className="font-sans text-primary text-xs tracking-[0.3em] uppercase">
              Admin Portal
            </span>
          </div>
          <h1 className="font-display text-3xl text-foreground">
            Dashboard Access
          </h1>
          <p className="font-sans text-muted-foreground text-sm mt-2">
            Sign in with your identity to access the admin dashboard.
          </p>
        </div>

        <div
          className="bg-card border border-border p-8"
          style={{ boxShadow: "0 8px 40px oklch(0 0 0 / 0.4)" }}
        >
          {isAuthenticated && checkingAdmin ? (
            <div
              data-ocid="admin-login.loading_state"
              className="flex flex-col items-center gap-4 py-4"
            >
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="font-sans text-muted-foreground text-sm">
                Verifying admin access...
              </p>
            </div>
          ) : isAuthenticated && isAdmin === false ? (
            <div
              data-ocid="admin-login.error_state"
              className="text-center py-4"
            >
              <p className="font-sans text-destructive-foreground text-sm bg-destructive/20 border border-destructive/30 px-4 py-3 mb-4">
                Your account does not have admin privileges.
              </p>
              <Button
                variant="outline"
                className="border-border text-foreground/70 font-sans text-xs tracking-widest uppercase"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Return to Shop
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                  Authenticate with Internet Identity to access product
                  management and payment records.
                </p>
              </div>

              <Button
                data-ocid="admin-login.primary_button"
                onClick={login}
                disabled={isLoggingIn}
                className="w-full bg-primary text-primary-foreground hover:bg-gold-light font-sans text-sm tracking-[0.2em] uppercase py-6 transition-all duration-300"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In with Internet Identity"
                )}
              </Button>

              <div className="flex items-center justify-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="font-sans text-muted-foreground text-xs tracking-widest uppercase px-2">
                  Secure
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <p className="font-sans text-muted-foreground text-xs text-center leading-relaxed">
                Internet Identity provides cryptographic authentication without
                passwords or personal data.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            data-ocid="admin-login.cancel_button"
            className="font-sans text-muted-foreground text-xs tracking-widest uppercase hover:text-primary transition-colors"
          >
            ← Back to Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
