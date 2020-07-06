const axios = require('axios');


const url ='https://s3.amazonaws.com/dolartoday/data.json';

async function getTasaDolar(priceBs) {
    const response = await axios.get(url);
    return response.data.USD.transferencia;
  }

module.exports = getTasaDolar;