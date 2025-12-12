const express = require('express');
const router = express.Router();

router.get('/info', (req, res) => {
  res.json({ ok: true, name: 'Tactiball DeepSeek API', version: '1.0.0' });
});

module.exports = router;
