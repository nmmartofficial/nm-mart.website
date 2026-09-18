import { useState } from "react";
import { LOGO_FALLBACK, SAFE_LOGO_URL } from "@/lib/store-utils";

interface Props {
  imageUrl?: string;
  name: string;
  className?: string;
}

const ProductImageDisplay = ({ imageUrl, name, className = "h-full w-full object-contain p-3" }: Props) => {
  const [failed, setFailed] = useState(false);

  // If we have a valid image URL and it hasn't failed, show it
  if (imageUrl && imageUrl.trim() && !failed) {
    return (
      <div 
        className="relative h-full w-full overflow-hidden bg-[#fffdf9]"
      >
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          className={className}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  // Fallback: NM Mart logo (safe local asset, then remote fallback)
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fffdf9]">
      <img
        src={SAFE_LOGO_URL || LOGO_FALLBACK}
        alt={name}
        loading="lazy"
        decoding="async"
        className={className}
        onError={(event) => {
          const target = event.currentTarget as HTMLImageElement;
          if (target.src !== LOGO_FALLBACK) {
            target.src = LOGO_FALLBACK;
          }
        }}
      />
    </div>
  );
};

export default ProductImageDisplay;
