const reviews = [
  {
    name: "Rafiq H.",
    text: "Amazing quality products! The RGB lights transformed my room. ✨",
    rating: 5,
  },
  {
    name: "Tasnim A.",
    text: "Best attar collection I've found online. Fast delivery too!",
    rating: 5,
  },
  {
    name: "Sakib M.",
    text: "The astronaut lamp is my favorite desk piece. Love it! 🚀",
    rating: 5,
  },
  {
    name: "Nusrat J.",
    text: "Great prices and genuine products. Will order again!",
    rating: 4,
  },
  {
    name: "Arif K.",
    text: "ProBuds are incredible for the price. Highly recommend!",
    rating: 5,
  },
  {
    name: "Meem S.",
    text: "Panda collection is SO cute! Perfect gift for my sister.",
    rating: 5,
  },
];

export default function ReviewMarquee() {
  return (
    <section className="overflow-hidden py-6">
      <h2 className="text-xl font-bold text-foreground mb-5 text-center">
        💬 What Our Customers Say
      </h2>
      <div className="flex animate-marquee">
        {[...reviews, ...reviews].map((r, i) => (
          <div
            key={i}
            className="light-card p-4 mx-2 min-w-[280px] max-w-[280px] flex-shrink-0"
          >
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: r.rating }).map((_, j) => (
                <span key={j} className="text-amber-400 text-xs">
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-2">"{r.text}"</p>
            <p className="text-xs font-semibold text-foreground">— {r.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
