var express = require('express');
var router = express.Router();
import patchSAMLRequest from '../middleware/patchSAMLRequest';
import isLoggedIn from '../middleware/isLoggedIn';

// /* GET login page. */
// router.get('/mylogin', function(req, res, next) {
//   res.render('lftest', { title: 'mylogin' });
// });

// /* GET home page. */
// router.get('/myhome', function(req, res, next) {
//   res.render('lftest', { title: 'homepage' });
// });

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


function configureRoutes(passport) {
  const router = express.Router();

  // Homepage
  router.get('/', (request, response) => {
    response.render('index', { user: request.user });
  });

  router.get('/lftest', (request, response) => {
    response.send(process.env.NODE_ENV+"@@");
  });

 

  // This route redirects the user to the IDP (w3id SSO) log in page.
  router.get('/login', passport.authenticate('saml'));
  
  // This route will receive the user information from the IDP (w3id SSO), and then redirect the 
  // user to a protected route to demonstrate that the user has successfully logged in.
  router.post('/mylogin', 
    patchSAMLRequest,
    passport.authenticate('saml', { 
      successRedirect: '/restricted',
      failureRedirect: '/denied',
    })
  );

  // Log the user out of the application.
  router.get('/logout', (request, response) => {
    request.logout();
    response.redirect('/');
  });

  // Protected route that requires a logged in user.
  router.get('/restricted', isLoggedIn, (request, response) => {
    response.render('lftest', { user: request.user });
  });

  // Response route that tells the user they are not signed it.
  router.get('/denied', (request, response) => {
    response.render('lftest');
  });

  // 404 page.
  router.use((request, response) => {
    response.render('404', { path: request.path, user: request.user });
  });

  // Error page.
  router.use((error, request, response, next) => {
    response.status(500).render('error', { error, user: request.user });
  });

  return router;
}



module.exports = configureRoutes;
