const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(query);
  res.json({ success: true, users, total, page: Number(page) });
};

// PUT /api/admin/users/:id/ban
exports.banUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot ban admin' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'unbanned' : 'banned'}`, user });
};

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  const [totalUsers, activeUsers, totalRevenue, totalMessages] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Transaction.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Message.countDocuments(),
  ]);
  res.json({
    success: true,
    analytics: {
      totalUsers,
      activeUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalMessages,
    },
  });
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
};
