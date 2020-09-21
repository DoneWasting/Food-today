const puppeteer = require('puppeteer');


async function getGamaExpressData () {

  let marketUrl = 'https://compraenlinea.excelsiorgama.com/'

  
  // Abriendo el browser con puppeteer
    const browser = await puppeteer.launch({  args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  // Creando nueva pagina con puppeteer
    const page = await browser.newPage();

    // not loading css, js, images
    await page.setRequestInterception(true);
    page.on('request', (request) => {
    if (['image',  'font', 'script'].indexOf(request.resourceType()) !== -1) {
        request.abort();
    } else {
        request.continue();
    }
    });

    // Configurando el tiempo en que se cierra el navegador porque tarda a 0
    await page.setDefaultNavigationTimeout(0);

    // Ir al la página principal de Gama express y Esperando networkidle2
    await page.goto(marketUrl, {waitUntil:'networkidle2'});
  
  // Creando el array de productos totales para ser agregados
  let totalProducts = [];
  
  // Evaluando la página y obteniendo los links por categoría específica
  let urlsByCategories = await page.evaluate( () => {
    let categoyLinks = document.querySelectorAll('.sub-navigation-list a');
    
    let linksArray= [];
    for(let i = 0; i < categoyLinks.length; i++) {
      
        //  https://compraenlinea.excelsiorgama.com/VIVERES/Pastas-y-Harinas/Pastas/c/001001001
        linksArray.push(categoyLinks[i].href);
    }
    return linksArray;
  });
  
  // Loop por todos los links de categoría LOOP PRINCIPAL POR CADA LINK
  for(let i = 0; i < urlsByCategories.length; i++) {
    
  
    await page.goto(urlsByCategories[i], {waitUntil:'networkidle2'});
  
    let totalPagesByCategory  = await page.evaluate( () => {
      let totalProductsByCategory = document.querySelector('.pagination-bar-results');
      
      if(!totalProductsByCategory) {
        return;
      }
      totalProductsByCategory = totalProductsByCategory.textContent
                                                       .trim()
                                                       .split('\"');
      totalProductsByCategory = parseInt(totalProductsByCategory[1].replace('.', ''));
    
      let totalPagesByCategory = Math.ceil(totalProductsByCategory / 20);

    
      return totalPagesByCategory;
    });
  
    if(!totalPagesByCategory) {
      continue;
    }
    let productsPerCategory = 0;

  // loop por todas las paginas de productos de una categoría LOOP SECUNDARÍO
  // POR TODAS LAS PÁGINAS DE UNA CATEGORÍA 
    for(let j = 0; j < totalPagesByCategory; j++) {
        
  
        let productsPerPage = await page.evaluate( () => {
          let productsPerPage = [];
          let productNameList = document.querySelectorAll('.product__list--name');
          let productValueList = document.querySelectorAll('.from-price-value');
          
          let breadCrumb = document.querySelector('.breadcrumb');


          


  
          
          // loop por todos los productos de una de las paginas de categoría
          // LOOP TERCIARIO POR TODOS LOS PRODUCTOS EN UNA PÁGINA
          for(let k = 0; k < productNameList.length; k++) {

            // Necesito el 3, 5 y 7
            

              let product = {
                name: productNameList[k].textContent,
                priceBs: parseInt(productValueList[k].textContent.slice(3, -3).replace(/\./g, '')),
                mainCategory: breadCrumb.childNodes[3].textContent.trim(),
                subCategory: breadCrumb.childNodes[5].textContent.trim(),
                itemCategory: breadCrumb.childNodes[7].textContent.trim()
              }
              productsPerPage.push(product);
              
          }
          return productsPerPage;
        });
        productsPerCategory+= productsPerPage.length;

 

       
      
        
        totalProducts = [...totalProducts, ...productsPerPage];
        let next = await page.$('.pagination-next a');
        
        if(!next) {

    
            continue;
            
        }

        await Promise.all([
          page.click('.pagination-next a'),
          page.waitForNavigation({waitUntil: 'networkidle2'}),
        ]);
      }
    //   console.log(`Hay ${totalProducts.length} en esta categoría`);
  }
  
  await browser.close();
  return totalProducts;
}

  module.exports = getGamaExpressData;
  
