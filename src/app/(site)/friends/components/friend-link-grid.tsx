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
            <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-3">
              {/* 头部：头像 + 名称 + URL */}
              <div className="flex items-center gap-2 md:gap-3">
                <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-border flex-shrink-0">
                  <AvatarImage src={link.logo || ""} alt={link.name} className="object-cover" />
                  <AvatarFallback className="text-xs md:text-sm">{link.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm md:text-base font-semibold group-hover:text-cyan-500 transition-colors truncate">
                      {link.name}
                    </CardTitle>
                    <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500 flex-shrink-0" />
                  </div>
                  <CardDescription className="text-xs truncate mt-0.5">
                    {new URL(link.url).hostname}
                  </CardDescription>
                </div>
              </div>
              
              {/* 简介 */}
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {link.description || "这个家伙很懒，什么都没写..."}
              </p>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}
