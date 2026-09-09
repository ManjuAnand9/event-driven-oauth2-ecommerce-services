import { ShoppingCart, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  useEffect,
  useRef,
  useState
} from "react";



export default function Navbar({
  query,
  setQuery,
  products,
  cartCount,
  onOrders,
  onCart,
  onAuth,
  onLogout,
  token,
  username
}) {

  const [moreOpen, setMoreOpen] = useState(false);

  const moreMenuRef = useRef(null);

  useEffect(() => {

    function handleOutsideClick(event) {

      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target)
      ) {
        setMoreOpen(false);
      }

    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };

  }, []);

  const moreCategories = [
    "Shoes",
    "Jewelry",
    "Watches",
    "Accessories",
    "Electronics",
    "Sports",
    "Books",
    "Kids",
    "Pet Supplies",
    "Grocery"
  ];
  const navigate = useNavigate();
  const suggestions =
    query.trim()
      ? products
        .filter((product) =>
          product.name
            ?.toLowerCase()
            .startsWith(
              query.trim().toLowerCase()
            )
        )
        .slice(0, 6)
      : [];

  function handleSearch(event) {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/products");
  }

  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">NOVA<span>CART</span></Link>

        <div className="search-wrapper">

          <form
            className="search"
            onSubmit={handleSearch}
          >
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search NovaCart"
            />

            <button
              type="submit"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>


          {/* DROPDOWN */}

          {query.trim() !== "" && (
            <div className="search-suggestions">

              {suggestions.length > 0 ? (

                suggestions.map((product) => (

                  <button
                    key={product.id}
                    type="button"
                    className="search-suggestion-row"
                    onClick={() => {
                      setQuery(product.name);

                      navigate(
                        `/search?q=${encodeURIComponent(
                          product.name
                        )}`
                      );
                    }}
                  >

                    <div className="suggestion-left">

                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="suggestion-thumb"
                        />
                      ) : (
                        <Search
                          size={22}
                          className="suggestion-search-icon"
                        />
                      )}

                    </div>

                    <div className="suggestion-text">

                      {product.name}

                    </div>

                  </button>

                ))

              ) : (

                <div className="no-suggestions">

                  No matching products

                </div>

              )}

            </div>
          )}


        </div>

        <button
          className="nav-action nav-button"
          type="button"
          onClick={token ? onLogout : onAuth}
        >
          {token ? `Hello, ${username || "User"}` : "Hello, sign in"}
          <strong>{token ? "Sign out" : "Account & Lists"}</strong>
        </button>

        {token && (
          <button
            className="nav-action nav-button"
            type="button"
            onClick={onOrders}
          >
            Returns
            <strong>& Orders</strong>
          </button>
        )}

        {token && (
          <button
            className="cart-button"
            type="button"
            onClick={onCart}
          >
            <ShoppingCart size={21} />

            <strong>
              {cartCount} Cart
            </strong>
          </button>
        )}
      </header>

      <nav className="subnav">
        <Link to="/products">All</Link>
        <Link to="/deals">Today's Deals</Link>
        <Link to="/category/Handbags">Handbags</Link>
        <Link to="/category/Clothing">Clothing</Link>
        <Link to="/category/Beauty">Beauty</Link>
        <Link to="/category/Travel">Travel</Link>

        <div
          className="more-menu"
          ref={moreMenuRef}
        >

          <button
            type="button"
            className="more-menu-button"
            onClick={() =>
              setMoreOpen((current) => !current)
            }
          >
            More
            <span className="more-menu-arrow">
              {moreOpen ? "▲" : "▼"}
            </span>
          </button>

          {moreOpen && (
            <div className="more-menu-dropdown">

              <div className="more-menu-title">
                Explore Categories
              </div>

              <div className="more-menu-grid">

                {moreCategories.map((category) => (
                  <Link
                    key={category}
                    to={`/category/${category}`}
                    onClick={() =>
                      setMoreOpen(false)
                    }
                  >
                    {category}
                  </Link>
                ))}

              </div>

            </div>
          )}

        </div>
      </nav>
    </>
  );
}
