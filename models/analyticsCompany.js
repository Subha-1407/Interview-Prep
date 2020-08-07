var mongoose = require("mongoose");

var analyticsCompanySchema = new mongoose.Schema({
    name : String,
    image : String,
    
    posts :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "post"
        }
    ]
});

module.exports = mongoose.model("analytics_company", analyticsCompanySchema);