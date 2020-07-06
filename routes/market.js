const express = require('express');
const Market = require('../models/Market');
const Product = require('../models/Product');
const getTasaDolar = require('../utils/dolar');
const productRouter = require('./product');
const { ensureAuthenticated } = require('../middleware/auth');

const router = express.Router();
router.use('/:marketId/products', productRouter);

// Description Show all Markets
// @route GET /markets

router.get('/', async (req, res) => {

    try {
        
        const markets = await Market.find()
        .populate('user', ['firstName', 'lastName'])
        .lean();
        
        res.render('markets/index', {
            markets,
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// description: Show add market page
//@route GET /markets/add

router.get('/add',ensureAuthenticated, (req, res) => {
    try {
        res.render('markets/add');
    } catch (err) {
        res.render('error/500');
    }
});

// description: Process add form
//@route POST /markets

router.post('/', ensureAuthenticated, async (req, res) => {
    try {
    req.body.user = req.user.id
    await Market.create(req.body);
    res.redirect('markets');
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// description: Show  edit market page
//@route GET /markets/edit/:id

router.get('/edit/:marketId', ensureAuthenticated,  async (req, res) => {
    try {
        let market = await Market.findById(req.params.marketId).lean();

        if(!market) {
            res.render('error/404');
        }

        // Cheking if market.user ( The user ID that created the market) I used
        // != instead of !== because market.user returns an object and
        // req.user.id returns a string
        if(market.user != req.user.id) {
            res.redirect('/markets');
        }
        else {
            res.render('markets/edit', {
                market
            });
        }
        
    } catch (err) {
        console.error(err);
        res.render('error/500');
    } 
});

// description: Process edit form
//@route PUT /markets/:id

router.put('/:marketId', ensureAuthenticated, async (req, res) => {
    try {
        let market = await Market.findById(req.params.marketId);
        if(!market) {
            res.render('/error/404');
        }
        if(market.user != req.user.id) {
            res.redirect('/markets');
        } else {
            market = await Market.findOneAndUpdate({ _id: req.params.marketId }, req.body, { 
                new: true,
                runValidators: true
            });
            res.redirect('/markets');
        }
    } catch (err) {
        console.error(err);
        res.send('error/500');
    }
});

// description: delete market
//@route delete /markets/:id

router.get('/:marketId/delete', ensureAuthenticated, async (req, res) => {
    try {
        const market = await Market.findById(req.params.marketId);
        if(market.user != req.user.id) {
            res.redirect('/markets');
            
        } else {
            market.remove();
            res.redirect('/markets');
        }
       
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

//Description Show one market
// @ route GET /markets/:id

router.get('/:marketId', async (req, res) => {
    try {
        const market = await Market.findById(req.params.marketId).lean();

        if(!market) {
            res.render('error/404');
        } else {
            const tasaDolar = await getTasaDolar();
            // await Product.updatePriceDolarAll();
            const products = await Product.find({market:req.params.marketId}).sort({category: 'asc'}).populate('market')
                                          .lean();
                                          
            res.render('markets/marketfull', {
                market,
                products,
                tasaDolar
            });
        }
    } catch (err) {
        console.error(err);
        res.render('error/404');
    }
});

module.exports = router;
