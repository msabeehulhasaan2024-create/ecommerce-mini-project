const mongoose = require('mongoose');
const { Order } = require('../models/Order');

// @desc    Create new order (Cash on Delivery)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { products, totalPrice, shippingDetails } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No items in order.' });
    }

    if (!totalPrice && totalPrice !== 0) {
      return res.status(400).json({ message: 'Order total price is missing.' });
    }

    // Prepare products array matching schema, safely checking ObjectId
    const formattedProducts = products.map((item) => {
      const candidateId = item.product || item._id;
      const isValidId =
        candidateId &&
        mongoose.Types.ObjectId.isValid(candidateId) &&
        String(new mongoose.Types.ObjectId(candidateId)) === String(candidateId);

      return {
        product: isValidId ? candidateId : undefined,
        name: item.name || 'Tech Item',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || '',
      };
    });

    const order = new Order({
      userId: req.user._id,
      products: formattedProducts,
      totalPrice: Number(totalPrice),
      shippingDetails: {
        address: shippingDetails?.address || '',
        phone: shippingDetails?.phone || '',
        paymentMethod: 'Cash on Delivery',
      },
      orderStatus: 'Pending',
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Server error while creating order.' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error while fetching your orders.' });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error while fetching all orders.' });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status specified.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.orderStatus = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating order status.' });
  }
};

module.exports = { createOrder, getMyOrders, getOrders, updateOrderStatus };
