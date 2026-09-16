import { useState } from "react";
import { LOGO_FALLBACK, SAFE_LOGO_URL } from "@/lib/store-utils";

interface Props {
  imageUrl?: string;
  name: string;
  className?: string;
}

const ProductImageDisplay = ({ imageUrl, name, className = "w-full h-full object-contain p-2" }: Props) => {
  const [failed, setFailed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // If we have a valid image URL and it hasn't failed, show it
  if (imageUrl && imageUrl.trim() && !failed) {
    return (
      <div 
        className="relative w-full h-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className={`${className} transition-transform duration-500 ease-out ${isHovered ? 'scale-125' : 'scale-100'}`}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  // Fallback: NM Mart logo (safe local asset, then remote fallback)
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={SAFE_LOGO_URL || LOGO_FALLBACK}
        alt={name}
        loading="lazy"
        className={`${className} transition-transform duration-500 ease-out`}
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
