import jwt from "jsonwebtoken";
import redis from "../config/redis.js";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "10s",
    audience: "userId",
  });

  //Set JWT as HTTP-Only cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
  });
};

const generateRefreshToken = (res, userId) => {
  const token = jwt.sign({ userId: userId }, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
    audience: "userId",
  });
  redis.set(userId.toString(), token, { ex: 30 * 24 * 60 * 60 });
  res.cookie("refresh", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
  });
};

export { generateToken, generateRefreshToken };
