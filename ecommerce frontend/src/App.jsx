import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Route,
  Routes,
  useLocation
} from "react-router-dom";

import AuthCallBack from "./components/AuthCallBack";

import {
  getAccessToken,
  setAccessToken
} from "./services/api";






import ProductDetailsPage from "./components/ProductDetailsPage";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import CartStrip from "./components/CartStrip";
import DeveloperPanel from "./components/DeveloperPanel";
import LoginModal from "./components/LoginModal";
import AdminProductModal from "./components/AdminProductModal";
import OrdersModal from "./components/OrdersModal";
import CategoryPage from "./components/CategoryPage";
import AllProductsPage from "./components/AllProductsPage";
import DealsPage from "./components/DealsPage";
import SearchPage from "./components/SearchPage";
import CartModal from "./components/CartModal";

import {
  getCustomerByEmail
} from "./services/customerapi";

import {
  getCustomerOrders,
  placeOrder
} from "./services/orderApi";


import {
  getUsername,
  getEmail,
  logout,
  hasRole

} from "./services/authservice";

import {
  addProduct,
  getProducts,
  requestUploadUrl,
  uploadFileToPresignedUrl
} from "./services/productApi";


export default function App() {

  const [cartError, setCartError] = useState("");

  const [cartMessage, setCartMessage] = useState("");
  const [orderSuccess, setOrderSuccess] =
    useState(null);

  const isAdmin = hasRole("ADMIN");
  const [products, setProducts] =
    useState([]);

  const [cartOpen, setCartOpen] =
    useState(false);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [productMessage, setProductMessage] =
    useState("");

  const [cart, setCart] =
    useState(() => {

      const savedCart =
        localStorage.getItem(
          "novacart-cart"
        );

      return savedCart
        ? JSON.parse(savedCart)
        : [];

    });

  function increaseQuantity(productId) {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
            ...item,
            quantity: item.quantity + 1
          }
          : item
      )
    );
  }

  function decreaseQuantity(productId) {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? {
              ...item,
              quantity: item.quantity - 1
            }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCart((current) =>
      current.filter(
        (item) => item.productId !== productId
      )
    );
  }

  const [developerData, setDeveloperData] =
    useState(null);

  const [query, setQuery] =
    useState("");

  const [token, setTokenState] =
    useState(getAccessToken());

  const [username, setUsername] =
    useState(getUsername());

  const [loginOpen, setLoginOpen] =
    useState(false);

  const [loginMessage, setLoginMessage] =
    useState("");

  const [adminOpen, setAdminOpen] =
    useState(false);

  const [adminBusy, setAdminBusy] =
    useState(false);

  const [ordersOpen, setOrdersOpen] =
    useState(false);

  const [orders, setOrders] =
    useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const productsRef =
    useRef(null);

  const location =
    useLocation();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {

    localStorage.setItem(
      "novacart-cart",
      JSON.stringify(cart)
    );

  }, [cart]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [location.pathname]);

  async function loadProducts() {
    setLoadingProducts(true);

    try {
      let page = 0;
      const size = 20;
      let allProducts = [];
      let lastPage = false;

      while (!lastPage) {
        const result =
          await getProducts(
            page,
            size
          );

        const responsePage =
          result.body;

        allProducts = [
          ...allProducts,
          ...(responsePage?.content || [])
        ];

        if (
          responsePage?.last !== undefined
        ) {
          lastPage =
            responsePage.last;
        } else {
          const totalPages =
            responsePage?.totalPages || 1;

          lastPage =
            page >= totalPages - 1;
        }

        page++;
      }

      setProducts(
        allProducts
      );

      setDeveloperData({
        operation:
          "PRODUCT SERVICE",

        title:
          "Retrieve All Products",

        description:
          "React fetched every page from Product Service and combined them into the storefront.",

        explanation:
          "The backend remains paginated. React continues requesting pages until the last page is reached. Product images are private S3 objects exposed through presigned GET URLs.",

        method:
          "GET",

        endpoint:
          "/PRODUCT-SERVICE/products?page={page}&size=20",

        request: {
          pageSize:
            size,

          pagesRequested:
            page
        },

        response: {
          totalProducts:
            allProducts.length
        },

        status:
          "200 OK",

        flow: [
          "React",
          "API Gateway",
          "Product Service",
          "PostgreSQL",
          "S3 Presigner"
        ]
      });

    } catch (error) {
      setDeveloperData({
        operation:
          "PRODUCT SERVICE",

        title:
          "Retrieve All Products",

        description:
          "Product loading failed.",

        method:
          "GET",

        endpoint:
          "/PRODUCT-SERVICE/products",

        request:
          {},

        response:
          error.body || {
            message:
              error.message
          },

        status:
          `${error.status || 500} ERROR`,

        error:
          true,

        flow: [
          "React",
          "API Gateway",
          "Product Service"
        ]
      });

    } finally {
      setLoadingProducts(false);
    }
  }

  const cartCount =
    cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  const cartTotal =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        item.quantity,
      0
    );

  function addToCart(product, quantity = 1) {

    if (!token) {
      const message =
        "Please sign in or create an account to add items to your cart.";

      setLoginMessage(message);
      setLoginOpen(true);

      setDeveloperData({
        operation: "AUTHENTICATION",
        title: "Sign In Required",
        description:
          "The user must sign in before adding products to the cart.",
        method: "CLIENT",
        endpoint: "Login Modal",
        request: {
          productId: product.id,
          quantity
        },
        response: {
          message
        },
        status: "AUTH REQUIRED",
        flow: [
          "Product",
          "Authentication Check",
          "Login Modal"
        ]
      });

      return false;
    }

    setCart((current) => {
      const existing =
        current.find(
          (item) =>
            item.productId === product.id
        );

      if (existing) {
        return current.map(
          (item) =>
            item.productId === product.id
              ? {
                ...item,
                quantity:
                  item.quantity + quantity,
                imageUrl:
                  product.imageUrl || item.imageUrl
              }
              : item
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity
        }
      ];
    }





    ); setCartMessage(
      `${product.name} added to cart`
    );

    setTimeout(() => {
      setCartMessage("");
    }, 1200);


    setDeveloperData({
      operation: "SHOPPING CART",
      title: "Add to Cart",
      description:
        `Added ${quantity} × ${product.name} to the cart.`,
      explanation:
        "The cart is maintained in React state and persisted in localStorage. No order API is called until Place Order.",
      method: "CLIENT",
      endpoint: "React State",
      request: {
        productId: product.id,
        quantity
      },
      response: {
        message: "Cart updated locally"
      },
      status: "LOCAL STATE UPDATED",
      flow: [
        "Product",
        "React State",
        "Cart UI"
      ]
    });

    setCartMessage("✓ Product added to cart");

    setTimeout(() => {
      setCartMessage("");
    }, 1500);

    return true;
  }

  async function handlePlaceOrder() {
    if (!cart.length) {
      setCartError(
        "Your cart is empty. Add a product before placing an order."
      );

      setTimeout(() => {
        setCartError("");
      }, 2000);
      setDeveloperData({
        operation: "ORDER SERVICE",
        title: "Place Order",
        description:
          "The order was not sent because the cart is empty.",
        method: "NOT SENT",
        endpoint: "/ORDER-SERVICE/placeorder",
        request: {},
        response: {
          message: "Add at least one product first."
        },
        status: "CLIENT VALIDATION",
        error: true,
        flow: [
          "React Validation"
        ]
      });

      return;
    }

    const currentToken = getAccessToken();

    const tokenIsMissingOrInvalid =
      !currentToken ||
      currentToken.split(".").length !== 3;

    if (tokenIsMissingOrInvalid) {
      const message =
        "Your session expired. Please sign in again.";

      console.log("NO TOKEN — OPENING LOGIN MODAL");

      setAccessToken("");
      setTokenState("");
      setUsername("");
      setCartError(message);
      setLoginMessage(message);
      setLoginOpen(true);

      return false;
    }

    if (!currentToken) {
      const message =
        "Your session expired. Please sign in again.";

      setTokenState("");
      setUsername("");
      setCartError(message);
      setLoginMessage(message);
      setLoginOpen(true);

      return false;
    }

    const email = getEmail();

    if (!email) {
      const message =
        "Your signed-in account does not contain an email address.";

      setLoginMessage(message);
      setLoginOpen(true);
      return;
    }

    try {
      const customerResult =
        await getCustomerByEmail(email);

      const customer =
        customerResult.body;

      if (!customer?.customerid) {
        throw new Error(
          "Customer id was not returned for the signed-in user."
        );
      }

      const request = {
        customerid:
          customer.customerid,

        items:
          cart.map(
            (item) => ({
              productId:
                item.productId,

              quantity:
                item.quantity
            })
          ),

        paymentMethod:
          "CARD",

        paymentStatus:
          "payment successful"
      };

      const result =
        await placeOrder(request);

      const placedOrder =
        result.body;

      setOrderSuccess({
        orderId:
          placedOrder?.orderId ??
          placedOrder?.id ??
          placedOrder?.orderid,
        message:
          "Order placed successfully!"
      });

      setDeveloperData({
        operation:
          "ORDER SERVICE",

        title:
          "Place Order",

        description:
          "The request was routed through API Gateway to Order Service.",

        explanation:
          "React resolved the logged-in user's Customer Service id, then Order Service called downstream services, persisted the order and published ORDER_CREATED to Kafka.",

        method:
          "POST",

        endpoint:
          "/ORDER-SERVICE/placeorder",

        request,

        response:
          result.body,

        status:
          `${result.status} OK`,

        flow: [
          "React",
          "JWT Email",
          "Customer Service",
          "API Gateway",
          "Order Service",
          "Product Service",
          "orderdb"
        ],

        kafka:
          true
      });

      setCart([]);

    } catch (error) {
      setDeveloperData({
        operation:
          "ORDER SERVICE",

        title:
          "Place Order",

        description:
          "Order creation failed.",

        explanation:
          "Inspect the customer lookup response, API response and Order Service logs.",

        method:
          "POST",

        endpoint:
          "/ORDER-SERVICE/placeorder",

        request: {
          email,
          items:
            cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
        },

        response:
          error.body || {
            message:
              error.message
          },

        status:
          `${error.status || 500} ERROR`,

        error:
          true,

        flow: [
          "React",
          "Customer Lookup",
          "API Gateway",
          "Order Service"
        ]
      });


      const failureMessage =
        error.status === 401
          ? "Your session expired. Please sign in again."
          : error.status === 404 ||
            error.status === 500 ||
            error.status === 502 ||
            error.status === 503
            ? "Order service is currently unavailable. Please try again shortly."
            : error.body?.message ||
            error.message ||
            "We couldn’t place your order. Please try again.";

      setCartError(failureMessage);

      setTimeout(() => {
        setCartError("");
      }, 5000);

      if (error.status === 401) {
        setLoginMessage(failureMessage);
        setLoginOpen(true);
      }

      return false;
    }

    return true;
  }

  async function handleOpenOrders() {
    const email = getEmail();

    console.log("JWT EMAIL:", email);

    if (!email) {
      console.error("No email found in token");
      return;
    }
    setOrdersOpen(true);
    setOrdersLoading(true);

    try {
      const result =
        await getCustomerOrders(
          email,
          0,
          100
        );

      const page =
        result.body;

      setOrders(
        page?.content || []
      );

      setDeveloperData({
        operation:
          "ORDER SERVICE",

        title:
          "Retrieve Orders",

        description:
          "Order Service returned OrderResponse DTOs with product image URLs.",

        explanation:
          "For each persisted productId, Order Service calls Product Service to obtain a current presigned GET URL.",

        method:
          "GET",

        endpoint:
          `/ORDER-SERVICE/customer-orders?email=${email}&page=0&size=100`,

        request: {
          Authorization:
            token
              ? "Bearer •••••••••"
              : "No token stored"
        },

        response:
          page,

        status:
          `${result.status} OK`,

        flow: [
          "React",
          "JWT",
          "API Gateway",
          "Order Service",
          "Product Service",
          "S3 Presigner"
        ]
      });

    } catch (error) {
      setOrders([]);

      setDeveloperData({
        operation:
          "ORDER SERVICE",

        title:
          "Retrieve Orders",

        description:
          "Could not retrieve orders.",

        method:
          "GET",

        endpoint:
          "/ORDER-SERVICE/customer-orders",

        request:
          {},

        response:
          error.body || {
            message:
              error.message
          },

        status:
          `${error.status || 500} ERROR`,

        error:
          true,

        flow: [
          "React",
          "API Gateway",
          "Order Service"
        ]
      });

      const message =
        error.status === 401
          ? "Your session expired. Please sign in again."
          : error.body?.message ||
          error.message ||
          "We couldn’t place your order. Please try again.";

      setCartError(message);

      setTimeout(() => {
        setCartError("");
      }, 5000);

      if (error.status === 401) {
        setLoginMessage(message);
        setLoginOpen(true);
      }

      return false;



    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleCreateProduct(
    form,
    file
  ) {
    setAdminBusy(true);

    try {
      const uploadRequest =
        await requestUploadUrl(file);

      const {
        imageKey,
        uploadUrl
      } =
        uploadRequest.body;

      setDeveloperData({
        operation:
          "S3 PRESIGNED UPLOAD",

        title:
          "Request Upload URL",

        description:
          "Product Service created a temporary presigned PUT URL.",

        explanation:
          "React uploads the image directly to private S3 instead of sending image bytes through Product Service.",

        method:
          "POST",

        endpoint:
          "/PRODUCT-SERVICE/product-image/upload-url",

        request: {
          fileName:
            file.name,

          contentType:
            file.type
        },

        response: {
          imageKey,

          uploadUrl:
            "[presigned URL redacted]"
        },

        status:
          `${uploadRequest.status} OK`,

        flow: [
          "React",
          "API Gateway",
          "Product Service",
          "S3 Presigner"
        ]
      });

      const s3Status =
        await uploadFileToPresignedUrl(
          uploadUrl,
          file
        );

      const productRequest = {
        name:
          form.name,

        price:
          Number(form.price),

        description:
          form.description,

        category:
          form.category,

        imageKey
      };

      const created =
        await addProduct(
          productRequest
        );

      setDeveloperData({
        operation:
          "PRODUCT SERVICE + S3",

        title:
          "Create Product",

        description:
          "The image was uploaded to S3 and the product metadata plus imageKey were stored in Product Service.",

        explanation:
          "GET product APIs later convert the stored imageKey into a short-lived presigned imageUrl.",

        method:
          "POST",

        endpoint:
          "/PRODUCT-SERVICE/addproduct",

        request:
          productRequest,

        response: {
          s3UploadStatus:
            s3Status,

          product:
            created.body
        },

        status:
          `${created.status} CREATED`,

        flow: [
          "React",
          "Presigned PUT",
          "S3",
          "API Gateway",
          "Product Service",
          "productdb"
        ]
      });
      throw error;

      setAdminOpen(false);

      await loadProducts();

      setProductMessage(
        `✓ ${form.name} was added successfully`
      );

      setTimeout(() => {
        setProductMessage("");
      }, 3000);

    } catch (error) {
      setDeveloperData({
        operation:
          "PRODUCT SERVICE + S3",

        title:
          "Create Product",

        description:
          "Product creation failed.",

        method:
          "POST",

        endpoint:
          "/PRODUCT-SERVICE/addproduct",

        request:
          form,

        response:
          error.body || {
            message:
              error.message
          },

        status:
          `${error.status || 500} ERROR`,

        error:
          true,

        flow: [
          "React",
          "Product Service / S3"
        ]
      });

    } finally {
      setAdminBusy(false);
    }
  }

  function handleLoginSuccess(accessToken) {
    setTokenState(accessToken);
    setLoginMessage("");
    setUsername(getUsername());
    setLoginOpen(false);

    setDeveloperData({
      operation: "AUTHENTICATION",
      title: "User Login",
      description: "The user signed in from the NovaCart login modal.",
      explanation: "NovaCart sends the credentials to Keycloak's token endpoint. Keycloak validates them and returns an OAuth2 access token for protected API requests.",
      method: "POST",
      endpoint: "/realms/{realm}/protocol/openid-connect/token",
      request: {
        grant_type: "password",
        username: username || "user",
        password: "********"
      },
      response: {
        access_token: "••••••••••••",
        token_type: "Bearer"
      },
      status: "200 OK",
      flow: [
        "NovaCart Login",
        "Keycloak",
        "JWT",
        "Authenticated API Requests"
      ]
    });
  }

  function handleLogout() {
    logout();
    setLoginMessage("");
    setTokenState("");
    setUsername(null);
    setDeveloperData({
      operation: "AUTHENTICATION",
      title: "Logout",
      description: "The locally stored NovaCart access and refresh tokens were removed.",
      method: "CLIENT",
      endpoint: "localStorage",
      request: {},
      response: { loggedIn: false },
      status: "LOCAL SESSION CLEARED"
    });
  }

  return (
    <>

      {cartMessage && (
        <div
          style={{
            position: "fixed",
            top: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111827",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            zIndex: 999999,
            fontWeight: "600"
          }}
        >
          {cartMessage}
        </div>
      )}

      {productMessage && (
        <div className="product-success-toast">
          {productMessage}
        </div>
      )}


      {cartError && (
        <div className="order-error-toast">
          <span>⚠</span>

          <span>{cartError}</span>

          <button
            type="button"
            onClick={() => setCartError("")}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}
      <div className="page">
        <main className="store">
          <Navbar
            query={query}
            setQuery={setQuery}
            products={products}
            cartCount={cartCount}
            onOrders={handleOpenOrders}
            onCart={() =>
              setCartOpen(true)
            }
            onAuth={() =>
              setLoginOpen(true)
            }
            onLogout={handleLogout}
            token={token}
            username={username}
          />

          <Routes>

            <Route
              path="/auth/callback"
              element={<AuthCallBack />}
            />

            <Route
              path="/product/:id"
              element={
                <ProductDetailsPage
                  onAdd={addToCart}
                  onViewCart={() => setCartOpen(true)}
                />
              }
            />
            <Route
              path="/"
              element={
                <>
                  <Hero
                    onShop={() =>
                      productsRef
                        .current
                        ?.scrollIntoView({
                          behavior:
                            "smooth"
                        })
                    }
                  />

                  <section
                    className="products-section"
                    ref={productsRef}
                  >
                    <div className="section-heading">
                      <div>
                        <h2>
                          All Products
                        </h2>

                        <p>
                          {products.length}
                          {" "}
                          product(s) loaded from Product Service
                        </p>
                      </div>

                      <div className="section-actions">
                        <button
                          className="text-button"
                          type="button"
                          onClick={
                            loadProducts
                          }
                        >
                          Refresh
                        </button>

                        {isAdmin && (
                          <button
                            className="admin-button"
                            type="button"
                            onClick={() =>
                              setAdminOpen(true)
                            }
                          >
                            + Admin: Add Product
                          </button>
                        )}
                      </div>
                    </div>

                    <ProductGrid
                      products={products}
                      loading={loadingProducts}
                      onAdd={addToCart}
                    />
                  </section>
                </>
              }
            />

            <Route
              path="/products"
              element={
                <AllProductsPage
                  products={products}
                  loading={loadingProducts}
                  onAdd={addToCart}
                />
              }
            />

            <Route
              path="/deals"
              element={
                <DealsPage
                  products={products}
                  loading={loadingProducts}
                  onAdd={addToCart}
                />
              }
            />

            <Route
              path="/category/:category"
              element={
                <CategoryPage
                  products={products}
                  loading={loadingProducts}
                  onAdd={addToCart}
                />
              }
            />

            <Route
              path="/search"
              element={
                <SearchPage
                  products={products}
                  loading={loadingProducts}
                  onAdd={addToCart}
                />
              }
            />
          </Routes>

          <CartStrip
            cart={cart}
            total={cartTotal}
            onPlaceOrder={
              handlePlaceOrder
            }
          />
        </main>

        <DeveloperPanel
          data={developerData}
        />
      </div>

      <LoginModal
        open={loginOpen}
        message={loginMessage}
        onClose={() => {
          setLoginOpen(false);
          setLoginMessage("");
        }}
        onLoginSuccess={
          handleLoginSuccess
        }
      />

      <AdminProductModal
        open={adminOpen}
        onClose={() =>
          setAdminOpen(false)
        }
        onSubmit={
          handleCreateProduct
        }
        busy={adminBusy}
      />

      <OrdersModal
        open={ordersOpen}
        orders={orders}
        loading={ordersLoading}
        onClose={() =>
          setOrdersOpen(false)
        }
      />

      <CartModal
        open={cartOpen}
        cart={cart}
        total={cartTotal}
        onClose={() =>
          setCartOpen(false)
        }
        onIncrease={
          increaseQuantity
        }
        onDecrease={
          decreaseQuantity
        }
        onRemove={
          removeFromCart
        }
        onPlaceOrder={async () => {
          try {
            const success = await handlePlaceOrder();

            if (success !== false) {
              setCartOpen(false);
            }

          } catch {
            // Keep the cart open when checkout fails.
          }
        }}
      />

      {orderSuccess && (
        <div className="order-success-overlay">

          <div className="order-success-popup">

            <div className="order-success-check">
              ✓
            </div>

            <div className="order-success-badge">
              ORDER CONFIRMED
            </div>

            <h2>
              Your order is on its way!
            </h2>

            <p className="order-success-subtitle">
              Thanks for shopping with NovaCart.
              Your order has been placed successfully.
            </p>

            <div className="order-id-box">

              <span className="order-id-label">
                ORDER ID
              </span>

              <span className="order-id-value">
                {orderSuccess.orderId}
              </span>

              <button
                type="button"
                className="copy-order-button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    orderSuccess.orderId
                  )
                }
              >
                Copy
              </button>

            </div>

            <div className="order-success-divider" />

            <div className="order-success-note">
              ✓ Payment successful
            </div>

            <button
              type="button"
              className="continue-shopping-button"
              onClick={() => {
                setOrderSuccess(null);
                setCartOpen(false);
              }}
            >
              Continue Shopping →
            </button>

          </div>

        </div>
      )}
    </>
  );
}
