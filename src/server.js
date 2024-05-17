const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../database/models/User');
const Post = require('../database/models/Post');
const Following = require('../database/models/Following');
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
    res.json({ message: 'Login successful', token, userId: user.id });
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
});

app.post('/post', async (req, res) => {
  const { owner_name, text } = req.body;

  try {
    const user = await User.findByUsername(owner_name);
    if(!user){
      return res.status(400).json({ error: 'Invalid username' });
    }
    const { insertId } = await Post.create({ owner_id: user.id, owner_name, text });
    const post = await Post.findById(insertId)
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the post' });
  }
});

app.post('/follow', async (req, res) => {
  const { follower_id, following_id } = req.body;

  try {
    const followId = await Following.followUser(follower_id, following_id);
    res.status(201).json({ message: 'Followed successfully', followId });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while following the user' });
  }
});

app.delete('/unfollow', async (req, res) => {
  const { follower_id, following_id } = req.body;

  try {
    const unfollowed = await Following.unfollowUser(follower_id, following_id);
    if (unfollowed) {
      res.status(200).json({ message: 'Unfollowed successfully' });
    } else {
      res.status(400).json({ error: 'Unfollow operation failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while unfollowing the user' });
  }
});

app.get('/following/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const following = await Following.getFollowingByUser(userId);
    res.status(200).json(following);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the following users' });
  }
});

app.get('/followers/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const followers = await Following.getFollowersByUser(userId);
    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the followers' });
  }
});

app.get('/posts-from-following-and-followers/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const posts = await Following.getPostsFromFollowingAndFollowers(userId);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the posts' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
