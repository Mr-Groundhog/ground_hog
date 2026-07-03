"use client";

import * as React from "react";
import { Copy, FileJson, Trash2, Download, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type OutputFormat = "sub2api" | "cpa";

type ConvertedAccount = {
  sourceName: string;
  sourcePath: string;
  email: string | undefined;
  name: string | undefined;
  expiresAt?: string;
  accessTokenExpiresAt?: number;
  cpa: Record<string, unknown>;
  codex: Record<string, unknown>;
  axonhub: Record<string, unknown> | undefined;
  sub2apiAccount: Record<string, unknown> | undefined;
};

type SkippedItem = {
  sourceName: string;
  path: string;
  reason: string;
};

const OUTPUT_LABELS: Record<OutputFormat, string> = {
  sub2api: "sub2api",
  cpa: "CPA",
};

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function firstNonEmpty(...values: (string | undefined)[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return undefined;
}

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function encodeBase64UrlJson(value: unknown) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function parseJwtPayload(token: string | undefined) {
  if (typeof token !== "string" || token.trim() === "") {
    return undefined;
  }

  const segments = token.split(".");
  if (segments.length < 2) {
    return undefined;
  }

  try {
    return JSON.parse(decodeBase64Url(segments[1])) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function getOpenAIAuthSection(payload: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!isPlainObject(payload)) {
    return {};
  }

  const auth = payload["https://api.openai.com/auth"];
  return isPlainObject(auth) ? auth : {};
}


function getOpenAIProfileSection(payload: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!isPlainObject(payload)) {
    return {};
  }

  const profile = payload["https://api.openai.com/profile"];
  return isPlainObject(profile) ? profile : {};
}

function normalizeTimestamp(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const milliseconds = value > 1e11 ? value : value * 1000;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function timestampFromUnixSeconds(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return undefined;
  }

  const date = new Date(numeric * 1000);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function unixSecondsFromJwtExp(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return undefined;
  }

  return Math.trunc(numeric);
}

function epochSecondsFromValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.trunc(numeric > 1e11 ? numeric / 1000 : numeric);
  }

  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? Math.trunc(parsed / 1000) : 0;
}

function buildSyntheticCodexIdToken(
  email: string | undefined,
  accountId: string | undefined,
  planType: string | undefined,
  userId: string | undefined,
  expiresAt: string | undefined,
) {
  if (!accountId) {
    return undefined;
  }

  const now = Math.trunc(Date.now() / 1000);
  const authInfo: Record<string, unknown> = { chatgpt_account_id: accountId };
  const expires = epochSecondsFromValue(expiresAt) || now + 90 * 24 * 60 * 60;

  if (planType) {
    authInfo.chatgpt_plan_type = planType;
  }

  if (userId) {
    authInfo.chatgpt_user_id = userId;
    authInfo.user_id = userId;
  }

  const payload: Record<string, unknown> = {
    iat: now,
    exp: expires,
    "https://api.openai.com/auth": authInfo,
  };

  if (email) {
    payload.email = email;
  }

  return `${encodeBase64UrlJson({ alg: "none", typ: "JWT", cpa_synthetic: true })}.${encodeBase64UrlJson(payload)}.synthetic`;
}

function getExpiresIn(expiresAt: string | undefined, now = new Date()) {
  if (!expiresAt) {
    return undefined;
  }

  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) {
    return undefined;
  }

  return Math.max(0, Math.floor((expiresMs - now.getTime()) / 1000));
}

function getAxonHubLastRefresh(expiresAt: string | undefined, now = new Date()) {
  const expiresMs = expiresAt ? new Date(expiresAt).getTime() : NaN;
  if (Number.isNaN(expiresMs)) {
    return now.toISOString();
  }

  return new Date(expiresMs - 60 * 60 * 1000).toISOString();
}

function stripUnavailable(value: unknown): unknown {
  if (Array.isArray(value)) {
    return (value as unknown[]).map(stripUnavailable).filter((item) => item !== undefined);
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, stripUnavailable(item)])
      .filter(([, item]) => item !== undefined);
    return entries.length ? Object.fromEntries(entries as [string, unknown][]) : undefined;
  }

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}

function toEmailKey(email: string | undefined) {
  if (typeof email !== "string") {
    return undefined;
  }

  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function sanitizeFileToken(value: string | undefined, fallback = "chatgpt-session") {
  const base = firstNonEmpty(value, fallback) || fallback;
  return base
    .replace(/\.[^.]+$/u, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || fallback;
}

function getTimestampToken(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + "_" + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join("-");
}

function formatDisplayDate(value: string | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (item: number) => String(item).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function collectSessionLikeObjects(value: unknown, sourceName = "pasted-json"): Array<{ value: Record<string, any>; sourceName: string; path: string }> {
  const found: Array<{ value: Record<string, any>; sourceName: string; path: string }> = [];
  const visited = new WeakSet<any>();

  function visit(item: unknown, path: string) {
    if (!isPlainObject(item) && !Array.isArray(item)) {
      return;
    }

    if (isPlainObject(item)) {
      const obj = item as Record<string, any>;
      if (visited.has(obj)) {
        return;
      }
      visited.add(obj);

      const token = firstNonEmpty(
        obj.accessToken as string | undefined,
        obj.access_token as string | undefined,
        obj.tokens?.accessToken as string | undefined,
        obj.tokens?.access_token as string | undefined,
        obj.token?.accessToken as string | undefined,
        obj.token?.access_token as string | undefined,
        obj.credentials?.accessToken as string | undefined,
        obj.credentials?.access_token as string | undefined,
      );
      const hasIdentity = isPlainObject(obj.user) || firstNonEmpty(
        obj.email as string | undefined,
        obj.name as string | undefined,
        obj.label as string | undefined,
        obj.meta?.label as string | undefined,
        obj.tokens?.accountId as string | undefined,
        obj.tokens?.account_id as string | undefined,
        obj.tokens?.chatgptAccountId as string | undefined,
        obj.tokens?.chatgpt_account_id as string | undefined,
        obj.providerSpecificData?.chatgptAccountId as string | undefined,
        obj.providerSpecificData?.chatgpt_account_id as string | undefined,
        obj.id as string | undefined,
      );
      if (token && hasIdentity) {
        found.push({ value: obj, sourceName, path });
        return;
      }

      for (const [key, child] of Object.entries(obj)) {
        if (key === "accessToken" || key === "access_token" || key === "sessionToken") {
          continue;
        }
        visit(child, `${path}.${key}`);
      }
      return;
    }

    (item as unknown[]).forEach((child, index) => visit(child, `${path}[${index}]`));
  }

  visit(value, "$");
  return found;
}

function parseInputDocuments(text: string) {
  if (typeof text !== "string" || text.trim() === "") {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`JSON 解析失败：${(error as Error).message}`);
  }

  return collectSessionLikeObjects(parsed);
}

function convertSession(record: Record<string, any>, options: { now?: Date; sourceName?: string; sourcePath?: string } = {}) {
  if (!isPlainObject(record)) {
    throw new Error("session 不是 JSON 对象");
  }

  const accessToken = firstNonEmpty(
    record.accessToken as string | undefined,
    record.access_token as string | undefined,
    record.tokens?.accessToken as string | undefined,
    record.tokens?.access_token as string | undefined,
    record.token?.accessToken as string | undefined,
    record.token?.access_token as string | undefined,
    record.credentials?.accessToken as string | undefined,
    record.credentials?.access_token as string | undefined,
  );
  if (!accessToken) {
    throw new Error("缺少 accessToken");
  }

  const sessionToken = firstNonEmpty(
    record.sessionToken as string | undefined,
    record.session_token as string | undefined,
    record.tokens?.sessionToken as string | undefined,
    record.tokens?.session_token as string | undefined,
    record.token?.sessionToken as string | undefined,
    record.token?.session_token as string | undefined,
    record.credentials?.session_token as string | undefined,
  );
  const refreshToken = firstNonEmpty(
    record.refreshToken as string | undefined,
    record.refresh_token as string | undefined,
    record.tokens?.refreshToken as string | undefined,
    record.tokens?.refresh_token as string | undefined,
    record.token?.refreshToken as string | undefined,
    record.token?.refresh_token as string | undefined,
    record.credentials?.refresh_token as string | undefined,
  );
  const inputIdToken = firstNonEmpty(
    record.idToken as string | undefined,
    record.id_token as string | undefined,
    record.tokens?.idToken as string | undefined,
    record.tokens?.id_token as string | undefined,
    record.token?.idToken as string | undefined,
    record.token?.id_token as string | undefined,
    record.credentials?.id_token as string | undefined,
  );

  const payload = parseJwtPayload(accessToken);
  const idPayload = parseJwtPayload(inputIdToken);
  const auth = getOpenAIAuthSection(payload);
  const idAuth = getOpenAIAuthSection(idPayload);
  const profile = getOpenAIProfileSection(payload);
  const hasRefreshToken = Boolean(refreshToken);
  const accessTokenExpiresAt = hasRefreshToken ? undefined : unixSecondsFromJwtExp(payload?.exp as number | undefined);
  const expiresAt = hasRefreshToken
    ? undefined
    : firstNonEmpty(
        payload ? timestampFromUnixSeconds(payload.exp as number | undefined) : undefined,
        normalizeTimestamp(record.expires),
        normalizeTimestamp(record.expiresAt),
        normalizeTimestamp(record.expired),
        normalizeTimestamp(record.expires_at),
      );

  const email = firstNonEmpty(
    record.user?.email as string | undefined,
    record.email as string | undefined,
    record.meta?.label as string | undefined,
    record.label as string | undefined,
    record.credentials?.email as string | undefined,
    record.providerSpecificData?.email as string | undefined,
    profile.email as string | undefined,
    idPayload?.email as string | undefined,
    payload?.email as string | undefined,
  );

  const accountId = firstNonEmpty(
    record.account?.id as string | undefined,
    record.account_id as string | undefined,
    record.tokens?.accountId as string | undefined,
    record.tokens?.account_id as string | undefined,
    record.chatgptAccountId as string | undefined,
    record.chatgpt_account_id as string | undefined,
    record.meta?.chatgptAccountId as string | undefined,
    record.meta?.chatgpt_account_id as string | undefined,
    record.tokens?.chatgptAccountId as string | undefined,
    record.tokens?.chatgpt_account_id as string | undefined,
    record.providerSpecificData?.chatgptAccountId as string | undefined,
    record.providerSpecificData?.chatgpt_account_id as string | undefined,
    record.credentials?.chatgpt_account_id as string | undefined,
    auth.chatgpt_account_id as string | undefined,
    idAuth.chatgpt_account_id as string | undefined,
    record.provider === "codex" ? (record.id as string | undefined) : undefined,
  );

  const chatgptAccountId = firstNonEmpty(
    record.chatgptAccountId as string | undefined,
    record.chatgpt_account_id as string | undefined,
    record.meta?.chatgptAccountId as string | undefined,
    record.meta?.chatgpt_account_id as string | undefined,
    record.tokens?.chatgptAccountId as string | undefined,
    record.tokens?.chatgpt_account_id as string | undefined,
    record.providerSpecificData?.chatgptAccountId as string | undefined,
    record.providerSpecificData?.chatgpt_account_id as string | undefined,
    record.credentials?.chatgpt_account_id as string | undefined,
    auth.chatgpt_account_id as string | undefined,
    idAuth.chatgpt_account_id as string | undefined,
  );

  const workspaceId = firstNonEmpty(
    record.account?.workspaceId as string | undefined,
    record.account?.workspace_id as string | undefined,
    record.workspaceId as string | undefined,
    record.workspace_id as string | undefined,
    record.meta?.workspaceId as string | undefined,
    record.meta?.workspace_id as string | undefined,
    record.providerSpecificData?.workspaceId as string | undefined,
    record.providerSpecificData?.workspace_id as string | undefined,
    record.credentials?.workspace_id as string | undefined,
    payload?.workspace_id as string | undefined,
    idPayload?.workspace_id as string | undefined,
  );

  const userId = firstNonEmpty(
    record.user?.id as string | undefined,
    record.user_id as string | undefined,
    record.chatgptUserId as string | undefined,
    record.providerSpecificData?.chatgptUserId as string | undefined,
    record.providerSpecificData?.chatgpt_user_id as string | undefined,
    auth.chatgpt_user_id as string | undefined,
    auth.user_id as string | undefined,
    idAuth.chatgpt_user_id as string | undefined,
    idAuth.user_id as string | undefined,
  );

  const planType = firstNonEmpty(
    record.account?.planType as string | undefined,
    record.account?.plan_type as string | undefined,
    record.planType as string | undefined,
    record.plan_type as string | undefined,
    record.providerSpecificData?.chatgptPlanType as string | undefined,
    record.providerSpecificData?.chatgpt_plan_type as string | undefined,
    record.credentials?.plan_type as string | undefined,
    auth.chatgpt_plan_type as string | undefined,
    idAuth.chatgpt_plan_type as string | undefined,
  );

  const exportedAt = normalizeTimestamp(options.now || new Date());
  const expiresIn = getExpiresIn(expiresAt, options.now || new Date());
  const sourceName = firstNonEmpty(options.sourceName, "pasted-json") || "pasted-json";
  const sourceType = "chatgpt_web_session";
  const name = firstNonEmpty(email, sourceName, "ChatGPT Account");
  const syntheticIdToken = !inputIdToken
    ? buildSyntheticCodexIdToken(email, accountId, planType, userId, expiresAt)
    : undefined;
  const idToken = firstNonEmpty(inputIdToken, syntheticIdToken);

  const cpa = Object.fromEntries(
    Object.entries({
      type: "codex",
      account_id: accountId,
      chatgpt_account_id: accountId,
      email,
      name,
      plan_type: planType,
      chatgpt_plan_type: planType,
      id_token: idToken,
      id_token_synthetic: Boolean(syntheticIdToken) || undefined,
      access_token: accessToken,
      refresh_token: refreshToken || "",
      session_token: sessionToken,
      last_refresh: exportedAt,
      expired: expiresAt,
      disabled: Boolean(record.disabled) || undefined,
    }).filter(([, value]) => value !== undefined && value !== null)
  );

  const sub2apiAccount = stripUnavailable({
    name: firstNonEmpty(name, email, sourceName, "ChatGPT Account"),
    platform: "openai",
    type: "oauth",
    expires_at: accessTokenExpiresAt,
    auto_pause_on_expired: accessTokenExpiresAt ? true : undefined,
    concurrency: 10,
    priority: 1,
    credentials: {
      access_token: accessToken,
      chatgpt_account_id: accountId,
      chatgpt_user_id: userId,
      email,
      expires_at: expiresAt,
      expires_in: expiresIn,
      plan_type: planType,
    },
    extra: {
      email,
      email_key: toEmailKey(email),
      name,
      auth_provider: firstNonEmpty(record.authProvider as string | undefined, record.auth_provider as string | undefined),
      source: sourceType,
      last_refresh: exportedAt,
    },
  });

  const priority = Number.isFinite(Number(record.priority)) ? Number(record.priority) : 9;
  const isActive = typeof record.isActive === "boolean" ? record.isActive : !Boolean(record.disabled);
  const createdAt = normalizeTimestamp(record.createdAt) || exportedAt;
  const updatedAt = normalizeTimestamp(record.updatedAt) || exportedAt;

  const axonhubRefreshToken = refreshToken || "__missing_refresh_token__";

  const codex = {
    auth_mode: "chatgpt",
    OPENAI_API_KEY: null,
    tokens: {
      id_token: idToken,
      access_token: accessToken,
      refresh_token: refreshToken || "",
      account_id: accountId,
    },
    last_refresh: exportedAt,
  };

  const axonhub = stripUnavailable({
    auth_mode: "chatgpt",
    last_refresh: getAxonHubLastRefresh(expiresAt, options.now || new Date()),
    tokens: {
      access_token: accessToken,
      refresh_token: axonhubRefreshToken,
      id_token: idToken,
    },
    axonhub_refresh_token_placeholder: refreshToken ? undefined : true,
    axonhub_note: refreshToken ? undefined : "refresh_token is a placeholder; access_token works only until it expires.",
  });

  return {
    sourceName,
    sourcePath: options.sourcePath || "$",
    email,
    name,
    expiresAt,
    accessTokenExpiresAt,
    cpa,
    codex,
    axonhub,
    sub2apiAccount,
  };
}

function buildSub2apiDocument(converted: ConvertedAccount[], now = new Date()) {
  return {
    exported_at: now.toISOString(),
    proxies: [],
    accounts: converted.map((item) => item.sub2apiAccount),
  };
}

function buildOutputDocument(format: OutputFormat, converted: ConvertedAccount[]) {
  const now = new Date();
  switch (format) {
    case "sub2api":
      return buildSub2apiDocument(converted, now);
    case "cpa":
      return converted.length === 1
        ? converted[0][format]
        : converted.map((item) => item[format]);
    default:
      return buildSub2apiDocument(converted, now);
  }
}

function convertFromText(text: string) {
  const sources = parseInputDocuments(text);
  const converted: ConvertedAccount[] = [];
  const skipped: SkippedItem[] = [];
  const now = new Date();

  sources.forEach((item, index) => {
    try {
      // @ts-ignore
      converted.push(convertSession(item.value, { now, sourceName: item.sourceName, sourcePath: item.path || `$[${index}]` }));
    } catch (error) {
      skipped.push({ sourceName: item.sourceName, path: item.path, reason: (error as Error).message });
    }
  });

  if (!sources.length) {
    skipped.push({ sourceName: "pasted-json", path: "$", reason: "未找到包含 accessToken 和 user/email 的 session 对象" });
  }

  return { converted, skipped };
}

export function SessionConverter() {
  const [input, setInput] = React.useState("");
  const [format, setFormat] = React.useState<OutputFormat>("sub2api");
  const [converted, setConverted] = React.useState<ConvertedAccount[]>([]);
  const [skipped, setSkipped] = React.useState<SkippedItem[]>([]);
  const [outputText, setOutputText] = React.useState("");
  const [isConverting, setIsConverting] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const updateOutput = React.useCallback(() => {
    const hasConverted = converted.length > 0;
    let next = "";

    if (hasConverted) {
      next = JSON.stringify(buildOutputDocument(format, converted), null, 2);
    }

    setOutputText(next);
  }, [converted, format]);

  React.useEffect(() => {
    updateOutput();
  }, [converted, format, updateOutput]);

  const handleConvert = React.useCallback(
    async (text: string) => {
      setIsConverting(true);
      try {
        const result = convertFromText(text);
        setConverted(result.converted);
        setSkipped(result.skipped);
        if (result.converted.length) {
          toast.success(`解析完成：${result.converted.length} 个账号，跳过 ${result.skipped.length} 项`);
        } else {
          toast.error("没有可转换账号");
        }
      } catch (error) {
        setConverted([]);
        setSkipped([{ sourceName: "pasted-json", path: "$", reason: (error as Error).message }]);
        toast.error((error as Error).message);
      } finally {
        setIsConverting(false);
      }
    },
    [toast],
  );

  const handlePaste = React.useCallback(
    async (text: string) => {
      setInput(text);
      await handleConvert(text);
    },
    [handleConvert],
  );

  const handleFiles = React.useCallback(
    async (files: FileList | null) => {
      if (!files?.length) {
        return;
      }

      const jsonFiles = Array.from(files).filter((file) => file.name.toLowerCase().endsWith(".json"));
      if (!jsonFiles.length) {
        toast.error("没有选择 JSON 文件");
        return;
      }

      setIsConverting(true);
      const documents: Array<{ value: Record<string, unknown>; sourceName: string; path: string }> = [];
      const convertSkipped: SkippedItem[] = [];

      for (const file of jsonFiles) {
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          const found = collectSessionLikeObjects(parsed, file.webkitRelativePath || file.name);
          if (!found.length) {
            convertSkipped.push({
              sourceName: file.webkitRelativePath || file.name,
              path: "$",
              reason: "未找到包含 accessToken 和 user/email 的 session 对象",
            });
          }
          documents.push(...found);
        } catch (error) {
          convertSkipped.push({
            sourceName: file.webkitRelativePath || file.name,
            path: "$",
            reason: (error as Error).message,
          });
        }
      }

      const now = new Date();
      const convertedAccounts: ConvertedAccount[] = [];
      const finalSkipped = [...convertSkipped];

      documents.forEach((item) => {
      // @ts-ignore
        try {
           // @ts-ignore
          convertedAccounts.push(convertSession(item.value, { now, sourceName: item.sourceName, sourcePath: item.path }));
        } catch (error) {
          finalSkipped.push({ sourceName: item.sourceName, path: item.path, reason: (error as Error).message });
        }
      });

      setConverted(convertedAccounts);
      setSkipped(finalSkipped);
      setInput(
        documents.length === 1
          ? JSON.stringify(documents[0].value, null, 2)
          : JSON.stringify(documents.map((item) => item.value), null, 2)
      );
      setFileName(null);
      toast.success(`读取 ${jsonFiles.length} 个文件，生成 ${convertedAccounts.length} 个账号，跳过 ${finalSkipped.length} 项`);
      setIsConverting(false);
    },
    [toast],
  );

  const handleCopy = React.useCallback(async () => {
    if (!outputText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      toast.success("已复制到剪贴板");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = outputText;
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      toast.success("已复制到剪贴板");
    }
  }, [outputText, toast]);

  const handleDownload = React.useCallback(() => {
    if (!outputText) {
      return;
    }

    const first = converted[0];
    const base = sanitizeFileToken(first?.email || first?.name || format);
    const fileName = `${base}.${format}.${getTimestampToken()}.json`;
    setFileName(fileName);
    const blob = new Blob([outputText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [converted, format, outputText]);

  const handleClear = React.useCallback(() => {
    setInput("");
    setConverted([]);
    setSkipped([]);
    setOutputText("");
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleLoadExample = React.useCallback(() => {
    const example = {
      user: { id: "user-example", email: "mark@example.com" },
      expires: "2026-08-06T14:29:36.155Z",
      account: { id: "00000000-0000-4000-9000-000000000000", planType: "plus" },
      accessToken: "paste-real-access-token-here",
      sessionToken: "paste-real-session-token-here",
      authProvider: "openai",
    };
    setInput(JSON.stringify(example, null, 2));
    handleConvert(JSON.stringify(example, null, 2));
  }, [handleConvert]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Label className="text-base font-semibold">转换</Label>
          <p className="text-sm text-muted-foreground">选择输出格式，仅保留 sub2api 和 CPA。</p>
        </div>
        <Tabs value={format} onValueChange={(value) => setFormat(value as OutputFormat)} className="w-full sm:w-64">
          <TabsList className="grid grid-cols-2 w-full border border-cyan-500/25 bg-cyan-500/10 shadow-sm dark:border-cyan-400/30 dark:bg-cyan-400/10">
            {(Object.keys(OUTPUT_LABELS) as OutputFormat[]).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-muted-foreground data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:data-[state=active]:border-cyan-300 dark:data-[state=active]:bg-cyan-300 dark:data-[state=active]:text-slate-950"
              >
                {OUTPUT_LABELS[key]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3 rounded-md border border-cyan-500/25 bg-cyan-500/10 p-4 text-sm leading-6">
        <div>
          <p className="font-medium text-foreground">Session 数据从这里获取</p>
          <p className="text-muted-foreground">
            先在浏览器登录 ChatGPT，然后打开{" "}
            <a
              href="https://chatgpt.com/api/auth/session"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-cyan-700 underline underline-offset-4 hover:text-cyan-600 dark:text-cyan-200 dark:hover:text-cyan-100"
            >
              https://chatgpt.com/api/auth/session
            </a>
            ，复制页面显示的整段 JSON，粘贴到下方输入框。
          </p>
        </div>
        <p className="text-muted-foreground">
          OpenAI 已限制通过 Web session 转换导入来跳过 Codex OAuth add phone / 手机绑定验证；本页面仅用于格式转换。
        </p>
        <div className="flex gap-2 rounded-md border border-red-500/25 bg-red-500/10 p-3 text-red-700 dark:text-red-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>这段 JSON 包含 accessToken 和 sessionToken，等同敏感登录凭证，不要发给别人。</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-4 md:p-6 space-y-4 h-full">
          <div className="flex flex-col gap-2">
            <Label className="text-base font-semibold">输入</Label>
            <p className="text-sm text-muted-foreground">粘贴 ChatGPT Web session JSON，或拖入 JSON 文件。</p>
          </div>

          <div className="flex flex-col gap-4">
            <Textarea
              className="font-mono text-sm bg-muted/30 border-0 focus-visible:ring-1 min-h-[420px]"
              style={{ wordBreak: "break-all", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
              placeholder='{"user":{"email":"you@example.com"},"accessToken":"...","sessionToken":"..."}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileJson className="mr-2 h-4 w-4" />
                导入 JSON
              </Button>
              <Button variant="secondary" onClick={handleLoadExample}>
                加载示例
              </Button>
              <Button variant="ghost" onClick={handleClear}>
                <Trash2 className="mr-2 h-4 w-4" />
                清空
              </Button>
              <Button onClick={() => handleConvert(input)} disabled={isConverting || !input.trim()}>
                {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                转换
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 space-y-4 h-full">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">输出</Label>
                <p className="text-sm text-muted-foreground">当前输出为 {OUTPUT_LABELS[format]} 导入 JSON。</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="border-cyan-500/40 bg-cyan-500/10 text-cyan-700 hover:border-cyan-500 hover:bg-cyan-500 hover:text-slate-950 disabled:border-border disabled:bg-muted disabled:text-muted-foreground dark:border-cyan-300/40 dark:bg-cyan-300/10 dark:text-cyan-200 dark:hover:border-cyan-300 dark:hover:bg-cyan-300 dark:hover:text-slate-950"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                  disabled={!outputText}
                  className="border-cyan-500/40 bg-cyan-500/10 text-cyan-700 hover:border-cyan-500 hover:bg-cyan-500 hover:text-slate-950 disabled:border-border disabled:bg-muted disabled:text-muted-foreground dark:border-cyan-300/40 dark:bg-cyan-300/10 dark:text-cyan-200 dark:hover:border-cyan-300 dark:hover:bg-cyan-300 dark:hover:text-slate-950"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {fileName && <Badge variant="secondary">最近下载：{fileName}</Badge>}

          <Textarea
            className="font-mono text-sm bg-muted/30 border-0 focus-visible:ring-1 min-h-[420px]"
            style={{ wordBreak: "break-all", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
            value={outputText}
            readOnly
          />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">账号</Label>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">名称</th>
                  <th className="text-left p-2">邮箱</th>
                  <th className="text-left p-2">过期时间</th>
                  <th className="text-left p-2">来源</th>
                </tr>
              </thead>
              <tbody>
                {converted.length ? (
                  converted.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2" title={item.name}>
                        <div className="max-w-[200px] truncate">{item.name || "-"}</div>
                      </td>
                      <td className="p-2" title={item.email}>
                        <div className="max-w-[200px] truncate">{item.email || "-"}</div>
                      </td>
                      <td className="p-2" title={item.expiresAt || ""}>
                        <div className="max-w-[200px] truncate">{formatDisplayDate(item.expiresAt) || "-"}</div>
                      </td>
                      <td className="p-2" title={item.sourceName}>
                        <div className="max-w-[200px] truncate">{item.sourceName || "pasted-json"}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      暂无可转换账号
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">问题</Label>
          <div className="rounded-md border p-3 text-sm text-muted-foreground min-h-[120px]">
            {skipped.length ? (
              <div className="space-y-1">
                {skipped.map((item, index) => (
                  <div key={index}>
                    {escapeHtml(item.sourceName || "input")} {escapeHtml(item.path || "")}: {escapeHtml(item.reason)}
                  </div>
                ))}
              </div>
            ) : (
              <span>暂无问题</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
