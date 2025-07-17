const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  fullname: String,
  phone: String
}));

app.post('/register', async (req, res) => {
  console.log("Received register data:", req.body);  // ADD THIS

  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'Username or email missing' });
  }

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  console.log("Existing user found:", existing);  // ADD THIS

  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = new User(req.body);
  await user.save();

  res.json({ success: true, message: 'Registered successfully!' });
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const found = await User.findOne({ username, password });

    if (found) {
      res.json({ success: true, message: 'Login successful!' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
