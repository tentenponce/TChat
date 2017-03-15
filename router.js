/* get the controllers */
var UserController = require('./controllers/UserController');
var HomeController = require('./controllers/HomeController');
var ChatController = require('./controllers/ChatController');

module.exports = function(app) {
  app.get('/', checkAuth, HomeController.Index);
  app.get('/home', checkAuth, HomeController.Index);
  app.post('/login', UserController.Login);
  app.get('/login', function(req, res) {
    if (req.session.user_id) {
      res.redirect('/home');
    } else {
      res.render('Login', {layout: false});
    }
  });
  app.get('/logout', function(req, res) {
    req.session.user_id = ""; //unset the user_id
    res.redirect("/login"); //redirect back to login page
  });

  app.get('/chat/:user_id', checkAuth, ChatController.Index);
  app.post('/chat/add_chat', checkAuth, ChatController.AddChat);
};

/*
* method that will check the user if login
* to redirect to home. Otherwise, go to login page
*/
function checkAuth(req, res, next) {
  if (!req.session.user_id) { //if there's no user_id set go to login page
    res.redirect('/login');
  } else {
    next(); //otherwise, proceed to the controller to handle request
  }
}
