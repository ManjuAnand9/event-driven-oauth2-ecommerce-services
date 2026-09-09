import ProductGrid from "./ProductGrid";

export default function DealsPage({
  products,
  loading,
  onAdd
}) {
  const deals = products.slice(0, 6);

  return (
    <section className="category-page">
      <div className="category-page-header">
        <div className="category-label">LIMITED TIME</div>
        <h1>Today's Deals</h1>
        <p>{deals.length} featured product(s)</p>
      </div>

      <ProductGrid
        products={deals}
        loading={loading}
        onAdd={onAdd}
      />
    </section>
  );
}
