const { Product } = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error in getProducts controller:', error);
    res.status(500).json({
      message: 'Server error while fetching products.',
      error: error.message,
    });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    console.error(`Error in getProductById controller for ID ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Invalid product ID or server error.',
      error: error.message,
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Please provide both product name and price.' });
    }

    const product = new Product({
      name: name.trim(),
      price: Number(price),
      description: description ? description.trim() : '',
      image:
        image && image.trim()
          ? image.trim()
          : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error in createProduct controller:', error);
    res.status(500).json({
      message: error.message || 'Server error while creating product.',
      error: error.message,
    });
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) product.price = Number(price);
    if (description !== undefined) product.description = description.trim();
    if (image !== undefined) product.image = image.trim();

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(`Error in updateProduct controller for ID ${req.params.id}:`, error);
    res.status(500).json({
      message: error.message || 'Server error while updating product.',
      error: error.message,
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product successfully removed from catalog.' });
  } catch (error) {
    console.error(`Error in deleteProduct controller for ID ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error while deleting product.',
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
