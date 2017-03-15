var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/node_chat');

var userSchema = new Schema({
    username: String,
    password: String
}); //set the schema of a user

module.exports = mongoose.model('User', userSchema);
