import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/products");
        console.log("Products:", response.data);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch products error:", err);
        setError(err.response?.data?.message || "Failed to load products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId, type, quantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to add to cart");
        return;
      }
      const response = await axios.post(
        "http://localhost:3000/api/cart",
        { productId, type, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Add to cart:", response.data);
      alert("Item added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      setError(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="products">
      <h2>Tech Gadgets</h2>
      {error && <p className="error">{error}</p>}
      {products.length === 0 && !error && <p>No products available</p>}
      <div className="product-grid">
        {products.map((product) => (
          <div key={product._id} className="product">
            <img
              src={product.imageUrl || "https://via.placeholder.com/150"}
              alt={product.name}
              className="product-image"
            />
            <h3>{product.name}</h3>
            <p>{product.description || "No description available"}</p>
            <p>Category: {product.category}</p>
<<<<<<< HEAD
            {product.buyPrice && <p>Buy: R{product.buyPrice.toFixed(2)}</p>}
            {product.rentable && product.stockRent > 0 && product.rentPriceWeek && (
              <p>Rent: R{product.rentPriceWeek.toFixed(2)}/week</p>
=======
            {product.buyPrice && <p>Buy: ${product.buyPrice.toFixed(2)}</p>}
            {product.rentable && product.stockRent > 0 && product.rentPriceWeek && (
              <p>Rent: ${product.rentPriceWeek.toFixed(2)}/week</p>
>>>>>>> 1502230535a9a982231c5e90b15d2e5ba922eced
            )}
            <div className="product-actions">
              {product.buyPrice && product.stockBuy > 0 && (
                <button onClick={() => handleAddToCart(product._id, "buy", 1)}>
<<<<<<< HEAD
                  Add to cart
=======
                  Add to Cart (Buy)
>>>>>>> 1502230535a9a982231c5e90b15d2e5ba922eced
                </button>
              )}
              {product.rentable && product.stockRent > 0 && product.rentPriceWeek && (
                <button onClick={() => handleAddToCart(product._id, "rent", 1)}>
<<<<<<< HEAD
                  Rent Item
=======
                  Add to Cart (Rent)
>>>>>>> 1502230535a9a982231c5e90b15d2e5ba922eced
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;