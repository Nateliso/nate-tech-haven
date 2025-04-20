import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get("http://localhost:3000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCartItems(response.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load cart");
      });
  }, [token, navigate]);

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {error && <p className="error">{error}</p>}
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <h3>{item.productId.name}</h3>
              <p>Type: {item.type}</p>
              <p>Quantity: {item.quantity}</p>
              <p>
                Price: $
                {item.type === "buy"
                  ? item.productId.buyPrice?.toFixed(2)
                  : item.productId.rentPriceWeek?.toFixed(2)}
                {item.type === "rent" && "/week"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cart;