# Gmail 邮件发送功能使用指南

## 📧 功能介绍

本项目已集成 Gmail 邮件发送功能，支持以下类型的邮件发送：

1. **普通邮件发送** - 自定义邮件内容
2. **验证码邮件** - 美观的验证码模板
3. **通知邮件** - 系统通知模板

## ⚙️ 环境配置

### 1. 创建环境变量文件

复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

### 2. 配置 Gmail 凭据

在 `.env` 文件中填写以下信息：

```env
# Gmail 账户邮箱地址
GMAIL_USER=your-email@gmail.com

# Gmail 应用专用密码（重要：不是账户密码）
GMAIL_APP_PASSWORD=your-app-password
```

### 3. 获取 Gmail 应用专用密码

1. 登录你的 Google 账户
2. 进入 [Google 账户安全设置](https://myaccount.google.com/security)
3. 启用「两步验证」
4. 在「两步验证」下方找到「应用专用密码」
5. 选择应用为「邮件」，设备为「其他（自定义名称）」
6. 输入名称如「Ground Hog」，点击生成
7. 复制生成的 16 位密码填入 `GMAIL_APP_PASSWORD`

## 🚀 API 接口使用

### 1. 发送普通邮件

**POST** `/api/send`

```json
{
  "to": "recipient@example.com",
  "subject": "邮件主题",
  "html": "<h1>HTML 内容</h1>",
  "text": "纯文本内容（可选）"
}
```

### 2. 发送验证码邮件

**POST** `/api/send/verification-code`

```json
{
  "email": "recipient@example.com",
  "code": "123456"
}
```

### 3. 发送通知邮件

**POST** `/api/send/notification`

```json
{
  "email": "recipient@example.com",
  "title": "通知标题",
  "content": "通知内容"
}
```

## 💻 前端调用示例

```javascript
// 发送普通邮件
async function sendEmail() {
  const response = await fetch('/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: 'user@example.com',
      subject: '欢迎使用 Ground Hog',
      html: '<h1>Hello!</h1><p>感谢注册我们的平台。</p>'
    }),
  })
  
  const result = await response.json()
  console.log(result)
}

// 发送验证码
async function sendVerificationCode(email, code) {
  const response = await fetch('/api/send/verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  })
  
  return await response.json()
}

// 发送通知
async function sendNotification(email, title, content) {
  const response = await fetch('/api/send/notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, title, content }),
  })
  
  return await response.json()
}
```

## 🔧 服务端直接调用

你也可以在服务端直接调用邮件功能：

```typescript
import { sendMail, sendVerificationCode, sendNotification } from '@/lib/mailer'

// 发送普通邮件
await sendMail({
  to: 'user@example.com',
  subject: '测试邮件',
  html: '<p>Hello World!</p>'
})

// 发送验证码
await sendVerificationCode('user@example.com', '123456')

// 发送通知
await sendNotification('user@example.com', '系统通知', '您的账户已被激活')
```

## 🧪 测试邮件功能

运行测试脚本验证配置是否正确：

```bash
npx tsx scripts/test-mailer.ts
```

记得在测试脚本中将测试邮箱地址替换为真实的邮箱。

## 📝 注意事项

1. **安全性**: 应用专用密码比账户密码更安全，即使泄露也不会影响账户安全
2. **频率限制**: Gmail 对邮件发送频率有限制，避免短时间内大量发送
3. **内容审核**: 邮件内容应符合 Gmail 的使用政策
4. **错误处理**: 建议在生产环境中添加适当的错误处理和重试机制

## 🎨 邮件模板特色

- **响应式设计**: 适配各种设备和邮件客户端
- **美观界面**: 渐变背景和现代化设计
- **品牌定制**: 自动使用网站名称和品牌色
- **验证码突出**: 验证码以大字体和特殊样式显示

## 🆘 常见问题

**Q: 邮件发送失败怎么办？**
A: 检查以下几点：
- Gmail 凭据是否正确配置
- 应用专用密码是否有效
- 网络连接是否正常
- 查看控制台错误日志

**Q: 如何自定义邮件模板？**
A: 修改 `src/lib/mailer.ts` 中的 HTML 模板代码

**Q: 支持附件发送吗？**
A: 是的，可以通过 `attachments` 参数添加附件

有任何问题请查看控制台日志或联系开发者。