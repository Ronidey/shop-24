// import axios from 'axios';
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

// let stripe;

// try {
//   stripe = Stripe(
//     'pk_test_51IAqNSFjuV1u1GoP66YbKEAjIGMAG34n4HaJuEMkOh6tbXXm4AU80u123q5CiPZfAPIkjOFDZa9hPhDX0SkUEdpf00m6XPZmpv'
//   );
// } catch (err) {}

// if (location.pathname === '/checkout-success') {
//   localStorage.clear();
// }

// document.body.addEventListener('click', function (e) {
//   if (e.target.id === 'btnCheckout') {
//     const cartItems = JSON.parse(localStorage.getItem('cart')).items;
//     e.target.textContent = 'Processing...';
//     handleCheckout(cartItems);
//   }
// });

// async function handleCheckout(cartItems) {
//   const products = [];

//   for (let [key, value] of Object.entries(cartItems)) {
//     products.push({
//       id: key,
//       qty: value.qty
//     });
//   }

//   try {
//     const res = await axios.post(`${location.origin}/api/v1/orders/checkout`, {
//       products
//     });
//     const result = await stripe.redirectToCheckout({
//       sessionId: res.data.session.id
//     });

//     if (result.error) {
//       alert(result.error.message); // if stripe.redirectToCheckout fails due to network
//     }
//   } catch (err) {
//     if (err.response.status === 401) {
//       if (document.cookie.includes('hasAccount')) {
//         location.href = `/login?error=${encodeURI('Please login first!')}`;
//       } else {
//         location.href = `/signup?error=${encodeURI('Please join us first!')}`;
//       }
//     }
//   }
// }
