/* Shared return path for public and directly opened NAS pages. */
(() => {
  const script = document.currentScript;
  if (!script || document.getElementById('portalHome')) return;
  const home = document.createElement('a');
  home.id = 'portalHome';
  home.href = script.dataset.portalHome;
  home.className = 'portal-home-link';
  home.textContent = '← 回入口';
  home.setAttribute('aria-label', '回到圖解、分析、技規與基隆市法規入口');
  const sidebar = document.querySelector('aside nav');
  const topbar = document.querySelector('.topbar');
  if (sidebar) {
    home.classList.add('nav');
    sidebar.prepend(home);
    if (globalThis.TECHNICAL_HOSTED_READONLY && !document.getElementById('keelungPortalNav')) {
      const keelung = document.createElement('a');
      keelung.id = 'keelungPortalNav';
      keelung.href = script.dataset.portalKeelung;
      keelung.className = 'nav';
      keelung.textContent = '基隆市法規 ↗';
      sidebar.append(keelung);
    }
  } else if (topbar) {
    topbar.prepend(home);
  } else {
    const nav = document.createElement('nav');
    nav.className = 'portal-return-bar';
    nav.setAttribute('aria-label', '研讀入口');
    nav.append(home);
    document.body.prepend(nav);
  }
  const style = document.createElement('style');
  style.textContent = '.portal-home-link{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:8px 14px;border:1px solid #a7b8aa;border-radius:8px;color:#244c42;background:#f8faf3;font-size:18px;font-weight:700;line-height:1.6;text-decoration:none;white-space:nowrap}.portal-home-link:hover{background:#e6eee0}.portal-home-link:focus-visible{outline:3px solid #9b702c;outline-offset:4px}aside .portal-home-link{margin-bottom:12px;color:inherit;background:transparent;border-color:currentColor}.portal-return-bar{padding:12px 24px;background:#f7f4ec}.topbar:has(>.portal-home-link){flex-wrap:wrap;gap:14px}@media(max-width:600px){.portal-home-link{font-size:17px}.topbar>.portal-home-link{flex-shrink:0}}@media print{.portal-home-link,.portal-return-bar{display:none!important}}';
  document.head.append(style);
})();
