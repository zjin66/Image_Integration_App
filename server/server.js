const express = require("express");
const multer = require('multer');
const path = require('path');
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};
const PORT = process.env.PORT || 5051;

app.use(cors(corsOptions));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require("dotenv").config();
const apiKey = process.env.API_KEY;



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


app.post("/integrate", async (req, res) => {
    const { image } = req.body; // Get base64 image from frontend

    try {
        const response = await axios.post(
            "https://api.replicate.com/v1/predictions",
            {
                version: "stability-ai/stable-diffusion-inpainting",
                input: {
                    image, // The captured image from the playground
                    prompt: "Blend all elements smoothly into a natural and photorealistic composition.",
                    mask: "full",
                    num_inference_steps: 50,
                    guidance_scale: 7.5,
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${apiKey}`, // Use secure API key
                },
            }
        );

        res.json({ output: response.data.output });
    } catch (error) {
        console.error("AI integration error:", error);
        res.status(500).json({ error: "Integration failed" });
    }
});


app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
})