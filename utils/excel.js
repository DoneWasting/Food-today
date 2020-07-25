const xlsxFile = require('read-excel-file/node');


function getExcelData(filePath, fileName) {
  
const schema = {
  'Name': {
      prop:'name',
      type:String,
      required: true
  },
  'PriceBs': {
      prop:'priceBs',
      type: Number,
      required: true
    },
  'mainCategory':{
      prop:'mainCategory',
      type:String,
      required: true
    },
    'subCategory':{
      prop:'subCategory',
      type:String,
      required: true
    },
    'itemCategory':{
      prop:'itemCategory',
      type:String,
      required: true
    }
}

let data = xlsxFile(`${filePath}/${fileName}`, {schema} ).then(({rows, errors}) => {
  errors.length === 0;
  return rows;
});

  return data
}


module.exports = getExcelData;