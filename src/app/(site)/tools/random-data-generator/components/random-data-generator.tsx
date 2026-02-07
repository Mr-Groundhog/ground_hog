"use client";

import { useState, useCallback } from "react";
import { 
  generateChineseName, 
  generatePhoneNumber, 
  generateEmail, 
  generateIPAddress, 
  generateUUID, 
  generateStrongPassword 
} from "./data-generator";
import { useToast } from "./use-toast";
import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// 数据类型定义
interface GeneratedData {
  names: string[];
  phoneNumbers: string[];
  emails: string[];
  ipAddresses: string[];
  uuids: string[];
  passwords: string[];
}

// 可选的数据类型
type DataType = 'names' | 'phoneNumbers' | 'emails' | 'ipAddresses' | 'uuids' | 'passwords';

const DATA_TYPES: { id: DataType; label: string; icon: string }[] = [
  { id: 'names', label: '姓名', icon: '👤' },
  { id: 'phoneNumbers', label: '手机号', icon: '📱' },
  { id: 'emails', label: '邮箱', icon: '📧' },
  { id: 'ipAddresses', label: 'IP地址', icon: '🌐' },
  { id: 'uuids', label: 'UUID', icon: '🆔' },
  { id: 'passwords', label: '密码', icon: '🔑' }
];

// 密码选项类型
interface PasswordOptions {
  length: number;
  includeNumbers: boolean;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeSpecialChars: boolean;
}

export function RandomDataGenerator() {
  // 状态管理
  const [count, setCount] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<DataType>('names');
  const [generatedData, setGeneratedData] = useState<Partial<Record<DataType, string[]>>>({});
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>({
    length: 12,
    includeNumbers: true,
    includeLowercase: true,
    includeUppercase: true,
    includeSpecialChars: true
  });
  const [errors, setErrors] = useState<{count?: string}>({});
  
  const { showToast } = useToast();

  // 输入验证
  const validateInputs = useCallback((): boolean => {
    const newErrors: {count?: string} = {};
    
    if (count < 1 || count > 100) {
      newErrors.count = "生成数量必须在1-100之间";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [count]);

  // 生成数据
  const generateData = useCallback(() => {
    if (!validateInputs()) return;
    
    const newData: Partial<Record<DataType, string[]>> = {};

    switch (selectedType) {
      case 'names':
        newData.names = [];
        for (let i = 0; i < count; i++) {
          newData.names.push(generateChineseName());
        }
        break;
      case 'phoneNumbers':
        newData.phoneNumbers = [];
        for (let i = 0; i < count; i++) {
          newData.phoneNumbers.push(generatePhoneNumber());
        }
        break;
      case 'emails':
        newData.emails = [];
        for (let i = 0; i < count; i++) {
          newData.emails.push(generateEmail());
        }
        break;
      case 'ipAddresses':
        newData.ipAddresses = [];
        for (let i = 0; i < count; i++) {
          newData.ipAddresses.push(generateIPAddress());
        }
        break;
      case 'uuids':
        newData.uuids = [];
        for (let i = 0; i < count; i++) {
          newData.uuids.push(generateUUID());
        }
        break;
      case 'passwords':
        newData.passwords = [];
        for (let i = 0; i < count; i++) {
          newData.passwords.push(generateStrongPassword(passwordOptions));
        }
        break;
    }

    setGeneratedData(newData);
    const typeName = DATA_TYPES.find(t => t.id === selectedType)?.label || '';
    showToast(`成功生成${count}条${typeName}数据！`, "success");
  }, [count, selectedType, passwordOptions, validateInputs, showToast]);

  // 复制数据到剪贴板
  const copyToClipboard = useCallback((data: string[] | undefined, label: string) => {
    if (!data) return;
    const text = data.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label}已复制到剪贴板`, "success");
    }).catch(() => {
      showToast("复制失败", "error");
    });
  }, [showToast]);

  // 复制所有数据
  const copyAllData = useCallback(() => {
    if (Object.keys(generatedData).length === 0) return;
    
    let allData = `=== 随机数据生成结果 ===\n生成时间: ${new Date().toLocaleString()}\n\n`;
    
    const typeName = DATA_TYPES.find(t => t.id === selectedType)?.label || '';
    
    if (generatedData[selectedType]) {
      allData += `【${typeName}】\n${generatedData[selectedType]?.join('\n')}\n\n`;
    }
    
    allData = allData.trim();
    
    navigator.clipboard.writeText(allData).then(() => {
      showToast("数据已复制到剪贴板", "success");
    }).catch(() => {
      showToast("复制失败", "error");
    });
  }, [generatedData, selectedType, showToast]);

  // 切换数据类型选择
  const toggleDataType = (type: DataType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // 全选/取消全选
  const toggleAllTypes = () => {
    setSelectedTypes(prev => 
      prev.length === DATA_TYPES.length ? [] : DATA_TYPES.map(t => t.id)
    );
  };

  // 更新密码选项
  const updatePasswordOption = (option: keyof PasswordOptions, value: boolean | number) => {
    setPasswordOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:py-8 sm:px-6 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">程序员测试用随机数据生成器</h1>
        <p className="text-muted-foreground text-center text-sm sm:text-base">
          选择需要的数据类型，生成测试所需的随机数据
        </p>
      </div>

      {/* 控制面板 */}
      <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
        {/* 数据类型选择 - 下拉列表 */}
        <div className="mb-6">
          <Label htmlFor="dataType" className="block mb-2 text-sm sm:text-base">选择数据类型</Label>
          <Select value={selectedType} onValueChange={(value: DataType) => setSelectedType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择要生成的数据类型" />
            </SelectTrigger>
            <SelectContent>
              {DATA_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center">
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* 数量输入 */}
          <div className="space-y-2">
            <Label htmlFor="count" className="text-sm sm:text-base">生成数量 (1-100)</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className={errors.count ? "border-red-500" : ""}
            />
            {errors.count && <p className="text-sm text-red-500">{errors.count}</p>}
          </div>

          {/* 生成按钮 */}
          <div className="flex items-end">
            <Button 
              onClick={generateData} 
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">生成数据</span>
              <span className="xs:hidden">生成</span>
            </Button>
          </div>
        </div>

        {/* 密码选项 - 仅在选择密码时显示 */}
        {selectedType === 'passwords' && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
            <Label className="block mb-2 sm:mb-3 text-sm sm:text-base">密码设置</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* 密码长度 */}
              <div className="space-y-2">
                <Label htmlFor="passwordLength" className="text-sm sm:text-base">密码长度 (8-32)</Label>
                <Input
                  id="passwordLength"
                  type="number"
                  min="8"
                  max="32"
                  value={passwordOptions.length}
                  onChange={(e) => updatePasswordOption('length', Math.min(32, Math.max(8, parseInt(e.target.value) || 12)))}
                />
              </div>
            </div>
            
            {/* 密码字符选项 */}
            <div className="space-y-3">
              <Label className="block text-sm sm:text-base">字符选项 (至少选择一项)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center justify-between space-x-2 p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <Label htmlFor="numbers" className="text-sm">数字 (0-9)</Label>
                  <Switch
                    id="numbers"
                    checked={passwordOptions.includeNumbers}
                    onCheckedChange={(checked) => updatePasswordOption('includeNumbers', checked)}
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <Label htmlFor="lowercase" className="text-sm">小写字母 (a-z)</Label>
                  <Switch
                    id="lowercase"
                    checked={passwordOptions.includeLowercase}
                    onCheckedChange={(checked) => updatePasswordOption('includeLowercase', checked)}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <Label htmlFor="uppercase" className="text-sm">大写字母 (A-Z)</Label>
                  <Switch
                    id="uppercase"
                    checked={passwordOptions.includeUppercase}
                    onCheckedChange={(checked) => updatePasswordOption('includeUppercase', checked)}
                    className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <Label htmlFor="special" className="text-sm">特殊字符 (!@#$%)</Label>
                  <Switch
                    id="special"
                    checked={passwordOptions.includeSpecialChars}
                    onCheckedChange={(checked) => updatePasswordOption('includeSpecialChars', checked)}
                    className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 结果显示区域 */}
      {generatedData[selectedType] && generatedData[selectedType]!.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {/* 复制数据按钮 */}
          <div className="flex justify-center">
            <Button onClick={copyAllData} size="lg" className="px-6 sm:px-8">
              <Copy className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">复制数据</span>
              <span className="xs:hidden">复制</span>
            </Button>
          </div>

          {/* 数据展示 */}
          <div className="max-w-2xl mx-auto">
            <DataCard
              title={DATA_TYPES.find(t => t.id === selectedType)?.label || ''}
              data={generatedData[selectedType]!}
              onCopy={() => copyToClipboard(generatedData[selectedType], DATA_TYPES.find(t => t.id === selectedType)?.label || '')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 数据卡片组件
interface DataCardProps {
  title: string;
  data: string[];
  onCopy: () => void;
}

function DataCard({ title, data, onCopy }: DataCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-3 sm:p-4 border-b bg-muted/50">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
          <Button variant="outline" size="sm" onClick={onCopy} className="h-8 sm:h-9">
            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
      <div className="p-3 sm:p-4 max-h-48 sm:max-h-60 overflow-y-auto">
        <div className="space-y-1">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="font-mono text-xs sm:text-sm p-2 bg-muted rounded hover:bg-muted/80 transition-colors break-all"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}