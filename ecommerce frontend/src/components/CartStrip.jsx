export default function CartStrip({
  cart,
  total,
  onPlaceOrder
}) {
  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="cart-strip">
      <div>
        <small>Shopping Cart</small>

        <strong>
          {count === 0
            ? "Your cart is empty"
            : `${count} item(s) • $${total.toFixed(2)}`}
        </strong>
      </div>

      <button
        className="place-order"
        type="button"
        onClick={onPlaceOrder}
      >
        Place Order
      </button>
    </div>
  );
}
