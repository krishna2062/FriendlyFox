const express = require('express');
const { body, validationResult } = require('express-validator');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// POST /api/videos/upload
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }

    const videoUrl = `/uploads/${req.file.filename}`;
    const caption = req.body.caption || '';

    const video = await Video.create({
      userId: req.user.id,
      videoUrl,
      caption,
    });

    const populated = await Video.findById(video._id).populate(
      'userId',
      'username profilePic'
    );

    res.status(201).json(populated);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/videos/feed
router.get('/feed', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profilePic')
      .populate('comments.userId', 'username profilePic');

    const total = await Video.countDocuments();

    res.json({
      videos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalVideos: total,
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/videos/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePic')
      .populate('comments.userId', 'username profilePic');

    res.json(videos);
  } catch (error) {
    console.error('User videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/videos/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const likeIndex = video.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      video.likes.splice(likeIndex, 1);
    } else {
      video.likes.push(req.user.id);
    }

    await video.save();

    res.json({
      likes: video.likes,
      likesCount: video.likes.length,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Video not found' });
    }
    console.error('Like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/videos/:id/comment
router.post(
  '/:id/comment',
  auth,
  [
    body('text')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Comment must be 1-500 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      video.comments.push({
        userId: req.user.id,
        text: req.body.text,
      });

      await video.save();

      const updated = await Video.findById(req.params.id)
        .populate('userId', 'username profilePic')
        .populate('comments.userId', 'username profilePic');

      res.status(201).json(updated.comments);
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Video not found' });
      }
      console.error('Comment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
