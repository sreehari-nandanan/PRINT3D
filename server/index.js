const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const coupons = require('./data/coupons');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const productsFilePath = path.join(__dirname, 'data', 'products.json');
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to client/public/images so React can serve them
    const uploadPath = path.join(__dirname, '../client/public/images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Keep original extension
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]/g, '-');
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: storage });

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the path relative to public folder
  const imagePath = `/images/${req.file.filename}`;
  res.json({ imagePath });
});

const readProducts = () => {
  try {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products file:', error);
    return [];
  }
};

const writeProducts = (products) => {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 4));
  } catch (error) {
    console.error('Error writing products file:', error);
  }
};

app.get('/', (req, res) => {
  res.send('Print3D API Running');
});

// Get all products
app.get('/api/products', (req, res) => {
  const products = readProducts();
  const category = req.query.category;
  if (category && category !== 'All') {
    const filtered = products.filter(p => p.category === category);
    return res.json(filtered);
  }
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Add new product
app.post('/api/products', (req, res) => {
  const products = readProducts();
  const newProduct = req.body;

  // Auto-generate ID
  const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  newProduct.id = maxId + 1;

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const products = readProducts();
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index !== -1) {
    products[index] = { ...products[index], ...req.body, id }; // Ensure ID doesn't change
    writeProducts(products);
    res.json(products[index]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const products = readProducts();
  const id = parseInt(req.params.id);
  const newProducts = products.filter(p => p.id !== id);

  if (products.length !== newProducts.length) {
    writeProducts(newProducts);
    res.json({ message: 'Product deleted' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Validate coupon code
app.post('/api/validate-coupon', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      valid: false,
      message: 'Coupon code is required'
    });
  }

  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

  if (coupon) {
    res.json({
      valid: true,
      discount: coupon.discount,
      description: coupon.description,
      code: coupon.code
    });
  } else {
    res.json({
      valid: false,
      message: 'Invalid coupon code'
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
