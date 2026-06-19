const dotenv = require("dotenv");
dotenv.config();

const tencentcloud = require("tencentcloud-sdk-nodejs-tmt");

console.log("SECRET_ID:", process.env.TENCENTCLOUD_SECRET_ID?.slice(0, 10) + "...");
console.log("SECRET_KEY:", process.env.TENCENTCLOUD_SECRET_KEY?.slice(0, 4) + "...");

const client = new tencentcloud.tmt.v20180321.Client({
  credential: {
    secretId: process.env.TENCENTCLOUD_SECRET_ID,
    secretKey: process.env.TENCENTCLOUD_SECRET_KEY,
  },
  region: "ap-shanghai",
  profile: {
    httpProfile: { endpoint: "tmt.tencentcloudapi.com" },
  },
});

client.TextTranslate({
  SourceText: "用户登录",
  Source: "zh",
  Target: "en",
  ProjectId: 0,
}).then(
  (data) => {
    console.log("Success:", JSON.stringify(data, null, 2));
  },
  (err) => {
    console.error("Error:", err);
  }
);
