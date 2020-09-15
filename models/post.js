var mongoose = require("mongoose");

var PostSchema = new mongoose.Schema({
    title : String,
    text : String,
    author : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String
    }
})

module.exports = mongoose.model("post", PostSchema);