module.exports = {
    typeOf: (name) => {
        return typeof name != 'undefined' ? name:'';
    },
    errorCheck: (error) => {
        return typeof error != 'undefined';
    },
    flashMsg: (msg) => {
        return msg!='';
    },
    isUserCreator: (marketUser, loggedUser) => {
        if(loggedUser === null) {
            return false;
        } else if (loggedUser._id.toString() === marketUser._id.toString()) {
            return true ;
        } else {
            return false;
        }
        
    },
    isLoggedIn: (loggedUser) => {
        if(loggedUser){
            return true;
        } else if (loggedUser === null) {
            return false;
        }
    },
    isLoggedOut: (loggedUser) => {
        if(loggedUser === null) {
            return true;
        } else {
            return false;
        }
    },
    add: (index , totalPagesArrayLength) => {

        return index+1;
    },
    substractOne: (index) => {
        if(index === 0) {
            return 0;
        }
        return index-1;
    },
    pagination: (currentIndex, loopedIndex, market , mainCategory = false, subCategory = false) => {
        let str = '';

        if(typeof mainCategory === 'string' ){
            if(typeof subCategory === 'string') {
                str = `/products/${mainCategory}/${subCategory}`
            } else {
                str = `/products/${mainCategory}`;
            }
        } 
        
        if(loopedIndex >= currentIndex + 5 || loopedIndex <= currentIndex -5){
            return `<a style="display:none" href="/markets/${market._id}${str}?page=${loopedIndex}"> ${loopedIndex + 1} </a>`
        } else if(loopedIndex === currentIndex) {
            return `<a class="active_link" href="/markets/${market._id}${str}?page=${loopedIndex}"> ${loopedIndex + 1} </a>`
        } else {
            return `<a href="/markets/${market._id}${str}?page=${loopedIndex}"> ${loopedIndex + 1} </a>`
        }
    },
    paginationArrowsNext: (totalPagesArrayLength, currentIndex, market, mainCategory = false, subCategory = false) => {
        
        let str = '';
        if(typeof mainCategory === 'string' ){
            if(typeof subCategory === 'string') {
                str = `/products/${mainCategory}/${subCategory}`
            } else {
                str = `/products/${mainCategory}`;
            }
        } 
       
        if(currentIndex <= 0) {
           return `<a href="/markets/${market._id}${str}?page=${currentIndex + 1}"><i class="fa fa-arrow-right" aria-hidden="true"></i></a>`
        }

        else if (currentIndex < totalPagesArrayLength - 1 ) {
            return `<a href="/markets/${market._id}${str}?page=${currentIndex + 1}"><i class="fa fa-arrow-right" aria-hidden="true"></i></a>`
        }
    },
    paginationArrowsPrev: (totalPagesArrayLength, currentIndex, market, mainCategory = false, subCategory = false) => {

        let str = '';
        if(typeof mainCategory === 'string' ){
            if(typeof subCategory === 'string') {
                str = `/products/${mainCategory}/${subCategory}`
            } else {
                str = `/products/${mainCategory}`;
            }
        } 
        
       
        if(currentIndex > 0) {
           return `<a href="/markets/${market._id}${str}?page=${currentIndex - 1}"><i class="fa fa-arrow-left" aria-hidden="true"></i></a>`
        }

        
    },
    userHasCart: (cart) => {
        return ` <div class="fixed-action-btn left-button"><a href="/markets/add" class="btn-floating btn-large waves-effect waves-light red"><i class="fas fa-thrash"></i></a></div>`
    },
    formatDate:(date) => {
        console.log(date);
        return `<p>Actualizado el ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
    }
}