// 中文姓氏池
const CHINESE_SURNAMES = [
  '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
  '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
  '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕',
  '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎'
];

// 中文名字池（常用字）
const CHINESE_GIVEN_NAMES = [
  '伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋',
  '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平',
  '刚', '桂英', '飞', '华', '红', '梅', '雪', '健', '兰', '丽娟',
  '丹', '宁', '波', '莹', '婷', '莉', '晶', '欢', '颖', '慧',
  '倩', '旭', '峰', '洁', '浩', '婷婷', '博', '凯', '瑞', '斌'
];

// 常用邮箱域名
const EMAIL_DOMAINS = [
  'gmail.com', '163.com', '126.com', 'qq.com', 'sina.com', 
  'hotmail.com', 'yahoo.com', 'outlook.com', 'aliyun.com'
];

// 特殊字符集合
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * 生成随机中文姓名
 * @returns 随机中文姓名（2-3个汉字）
 */
export function generateChineseName(): string {
  const surname = CHINESE_SURNAMES[Math.floor(Math.random() * CHINESE_SURNAMES.length)];
  const givenNameLength = Math.random() > 0.3 ? 1 : 2; // 70%概率生成2字名，30%概率生成3字名
  let givenName = '';
  
  for (let i = 0; i < givenNameLength; i++) {
    givenName += CHINESE_GIVEN_NAMES[Math.floor(Math.random() * CHINESE_GIVEN_NAMES.length)];
  }
  
  return surname + givenName;
}

/**
 * 生成随机手机号（中国手机号段规则）
 * @returns 符合中国手机号规则的随机号码
 */
export function generatePhoneNumber(): string {
  // 中国移动号段
  const mobilePrefixes = [
    '134', '135', '136', '137', '138', '139',
    '147', '150', '151', '152', '157', '158', '159',
    '178', '182', '183', '184', '187', '188', '198'
  ];
  
  // 中国联通号段
  const unicomPrefixes = [
    '130', '131', '132', '145', '155', '156',
    '166', '175', '176', '185', '186'
  ];
  
  // 中国电信号段
  const telecomPrefixes = [
    '133', '149', '153', '173', '177', '180', '181', '189', '199'
  ];
  
  // 合并所有号段
  const allPrefixes = [...mobilePrefixes, ...unicomPrefixes, ...telecomPrefixes];
  const prefix = allPrefixes[Math.floor(Math.random() * allPrefixes.length)];
  
  // 生成后8位数字
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += Math.floor(Math.random() * 10);
  }
  
  return prefix + suffix;
}

/**
 * 生成随机邮箱地址
 * @returns 随机邮箱地址
 */
export function generateEmail(): string {
  // 生成随机用户名（字母和数字组合）
  let username = '';
  const usernameLength = Math.floor(Math.random() * 8) + 5; // 5-12个字符
  
  for (let i = 0; i < usernameLength; i++) {
    if (Math.random() > 0.3) {
      // 70%概率生成字母
      const charCode = Math.random() > 0.5 ? 
        Math.floor(Math.random() * 26) + 97 : // 小写字母
        Math.floor(Math.random() * 26) + 65;  // 大写字母
      username += String.fromCharCode(charCode);
    } else {
      // 30%概率生成数字
      username += Math.floor(Math.random() * 10);
    }
  }
  
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  return `${username}@${domain}`;
}

/**
 * 生成随机IPv4地址
 * @returns 合法的IPv4地址
 */
export function generateIPAddress(): string {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(Math.floor(Math.random() * 256));
  }
  return parts.join('.');
}

/**
 * 生成UUID（使用浏览器原生crypto API）
 * @returns 标准UUID字符串
 */
export function generateUUID(): string {
  // 检查是否在浏览器环境中
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 降级方案：手动生成UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 生成强密码
 * @param options 密码生成选项
 * @returns 符合要求的强密码
 */
export function generateStrongPassword(options: {
  length: number;
  includeNumbers: boolean;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeSpecialChars: boolean;
}): string {
  // 验证至少选择一种字符类型
  const hasCharacterType = options.includeNumbers || 
                          options.includeLowercase || 
                          options.includeUppercase || 
                          options.includeSpecialChars;
  
  if (!hasCharacterType) {
    throw new Error('至少需要选择一种字符类型');
  }
  
  let charset = '';
  let password = '';
  
  // 构建字符集
  if (options.includeNumbers) {
    charset += '0123456789';
  }
  if (options.includeLowercase) {
    charset += 'abcdefghijklmnopqrstuvwxyz';
  }
  if (options.includeUppercase) {
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (options.includeSpecialChars) {
    charset += SPECIAL_CHARS;
  }
  
  // 确保每种选中的字符类型至少出现一次
  const requiredChars = [];
  if (options.includeNumbers) {
    requiredChars.push('0123456789'[Math.floor(Math.random() * 10)]);
  }
  if (options.includeLowercase) {
    requiredChars.push('abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]);
  }
  if (options.includeUppercase) {
    requiredChars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]);
  }
  if (options.includeSpecialChars) {
    requiredChars.push(SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)]);
  }
  
  // 生成剩余长度的随机字符
  for (let i = requiredChars.length; i < options.length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // 将必需字符插入到随机位置
  requiredChars.forEach(char => {
    const insertPos = Math.floor(Math.random() * (password.length + 1));
    password = password.slice(0, insertPos) + char + password.slice(insertPos);
  });
  
  return password;
}