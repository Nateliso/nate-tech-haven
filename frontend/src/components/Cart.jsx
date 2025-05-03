import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Cart items:", response.data);
        setCartItems(response.data);
      })
      .catch((error) => {
        setError(error.response?.data?.message || "Failed to load cart");
      });
  }, []);

  const handleRemove = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(cartItems.filter((item) => item._id !== itemId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item");
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.type === "buy" ? item.productId.buyPrice : item.productId.rentPriceWeek;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {error && <p className="error">{error}</p>}
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item._id}>
                <h3>{item.productId.name}</h3>
                <p>Type: {item.type}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${(item.type === "buy" ? item.productId.buyPrice : item.productId.rentPriceWeek).toFixed(2)}</p>
                <button onClick={() => handleRemove(item._id)}>Remove</button>
              </li>
            ))}
          </ul>
          <p className="total">Total: ${total.toFixed(2)}</p>
          <Link to="/checkout" state={{ cartItems }}>
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
};

export default Cart;