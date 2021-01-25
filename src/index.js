import axios from 'axios';
import Cart from './cart';
import * as viewCtrl from './views';
import { setCookie } from './helper';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

window.addEventListener('load', init);

function init() {
  // ------ Location Data ----------
  const query = window.location.search;
  const path = window.location.pathname;

  // -------- Check if cart already exists or not -----------
  const oldCart = JSON.parse(localStorage.getItem('cart'));

  // -------------- APP State --------------
  const State = {
    cart: oldCart ? new Cart(oldCart) : new Cart({}),
    get cartItemsCount() {
      const items = Object.values(this.cart.items);
      return items.length;
    },
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.cart));
    },
    page: 1,
    limit: 6
  };

  // ----------- DOM Elements -------------
  const $loading = document.getElementById('loading');
  const searchForms = document.querySelectorAll(
    '.search-form, .search-form-mob'
  );
  const $searchFormMob = document.querySelector('.search-form-mob');
  const $btnLoadMore = document.getElementById('loadMore');
  const $btnAddToCart = document.getElementById('btnAddToCart');
  const $signupForm = document.getElementById('signupForm');
  const $loginForm = document.getElementById('loginForm');
  const $btnLogout = document.getElementById('btnLogout');
  const $btnBuyNow = document.getElementById('btnBuyNow');
  const btnsCancelOrder = document.getElementsByClassName('btn-cancel-order');
  const $btnOpenSearch = document.getElementById('openSearch');
  const $btnCloseSearch = document.getElementById('closeSearch');

  // ------------ Stripe -------------
  let stripe;
  try {
    stripe = Stripe(
      'pk_test_51IAqNSFjuV1u1GoP66YbKEAjIGMAG34n4HaJuEMkOh6tbXXm4AU80u123q5CiPZfAPIkjOFDZa9hPhDX0SkUEdpf00m6XPZmpv'
    );
  } catch (err) {}

  // ---------- After Loading Is Done -------------
  if ($loading) {
    $loading.classList.add('fade-out');
  }

  viewCtrl.displayCartItemsCount(State.cartItemsCount);

  if ((path === '/login' || path === '/signup') && query.includes('error')) {
    viewCtrl.displayError(decodeURI(query.split('=')[1]));
  }

  if (State.cartItemsCount && $btnAddToCart) {
    const product = JSON.parse($btnAddToCart.dataset.product);

    if (State.cart.items[product._id]) {
      $btnAddToCart.textContent = 'Remove';
      $btnAddToCart.dataset.task = 'remove';
    }
  }

  if (path === '/my-cart') {
    if (State.cartItemsCount) {
      viewCtrl.renderCart(State.cart);
    } else {
      viewCtrl.renderEmptyCart();
    }
  }

  //---------------- Setting EVENT HANDLERS ------------
  for (let $searchForm of searchForms) {
    $searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      location.href = `?search=${this.search.value}`;
    });
  }

  if ($btnOpenSearch) {
    $btnOpenSearch.addEventListener('click', () => {
      $searchFormMob.classList.add('is-visible');
    });

    $btnCloseSearch.addEventListener('click', () => {
      $searchFormMob.classList.remove('is-visible');
    });
  }

  if ($signupForm) {
    $signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleFormSubmit(this, 'signup');
    });
  }

  if ($loginForm) {
    $loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleFormSubmit(this, 'login');
    });
  }

  if ($btnAddToCart) {
    $btnAddToCart.addEventListener('click', function () {
      const product = JSON.parse(this.dataset.product);

      if (this.dataset.task === 'add') {
        this.textContent = 'Remove';
        this.dataset.task = 'remove';
        addItemToCart(product);
        viewCtrl.displayCartItemsCount(State.cartItemsCount);
      } else if (this.dataset.task === 'remove') {
        this.textContent = 'Add to cart';
        this.dataset.task = 'add';
        removeCartItem(product._id);
        viewCtrl.displayCartItemsCount(State.cartItemsCount);
      }
    });
  }

  if ($btnBuyNow) {
    $btnBuyNow.addEventListener('click', function (e) {
      e.preventDefault();
      const product = JSON.parse(this.dataset.product);

      if (!State.cart.items[product._id]) {
        State.cart.addItem(product);
        State.saveCart();
      }

      location.href = `/my-cart`;
    });
  }

  if ($btnLoadMore) {
    $btnLoadMore.addEventListener('click', loadMoreResults);
  }

  if ($btnLogout) {
    $btnLogout.addEventListener('click', handleLogout);
  }

  for (let $btn of btnsCancelOrder) {
    $btn.addEventListener('click', handleCancelOrder);
  }
  //---------------- Setting EVENT HANDLERS Ends --------------

  // --------------- Event Delegation --------------
  document.body.addEventListener('change', (e) => {
    const target = e.target;
    if (target.classList.contains('cart-item__qty')) {
      updateCartItemsQty(e.target);
      viewCtrl.renderCart(State.cart);
    }
  });

  document.body.addEventListener('click', (e) => {
    const target = e.target;

    // Handling remove cart item btn click
    if (target.dataset && target.dataset.task === 'deleteCartItem') {
      removeCartItem(target.dataset.productId);
      viewCtrl.renderCart(State.cart);
      viewCtrl.displayCartItemsCount(State.cartItemsCount);
    }

    // Handling checkout btn click
    if (target.id === 'btnCheckout') {
      target.textContent = 'Processing...';
      handleCheckout(State.cart.items);
    }
  });
  // ------------------- Event Delegation Ends ---------------

  // =============== Handler FUNCTIONS ===================
  // --------- LOAD MORE RESULTS ----------
  async function loadMoreResults() {
    State.page++;
    $btnLoadMore.textContent = 'Loading...';
    const url = `/api/v1/products?page=${State.page}&limit=${
      State.limit
    }&fields=title,price,imagePath${
      location.search ? `&${location.search.slice(1)}` : ''
    }`;

    try {
      const resData = await axios.get(url);
      const products = resData.data.products;
      viewCtrl.renderProductCards(products);

      // Remove Load More btn if there isn't any results left!
      if (resData.data.totalResults <= State.page * State.limit) {
        return $btnLoadMore.parentNode.removeChild($btnLoadMore);
      }

      $btnLoadMore.textContent = 'Load more';
    } catch (err) {
      alert('Something went wrong, unable to load more results!!');
    }
  }

  // ------ handling LOGIN SIGNUP ------
  async function handleFormSubmit(form, type) {
    const $btnSubmit = form.btnSubmit;
    const temp = $btnSubmit.textContent;

    $btnSubmit.setAttribute('disabled', true);
    $btnSubmit.textContent = 'wait...';

    const data = {
      email: form.email.value.trim().toLowerCase(),
      password: form.password.value.trim().toLowerCase()
    };

    if (type === 'signup') data.name = form.name.value.trim();

    try {
      await axios.post(`/api/v1/users/${type}`, data);

      if (type === 'signup') {
        setCookie('hasAccount', 'yes', 365 * 50);
      }

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      viewCtrl.displayError(err.response.data.message);
      $btnSubmit.removeAttribute('disabled');
      $btnSubmit.textContent = temp;
    }
  }

  // -------- LOGOUT -----------
  async function handleLogout() {
    if (confirm('You want to logout?')) {
      try {
        await axios.get(`/api/v1/users/logout`);
        location.href = '/';
      } catch (err) {
        alert(err.response.data.message);
      }
    }
  }

  // ------------ ADD item to CART -----------
  function addItemToCart(product) {
    State.cart.addItem(product);
    State.saveCart();
  }

  // ------------ REMOVE item from CART -----------
  function removeCartItem(product) {
    State.cart.removeItem(product);
    State.saveCart();
  }

  // ------------ Update Cart Items QTY -----------
  function updateCartItemsQty(el) {
    const productId = el.dataset.productId;
    const qty = el.value * 1 || 1;

    State.cart.updateQty(productId, qty);
    State.saveCart();
  }

  // ------------ Cancel Order -------------
  async function handleCancelOrder() {
    const $btn = this;
    if (confirm('Do you want to CANCEL your order?')) {
      const orderId = $btn.dataset.orderId;
      $btn.textContent = 'Processing...';

      try {
        await axios.delete(`/api/v1/orders/${orderId}`);
        location.reload();
      } catch (err) {
        alert(err.response.data.message);
        $btn.textContent = 'Cancel order';
      }
    }
  }

  // ------------ Handle Checkout -------------
  async function handleCheckout(cartItems) {
    const products = [];

    for (let [key, value] of Object.entries(cartItems)) {
      products.push({
        id: key,
        qty: value.qty
      });
    }

    try {
      const res = await axios.post(`/api/v1/orders/checkout`, {
        products
      });
      const result = await stripe.redirectToCheckout({
        sessionId: res.data.session.id
      });

      if (result.error) {
        alert(result.error.message); // if stripe.redirectToCheckout fails due to network
      }
    } catch (err) {
      if (err.response.status === 401) {
        if (document.cookie.includes('hasAccount')) {
          location.href = `/login?error=${encodeURI('Please login first!')}`;
        } else {
          location.href = `/signup?error=${encodeURI('Please join us first!')}`;
        }
      }
    }
  }
}
// -------- init function ends ----------
