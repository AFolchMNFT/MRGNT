const express = require('express');
const { DISCIPLINES, NOTICIAS_CATEGORIES } = require('../constants');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ disciplines: DISCIPLINES, noticiasCategories: NOTICIAS_CATEGORIES });
});

module.exports = router;
