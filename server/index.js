const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const products = require('./data/products');
const coupons = require('./data/coupons');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Print3D API Running');
});

// Get all products
app.get('/api/products', (req, res) => {
  const category = req.query.category;
  if (category && category !== 'All') {
    const filtered = products.filter(p => p.category === category);
    return res.json(filtered);
  }
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
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
