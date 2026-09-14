import { useState } from "react";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  alt?: string;
  invert?: boolean;
}

export default function BrandLogo({
  className = "",
  imageClassName = "",
  alt = "Luxynex",
  invert = false,
}: BrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className={`inline-flex items-center ${className}`}>
      {imageFailed ? (
        <span className="font-bold tracking-[0.18em]">LUXYNEX</span>
      ) : (
        <img
          src="/assets/luxynex-logo.svg"
          alt={alt}
          className={`${imageClassName} ${invert ? "brightness-0 invert" : ""}`}
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}