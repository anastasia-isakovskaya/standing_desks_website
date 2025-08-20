document.addEventListener("DOMContentLoaded", () => {
  initSlideshow();
  initModal();
  initCart();
  initSearch();
});

function initSlideshow() {
  let slideIndex = 1;
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");
  let timer;

  if (slides.length === 0) return;

  function show(n) {
    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }
    Array.from(slides).forEach(s => s.style.display = "none");
    Array.from(dots).forEach(d => d.classList.remove("active"));
    slides[slideIndex-1].style.display = "block";
    if (dots[slideIndex-1]) dots[slideIndex-1].classList.add("active");
  }

  function plus(n) {
    clearInterval(timer);
    slideIndex += n;
    show(slideIndex);
    timer = setInterval(() => plus(1), 8000);
  }

  document.querySelectorAll(".prev").forEach(el =>
    el.addEventListener("click", () => plus(-1))
  );
  document.querySelectorAll(".next").forEach(el =>
    el.addEventListener("click", () => plus(1))
  );
  Array.from(dots).forEach((dot, i) =>
    dot.addEventListener("click", () => {
      clearInterval(timer);
      slideIndex = i + 1;
      show(slideIndex);
      timer = setInterval(() => plus(1), 8000);
    })
  );

  show(slideIndex);
  timer = setInterval(() => plus(1), 8000);
}

function initModal() {
  window.setTimeout(() => {
    const m = document.getElementById("helloModal");
    if (m) m.style.display = "block";
  }, 1000);
  
  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const modal = document.getElementById("helloModal");
      if (modal) modal.style.display = "none";
    });
  }
  
  window.addEventListener("click", e => {
    if (e.target.id === "helloModal") {
      e.target.style.display = "none";
    }
  });
}

function initCart() {
  const badge = document.getElementById("cart-count");

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (badge) badge.textContent = cart.length;
  }

  function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const container = document.getElementById("basket-items");
    const actions = document.querySelector(".basket-actions");
    
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = "<p>Your cart is empty.</p>";
      if (actions) actions.style.display = "none";
      return;
    }

    let html = cart.map((item, i) => `
      <div class="cart-item" data-index="${i}">
        <span>${item.name} (€${item.price.toFixed(2)})</span>
        <button class="remove-from-cart">×</button>
      </div>
    `).join("");

    const total = cart.reduce((sum, i) => sum + i.price, 0).toFixed(2);
    html += `<div class="cart-total"><strong>Total: €${total}</strong></div>`;
    container.innerHTML = html;
    
    if (actions) actions.style.display = "flex";

    container.querySelectorAll(".remove-from-cart").forEach(btn =>
      btn.addEventListener("click", e => {
        const idx = +e.target.closest(".cart-item").dataset.index;
        cart.splice(idx, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        updateCartCount();
      })
    );
  }

  function addToCart(item) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert(`${item.name} added to your cart.`);
  }

  const clearBtn = document.getElementById("clear-basket");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem("cart");
      renderCart();
      updateCartCount();
    });
  }

  document.querySelectorAll(".add-to-basket").forEach(btn =>
    btn.addEventListener("click", () => {
      const box = btn.closest(".floating-box");
      if (!box) return;
      
      const id = box.id || box.dataset.id;
      const nameElement = box.querySelector("p strong");
      const priceElement = box.querySelector(".price");
      
      if (!nameElement || !priceElement) {
        console.error("Could not find product name or price");
        return;
      }
      
      const name = nameElement.textContent;
      const priceText = priceElement.textContent;
      const price = parseFloat(priceText.replace("€", "").replace(",", "."));
      
      if (isNaN(price)) {
        console.error("Invalid price format");
        return;
      }
      
      addToCart({ id, name, price });
    })
  );

  updateCartCount();
  renderCart();
}

function initSearch() {
  const input = document.getElementById("search-input");
  const button = document.getElementById("search-button");
  
  if (!input || !button) return;

  function performSearch() {
    const term = input.value.trim();
    if (!term) return;
    
    const hist = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    hist.push({ term, when: new Date().toISOString() });
    localStorage.setItem("searchHistory", JSON.stringify(hist));
    
    const products = document.querySelectorAll(".floating-box");
    let found = 0;
    
    products.forEach(product => {
      const name = product.querySelector("p strong").textContent.toLowerCase();
      const description = product.querySelector("p:nth-child(3)").textContent.toLowerCase();
      const searchTerm = term.toLowerCase();
      
      if (name.includes(searchTerm) || description.includes(searchTerm)) {
        product.style.display = "block";
        product.style.border = "2px solid #007bff";
        found++;
      } else {
        product.style.display = "none";
      }
    });
    
    if (found === 0) {
      alert(`No products found for "${term}"`);
      products.forEach(product => {
        product.style.display = "block";
        product.style.border = "";
      });
    } else {
      alert(`Found ${found} product(s) for "${term}"`);
    }
  }

  button.addEventListener("click", performSearch);
  
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });
  
  input.addEventListener("input", () => {
    if (input.value.trim() === "") {
      const products = document.querySelectorAll(".floating-box");
      products.forEach(product => {
        product.style.display = "block";
        product.style.border = "";
      });
    }
  });
}