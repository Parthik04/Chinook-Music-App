const express = require('express');
const router = express.Router();
const Joi = require('joi'); // Import Joi as we learn in class

// schema:- https://joi.dev/api/?v=17.9.1 
const artistSchema = Joi.object({
  Name: Joi.string().max(120).required(),
  
});

module.exports = (db) => {
  //Endpoint to fetch & send all albums
  router.get('/', (req, res) => {
    const query = 'SELECT * FROM artists';
    const artists = db.prepare(query).all();
    res.json(artists);
  });

  // Endpoint to create a new one artist
  router.post('/', (req, res) => {
    const validationResult = artistSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(422).json({ error: validationResult.error.details[0].message });
    }

    const { Name } = req.body;
    const statement = db.prepare('INSERT INTO artists (Name) VALUES (?)');
    const result = statement.run(Name);

    res.status(201).json({ message: 'Artist created successfully😀', artistId: result.lastInsertRowid });
  });

  // Endpoint to update  artist by name
  router.patch('/:artistId', (req, res) => {
    const { artistId } = req.params;
    const validationResult = artistSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(422).json({ error: validationResult.error.details[0].message });
    }

    const { Name } = req.body;
    const statement = db.prepare('UPDATE artists SET Name = ? WHERE ArtistId = ?');
    const result = statement.run(Name, artistId);

    if (result.changes > 0) {
      res.json({ message: 'Artist updated successfully' });
    } else {
      res.status(404).json({ error: 'Artist not found' });
    }
  });

  // Endpoint to delete  artist 
  router.delete('/:artistId', (req, res) => {
    const { artistId } = req.params;
    const statement = db.prepare('DELETE FROM artists WHERE ArtistId = ?');
    const result = statement.run(artistId);

    if (result.changes > 0) {
      res.json({ message: 'Artist deleted successfully😢' });
    } else {
      res.status(404).json({ error: 'Artist not found🤞' });
    }
  });

  return router;
};
