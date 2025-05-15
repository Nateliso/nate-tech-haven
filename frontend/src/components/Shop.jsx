import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "./Shop.css";

function Shop({ token }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (productId, type) => {
    if (!token) {
      alert("Please log in to add to cart");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cart`,
        { productId, type, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="products">
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
              {product.buyPrice && <p>Buy: R{product.buyPrice.toFixed(2)}</p>}
              {product.rentable && product.stockRent > 0 && product.rentPriceWeek && (
                <p>Rent: R{product.rentPriceWeek.toFixed(2)}/week</p>
              )}
              {token ? (
                <div className="product-actions">
                  {product.buyPrice && product.stockBuy > 0 && (
                    <button onClick={() => addToCart(product._id, "buy")}>
                      Add to Cart
                    </button>
                  )}
                  {product.rentable && product.stockRent > 0 && product.rentPriceWeek && (
                    <button onClick={() => addToCart(product._id, "rent")}>
                      Rent item
                    </button>
                  )}
                </div>
              ) : (
                <p>Please log in to add items to cart</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Shop.propTypes = {
  token: PropTypes.string,
};

export default Shop;