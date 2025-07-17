const mongoose = require('mongoose');

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

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const users = [];

app.post('/register', async (req, res) => {
  const { username, email } = req.body;

  // Check for duplicates
  const existing = await User.findOne({ $or: [ { username }, { email } ] });
  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = new User(req.body);
  await user.save();
  res.json({ success: true, message: 'Registered successfully!' });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const found = users.find(u => u.username === username && u.password === password);

  if (found) {
    res.json({ success: true, message: 'Login successful!' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
