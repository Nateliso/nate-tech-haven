import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import Checkout from "./components/Checkout";
import Products from "./components/Products";
import Returns from "./components/Returns";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log("Navigated to:", location.pathname, "State:", location.state);
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/products");
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    alert("Logged out successfully!");
  };

  const addToCart = async (productId, type) => {
    if (!token) {
      alert("Please log in to add to cart");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/api/cart",
        { productId, type, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="app">
      <div className="top-bar">
        <h1>Nate’s Tech Haven</h1>
        <nav>
          <Link to="/">Home</Link>
          {token && <Link to="/products">Products</Link>}
          {token && <Link to="/cart">Cart</Link>}
          {token && <Link to="/orders">Orders</Link>}
          {token && <Link to="/returns">Returns</Link>}
          {token ? (
            <button onClick={handleLogout}>Log Out</button>
          ) : (
            <React.Fragment>
              <Link to="/signup">Sign Up</Link>
              <Link to="/login">Log In</Link>
            </React.Fragment>
          )}
        </nav>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <React.Fragment>
              <section className="hero">
                <h2>Welcome to Nate’s Tech Haven</h2>
                <p>A Safe Space for Nerds to Buy & Rent Tech</p>
                <Link to="/products">
                  <button className="shop-now">Shop Now</button>
                </Link>
              </section>
              {error && <p className="error">{error}</p>}
              {loading && <div className="loading">Loading products...</div>}
              {!loading && products.length === 0 && !error && (
                <p>No products available</p>
              )}
              {!loading && products.length > 0 && (
                <div className="product-grid">
                  {products.map((product) => (
                    <div key={product._id} className="product-card">
                      <img
                        src={product.imageUrl || "https://via.placeholder.com/150"}
                        alt={product.name}
                        className="product-image"
                      />
                      <h3>{product.name}</h3>
                      <p>{product.description || "No description available"}</p>
                      {product.buyPrice && <p>Buy: ${product.buyPrice.toFixed(2)}</p>}
                      {product.rentable && product.stockRent > 0 && product.rentPriceWeek && (
                        <p>Rent: ${product.rentPriceWeek.toFixed(2)}/week</p>
                      )}
                      <div className="product-actions">
                        {product.buyPrice && product.stockBuy > 0 && (
                          <button onClick={() => addToCart(product._id, "buy")}>
                            Add to Cart (Buy)
                          </button>
                        )}
                        {product.rentable && product.stockRent > 0 && product.rentPriceWeek && (
                          <button onClick={() => addToCart(product._id, "rent")}>
                            Add to Cart (Rent)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/products" element={<Products />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="*" element={<div>404: Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;