var fs = require('fs');
var path = require('path');
var SAML = require('passport-saml');
var User = require('../models/User');

// Read the
const certPath = path.resolve(process.cwd(), '../myapp/models/private.pem');
const cert = fs.readFileSync(certPath, 'utf-8');

const SAML_BLUEMIX_CONFIG = {
  path: '/login',
  // The `Target` query parameter does not actually dictate what domain the ISP sends the POST
  // request to. This must be done on the IBM SSO provisioning site under the SP metadata file
  // settings.
  //entryPoint: 'https://w3id.alpha.sso.ibm.com/auth/sps/samlidp/saml20/logininitial?RequestBinding=HTTPPost&PartnerId=bluemix&NameIdFormat=email&Target=https://w3id-sso-node-passport.mybluemix.net/', // IDP Initiated Login URL goes here
    entryPoint: 'https://w3id.alpha.sso.ibm.com/auth/sps/samlidp2/saml20/logininitial?RequestBinding=HTTPPost&PartnerId=RiskMGT_cloud_sso&NameIdFormat=email&Target=https://190311testcontactdb.mybluemix.net/',
  issuer: 'bluemix', // Partnert ID goes here
  cert,
};

const SAML_LOCAL_CONFIG = {
  path: '/login',
  // The `Target` query parameter does not actually dictate what domain the ISP sends the POST
  // request to. This must be done on the IBM SSO provisioning site under the SP metadata file
  // settings.
  entryPoint: 'https://w3id.alpha.sso.ibm.com/auth/sps/samlidp2/saml20/logininitial?RequestBinding=HTTPPost&PartnerId=lf_ssotest_local&NameIdFormat=email&Target=https://localhost:3000/', // IDP Initiated Login URL goes here
  issuer: 'w3-sso-dalianimt', // Partnert ID goes here
  cert,
};

/**
 * When a user object is returned from the IDP, we can now store this user so that we can retrieve
 * it in subsequent requests for protected routes.
 *
 * @param {Object} user The user object returned from the IDP.
 * @param {Function} done Callback function to call when we are done verifying and saving the user.
 */
function verifyUser(user, done) {
  done(null, new User(user));
}

/**
 * Passport can manage user sessions via cookies which allows users to browse to protected routes
 * without having to log in every time. In order to create a user session cookie, we must provide
 * Passport with some unique identifier for it to serialize and create a cookie. In this case, we
 * are using the user's unique ID.
 *
 * @param {Object} user The user object to serialize.
 * @param {Function} done Callback function to call when we are ready to serialize the user.
 */
function serializeUser(user, done) {
  done(null, user.uid);
}

/**
 * After having logged in, whenever a user navigates to another route, Passport must deserialize the
 * user and give us the unique identifier that we provided in the serialize function. It is our
 * responsibility to ensure that the user with the unique identifier actually exists. If the user
 * does exist, we can tell Passport that the user in question does in fact exist and their request
 * can be handed off to the next middleware of the current route.
 *
 * @param {String} userId The unique identifier used to find the user in our User store.
 * @param {Function} done Callback function to call when we are done verifying that the user exists.
 */
function deserializeUser(userId, done) {
  const user = User.findById(userId);

  if (!user) {
    done(new Error(`User with id ${userId} not found`), false);
    return;
  }

  done(null, user);
}

/**
 * Configures passport to user the SAML strategy for authentication.
 *
 * @param {Passport} passport The instance of Passport to be configured.
 * @param {Boolean} shouldConfigureLocal Whether or not to use the local SSO configuration.
 */
function configurePassport (passport, shouldConfigureLocal) {
  // Determine which SAML configuration is needed based on the environment of this application.
    const samlConfig = shouldConfigureLocal ? SAML_LOCAL_CONFIG : SAML_BLUEMIX_CONFIG;
    //const samlConfig = SAML_LOCAL_CONFIG;

  // Add SAML strategy to passport.
  passport.use(new SAML.Strategy(samlConfig, verifyUser));
  console.log('SAML %s Authentication Enabled', shouldConfigureLocal ? 'local' : 'Bluemix');

  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);
}

module.exports =  configurePassport;
