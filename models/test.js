const mongoose = require('mongoose');
const path = require('path');


const Market = require(path.resolve(__dirname, './Market.js'));
const Product = require( path.resolve(__dirname, './Product.js') );



async function getData() {
    let total1 = 0;
    let total2 = 0;
    let nancyMarArr = [];
    let marketMuralla = '5ef919b09be24b23c8726404';
    let marketNancymar = '5ef93ef13f5cf1194011948e';
    let marketProductsMuralla = await Product.find({ market: marketMuralla}).lean();
    console.log('La Muralla')
    for(product of marketProductsMuralla){
        let hola = await Product.findOne( { market:marketNancymar, name:product.name }).lean();
        total1+= product.priceDolar;
        console.log(`${product.name}  ${product.priceDolar}`)
        nancyMarArr.push(hola);
    }
    console.log('----------------')
    console.log(`Total: ${total1}`)
    console.log('Nancymar');

    for(product of nancyMarArr) {
        total2+=product.priceDolar
        console.log(`${product.name}  ${product.priceDolar}`);
    }
    console.log('----------------')
    console.log(`Total: ${total2}`)
   
    
}

getData();
