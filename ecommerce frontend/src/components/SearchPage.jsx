import { useSearchParams } from "react-router-dom";
import ProductGrid from "./ProductGrid";

export default function SearchPage({
  products,
  loading,
  onAdd
}) {
  const [params] = useSearchParams();

  const query = params.get("q") || "";

  const results = products.filter((product) => {
    const searchable = `
      ${product.name || ""}
      ${product.category || ""}
      ${product.description || ""}
    `.toLowerCase();

    return searchable.includes(query.toLowerCase());
  });

  return (
    <section className="category-page">
      <div className="category-page-header">
        <div className="category-label">SEARCH</div>
        <h1>Results for "{query}"</h1>
        <p>{results.length} product(s)</p>
      </div>

      <ProductGrid
        products={results}
        loading={loading}
        onAdd={onAdd}
      />
    </section>
  );
}
