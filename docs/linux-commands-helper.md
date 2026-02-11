# Linux 命令学习助手 - 开发任务文档

> 本文档为 AI 辅助开发任务清单，按顺序执行即可完成项目开发。

## 项目概览

- **技术栈**: Next.js 16 + TypeScript + Tailwind CSS
- **已集成依赖**: fuse.js, next-themes, sonner, lucide-react
- **目标**: 轻量、极速、离线可用的 Linux 命令速查工具

---

## 阶段一：数据层搭建

### 任务 1.1：创建命令数据目录和 JSON 文件

**文件路径**: `src/data/commands.json`

**数据格式**:
```json
[
  {
    "id": "ls",
    "name": "ls",
    "desc": "列出目录内容",
    "category": "文件管理",
    "examples": [
      {
        "cmd": "ls -la",
        "note": "列出所有文件详细信息"
      },
      {
        "cmd": "ls -lh",
        "note": "人性化显示文件大小"
      }
    ]
  },
  {
    "id": "grep",
    "name": "grep",
    "desc": "文本搜索工具",
    "category": "文本处理",
    "examples": [
      {
        "cmd": "grep -r 'keyword' .",
        "note": "递归搜索当前目录"
      },
      {
        "cmd": "grep -n 'keyword' file.txt",
        "note": "显示匹配行号"
      }
    ]
  }
]
```

**要求**:
- 至少包含 20 个常用 Linux 命令
- 覆盖分类：文件管理、文本处理、系统管理、网络、磁盘、权限

---

### 任务 1.2：创建 TypeScript 类型定义

**文件路径**: `src/types/command.ts`

```typescript
export interface CommandExample {
  cmd: string;
  note: string;
}

export interface Command {
  id: string;
  name: string;
  desc: string;
  category: string;
  examples: CommandExample[];
}

export interface SearchResult {
  item: Command;
  matches?: any;
}
```

---

## 阶段二：核心功能实现

### 任务 2.1：创建搜索 Hook

**文件路径**: `src/hooks/useCommandSearch.ts`

**实现内容**:
- 导入 Fuse.js，配置搜索参数
- keys: `['name', 'desc', 'examples.note']`
- threshold: `0.3`
- 返回搜索方法 `search(query: string)` 和结果
- 处理无搜索词时返回全部命令

```typescript
'use client';
import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Command } from '@/types/command';

export function useCommandSearch(commands: Command[]) {
  const fuse = useMemo(() => new Fuse(commands, {
    keys: ['name', 'desc', 'examples.note'],
    threshold: 0.3,
    includeMatches: true,
  }), [commands]);

  return {
    search: (query: string) => {
      if (!query.trim()) return commands;
      return fuse.search(query).map(r => r.item);
    },
  };
}
```

---

### 任务 2.2：创建搜索历史 Hook

**文件路径**: `src/hooks/useSearchHistory.ts`

**实现内容**:
- `saveSearch(query: string)` - 保存搜索记录，最多 5 条，去重
- `getHistory()` - 获取历史记录
- `clearHistory()` - 清空历史
- 使用 `localStorage` 存储

```typescript
'use client';
import { useState, useEffect } from 'react';

const MAX_HISTORY = 5;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('search_history');
  };

  return { history, saveSearch, clearHistory };
}
```

---

### 任务 2.3：创建复制功能 Hook

**文件路径**: `src/hooks/useClipboard.ts`

**实现内容**:
- `copy(text: string)` - 复制到剪贴板
- 成功后调用 toast.success 显示提示
- 返回 `copied` 状态用于 UI 反馈

```typescript
'use client';
import { useState } from 'react';
import { toast } from 'sonner';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制到剪贴板');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  return { copy, copied };
}
```

---

## 阶段三：UI 组件开发

### 任务 3.1：创建命令卡片组件

**文件路径**: `src/components/command/CommandCard.tsx`

**功能**:
- 显示命令名称、描述、分类标签
- 展示命令示例列表
- 点击示例命令块复制
- 终端风格样式 (bg-slate-900, font-mono)

```typescript
interface CommandCardProps {
  command: Command;
  onCopy: (cmd: string) => void;
}

export function CommandCard({ command, onCopy }: CommandCardProps) {
  return (
    <div className="bg-card rounded-lg p-4 border">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-primary">{command.name}</h3>
        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
          {command.category}
        </span>
      </div>
      <p className="text-muted-foreground mb-3">{command.desc}</p>
      <div className="space-y-2">
        {command.examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => onCopy(ex.cmd)}
            className="w-full text-left p-2 bg-slate-900 text-green-400 font-mono text-sm rounded active:scale-95 transition-transform"
          >
            <span className="block text-slate-500 text-xs mb-1"># {ex.note}</span>
            {ex.cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### 任务 3.2：创建搜索组件

**文件路径**: `src/components/command/SearchBar.tsx`

**功能**:
- 输入框带搜索图标
- 实时搜索 (防抖 300ms)
- 显示/隐藏清空按钮
- 响应式样式

```typescript
'use client';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}
```

---

### 任务 3.3：创建搜索历史组件

**文件路径**: `src/components/command/SearchHistory.tsx`

**功能**:
- 显示历史记录列表
- 点击历史项填充搜索框
- 显示清空历史按钮
- 空状态显示"暂无搜索历史"

---

### 任务 3.4：创建分类筛选组件

**文件路径**: `src/components/command/CategoryFilter.tsx`

**功能**:
- 显示所有分类标签
- 支持多选或单选
- 选中状态样式区分
- "全部"选项

---

## 阶段四：页面开发

### 任务 4.1：创建主搜索页面

**文件路径**: `src/app/commands/page.tsx`

**功能**:
- 导入 commands.json 数据
- 实现搜索逻辑
- 集成 SearchBar、SearchHistory、CategoryFilter
- 结果列表展示 (CommandCard)
- 响应式布局 (max-w-3xl mx-auto)
- 深色模式适配

```typescript
'use client';
import { useState, useEffect } from 'react';
import commandsData from '@/data/commands.json';
import { useCommandSearch } from '@/hooks/useCommandSearch';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useClipboard } from '@/hooks/useClipboard';
import { SearchBar } from '@/components/command/SearchBar';
import { SearchHistory } from '@/components/command/SearchHistory';
import { CategoryFilter } from '@/components/command/CategoryFilter';
import { CommandCard } from '@/components/command/CommandCard';

export default function CommandsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const { history, saveSearch, clearHistory } = useSearchHistory();
  const { copy } = useClipboard();
  const { search: doSearch } = useCommandSearch(commandsData);

  const results = doSearch(search);
  const categories = ['全部', ...new Set(commandsData.map(c => c.category))];

  return (
    <main className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Linux 命令速查</h1>
      <SearchBar value={search} onChange={setSearch} onClear={() => setSearch('')} />
      {history.length > 0 && search === '' && (
        <SearchHistory history={history} onSelect={setSearch} onClear={clearHistory} />
      )}
      <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
      <div className="grid gap-4 mt-6">
        {results
          .filter(c => category === '全部' || c.category === category)
          .map(cmd => (
            <CommandCard key={cmd.id} command={cmd} onCopy={copy} />
          ))}
      </div>
    </main>
  );
}
```

---

### 任务 4.2：创建命令详情页 (SSG)

**文件路径**: `src/app/commands/[name]/page.tsx`

**功能**:
- 静态生成 (`generateStaticParams`)
- 显示命令完整信息
- 所有示例可复制
- 返回命令列表链接
- SEO 优化 (metadata)

```typescript
import { Metadata } from 'next';
import commandsData from '@/data/commands.json';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return commandsData.map(cmd => ({ name: cmd.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const cmd = commandsData.find(c => c.name === name);
  return { title: cmd ? `${cmd.name} - Linux 命令` : '命令未找到' };
}

export default async function CommandDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const cmd = commandsData.find(c => c.name === name);
  if (!cmd) notFound();
  // 渲染逻辑...
}
```

---

## 阶段五：样式与交互优化

### 任务 5.1：完善全局样式

**文件路径**: `src/app/globals.css`

**要求**:
- 添加终端风格代码块样式
- 深色模式适配 (dark: 前缀)
- 平滑过渡动画

---

### 任务 5.2：添加空状态和加载状态

**组件**:
- `EmptyState.tsx` - 无搜索结果时显示
- `LoadingState.tsx` - 搜索中显示骨架屏

---

### 任务 5.3：添加键盘快捷键

**功能**:
- `/` 聚焦搜索框
- `Esc` 清空搜索

```typescript
'use client';
import { useEffect } from 'react';

export function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return null;
}
```

---

## 阶段六：数据完善与测试

### 任务 6.1：完善命令数据

在 `commands.json` 中补充以下命令：

| 分类 | 命令 |
|------|------|
| 文件管理 | ls, cd, cp, mv, rm, mkdir, touch, cat, head, tail |
| 文本处理 | grep, sed, awk, wc, sort, uniq, find |
| 系统管理 | ps, top, kill, df, du, free, uname |
| 网络 | ping, curl, wget, ssh, scp, netstat |
| 权限 | chmod, chown, sudo, su |
| 压缩 | tar, gzip, zip, unzip |

---

### 任务 6.2：测试用例

- [ ] 搜索功能正常（模糊匹配、拼写纠错）
- [ ] 复制功能正常
- [ ] 搜索历史保存和读取正常
- [ ] 深色模式切换正常
- [ ] 响应式布局（手机/平板/桌面）
- [ ] 详情页 SSR 正常

---

## 执行顺序

```
1. 任务 1.1 → 创建 commands.json 初始数据
2. 任务 1.2 → 创建类型定义
3. 任务 2.1 → 创建搜索 Hook
4. 任务 2.2 → 创建历史 Hook
5. 任务 2.3 → 创建复制 Hook
6. 任务 3.1 → 创建 CommandCard 组件
7. 任务 3.2 → 创建 SearchBar 组件
8. 任务 3.3 → 创建 SearchHistory 组件
9. 任务 3.4 → 创建 CategoryFilter 组件
10. 任务 4.1 → 创建主页面
11. 任务 4.2 → 创建详情页
12. 任务 5.1-5.3 → 样式优化
13. 任务 6.1 → 完善数据
14. 任务 6.2 → 测试验证
```

---

## 启动项目

```bash
pnpm dev
```

访问 `http://localhost:9527/commands` 查看效果。
