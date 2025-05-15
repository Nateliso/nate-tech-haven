import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: ""
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = location.state?.cartItems || [];

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to complete checkout");
        navigate("/login");
        return;
      }

      // Mock payment validation
      if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv) {
        throw new Error("Please fill all payment details");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cart/checkout`,
        { deliveryMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Checkout response:", response.data);

      // Clear cart
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Payment successful! Order placed.");
      navigate("/");
    } catch (err) {
      console.error("Checkout error:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || err.message || "Checkout failed");
      }
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.type === "buy" ? item.productId.buyPrice : item.productId.rentPriceWeek;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      {error && <p className="error">{error}</p>}
      {cartItems.length === 0 ? (
        <p>No items to checkout</p>
      ) : (
        <>
          <h3>Order Summary</h3>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index}>
                {item.productId.name} ({item.type}, Qty: {item.quantity}, Price: R{item.productId[item.type === "buy" ? "buyPrice" : "rentPriceWeek"].toFixed(2)})
              </li>
            ))}
          </ul>
          <p>Total: R{total.toFixed(2)}</p>
          <form onSubmit={handlePaymentSubmit}>
            <h3>Delivery Method</h3>
            <label>
              <input
                type="radio"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />
              Delivery
            </label>
            <label>
              <input
                type="radio"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />
              Pickup
            </label>
            <h3>Payment Details</h3>
            <div>
              <label>Card Number:</label>
              <input
                type="text"
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div>
              <label>Expiry:</label>
              <input
                type="text"
                value={paymentDetails.expiry}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label>CVV:</label>
              <input
                type="text"
                value={paymentDetails.cvv}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                placeholder="123"
              />
            </div>
            <button type="submit">Complete Payment</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Checkout;