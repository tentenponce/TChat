var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.createConnection('mongodb://localhost/node_chat');

var chatSchema = new Schema({
    msg: String,
    date: {type: Date},
    user_id : String, //you
    chat_user_id : String //to whom you are talking to
}); //set the schema of a chat message

module.exports = mongoose.model('Chat', chatSchema);
