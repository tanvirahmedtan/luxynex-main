import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ProductReview {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
}

interface CustomerReviewsProps {
  userId: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CustomerReviews({ userId }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(`luxynex_reviews_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ProductReview[];
        setReviews(parsed);
      } catch {
        setReviews([]);
      }
    }
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xl font-semibold text-foreground">Product reviews</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            View your submitted product reviews and check their status.
          </p>
        </div>
        <Badge variant="outline">{reviews.length} reviews</Badge>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="rounded-3xl border border-dashed border-border bg-background p-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              No product reviews yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit a review after you purchase a product to help other shoppers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">{review.productName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(review.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1 text-sm text-white">
                    <Star className="h-4 w-4 text-amber-400" />
                    {review.rating.toFixed(1)}
                  </div>
                  <Badge variant="outline">Published</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
