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
 function render(){const term=(search.value||'').trim().toLowerCase();const shown=posts.filter(p=>(category==='All'||p.category===category)&&[p.title,p.description,p.category].join(' ').toLowerCase().includes(term));grid.innerHTML=shown.map(p=>`<article class="post-card"><div class="post-top"><span class="tag">${p.category}</span><time datetime="${p.date}">${dateLabel(p.date)}</time></div><h3>${p.title}</h3><p>${p.description}</p><div class="post-bottom"><span>${p.read}</span><a class="read-link" href="/post.html?slug=${encodeURIComponent(p.slug)}">Read note ↗</a></div></article>`).join('');document.getElementById('empty-state').hidden=shown.length>0;}
 document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('button[data-category]');if(!b)return;category=b.dataset.category;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render();});
 search.addEventListener('input',render);render();
})();