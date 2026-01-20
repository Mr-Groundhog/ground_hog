import { ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FriendLinkGrid({ links }: { links: any[] }) {
  if (links.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        暂无友链，欢迎申请！
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {links.map((link) => (
        <a 
          key={link.id} 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group h-full"
        >
          <Card className="h-full transition-all hover:shadow-lg hover:border-cyan-500/50 overflow-hidden flex flex-col">
            {/* 封面图区域 - 如果有封面图则展示，否则展示默认占位图 */}
            <div className="h-32 w-full overflow-hidden border-b border-border bg-zinc-100 dark:bg-zinc-800 relative">
              {link.coverImage ? (
                <img 
                  src={link.coverImage} 
                  alt={`${link.name} cover`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 transition-transform duration-500 group-hover:scale-105">
                   <span className="text-4xl font-bold text-zinc-300 dark:text-zinc-700 select-none">
                      {link.name.charAt(0).toUpperCase()}
                   </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={link.logo || ""} alt={link.name} className="object-cover" />
                  <AvatarFallback>{link.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate group-hover:text-cyan-500 transition-colors flex items-center gap-2">
                    {link.name}
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500" />
                  </CardTitle>
                  <CardDescription className="truncate text-xs">
                    {new URL(link.url).hostname}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {link.description || "这个家伙很懒，什么都没写..."}
                </p>
              </CardContent>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}
