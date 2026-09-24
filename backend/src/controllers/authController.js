import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Default seed accounts for out-of-the-box user & admin access
export const defaultAccounts = [
  {
    name: 'Platform Administrator',
    email: 'admin@shopsphere.com',
    password: 'Admin@123',
    role: 'Platform Admin'
  },
  {
    name: 'Verified Customer',
    email: 'customer@shopsphere.com',
    password: 'Customer@123',
    role: 'Customer'
  },
  {
    name: 'Apex Merchant Store',
    email: 'seller@shopsphere.com',
    password: 'Seller@123',
    role: 'Seller'
  },
  {
    name: 'Swift Logistics Partner',
    email: 'delivery@shopsphere.com',
    password: 'Delivery@123',
    role: 'Delivery Partner'
  }
];

// Helper: Seed default accounts if they don't already exist in database
export const seedDefaultUsers = async () => {
  try {
    for (const acc of defaultAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create({
          name: acc.name,
          email: acc.email,
          password: acc.password,
          role: acc.role
        });
        console.log(`[Auth] Seeded default user: ${acc.email} (${acc.role})`);
      }
    }
  } catch (err) {
    console.warn('[Auth] Note: MongoDB connection pending or seed skipped:', err.message);
  }
};

// Run initial seed
seedDefaultUsers();

// Email format regex validation
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    // Validations
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required.' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address (e.g., user@domain.com).' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
    }

    // Role validation
    const allowedRoles = ['Customer', 'Seller', 'Platform Admin', 'Support Agent', 'Delivery Partner'];
    const assignedRole = allowedRoles.includes(role) ? role : 'Customer';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        message: 'Registration successful!'
      });
    } else {
      return res.status(400).json({ message: 'Invalid user registration data.' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validations
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address format.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try finding in database
    let user = await User.findOne({ email: normalizedEmail });

    // Fallback self-healing: if database was wiped or not seeded, check default accounts
    if (!user) {
      const defaultAcc = defaultAccounts.find(a => a.email.toLowerCase() === normalizedEmail);
      if (defaultAcc && defaultAcc.password === password) {
        try {
          user = await User.create({
            name: defaultAcc.name,
            email: defaultAcc.email,
            password: defaultAcc.password,
            role: defaultAcc.role
          });
        } catch (e) {
          // If DB write fails, return verified object
          return res.json({
            _id: 'usr_' + Date.now(),
            name: defaultAcc.name,
            email: defaultAcc.email,
            role: defaultAcc.role,
            token: generateToken('usr_' + Date.now(), defaultAcc.role),
            message: `Welcome back, ${defaultAcc.name}!`
          });
        }
      }
    }

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        message: `Welcome back, ${user.name}!`
      });
    } else {
      return res.status(401).json({
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// POST /api/auth/google (Social Registration & Login)
export const googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, avatar, role } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid Google account email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // User exists: update Google ID and avatar if needed
      let hasChanges = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        hasChanges = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        hasChanges = true;
      }
      if (hasChanges) {
        await user.save();
      }
    } else {
      // User does not exist: register user directly with Google details!
      const allowedRoles = ['Customer', 'Seller', 'Platform Admin', 'Support Agent', 'Delivery Partner'];
      const assignedRole = allowedRoles.includes(role) ? role : 'Customer';
      const cleanName = (name && name.trim()) ? name.trim() : normalizedEmail.split('@')[0];

      user = await User.create({
        name: cleanName,
        email: normalizedEmail,
        googleId: googleId || `google_${Date.now()}`,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
        authProvider: 'google',
        role: assignedRole
      });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      authProvider: user.authProvider || 'google',
      token: generateToken(user._id, user.role),
      message: `Signed in successfully with Google as ${user.name}`
    });
  } catch (error) {
    console.error('Google Auth Controller Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during Google authentication' });
  }
};
