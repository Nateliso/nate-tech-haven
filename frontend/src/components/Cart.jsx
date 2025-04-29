import { useState, useEffect } from "react";
import axios from "axios";

function Cart() {
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

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/api/cart/checkout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Order created:", response.data.order);
      alert("Checkout successful! Order placed.");
      setCartItems([]);
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Checkout failed");
    }
  };

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {error && <p className="error">{error}</p>}
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <h3>{item.productId?.name || "Product"}</h3>
              <p>Type: {item.type}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          ))}
          <button onClick={handleCheckout}>Checkout</button>
        </>
      )}
    </div>
  );
}

export default Cart;