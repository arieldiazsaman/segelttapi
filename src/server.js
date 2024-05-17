const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../database/models/User');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_jwt';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const userId = await User.create({ name, username, email, password });
    return res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    await User.update(user.id, { session_token: token }, null)
    res.json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while logging in' });
  }
});

app.post('/logout', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findByUsername(username);
    if(!user){
      return res.status(400).json({ error: 'Invalid username' });
    }

    await User.update(user.id, null, { session_token: true });
    res.json({ message: 'Logout successful' });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while logging out' });
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
