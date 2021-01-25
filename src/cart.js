class Cart {
  constructor(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.addItem = function (item) {
      this.items[item._id] = { item, qty: 1, totalPrice: item.price };
      this.totalQty++;
      this.totalPrice += item.price;
    };

    this.removeItem = function (itemId) {
      const item = this.items[itemId];

      this.totalQty -= item.qty;
      this.totalPrice -= item.totalPrice;
      delete this.items[itemId];
    };

    this.updateQty = function (itemId, qty) {
      const itemObj = this.items[itemId];
      let totalPrice = 0;
      let totalQty = 0;

      itemObj.qty = qty;
      itemObj.totalPrice = itemObj.item.price * qty;

      for (let item of Object.values(this.items)) {
        totalQty += item.qty;
        totalPrice += item.totalPrice;
      }

      this.totalQty = totalQty;
      this.totalPrice = totalPrice;
    };
  }
}

export default Cart;
