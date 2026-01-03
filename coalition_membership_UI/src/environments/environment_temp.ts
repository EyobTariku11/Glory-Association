import packageInfo from "../../package.json";

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  clienUrl: "http://localhost:4200",
  baseUrl: "http://localhost:5267/api",
  assetUrl: "http://localhost:5267",

  paymentUrl:"http://localhost:8080/",
  telegramBot :"abizeermembershipbot",
  moodleUrl: "https://emwa-elearning.com/webservice/rest/server.php",
  smsUrl: "https://api.geezsms.com/api/v1/sms/send",
};
