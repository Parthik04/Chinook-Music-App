const express = require('express');
const router = express.Router();
const Joi = require('joi');

// schema:- https://joi.dev/api/?v=17.9.1 
const themeSchema = Joi.object({
  id: Joi.number().required(),
  href: Joi.string().required(),
  integrity: Joi.string().required(),
  theme: Joi.string().required(),
});

module.exports = (db) => {
  // Endpoint to fetch & send all themes
  router.get('/', (req, res) => {
    const query = 'SELECT * FROM themes';
    const themes = db.prepare(query).all();
    res.json(themes);
  });

  // Endpoint to create a new theme
  router.post('/', (req, res) => {
    const validationResult = themeSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(422).json({ error: validationResult.error.details[0].message });
    }

    // Extract theme properties from req.body
    const { id, href, integrity, theme } = req.body;

    try {
      const statement = db.prepare('INSERT INTO themes (id, href, integrity, theme) VALUES (?, ?, ?, ?)');
      const result = statement.run(id, href, integrity, theme);

      console.log(result);

      res.status(201).json({ message: 'Theme created successfully' });
    } catch (error) {
      console.error('An error occurred creating theme:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Endpoint to update a theme
  router.patch('/:themeId', (req, res) => {
    const { themeId } = req.params;
    const validationResult = themeSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(422).json({ error: validationResult.error.details[0].message });
    }

    // Extract theme properties from req.body
    const { id, href, integrity, theme } = req.body;

    // Perform theme update in the database
    try {
      const statement = db.prepare('UPDATE themes SET id = ?, href = ?, integrity = ?, theme = ? WHERE ThemeId = ?');
      const result = statement.run(id, href, integrity, theme, themeId);

      console.log(result);

      if (result.changes > 0) {
        res.json({ message: 'Theme updated successfully' });
      } else {
        res.status(404).json({ error: 'Theme not found' });
      }
    } catch (error) {
      console.error('An error occurred updating theme:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Endpoint to delete a theme
  router.delete('/:themeId', (req, res) => {
    const { themeId } = req.params;

    // Perform theme deletion in the database
    try {
      const statement = db.prepare('DELETE FROM themes WHERE id = ?');
      const result = statement.run(themeId);

      console.log(result);

      if (result.changes > 0) {
        res.json({ message: 'Theme deleted successfully' });
      } else {
        res.status(404).json({ error: 'Theme not found' });
      }
    } catch (error) {
      console.error('An error occurred deleting theme:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
