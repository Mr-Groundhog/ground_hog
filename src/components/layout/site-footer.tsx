"use client";

import { useState, useEffect } from 'react';

export function SiteFooter() {
  const [uptime, setUptime] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // 使用更明确的构造函数方式解析时间
    const launchTime = new Date();
    launchTime.setFullYear(2026, 0, 21); // 注意：月份是0-11，所以1月是0
    launchTime.setHours(11, 9, 2, 55); // 小时, 分钟, 秒, 毫秒
    launchTime.setTime(launchTime.getTime() + 8 * 60 * 60 * 1000); // 转换为UTC+8
    
    const launchTimeISO = new Date('2026-01-21T11:09:02.055+08');
    
    const calculateUptime = () => {
      const now = new Date();
      const diff = now.getTime() - launchTime.getTime();
      
      // 调试信息
      const debugText = `启动时间: ${launchTime.toLocaleString('zh-CN')}\n启动时间ISO: ${launchTimeISO.toLocaleString('zh-CN')}\n当前时间: ${now.toLocaleString('zh-CN')}\n时间差(ms): ${diff}`;
      setDebugInfo(debugText);
      
      if (diff < 0) {
        setUptime('时间未到');
        return;
      }
      
      // 直接计算并显示所有时间单位
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // 直接输出调试信息到控制台
      console.log(`调试 - 天:${days}, 小时:${hours}, 分钟:${minutes}, 秒:${seconds}`);
      console.log(`调试 - 总秒数:${totalSeconds}, 时间差:${diff}ms`);
      
      let uptimeText = '';
      if (days > 0) {
        uptimeText += `${days}天`;
      }
      if (hours > 0) {
        uptimeText += `${hours}小时`;
      }
      if (minutes > 0) {
        uptimeText += `${minutes}分钟`;
      }
      if (seconds > 0) {
        uptimeText += `${seconds}秒`;
      }
      
      // 如果所有时间单位都为0，显示"刚刚"
      if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        setUptime('刚刚');
      } else {
        setUptime(uptimeText);
      }
    };

    calculateUptime();
    const interval = setInterval(calculateUptime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-16 border-t border-zinc-800 py-6 px-4 text-[10px] text-zinc-500 font-mono uppercase tracking-wider md:mt-20 md:py-8">
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            <span>系统状态: 在线</span>
          </div>
          <span>内核版本: 5.15.0-88-GENERIC</span>
          <span>时区: UTC+8</span>
          <span>运行时间: {uptime}</span>
        </div>

       

        <div>
          © 2026 一梦五千年
        </div>
      </div>
      
   
    </footer>
  );
}
