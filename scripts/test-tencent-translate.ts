import tencentcloud from "tencentcloud-sdk-nodejs-tmt";
import dotenv from "dotenv";

dotenv.config();

const client = new tencentcloud.tmt.v20180321.Client({
  credential: {
    secretId: process.env.TENCENTCLOUD_SECRET_ID!,
    secretKey: process.env.TENCENTCLOUD_SECRET_KEY!,
  },
  region: "ap-shanghai",
  profile: {
    httpProfile: { endpoint: "tmt.tencentcloudapi.com" },
  },
});

client.TextTranslation({
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
