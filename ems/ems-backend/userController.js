const User = require('../models/User');

// GET /api/users/:id
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  const { name, bio } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (bio) updates.bio = bio;
  if (req.file) updates.avatar = req.file.path; // cloudinary URL

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
};

// PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword)))
    return res.status(401).json({ success: false, message: 'Current password incorrect' });

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
};

// DELETE /api/users/delete
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Password incorrect' });

  await user.deleteOne();
  res.json({ success: true, message: 'Account deleted' });
};
