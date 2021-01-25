const $cartItems = document.getElementById('cartItems');
const $cartCheckout = document.getElementById('cartCheckout');
const $cartContainer = document.getElementById('cartContainer');
const $productsContainer = document.getElementById('productsContainer');
const $headerCart = document.getElementById('headerCart');

// ====================== Templates =========================
const options = (selVal) => {
  return [1, 2, 3, 4, 5]
    .map((num) => {
      if (num === selVal)
        return `<option value="${num}" selected="selected">${num}</option>`;
      return `<option value="${num}">${num}</option>`;
    })
    .join('');
};

const productCardTemplate = (product) => `
<div class="col-sm-6 col-md-4 col-lg-3 mb-5">
  <a class="text-decoration-none" href="/products/${product._id}">
    <div class="card product-card">
      <div class="p-3">
        <img class="card-img-top" src="${product.imagePath}" alt="${product.title}">
      </div>
      <div class="card-body text-dark">
        <h5 class="card-title">${product.title}</h5>
        <p class="price fw-bold fs-5">&#8377; ${product.price}</p>
      </div>
    </div>
  </a>
</div>
`;

const cartItemTemplate = ({ item, qty }) => `
<div class="cart-item d-flex">
  <div class="cart-item__img me-3">
    <img src="${item.imagePath}" alt="${item.title}">
  </div>
  <div class="cart-item__info flex-grow-1">
    <div class="d-flex justify-content-between align-items-center flex-wrap">
      <a class="text-decoration-none" href="${location.origin}/products/${
  item._id
}">
        <h3 class="fs-5 text-dark me-2">${item.title}</h3>
      </a>
      <p class="cart-item__price mb-0">&#8377; ${item.price}</p>
    </div>

    <p class="text-success mb-1"><small>In stock</small></p>
    <div class="d-flex mt-4">
      <select class="cart-item__qty me-2" data-product-id="${item._id}">
        ${options(qty)}
      </select>
      <button class="btn btn-sm btn-danger" data-task="deleteCartItem" data-product-id="${
        item._id
      }">Remove</button>
    </div>
  </div>
</div>
<hr />
`;

const emptyCartTemplate = () => `
  <div class="empty-cart-msg text-center text-secondary">
    <h1 class="text-capitalize mb-3">Your cart is empty (&gt;_&lt;)</h1>
    <p class="fs-4 lead">Let's do some shopping!!!</p>
    <a href="/" class="btn btn-primary">Go Shopping</a>
  </div>
`;

// =================== View Controllers ====================
export const renderProductCards = (products) => {
  const html = products.map(productCardTemplate).join('');
  $productsContainer.insertAdjacentHTML('beforeend', html);
};

const renderCartItems = (items) => {
  const html = items.map(cartItemTemplate).join('');
  $cartItems.innerHTML = html;
};

const renderGrandTotal = (totalPrice) => {
  $cartCheckout.innerHTML = `
  <h2 class="fs-4 text-secondary mb-1">Total &#8377;${totalPrice}</h2>
  ${
    totalPrice > 500
      ? '<div><span class="badge bg-dark">&check; Eligible for FREE delivery</span></div>'
      : ''
  }
  `;
};

export const renderEmptyCart = () => {
  $cartContainer.innerHTML = emptyCartTemplate();
};

export const renderCart = (cart) => {
  const items = Object.values(cart.items);

  if (items.length === 0) return renderEmptyCart();

  renderCartItems(items);
  renderGrandTotal(cart.totalPrice);
};

export const displayCartItemsCount = (count) => {
  if ($headerCart) {
    const span = document.createElement('span');
    span.className = 'badge bg-danger ms-1';
    span.textContent = count;
    $headerCart.innerHTML = `
    <svg>
      <use href="/images/sprites.svg#cart"></use>
    </svg>
    <span>${count}</span>
    `;
  }
};

export const displayError = (msg) => {
  const $error = document.getElementById('errorMessage');
  msg = msg || 'Something went wrong! please try again later.';

  if (!$error) {
    const div = document.createElement('div');
    div.className = 'alert alert-danger';
    div.id = 'errorMessage';
    div.setAttribute('role', 'alert');
    div.textContent = msg;

    div.style.cssText =
      'position: absolute; width: 90%; max-width: 600px; margin: auto; top: 0; left: 50%;transform: translate(-50%, 2rem);z-index: 999;';
    document.body.appendChild(div);
  } else {
    $error.textContent = msg;
  }
};
