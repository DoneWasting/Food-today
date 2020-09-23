const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/tutorial', (req, res) => {
    res.render('searchtutorial');
} )

module.exports = router;