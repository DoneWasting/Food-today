const express = require('express');
const Market = require('../models/Market');
const Product = require('../models/Product');

const getExcelData = require('../utils/excel');
const path = require('path');
const fs = require('fs');
const { ensureAuthenticated } = require('../middleware/auth');

// Multer CONFIG
const multer  = require('multer');
const getTasaDolar = require('../utils/dolar');
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
            await Product.createWithDolar(req.body.name, req.body.priceBs, req.body.mainCategory, req.body.subCategory, req.body.itemCategory, market);
            res.redirect(`/markets/${productData.market}`);
        }
    } catch (err) {
        console.error(err);
        res.render('/error/500');
    }
});

// Procces upload form
router.post('/upload',  [ensureAuthenticated, upload.single('excel')], async (req, res) => {
    try {
        let market = await Market.findById(req.params.marketId);
        if(market.user != req.user.id) {
            res.redirect(`/markets/${req.params.marketId}`);
        } else {
            // If there is no file
            if(!req.file) {
                req.flash('upload_error', 'Please select a excel file to be uploaded!');
                res.redirect(`/markets/${req.params.marketId}/products/add`);
                
            } else {
                if(req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    req.flash('upload_error', 'Wrong file format, make sure you are uploading an excel file!');
                    res.redirect(`/markets/${req.params.marketId}/products/add`);
                } else {
                    const products = await getExcelData(uploadDirectory, req.file.filename);
                    await Product.createManyWithDolar(products, req.params.marketId);
                    // I used market2 because when i used market declared above
                    // the links wouldn't show, (The categories weren't assigned)
                    let market2 = await Market.findById(req.params.marketId);
                    await market2.setUpCategories();
                    res.redirect(`/markets/${req.params.marketId}`); 
                }
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



router.get('/:mainCategory', ensureAuthenticated, async (req, res) => {
    try {
        const market = await Market.findById(req.params.marketId).lean();
        const tasaDolar = await getTasaDolar();
        const pageOptions = {
            page: parseInt(req.query.page, 10) || 0,
            limit: parseInt(req.query.limit, 10) || 10
        }
        const totalPages = Math.floor( ( await Product.countDocuments({market:req.params.marketId, mainCategory: req.params.mainCategory}) ) / 10 );
        let totalPagesArray = [];
        
        for(let i = 0; i <= totalPages; i ++){
            totalPagesArray.push(`?page=${i}`);
        }
        let products = await Product.find({market: req.params.marketId, mainCategory: req.params.mainCategory}).sort({name: 'asc'}).populate('market').skip(pageOptions.page * pageOptions.limit).limit(pageOptions.limit).lean();
        
        let selectedCategory = req.params.mainCategory;
        
        res.render('markets/marketMainCategory', {
            products,
            totalPagesArray,
            market,
            tasaDolar,
            selectedCategory
        });
        
    } catch (err) {
        console.error(err);
        res.render('/error/500');
    }
});

router.get('/:mainCategory/:subCategory', ensureAuthenticated, async (req, res) => {
    try {
        const market = await Market.findById(req.params.marketId).lean();
        if(!market) {
            res.render('error/404');
        } else {
            const tasaDolar = await getTasaDolar();
            let pageOptions = {
                limit: parseInt(req.query.limit) || 10,
                page: parseInt(req.query.page) || 0,
            }
            
            let products = await Product.find({market: req.params.marketId, subCategory: req.params.subCategory}).populate('market').sort({name:'asc'}).skip(pageOptions.page * pageOptions.limit).limit(pageOptions.limit).lean();
            let totalPagesArray = [];
            const totalPages = Math.floor( ( await Product.countDocuments({market:req.params.marketId, subCategory: req.params.subCategory}) ) / 10 );
            console.log(totalPages);

            if(totalPages === 0){
                totalPagesArray.push(`?page=0`);
            } else {
                for(let i = 0; i <= totalPages; i++) {
                    totalPagesArray.push(`?page=${i}`);
                }
            }
            console.log(totalPagesArray);
            
            let selectedCategory = req.params.mainCategory;
            let selectedSub = req.params.subCategory;
        
            res.render('markets/marketSubCategory', {
                market,
                tasaDolar,
                products,
                totalPagesArray,
                selectedCategory,
                selectedSub

            });
        }
    } catch (err) {
        console.error(err);
        res.render('/error/500');
    }
});

router.get('/:mainCategory/:subCategory/:itemCategory', ensureAuthenticated, async (req, res) => {
    try {
        const market = await Market.findById(req.params.marketId);
        if(!market) {
            res.render('error/404');
        } else {
            let productsByCategory = await Product.find({market: req.params.marketId, itemCategory: req.params.itemCategory});
            res.send(productsByCategory);
        }
        
        
    } catch (err) {
        console.error(err);
        res.render('/error/500');
    }
});

module.exports = router;

