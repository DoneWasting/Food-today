const express = require('express');
const Product = require('../models/Product');
const Market = require('../models/Market');
const Cart = require('../models/Cart');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');


router.get('/', (req, res) => {
    res.render('search');
});

// router.get('/:productName', async (req, res) => {
//     res.send({
//         name: req.params.productName
//     })
// });


// Add to product to cart Route
router.post('/:productName', ensureAuthenticated,  async (req, res) => {
    try {
        let addedProduct = await Product.findOne({name: req.params.productName});
        
        let findCart = await Cart.findOne({user:req.user._id});

        if(!findCart) {
            await Cart.create({user:req.user._id});
            let newCart = await Cart.findOne({user: req.user._id});
            newCart.addedProducts.push(addedProduct);
            newCart.save();
            res.redirect('/search');
        } else {
            findCart.addedProducts.push(addedProduct);
            await findCart.save();
            
            res.redirect('/search');
        }
        
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
    
});


router.get('/checkout', ensureAuthenticated, async (req, res) => {

    try {
        // Need to check for errors ( if cart exists) is useer etc etc..
        let userCart = await Cart.findOne({user:req.user._id}).lean();
        if(!userCart) {
            res.send('No cart found');
        } else {
            let allMarkets = await Market.find().lean();
            let comparisonArray = [];

            for (market of allMarkets) {
                let totalPriceBs = 0;
                let totalPriceDolar = 0;
                let productsInMarket = [];

                for (product of userCart.addedProducts) {
                    let match = await Product.findOne({name: product.name, market: market._id}).lean();

                    if(!match) {
                        match = 'Not found';
                    } else {
                        totalPriceBs+= match.priceBs;
                        totalPriceDolar+= match.priceDolar;
                    }
                    productsInMarket.push(match);
                }

                if(totalPriceBs === 0 || totalPriceDolar=== 0) {
                    continue;
                }
                totalPriceDolar = totalPriceDolar.toFixed(2);


                comparisonArray.push({
                    market: market.name,
                    matchedProducts: productsInMarket,
                    totalPriceBs,
                    totalPriceDolar
                });
                
            }
           console.log(comparisonArray[1].matchedProducts);
           comparisonArray = comparisonArray.sort((a,b) => {
               return a.totalPriceBs - b.totalPriceBs
           });  

            
        // await Cart.deleteOne({user: req.user._id});

        res.render('checkout', { 
            comparisonArray
        });
    }
    
    } catch (err) {
        console.error(err);
        res.render('error/500')
    }

});


module.exports = router;


