import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authProtect = async (req, res, next) => {
  try {
    const { sessionSecret } = req.cookies;
    if (!sessionSecret) {
      return res.status(401).json({ success: false, message: "Provide a valid session secret", data: null });
    }

    const decoded = jwt.verify(sessionSecret, process.env.JWT_SECRET);
    if (decoded.userId) {

      const getUser = await User.findById(decoded.userId).select("-password");

      if (!getUser) {
        return res.status(404).json({
          success: false,
          message: "No user associated with this auth request",
          data: null,
        });
      }

      req.user = getUser;
      next();
    }
  } catch (error) {
    if (error.message == "invalid token") {
      return res.status(404).json({
        success: false,
        message: "Unauthorized Access: Invalid Token",
        data: null,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Error validating user, either token is invalid or there are some internal server errors",
        data: null,
      });
    }
  }
};
