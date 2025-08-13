(async function(){
  const products = await Y4R.loadProducts();
  const fmt = Y4R.fmt;
  const table = document.getElementById('cartTable');
  const subEl = document.getElementById('subtotal');
  const shipEl = document.getElementById('shipping');
  const totEl = document.getElementById('total');
  const msg = document.getElementById('orderMsg');

  const byId = id => products.find(p=>p.id===id);

  function row(p, qty){
    const line = p.price * qty;
    return `
      <div class="cart-row">
        <img src="${p.image}" alt="${p.name}" onerror="Y4R._fallback(event)"/>
        <div><strong>${p.name}</strong><div class="muted">${p.category}</div></div>
        <div>${fmt(p.price)}</div>
        <div class="qty">
          <button data-dec="${p.id}">−</button>
          <input data-qty="${p.id}" type="number" min="1" value="${qty}">
          <button data-inc="${p.id}">+</button>
          <div class="muted">= ${fmt(line)}</div>
        </div>
        <button data-rem="${p.id}" title="Remove">✖</button>
      </div>`;
  }

  function render(){
    const cart = Y4R.getCart();
    if(!cart.length){
      table.innerHTML = `<p class="muted">Your cart is empty. <a href="product.html">Shop now</a>.</p>`;
      subEl.textContent = fmt(0); shipEl.textContent = fmt(0); totEl.textContent = fmt(0);
      Y4R.updateBadge();
      return;
    }

    const rows = cart.map(it => ({ p: byId(it.id), qty: it.qty })).filter(x=>!!x.p);
    table.innerHTML = rows.map(({p,qty})=>row(p,qty)).join("");

    const subtotal = rows.reduce((s,{p,qty})=>s+p.price*qty,0);
    const shipping = subtotal>999 ? 0 : 49;
    const total = subtotal + shipping;
    subEl.textContent = fmt(subtotal); shipEl.textContent = fmt(shipping); totEl.textContent = fmt(total);

    // bind controls
    table.querySelectorAll("[data-dec]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = Number(b.dataset.dec);
        const c = Y4R.getCart(); const it = c.find(i=>i.id===id);
        if(it){ it.qty = Math.max(1, it.qty-1); Y4R.setCart(c); render(); }
      });
    });
    table.querySelectorAll("[data-inc]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = Number(b.dataset.inc);
        const c = Y4R.getCart(); const it = c.find(i=>i.id===id);
        if(it){ it.qty += 1; Y4R.setCart(c); render(); }
      });
    });
    table.querySelectorAll("[data-qty]").forEach(inp=>{
      inp.addEventListener("change", ()=>{
        const id = Number(inp.dataset.qty);
        const c = Y4R.getCart(); const it = c.find(i=>i.id===id);
        if(it){ it.qty = Math.max(1, Number(inp.value||1)); Y4R.setCart(c); render(); }
      });
    });
    table.querySelectorAll("[data-rem]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = Number(btn.dataset.rem);
        const c = Y4R.getCart().filter(i=>i.id!==id);
        Y4R.setCart(c); render();
      });
    });

    // checkout
    document.getElementById('checkoutBtn').onclick = ()=>{
      const orderId = "Y4R" + Date.now();
      localStorage.setItem("lastOrder", JSON.stringify({
        id: orderId, total, at: new Date().toISOString(), items: rows
      }));
      Y4R.setCart([]);
      render();
      msg.innerHTML = `✅ Order placed! ID <strong>${orderId}</strong> (demo).`;
    };

    Y4R.updateBadge();
  }

  document.addEventListener('DOMContentLoaded', render);
})();
