const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes could be added here in the future
// For now, the app uses mock data in the frontend

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Open http://localhost:${port} in your browser`);
}); 