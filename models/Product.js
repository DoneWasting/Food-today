var mongoose = require('mongoose');
var getTasaDolar = require('../utils/dolar.js');

// Schema modelo del producto
var productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim:true
    },
    category:{
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

productSchema.statics.createWithDolar = async function(name,priceBs,category, market) {
  const tasaDolar = await getTasaDolar();
    const product = new Product({name, priceBs, category, market});
  product.priceDolar = calcDolarPrice(priceBs, tasaDolar);
  console.log(product);
  product.save();
  return product;
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

productSchema.methods.updatePriceDolarOne = async function() {
  const tasaDolar = await getTasaDolar();
  this.priceDolar = calcDolarPrice(this.priceBs, tasaDolar);
  this.save();
  console.log('Price $ updated');
};

var Product = mongoose.model('Product', productSchema);





// Product.createWithDolar('hola', 2000, 'hecho', '5ef79ce9313c921de04954e6');

module.exports = Product;