const express = require('express');
const Database = require('better-sqlite3');///@4) 
const multer = require('multer');//@);: Imports the Multer library for handling file uploads.
const bodyParser = require('body-parser');
const path = require('path');
const artistsRouter = require('./routes/artists');
const albumsRouter = require('./routes/albums');
const tracksRouter = require('./routes/tracks');
const themesRouter = require('./routes/themes');

const app = express();//@6)
const db = new Database(process.cwd() + '/Database/chinook.sqlite');//@4)

// process.cwd()

const PORT = 4000;

//@2) Serve static content from the '_FrontendStarterFiles' folder
app.use(express.static('_FrontendStarterFiles'));
// Middleware for parsing JSON in request body
app.use(bodyParser.json());
// app.use(morgan('tiny'))


//@3) Endpoint to fetch and send all artists
app.get('/api/artists', (req, res) => {
  const query = 'SELECT * FROM artists';
  const artists = db.prepare(query).all();
  res.json(artists);
});


// Endpoint to fetch and send albums for a specific artist
// app.get('/api/artists/:artistId/albums', (req, res) => {
//   const { artistId } = req.params;

//   // Fetch the artist using ArtistId
//   const artistQuery = 'SELECT * FROM artists WHERE ArtistId = ?';
//   const artist = db.prepare(artistQuery).get(artistId);

//   if (!artist) {
//     return res.status(404).json({ error: 'Artist not found' });
//   }

//   // Fetch albums for the specified artist
//   const albumsQuery = 'SELECT * FROM albums WHERE ArtistId = ?';
//   const albums = db.prepare(albumsQuery).all(artist.ArtistId);

//   res.json(albums);
// });


// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: './_FrontendStarterFiles/albumart',
  filename: function (req, file, callback) {
    callback(null, Date.now().toString() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Endpoint to handle file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
 
  // 'file'the file input in your form
  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// Endpoint to upload album art for a specific album
app.post('/api/albums/:albumId/albumart', upload.single('albumart'), (req, res) => {
  try {
    // Update the album in the database with the new albumart filename
    const statement = db.prepare('UPDATE albums SET AlbumArt = ? WHERE AlbumId = ?');
    const result = statement.run([req.file.filename, req.params.albumId]);

    console.log(result);

    // Respond with success
    res.status(201).json(result);
  } catch (error) {
    console.error('An error occurred updating album art:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch and send all artists
app.get('/api/artists', (req, res) => {
  const query = 'SELECT * FROM artists';
  const artists = db.prepare(query).all();
  res.json(artists);
});

// Endpoint to fetch and send albums for a specific artist
app.get('/api/artists/:artistId/albums', (req, res) => {
  const { artistId } = req.params;

  // Fetch the artist using ArtistId
  const artistQuery = 'SELECT * FROM artists WHERE ArtistId = ?';
  const artist = db.prepare(artistQuery).get(artistId);

  if (!artist) {
    return res.status(404).json({ error: 'Artist not found' });
  }

  // Fetch albums for the specified artist
  const albumsQuery = 'SELECT * FROM albums WHERE ArtistId = ?';
  const albums = db.prepare(albumsQuery).all(artist.ArtistId);

  res.json(albums);
});

// Endpoint to fetch and send tracks for a specific album
app.get('/api/albums/:albumId/tracks', (req, res) => {
  try {
    const statement = db.prepare('SELECT * FROM tracks WHERE AlbumId = ?');
    const tracks = statement.all(req.params.albumId);

    res.status(200).json(tracks);
  } catch (error) {
    console.error('An error occurred fetching Tracks data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Use routers for specific functionalities
app.use('/api/artists', artistsRouter(db));
app.use('/api/albums', albumsRouter(db));
app.use('/api/tracks', tracksRouter(db));
app.use('/api/themes', themesRouter(db));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
