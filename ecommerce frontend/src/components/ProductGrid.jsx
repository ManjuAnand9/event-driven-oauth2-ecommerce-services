import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  loading,
  onAdd
}) {
  if (loading) {
    return (
      <div className="loading-state">
        Loading products from Product Service…
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="loading-state">
        No products found.
      </div>
    );
  }

  return (
    <div className="products">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}
