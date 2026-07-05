const jwt = require("jsonwebtoken");

// Temporary memory storage
const users = [];

const signToken = (email) => {
  return jwt.sign(
    { email },
    process.env.JWT_SECRET || "mysecretkey",
    { expiresIn: "7d" }
  );
};

// Signup
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields"
    });
  }

  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already exists"
    });
  }

  const user = {
    id: Date.now().toString(),
    name,
    email,
    password
  };

  users.push(user);

  const token = signToken(email);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
};

// Login
exports.login = async (req, res) => {

  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password"
    });
  }

  const token = signToken(email);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });

};

// Logout
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: "Logout Successful"
  });
};

// Current User
exports.getMe = (req, res) => {
  res.json({
    success: true,
    message: "User authenticated"
  });
};