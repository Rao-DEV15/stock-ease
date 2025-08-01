import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.post("/delete-image", async (req, res) => {
  const { public_id } = req.body;
  try {
    // cloudinary deletion
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👇 Serve frontend
app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
