const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();


const app = express();

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors({
  origin: '*',                        // allow any origin (React Native clients, hosted frontends)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());             // handle preflight for all routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/api/ping', (req, res) => {
  res.json({ message: 'POST reached server successfully' });
});


app.get('/', (req, res) => {
  res.send('API is running...');
});

const visualRoutes = require('./routes/visualRoutes');

app.use('/api/settings', settingsRoutes);
app.use('/api/visuals', visualRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
