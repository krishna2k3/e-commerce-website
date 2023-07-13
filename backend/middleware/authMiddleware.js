import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import redis from "../config/redis.js";

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read the JWT from the cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const refreshToken = req.cookies.refresh;
//
        try {
          const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET
          );

          const redistoken = await redis.get(decodedRefreshToken.userId);

          if (redistoken === refreshToken) {
            const user = await User.findById(decodedRefreshToken.userId);
            if (user) {
              generateToken(res, user._id);
              generateRefreshToken(res, user._id);
              req.user = user;
              next();
            } else {
              res.status(401);
              throw new Error("Not authorized, user not found");
            }
          } else {
            console.log("Token not found in redis or token mismatch");
            throw new Error("Redis token not found or mismatch");
          }
        } catch (refreshError) {
          console.log(refreshError);
          res.status(401);
          throw new Error("Not authorized, refresh token failed");
        }
      } else {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin");
  }
};

export { protect, admin };
