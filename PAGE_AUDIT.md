# Page Audit
29 September 2026. Scope: MLL website and its existing 57-product catalog.

| Page/group | Finding | Implemented |
| --- | --- | --- |
| Homepage | Vansh Group title/schema diluted MLL identity; incomplete Product category objects | MLL-first title/H1/description, WebSite name, Organization/LocalBusiness, parent group, category links |
| About | Missing dedicated MLL entity/page relationship | MLL title/description, AboutPage and consistent business identity |
| Contact | Generic address and map for a different group location | Full public factory/head-office address, correct public pin/embed, ContactPage |
| Catalog | Product cards created primarily by JavaScript | 24 initial cards in HTML, persistent 57-product linked directory, CollectionPage/ItemList, category links |
| Organic fertilizers | No focused collection page | Two real catalog products, packing/quotation guidance, category links |
| Micronutrients | No focused collection page | Ten relevant zinc/boron/micronutrient products, buying criteria and detail links |
| Fertilizer manufacturer | Generic category copy and FAQ not visible | Specific product/category links, quotation information, matching visible FAQs |
| Bio fertilizer manufacturer | SEO-oriented rather than buyer-oriented wording | Actual range and product-label guidance, visible FAQs |
| Agricultural inputs | Overbroad Product/Offer catalog markup | CollectionPage, category links, visible FAQ |
| Fish feed, cattle feed, pesticide manufacturer | FAQ markup without matching visible Q&A | Remove unsupported FAQ objects; preserve relevant Service/Breadcrumb markup |
| Product detail, 57 URLs | Only metadata in initial response; rest needed JS | Initial name, image, description, specs, price; one-product embedded data; shared client/server SEO logic |
| 33 priced products | Product schema could diverge between server and browser | Consistent Product + explicit catalog INR unit Offer, no fabricated stock or reviews |
| 24 inquiry-only products | Rich Product would fail required offer/review checks | WebPage + Breadcrumb only; genuine visible product information retained |
| Missing/unknown product ID | Soft error/fallback behavior | Missing ID redirects to catalog; unknown ID is HTTP 404 + noindex |
| Aliases | Duplicate homepage/social/product URL spellings | 301 aliases to current canonical URLs; existing product slugs preserved |
| Sitemap | Manual lists/dates could drift | Build from current public pages/catalog; 77 canonical URLs, no fabricated lastmod |
| Other public HTML | Stale translation bundle and short footer address | Versioned i18n references; consistent translated address where applicable |

## Validation
- All 77 sitemap destinations return HTTP 200 locally and match their canonical tags exactly.
- Sitemap has XML declaration and protocol namespace; xmllint parsing passes and server sends application/xml.
- All internal HTML links collected from those pages resolve successfully locally.
- JSON-LD parses on static and server-rendered pages; inline JavaScript syntax checks pass.
- Desktop homepage/category and mobile category/product inspected in Chrome; checked 390px viewport for horizontal overflow and category image failures.
- Search and Show More remain functional; browser Back restores category with transition overlay hidden.
- Product inquiries and admin authentication were not submitted during preview; no test records were sent to production.
- The local Node 26 runtime cannot load the existing native SQLite binary. Public-page tests use disposable/in-memory configuration; database/admin/career flows were not claimed as re-tested. Hostinger is configured for supported Node 20.
