import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HyperText } from "./ui/hyper-text";
import Footer from "./Footer";
import { useCartStore } from "@/context/useCartStore";
import { toast } from "sonner";

type StoreProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
};

const INR_CONVERSION_FACTOR = 88;

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function toInr(priceInUsd: number) {
  return Math.max(Math.round(priceInUsd * INR_CONVERSION_FACTOR), 1);
}

function formatCount(count: number | undefined) {
  if (!count) return "0";
  if (count >= 1000) {
    const formatted = count / 1000;
    return `${formatted >= 10 ? formatted.toFixed(0) : formatted.toFixed(1)}k`;
  }
  return `${count}`;
}

const Products = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();

  const handleAddToCart = (product: StoreProduct) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    toast.success(`${product.title} added to cart!`, {
      duration: 2000,
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch("https://fakestoreapi.com/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to fetch products");
        }

        const payload = (await response.json()) as StoreProduct[];
        setProducts(payload ?? []);
        setError(null);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") return;
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, []);

  const featuredProducts = useMemo(() => {
    if (!products.length) return [];

    return [...products]
      .filter((item) => item.rating?.count && item.rating?.rate)
      .sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
  }, [products]);

  if (loading) {
    return (
      <section className="space-y-4">
        <HyperText className="text-xl text-purple-400 px-4">
          Featured Products
        </HyperText>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="animate-pulse border-dashed"
            >
              <div className="mx-6 mb-4 mt-2 h-28 rounded-md bg-muted/60" />
              <CardContent className="space-y-4">
                <div className="h-4 rounded bg-muted/60" />
                <div className="h-3 w-3/4 rounded bg-muted/40" />
                <div className="h-3 w-1/2 rounded bg-muted/30" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-2">
        <HyperText className="text-3xl text-purple-400 px-4">
          Featured Products
        </HyperText>
        <p className="text-sm text-destructive">{error}</p>
      </section>
    );
  }

  if (!featuredProducts.length) {
    return null;
  }

  return (
    <section className="space-y-4 px-4">
      <HyperText className="text-xl text-purple-400 px-4">
        Featured Products
      </HyperText>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {featuredProducts.map((product) => {
          const currentPrice = toInr(product.price);
          const mrp = Math.round(currentPrice * 1.25);
          const savings = mrp - currentPrice;
          const discountPercent = Math.round((savings / mrp) * 100);

          return (
            <Card
              key={product.id}
              className="relative overflow-hidden border-border/70"
            >
              <CardHeader className="grid-rows-[auto] gap-4 px-6 pb-0">
                <div className="relative flex items-center justify-center rounded-lg bg-muted/30 py-6">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-28 w-28 object-contain"
                    loading="lazy"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute cursor-pointer bottom-3 right-3 rounded-full border border-primary bg-background px-5 text-primary hover:bg-primary/10"
                    onClick={() => handleAddToCart(product)}
                  >
                    ADD
                  </Button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-emerald-600">
                    {rupee.format(currentPrice)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {rupee.format(mrp)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-emerald-600">
                    ₹{savings} OFF
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-600">
                    {discountPercent}% OFF
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <CardTitle className="text-sm leading-snug text-foreground">
                  {product.title}
                </CardTitle>
                <CardDescription className="text-xs capitalize text-muted-foreground">
                  {product.category}
                </CardDescription>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-emerald-600">
                    <Star className="size-4 fill-emerald-500 text-emerald-500" />
                    {product.rating?.rate ?? "-"}
                  </span>
                  <span>({formatCount(product.rating?.count)} reviews)</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Footer />
    </section>
  );
};

export default Products;
