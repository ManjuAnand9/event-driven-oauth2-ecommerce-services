export default function OrdersModal({
  open,
  orders,
  loading,
  onClose
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-card orders-modal-card">
        <h2>Orders</h2>

        <p className="modal-description">
          Order responses include product images for persisted product IDs.
        </p>

        {loading ? (
          <div className="loading-state">
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="loading-state">
            No orders found.
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article
                className="order-card"
                key={order.orderid}
              >
                <div className="order-card-header">
                  <div>
                    <strong>
                      {order.customerName || "Customer"}
                    </strong>

                    <span>{order.orderid}</span>
                  </div>

                  <b>
                    ${Number(order.ordertotal || 0).toFixed(2)}
                  </b>
                </div>

                <div className="order-items">
                  {(order.orderItemResponses || []).map(
                    (item, index) => (
                      <div
                        className="order-item"
                        key={`${item.productId}-${index}`}
                      >
                        <div className="order-thumb">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                            />
                          ) : (
                            "📦"
                          )}
                        </div>

                        <div>
                          <strong>
                            {item.productName}
                          </strong>

                          <span>
                            Qty {item.quantity}
                            {" • "}
                            ${Number(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="orders-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
