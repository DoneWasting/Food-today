var mongoose = require('mongoose');
var getTasaDolar = require('../utils/dolar.js');

// Schema modelo del producto
var productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim:true
    },
    mainCategory:{
      type:String,
      required: true,
      trim:true
    },
   subCategory:{
      type:String,
      required: true,
      trim:true
    },
    itemCategory:{
      type:String,
      required: true,
      trim:true
    },
    priceBs: {
      type: Number,
      required: true
    },
    priceDolar: {
      type:Number,
      required:true
    },
    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Market'
  }
});

function calcDolarPrice(priceBs, tasaDolar) {
  return (priceBs/tasaDolar).toFixed(2);
}

productSchema.statics.createWithDolar = async function(name,priceBs,mainCategory, subCategory, itemCategory, market) {
  const tasaDolar = await getTasaDolar();
    const product = new Product({name, priceBs, mainCategory, subCategory, itemCategory, market});
  product.priceDolar = calcDolarPrice(priceBs, tasaDolar);
  
  product.save();
  return product;
}

productSchema.statics.createManyWithDolar = async function(products, marketId) {
  const tasaDolar = await getTasaDolar();

  for (product of products) {
   
    const newProduct = new Product({name:product.name, priceBs:product.priceBs, mainCategory:product.mainCategory,
      subCategory:product.subCategory, itemCategory:product.itemCategory, market: marketId});
    newProduct.priceDolar = calcDolarPrice(newProduct.priceBs, tasaDolar);
    newProduct.save();
    console.log(newProduct);
    console.log('Finished');
  }
}

productSchema.statics.updatePriceDolarAll = async function() {
  const tasaDolar = await getTasaDolar();
  const products = await Product.find();
  for(item of products) {
    item.priceDolar = calcDolarPrice(item.priceBs, tasaDolar);
    item.save();
  }
  console.log('Price Updated');
};

productSchema.statics.findMainCategories = async function (marketId) {
  let products = await Product.find({ market: marketId});
  let categoriesArray = [];

  for( let product of products) {
    if( !(categoriesArray.includes(product.mainCategory)) ) {
      categoriesArray.push(product.mainCategory);
    } 
  }
 
  return categoriesArray;
}

productSchema.statics.divideCategories = async function (marketId) {

  let mainCategoriesGama = await Product.findMainCategories(marketId);
  let objArray = [];
  
  
  for(let mainCategory of mainCategoriesGama) {
    let productsMain = await Product.find({market:marketId, mainCategory});
    let subObjArray =[];
    let subArray = [];

    for( let product of productsMain) {
      if( !(subArray.includes(product.subCategory)) ) {
        subArray.push(product.subCategory);
      }
    }

    for (let subCategory of subArray) {
      let productsSub = await Product.find({market:marketId, subCategory});
      let itemCategories = [];

      for(let product of productsSub) {
        if( !(itemCategories.includes(product.itemCategory)) ) {
          itemCategories.push(product.itemCategory);
        }
      }
     
      let subObj = {
        sub: subCategory,
        item: itemCategories
      }
      subObjArray.push(subObj);
    }
    
    let obj = {
      main: mainCategory,
      sub: subObjArray,
    }
    objArray.push(obj);
  } // End maincategories loop
  return objArray
}

productSchema.methods.updatePriceDolarOne = async function() {
  const tasaDolar = await getTasaDolar();
  this.priceDolar = calcDolarPrice(this.priceBs, tasaDolar);
  this.save();
  console.log('Price $ updated');
};

var Product = mongoose.model('Product', productSchema);

// (async () => {
  

// }) ();

module.exports = Product;