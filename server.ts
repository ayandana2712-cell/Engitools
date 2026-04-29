import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// --- DATABASE MOCK ---
let db = {
  users: [] as any[],
  products: [] as any[],
  orders: [] as any[],
  reviews: [] as any[]
};

// Initialize DB safely
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db));
} else {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(data);
  } catch (e) {
    console.error('Error reading db.json, starting fresh.', e);
  }
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_engitools_key';

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Auth: Register
  app.post('/api/auth/register', async (req, res) => {
    const { name, mobile, email, password } = req.body;
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), name, mobile, email, password: hashedPassword };
    db.users.push(newUser);
    saveDb();
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, name, email } });
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  // Get current user profile
  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ id: user.id, name: user.name, email: user.email, mobile: user.mobile });
  });

  // Products: List all
  app.get('/api/products', (req, res) => {
    res.json(db.products);
  });

  // Products: Get single
  app.get('/api/products/:id', (req, res) => {
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  });

  // Products: Create listing (Seller setup)
  app.post('/api/products', authenticateToken, (req: any, res) => {
    const { name, description, condition, actualPrice, sellingPrice, image, category } = req.body;
    const newProduct = {
      id: uuidv4(),
      sellerId: req.user.id,
      name,
      description,
      condition,
      actualPrice: Number(actualPrice),
      sellingPrice: Number(sellingPrice),
      image,
      category,
      createdAt: new Date().toISOString()
    };
    db.products.push(newProduct);
    saveDb();
    res.status(201).json(newProduct);
  });

  // Products: Delete listing (Seller only)
  app.delete('/api/products/:id', authenticateToken, (req: any, res) => {
    const productIndex = db.products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) return res.status(404).json({ error: 'Product not found' });

    if (db.products[productIndex].sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this product' });
    }

    db.products.splice(productIndex, 1);
    saveDb();
    res.json({ success: true });
  });

  // Razorpay Initialization (Lazy or with fallback)
  let razorpayInstance: Razorpay | null = null;
  const initRazorpay = () => {
    if (!razorpayInstance) {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayInstance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
      }
    }
    return razorpayInstance;
  };

  // Payment: Create Order
  app.post('/api/payment/create-order', authenticateToken, async (req: any, res) => {
    try {
      const rzp = initRazorpay();
      if (!rzp) {
        return res.status(500).json({ error: 'Razorpay keys not configured' });
      }

      const { amount } = req.body; // Amount in INR
      const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_order_${uuidv4().substring(0, 8)}`,
      };

      const order = await rzp.orders.create(options);
      res.json({
        ...order,
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (error: any) {
      console.error('Razorpay Order Error:', error);
      res.status(500).json({ error: error.message || 'Something went wrong!' });
    }
  });

  // Payment: Verify
  app.post('/api/payment/verify', authenticateToken, (req: any, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Create actual order in DB
      const newOrder = {
        id: uuidv4(),
        userId: req.user.id,
        items: orderDetails.items,
        deliveryDetails: orderDetails.deliveryDetails,
        paymentMethod: 'Razorpay',
        razorpay_payment_id,
        razorpay_order_id,
        totalAmount: orderDetails.totalAmount,
        status: 'Paid',
        createdAt: new Date().toISOString()
      };
      db.orders.push(newOrder);
      saveDb();

      res.json({ success: true, message: 'Payment verified successfully', order: newOrder });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  });

  // Orders: Create (Mock/Offline Checkout)
  app.post('/api/orders', authenticateToken, (req: any, res) => {
    const { items, deliveryDetails, paymentMethod, totalAmount } = req.body;
    const order = {
      id: uuidv4(),
      userId: req.user.id,
      items,
      deliveryDetails,
      paymentMethod,
      totalAmount,
      status: 'Paid',
      createdAt: new Date().toISOString()
    };
    db.orders.push(order);
    saveDb();
    res.status(201).json(order);
  });

  // User Dashboard: Get order history and listed products
  app.get('/api/dashboard', authenticateToken, (req: any, res) => {
    const userOrders = db.orders.filter(o => o.userId === req.user.id);
    const listedProducts = db.products.filter(p => p.sellerId === req.user.id);
    res.json({ orders: userOrders, products: listedProducts });
  });

  // Reviews: Create review (must have bought?) Allow if logged in for simplicity prototype.
  app.post('/api/reviews', authenticateToken, (req: any, res) => {
    const { productId, rating, reviewText } = req.body;
    const newReview = {
      id: uuidv4(),
      productId,
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      reviewText,
      createdAt: new Date().toISOString()
    };
    db.reviews.push(newReview);
    saveDb();
    res.status(201).json(newReview);
  });

  // Reviews: Get for product
  app.get('/api/products/:id/reviews', (req, res) => {
    const productReviews = db.reviews.filter(r => r.productId === req.params.id);
    res.json(productReviews);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
