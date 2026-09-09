import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/productApi";
import "./ProductDetailsPage.css";

export default function ProductDetailsPage({
    onAdd,
    onViewCart
}) {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");

    useEffect(() => {
        async function loadProduct() {
            try {
                setLoading(true);
                setError("");

                const result = await getProductById(id);

                // Supports either apiFetch response { body: ... }
                // or a function that directly returns the product.
                setProduct(result?.body ?? result);
            } catch (err) {
                console.error("Failed to load product:", err);
                setError("Could not load this product.");
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="pd-state">
                Loading product...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="pd-state">
                <h2>Product unavailable</h2>
                <p>{error}</p>
            </div>
        );
    }

    const category =
        product.category || "NovaCart";

    const categoryLower =
        category.toLowerCase();

    const isShoes =
        categoryLower.includes("shoe") ||
        categoryLower.includes("footwear");

    const isClothing =
        categoryLower.includes("fashion") ||
        categoryLower.includes("clothing") ||
        categoryLower.includes("dress");

    const sizes = isShoes
        ? ["3 UK", "4 UK", "5 UK", "6 UK", "7 UK", "8 UK"]
        : isClothing
            ? ["S", "M", "L", "XL"]
            : [];

    // Demo-only review data
    const rating = 4.3;
    const reviewCount = 128;

    const originalPrice =
        Number(product.price) * 1.3;

    const discount =
        Math.round(
            ((originalPrice - Number(product.price)) /
                originalPrice) *
            100
        );

    const reviews = [
        {
            name: "Joey Tribbiani",
            rating: 5,
            date: "3 days ago",
            text:
                "How you doin'? Honestly, this turned out way better than I expected."
        },
        {
            name: "Rachel Green",
            rating: 4,
            date: "1 week ago",
            text:
                "Cute, practical, and exactly as described. I’d definitely buy again."
        },
        {
            name: "Sheldon Cooper",
            rating: 5,
            date: "2 weeks ago",
            text:
                "The product performs within acceptable parameters. Surprisingly satisfactory."
        },
        {
            name: "Missy Cooper",
            rating: 4,
            date: "3 weeks ago",
            text:
                "Actually really liked it. Simple, useful, and worth the price."
        },
        {
            name: "Raj Koothrappali",
            rating: 5,
            date: "1 month ago",
            text:
                "Looks great and feels premium. Very happy with this purchase."
        },
        {
            name: "Prabhas",
            rating: 5,
            date: "1 month ago",
            text:
                "Clean design, good quality, and arrived in perfect condition."
        }
    ];

    const ratingDistribution = [
        { stars: 5, count: 72, width: 72 },
        { stars: 4, count: 35, width: 45 },
        { stars: 3, count: 12, width: 20 },
        { stars: 2, count: 5, width: 10 },
        { stars: 1, count: 4, width: 7 }
    ];

    function decreaseQuantity() {
        setQuantity((current) =>
            Math.max(1, current - 1)
        );
    }

    function increaseQuantity() {
        setQuantity((current) =>
            current + 1
        );
    }

    function handleAddToCart() {
        if (!onAdd) return;

        onAdd(product, quantity);
    }

    return (
        <main className="pd-page">

            {/* BREADCRUMB */}

            <div className="pd-breadcrumb">
                <span>Home</span>
                <span>›</span>
                <span>{category}</span>
                <span>›</span>

                <strong>
                    {product.name}
                </strong>
            </div>


            {/* MAIN PRODUCT AREA */}

            <section className="pd-main">

                {/* IMAGE */}

                <div className="pd-image-column">

                    <div className="pd-main-image">

                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                            />
                        ) : (
                            <div className="pd-no-image">
                                No image available
                            </div>
                        )}

                    </div>

                </div>


                {/* PRODUCT INFO */}

                <div className="pd-info">

                    <div className="pd-category">
                        {category}
                    </div>

                    <h1>
                        {product.name}
                    </h1>


                    {/* RATING */}

                    <div className="pd-rating-row">

                        <span className="pd-stars">
                            ★★★★☆
                        </span>

                        <span className="pd-rating-number">
                            {rating}
                        </span>

                        <span className="pd-review-link">
                            ({reviewCount} reviews)
                        </span>

                    </div>


                    {/* DESCRIPTION */}

                    <p className="pd-description">
                        {product.description}
                    </p>


                    {/* PRICE */}

                    <div className="pd-price-row">

                        <strong className="pd-price">
                            ${Number(product.price).toFixed(2)}
                        </strong>

                        <span className="pd-original-price">
                            ${originalPrice.toFixed(2)}
                        </span>

                        <span className="pd-discount">
                            {discount}% OFF
                        </span>

                    </div>

                    <p className="pd-tax">
                        Inclusive of all taxes
                    </p>


                    {/* SIZE — ONLY FOR RELEVANT PRODUCTS */}

                    {sizes.length > 0 && (
                        <div className="pd-size-section">

                            <div className="pd-option-title">
                                Size
                            </div>

                            <div className="pd-sizes">

                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        className={
                                            selectedSize === size
                                                ? "pd-size selected"
                                                : "pd-size"
                                        }
                                        onClick={() =>
                                            setSelectedSize(size)
                                        }
                                    >
                                        {size}
                                    </button>
                                ))}

                            </div>

                        </div>
                    )}

                </div>


                {/* PURCHASE CARD */}

                <aside className="pd-purchase-card">

                    <div className="pd-purchase-price">
                        ${Number(product.price).toFixed(2)}
                    </div>

                    <div className="pd-stock">
                        In stock
                    </div>

                    <p className="pd-delivery">
                        FREE delivery on eligible orders
                    </p>


                    {/* QUANTITY */}

                    <label className="pd-quantity-label">
                        Quantity
                    </label>

                    <div className="pd-quantity">

                        <button
                            type="button"
                            onClick={decreaseQuantity}
                        >
                            −
                        </button>

                        <span>
                            {quantity}
                        </span>

                        <button
                            type="button"
                            onClick={increaseQuantity}
                        >
                            +
                        </button>

                    </div>


                    {/* CART BUTTONS */}

                    <button
                        type="button"
                        className="pd-add-cart"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>

                    <button
                        type="button"
                        className="pd-view-cart"
                        onClick={onViewCart}
                    >
                        View Cart
                    </button>


                    {/* BENEFITS */}

                    <div className="pd-benefits">

                        <div>
                            <span>↻</span>
                            10 Days Return & Exchange
                        </div>

                        <div>
                            <span>✓</span>
                            Secure Payment
                        </div>

                        <div>
                            <span>▣</span>
                            Cash on Delivery Available
                        </div>

                    </div>

                </aside>

            </section>


            {/* CUSTOMER REVIEWS */}

            <section className="pd-reviews">

                <h2>
                    Customer Reviews
                </h2>

                <div className="pd-reviews-grid">


                    {/* SCORE */}

                    <div className="pd-review-summary">

                        <div className="pd-big-rating">
                            {rating}
                        </div>

                        <div className="pd-big-stars">
                            ★★★★☆
                        </div>

                        <p>
                            Based on {reviewCount} reviews
                        </p>

                    </div>


                    {/* DISTRIBUTION */}

                    <div className="pd-rating-bars">

                        {ratingDistribution.map(
                            (item) => (
                                <div
                                    className="pd-rating-bar-row"
                                    key={item.stars}
                                >

                                    <span>
                                        {item.stars}
                                    </span>

                                    <span className="pd-small-star">
                                        ★
                                    </span>

                                    <div className="pd-bar">

                                        <div
                                            className="pd-bar-fill"
                                            style={{
                                                width: `${item.width}%`
                                            }}
                                        />

                                    </div>

                                    <span>
                                        {item.count}
                                    </span>

                                </div>
                            )
                        )}

                    </div>


                    {/* REVIEWS */}

                    <div className="pd-review-list">

                        {reviews.map(
                            (review, index) => (
                                <article
                                    className="pd-review"
                                    key={index}
                                >

                                    <div className="pd-review-header">

                                        <strong>
                                            {review.name}
                                        </strong>

                                        <span className="pd-review-stars">
                                            {"★".repeat(review.rating)}
                                            {"☆".repeat(
                                                5 - review.rating
                                            )}
                                        </span>

                                        <span className="pd-review-date">
                                            {review.date}
                                        </span>

                                    </div>

                                    <p>
                                        {review.text}
                                    </p>

                                </article>
                            )
                        )}

                        <button
                            type="button"
                            className="pd-view-reviews"
                        >
                            View All Reviews
                        </button>

                    </div>

                </div>

            </section>

        </main>
    );
}