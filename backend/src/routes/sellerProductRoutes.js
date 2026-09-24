import express from 'express';
import multer from 'multer';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${unique}.${ext}`);
  },
});
const upload = multer({ storage });
const router = express.Router();

// Create a new product for a seller (mock implementation)
router.post('/:sellerId/products', upload.single('image'), (req, res) => {
  const { sellerId } = req.params;
  const { name, price, description, category, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const product = {
    _id: `prod_${Math.floor(Math.random() * 100000)}`,
    sellerId,
    name,
    price,
    description,
    category,
    imageUrl,
    stock,
  };
  res.status(201).json({ message: 'Product created', product });
});

// Get all products for a seller (mock data)
router.get('/:sellerId/products', (req, res) => {
  const { sellerId } = req.params;
  const products = [
    {
      _id: 'prod_1',
      sellerId,
      name: 'Mock Product A',
      price: 1999,
      description: 'A great product',
      category: 'Misc',
      imageUrl: 'https://via.placeholder.com/150',
      stock: 10,
    },
    {
      _id: 'prod_2',
      sellerId,
      name: 'Mock Product B',
      price: 2999,
      description: 'Another great product',
      category: 'Misc',
      imageUrl: 'https://via.placeholder.com/150',
      stock: 5,
    },
  ];
  res.json(products);
});

export default router;
