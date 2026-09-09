import { ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useState } from "react";

export default function ProductCard({ product, onAdd }) {

  const [showAdded, setShowAdded] = useState(false);

  function handleAdd(event) {
    event.stopPropagation();

    const added = onAdd(product);

    if (added === false) {
      return;
    }

    setShowAdded(true);

    setTimeout(() => {
      setShowAdded(false);
    }, 1200);
  }

  const navigate = useNavigate();

  const openProduct = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <article className="product">

      <div
        className="product-image"
        onClick={openProduct}
        style={{ cursor: "pointer" }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
          />
        ) : (
          <div className="image-fallback">
            <ImageOff size={34} />
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="product-body">

        <div className="category">
          {product.category || "UNCATEGORIZED"}
        </div>

        <h3
          onClick={openProduct}
          style={{ cursor: "pointer" }}
        >
          {product.name}
        </h3>

        <p className="product-description">
          {product.description || "No description available."}
        </p>

        <div className="rating">
          ★★★★★ <span>demo rating</span>
        </div>

        <div className="product-footer">

          <div className="price">
            ${Number(product.price || 0).toFixed(2)}
          </div>

          <div className="product-add-row">

            <button
              className="add-button"
              type="button"
              onClick={handleAdd}
            >
              Add to Cart
            </button>

            {showAdded && (
              <span className="product-added-message">
                ✓ Added
              </span>
            )}

          </div>

        </div>

      </div>

    </article>
  );
}