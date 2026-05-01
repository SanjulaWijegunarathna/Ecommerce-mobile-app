const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Inventory = require('./models/Inventory');

const connectDB = require('./config/db');

dotenv.config();

connectDB();

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const importData = async () => {
  try {
    // 1. CLEAR EVERY COLLECTION
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    await Inventory.deleteMany();

    // 2. CREATE TEST USERS - use create() to trigger pre-save hash
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@atelier.com',
        password: 'admin123',
        isAdmin: true,
        isActive: true,
        phone: '+1234567890',
        addresses: [
          {
            label: 'Home',
            recipient: 'Admin User',
            street: '123 Admin St',
            city: 'New York',
            country: 'USA',
            isDefault: true
          }
        ]
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'john123',
        isAdmin: false,
        isActive: true,
        phone: '+9876543210',
        addresses: [
          {
            label: 'Home',
            recipient: 'John Doe',
            street: '456 Main St',
            city: 'Los Angeles',
            country: 'USA',
            isDefault: true
          },
          {
            label: 'Office',
            recipient: 'John Doe',
            street: '789 Office Ave',
            city: 'San Francisco',
            country: 'USA',
            isDefault: false
          }
        ]
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'jane123',
        isAdmin: false,
        isActive: true,
        phone: '+1122334455',
        addresses: [
          {
            label: 'Home',
            recipient: 'Jane Smith',
            street: '321 Oak Lane',
            city: 'Chicago',
            country: 'USA',
            isDefault: true
          }
        ]
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'mike123',
        isAdmin: false,
        isActive: true,
        phone: '+5544332211',
        addresses: [
          {
            label: 'Home',
            recipient: 'Mike Johnson',
            street: '654 Elm Street',
            city: 'Boston',
            country: 'USA',
            isDefault: true
          }
        ]
      }
    ]);

    console.log(`${users.length} users created with hashed passwords`);

    // 3. CREATE CATEGORIES
    const categories = await Category.insertMany([
      {
        name: 'Women',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
        description: 'The Silk Archive & Modern Silhouette'
      },
      {
        name: 'Men',
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1974&auto=format&fit=crop',
        description: 'Modern Tailoring & Essentials'
      },
      {
        name: 'Accessories',
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2076&auto=format&fit=crop',
        description: 'Leather Goods & Fine Details'
      }
    ]);

    console.log(`${categories.length} categories created`);

    // 4. CREATE PRODUCTS
    const products = await Product.insertMany([
      {
        user: users[0]._id,
        name: 'Silk Evening Gown',
        image: 'https://images.unsplash.com/photo-1566206091558-f47f2025ccf8?q=80&w=2071&auto=format&fit=crop',
        category: 'Women',
        description: 'A luxurious floor-length silk gown perfect for formal galas and evening events.',
        price: 349.99,
        countInStock: 15,
        rating: 4.9,
        numReviews: 24,
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Emerald', 'Midnight Blue', 'Crimson'],
        discountPercentage: 0
      },
      {
        user: users[0]._id,
        name: 'Cashmere Turtleneck',
        image: 'https://images.unsplash.com/photo-1574291814206-363acdf2aa79?q=80&w=2000&auto=format&fit=crop',
        category: 'Women',
        description: 'Ultra-soft pure cashmere turtleneck sweater for crisp autumn days.',
        price: 189.99,
        countInStock: 40,
        rating: 4.8,
        numReviews: 56,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Camel', 'Ivory', 'Charcoal'],
        discountPercentage: 10
      },
      {
        user: users[0]._id,
        name: 'Tailored Wool Overcoat',
        image: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=1974&auto=format&fit=crop',
        category: 'Men',
        description: 'A sharp, structured wool blend overcoat with modern lapel detailing.',
        price: 289.99,
        countInStock: 25,
        rating: 4.7,
        numReviews: 32,
        sizes: ['38R', '40R', '42R', '44R'],
        colors: ['Navy', 'Charcoal', 'Camel'],
        discountPercentage: 15
      },
      {
        user: users[0]._id,
        name: 'Classic Linen Shirt',
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1925&auto=format&fit=crop',
        category: 'Men',
        description: 'Breathable 100% linen button-down shirt, perfect for casual summer styling.',
        price: 89.99,
        countInStock: 80,
        rating: 4.5,
        numReviews: 45,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Sky Blue', 'Olive'],
        discountPercentage: 0
      },
      {
        user: users[0]._id,
        name: 'Italian Leather Briefcase',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1974&auto=format&fit=crop',
        category: 'Accessories',
        description: 'Handcrafted full-grain Italian leather briefcase with brass hardware.',
        price: 459.99,
        countInStock: 10,
        rating: 5.0,
        numReviews: 12,
        sizes: ['One Size'],
        colors: ['Cognac', 'Espresso', 'Black'],
        discountPercentage: 5
      },
      {
        user: users[0]._id,
        name: 'Oversized Blazer',
        image: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?q=80&w=2070&auto=format&fit=crop',
        category: 'Women',
        description: 'Chic, oversized blazer that transitions seamlessly from office to evening.',
        price: 159.99,
        countInStock: 35,
        rating: 4.6,
        numReviews: 28,
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Black', 'Houndstooth', 'Taupe'],
        discountPercentage: 20
      },
      {
        user: users[0]._id,
        name: 'Slim Fit Chinos',
        image: 'https://images.unsplash.com/photo-1624378439575-d1ead6bb17f8?q=80&w=1974&auto=format&fit=crop',
        category: 'Men',
        description: 'Versatile, slight-stretch chinos tailored for a modern slim fit.',
        price: 79.99,
        countInStock: 60,
        rating: 4.4,
        numReviews: 70,
        sizes: ['30x30', '32x30', '32x32', '34x32', '36x32'],
        colors: ['Khaki', 'Navy', 'Stone'],
        discountPercentage: 0
      },
      {
        user: users[0]._id,
        name: 'Gold Plated Minimalist Watch',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop',
        category: 'Accessories',
        description: 'Elegant timepiece featuring a slim profile, gold-plated mesh band, and minimalist dial.',
        price: 199.99,
        countInStock: 20,
        rating: 4.9,
        numReviews: 41,
        sizes: ['One Size'],
        colors: ['Rose Gold', 'Yellow Gold', 'Silver'],
        discountPercentage: 10
      }
    ]);

    console.log(`${products.length} products created`);

    // 5. CREATE ORDERS
    const orders = await Order.insertMany([
      {
        user: users[1]._id,
        orderItems: [
          {
            name: products[0].name,
            qty: 1,
            image: products[0].image,
            price: products[0].price,
            size: 'M',
            color: 'Blue',
            product: products[0]._id
          },
          {
            name: products[1].name,
            qty: 2,
            image: products[1].image,
            price: products[1].price,
            size: 'L',
            color: 'White',
            product: products[1]._id
          }
        ],
        shippingAddress: {
          address: '456 Main St',
          city: 'Los Angeles',
          postalCode: '90001',
          country: 'USA'
        },
        status: 'Delivered',
        paymentMethod: 'Credit Card',
        totalPrice: 119.97,
        trackingSteps: [
          { text: 'Order Placed', isCompleted: true },
          { text: 'Processing', isCompleted: true },
          { text: 'Shipped', isCompleted: true },
          { text: 'Out for Delivery', isCompleted: true },
          { text: 'Delivered', isCompleted: true }
        ]
      },
      {
        user: users[2]._id,
        orderItems: [
          {
            name: products[2].name,
            qty: 1,
            image: products[2].image,
            price: products[2].price,
            size: '32',
            color: 'Dark Blue',
            product: products[2]._id
          }
        ],
        shippingAddress: {
          address: '321 Oak Lane',
          city: 'Chicago',
          postalCode: '60601',
          country: 'USA'
        },
        status: 'Shipped',
        paymentMethod: 'PayPal',
        totalPrice: 79.99,
        trackingSteps: [
          { text: 'Order Placed', isCompleted: true },
          { text: 'Processing', isCompleted: true },
          { text: 'Shipped', isCompleted: true },
          { text: 'Out for Delivery', isCompleted: false },
          { text: 'Delivered', isCompleted: false }
        ]
      },
      {
        user: users[3]._id,
        orderItems: [
          {
            name: products[3].name,
            qty: 1,
            image: products[3].image,
            price: products[3].price,
            product: products[3]._id
          },
          {
            name: products[4].name,
            qty: 1,
            image: products[4].image,
            price: products[4].price,
            size: 'L',
            color: 'Cream',
            product: products[4]._id
          }
        ],
        shippingAddress: {
          address: '654 Elm Street',
          city: 'Boston',
          postalCode: '02101',
          country: 'USA'
        },
        status: 'Processing',
        paymentMethod: 'Credit Card',
        totalPrice: 269.98,
        trackingSteps: [
          { text: 'Order Placed', isCompleted: true },
          { text: 'Processing', isCompleted: true },
          { text: 'Shipped', isCompleted: false },
          { text: 'Out for Delivery', isCompleted: false },
          { text: 'Delivered', isCompleted: false }
        ]
      },
      {
        user: users[1]._id,
        orderItems: [
          {
            name: products[7].name,
            qty: 1,
            image: products[7].image,
            price: products[7].price,
            size: 'M',
            color: 'Red',
            product: products[7]._id
          }
        ],
        shippingAddress: {
          address: '789 Office Ave',
          city: 'San Francisco',
          postalCode: '94102',
          country: 'USA'
        },
        status: 'Pending',
        paymentMethod: 'Credit Card',
        totalPrice: 129.99,
        trackingSteps: [
          { text: 'Order Placed', isCompleted: true },
          { text: 'Processing', isCompleted: false },
          { text: 'Shipped', isCompleted: false },
          { text: 'Out for Delivery', isCompleted: false },
          { text: 'Delivered', isCompleted: false }
        ]
      }
    ]);

    console.log(`${orders.length} orders created`);

    // 6. CREATE INVENTORY ITEMS (used by Shop/Home screen)
    const inventoryItems = await Inventory.insertMany([
      {
        name: 'Silk Evening Gown',
        itemNumber: 'ATL-001',
        price: 34999,
        image: 'https://images.unsplash.com/photo-1566206091558-f47f2025ccf8?q=80&w=2071&auto=format&fit=crop',
        stock: 15,
        sizeStocks: { XS: 3, S: 4, M: 5, L: 3 },
        status: 'ACTIVE',
        category: 'Women',
        subCategory: 'Formal / Office Wear',
        discountPercentage: 0,
        colors: ['Emerald', 'Midnight Blue', 'Crimson'],
        materialCare: '100% Silk. Dry clean only.',
        shippingReturns: 'Express delivery. Free returns within 7 days.',
        sustainability: 'Ethically sourced silk.',
        isSeasonal: false
      },
      {
        name: 'Cashmere Turtleneck',
        itemNumber: 'ATL-002',
        price: 18999,
        image: 'https://images.unsplash.com/photo-1574291814206-363acdf2aa79?q=80&w=2000&auto=format&fit=crop',
        stock: 40,
        sizeStocks: { XS: 5, S: 10, M: 15, L: 10 },
        status: 'ACTIVE',
        category: 'Women',
        subCategory: 'Casual Wear',
        discountPercentage: 10,
        colors: ['Camel', 'Ivory', 'Charcoal'],
        materialCare: 'Pure Cashmere. Hand wash cold.',
        shippingReturns: 'Free shipping on orders over Rs. 5000.',
        sustainability: 'Sustainably sourced cashmere.',
        isSeasonal: true
      },
      {
        name: 'Oversized Blazer',
        itemNumber: 'ATL-003',
        price: 15999,
        image: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?q=80&w=2070&auto=format&fit=crop',
        stock: 35,
        sizeStocks: { S: 10, M: 15, L: 10 },
        status: 'ACTIVE',
        category: 'Women',
        subCategory: 'Formal / Office Wear',
        discountPercentage: 20,
        colors: ['Black', 'Houndstooth', 'Taupe'],
        materialCare: 'Wool blend. Dry clean recommended.',
        shippingReturns: 'Standard 3-5 days delivery.',
        sustainability: 'Made with recycled wool.',
        isSeasonal: true
      },
      {
        name: 'Tailored Wool Overcoat',
        itemNumber: 'ATL-004',
        price: 28999,
        image: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=1974&auto=format&fit=crop',
        stock: 25,
        sizeStocks: { M: 5, L: 10, XL: 10 },
        status: 'ACTIVE',
        category: 'Men',
        subCategory: 'Formal / Office Wear',
        discountPercentage: 15,
        colors: ['Navy', 'Charcoal', 'Camel'],
        materialCare: '100% Wool. Dry clean only.',
        shippingReturns: 'Free express shipping.',
        sustainability: 'Responsibly sourced premium wool.',
        isSeasonal: false
      },
      {
        name: 'Classic Linen Shirt',
        itemNumber: 'ATL-005',
        price: 8999,
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1925&auto=format&fit=crop',
        stock: 80,
        sizeStocks: { S: 15, M: 30, L: 25, XL: 10 },
        status: 'ACTIVE',
        category: 'Men',
        subCategory: 'Casual Wear',
        discountPercentage: 0,
        colors: ['White', 'Sky Blue', 'Olive'],
        materialCare: '100% Linen. Machine wash cold.',
        shippingReturns: 'Standard delivery island-wide.',
        sustainability: 'Organic linen.',
        isSeasonal: true
      },
      {
        name: 'Slim Fit Chinos',
        itemNumber: 'ATL-006',
        price: 7999,
        image: 'https://images.unsplash.com/photo-1624378439575-d1ead6bb17f8?q=80&w=1974&auto=format&fit=crop',
        stock: 60,
        sizeStocks: { M: 20, L: 25, XL: 15 },
        status: 'ACTIVE',
        category: 'Men',
        subCategory: 'Casual Wear',
        discountPercentage: 0,
        colors: ['Khaki', 'Navy', 'Stone'],
        materialCare: 'Cotton blend. Tumble dry low.',
        shippingReturns: 'Returns accepted within 14 days.',
        sustainability: 'Made with organic cotton.',
        isSeasonal: false
      },
      {
        name: 'Italian Leather Briefcase',
        itemNumber: 'ATL-007',
        price: 45999,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1974&auto=format&fit=crop',
        stock: 10,
        sizeStocks: { 'One Size': 10 },
        status: 'ACTIVE',
        category: 'Accessories',
        subCategory: 'Bags',
        discountPercentage: 5,
        colors: ['Cognac', 'Espresso', 'Black'],
        materialCare: 'Wipe clean. Use leather conditioner.',
        shippingReturns: 'Insured delivery. No returns on accessories.',
        sustainability: 'Vegetable-tanned leather.',
        isSeasonal: false
      },
      {
        name: 'Gold Plated Minimalist Watch',
        itemNumber: 'ATL-008',
        price: 19999,
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop',
        stock: 20,
        sizeStocks: { 'One Size': 20 },
        status: 'ACTIVE',
        category: 'Accessories',
        subCategory: 'Watches',
        discountPercentage: 10,
        colors: ['Rose Gold', 'Yellow Gold', 'Silver'],
        materialCare: 'Avoid water contact.',
        shippingReturns: '1-year warranty included.',
        sustainability: 'Recycled stainless steel.',
        isSeasonal: true
      }
    ]);

    console.log(`${inventoryItems.length} inventory items created`);

    console.log('✅ Database seeded with test data successfully!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // 1. SAFELY CLEAR ALL DATA EXCEPT THE ADMIN ACCOUNT
    // Instead of deleting users, we delete all standard users to preserve admin access
    await User.deleteMany({ isAdmin: false });
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    await Inventory.deleteMany();

    console.log('Safe Clear Complete: All collections emptied except Admin credentials!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (require.main === module) {
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    importData();
  }
}
