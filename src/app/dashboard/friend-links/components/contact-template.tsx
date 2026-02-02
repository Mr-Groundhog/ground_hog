import {
  Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Hr
} from '@react-email/components';
import * as React from 'react';

export const FriendApproveTemplate = ({ siteName }: { siteName: string }) => (
  <Html>
    <Head />
    <Preview>🎉 友链申请已通过</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={h1}>HOG'S BLOG</Heading>
        </Section>
        
        <Section style={section}>
          <Text style={text}>你好 <strong>{siteName}</strong> 的站长：</Text>
          <Text style={text}>
            很高兴地通知你，你的友链申请已经通过，并已添加至我的博客。
          </Text>
          
          <Section style={btnContainer}>
            <Link href="https://hog.leileihog.top/friends" style={button}>
              查看友链页面
            </Link>
          </Section>
          
          <Text style={subText}>
            如果按钮无法跳转，请复制以下链接：<br />
            <Link href="https://hog.leileihog.top/friends" style={link}>
              https://hog.leileihog.top/friends
            </Link>
          </Text>
          
          <Hr style={hr} />
          <Text style={footer}>期待未来的更多交流！</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// 样式配置
const main = { backgroundColor: '#f9fafb', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px' };
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' };
const section = { backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e5e7eb' };
const h1 = { color: '#111827', fontSize: '24px', textAlign: 'center' as const, letterSpacing: '2px' };
const text = { color: '#4b5563', fontSize: '16px', lineHeight: '26px' };
const btnContainer = { textAlign: 'center' as const, margin: '30px 0' };
const button = {
  backgroundColor: '#4F46E5', borderRadius: '6px', color: '#fff', fontSize: '16px',
  textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 24px'
};
const link = { color: '#4F46E5', fontSize: '14px' };
const subText = { color: '#9ca3af', fontSize: '14px', marginTop: '16px' };
const hr = { borderColor: '#f3f4f6', margin: '20px 0' };
const footer = { color: '#9ca3af', fontSize: '14px', textAlign: 'center' as const };