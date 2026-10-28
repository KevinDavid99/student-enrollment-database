
const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 8008;

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let students;
let courses;

async function startServer() {
  await client.connect();

  const db = client.db("academy_db");

  students = db.collection("students");
  courses = db.collection("courses");

  console.log("Connected to MongoDB Atlas");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Create a student
app.post("/students", async (req, res) => {
  try {
    const { name, email, age, course, status } = req.body;

    if (!name || !email || age === undefined || !course || !status) {
      return res.status(400).json({
        message: "Please provide all student fields",
      });
    }

    const student = { name, email, age, course, status };

    const result = await students.insertOne(student);

    res.status(201).json({
      message: "Student created",
      studentId: result.insertedId,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({ message: "Failed to create student" });
  }
});

// Create a course
app.post("/courses", async (req, res) => {
  try {
    const { title, duration, fee, status } = req.body;

    if (!title || duration === undefined || fee === undefined || !status) {
      return res.status(400).json({
        message: "Please provide all course fields",
      });
    }

    const course = { title, duration, fee, status };

    const result = await courses.insertOne(course);

    res.status(201).json({
      message: "Course created",
      courseId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create course" });
  }
});

startServer().catch((error) => {
  console.error("Could not connect to MongoDB Atlas:", error.message);
  process.exit(1);
});
