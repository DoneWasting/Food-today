const mongoose = require('mongoose');
const Product = require('./Product');

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
    categories: {
        type:Object
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
}, {
    timestamps: true
});

MarketSchema.methods.setUpCategories = async function () {
    let categories = await Product.divideCategories(this._id);
    this.categories = categories;
    this.save();
}

const Market = mongoose.model('Market', MarketSchema);




module.exports = Market;

