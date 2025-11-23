import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import { logAction, LogActions } from "../utils/logger.js";

export const register = async (req, res) => {
  try {
    const { orgName, adminName, email, password } = req.body;

    if (!orgName || !adminName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create organisation and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: { name: orgName },
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await tx.user.create({
        data: {
          name: adminName,
          email,
          passwordHash: hashedPassword,
          organisationId: organisation.id,
        },
      });

      return { organisation, user };
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: result.user.id, orgId: result.organisation.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "8h" }
    );

    // Log the action
    await logAction(
      result.organisation.id,
      result.user.id,
      LogActions.USER_REGISTERED,
      'Organisation',
      result.organisation.id,
      `User ${result.user.name} registered organisation "${orgName}"`,
      { orgName, adminName, email }
    );

    res.status(201).json({ 
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email
      },
      organisation: {
        id: result.organisation.id,
        name: result.organisation.name
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { organisation: true }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, orgId: user.organisationId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "8h" }
    );

    // Log the login
    await logAction(
      user.organisationId,
      user.id,
      LogActions.USER_LOGGED_IN,
      'User',
      user.id,
      `User ${user.name} logged in`,
      { email }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      organisation: {
        id: user.organisation.id,
        name: user.organisation.name
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};