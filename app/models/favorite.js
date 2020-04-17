// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var favoriteSchema = mongoose.Schema({

    likerId          : {type: mongoose.Schema.Types.ObjectId,ref:'User'},
    postId           : {type: mongoose.Schema.Types.ObjectId,ref:'Post'}

});

// generating a hash
favoriteSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Favorite', favoriteSchema);
