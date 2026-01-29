const products = [
  {
    id: 1,
    name: "تيشيرت قطني فاخر",
    category: "tees",
    price: 65,
    stock: "متوفر بألوان متعددة",
  },
  {
    id: 2,
    name: "هودي شتوي مطرّز",
    category: "hoodies",
    price: 145,
    stock: "قماش ثقيل",
  },
  {
    id: 3,
    name: "كوب سيراميك بشعار",
    category: "accessories",
    price: 38,
    stock: "طباعة حرارية",
  },
  {
    id: 4,
    name: "حقيبة قماشية",
    category: "accessories",
    price: 42,
    stock: "إعادة تدوير",
  },
  {
    id: 5,
    name: "تيشيرت رياضي",
    category: "tees",
    price: 72,
    stock: "تنفس عالي",
  },
  {
    id: 6,
    name: "هودي بغطاء مزدوج",
    category: "hoodies",
    price: 160,
    stock: "مقاسات متنوعة",
  },
];

const cart = new Map();
let savedDesigns = 3;

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const libraryCount = document.getElementById("libraryCount");

const promptInput = document.getElementById("promptInput");
const customTextInput = document.getElementById("customText");
const generateBtn = document.getElementById("generateBtn");
const resetPreview = document.getElementById("resetPreview");
const saveToLibrary = document.getElementById("saveToLibrary");
const colorPalette = document.getElementById("colorPalette");
const imageUpload = document.getElementById("imageUpload");
const scaleRange = document.getElementById("scaleRange");
const rotateRange = document.getElementById("rotateRange");

const canvas = document.getElementById("designCanvas");
const ctx = canvas.getContext("2d");

let selectedColor = "#2563eb";
let textOffset = { x: 180, y: 200 };
let isDragging = false;
let uploadedImage = null;

const renderProducts = (filter) => {
  productGrid.innerHTML = "";
  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  filtered.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">${product.name}</div>
      <div>
        <h3>${product.name}</h3>
        <p class="product-meta">${product.stock}</p>
      </div>
      <div class="product-meta">
        <strong>${product.price} ر.س</strong>
        <button class="ghost" data-id="${product.id}">أضف للسلة</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
};

const updateCartUI = () => {
  cartItems.innerHTML = "";
  let subtotal = 0;

  if (cart.size === 0) {
    cartItems.innerHTML = '<div class="empty">سلتك فارغة حتى الآن.</div>';
  }

  cart.forEach((item) => {
    subtotal += item.price * item.quantity;
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p class="product-meta">${item.stock}</p>
      </div>
      <div class="quantity">
        <button data-action="dec" data-id="${item.id}">-</button>
        <span>${item.quantity}</span>
        <button data-action="inc" data-id="${item.id}">+</button>
      </div>
    `;
    cartItems.appendChild(itemEl);
  });

  subtotalEl.textContent = `${subtotal} ر.س`;
  totalEl.textContent = `${subtotal} ر.س`;
  localStorage.setItem("cart", JSON.stringify(Array.from(cart.entries())));
};

const addToCart = (id) => {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  if (cart.has(id)) {
    cart.get(id).quantity += 1;
  } else {
    cart.set(id, { ...product, quantity: 1 });
  }
  updateCartUI();
};

const updateQuantity = (id, delta) => {
  if (!cart.has(id)) return;
  const item = cart.get(id);
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, item);
  }
  updateCartUI();
};

const drawCanvas = (promptText = "") => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, selectedColor);
  gradient.addColorStop(1, "#ffffff");

  ctx.fillStyle = gradient;
  ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = "#111827";
  ctx.font = "700 20px Tajawal";
  ctx.textAlign = "center";
  ctx.fillText(promptText || "تصميم مبدئي", canvas.width / 2, 80);

  if (uploadedImage) {
    const scale = Number(scaleRange.value) / 100;
    const rotation = (Number(rotateRange.value) * Math.PI) / 180;
    const imgWidth = uploadedImage.width * scale;
    const imgHeight = uploadedImage.height * scale;
    ctx.save();
    ctx.translate(canvas.width / 2, 170);
    ctx.rotate(rotation);
    ctx.drawImage(
      uploadedImage,
      -imgWidth / 2,
      -imgHeight / 2,
      imgWidth,
      imgHeight
    );
    ctx.restore();
  }

  ctx.fillStyle = "#0f172a";
  ctx.font = "600 26px Tajawal";
  ctx.fillText(customTextInput.value || "استوديو ألوان", textOffset.x, textOffset.y);

  ctx.font = "400 14px Tajawal";
  ctx.fillStyle = "#475569";
  ctx.fillText("جاهز للطباعة", canvas.width / 2, 300);
};

const handleGenerate = () => {
  const promptText = promptInput.value.trim() || "تصميم مخصص حسب طلبك";
  drawCanvas(promptText);
};

const handleColorSelect = (event) => {
  const button = event.target.closest(".color");
  if (!button) return;
  document.querySelectorAll(".color").forEach((el) => el.classList.remove("selected"));
  button.classList.add("selected");
  selectedColor = button.dataset.color;
  drawCanvas(promptInput.value.trim());
};

const handleSaveDesign = () => {
  savedDesigns += 1;
  libraryCount.textContent = `${savedDesigns} تصاميم`;
  localStorage.setItem("savedDesigns", savedDesigns.toString());
};

const handleMouseDown = (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (Math.abs(x - textOffset.x) < 100 && Math.abs(y - textOffset.y) < 30) {
    isDragging = true;
  }
};

const handleMouseMove = (event) => {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  textOffset = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
  drawCanvas(promptInput.value.trim());
};

const handleMouseUp = () => {
  isDragging = false;
};

const hydrateState = () => {
  const cartData = localStorage.getItem("cart");
  const designsData = localStorage.getItem("savedDesigns");
  if (cartData) {
    JSON.parse(cartData).forEach(([id, item]) => {
      cart.set(Number(id), item);
    });
  }
  if (designsData) {
    savedDesigns = Number(designsData);
    libraryCount.textContent = `${savedDesigns} تصاميم`;
  }
};

hydrateState();
renderProducts("all");
updateCartUI();
drawCanvas();

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const id = Number(button.dataset.id);
  addToCart(id);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const delta = button.dataset.action === "inc" ? 1 : -1;
  updateQuantity(id, delta);
});

colorPalette.addEventListener("click", handleColorSelect);

generateBtn.addEventListener("click", handleGenerate);
resetPreview.addEventListener("click", () => {
  promptInput.value = "";
  customTextInput.value = "";
  textOffset = { x: 180, y: 200 };
  selectedColor = "#2563eb";
  document.querySelectorAll(".color").forEach((el) => el.classList.remove("selected"));
  uploadedImage = null;
  imageUpload.value = "";
  scaleRange.value = "110";
  rotateRange.value = "0";
  drawCanvas();
});

saveToLibrary.addEventListener("click", handleSaveDesign);
customTextInput.addEventListener("input", () => drawCanvas(promptInput.value.trim()));
scaleRange.addEventListener("input", () => drawCanvas(promptInput.value.trim()));
rotateRange.addEventListener("input", () => drawCanvas(promptInput.value.trim()));

imageUpload.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const img = new Image();
    img.onload = () => {
      uploadedImage = img;
      drawCanvas(promptInput.value.trim());
    };
    img.src = loadEvent.target.result;
  };
  reader.readAsDataURL(file);
});

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mouseleave", handleMouseUp);

const filters = document.querySelectorAll(".filter");
filters.forEach((filterBtn) => {
  filterBtn.addEventListener("click", () => {
    filters.forEach((btn) => btn.classList.remove("active"));
    filterBtn.classList.add("active");
    renderProducts(filterBtn.dataset.filter);
  });
});
