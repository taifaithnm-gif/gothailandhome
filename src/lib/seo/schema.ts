import type { Locale } from "@/config/locales";
import { siteConfig } from "@/config/site";
import type { PropertyView } from "@/lib/data/properties";
import type { ProjectView } from "@/lib/data/projects";
import type { DeveloperView } from "@/lib/data/developers";
import { absoluteUrl } from "@/lib/i18n/metadata";
import { visibleProjectFaqs } from "@/lib/projects/visible-faq";

export type BreadcrumbSchemaItem = {
  name: string;
  path?: string;
};

export function organizationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl(locale),
    logo: `${siteConfig.url}/og/default.svg`,
    description:
      "Bangkok-first property discovery marketplace for verified public listings and projects.",
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl(locale),
    inLanguage:
      locale === "zh" ? "zh-CN" : locale === "th" ? "th" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(locale, "/properties")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbListSchema(
  locale: Locale,
  items: BreadcrumbSchemaItem[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path
        ? { item: absoluteUrl(locale, item.path === "/" ? "" : item.path) }
        : {}),
    })),
  };
}

export function collectionPageSchema(input: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.locale, input.path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl(input.locale),
    },
  };
}

function schemaPropertyType(type: PropertyView["type"]): string {
  switch (type) {
    case "condo":
      return "Apartment";
    case "house":
    case "villa":
      return "House";
    case "land":
      return "LandPlot";
    case "commercial":
      return "RealEstateListing";
    default:
      return "Accommodation";
  }
}

export function listingSchema(input: {
  locale: Locale;
  property: PropertyView;
  name: string;
  description: string;
}) {
  const { locale, property, name, description } = input;
  const url = absoluteUrl(locale, `/properties/${property.slug}`);
  const images = [
    ...(property.coverUrl ? [property.coverUrl] : []),
    ...property.media
      .map((m) => m.public_url)
      .filter((u): u is string => Boolean(u)),
  ].slice(0, 8);

  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateListing", schemaPropertyType(property.type)],
    name,
    description,
    url,
    ...(images.length ? { image: images } : {}),
    datePosted: property.publishedAt ?? property.lastVerifiedAt ?? undefined,
    offers: {
      "@type": "Offer",
      price: property.priceThb,
      priceCurrency: "THB",
      availability: "https://schema.org/InStock",
      url,
      businessFunction:
        property.listingType === "rent"
          ? "https://schema.org/LeaseOut"
          : "https://schema.org/Sell",
    },
    ...(property.bedrooms != null ? { numberOfRooms: property.bedrooms } : {}),
    ...(property.areaSqm != null
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.areaSqm,
            unitCode: "MTK",
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality:
        property.districtName[locale] ||
        property.districtName.en ||
        property.location[locale] ||
        undefined,
      addressCountry: "TH",
    },
  };
}

export function projectSchema(input: {
  locale: Locale;
  project: ProjectView;
  name: string;
  description: string;
}) {
  const { locale, project, name, description } = input;
  const url = absoluteUrl(locale, `/projects/${project.slug}`);
  const image =
    project.ogImagePath ||
    project.heroImagePath ||
    "/og/projects/placeholder.svg";

  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name,
    description,
    url,
    image: image.startsWith("http") ? image : `${siteConfig.url}${image}`,
    ...(project.officialWebsite ? { sameAs: [project.officialWebsite] } : {}),
    ...(project.latitude != null && project.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: project.latitude,
            longitude: project.longitude,
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: project.address[locale] || project.address.en || undefined,
      addressLocality:
        project.districtName[locale] || project.districtName.en || undefined,
      postalCode: project.postalCode || undefined,
      addressCountry: "TH",
    },
    ...(project.developer
      ? {
          brand: {
            "@type": "Organization",
            name:
              project.developer.name[locale] || project.developer.name.en,
            url: project.developer.website || undefined,
          },
        }
      : {}),
    ...(project.totalUnits != null ? { numberOfAccommodationUnits: project.totalUnits } : {}),
  };
}

export function projectFaqSchema(
  locale: Locale,
  project: ProjectView,
): Record<string, unknown> | null {
  // Keep FAQPage entities identical to the visible FAQ section.
  const faqs = visibleProjectFaqs(locale, project.faq);

  if (!faqs.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function platformFaqSchema(
  locale: Locale,
  faqs: { question: string; answer: string }[],
): Record<string, unknown> | null {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Article schema for approved knowledge / blog content — mirrors visible fields only. */
export function articleSchema(input: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
  dateModified: string;
  datePublished?: string;
  authorName?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.name,
    description: input.description,
    url: absoluteUrl(input.locale, input.path),
    dateModified: input.dateModified,
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.authorName
      ? {
          author: {
            "@type": "Person",
            name: input.authorName,
          },
        }
      : {
          author: {
            "@type": "Organization",
            name: siteConfig.name,
          },
        }),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/og/default.svg`,
      },
    },
    inLanguage:
      input.locale === "zh" ? "zh-CN" : input.locale === "th" ? "th" : "en",
  };
}

export function developerSchema(input: {
  locale: Locale;
  developer: DeveloperView;
  name: string;
  description: string;
}) {
  const { locale, developer, name, description } = input;
  const sameAs = [developer.website, developer.facebookUrl].filter(
    (u): u is string => Boolean(u),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    legalName: developer.legalName[locale] || developer.legalName.en,
    description,
    url: absoluteUrl(locale, `/developers/${developer.slug}`),
    ...(sameAs.length ? { sameAs } : {}),
    ...(developer.logoUrl ? { logo: developer.logoUrl } : {}),
  };
}

export function districtSchema(input: {
  locale: Locale;
  name: string;
  description: string;
  slug: string;
  cityName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.locale, `/districts/${input.slug}`),
    containedInPlace: {
      "@type": "City",
      name: input.cityName || "Bangkok",
      addressCountry: "TH",
    },
  };
}
