const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { InferenceClient } = require("@huggingface/inference");

dotenv.config();
const app = express();
const client = new InferenceClient(process.env.HF_TOKEN);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const result = await client.textGeneration({
      model: "bigcode/starcoder",
      inputs: `# Python 3\n# ${prompt}`,
      parameters: { max_new_tokens: 300 }
    });

    const generated = result.generated_text || null;
    if (!generated) return res.json({ code: "No code generated." });

    const lines = generated.split("\n").slice(2).join("\n");
    res.json({ code: lines.trim() });
  } catch (error) {
    console.error("API Error:", error.message || error);
    res.status(500).json({ code: "API Error: " + (error.message || "Unknown error") });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
