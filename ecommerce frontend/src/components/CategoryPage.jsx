import { useParams } from "react-router-dom";
import ProductGrid from "./ProductGrid";

export default function CategoryPage({
  products,
  loading,
  onAdd
}) {
  const { category } = useParams();

  const categoryProducts = products.filter(
    (product) =>
      product.category?.toLowerCase() === category?.toLowerCase()
  );

  return (
    <section className="category-page">
      <div className="category-page-header">
        <div className="category-label">NOVACART CATEGORY</div>
        <h1>{category}</h1>
        <p>{categoryProducts.length} product(s)</p>
      </div>

      <ProductGrid
        products={categoryProducts}
        loading={loading}
        onAdd={onAdd}
      />
    </section>
  );
}
