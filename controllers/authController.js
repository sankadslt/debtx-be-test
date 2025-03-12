import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper function to generate tokens
const generateTokens = (user) => {
  const payload = {
    user_id: user.user_id,
    username: user.username,
    role: user.role,
    drc_id: user.drc_id,
    ro_id: user.ro_id,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "1d" });

  return { accessToken, refreshToken };
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { user_id, user_type, username, email, password, role, created_by, login_method, drc_id, sequence_id } = req.body;

    if (!user_id || !user_type || !username || !email || !password || !role || !created_by || !login_method) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate DRC User Registration
    if (role === "drc_user" && !drc_id) {
      return res.status(400).json({ message: "DRC user must have a valid drc_id" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      user_id,
      user_type,
      username,
      email,
      password: hashedPassword,
      role,
      created_by,
      login_method,
      user_status: true,
      sequence_id,
      drc_id: role === "drc_user" ? drc_id : null,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.user_status) {
      return res.status(403).json({ message: "Account is disabled. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Refresh tokens
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findOne({ user_id: decoded.user_id });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken, username: user.username });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Get user data by user_id
export const getUserData = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      user_id: user.user_id,
      user_type: user.user_type,
      username: user.username,
      email: user.email,
      role: user.role,
      created_by: user.created_by,
      created_on: user.created_on,
      user_status: user.user_status,
      login_method: user.login_method,
      sequence_id: user.sequence_id,
      drc_id: user.drc_id,
      ro_id: user.ro_id,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data", error: error.message });
  }
};