const express = require('express');
const Market = require('../models/Market');
const Product = require('../models/Product');
const getExcelData = require('../utils/excel');
const path = require('path');
const fs = require('fs');
const { ensureAuthenticated } = require('../middleware/auth');

// Multer CONFIG
const multer  = require('multer');
const uploadDirectory = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDirectory)
    },
    filename: function (req, file, cb) {
      
      cb(null, file.fieldname + '.xlsx');
    }
  });
const upload = multer({ storage: storage })
// END MULTER CONFIG

const router = express.Router({mergeParams:true});

// TEST DE EXCEL
// async function excelTest() {
//     const data = await getExcelData();
//     for(product of data) {
//         await Product.createWithDolar(product.name, product.priceBs, product.category, '5ef9811e3197ca17e0a7a559');
//     }
// }

// excelTest();


router.get('/', async (req, res) => {
    const products = await Product.find({market: req.params.marketId}).populate('market').lean();
    res.send(products);
});

// Description Show Add Product Page
// @Route GET /markets/:marketId/products/add
router.get('/add', ensureAuthenticated, async (req, res ) => {
    try {
        const market = await Market.findById(req.params.marketId).lean();
        if(!market) {
            res.render('error/404')
        } 
        if(market.user != req.user.id) {
            res.redirect(`/markets/${req.params.marketId}`);
            
        } else {
            res.render('products/add', {
                market
            });
        }
    } catch (err) {
        console.error(err);
        res.render('/error/500');
    }
});

// Description Process Add Product Form
// @Route POST /markets/:marketId/products
router.post('/',ensureAuthenticated, async (req, res) => {

    try {
        const market = await Market.findById(req.params.marketId).lean();
        if(market.user != req.user.id) {
            res.redirect(`/markets/${req.params.marketId}`);
            
        } 
         else {
            const productData = {
            name: req.body.name,
            priceBs: Number.parseInt(req.body.priceBs),
            category: req.body.category,
            market: req.params.marketId
            }
            await Product.createWithDolar(productData.name, productData.priceBs, productData.category, productData.market);
        
        res.redirect(`/markets/${productData.market}`);
        }
    } catch (err) {
        console.error(err);
        res.render('/error/500');
    }
});

// --- TESTING MULTER ---------
router.post('/upload',  upload.single('excel'), async (req, res) => {
    try {
        const market = await Market.findById(req.params.marketId).lean();
        if(market.user != req.user.id) {
            res.redirect(`/markets/${req.params.marketId}`);
        } else {
            
            if(!req.file) {
                res.redirect(`/markets/${req.params.marketId}/products/add`);
            } else {
                const products = await getExcelData(uploadDirectory, req.file.filename);
                for(product of products) {
                    await Product.createWithDolar(product.name, product.priceBs, product.category, req.params.marketId);
                }
            res.redirect(`/markets/${req.params.marketId}`); 
            }
        }
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// Description Show Edit Product Page
// @Route GET /markets/:marketId/products/edit/:productId

router.get('/edit/:productId', ensureAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId).populate('market')
                                                                    .lean();
        
        if(!product) {
            res.render('error/404');
        }
        if(product.market.user != req.user.id) {
            res.redirect(`/markets/${req.params.marketId}`);
        } else {
            res.render('products/edit', {
                product
            });
        }   
    } catch (err) {
        console.error(err);
        res.render('/error/500');
    }
});

// Description Process Edit Product Form
// @Route PUT /markets/:marketId/products/:productId

router.put('/:productId', ensureAuthenticated, async (req, res) => {
    try {
        let product = await Product.findById(req.params.productId).populate('market');
        if(!product) {
            res.render('/error/404');
        }
        if(product.market.user != req.user.id) {
            res.redirect(`/markets/${req.params.marketId}`);
        } else {
            product = await Product.findByIdAndUpdate(req.params.productId, req.body, {
                new: true,
                runValidators: true
            });
            product = await product.updatePriceDolarOne();
            res.redirect(`/markets/${req.params.marketId}`);
        }
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// Description Process Delete Product Form
// @Route DELETE /markets/:marketId/products/:productId
router.delete('/:productId', ensureAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId).populate('market');

        if(product.market.user != req.user.id) {
            res.redirect(`/markets/${req.params.marketId}`);
        }  else {
            await product.remove();
            res.redirect(`/markets/${req.params.marketId}`);
        }
        
        
    } catch (err) {
        console.error(err);
        res.render('/error/500');
    }
});

module.exports = router;

