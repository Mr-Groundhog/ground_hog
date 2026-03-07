"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Music,
  Upload,
  Trash2,
  Search,
  Pause,
  Play,
  Search as SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  name: string;
  url: string;
  duration?: number;
  artist?: string;
  album?: string;
  picId?: string;
  lyricId?: string;
  source?: string;
  coverUrl?: string;
}

interface SearchResult {
  id: string;
  name: string;
  artist: string[];
  album: string;
  pic_id: string;
  url_id: string;
  lyric_id: string;
  source: string;
}

export function MusicPlayer() {
  const playerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lyricsScrollRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [musicSource, setMusicSource] = useState<"netease" | "kuwo" | "joox" | "bilibili">("netease");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lyrics, setLyrics] = useState<string>("");
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"cover" | "lyrics">("cover");
  const [currentTime, setCurrentTime] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [lyricsScrollPosition, setLyricsScrollPosition] = useState(0);
  const [autoFollowLyrics, setAutoFollowLyrics] = useState(true);

  const currentTrack = tracks[currentTrackIndex];

  // 手动触发搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMusic(searchQuery);
    }
  };

  // 回车搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 过滤曲目
  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 切换到指定曲目
  const playTrack = (index: number) => {
    const actualIndex = tracks.findIndex(t => t.id === filteredTracks[index].id);
    setCurrentTrackIndex(actualIndex);
    // 添加到播放历史
    if (tracks[actualIndex]) {
      addToHistory(tracks[actualIndex]);
    }
  };

  // 播放历史中的曲目
  const playHistoryItem = (track: Track) => {
    const existingIndex = tracks.findIndex(t => t.id === track.id);
    if (existingIndex !== -1) {
      setCurrentTrackIndex(existingIndex);
      toast.success("歌曲切换成功");
    } else {
      // 如果曲目不在播放列表中，添加到播放列表
      setTracks([...tracks, track]);
      setCurrentTrackIndex(tracks.length);
      toast.success("歌曲切换成功");
    }
  };

  // 下一首
  const playNext = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
  };

  // 上一首
  const playPrevious = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
  };

// 添加音乐文件
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: Track[] = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        url,
      };
    });

    setTracks((prev) => [...prev, ...newTracks]);
    
    if (!currentTrack && newTracks.length > 0) {
      setCurrentTrackIndex(0);
    }
    
    e.target.value = "";
  };

  // 删除曲目
  const removeTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTracks = tracks.filter((t) => t.id !== id);
    setTracks(newTracks);
    
    if (currentTrack?.id === id) {
      if (newTracks.length > 0) {
        const newIndex = currentTrackIndex >= newTracks.length ? 0 : currentTrackIndex;
        setCurrentTrackIndex(newIndex);
      } else {
        setCurrentTrackIndex(0);
      }
    }
  };

  // 时间格式化
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 搜索音乐
  const searchMusic = async (keyword: string, page: number = 1, append: boolean = false) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setCurrentPage(1);
      setHasMore(true);
      return;
    }

    if (!append) {
      setIsSearching(true);
      setCurrentPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch(
        `https://music-api.gdstudio.xyz/api.php?types=search&source=${musicSource}&name=${encodeURIComponent(keyword)}&count=20&pages=${page}`
      );
      const data = await response.json();
      if (data && Array.isArray(data)) {
        if (append) {
          setSearchResults(prev => [...prev, ...data]);
        } else {
          setSearchResults(data);
        }
        // 如果返回的数据少于 20 条，说明没有更多数据了
        setHasMore(data.length === 20);
      } else {
        if (!append) {
          setSearchResults([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("搜索失败:", error);
      if (!append) {
        setSearchResults([]);
      }
      setHasMore(false);
    } finally {
      if (!append) {
        setIsSearching(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // 加载更多搜索结果
  const loadMoreResults = useCallback(() => {
    if (isLoadingMore || !hasMore || !searchQuery.trim()) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    searchMusic(searchQuery, nextPage, true);
  }, [isLoadingMore, hasMore, searchQuery, currentPage]);

  // 监听搜索结果滚动，自动加载更多
  useEffect(() => {
    const scrollContainer = searchResultsRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // 当滚动到距离底部 100px 时加载更多
      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoadingMore) {
        loadMoreResults();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoadingMore, searchQuery, currentPage, loadMoreResults]);

  // 获取歌曲播放链接
  const getSongUrl = async (trackId: string, source: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://music-api.gdstudio.xyz/api.php?types=url&source=${source}&id=${trackId}&br=320`
      );
      const data = await response.json();
      return data?.url || null;
    } catch (error) {
      console.error("获取歌曲链接失败:", error);
      return null;
    }
  };

  // 获取专辑封面
  const getAlbumCover = async (picId: string, source: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://music-api.gdstudio.xyz/api.php?types=pic&source=${source}&id=${picId}&size=500`
      );
      const data = await response.json();
      return data?.url || null;
    } catch (error) {
      console.error("获取专辑封面失败:", error);
      return null;
    }
  };

  // 获取歌词
  const getLyrics = async (lyricId: string, source: string) => {
    try {
      const response = await fetch(
        `https://music-api.gdstudio.xyz/api.php?types=lyric&source=${source}&id=${lyricId}`
      );
      const data = await response.json();
      setLyrics(data?.lyric || "");
    } catch (error) {
      console.error("获取歌词失败:", error);
      setLyrics("");
    }
  };

  // 解析LRC歌词
  const parseLyrics = (lrc: string) => {
    if (!lrc) return [];
    const lines = lrc.split('\n');
    const parsed: Array<{ time: number; text: string }> = [];
    
    for (const line of lines) {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3].padEnd(3, '0'));
        const time = minutes * 60 + seconds + milliseconds / 1000;
        const text = match[4].trim();
        if (text) {
          parsed.push({ time, text });
        }
      }
    }
    
    return parsed.sort((a, b) => a.time - b.time);
  };

  // 获取当前应该高亮的歌词行
  const getCurrentLyricLine = () => {
    const parsedLyrics = parseLyrics(lyrics);
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time) {
        return i;
      }
    }
    return -1;
  };

  // 用户手动滚动检测
  useEffect(() => {
    const scrollContainer = lyricsScrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      // 保存当前滚动位置
      setLyricsScrollPosition(scrollContainer.scrollTop);
      
      // 用户开始滚动
      setIsUserScrolling(true);
      
      // 清除之前的定时器
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      
      // 3秒后恢复自动滚动
      userScrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 3000);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [activeTab]);

  // 切换 tab 时恢复滚动位置
  useEffect(() => {
    if (activeTab === "lyrics" && lyricsScrollRef.current) {
      // 恢复之前保存的滚动位置
      if (lyricsScrollPosition > 0) {
        lyricsScrollRef.current.scrollTop = lyricsScrollPosition;
      }
    }
  }, [activeTab, lyricsScrollPosition]);

  // 自动滚动到当前歌词
  useEffect(() => {
    // 只在以下情况自动滚动：
    // 1. 在歌词tab中
    // 2. 用户没有在手动滚动
    // 3. 有歌词内容
    // 4. 歌曲进度发生变化
    // 5. 自动跟随歌词已开启
    if (activeTab === "lyrics" && lyricsScrollRef.current && !isUserScrolling && lyrics && autoFollowLyrics) {
      const currentLine = getCurrentLyricLine();
      if (currentLine >= 0) {
        const lyricsElements = lyricsScrollRef.current.querySelectorAll('p');
        const currentElement = lyricsElements[currentLine];
        if (currentElement) {
          // 使用更平滑的滚动效果
          currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, activeTab, lyrics, isUserScrolling, autoFollowLyrics]);

// 歌词内容变化时重置滚动位置
  useEffect(() => {
    if (lyrics) {
      setLyricsScrollPosition(0);
      setIsUserScrolling(false);
    }
  }, [lyrics]);

  // 播放搜索结果中的歌曲
  const playSearchResult = async (result: SearchResult) => {
    // 获取歌曲URL
    const url = await getSongUrl(result.id, result.source);
    if (!url) {
      console.error("无法获取歌曲链接");
      return;
    }

    // 获取专辑封面
    const coverUrl = result.pic_id ? await getAlbumCover(result.pic_id, result.source) : null;

    // 创建新曲目
    const newTrack: Track = {
      id: `${result.source}-${result.id}`,
      name: result.name,
      url,
      artist: result.artist.join(", "),
      album: result.album,
      picId: result.pic_id,
      lyricId: result.lyric_id,
      source: result.source,
      coverUrl,
    };

    // 添加到播放历史（去重）
    setPlayHistory(prev => {
      const filtered = prev.filter(t => t.id !== newTrack.id);
      return [newTrack, ...filtered].slice(0, 20); // 只保留最近20首
    });

    // 添加到播放列表
    const existingIndex = tracks.findIndex(t => t.id === newTrack.id);
    if (existingIndex !== -1) {
      setCurrentTrackIndex(existingIndex);
    } else {
      setTracks([...tracks, newTrack]);
      setCurrentTrackIndex(tracks.length);
    }

    // 获取歌词
    if (result.lyric_id) {
      getLyrics(result.lyric_id, result.source);
    }
  };

  // 添加到播放历史
  const addToHistory = (track: Track) => {
    setPlayHistory(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 20);
    });
  };

  // 进度条点击
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  // 音量控制
  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, x / rect.width));
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    audioRef.current.volume = newVolume;
  };

  // 切换静音
  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      setIsMuted(true);
      audioRef.current.volume = 0;
    }
  };

  // 切换重复模式
  const toggleRepeat = () => {
    const modes: Array<"none" | "all" | "one"> = ["none", "all", "one"];
    const currentModeIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentModeIndex + 1) % modes.length]);
  };

  // 切换随机播放
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  // 搜索防抖
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const progressPercentage = 0;

  return (
    <div className="min-h-screen flex flex-col font-['Inter']">
      {/* 主体内容 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左侧搜索结果列表 */}
        <aside className="w-full lg:w-80 border-r border-zinc-800/30 bg-zinc-950/30 backdrop-blur-sm flex flex-col order-2 lg:order-none flex-1 lg:flex-none">
          <div className="p-4 border-b border-zinc-800/30">
            <h2 className="text-sm font-semibold text-zinc-50 mb-3">搜索结果</h2>
            
            {/* 说明文字 */}
            <div className="mb-3 p-2 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
              <p className="text-xs text-cyan-300 leading-relaxed">
                本站音乐API来自 GD音乐台(music.gdstudio.xyz)
              </p>
            </div>
            
            {/* 音乐源选择器 */}
            <Select value={musicSource} onValueChange={(value) => setMusicSource(value as any)}>
              <SelectTrigger className="w-full bg-zinc-900/30 border-zinc-800/30 text-zinc-50 mb-3">
                <SelectValue placeholder="选择音乐源" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900/80 backdrop-blur-sm border-zinc-800/30">
                <SelectItem value="netease">网易云音乐</SelectItem>
                <SelectItem value="kuwo">酷我音乐</SelectItem>
                <SelectItem value="joox">JOOX音乐</SelectItem>
                <SelectItem value="bilibili">哔哩哔哩</SelectItem>
              </SelectContent>
            </Select>

            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="搜索歌曲、艺人或专辑..."
                className="pl-10 pr-24 bg-zinc-900/30 border-zinc-800/30 text-zinc-50 placeholder-zinc-500 focus-visible:ring-cyan-400"
              />
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 bg-cyan-400 text-black hover:bg-cyan-300 text-xs"
              >
                {isSearching ? (
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  "搜索"
                )}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-3 overflow-y-auto bg-transparent">

                                        {isSearching ? (

                                          <div className="text-center py-12 text-zinc-500">

                                            <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />

                                            <p className="text-sm">搜索中...</p>

                                          </div>

                                        ) : searchResults.length > 0 ? (

                                          <div ref={searchResultsRef} className="space-y-0.5 max-h-[400px] overflow-y-auto [&>div]:!scroll-smooth [&>div]:!overscroll-behavior-contain">

                                                                  {searchResults.map((result) => (

                                                                    <div

                                                                      key={`${result.source}-${result.id}`}

                                                                      onClick={() => playSearchResult(result)}

                                                                      className="group flex items-center gap-2 p-2 rounded cursor-pointer text-zinc-300 hover:bg-zinc-900/30 hover:text-zinc-50 transition-all border border-transparent hover:border-zinc-700/30"

                                                                    >

                                                                      <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400/20 to-teal-400/20 flex items-center justify-center shrink-0">

                                                                        <Music className="h-3.5 w-3.5 text-cyan-400" />

                                                                      </div>

                                                                      <div className="flex-1 min-w-0">

                                                                        <p className="font-medium text-sm truncate">{result.name}</p>

                                                                        <p className="text-xs text-zinc-500 truncate">{result.artist.join(", ")}</p>

                                                                      </div>

                                                                    </div>

                                                                  ))}

                                                                  {/* 加载更多指示器 */}
                                                                  {isLoadingMore && (
                                                                    <div className="text-center py-4 text-zinc-500">
                                                                      <div className="animate-spin h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2" />
                                                                      <p className="text-xs">加载更多...</p>
                                                                    </div>
                                                                  )}

                                                                  {!hasMore && searchResults.length > 0 && (
                                                                    <div className="text-center py-4 text-zinc-600">
                                                                      <p className="text-xs">没有更多结果了</p>
                                                                    </div>
                                                                  )}

                                                                </div>

                                        ) : searchQuery ? (

                                          <div className="text-center py-12 text-zinc-500">

                                            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />

                                            <p className="text-sm">未找到匹配的歌曲</p>

                                          </div>

                                        ) : filteredTracks.length > 0 ? (

                                          <div className="space-y-0.5">

                                                                  {filteredTracks.map((track, index) => {

                                                                    const actualIndex = tracks.findIndex(t => t.id === track.id);

                                                                    return (

                                                                      <div

                                                                        key={track.id}

                                                                        onClick={() => playTrack(index)}

                                                                        className={cn(

                                                                          "group flex items-center gap-2 p-2 rounded cursor-pointer transition-all border",

                                                                          currentTrack?.id === track.id

                                                                            ? "bg-zinc-900/50 text-zinc-50 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]"

                                                                            : "text-zinc-300 hover:bg-zinc-900/30 hover:text-zinc-50 border-transparent hover:border-zinc-700/30"

                                                                        )}

                                                                      >

                                                                        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400/20 to-teal-400/20 flex items-center justify-center shrink-0">

                                                                          {currentTrack?.id === track.id && isPlaying ? (

                                                                            <Pause className="h-3.5 w-3.5 text-cyan-400" />

                                                                          ) : (

                                                                            <Music className="h-3.5 w-3.5 text-zinc-500" />

                                                                          )}

                                                                        </div>

                                                                        <div className="flex-1 min-w-0">

                                                                          <p className="font-medium text-sm truncate">{track.name}</p>

                                                                          <p className="text-xs text-zinc-500 truncate">{track.artist || "本地音乐"}</p>

                                                                        </div>

                                                                        <Button

                                                                          variant="ghost"

                                                                          size="icon"

                                                                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-zinc-500 hover:text-zinc-50 hover:bg-zinc-800/50"

                                                                          onClick={(e) => removeTrack(track.id, e)}

                                                                        >

                                                                          <Trash2 className="h-3.5 w-3.5" />

                                                                        </Button>

                                                                      </div>

                                                                    );

                                                                  })}

                                                                </div>

                                        ) : null}

                                      </ScrollArea>

          

                            <div className="p-4 border-t border-zinc-800 text-center text-zinc-500 text-xs">

                              {searchResults.length > 0 ? `搜索结果: ${searchResults.length} 首` : `共 ${filteredTracks.length} 首歌曲`}

                            </div>

                          </aside>

        {/* 中央播放区 */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto order-1 lg:order-none">
          <div className="w-full max-w-lg">
            {/* 专辑封面 */}
            <div className="mb-6 lg:mb-8">
              {/* Tab 切换 */}
              <div className="flex justify-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                <button
                  onClick={() => setActiveTab("cover")}
                  className={cn(
                    "px-4 lg:px-6 py-2 rounded-full text-xs lg:text-sm font-medium transition-all border",
                    activeTab === "cover"
                      ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      : "bg-zinc-900/50 text-zinc-300 border-zinc-800/30 hover:bg-zinc-900 hover:text-zinc-50"
                  )}
                >
                  歌手写真
                </button>
                <button
                  onClick={() => setActiveTab("lyrics")}
                  className={cn(
                    "px-4 lg:px-6 py-2 rounded-full text-xs lg:text-sm font-medium transition-all border",
                    activeTab === "lyrics"
                      ? "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      : "bg-zinc-900/50 text-zinc-300 border-zinc-800/30 hover:bg-zinc-900 hover:text-zinc-50"
                  )}
                >
                  歌词
                </button>
              </div>

              {/* 封面图 */}
              {activeTab === "cover" && (
                <div className="relative mx-auto w-64 h-64 lg:w-80 lg:h-80">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl" />
                  <div className={cn(
                    "relative w-full h-full bg-zinc-900 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border border-zinc-800",
                    isPlaying && "animate-spin-slow"
                  )}>
                    {currentTrack?.coverUrl ? (
                      <img 
                        src={currentTrack.coverUrl} 
                        alt={currentTrack.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950" />
                        <Music className="absolute h-24 lg:h-32 w-24 lg:w-32 text-zinc-600" />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 歌词显示 */}
              {activeTab === "lyrics" && (
                <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
                  {/* 标题栏 - 包含跟随歌词开关 */}
                  <div className="flex items-center justify-between px-4 py-3 mb-2">
                    <span className="text-sm font-medium text-zinc-300">歌词</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">跟随歌词</span>
                      <Switch
                        checked={autoFollowLyrics}
                        onCheckedChange={setAutoFollowLyrics}
                        className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-zinc-700"
                      />
                    </div>
                  </div>
                  <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800/30 shadow-lg overflow-hidden">
                    <ScrollArea className="h-48 lg:h-60 p-4 lg:p-6 [&>div]:!scroll-smooth [&>div]:!overscroll-behavior-contain">
                    <div 
                      ref={lyricsScrollRef}
                      className="flex flex-col justify-center min-h-full space-y-3 lg:space-y-4 scroll-smooth"
                    >
                      {parseLyrics(lyrics).length > 0 ? (
                        parseLyrics(lyrics).map((line, index) => {
                          const currentLine = getCurrentLyricLine();
                          return (
                            <p
                              key={index}
                              className={cn(
                                "text-sm lg:text-base transition-all duration-300 py-1 text-center",
                                index === currentLine
                                  ? "text-zinc-50 text-lg lg:text-xl font-bold scale-110 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                                  : "text-zinc-600 scale-100"
                              )}
                            >
                              {line.text}
                            </p>
                          );
                        })
                      ) : (
                        <div className="text-center text-zinc-600 flex items-center justify-center min-h-full">
                          <div>
                            <Music className="h-10 lg:h-12 w-10 lg:w-12 mx-auto mb-4 opacity-30" />
                            <p className="text-xs lg:text-sm">暂无歌词</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  </div>
                </div>
              )}
            </div>

            {/* 歌曲信息 */}
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-3xl font-bold text-zinc-50 mb-2 truncate px-2">
                {currentTrack?.name || "未选择音乐"}
              </h2>
              <p className="text-sm lg:text-base text-cyan-400">
                {currentTrack?.artist || (currentTrack ? "未知艺术家" : "搜索音乐开始播放")}
              </p>
            </div>

            {/* 音乐播放器 */}
            {currentTrack ? (
              <div className="mb-8">
                <AudioPlayer
                  ref={playerRef}
                  src={currentTrack.url}
                  autoPlay
                  showSkipControls
                  showJumpControls={false}
                  onClickPrevious={playPrevious}
                  onClickNext={playNext}
                  onEnded={playNext}
                  customAdditionalControls={[]}
                  layout="stacked-reverse"
                  className="music-player-custom"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onListen={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  style={{
                    '--rhap-theme-color': '#7C3AED',
                    '--rhap-background-color': 'transparent',
                    '--rhap-bar-color': '#334155',
                    '--rhap_time-color': '#94A3B8',
                    '--rhap_font-family': 'Inter, sans-serif',
                  } as React.CSSProperties}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-[#94A3B8]">
                <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>搜索音乐开始播放</p>
              </div>
            )}
          </div>
        </main>

{/* 右侧播放历史 - 移动端隐藏，桌面端显示 */}
        <aside className="hidden lg:flex w-80 border-l border-zinc-800/30 bg-zinc-950/30 flex-col">
          <div className="p-4 border-b border-zinc-800/30">
            <h2 className="text-sm font-semibold text-zinc-50">播放历史</h2>
          </div>

          <ScrollArea className="flex-1 p-3 bg-transparent">
            {currentTrack && (
              <div className="mb-4 p-3 bg-zinc-900/50 rounded-lg border-l-4 border-cyan-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">正在播放</span>
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <Play className="h-4 w-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-zinc-50 truncate">{currentTrack.name}</p>
                <p className="text-xs text-zinc-500">{currentTrack.artist || "未知艺术家"}</p>
              </div>
            )}

            {playHistory.length > 0 ? (
              <div className="space-y-0.5">
                {playHistory.slice(0, 10).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playHistoryItem(track)}
                    className="flex items-center gap-2 p-2 rounded cursor-pointer text-zinc-300 hover:bg-zinc-900/30 hover:text-zinc-50 transition-all border border-transparent hover:border-zinc-700/30"
                  >
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400/20 to-teal-400/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="h-3.5 w-3.5 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{track.artist || "未知艺术家"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">暂无播放历史</p>
              </div>
            )}
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}