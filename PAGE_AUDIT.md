# Page Audit - Vansh Group of Companies

Date: 2026-06-11

## Summary

The site now has a crawlable page set for branded, manufacturer and local SEO searches. Core pages support brand trust and conversion. New landing pages target manufacturer keywords directly.

## Core Pages

| Page | Primary Intent | SEO Status | Notes |
| --- | --- | --- | --- |
| `index.html` | Branded homepage and group overview | Improved | Added canonical, robots, OG, Twitter, image preload, Organization/LocalBusiness schema and manufacturer hub links. |
| `about.html` | Company/entity trust | Improved | Added title rewrite, meta description, canonical and social metadata. |
| `products.html` | Product category discovery | Improved | Added canonical, social metadata, Product ItemList schema and breadcrumb schema. |
| `product-detail.html` | Product-specific search and inquiry | Improved | Dynamic product title, meta description, canonical URL, social image and Product JSON-LD now update per product. |
| `infrastructure.html` | Manufacturing credibility | Improved | Added manufacturer-focused title, description, canonical and social metadata. |
| `quality.html` | Quality assurance trust | Improved | Added quality/manufacturing title, description, canonical and social metadata. |
| `contact.html` | Local/contact conversion | Improved | Added Barabanki-focused title, description, canonical and social metadata. |
| `business.html` | B2B lead conversion | Improved | Added canonical and social metadata. |
| `vendor.html` | Dealer/distributor conversion | Improved | Added canonical and social metadata. |
| `grievance.html` | Support and trust | Improved | Added canonical and social metadata. |
| `career.html` | Employer/supporting entity page | Improved | Added canonical and social metadata. |

## Landing Pages

| Page | Target Keyword | Location Target | Schema |
| --- | --- | --- | --- |
| `fertilizer-manufacturer-uttar-pradesh.html` | Fertilizer Manufacturer in Uttar Pradesh | Barabanki, Lucknow, Uttar Pradesh, India | Product, FAQ, Breadcrumb |
| `pesticide-manufacturer-uttar-pradesh.html` | Pesticide Manufacturer in Uttar Pradesh | Barabanki, Lucknow, Uttar Pradesh, India | Product, FAQ, Breadcrumb |
| `fish-feed-manufacturer-uttar-pradesh.html` | Fish Feed Manufacturer in Uttar Pradesh | Barabanki, Lucknow, Uttar Pradesh, India | Product, FAQ, Breadcrumb |
| `cattle-feed-manufacturer-uttar-pradesh.html` | Cattle Feed Manufacturer in Uttar Pradesh | Barabanki, Lucknow, Uttar Pradesh, India | Product, FAQ, Breadcrumb |
| `bio-fertilizer-manufacturer-india.html` | Bio Fertilizer Manufacturer in India | India, Uttar Pradesh, Barabanki | Product, FAQ, Breadcrumb |
| `agricultural-inputs-manufacturer.html` | Agricultural Inputs Manufacturer | Barabanki, Lucknow, Uttar Pradesh, India | Manufacturer, FAQ, Breadcrumb |

## Crawl and Indexing

| Asset | Status | Notes |
| --- | --- | --- |
| `robots.txt` | Added | Allows public site crawl, disallows admin page and API routes, references sitemap. |
| `sitemap.xml` | Added | Includes core pages, six landing pages and representative product detail URLs. |
| Canonicals | Added | Canonical coverage exists on all core and landing HTML pages. |
| Structured data | Added | Static JSON-LD parsed successfully during local validation. |

## Content Gaps Remaining

- Add more unique product-detail content for products that still use generic descriptions.
- Add real certifications, licenses or quality documents if available.
- Add business photos with descriptive filenames and alt text after final image selection.
- Add Google Business Profile links once verified.
- Add cross-domain links from `vanshfeeds.com` and `fishgoldindustries.com` back to the relevant group/company pages.

## Performance Risk Areas

- Large PNG/JPG assets may affect LCP on mobile.
- External Font Awesome and Google Fonts add network dependency.
- Final score depends on Hostinger compression, cache and CDN settings.

## Validation Performed

- `node --check server.js`
- `node --check index.js`
- Static JSON-LD parse check across HTML files.
- `xmllint --noout sitemap.xml`
- Canonical coverage check across HTML files.
