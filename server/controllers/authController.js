import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });

    res.json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    // check password
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).json({ message: "Wrong password" });

    // create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};