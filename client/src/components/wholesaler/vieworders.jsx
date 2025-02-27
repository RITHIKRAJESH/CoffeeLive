import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, MenuItem, Select, InputLabel, FormControl, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Payment} from "@mui/icons-material";

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState({});
  const [totalAmount, setTotalAmount] = useState({});
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded?.payload?._id;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/wholesale/vieworders`)
      .then((res) => {
        setOrders(res.data);
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const filteredOrders = orders.filter(
    (item) =>
      item.productId &&
      item.productId.userid === userId &&
      item.status !== "paid" &&
      item.status !== "cancelled"
  );

  const handleCollect = (orderId) => {
    const status = {
      message: "collected",
      id: orderId,
    };
    axios
      .post(`${import.meta.env.VITE_BASE_URL}/wholesale/updatestatus`, status)
      .then((res) => {
        alert(res.data);
        // Reload the page after status update
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  const handleCancel = (orderId) => {
    const status = {
      message: "cancelled",
      id: orderId,
    };
    axios
      .post(`${import.meta.env.VITE_BASE_URL}/wholesale/updatestatus`, status)
      .then((res) => {
        alert(res.data);
        // Reload the page after status update
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  const handlePayment = (orderId) => {
    const selectedOrder = orders.find((order) => order._id === orderId);
    setSelectedOrder(selectedOrder);
    setOpenPaymentModal(true);
  };

  const handleQualityChange = (orderId, quality, price) => {
    setSelectedQuality((prev) => ({
      ...prev,
      [orderId]: quality,
    }));

    setTotalAmount((prev) => ({
      ...prev,
      [orderId]: price * filteredOrders.find((order) => order._id === orderId).quantity,
    }));
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setPaymentSuccess(false);
  };

  const updateOrderAfterPayment = (orderId, updatedData) => {
    // Make an API call to update the order's quantity, total price, and status
    axios
      .post(`${import.meta.env.VITE_BASE_URL}/wholesale/updatepayment`, {
        id: orderId,
        ...updatedData,
      })
      .then((response) => {
        console.log(response.data); // Log response if needed
        setPaymentSuccess(true);
        setTimeout(() => {
          setOpenPaymentModal(false);
          window.location.reload();
        }, 3000);
      })
      .catch((error) => {
        console.error("Error updating order:", error);
      });
  };

  const handleMakePayment = () => {
    const updatedData = {
      status: "paid", 
      quality: selectedOrder.quality,
      totalprice: totalAmount[selectedOrder._id], 
    };

    updateOrderAfterPayment(selectedOrder._id, updatedData);
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 1200, margin: "auto", mt: 4, p: 2 }}>
  <Typography variant="h5" align="center" gutterBottom>
    <strong>Product Purchase Details</strong>
  </Typography>

  {filteredOrders.length === 0 ? (
    <Typography variant="body1" align="center">
      No orders found.
    </Typography>
  ) : (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: "bold" }}>Product Name</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>

          {/* Conditionally render Quality column */}
          {filteredOrders.some((order) => order.status === "collected") && (
            <TableCell sx={{ fontWeight: "bold" }}>Quality</TableCell>
          )}

          {/* Conditionally render Total Amount column */}
          {filteredOrders.some((order) => order.status === "collected") && (
            <TableCell sx={{ fontWeight: "bold" }}>Total Amount</TableCell>
          )}

          <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {filteredOrders.map((order) => (
          <TableRow key={order._id}>
            <TableCell>{order.productId.productName}</TableCell>
            <TableCell>{order.quantity} KG</TableCell>
            <TableCell>{new Date(order.productId.date).toLocaleDateString()}</TableCell>
            <TableCell>{order.status.toUpperCase()}</TableCell>

            {/* Conditionally render Quality column */}
            {order.status === "collected" && (
              <TableCell>
                <FormControl fullWidth>
                  <InputLabel>Quality</InputLabel>
                  <Select
                    value={selectedQuality[order._id] || ""}
                    label="Quality"
                    onChange={(e) => {
                      const selectedOption = e.target.value;
                      const selectedProduct = order.productId.productCategory.find(
                        (item) => item.quality === selectedOption
                      );
                      handleQualityChange(order._id, selectedOption, selectedProduct.price);
                    }}
                  >
                    {order.productId.productCategory.map((category) => (
                      <MenuItem key={category._id} value={category.quality}>
                        {category.quality}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
            )}

            {/* Conditionally render Total Amount column */}
            {order.status === "collected" && (
              <TableCell>{totalAmount[order._id] ? `₹${totalAmount[order._id]}` : "-"}</TableCell>
            )}

            <TableCell>
              {order.status !== "collected" && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{ mr: 1 }}
                  onClick={() => handleCollect(order._id)}
                >
                  Collect
                </Button>
              )}

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleCancel(order._id)}
              >
                Cancel
              </Button>

              {order.status === "collected" && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handlePayment(order._id)}
                >
                  Pay Now
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )}

  {/* Payment Modal */}
  <Dialog open={openPaymentModal} onClose={handleClosePaymentModal} maxWidth="sm" fullWidth>
    <DialogTitle>Payment Details</DialogTitle>
    <DialogContent>
      {selectedOrder && (
        <div>
          <Typography variant="h6">Account Number: {selectedOrder.userId.accountno}</Typography>
          <Typography variant="h6">IFSC: {selectedOrder.userId.ifsc}</Typography>
          <Typography variant="h6">Username: {selectedOrder.userId.username}</Typography>

          {/* Simulate showing payment amount */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total Amount: ₹{totalAmount[selectedOrder._id]}
          </Typography>
        </div>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClosePaymentModal} color="secondary">
        Cancel
      </Button>
      <Button onClick={handleMakePayment} color="primary" variant="contained">
        Make Payment
      </Button>
    </DialogActions>
    {paymentSuccess && (
      <Typography variant="h6" color="success" align="center" sx={{ mt: 2 }}>
        <Payment/>Payment Successfully Completed
      </Typography>
    )}
  </Dialog>

  <Button onClick={() => navigate("/wholesale")}>BACK TO DASHBOARD</Button>
</TableContainer>

  );
}
