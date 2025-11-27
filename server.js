const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data/items.json");
const UPLOADS = path.join(__dirname, "uploads");

// Ensure folders exist
if(!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });
if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: "lostfoundsecret",
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, "public")));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- User routes ---

app.post("/add-item", upload.single("image"), (req, res) => {
  const { title, description, category, location, status } = req.body;
  const items = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  const newItem = {
    id: Date.now(),
    title,
    description,
    category,
    location,
    status,
    date: new Date().toLocaleDateString(),
    image: req.file ? `/uploads/${req.file.filename}` : null
  };
  items.push(newItem);
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
  res.redirect("/");
});

app.get("/items", (req, res) => {
  const items = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  res.json(items);
});

// --- Admin routes ---

app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;
  if(username === "Khert" && password === "123456789"){
    req.session.admin = true;
    res.redirect("/admin");
  } else {
    res.send("Invalid credentials. <a href='/admin-login.html'>Try again</a>");
  }
});

app.get("/admin", (req, res) => {
  if(!req.session.admin) return res.redirect("/admin-login.html");
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.post("/mark-retrieved", (req, res) => {
  if(!req.session.admin) return res.sendStatus(403);
  const { id } = req.body;
  const items = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  const item = items.find(i => i.id == id);
  if(item) item.status = "Retrieved";
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
  res.redirect("/admin");
});

app.get("/admin-logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Serve uploaded images
app.use("/uploads", express.static(UPLOADS));

// Start server
app.listen(PORT, () => {
  console.log(`LOST and FOUND ROXAS running at http://localhost:${PORT}`);
});
