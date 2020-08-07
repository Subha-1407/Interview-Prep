var mongoose = require("mongoose");

var softwareCompanySchema = new mongoose.Schema({
    name : String,
    image : String,
    
    posts :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "post"
        }
    ]
});

module.exports = mongoose.model("software_company", softwareCompanySchema);