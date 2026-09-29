# MLL Agro Industries SEO Research
Audit: 29 September 2026. Priority: fertilizer and organic agro-input inquiries.
This report replaces the June baseline. No first-position, indexing-time or numerical Lighthouse-score guarantee is made.

## Evidence and Baseline
Read from the signed-in Google Search Console property for https://mllagroindustries.com/:
- Performance, 27 June-26 September: 338 clicks, 5.44K impressions, 6.2% CTR, average position 6.6.
- Average position covers all queries, predominantly branded; it is not the rank for "fertilizer manufacturer".
- Top branded queries: "mll agro industries pvt ltd" 80 clicks/351 impressions; "mll industries" 19/73; "mll agro" 12/53.
- Homepage: 237 clicks/1,496 impressions. Catalog: 21/615. About: 13/729. Contact: 13/473.
- Fertilizer manufacturer page: 7/244. Fish feed: 9/382. Cattle feed: 9/384.
- Indexing report last updated 21 September: 57 indexed, 17 discovered but not indexed, 4 alternate pages with proper canonical. Canonical alternates are not automatically errors.
- Product snippets report last updated 27 September: 6 invalid, 3 valid; missing offers/review/aggregateRating is the critical issue.
- Merchant listings: 3 valid, 0 invalid. Breadcrumbs: 12 valid, 0 invalid.
- Core Web Vitals: insufficient field data for both mobile and desktop.
- Public homepage returned HTTP 200. PageSpeed API returned HTTP 429 quota exhausted: no lab score claimed.

## Research Findings
1. Branded demand already exists. MLL should be the main site identity, with Vansh Group identified as its parent, rather than mixing sibling-company identities in sameAs.
2. Several discovered product URLs depended on client-side catalog rendering. Category-to-product links and first-response content deserve priority over adding more near-identical city pages.
3. Homepage and broad category markup contained incomplete Product objects. Do not invent ratings or offers to remove the warning.
4. Existing manufacturer pages contained repetitive generic copy and invisible FAQ markup. Added buyer-focused product links and visible questions where useful.
5. Search results include the group's [MLL company page](https://vanshfeeds.com/mll-agro-industries-pvt-ltd/) as well as directories. Preserve the group relationship while differentiating MLL's own commercial pages.
6. Regional comparison sites include [Gentox Agrotech](https://www.gentoxagrotech.co.in/), [Ganga Power Corporation](https://www.gangapowercorp.co.in/) and [SJ Organics wholesale](https://sjorganics.in/wholesale). Their category/product specificity informs information architecture, not copied text or unverifiable superiority claims. No search-volume or keyword-difficulty estimates were obtained.

## Keyword and Intent Map
| Intent | Primary page | Supporting content |
| --- | --- | --- |
| MLL Agro Industries / MLL Industries / MLL Agro | / | Legal business identity, product focus, factory/contact |
| Fertilizer manufacturer Uttar Pradesh / Barabanki | fertilizer-manufacturer-uttar-pradesh.html | Actual product range, bulk quotation requirements |
| Organic fertilizer / organic manure supplier | organic-fertilizers.html | Two catalog products, specifications and packing |
| Micronutrient fertilizer / zinc / boron | micronutrient-fertilizers.html | Ten catalog products with distinct detail URLs |
| Bio fertilizer manufacturer India | bio-fertilizer-manufacturer-india.html | Existing catalog entries, product-label confirmation |
| Agricultural input manufacturer / dealer inquiry | agricultural-inputs-manufacturer.html | Category links and inquiry route |
| Specific product and packing searches | product-detail.html?id=... | Server-rendered product, image, specs, price when listed |
| Factory location / office / phone | contact.html | Consistent address, public Maps link, existing business phone |

Lucknow is a nearby service market, not a claimed second factory. Do not create fake offices or duplicate location pages.

## Local SEO
The supplied Maps short link was an expired live-location share, not a permanent business profile link. It was not published.
Public listing identified: [MLL Agro Industries Pvt Ltd](https://www.google.com/maps?cid=14349167848763502616).
- Address: 140/158, Village Palia Masudpur, Tehsil Nawabganj, Barabanki, Uttar Pradesh 225305, India.
- Public business coordinates: 27.1613274, 81.2670255.
- Phone and website were absent from the public listing; the interface offered "Claim this business".
- Site address, map embed and Organization/LocalBusiness markup now use this public listing.
- Existing site phone +91 9670252525 and landline +91 5248 296699 retained; no newly inferred number.
- Business Profile ownership/verification needs the authorized owner's participation if Google requires it. No profile ownership, public edit, review or response was submitted.
- After owner access: add https://mllagroindustries.com/, confirmed business phone, accurate category/hours and current factory/product photos. Request genuine reviews from real customers; no incentives, fake reviews or review gating.

## Measurement and Follow-Up
After deployment, test live pages and resubmit the sitemap; request indexing only for the homepage and the most important updated category pages. Google's recrawl and reporting are asynchronous.
- Days 1-14: inspect representative product URLs, watch discovered-not-indexed counts and live Product validation.
- Days 15-30: compare non-branded fertilizer query impressions/CTR and landing-page clicks with the preceding 28 days. Separate brand queries.
- Days 30-90: prioritize pages gaining impressions; improve actual product data, packing, original factory photos and verifiable documentation. Measure qualified phone/WhatsApp/form inquiries, not rankings alone.
- Add conversion measurement only with an agreed analytics/privacy configuration. No third-party tracking was added.
- Keep catalog prices, product labels, certifications and availability current. Existing claims/specifications were not independently certified by this SEO work.
- Dependency audit also surfaced pre-existing advisories in multer (high), qs (moderate), body-parser (low). These are outside this SEO change and need a separate backend regression-tested update; no blanket npm audit fix was run.

## Primary Guidance
- [Google: crawlable ecommerce navigation](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)
- [Google: product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google: product structured data choices](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Google: site name markup](https://developers.google.com/search/docs/appearance/site-names)
- [Google: local ranking and complete profile information](https://support.google.com/business/answer/7091?hl=en)

Technical eligibility does not guarantee rich-result display. FAQ markup is not a promise of FAQ rich results for a commercial fertilizer site.
