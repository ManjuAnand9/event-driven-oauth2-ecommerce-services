import ProductGrid from "./ProductGrid";

export default function AllProductsPage({
  products,
  loading,
  onAdd
}) {
  return (
    <section className="category-page">
      <div className="category-page-header">
        <div className="category-label">NOVACART</div>
        <h1>All Products</h1>
        <p>{products.length} product(s)</p>
      </div>

      <ProductGrid
        products={products}
        loading={loading}
        onAdd={onAdd}
      />
    </section>
  );
}
