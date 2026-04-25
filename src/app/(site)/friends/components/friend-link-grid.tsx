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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {links.map((link) => (
        <a 
          key={link.id} 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group h-full"
        >
          <Card className="h-full transition-all hover:shadow-lg hover:border-cyan-500/50 overflow-hidden cursor-pointer">
            <div className="p-4 md:p-5 flex flex-col gap-3 md:gap-4">
              {/* 头部：头像 + 名称 + URL */}
              <div className="flex items-center gap-3 md:gap-4">
                <Avatar className="h-12 w-12 md:h-14 md:w-14 border border-border flex-shrink-0">
                  <AvatarImage src={link.logo || ""} alt={link.name} className="object-cover" />
                  <AvatarFallback className="text-sm">{link.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base md:text-lg font-semibold group-hover:text-cyan-500 transition-colors truncate">
                      {link.name}
                    </CardTitle>
                    <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500 flex-shrink-0" />
                  </div>
                  <CardDescription className="text-xs md:text-sm truncate mt-0.5">
                    {new URL(link.url).hostname}
                  </CardDescription>
                </div>
              </div>
              
              {/* 简介 */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {link.description || "这个家伙很懒，什么都没写..."}
              </p>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}
