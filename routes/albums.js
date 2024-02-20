const express = require('express');
const router = express.Router();
const Joi = require('joi');

const albumSchema = Joi.object({
  Title: Joi.string().max(130).required(),
  ArtistId: Joi.number().integer().positive().required(),
});

module.exports = (db) => {
  // Endpoint to fetch & send all albums
  router.get('/api/albums', (req, res) => {
    const query = 'SELECT * FROM albums';
    const albums = db.prepare(query).all();
    res.json(albums);
  });

  // Endpoint to create a new album
  router.post('/api/albums', (req, res) => {
    const validationResult = albumSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(422).json({ error: validationResult.error.details[0].message });
    }

    const { Title, ArtistId } = req.body;
    const statement = db.prepare('INSERT INTO albums (Title, ArtistId) VALUES (?, ?)');
    const result = statement.run(Title, ArtistId);

    res.status(201).json({ message: 'Album created successfully!!😊', albumId: result.lastInsertRowid });
  });

  // Endpoint to update an album
  router.patch('/api/albums/:albumId', (req, res) => {
    const { albumId } = req.params;
    const validationResult = albumSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(422).json({ error: validationResult.error.details[0].message });
    }

    const { Title, ArtistId } = req.body;
    const statement = db.prepare('UPDATE albums SET Title = ?, ArtistId = ? WHERE AlbumId = ?');
    const result = statement.run(Title, ArtistId, albumId);

    if (result.changes > 0) {
      res.json({ message: 'Album updated successfully!!😊' });
    } else {
      res.status(404).json({ error: 'Album not located please try again😢' });
    }
  });

  // Endpoint to delete an album
  router.delete('/api/albums/:albumId', (req, res) => {
    const { albumId } = req.params;
    const statement = db.prepare('DELETE FROM albums WHERE AlbumId = ?');
    const result = statement.run(albumId);

    if (result.changes > 0) {
      res.json({ message: 'Album deleted successfully😀' });
    } else {
      res.status(404).json({ error: 'Album not located please try again😢' });
    }
  });

  return router;
};
