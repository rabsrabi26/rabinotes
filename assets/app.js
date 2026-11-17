(() => {
  const grid = document.getElementById('post-grid');
  if (!grid) return;
  const posts = window.RABI_POSTS || [];
  let category = 'All';
  const search = document.getElementById('search');
  const filters = document.getElementById('filters');
  const dateLabel = s => new Date(s + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  function render() {
    const categories = [...new Set(posts.map(p => (p.category || 'Notes').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    filters.innerHTML = ['All', ...categories].map(name =>
      `<button type="button" class="filter${category === name ? ' active' : ''}" data-category="${escapeHtml(name)}">${name === 'All' ? 'All notes' : escapeHtml(name)}</button>`).join('');
    const term = (search.value || '').trim().toLowerCase();
    const shown = posts.filter(p => (category === 'All' || p.category === category) &&
      [p.title, p.description, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(term));
    grid.innerHTML = shown.map(p => `<article class="card">
      <div class="top"><span class="tag">${escapeHtml(p.category || 'Notes')}</span><time datetime="${escapeHtml(p.date)}">${dateLabel(p.date)}</time></div>
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.description)}</p>
      ${(p.tags || []).length ? `<div class="post-tags">${p.tags.map(tag => `<span class="tag plain">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
      <div class="bottom"><span>${escapeHtml(p.read)}</span><a class="go" href="/post.html?slug=${encodeURIComponent(p.slug)}">Read note &rarr;</a></div>
    </article>`).join('');
    document.getElementById('empty-state').hidden = shown.length > 0;
  }
  filters.addEventListener('click', e => {
    const b = e.target.closest('button[data-category]');
    if (!b) return;
    category = b.dataset.category;
    render();
  });
  search.addEventListener('input', render);
  render();
})();
