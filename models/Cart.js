const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
    addedProducts: {
        type: Array,
    }, 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

});


const Cart = mongoose.model('Cart', cartSchema);


module.exports = Cart;