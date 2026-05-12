import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, User, Assignment, Exam } from "./src/db";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

async function startServer() {
  // Connect to Database
  await connectDB();

  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Middleware to verify JWT
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, role, department, studentId } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, fullName, role, department, studentId });
      await user.save();

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ token, user: user.toJSON() });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: user.toJSON() });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/auth/profile", authenticate, async (req: any, res) => {
    try {
      const { fullName, department, studentId } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { fullName, department, studentId },
        { new: true }
      ).select("-password");
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Assignments Routes
  app.get("/api/assignments", authenticate, async (req, res) => {
    try {
      const assignments = await Assignment.find().populate("teacherId", "fullName");
      res.json(assignments);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/assignments", authenticate, async (req: any, res) => {
    if (req.user.role !== "teacher") return res.status(403).json({ message: "Only teachers can create assignments" });
    try {
      const assignment = new Assignment({ ...req.body, teacherId: req.user.id });
      await assignment.save();
      res.status(201).json(assignment);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Exams Routes
  app.get("/api/exams", authenticate, async (req, res) => {
    try {
      const exams = await Exam.find().populate("teacherId", "fullName");
      res.json(exams);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/exams", authenticate, async (req: any, res) => {
    if (req.user.role !== "teacher") return res.status(403).json({ message: "Only teachers can create exams" });
    try {
      const exam = new Exam({ ...req.body, teacherId: req.user.id });
      await exam.save();
      res.status(201).json(exam);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/assignments/:id", authenticate, async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id).populate("teacherId", "fullName");
      res.json(assignment);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/assignments/:id/submit", authenticate, async (req: any, res) => {
    try {
      // For now, using a simple submission logic
      res.status(201).json({ message: "Submitted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/exams/:id", authenticate, async (req, res) => {
    try {
      const exam = await Exam.findById(req.params.id).populate("teacherId", "fullName");
      res.json(exam);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is healthy" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
