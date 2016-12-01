var SAML_SSO = "samlssocloud";
var PASSIVE_STS = "passivests";
var PASSIVE_STS_REPLY = "passiveSTSWReply";
var CUSTOM_SP = "custom";
var CONCUR_SP = "concur";
var AMAZON_SP = "aws";
var GOTOMEETING_SP = "gotomeeting";
var NETSUIT_SP = "netsuite";
var ZUORA_SP = "zuora";
var SALESFORCE_SP = "salesforce";
var WELLKNOWN_APPLICATION_TYPE = "appType";
var DEFAULT_SUBJECT_CLAIM_URI = "http://wso2.org/claims/emailaddress";

//Form Fields
var ISSUER = "issuer";
var ACS_URLS = "assertionConsumerURLs";
var APP_TYPE = "appType";
var NAME_ID_FORMAT = "nameIdFormat";
var ALIAS = "alias";
var SIGN_ALGO = "signingAlgorithm";
var DIGEST_ALGO = "digestAlgorithm";
var ENABLE_RESPONSE_SIGNATURE = "enableResponseSignature";
var ENABLE_SIG_VALID = "enableSigValidation";
var ENABLE_ENC_ASSERTION = "enableEncAssertion";
var ENABLE_SLO = "enableSingleLogout";
var ENABLE_ATTR_PROF = "enableAttributeProfile";
var ENABLE_DEFAULT_ATTR_PROF = "enableDefaultAttributeProfile";
var ACS_INDEX = "acsindex";
var ENABLE_AUDIENCE_RESTRICTION = "enableAudienceRestriction";
var ENABLE_RECEIPIENTS = "enableRecipients";
var ENABLE_IDP_SSO = "enableIdPInitSSO";
var ENABLE_IDP_SLO = "enableIdPInitSLO";

//AWS Settings
var AWS_SUBJECT_REMOTE_DIALECT = "https://aws.amazon.com/SAML/Attributes/Role";
var AWS_SUBJECT_LOCAL_DIALECT = "http://wso2.org/claims/awsrole";
var AWS_EMAIL_REMOTE_DIALECT = "https://aws.amazon.com/SAML/Attributes/RoleSessionName";


//claim Dialects
var WSO2_EMAIL = "http://wso2.org/claims/emailaddress";
var PROXY_CONTEXT_PATH = "ProxyContextPath";
const APP_LIMIT = 20;