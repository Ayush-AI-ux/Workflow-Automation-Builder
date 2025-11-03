const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");  
const EmployeeModel = require("./models/Employee");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/employee");

const JWT_SECRET = "your_secret_key_here";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ayushmittal6377@gmail.com",   
    pass: "ulgo buhe gcdp hxnf"         
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await EmployeeModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await EmployeeModel.create({ email, password: hashedPassword });

    const mailOptions = {
      from: "ayushmittal6377@gmail.com",
      to: email,
      subject: "Welcome to Our App 🎉",
      text: `Hi ${email},\n\nWelcome to our platform! We're excited to have you onboard.\n\n- Team`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "User registered & welcome email sent", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await EmployeeModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No record existed" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "The password is incorrect" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/home", (req, res) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json({ success: false, message: "Token missing" });

  jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: "Invalid token" });

    res.json({ success: true, message: "Welcome to Home!", userId: decoded.id });
  });
});

app.listen(3001, () => {
  console.log("server is running on port 3001");
});
