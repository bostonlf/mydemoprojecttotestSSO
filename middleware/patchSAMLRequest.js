import xmldom from 'xmldom';
import xpath from 'xpath';

/**
 * The IBM IDP does not send a properly formatted XML SAML assertion response for Passport to
 * handle. So we patch the request body so it is formatted properly.
 * 
 * @param {Object} request The Express HTTP request object.
 * @param {Object} response The Express HTTP response object.
 * @param {Function} next Function to call next middleware.
 */
function patchSAMLRequest(request, response, next) {
  try {
    const xmlData = new Buffer(request.body.SAMLResponse, 'base64').toString('utf-8');

    // Parse XML into DOM
    const doc = new xmldom.DOMParser().parseFromString(xmlData);
    const signedInfos = xpath.select('//*[local-name()=\'SignedInfo\']', doc);
    const assertions = xpath.select('//*[local-name()=\'Assertion\']', doc);

    signedInfos.forEach((signedInfo) => {
      signedInfo.setAttribute(
        'xmlns:ds',
        'http://www.w3.org/2000/09/xmldsig#'
      );
    });

    assertions.forEach((assertion) => {
      assertion.setAttribute(
        'xmlns:saml',
        'urn:oasis:names:tc:SAML:2.0:assertion'
      );
      assertion.setAttribute(
        'xmlns:xs',
        'http://www.w3.org/2001/XMLSchema'
      );
      assertion.setAttribute(
        'xmlns:xsi',
        'http://www.w3.org/2001/XMLSchema-instance'
      );
    });

    request.body.SAMLResponse = new Buffer(doc.toString(), 'utf-8').toString('base64');
  } catch (error) {
    // Presuming bad SAMLResponse just pass it through
    next(error);
    return;
  }
  next();
}

export default patchSAMLRequest;