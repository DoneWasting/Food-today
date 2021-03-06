const getGamaExpressData = require('../scrapers/gamaexpress');
const getPlazasData = require('../scrapers/plazas');
const getCentralMadeirenseData = require('../scrapers/centralmadeirense');
const Product = require('../models/Product');
const Market = require('../models/Market');

const runEveryHour = () => {
  const dateAtRunTime = new Date();

  const nextDate = new Date(dateAtRunTime.getFullYear(), dateAtRunTime.getMonth(), dateAtRunTime.getDate(), dateAtRunTime.getHours() + 1 , 0, 0, 0);
  const difference = nextDate - dateAtRunTime;
  setTimeout(() => {
    console.log(`Son las ${nextDate.getHours()} y el servidor esta vivo`);
    runEveryHour();
  }, difference);
}


const runEveryDay = () => {
  console.log('Run EveryDay ran');
    let dateAtRunTime = new Date();
 
    


    let nextDate = new Date(dateAtRunTime.getFullYear(), dateAtRunTime.getMonth(), dateAtRunTime.getDate()   , 13  , 0, 0, 0 );
    console.log(dateAtRunTime);
    console.log(nextDate);
    
    let difference = nextDate - dateAtRunTime;

    if (difference < 0) {
      console.log('Markets update already completed waiting for tomorrow');
      return;
    }
  
    setTimeout( async () => {
      console.log('setTimeoutRan');
      
        updatePlazasPrices();
        updateGamaExpressPrices();
        updateCentralMadeirensePrices();

        const gamaExpress = await Market.findById('5f6790d4d97f893d40824b5d');
        const plazas = await Market.findById('5f6790c5d97f893d40824b5c');

        await plazas.save();
        await gamaExpress.save();
       
        runEveryDay();
    }, difference );
  
  }

  
  async function updateGamaExpressPrices() {
      console.time('someFunction');
      console.log('starting gama update');
      let data = await getGamaExpressData();
      console.timeEnd('someFunction');
  
      for (let product of data) {
        let matchedProduct = await Product.findOne({market:'5f6790d4d97f893d40824b5d', name: product.name});
        
        if(!matchedProduct) {
          await Product.createWithDolar(product.name, product.priceBs, product.mainCategory, product.subCategory, product.itemCategory)
        } else {
  
          if(matchedProduct.priceBs !== product.priceBs) {
            matchedProduct.priceBs = product.priceBs;
            await matchedProduct.save();
          }
  
        }

      }
      console.log('Excelsior Gama prices update');
    }

    async function updatePlazasPrices() {
        console.time('someFunction');
        console.log('starting Plazas update');
        let data = await getPlazasData();
        console.timeEnd('someFunction');
    
        for (let product of data) {
          let matchedProduct = await Product.findOne({market:'5f6790c5d97f893d40824b5c', name: product.name});
          
          if(!matchedProduct) {
            await Product.createWithDolar(product.name, product.priceBs, product.mainCategory, product.subCategory, product.itemCategory)
          } else {
    
            if(matchedProduct.priceBs !== product.priceBs) {
              matchedProduct.priceBs = product.priceBs;
              await matchedProduct.save();
            }
    
          }
  
        }
        console.log('Plazas prices update');
    
    }

    async function updateCentralMadeirensePrices()  {
      console.time('someFunction');
      console.log('starting Central Madeirense update');
      let data = await getCentralMadeirenseData();
      console.timeEnd('someFunction');
  
      for (let product of data) {
        let matchedProduct = await Product.findOne({market:'5f6f6afe566c861ae83db021', name: product.name});
        
        if(!matchedProduct) {
          await Product.createWithDolar(product.name, product.priceBs, product.mainCategory, product.subCategory, product.itemCategory)
        } else {
  
          if(matchedProduct.priceBs !== product.priceBs) {
            matchedProduct.priceBs = product.priceBs;
            await matchedProduct.save();
          }
  
        }

      }
      console.log('Central Madeirense prices update');
    }


  runEveryDay();
  runEveryHour();


    module.exports = runEveryDay;