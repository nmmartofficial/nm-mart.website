import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type ReviewItem = {
  id?: string;
  name?: string;
  location?: string;
  rating?: number;
  text?: string;
};

const isMissingReviewsTableError = (error: any) => {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("does not exist")
    || message.includes("schema cache")
    || message.includes("could not find the table")
    || message.includes("relation")
    || message.includes("not found")
    || message.includes("pgrst205")
    || message.includes("pgrst301");
};

const Reviews = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .limit(4);

        if (!isMounted) return;

        if (error) {
          if (!isMissingReviewsTableError(error)) {
            console.error("Error fetching reviews:", error);
          }
          setReviews([]);
          return;
        }

        setReviews((data as ReviewItem[]) ?? []);
      } catch (err) {
        if (!isMissingReviewsTableError(err)) {
          console.error("Error fetching reviews:", err);
        }
        if (isMounted) setReviews([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return null;
  if (!reviews.length) return null;

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
            Happy <span className="text-gold">Customers</span>
          </h2>
          <p className="text-muted-foreground mt-2">What our shoppers say about us</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div key={review.id ?? i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex gap-0.5 mb-3">
                {[...Array(Math.max(0, Number(review.rating ?? 0)))].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-card-foreground/80 mb-4 leading-relaxed">"{review.text ?? ""}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-navy flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {(review.name ?? "A")[0]?.toUpperCase() ?? "A"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{review.name ?? "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{review.location ?? "Local customer"}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
