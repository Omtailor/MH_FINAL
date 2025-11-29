import { useEffect, useState } from 'react';
import { Newspaper, Clock } from 'lucide-react';
import { getNewsItems, initializeSampleNews, NewsItem } from '@/lib/sosStore';
import { formatDistanceToNow } from 'date-fns';

export function LiveNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Initialize sample news
    initializeSampleNews();
    setNews(getNewsItems());

    // Refresh every 60 seconds
    const interval = setInterval(() => {
      setNews(getNewsItems());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-emergency-red-light border-2 border-emergency-red rounded-lg p-3 text-center">
        <p className="font-bold text-emergency-red flex items-center justify-center gap-2">
          <span className="live-indicator">LIVE UPDATES - CRITICAL INFORMATION</span>
        </p>
      </div>

      <div className="flex items-center gap-2 text-emergency-red">
        <Newspaper className="w-5 h-5" />
        <h2 className="text-xl font-bold">Live News Updates</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Latest verified information about ongoing emergency situations.
      </p>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {news.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No news updates available.</p>
        ) : (
          news.map((item) => (
            <article
              key={item.id}
              className="news-item p-4 rounded-lg animate-fade-in"
            >
              <h3 className="font-bold text-emergency-red">{item.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 mb-2">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
              </div>
              <p className="text-sm text-foreground">{item.snippet}</p>
              <p className="text-xs text-muted-foreground mt-2">Source: {item.source}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
