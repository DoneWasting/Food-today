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
    }
}