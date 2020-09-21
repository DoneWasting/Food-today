

const searchForm = document.querySelector('form');
const searchValue = document.querySelector('input');
const searchResults = document.querySelector('.searchResults');
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = searchValue.value;
    while (searchResults.firstChild) {
        searchResults.removeChild(searchResults.lastChild);
      }

    fetch(`/products/search?product=${product}`).then((response) => {
        response.json().then((data) => {
            if(data.error) {
                let html = document.createElement('p');
                html.textContent = data.error;
                searchResults.appendChild(html);
            } else {
                data.forEach(item => {
                    let html = document.createElement('div');
                    html.innerHTML = 
                    `
                    <div class="col s12 l4 m6">
                         <div class="card item-card">
                            <div class="card-content center-align">
                            <form action="/search/${item.name}"  method="POST">
                                <h6  class="sub-heading" name="productName">${item.name}</h6>
                                <h6 class="icon-green">${item.market.name}</h6>
                                <p>Precio Bs: ${item.priceBs}</p>
                                <p>Precio $: ${item.priceDolar}</p>
                                
                                <div class="card-action center-align">
                                    <button type="submit" name="action" class="btn green"><i class="fa fa-shopping-cart" aria-hidden="true"></i></button>
                                </div>
                                </form>
                            </div>
                        </div>
                    </div>`
                    
                    searchResults.appendChild(html); 
                })
                
            }
        });
    });
})

