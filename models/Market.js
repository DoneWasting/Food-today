const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    brand: {
        type: String,
        required: true,
        trim:true
    },
    location: {
        type: String,
        required: true,
        trim:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
});

const Market = mongoose.model('Market', MarketSchema);



module.exports = Market;

