import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCheckCircle, FaLeaf, FaWater, FaGlobe, FaFacebook, FaInstagram,
  FaTwitter, FaChevronRight, FaUserTie, FaStar, FaSeedling, FaPaw,
  FaFish, FaSearch, FaTimes, FaRedo
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

const icons = {
  FaLeaf, FaWater, FaGlobe, FaFacebook, FaInstagram, FaTwitter,
  FaUserTie, FaSeedling, FaPaw, FaFish
};
const filters = [
  ['all', 'Featured Feed'], ['agriculture', 'Agriculture'],
  ['nutrition', 'Nutrition'], ['leadership', 'MD Profile']
];

function Icon({ item, className = '' }) {
  const source = item.image || {
    VanshLogo: './logo.webp', MllLogo: './mll-logo.webp',
    GaonLogo: './gaon-dehat-logo.webp'
  }[item.icon];
  if (source) {
    return <img className={`brand-icon ${className}`} src={source}
      alt={item.name || item.title || { VanshLogo: 'Vansh Group logo', MllLogo: 'MLL Agro Industries logo', GaonLogo: 'Gaon Dehat logo' }[item.icon] || 'Company logo'} width="64" height="64" loading="lazy" decoding="async" />;
  }
  const Symbol = icons[item.icon] || FaGlobe;
  return <Symbol className={className} aria-hidden="true" />;
}

function LinkRow({ link, onQr }) {
  return (
    <div className="post-link-item colored-box" style={{ background: link.color, color: '#fff' }}>
      <a className="link-destination" href={link.url} target="_blank" rel="noopener noreferrer">
        <div className="link-left">
          <div className="link-icon-wrapper"><Icon item={link} /></div>
          <span>{link.label}</span>
        </div>
        <FaChevronRight className="link-right" aria-hidden="true" />
      </a>
      <button type="button" className="qr-container" onClick={() => onQr(link)}
        aria-label={`Show QR code for ${link.label}`} title={`Show QR code for ${link.label}`}>
        <QRCodeSVG value={link.url} size={80} level="H" marginSize={1} title={`QR code for ${link.label}`} />
      </button>
    </div>
  );
}

function Loading() {
  return <div className="hub-loading" role="status" aria-label="Loading company profiles">
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-link" />
  </div>;
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [qrLink, setQrLink] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let cancelled = false;
    setError('');
    fetch('./data.json', { cache: 'no-cache', signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Could not load company profiles.');
        return response.json();
      })
      .then(json => {
        if (!json.profile || !Array.isArray(json.companies) || !Array.isArray(json.posts)) {
          throw new Error('Could not load company profiles.');
        }
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError('Company profiles could not be loaded. Please try again.');
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  useEffect(() => {
    if (!qrLink) return;
    const previousOverflow = document.body.style.overflow;
    const container = document.querySelector('.app-container');
    const back = document.querySelector('.social-back-button');
    const skip = document.querySelector('.social-skip-link');
    const backgrounds = [container, back, skip].filter(Boolean);
    backgrounds.forEach(element => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      backgrounds.forEach(element => { element.inert = false; });
    };
  }, [qrLink]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return new Set((data?.posts || []).filter(post => {
      if (category !== 'all' && post.category !== category) return false;
      const text = [post.title, post.subtitle, post.body,
        ...post.links.flatMap(link => [link.label, link.url])].join(' ').toLowerCase();
      return !needle || text.includes(needle);
    }).map(post => post.id));
  }, [data, query, category]);

  function resetFilters() {
    setQuery('');
    setCategory('all');
  }

  return <>
    <img src="./bg-leaf.webp" className="bg-3d-element leaf-3d" alt="" width="600" height="600" decoding="async" />
    <img src="./bg-seed.webp" className="bg-3d-element seed-3d" alt="" width="600" height="600" loading="lazy" decoding="async" />
    <div className="app-container">
      <nav className="hub-brand" aria-label="Vansh Group">Vansh Group Hub</nav>
      <header className="profile-header">
        <div className="cover-photo" style={{ backgroundImage: 'url("./cover.webp")' }}>
          <div className="cover-overlay" />
          {data && <div className="poster-content">
            <h2 className="poster-tagline">{data.profile.tagline}</h2>
            <div className="poster-companies">
              {data.companies.map(company => <span key={company.id} className="poster-company-name">{company.name}</span>)}
            </div>
            <div className="poster-products">
              {data.posterProducts.map(product => <div key={product.name} className="poster-product-card">
                <img src={product.image} alt={product.name} width="160" height="160" decoding="async" />
                <span className="poster-product-name">{product.name}</span>
              </div>)}
            </div>
          </div>}
        </div>
        <div className="avatar-wrapper"><div className="avatar-inner">
          <img src="./logo.webp" alt="Vansh Group Logo" className="avatar-img" width="140" height="140" decoding="async" />
        </div></div>
        <div className="profile-info">
          {data ? <>
            <div className="profile-name-container">
              <h1 className="profile-name">{data.profile.name}</h1>
              {data.profile.isVerified && <FaCheckCircle className="verified-badge" aria-label="Official group" />}
            </div>
            <p className="profile-bio">{data.profile.bio}</p>
            <div className="profile-stats clay-box">
              {data.profile.stats.map(stat => <span key={stat.label} className="stat"><strong>{stat.value}</strong> {stat.label}</span>)}
            </div>
          </> : !error && <Loading />}
        </div>
      </header>

      {data?.heroProduct && <section className="hero-section" aria-label="Featured product">
        <div className="hero-product clay-box">
          <div className="hero-product-image-container">
            <video src={data.heroProduct.video} poster="./hero-product-supreme.webp" data-playback="manual"
              controls loop muted playsInline preload="none" className="hero-product-video"
              aria-label="Featured product video" />
          </div>
          <div className="hero-product-info">
            <div className="hero-badge"><FaStar aria-hidden="true" /> {data.heroProduct.subtitle}</div>
            <h2>{data.heroProduct.title}</h2>
            <p>{data.heroProduct.description}</p>
            <a href={data.heroProduct.buttonUrl} target="_blank" rel="noopener noreferrer" className="clay-btn hero-btn">
              {data.heroProduct.buttonText} <FaChevronRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>}

      <main className="feed" id="main-content" tabIndex="-1">
        {error && <div className="hub-error" role="alert">
          <p>{error}</p>
          <button type="button" className="clay-btn" onClick={() => setAttempt(value => value + 1)}><FaRedo aria-hidden="true" /> Try Again</button>
        </div>}
        {data && <>
          <section className="companies-section" aria-label="Our companies">
            <h2 className="section-title">Our Companies</h2>
            <div className="companies-grid">
              {data.companies.map(company => <a key={company.id} href={company.url} target="_blank" rel="noopener noreferrer" className="company-card clay-box">
                <div className="company-icon" style={{ color: company.color }}><Icon item={company} /></div>
                <div className="company-details"><h3>{company.name}</h3><span>{company.focus}</span></div>
              </a>)}
            </div>
          </section>

          <div className="directory-controls">
            <nav className="tabs-container" aria-label="Company and profile categories">
              {filters.map(([value, label]) => <button key={value} type="button"
                className={`clay-btn${category === value ? ' active' : ''}`}
                aria-pressed={category === value} onClick={() => setCategory(value)}>{label}</button>)}
            </nav>
            <div className="directory-search">
              <FaSearch aria-hidden="true" />
              <label htmlFor="company-search" className="hub-sr-only">Search companies and profiles</label>
              <input id="company-search" type="search" value={query} onChange={event => setQuery(event.target.value)}
                placeholder="Search company, handle or website" autoComplete="off" />
              {query && <button type="button" title="Clear search" aria-label="Clear search" onClick={() => setQuery('')}><FaTimes aria-hidden="true" /></button>}
            </div>
          </div>
          <p className="directory-count" role="status" aria-live="polite">{matches.size} {matches.size === 1 ? 'profile group' : 'profile groups'}</p>
          {!matches.size && <div className="directory-empty"><p>No matching companies or profiles.</p><button type="button" className="clay-btn" onClick={resetFilters}>Clear Filters</button></div>}
          {data.posts.map(post => <article key={post.id} className={`post-card clay-box${post.category === 'leadership' ? ' md-profile' : ''}`}
            hidden={!matches.has(post.id)} aria-labelledby={`heading-${post.id}`}>
            <div className="post-header">
              <div className={`post-avatar ${post.type}`}><Icon item={post} /></div>
              <div className="post-author-info"><h2 id={`heading-${post.id}`}>{post.title}</h2><p>{post.subtitle}</p></div>
            </div>
            <div className="post-body"><p>{post.body}</p></div>
            <div className="post-links">{post.links.map(link => <LinkRow key={link.url} link={link} onQr={setQrLink} />)}</div>
          </article>)}
        </>}
      </main>
      <footer className="app-footer">
        <div className="footer-logo">Vansh Group</div>
        <p className="footer-text">&copy; {new Date().getFullYear()} Vansh Group of Companies. All rights reserved.</p>
        <p className="footer-text footer-location">Empowering farmers in Barabanki, Uttar Pradesh, India</p>
      </footer>
    </div>
    {qrLink && <div className="qr-modal-overlay" onClick={() => setQrLink(null)}>
      <div className="qr-modal-content" onClick={event => event.stopPropagation()}>
        <button type="button" className="qr-modal-close" onClick={() => setQrLink(null)} aria-label="Close QR code dialog" title="Close"><FaTimes aria-hidden="true" /></button>
        <h3>Scan QR Code</h3>
        <div className="qr-modal-code"><QRCodeSVG value={qrLink.url} size={250} level="H" marginSize={4} title={`QR code for ${qrLink.label}`} /></div>
        <p>Scan to visit {qrLink.label}</p>
        <a href={qrLink.url} target="_blank" rel="noopener noreferrer" className="clay-btn qr-open-link">Open Profile <FaChevronRight aria-hidden="true" /></a>
      </div>
    </div>}
  </>;
}
