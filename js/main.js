// Y4R global helpers
const Y4R = (() => {
  const LS = {
    get: (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
  };

  const fmt = x => "₹" + x.toLocaleString("en-IN");

  async function loadProducts(){
    // Load from products.json, with graceful fallback
    try{
      const res = await fetch('data/products.json', { cache: 'no-store' });
      if(!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }catch(e){
      console.warn('Falling back to empty product list', e);
      return [];
    }
  }

  function getCart(){ return LS.get("cart", []); }
  function setCart(v){ LS.set("cart", v); updateBadge(); }
  function updateBadge(){
    const el = document.getElementById("cartBadge");
    if(!el) return;
    el.textContent = getCart().reduce((s,i)=>s+i.qty,0);
  }
  function addToCart(id, qty=1){
    const c = getCart(); const it = c.find(i=>i.id===id);
    it ? it.qty += qty : c.push({id, qty});
    setCart(c);
  }
  document.addEventListener("DOMContentLoaded", updateBadge);

  function fallbackImg(e){
    e.target.src = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="#1a2440"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="#9fb3c8">Image</text></svg>');
  }

  // Render product cards
  function renderCards(host, list, opts={}){
    const { showView=true, showAdd=true } = opts;
    host.innerHTML = list.map(p=>`
      <article class="card">
        <a ${showView ? `href="product.html#${p.id}"` : ""}>
          <img src="${p.image}" alt="${p.name}" onerror="Y4R._fallback(event)"/>
        </a>
        <div class="card-body">
          <div class="badge">${p.category}</div>
          <h3>${p.name}</h3>
          <p class="muted">${p.desc}</p>
          <p>⭐ ${p.rating} • <span class="muted">Stock: ${p.stock}</span></p>
          <p class="price">${fmt(p.price)}</p>
          <div class="actions">
            ${showView ? `<a class="btn ghost" href="product.html#${p.id}">View</a>` : ``}
            ${showAdd ? `<button class="btn primary" data-add="${p.id}">Add to Cart</button>` : ``}
          </div>
        </div>
      </article>
    `).join("");

    host.querySelectorAll("[data-add]").forEach(b=>{
      b.addEventListener("click", e=>{
        addToCart(Number(e.currentTarget.dataset.add),1);
        e.currentTarget.textContent = "Added ✓";
        setTimeout(()=> e.currentTarget.textContent="Add to Cart", 900);
      });
    });
  }

  return { fmt, loadProducts, renderCards, getCart, setCart, addToCart, updateBadge, _fallback: fallbackImg };
})();
