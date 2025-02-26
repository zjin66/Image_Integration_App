const express = require("express");
const multer = require('multer');
const path = require('path');
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};
const PORT = 5051;

app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')); // Save to the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Upload endpoint
app.post('/uploads', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
});



app.get("/api", (req, res) => {
    res.json({ name: ["Hi there,", "Greetings,", "Hello,"] });
});

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
})