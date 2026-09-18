import { useState } from "react";
import { LOGO_FALLBACK, SAFE_LOGO_URL } from "@/lib/store-utils";

interface Props {
  imageUrl?: string;
  name: string;
  className?: string;
}

const ProductImageDisplay = ({ imageUrl, name, className = "h-full w-full object-contain p-3" }: Props) => {
  const [failed, setFailed] = useState(false);

  const shellClass = "relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden bg-[#fffdf9]";

  if (imageUrl && imageUrl.trim() && !failed) {
    return (
      <div className={shellClass}>
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          className={`shrink-0 max-w-full max-h-full ${className}`}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <img
        src={SAFE_LOGO_URL || LOGO_FALLBACK}
        alt={name}
        loading="lazy"
        decoding="async"
        className={`shrink-0 max-w-full max-h-full ${className}`}
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
