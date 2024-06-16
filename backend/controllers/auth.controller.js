import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

// Signup Functionality
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (!fullName || !username || !email || !password) {
      console.log("here");
      return res.status(400).json({
        success: false,
        message: "All the fields are required",
        data: null,
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        data: null,
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already taken",
        data: null,
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
        data: null,
      });
    }

    if (typeof password === "string" && password.length > 6) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const newUser = await new User({
        fullName,
        username,
        email,
        password: hashedPassword,
      });
      if (newUser && hashedPassword) {
        generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();
        return res.status(201).json({
          success: true,
          message: "Signup successful, you can now log in",
          data: {
            username: newUser.username,
            fullName: newUser.fullName,
            email: newUser.email,
          },
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong, please try again",
          data: null,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Password must be greater than 6 character and contain alphanumeric characters",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our servers, please try again",
      data: null,
    });
  }
};



//Login Functionality
