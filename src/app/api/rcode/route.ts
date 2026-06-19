import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/upstash-redis";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tencentcloud = require("tencentcloud-sdk-nodejs-tmt");

type TmtClientType = InstanceType<typeof tencentcloud.tmt.v20180321.Client>;

interface TranslateResult {
  camelCase: string;
  pascalCase: string;
  snakeCase: string;
  kebabCase: string;
  upperSnakeCase: string;
}

interface NamingItem {
  key: string;
  value: string;
}

interface NamingGroup {
  name: string;
  items: NamingItem[];
}

interface ApiResponse {
  code: number;
  message: string;
  data: NamingGroup[];
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function transformToNaming(raw: string): TranslateResult {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!cleaned) {
    return { camelCase: "", pascalCase: "", snakeCase: "", kebabCase: "", upperSnakeCase: "" };
  }
  const words = cleaned.split(" ");
  const camelCase = words[0].toLowerCase() + words.slice(1).map(capitalize).join("");
  const pascalCase = words.map(capitalize).join("");
  const snakeCase = words.join("_");
  const kebabCase = words.join("-");
  const upperSnakeCase = words.join("_").toUpperCase();
  return { camelCase, pascalCase, snakeCase, kebabCase, upperSnakeCase };
}

const VARIABLE_PREFIXES = [
  { label: "全局变量", prefix: "g" },
  { label: "字符串变量", prefix: "s" },
  { label: "数字变量", prefix: "n" },
  { label: "逻辑变量", prefix: "b" },
  { label: "数组变量", prefix: "a" },
  { label: "正则命名", prefix: "r" },
  { label: "函数命名", prefix: "f" },
  { label: "成员变量", prefix: "m" },
  { label: "临时变量", prefix: "tmp" },
  { label: "状态变量", prefix: "state" },
];

const METHOD_PREFIXES: { label: string; affix: string; type: "prefix" | "suffix" }[] = [
  { label: "加载方法", affix: "load", type: "prefix" },
  { label: "判断执行", affix: "can", type: "prefix" },
  { label: "判断包含", affix: "has", type: "prefix" },
  { label: "判断存在", affix: "is", type: "prefix" },
  { label: "事件函数", affix: "fn", type: "prefix" },
  { label: "接口类", affix: "i", type: "prefix" },
  { label: "接口实现类", affix: "Impl", type: "suffix" },
  { label: "get方法", affix: "get", type: "prefix" },
  { label: "set方法", affix: "set", type: "prefix" },
  { label: "查询方法", affix: "query", type: "prefix" },
  { label: "查看方法", affix: "view", type: "prefix" },
  { label: "详情方法", affix: "Details", type: "suffix" },
  { label: "读取方法", affix: "read", type: "prefix" },
  { label: "创建方法", affix: "create", type: "prefix" },
  { label: "保存方法", affix: "save", type: "prefix" },
  { label: "新增方法", affix: "add", type: "prefix" },
  { label: "生成方法", affix: "emit", type: "prefix" },
  { label: "更新方法", affix: "update", type: "prefix" },
  { label: "编辑方法", affix: "edit", type: "prefix" },
  { label: "清除方法", affix: "clear", type: "prefix" },
  { label: "删除方法", affix: "delete", type: "prefix" },
  { label: "删除方法2", affix: "remove", type: "prefix" },
  { label: "移除方法", affix: "destroy", type: "prefix" },
  { label: "上传方法", affix: "upload", type: "prefix" },
  { label: "下载方法", affix: "down", type: "prefix" },
  { label: "缓存方法", affix: "cache", type: "prefix" },
];

function generateNamingGroups(t: TranslateResult): NamingGroup[] {
  const commonGroup: NamingGroup = {
    name: "常见命名",
    items: [
      { key: "常量", value: t.upperSnakeCase },
      { key: "大驼峰(类命名)", value: t.pascalCase },
      { key: "小驼峰(方法命名)", value: t.camelCase },
      { key: "下划线", value: t.snakeCase },
      { key: "前下划线", value: `_${t.snakeCase}` },
      { key: "项目名", value: t.kebabCase },
    ],
  };

  const variableItems: NamingItem[] = [];
  for (const { label, prefix } of VARIABLE_PREFIXES) {
    variableItems.push({ key: `${label}(驼峰)`, value: `${prefix}${t.pascalCase}` });
    variableItems.push({ key: `${label}(下划线)`, value: `${prefix}_${t.camelCase}` });
  }
  const variableGroup: NamingGroup = { name: "变量命名", items: variableItems };

  const methodItems: NamingItem[] = METHOD_PREFIXES.map(({ label, affix, type }) => ({
    key: label,
    value: type === "suffix" ? `${t.camelCase}${affix}` : `${affix}${t.pascalCase}`,
  }));
  const methodGroup: NamingGroup = { name: "方法命名", items: methodItems };

  return [commonGroup, variableGroup, methodGroup];
}

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function sanitizeInput(raw: string): string {
  const noSpaces = raw.replace(/\s+/g, "");
  return noSpaces.replace(/[^\u4e00-\u9fffa-zA-Z0-9]/g, "");
}

// ---- 腾讯云文本翻译 (SDK) ----

const TRANSLATE_KEY_PREFIX = "rcode:tr:";
const TRANSLATE_TTL_SECONDS = 21 * 24 * 60 * 60;

let tmtClient: TmtClientType | null = null;

function getTmtClient() {
  const secretId = process.env.TENCENTCLOUD_SECRET_ID;
  const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;
  if (!secretId || !secretKey) return null;

  if (!tmtClient) {
    tmtClient = new tencentcloud.tmt.v20180321.Client({
      credential: { secretId, secretKey },
      region: "ap-shanghai",
      profile: {
        httpProfile: { endpoint: "tmt.tencentcloudapi.com" },
      },
    });
  }
  return tmtClient;
}

async function getCachedTranslation(text: string): Promise<string | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const v = await redis.get<string>(`${TRANSLATE_KEY_PREFIX}${text}`);
    return typeof v === "string" && v ? v : null;
  } catch (e) {
    console.warn("[rcode] redis get failed:", e);
    return null;
  }
}

async function setCachedTranslation(text: string, result: string): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(`${TRANSLATE_KEY_PREFIX}${text}`, result, {
      ex: TRANSLATE_TTL_SECONDS,
    });
  } catch (e) {
    console.warn("[rcode] redis set failed:", e);
  }
}

async function translate(text: string): Promise<string> {
  const cached = await getCachedTranslation(text);
  if (cached) return cached;

  const client = getTmtClient();
  if (!client) return "";

  let result = "";
  try {
    const data = await client.TextTranslate({
      SourceText: text,
      Source: "zh",
      Target: "en",
      ProjectId: parseInt(process.env.TENCENT_TMT_PROJECT_ID || "0", 10),
    });
    result = data.TargetText || "";
  } catch (e) {
    console.error("[rcode] Tencent translation failed:", e);
  }

  if (result) {
    await setCachedTranslation(text, result);
  }
  return result;
}

// Rate limiting
const RATE_LIMIT_KEY_PREFIX = "rcode:rl:";

const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = redis.call('INCR', key)
if current == 1 then
  redis.call('EXPIRE', key, window)
end
if current > limit then
  return 0
end
return 1
`;

async function checkRateLimit(ip: string, limit = 30, windowSec = 60): Promise<boolean> {
  try {
    const redis = getRedis();
    if (!redis) return true;
    const ok = await redis.eval(RATE_LIMIT_SCRIPT, [`${RATE_LIMIT_KEY_PREFIX}${ip}`], [limit, windowSec]);
    return ok === 1;
  } catch (e) {
    console.warn("[rcode] redis rate-limit failed, allowing:", e);
    return true;
  }
}

function emptyResponse(): NextResponse<ApiResponse> {
  return NextResponse.json({ code: 0, message: "ok", data: [] });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!(await checkRateLimit(ip))) {
      return NextResponse.json(
        { code: 4, message: "请求过于频繁，请稍后再试", data: [] },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawQuery = typeof body?.query === "string" ? body.query : "";
    const cleaned = sanitizeInput(rawQuery);

    if (!cleaned) return emptyResponse();
    const input = cleaned.slice(0, 15);

    let englishText: string;
    if (containsChinese(input)) {
      englishText = await translate(input);
      if (!englishText) return emptyResponse();
    } else {
      englishText = input;
    }

    const namingFormats = transformToNaming(englishText);
    if (!namingFormats.camelCase) return emptyResponse();

    const data = generateNamingGroups(namingFormats);
    return NextResponse.json({ code: 0, message: "ok", data });
  } catch (error) {
    console.error("[rcode] Unexpected error:", error);
    return emptyResponse();
  }
}

export async function GET() {
  return emptyResponse();
}
