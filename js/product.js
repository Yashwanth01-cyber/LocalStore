(async function(){
  const products = await Y4R.loadProducts();
  const grid = document.getElementById('grid');
  const q = document.getElementById('q');
  const cat = document.getElementById('cat');
  const sort = document.getElementById('sort');
  const min = document.getElementById('min');
  const max = document.getElementById('max');
  const clear = document.getElementById('clear');

  // categories
  const cats = [...new Set(products.map(p=>p.category))].sort();
  cats.forEach(c=>{
    const o=document.createElement('option'); o.value=c; o.textContent=c; cat.appendChild(o);
  });

  // if URL has a hash (from View button), prefer that product first
  const anchorId = Number(location.hash.replace('#','')) || null;

  function apply(){
    const qq = (q.value||'').toLowerCase();
    const cc = cat.value;
    const lo = Number(min.value||0);
    const hi = Number(max.value||Infinity);

    let list = products.filter(p=>{
      const m1 = p.name.toLowerCase().includes(qq) || p.desc.toLowerCase().includes(qq);
      const m2 = !cc || p.category===cc;
      const m3 = p.price>=lo && p.price<=hi;
      return m1 && m2 && m3;
    });

    switch (sort.value){
      case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
      case 'rating-desc': list.sort((a,b)=>b.rating-a.rating); break;
      default: list.sort((a,b)=>b.rating-a.rating);
    }

    // put anchor product first if exists
    if(anchorId){
      const i = list.findIndex(p=>p.id===anchorId);
      if(i>0){ const [x]=list.splice(i,1); list.unshift(x); }
    }

    Y4R.renderCards(grid, list, { showView:false, showAdd:true });
  }

  [q,cat,sort,min,max].forEach(el=>{
    el.addEventListener(el.tagName==='INPUT'?'input':'change', apply);
  });
  clear.addEventListener('click', ()=>{
    q.value=''; cat.value=''; sort.value='pop'; min.value=''; max.value=''; apply();
  });

  apply();
})();
