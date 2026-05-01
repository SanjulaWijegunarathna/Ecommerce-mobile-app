const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
  const { rating, comment, name, userId } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      res.status(400).json({ message: 'Product already reviewed' });
      return;
    }

    const review = {
      name,
      rating: Number(rating),
      comment,
      user: userId,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
  const { 
    name, 
    price, 
    description, 
    image, 
    category, 
    countInStock, 
    sizes, 
    colors, 
    discountPercentage,
    userId 
  } = req.body;

  const product = new Product({
    name,
    price,
    user: userId || '60d0fe4f5311236168a109ca', // Fallback to a mock user ID if not provided
    image,
    category,
    countInStock,
    description,
    sizes,
    colors,
    discountPercentage,
    numReviews: 0,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

module.exports = { getProducts, getProductById, createProductReview, createProduct };
