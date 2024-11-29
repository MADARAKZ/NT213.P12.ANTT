var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');

// CSRF protection middleware with secure cookie configuration
var csrfProtection = csrf({
  cookie: {
    httpOnly: true, // Prevent access via JavaScript
    secure: true,   // Ensure cookies are sent only over HTTPS
    sameSite: 'strict', // Mitigate CSRF attacks
  },
});

// Body parsing middleware
var parseForm = bodyParser.urlencoded({ extended: false });

// Export middleware
module.exports = {
  csrfProtection,
  parseForm,
  cookieParser,
};
