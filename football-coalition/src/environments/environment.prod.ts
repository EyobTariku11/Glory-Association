import packageInfo from '../../package.json';

export const environment = {
  
  appVersion: packageInfo.version,
  production: true,
  clienUrl:"https://eplffc.et/admin",
  baseUrl:'https://eplffc.et/api/api',
  assetUrl :'https://eplffc.et/api',
  paymentUrl : 'https://eplffc.et/payment/',
  moodleUrl: 'https://emwa-elearning.com/webservice/rest/server.php',
  smsUrl:'https://api.geezsms.com/api/v1/sms/send',
  telegramBot :"abizeermembershipbot",

  // clienUrl:"http://5.75.176.87:4201",
  // baseUrl:'http://5.75.176.87:9006/api',
  // assetUrl :'http://5.75.176.87:9006',
  // paymentUrl : 'https://node-express-vercel-wine-gamma.vercel.app/',
  // moodleUrl: 'https://emwa-elearning.com/webservice/rest/server.php'

};
