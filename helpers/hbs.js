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
    add: (index) => {
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
    }
}