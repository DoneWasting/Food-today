const puppeteer = require('puppeteer');



async function getPlazasData () {
    const browser = await puppeteer.launch( { args: ['--no-sandbox', '--disable-setuid-sandbox'] } );
    const page = await browser.newPage();
    const mainUrl = 'https://www.elplazas.com/';

     // not loading css, js, images
     await page.setRequestInterception(true);
     page.on('request', (request) => {
     if (['image',  'font'].indexOf(request.resourceType()) !== -1) {
         request.abort();
     } else {
         request.continue();
     }
     });

    await page.setDefaultNavigationTimeout(0);

    await page.goto(mainUrl, {waitUntil:'networkidle2'});
    await page.waitForSelector('.subgrupos a');
    let totalProducts = [];

    let itemCategoryLinks = await page.evaluate( () => {
        const b = document.querySelectorAll('.subgrupos a');
        let itemCategoryLinks = [];
        
        for(elem of b) {
            if(  elem.href  ) {
                itemCategoryLinks.push(elem.href);
            }
        }
       
        return itemCategoryLinks;
    });
   
    
    for(let link of itemCategoryLinks) {
        let test = [];
        

        await page.goto(link, {waitUntil: 'networkidle2'});
        await page.waitForSelector('.Product .Description');

        let totalProductsByCategory = await page.evaluate( () => {
            let pagination = document.querySelectorAll('.ContainerPager a');
            let pagesArray = [];

            pagination.forEach((item, index) => {
                if(index > 0) {
                    pagesArray.push(item.href); 
                }
            })

            // for(let items of pagination) {
            //     if( !(items.href.includes('Page=1') ) ) {
            //         pagesArray.push(items.href);
            //     }
            // }

            return pagesArray;
        });
        
        for(let i=0 ; i <= totalProductsByCategory.length; i++) {
           
            let productsPerPage =  await page.evaluate( () => {
                let productsPerPage = [];
                let productDescription = document.querySelectorAll('.Product .Description');
                let productPrice = document.querySelectorAll('.Product .Price');
                let categoryElem = document.querySelectorAll('.Route');
    
                for(let i = 0; i < productDescription.length; i++) {
                    productsPerPage.push({
                        name: productDescription[i].textContent.trim(),
                        priceBs: parseInt( productPrice[i].textContent.trim().slice(0, -7).replace(/,/g, '') ),
                        mainCategory: categoryElem[1].textContent,
                        subCategory: categoryElem[2].textContent,
                        itemCategory: categoryElem[3].textContent
                    });
                } // END THIRD LOOP
                
                return productsPerPage;
            });
            test = [...test, ...productsPerPage];

           

            
            totalProducts = [...totalProducts, ...productsPerPage];

            if(i === totalProductsByCategory.length) {
                continue;
            }

            await page.goto(totalProductsByCategory[i], { waitUntil: 'networkidle2'});
            
        } // END SECOND LOOP  
        
        
        
    } // END FIRST LOOP
    await browser.close();
    return totalProducts;

}


//   test();


module.exports = getPlazasData;
