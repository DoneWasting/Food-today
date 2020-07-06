const xlsxFile = require('read-excel-file/node');

function getExcelData(filePath, fileName) {
    let excelData =  xlsxFile(`${filePath}/${fileName}`).then(rows => {
      
      let objArray = []
      for(let i = 1; i <= rows[0].length;i++) {
          let obj = {}
          let currentArray = []
          
          for(let j = 0; j< rows[0].length; j++) {
             currentArray.push(rows[i][j]);
          }
          obj = {
              name:currentArray[0],
              priceBs: currentArray[1],
              category: currentArray[2]
          }
          objArray.push(obj);
      }
     return objArray;
  });
  return excelData;  
};



module.exports = getExcelData;