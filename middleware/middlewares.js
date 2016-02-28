//Auth Middleware Must be used before all other routes
var jwt = require('jsonwebtoken');
var config = require('../configd/config.js');

module.exports = {
  tokenVerifier: function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token ||req.query.token||req.params.token||req.headers.authorization|| req.headers['x-access-token'] || req.headers['Authorization'];
    if(!token)
      console.error('Failed to aquire token');
      console.error(req.headers);
    // decode token
    if (token) {
      jwt.verify(token, config.secret, function(err, decoded) {      
        if (err) {
          res.send(401, 'missing authorization header');
          return res.json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({ 
          success: false, 
          message: 'No token provided.' 
      });
    }
  }

  //,otherMiddleWare:function(req, res, next){...}
}

