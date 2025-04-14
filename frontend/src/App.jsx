import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

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

  return (
    <div className="app">
      <h1>Nate’s Tech Haven</h1>
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
    </div>
  )
}

export default App
