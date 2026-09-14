import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE = "https://www.luxynex.shop";
const DEFAULT_TITLE =
  "Luxynex | Premium Gadgets, Attar & Perfumes in Bangladesh";
const DEFAULT_DESC =
  "Explore premium gadgets, smart accessories, original attar and luxury perfumes at Luxynex. Fast delivery, affordable prices and trusted online shopping across Bangladesh.";
const DEFAULT_IMG = `${SITE}/lovable-uploads/og-default.png`;

export default function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  jsonLd,
}: SEOProps) {
  const fullTitle = title || DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMG;
  const canonical = url
    ? url.startsWith("http")
      ? url
      : `${SITE}${url}`
    : typeof window !== "undefined"
      ? window.location.href.split("?")[0]
      : SITE;
  const defaultOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Luxynex",
    url: SITE,
    logo: `${SITE}/assets/luxynex-logo.svg`,
  };
  const lds = [
    defaultOrganization,
    ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []),
  ];
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content="Luxynex" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {lds.map((d, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(d)}
        </script>
      ))}
    </Helmet>
  );
}
