import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view cart");
          setLoading(false);
          return;
        }
        const response = await axios.get("http://localhost:3000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Cart items:", response.data);
        setCartItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch cart error:", err);
        setError(err.response?.data?.message || "Failed to load cart");
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(cartItems.filter((item) => item._id !== itemId));
      alert("Item removed from cart!");
    } catch (err) {
      console.error("Remove item error:", err);
      setError(err.response?.data?.message || "Failed to remove item");
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.type === "buy" ? item.productId.buyPrice : item.productId.rentPriceWeek;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {error && <p className="error">{error}</p>}
      {cartItems.length === 0 && !error && <p>Your cart is empty</p>}
      {cartItems.length > 0 && (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item._id} className="cart-item">
              <img
                src={item.productId.imageUrl || "https://via.placeholder.com/150"}
                alt={item.productId.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3>{item.productId.name}</h3>
                <p>Type: {item.type}</p>
                <p>Quantity: {item.quantity}</p>
                <p>
                  Price: R
                  {(item.type === "buy"
                    ? item.productId.buyPrice
                    : item.productId.rentPriceWeek
                  ).toFixed(2)}
                </p>
              </div>
              <button onClick={() => handleRemove(item._id)}>Remove</button>
            </li>
            ))}
          </ul>
          <p className="total">Total: R{total.toFixed(2)}</p>
          <Link to="/checkout" state={{ cartItems }}>
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
};

export default Cart;