(() => {
 const root=document.documentElement, themeButton=document.getElementById('theme-toggle');
 const saved=localStorage.getItem('rabinotes-theme');
 if(saved) root.dataset.theme=saved;
 else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) root.dataset.theme='dark';
 themeButton?.addEventListener('click',()=>{const next=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=next;localStorage.setItem('rabinotes-theme',next);});
 const menu=document.getElementById('menu-toggle'),nav=document.querySelector('.nav');
 menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
 document.getElementById('year').textContent=new Date().getFullYear();
 const grid=document.getElementById('post-grid');
 if(!grid)return;
 const posts=window.RABI_POSTS||[];let category='All';const search=document.getElementById('search');
 const dateLabel=s=>new Date(s+'T00:00:00').toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'});
 const filters=document.getElementById('filters');
 const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function render(){
  const categories=[...new Set(posts.map(p=>(p.category||'Notes').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  filters.innerHTML=['All',...categories].map(name=>`<button class="filter${category===name?' active':''}" data-category="${escapeHtml(name)}">${name==='All'?'All notes':escapeHtml(name)}</button>`).join('');
  const term=(search.value||'').trim().toLowerCase();
  const shown=posts.filter(p=>(category==='All'||p.category===category)&&[p.title,p.description,p.category,...(p.tags||[])].join(' ').toLowerCase().includes(term));
  grid.innerHTML=shown.map(p=>`<article class="post-card"><div class="post-top"><span class="tag">${escapeHtml(p.category||'Notes')}</span><time datetime="${escapeHtml(p.date)}">${dateLabel(p.date)}</time></div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p>${(p.tags||[]).length?`<div class="post-tags">${p.tags.map(tag=>`<span class="topic-tag">${escapeHtml(tag)}</span>`).join('')}</div>`:''}<div class="post-bottom"><span>${escapeHtml(p.read)}</span><a class="read-link" href="/post.html?slug=${encodeURIComponent(p.slug)}">Read note ↗</a></div></article>`).join('');
  document.getElementById('empty-state').hidden=shown.length>0;
 }
 filters.addEventListener('click',e=>{const b=e.target.closest('button[data-category]');if(!b)return;category=b.dataset.category;render();});
 search.addEventListener('input',render);render();
})();