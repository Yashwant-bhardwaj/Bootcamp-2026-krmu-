const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REST: GET /api/chat/:room — paginated history
exports.getRoomMessages = async (req, res) => {
  const { room } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const messages = await Message.find({ room })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ success: true, messages: messages.reverse() });
};

// Socket.io real-time logic
exports.initSocket = (io) => {
  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.user._id.toString(), socket.id);
    io.emit('online_users', [...onlineUsers.keys()]);

    socket.on('join_room', (room) => socket.join(room));

    socket.on('send_message', async ({ room, text }) => {
      const msg = await Message.create({ sender: socket.user._id, room, text });
      await msg.populate('sender', 'name avatar');
      io.to(room).emit('receive_message', msg);
    });

    socket.on('typing', ({ room }) => {
      socket.to(room).emit('user_typing', { name: socket.user.name });
    });

    socket.on('mark_read', async ({ room }) => {
      await Message.updateMany(
        { room, readBy: { $ne: socket.user._id } },
        { $push: { readBy: socket.user._id } }
      );
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.user._id.toString());
      io.emit('online_users', [...onlineUsers.keys()]);
    });
  });
};
