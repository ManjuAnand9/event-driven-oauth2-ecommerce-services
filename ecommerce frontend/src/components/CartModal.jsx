export default function CartModal({
    open,
    cart,
    total,
    onClose,
    onIncrease,
    onDecrease,
    onRemove,
    onPlaceOrder
}) {

    if (!open) {
        return null;
    }

    return (
        <div
            className="modal-backdrop"
            onMouseDown={onClose}
        >
            <div
                className="modal-card cart-modal-card"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >

                <div className="cart-modal-header">

                    <div>
                        <h2>Your Cart</h2>

                        <p className="modal-description">
                            Review your items before checkout.
                        </p>
                    </div>

                    <button
                        className="cart-close"
                        type="button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                {cart.length === 0 ? (

                    <div className="cart-empty">

                        <div className="cart-empty-icon">
                            🛒
                        </div>

                        <h3>
                            Your cart is empty
                        </h3>

                        <p>
                            Add some products to get started.
                        </p>

                    </div>

                ) : (

                    <>
                        <div className="cart-items">




                            {cart.map((item) => (
                                <div
                                    className="cart-item"
                                    key={item.productId}
                                >

                                    <div className="cart-item-image">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                            />
                                        ) : (
                                            <span>📦</span>
                                        )}
                                    </div>

                                    <div className="cart-item-info">

                                        <h3>{item.productName}</h3>

                                        <div className="cart-item-price">
                                            ${Number(item.price || 0).toFixed(2)}
                                        </div>

                                        <div className="cart-item-actions">

                                            <div className="quantity-control">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDecrease(item.productId)
                                                    }
                                                >
                                                    −
                                                </button>

                                                <span>{item.quantity}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onIncrease(item.productId)
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>

                                            <button
                                                className="remove-cart-item"
                                                type="button"
                                                onClick={() =>
                                                    onRemove(item.productId)
                                                }
                                            >
                                                Remove
                                            </button>

                                        </div>

                                    </div>

                                    <div className="cart-item-total">
                                        $
                                        {(
                                            Number(item.price || 0) *
                                            item.quantity
                                        ).toFixed(2)}
                                    </div>

                                </div>
                            ))}

                        </div>


                        <div className="cart-summary">

                            <div>

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ${total.toFixed(2)}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Shipping
                                </span>

                                <strong>
                                    FREE
                                </strong>

                            </div>


                            <div className="cart-grand-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ${total.toFixed(2)}
                                </strong>

                            </div>

                        </div>


                        <button
                            className="cart-checkout-button"
                            type="button"
                            onClick={onPlaceOrder}
                        >
                            Place Order
                        </button>

                    </>

                )}

            </div>
        </div >
    );
}