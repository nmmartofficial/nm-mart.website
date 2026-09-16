import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";
import { fetchActiveBanners } from "@/lib/supabase";

const Hero = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadSlides = async () => {
      try {
        const banners = await fetchActiveBanners();
        if (isMounted) {
          setSlides(banners ?? []);
          if (banners.length > 0) setCurrentSlide(0);
        }
      } catch (error) {
        console.error("Error loading hero banners:", error);
        if (isMounted) setSlides([]);
      }
    };

    loadSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return (
      <section className="relative h-[420px] w-full overflow-hidden bg-black pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#1f1f1f] to-[#111111]" />
        <div className="relative flex h-full items-center justify-center px-8 text-center text-white md:px-20">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-orange-300">NM Mart</p>
            <h1 className="text-3xl font-extrabold md:text-5xl">Live banner data is loading</h1>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[currentSlide];
  const image = slide?.image_url || slide?.image || slide?.banner_image || "";

  return (
    <section className="relative h-[500px] w-full overflow-hidden bg-black pt-20">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: image ? `url(${image})` : undefined }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>

      <div className="relative flex h-full flex-col justify-center px-8 md:px-20">
        <span className="mb-4 text-[#00A8E1] font-bold tracking-widest">
          {slide?.title ? slide.title : "Live Store"}
        </span>
        <h1 className="mb-4 text-5xl font-extrabold leading-tight text-white md:text-7xl">
          {slide?.subtitle || "NM Mart"}
        </h1>
        <p className="mb-8 max-w-lg text-xl text-gray-300">
          {slide?.description || "Updated from the live database."}
        </p>
        <div className="flex gap-4">
          <button className="flex items-center rounded-full bg-[#00A8E1] px-8 py-3 font-bold text-black transition hover:bg-[#0081ad] shadow-lg shadow-[#00A8E1]/20">
            Shop Now <ShoppingCart className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      <button
        onClick={() => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-[#00A8E1]"
      >
        <ArrowLeft />
      </button>
      <button
        onClick={() => setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-[#00A8E1]"
      >
        <ArrowRight />
      </button>
    </section>
  );
};

export default Hero;
