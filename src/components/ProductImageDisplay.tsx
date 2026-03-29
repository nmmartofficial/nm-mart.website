import { useState } from "react";
import { LOGO_FALLBACK } from "@/lib/store-utils";

interface Props {
  imageUrl?: string;
  name: string;
  className?: string;
}

const ProductImageDisplay = ({ imageUrl, name, className = "w-full h-full object-contain p-2" }: Props) => {
  const [failed, setFailed] = useState(false);

  // If we have a valid image URL and it hasn't failed, show it
  if (imageUrl && imageUrl.trim() && !failed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  // Fallback: NM Mart logo
  return (
    <img
      src={LOGO_FALLBACK}
      alt={name}
      loading="lazy"
      className={className}
    />
  );
};

export default ProductImageDisplay;
