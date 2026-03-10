import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Product } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAdminCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["adminCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      return (actor as any).getAdminCount() as Promise<bigint>;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useClaimInitialAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).claimInitialAdmin() as Promise<boolean>;
    },
    onSuccess: (success) => {
      if (success) {
        toast.success("You are now admin!");
        queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
        queryClient.invalidateQueries({ queryKey: ["adminCount"] });
      }
    },
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      brand: string;
      category: string;
      description: string;
      price: number;
      imageFile?: File | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      let image: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes);
      }
      await actor.addProduct(
        data.name,
        data.brand,
        data.category,
        data.description,
        BigInt(Math.round(data.price * 100)),
        image,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully");
    },
    onError: () => {
      toast.error("Failed to add product");
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      brand: string;
      category: string;
      description: string;
      price: number;
      imageFile?: File | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      let image: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes);
      }
      await actor.updateProduct(
        data.id,
        data.name,
        data.brand,
        data.category,
        data.description,
        BigInt(Math.round(data.price * 100)),
        image,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });
}

export function useStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripeSession", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useSeedProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const SAMPLE_PRODUCTS = [
        {
          name: "Polo Shirt",
          brand: "Ralph Lauren",
          category: "Shirts",
          description: "Classic fit polo shirt in premium cotton piqué.",
          price: 7900,
        },
        {
          name: "Classic Suit",
          brand: "Jos. A. Bank",
          category: "Suits",
          description: "Tailored two-piece suit in fine wool blend.",
          price: 39900,
        },
        {
          name: "Dress Shirt",
          brand: "Ralph Lauren",
          category: "Shirts",
          description: "Crisp poplin dress shirt with spread collar.",
          price: 12900,
        },
        {
          name: "Silk Tie",
          brand: "Jos. A. Bank",
          category: "Accessories",
          description: "Hand-finished 100% silk tie.",
          price: 5900,
        },
        {
          name: "Tech Fleece Jogger",
          brand: "Nike",
          category: "Accessories",
          description: "Nike Tech Fleece jogger with tapered fit.",
          price: 13000,
        },
        {
          name: "Ultraboost Sneaker",
          brand: "Adidas",
          category: "Shoes",
          description: "Adidas Ultraboost with responsive Boost cushioning.",
          price: 18000,
        },
      ];
      for (const p of SAMPLE_PRODUCTS) {
        await actor.addProduct(
          p.name,
          p.brand,
          p.category,
          p.description,
          BigInt(p.price),
          null,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Sample products imported successfully");
    },
    onError: () => {
      toast.error("Failed to import sample products");
    },
  });
}
