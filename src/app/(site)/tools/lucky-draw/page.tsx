"use client";

import { useState, useRef } from "react";
import { LotteryWheel } from "./components/lottery-wheel";
import { WinnerDisplay } from "./components/winner-display";
import { ParticleBackground } from "./components/particle-background";
import { Upload, Users, Download, Trophy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Participant {
  id: number;
  name: string;
  color: string;
}

interface WinnerRecord {
  name: string;
  timestamp: string;
}

export default function LuckyDrawPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [inputText, setInputText] = useState("");
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FFEAA7", "#DFE6E9", "#A29BFE", "#FFD93D",
    "#6BCB77", "#4D96FF", "#FF6348", "#FFB6C1",
    "#87CEEB", "#98D8C8", "#F7DC6F", "#BB8FCE",
  ];

  // 生成随机中文名字
  const generateRandomName = () => {
    const surnames = ["赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈", "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许", "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏", "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章", "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦", "昌", "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳", "酆", "鲍", "史", "唐", "费", "廉", "岑", "薛", "雷", "贺", "倪", "汤", "滕", "殷", "罗", "毕", "郝", "邬", "安", "常", "乐", "于", "时", "傅", "皮", "卞", "齐", "康", "伍", "余", "元", "卜", "顾", "孟", "平", "黄", "和", "穆", "萧", "尹", "姚", "邵", "湛", "汪", "祁", "毛", "禹", "狄", "米", "贝", "明", "臧", "计", "伏", "成", "戴", "谈", "宋", "茅", "庞", "熊", "纪", "舒", "屈", "项", "祝", "董", "梁"];
    const givenNames1 = ["伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "洋", "艳", "勇", "军", "杰", "娟", "涛", "明", "超", "秀兰", "霞", "平", "刚", "桂英", "华", "梅", "鑫", "玲", "飞", "桂兰", "英", "兰", "燕", "萍", "波", "芬", "淑珍", "建华", "建国", "建军", "红", "玉兰", "桂芳", "建", "欣", "琳", "鹏", "帅", "帆", "荣", "俊", "斌", "晶", "健", "倩", "阳", "彬", "颖", "晖", "威", "欢", "宁", "毅", "博", "丹", "文", "晨", "宇", "浩", "然", "翔", "睿", "嘉", "思", "怡", "雨", "雪", "天", "乐", "佳", "国庆", "志明", "永", "卫东", "建平", "建民", "海", "东", "峰", "斌", "辉", "俊", "杰", "勇", "强", "磊", "洋", "艳", "涛", "明", "超", "霞", "平", "刚", "华", "玲", "飞", "英", "兰", "燕", "萍", "波", "芬"];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const givenName = givenNames1[Math.floor(Math.random() * givenNames1.length)];
    return surname + givenName;
  };

  const handleGenerateMockData = () => {
    const mockNames: string[] = [];
    for (let i = 0; i < 10; i++) {
      mockNames.push(generateRandomName());
    }
    // 使用逗号分隔显示，更直观
    setInputText(mockNames.join(", "));
  };

  const handleImportText = () => {
    if (!inputText.trim()) return;

    // 仅支持逗号（中英文逗号）分隔
    const names = inputText
      .split(/[,，]/g)  // 使用正则表达式匹配中文或英文逗号
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const newParticipants = names.map((name, index) => ({
      id: index,
      name,
      color: colors[index % colors.length],
    }));

    setParticipants(newParticipants);
    setInputText("");
    toast.success(`已导入 ${newParticipants.length} 名参与者`);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // 文件导入支持逗号和换行符（兼容多种格式）
      const names = content
        .split(/[\n,，]/g)  // 支持换行符、英文逗号、中文逗号
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      const newParticipants = names.map((name, index) => ({
        id: index,
        name,
        color: colors[index % colors.length],
      }));

      setParticipants(newParticipants);
      toast.success(`已从文件导入 ${newParticipants.length} 名参与者`);
    };
    reader.readAsText(file);
  };

  const handleSpin = () => {
    if (isSpinning || participants.length === 0) return;

    setIsSpinning(true);
    setShowWinner(false);
    setWinner(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      const randomParticipant = participants[randomIndex];
      const winnerName = randomParticipant.name;
      
      setWinner(winnerName);
      setIsSpinning(false);

      // 记录中奖名单
      setWinners(prev => [...prev, {
        name: winnerName,
        timestamp: new Date().toLocaleString('zh-CN')
      }]);

      setTimeout(() => {
        setShowWinner(true);
      }, 500);
    }, 4000);
  };

  const handleExportWinners = () => {
    if (winners.length === 0) {
      toast.error("暂无中奖记录");
      return;
    }

    const content = "中奖名单\n==========\n\n" + 
      winners.map((w, i) => `${i + 1}. ${w.name} (${w.timestamp})`).join("\n");
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `中奖名单-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("中奖名单已导出");
  };

  const handleClearWinners = () => {
    if (winners.length === 0) return;
    setWinners([]);
    toast.success("中奖记录已清空");
  };

  if (participants.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">🎊 年会抽奖系统</CardTitle>
              <p className="text-muted-foreground">导入参加者名单，开始精彩抽奖</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  方式一：粘贴名单（用逗号分隔）
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="张三，李四，王五"
                  className="w-full h-40 p-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleImportText}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  确认名单
                </Button>
                
                <Button
                  onClick={handleGenerateMockData}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Users size={20} />
                  模拟数据
                </Button>
              </div>

              <div className="text-center text-muted-foreground text-sm">或</div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  方式二：上传文件（.txt）
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileImport}
                  className="hidden"
                  aria-label="上传名单文件"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Upload size={20} />
                  选择文件
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：抽奖区域 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">🎊 年会抽奖</h2>
            <p className="text-muted-foreground">
              参加者：{participants.length} 人
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <LotteryWheel participants={participants} isSpinning={isSpinning} />

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                size="lg"
                className="min-w-[160px] h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
              >
                {isSpinning ? "抽奖中..." : "开始抽奖"}
              </Button>

              <Button
                onClick={() => setParticipants([])}
                disabled={isSpinning}
                variant="outline"
                size="lg"
                className="min-w-[160px] h-14 border-2 hover:bg-secondary/50"
              >
                重新导入
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧：中奖名单 */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  中奖名单
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  共 {winners.length} 位幸运儿
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleExportWinners}
                  variant="outline"
                  size="icon"
                  title="导出中奖名单"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleClearWinners}
                  variant="destructive"
                  size="icon"
                  title="清空记录"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {winners.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>暂无中奖记录</p>
                  <p className="text-sm">点击"开始抽奖"产生幸运儿</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {winners.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {i + 1}
                        </div>
                        <span className="font-medium">{w.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {w.timestamp.split(' ')[1] || w.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showWinner && winner && (
        <WinnerDisplay 
          winner={winner} 
          onClose={() => {
            setShowWinner(false);
            setWinner(null);
          }} 
        />
      )}
    </div>
  );
}