require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const crc32 = require('crc-32')
const dns = require('dns')

app.use(bodyParser.urlencoded({extended: false}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Sample data - Replace this with your own mapping
const urlDatabase = {};

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url
  const hash = crc32.str(url).toString(16);
  const numericHash = parseInt(hash, 16);
  const shortUrl = Math.abs(numericHash);

   // Store the mapping of shortUrl to original URL in the database
   urlDatabase[shortUrl] = url
   
  // Extract the hostname from the URL
  const { hostname } = new URL(url);

  // Use dns.lookup to resolve the IP address for the hostname
  dns.lookup(hostname, (err, address) => {
    if (err) {
      res.json({ 
        error: 'invalid url' 
      })
    } else {
      res.json({
        original_url: url,
        short_url: shortUrl
      })
    }
  });
})

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortCode = req.params.short_url;
  const longUrl = urlDatabase[shortCode];

  if (longUrl) {
    // Redirect to the original long URL
    res.redirect(longUrl);
  } else {
    res.json({
      error: 'Short URL not found'
    });
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
