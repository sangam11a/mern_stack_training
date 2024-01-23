const mongoose = require('mongoose');
const foodSchema = mongoose.Schema({
    foodName:{
        type:String,
        required: true,
    },
    foodType:{
        type:String,
        required:true
    },
    protein:{
        type:String,
        required:true
    },
    calories:{
        type : Number,
        required : true,
        min : 120
    }
});

const foodModel = mongoose.model("foods",foodSchema);
module.exports = foodModel; 