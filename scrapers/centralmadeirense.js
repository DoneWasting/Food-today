const puppeteer = require('puppeteer');



const getCentralMadeirenseData = async () => {
  console.log('CentralMadeirense scraper started');
    let marketUrl = 'https://tucentralonline.com/distrito-capital-06/comprar/viveres/';

    // PRODUCTION ARGUMENTS FOR PUPPETEER.LAUNCH
   
    // OPTIONS FOR NOT LOADING IMAGES, FONTS or SCRIPTS
    // await page.setRequestInterception(true);
    // page.on('request', (request) => {
    // if (['image',  'font', 'script'].indexOf(request.resourceType()) !== -1) {
    //     request.abort();
    // } else {
    //     request.continue();
    // }
    // });
    
      
      // Abriendo el browser con puppeteer
        const browser = await puppeteer.launch({   args: ['--no-sandbox', '--disable-setuid-sandbox'
        ,'--disable-dev-shm-usage', '--disable-setuid-sandbox'] });
      // Creando nueva pagina con puppeteer
        const page = await browser.newPage();
    
      
        // Configurando el tiempo en que se cierra el navegador porque tarda a 0
        await page.setDefaultNavigationTimeout(0);

        // await page.setViewport({ width: 1600, height: 1600});
    
        // Ir al la página principal de Gama express y Esperando networkidle2
        await page.goto(marketUrl, {waitUntil:'networkidle2'});
        let totalProducts = [];

        let links = await page.evaluate(() => {
          let submenu = document.querySelectorAll('.sub-menu ul a');
            let arr = [];
            
            for(item of submenu) {
                arr.push(`${item.href}?count=40&paged=`);
            }


            return arr;
        });

        for(let i=0; i < 72; i++) {
         
          await page.goto(links[i], {waitUntil:"networkidle2"});

          let count = await page.$('.count');
          if(!count) {
            console.log('no count btn');
              continue;
          }

          let currentUrl = links[i];
  
         

          let totalPagesPerCategory = await page.evaluate( ( ) => {
              let totalProducts = document.querySelector('#select2-product_cat-container').innerText;
              let splittedProducts = totalProducts.split('(');
              totalProducts = parseInt( splittedProducts[1].replace(')', '') );

            return Math.ceil(totalProducts/40);
          });

          for(let i = 1; i <= totalPagesPerCategory + 1;i++) {

            
              let nextPage = `${currentUrl}${i+1}`;
         
          
            let productsPerCategory = await page.evaluate(() => {
            
              let productsPerPage = [];
              let exception = false;
                // .product-content
                let productContainer = document.querySelectorAll('.product-content');
                
                let names = document.querySelectorAll('.product-loop-title');
                let itemCategoryList = document.querySelectorAll('.category-list');
                let price = document.querySelectorAll('.price');
                
                for(let i=0; i < productContainer.length  ;i++) {
                  let name = names[i].innerText;
                  let itemCategory = itemCategoryList[i].innerText;
                  let priceBs = '';
                  

              
                  if(name == 'Avena Quaker Fortificada Paquete 400Gr' || name == 'Limpiador Mr.Musculo Oxi Power Rep.500Ml') {
                    exception = true;
                    
                    continue ;
                  } else {
                          if (exception) {
                            priceBs = parseInt( price[i-1].innerText.slice(3, -3).replace(/\./g, '') );
                          }
                          else {
                            priceBs = parseInt( price[i].innerText.slice(3, -3).replace(/\./g, '') );
                          }


                   
                      productsPerPage.push({
                        name,
                        priceBs,
                        mainCategory: '',
                        subCategory: '',
                        itemCategory,
                        
                      });
                  }
                }
            
                return productsPerPage
              });

              totalProducts = [...totalProducts, ...productsPerCategory];
       


              
              if(i == totalPagesPerCategory) {
                break;
              }
              
              

              await page.goto(nextPage, { waitUntil:'networkidle2' });

          }

        }
     
       return totalProducts;
}

module.exports = getCentralMadeirenseData;