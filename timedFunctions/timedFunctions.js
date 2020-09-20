const getGamaExpressData = require('../scrapers/gamaexpress');
const getPlazasData = require('../scrapers/plazas');
const Product = require('../models/Product');

const runEveryDay = () => {
    let dateAtRunTime = new Date();
    dateAtRunTime.setHours(9);
    console.log('running');
  
    let nextDate = new Date();
    nextDate.setDate(dateAtRunTime.getDate() + 1);
    nextDate.setHours(9);
  
    console.log(`Plazas ${dateAtRunTime.getDate()}-${dateAtRunTime.getMonth()}-${dateAtRunTime.getYear()}`);
    let difference = nextDate - dateAtRunTime;
  
    setTimeout( async () => {
  
        updatePlazasPrices();
        updateGamaExpressPrices();
       
        runEveryDay();
    }, difference );
  
  }

  
  async function updateGamaExpressPrices() {
      console.time('someFunction');
      let data = await getGamaExpressData();
      console.timeEnd('someFunction');
  
      for (let product of data) {
        let matchedProduct = await Product.findOne({market:'5f628725def4ba14b8a08bc9', name: product.name});
        
        if(!matchedProduct) {
          await Product.createWithDolar(product.name, product.priceBs, product.mainCategory, product.subCategory, product.itemCategory)
        } else {
  
          if(matchedProduct.priceBs !== product.priceBs) {
            matchedProduct.priceBs = product.priceBs;
            matchedProduct.save();
          }
  
        }

      }
      console.log('Excelsior Gama prices update');
    }

    async function updatePlazasPrices() {
        console.time('someFunction');
        let data = await getPlazasData();
        console.timeEnd('someFunction');
    
        for (let product of data) {
          let matchedProduct = await Product.findOne({market:'5efe9f3d6239af00f4ba6aad', name: product.name});
          
          if(!matchedProduct) {
            await Product.createWithDolar(product.name, product.priceBs, product.mainCategory, product.subCategory, product.itemCategory)
          } else {
    
            if(matchedProduct.priceBs !== product.priceBs) {
              matchedProduct.priceBs = product.priceBs;
              matchedProduct.save();
            }
    
          }
  
        }
        console.log('Plazas prices update');
    
    }


      runEveryDay();


    module.exports = runEveryDay;