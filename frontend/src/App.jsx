import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import Checkout from "./components/Checkout";
import Shop from "./components/Shop"; 
import Returns from "./components/Returns";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // Add navigate hook

  useEffect(() => {
    setIsNavOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsNavOpen(false);
    navigate("/");
    alert("Logged out successfully!");
  };

  return (
    <div className="app">
      <div className="top-bar">
        <h1>Tech Haven</h1>
        <button className="hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
          {isNavOpen ? "✕" : "☰"}
        </button>
        <nav className={isNavOpen ? "nav-open" : ""}>
          {!token && <Link to="/">Home</Link>}
          {token && <Link to="/products">Store</Link>}
          {token && <Link to="/cart">Cart</Link>}
          {token && <Link to="/orders">Orders</Link>}
          {token && <Link to="/returns">Returns</Link>}
          {token ? (
            <button onClick={handleLogout}>Log Out</button>
          ) : (
            <>
              <Link to="/signup">Sign Up</Link>
              <Link to="/login">Log In</Link>
            </>
          )}
        </nav>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/products" replace />
            ) : (
              <section className="hero">
                <h2>Welcome to Nate’s Tech Haven</h2>
                <p>A Safe Space for Nerds, Geeks, Tech Enthusiasts and All to Buy & Rent Cool High Tech Gadgets. Check the store now!</p>
                <Link to="/signup">
                  <button className="shop-now">Shop Now</button>
                </Link>
              </section>
            )
          }
        />
        <Route path="/signup" element={<Signup setToken={setToken} />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/cart" element={<Cart token={token} />} />
        <Route path="/orders" element={<Orders token={token} />} />
        <Route path="/checkout" element={<Checkout token={token} />} />
        <Route path="/products" element={<Shop token={token} />} />
        <Route path="/returns" element={<Returns token={token} />} />
        <Route path="*" element={<div>404: Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;