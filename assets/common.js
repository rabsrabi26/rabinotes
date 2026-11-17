/* Shared by every public page: footer year and command-palette entries. */
(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  if (!window.RabsBrand) return;
  const posts = window.RABI_POSTS || [];
  RabsBrand.palette.setItems([
    { group: 'This site', label: 'Home', hint: '/', href: '/' },
    { group: 'This site', label: 'Writing', hint: '#writing', href: '/#writing' },
    { group: 'This site', label: 'About', hint: '#about', href: '/#about' }
  ].concat(posts.map(p => ({
    group: 'Notes',
    label: p.title,
    hint: p.date,
    href: '/post.html?slug=' + encodeURIComponent(p.slug),
    aliases: [p.category].concat(p.tags || [])
  }))));
})();
