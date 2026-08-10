import {
  Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Hr
} from '@react-email/components';
import * as React from 'react';

interface StationApproveTemplateProps {
  /// 站点地址（用户跳转目标）
  url: string;
  /// 额度码（管理员手动粘贴，明文下发）
  creditCode: string;
  /// 额度（美元数字，如 5）
  amount: number | string;
  /// 失效时间（Date 或 ISO 字符串）
  expireAt: Date | string;
}

function formatExpire(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (!d || isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export const StationApproveTemplate = ({
  url,
  creditCode,
  amount,
  expireAt,
}: StationApproveTemplateProps) => (
  <Html>
    <Head />
    <Preview>🎉 你的公益站申请已通过，额度码已下发</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={h1}>HOG&apos;S PLATFORM</Heading>
        </Section>

        <Section style={section}>
          <Text style={text}>你好，站长：</Text>
          <Text style={text}>
            恭喜！你提交的公益站申请已经通过审核。以下是本次下发的权益信息，请在
            <strong>失效时间前</strong>完成兑换。
          </Text>

          <Section style={codeBox}>
            <Text style={codeLabel}>额度码</Text>
            <Text style={codeValue}>{creditCode}</Text>
          </Section>

          <Section style={infoGrid}>
            <Text style={infoRow}>
              <span style={infoLabel}>额度：</span>
              <span style={infoValue}>${amount}</span>
            </Text>
            <Text style={infoRow}>
              <span style={infoLabel}>失效时间：</span>
              <span style={infoValue}>{formatExpire(expireAt)}</span>
            </Text>
          </Section>

          <Section style={btnContainer}>
            <Link href={url} style={button}>
              前往公益站兑换
            </Link>
          </Section>

          <Text style={subText}>
            如果按钮无法跳转，请复制以下链接：<br />
            <Link href={url} style={link}>
              {url}
            </Link>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            请在失效时间前完成兑换，逾期额度码将失效。
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// 样式配置（普通简洁风）
const main = { backgroundColor: '#f9fafb', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '520px' };
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' };
const h1 = { color: '#111827', fontSize: '24px', textAlign: 'center' as const, letterSpacing: '2px', margin: '0' };
const section = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e5e7eb' };
const text = { color: '#4b5563', fontSize: '16px', lineHeight: '26px' };
const codeBox = { backgroundColor: '#f3f4f6', borderRadius: '10px', padding: '20px', textAlign: 'center' as const, margin: '24px 0' };
const codeLabel = { color: '#9ca3af', fontSize: '12px', margin: '0 0 10px', letterSpacing: '1px' };
const codeValue = { color: '#111827', fontSize: '22px', letterSpacing: '2px', fontWeight: 'bold' as const, margin: '0' };
const infoGrid = { margin: '0 0 8px' };
const infoRow = { color: '#4b5563', fontSize: '15px', margin: '8px 0' };
const infoLabel = { color: '#9ca3af' };
const infoValue = { color: '#111827', fontWeight: 'bold' as const };
const btnContainer = { textAlign: 'center' as const, margin: '28px 0 16px' };
const button = {
  backgroundColor: '#4F46E5', borderRadius: '6px', color: '#fff', fontSize: '16px',
  textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 24px'
};
const link = { color: '#4F46E5', fontSize: '14px', wordBreak: 'break-all' as const };
const subText = { color: '#9ca3af', fontSize: '14px', marginTop: '8px' };
const hr = { borderColor: '#f3f4f6', margin: '20px 0' };
const footer = { color: '#9ca3af', fontSize: '14px', textAlign: 'center' as const };
