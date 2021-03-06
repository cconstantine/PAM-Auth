
var unixlib = require('unixlib');


module.exports = function(realm, pam_mod) {
  if(!pam_mod) {
    if(process.platform == 'darwin'){
      pam_mod = 'chkpasswd';
    }
    else if (process.platform == 'linux') {
      pam_mod = 'passwd';
    }
  }
  if(!realm)
    realm = "Login Required";

  function basic_auth (req, res, next) {
    function send_auth() {
      res.header('WWW-Authenticate', 'Basic realm="' + realm + '"');
      res.send('Authentication required', 401);
    }
    if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
    // fetch login and password
      var b = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString().split(':');
      var username = b[0];
      var password = b[1];
      unixlib.pamauth(pam_mod, username, password, function(success) {
		                    if (success) {
		                      next();
		                    } else {
                          send_auth();
                        }
                      });
      return;
    }
    send_auth();
  }
  return basic_auth;  
};