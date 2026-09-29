(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MLLProductSeo = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const origin = 'https://mllagroindustries.com';
  const categories = {
    fertilizer: ['Fertilizers & Nutrition', 'fertilizer-manufacturer-uttar-pradesh.html'],
    agro: ['Agricultural Inputs', 'agricultural-inputs-manufacturer.html'],
    feed: ['Animal & Aqua Feed', 'products.html#cat-feed']
  };

  function slugify(value) {
    return String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function slug(product) {
    return product.slug || slugify(product.displayName || product.name);
  }

  function matches(product, id) {
    return [product.slug, product.id, slugify(product.name), slugify(product.displayName)]
      .filter(Boolean).some(value => String(value).toLowerCase() === String(id).toLowerCase());
  }

  function offer(product, url) {
    // Only an explicitly listed INR unit price can become an offer. Stock is unknown.
    const price = String(product.price || '').match(/^(?:\u20b9|INR\s*)\s*((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)\s*\/\s*([A-Za-z ]+)$/);
    if (!price || Number(price[1].replace(/,/g, '')) <= 0) return null;
    return {
      '@type': 'Offer', url, priceCurrency: 'INR', price: price[1].replace(/,/g, ''),
      seller: { '@type': 'Organization', name: 'MLL Agro Industries Pvt. Ltd.', '@id': origin + '/#organization' },
      priceSpecification: {
        '@type': 'UnitPriceSpecification', priceCurrency: 'INR', price: price[1].replace(/,/g, ''), unitText: price[2].trim()
      }
    };
  }

  function metadata(product, localized) {
    const info = localized || product;
    const name = info.displayName || info.name || product.displayName || product.name;
    const canonical = origin + '/product-detail.html?id=' + encodeURIComponent(slug(product));
    const description = String(info.shortDescription || info.description || name + ' product information and bulk inquiries from MLL Agro Industries, Barabanki.').replace(/\s+/g, ' ').trim().slice(0, 200);
    const image = new URL(product.image || 'assets/logo_en.png', origin + '/').href;
    const category = categories[product.catalogGroup] || categories.agro;
    const productOffer = offer(product, canonical);
    const page = {
      '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name,
      description, isPartOf: { '@id': origin + '/#website' },
      breadcrumb: { '@id': canonical + '#breadcrumb' }
    };
    const graph = [page, {
      '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'MLL Agro Industries', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: category[0], item: origin + '/' + category[1] },
        { '@type': 'ListItem', position: 3, name, item: canonical }
      ]
    }];
    if (productOffer) {
      page.mainEntity = { '@id': canonical + '#product' };
      graph.push({
        '@type': 'Product', '@id': canonical + '#product', name, description, image, url: canonical,
        category: info.category || product.category || category[0], offers: productOffer
      });
    }
    return { name, title: name + ' | MLL Agro Industries', description, canonical, image, category, schema: { '@context': 'https://schema.org', '@graph': graph } };
  }

  return { origin, categories, slug, matches, metadata, offer };
}));
