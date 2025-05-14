import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Returns.css";

const Returns = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError(err.response?.data?.message || "Failed to load orders");
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReturn = async (orderId, itemIndex, returnMethod, returnDate) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/api/orders/return/${orderId}/${itemIndex}`,
        { returnMethod, returnDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Return requested successfully");
      setOrders(orders.map(order => 
        order._id === orderId 
          ? {
              ...order,
              items: order.items.map((item, idx) =>
                idx === itemIndex ? { ...item, rentalStatus: "returned" } : item
              ),
            }
          : order
      ));
    } catch (err) {
      console.error("Return error:", err);
      alert(err.response?.data?.message || "Failed to request return");
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="returns">
      <h2>Your Returns</h2>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && !error && <p>No orders found</p>}
      {orders.map((order) => (
        <div key={order._id} className="order">
          <h3>Order ID: {order._id}</h3>
          <p>Delivery Method: {order.deliveryMethod}</p>
          <p>Status: {order.status}</p>
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <p>Product: {item.productName}</p>
              <p>Type: {item.type}</p>
              <p>Quantity: {item.quantity}</p>
<<<<<<< HEAD
              <p>Price: R{item.price.toFixed(2)}</p>
=======
              <p>Price: ${item.price.toFixed(2)}</p>
>>>>>>> 1502230535a9a982231c5e90b15d2e5ba922eced
              {item.type === "rent" && (
                <>
                  <p>Rental Status: {item.rentalStatus}</p>
                  {item.rentalEndDate && (
                    <p>Expires: {new Date(item.rentalEndDate).toLocaleDateString()}</p>
                  )}
                  {item.rentalStatus === "in rental" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const returnMethod = e.target.returnMethod.value;
                        const returnDate = e.target.returnDate.value;
                        handleReturn(order._id, index, returnMethod, returnDate);
                      }}
                    >
                      <label>
                        Return Method:
                        <select name="returnMethod" required>
                          <option value="delivery">Delivery</option>
                          <option value="take off">Take Off</option>
                        </select>
                      </label>
                      <label>
                        Return Date:
                        <input
                          type="date"
                          name="returnDate"
                          min={new Date().toISOString().split("T")[0]}
                          max={new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                          required
                        />
                      </label>
                      <button type="submit">Request Return</button>
                    </form>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Returns;