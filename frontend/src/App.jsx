import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import Signup from "./components/Signup";
import Login from "./components/Login";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="app">
      <div className="top-bar">
        <h1>Nate’s Tech Haven</h1>
        <nav>
          <Link to="/">Home</Link>
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
            <>
              {error && <p className="error">{error}</p>}
              <div className="product-grid">
                {products.length === 0 && !error ? (
                  <p>Loading products...</p>
                ) : (
                  products.map((product) => (
                    <div key={product._id} className="product-card">
                      <h3>{product.name}</h3>
                      <p>{product.description || "No description available"}</p>
                      {product.buyPrice && <p>Buy: ${product.buyPrice.toFixed(2)}</p>}
                      {product.rentPriceWeek && <p>Rent: ${product.rentPriceWeek.toFixed(2)}/week</p>}
                      {product.rentBeforeBuy && <p>Rent Before Buy Available!</p>}
                      <img
                        src={product.imageUrl || "https://via.placeholder.com/150"}
                        alt={product.name}
                        className="product-image"
                      />
                    </div>
                  ))
                )}
              </div>
            </>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setToken={setToken} />} /> {/* Pass setToken */}
      </Routes>
    </div>
  );
}

export default App;