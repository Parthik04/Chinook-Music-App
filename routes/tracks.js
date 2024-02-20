const express = require('express');
const router = express.Router();
const Joi = require('joi');

// schema:- https://joi.dev/api/?v=17.9.1 
const trackSchema = Joi.object({
  Name: Joi.string().max(200).required(),
  AlbumId: Joi.number().integer().positive().required(),
  MediaTypeId: Joi.number().integer().positive().required(),
  GenreId: Joi.number().integer().positive().required(),
  composer: Joi.string().max(200).required()
});

module.exports = (db) => {
  // Endpoint to fetch & send tracks
  router.get('/', (req, res) => {
    const query = 'SELECT * FROM tracks';
    const tracks = db.prepare(query).all();
    res.json(tracks);
  });

  // Endpoint to create a new track
  router.post('/', (req, res) => {
    const validationResult = trackSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(422).json({ error: validationResult.error.details[0].message });
    }

    const { Name, AlbumId, MediaTypeId, GenreId, composer } = req.body;
    const statement = db.prepare('INSERT INTO tracks (Name, AlbumId, MediaTypeId, GenreId, Composer) VALUES (?, ?, ?, ?, ?)');
    const result = statement.run(Name, AlbumId, MediaTypeId, GenreId, composer);

    res.status(201).json({ message: 'Track created successfully', trackId: result.lastInsertRowid });
  });

  // Endpoint to update an existing track
  router.patch('/:trackId', (req, res) => {
    const { trackId } = req.params;
    const validationResult = trackSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(422).json({ error: validationResult.error.details[0].message });
    }

    const { Name, AlbumId, MediaTypeId, GenreId, composer } = req.body;
    const statement = db.prepare('UPDATE tracks SET Name = ?, AlbumId = ?, MediaTypeId = ?, GenreId = ?, Composer = ? WHERE TrackId = ?');
    const result = statement.run(Name, AlbumId, MediaTypeId, GenreId, composer, trackId);

    if (result.changes > 0) {
      res.json({ message: 'Track updated successfully' });
    } else {
      res.status(404).json({ error: 'Track not found' });
    }
  });

  // Endpoint to delete a track
  router.delete('/:trackId', (req, res) => {
    const { trackId } = req.params;
    const statement = db.prepare('DELETE FROM tracks WHERE TrackId = ?');
    const result = statement.run(trackId);

    if (result.changes > 0) {
      res.json({ message: 'Track deleted successfully' });
    } else {
      res.status(404).json({ error: 'Track not found' });
    }
  });

  return router;
};
