/**
 * Middleware function that checks if the requests is authenticated.
 * 
 * @param {Object} request The Express HTTP request object.
 * @param {Object} response The Express HTTP response object.
 * @param {Function} next Function to call next middleware.
 */
function isLoggedIn (request, response, next) {
  if (request.isAuthenticated()) {
    next();
    return;
  }
  response.redirect('/denied');
}

export default isLoggedIn;