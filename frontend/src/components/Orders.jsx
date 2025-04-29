import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view orders");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:3000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Orders:", response.data);
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch orders error:", error);
        setError(error.response?.data?.message || "Failed to load orders");
        setLoading(false);
      });
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.patch(
        `http://localhost:3000/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Status update response:", response.data); // Debug

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert(`Order status updated to ${newStatus}!`);
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="orders">
      <h2>Your Orders</h2>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && !error ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order">
            <h3>Order #{order._id.slice(-6)}</h3>
            <p>Status: {order.status}</p>
            <p>Total Buy: ${order.totalBuy.toFixed(2)}</p>
            <p>Total Rent: ${order.totalRent.toFixed(2)}</p>
            <p>Rent Credit: ${order.rentCredit.toFixed(2)}</p>
            <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
            <h4>Items:</h4>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.productName} ({item.type}, Qty: {item.quantity}, Price: ${item.price.toFixed(2)})
                </li>
              ))}
            </ul>
            <div className="status-update">
              <label>Update Status: </label>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;