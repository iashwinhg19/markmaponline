const express = require('express');  
const { execSync } = require('child_process');  
const fs = require('fs');  
const path = require('path');  
const bodyParser = require('body-parser');  
const cors = require('cors');  
  
const app = express();  
const PORT = process.env.PORT || 3000;  
  
// Middleware  
app.use(cors());  
app.use(bodyParser.json());  
app.use(express.static('public'));  
  
// Create directories  
if (!fs.existsSync('public')) fs.mkdirSync('public');  
if (!fs.existsSync('temp')) fs.mkdirSync('temp');  
  
// Convert markdown to markmap  
app.post('/convert', (req, res) => {  
  try {  
    // Get markdown content from request  
    const { markdown, filename = 'markmap' } = req.body;  
    if (!markdown) {  
      return res.status(400).json({ error: 'Markdown content is required' });  
    }  
  
    // Save markdown to temporary file  
    const mdFile = path.join('temp', `${filename}.md`);  
    fs.writeFileSync(mdFile, markdown);  
  
    // Generate HTML filename (same as in markmap-cli)  
    const htmlFile = path.join('public', `${filename.replace(/\.\w*$/, '')}.html`);  
      
    // Use markmap-cli to convert markdown to HTML  
    execSync(`npx markmap-cli ${mdFile} -o ${htmlFile}`);  
  
    // Return success with the URL to access the markmap  
    res.json({  
      success: true,  
      url: `/${path.basename(htmlFile)}`  
    });  
  } catch (error) {  
    console.error('Error converting markdown to markmap:', error);  
    res.status(500).json({ error: 'Failed to convert markdown to markmap' });  
  }  
});  
  
// Simple home page  
app.get('/', (req, res) => {  
  res.send(`  
    <html>  
      <head>  
        <title>Markmap Server</title>  
        <style>  
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }  
          code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }  
        </style>  
      </head>  
      <body>  
        <h1>Markmap Server</h1>  
        <p>This server converts Markdown to interactive mindmaps using Markmap.</p>  
        <h2>API Usage:</h2>  
        <pre>  
POST /convert  
Content-Type: application/json  
  
{  
  "markdown": "# Your Markdown Content\\n## With Headings\\n- And list items",  
  "filename": "your-custom-filename"  // Optional  
}  
        </pre>  
        <p>The response will contain a URL to access your markmap.</p>  
      </body>  
    </html>  
  `);  
});  
  
app.listen(PORT, () => {  
  console.log(`Markmap server running on port ${PORT}`);  
});
