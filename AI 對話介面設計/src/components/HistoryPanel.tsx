import { Clock, Trash2, ChevronRight, Star, StarOff } from 'lucide-react';
import { useState } from 'react';

interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
  isFavorite?: boolean;
}

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    title: '航空級鋁合金',
    timestamp: '2 小時前',
    preview: '需要耐高溫、耐腐蝕的航空級鋁合金...',
    isFavorite: true
  },
  {
    id: '2',
    title: '碳纖維複合材料',
    timestamp: '5 小時前',
    preview: '輕量、高強度的碳纖維材質...',
    isFavorite: false
  },
  {
    id: '3',
    title: '工業陶瓷',
    timestamp: '昨天',
    preview: '耐高溫、耐磨損的工業陶瓷材質...',
    isFavorite: true
  },
  {
    id: '4',
    title: '環保塑膠材料',
    timestamp: '2 天前',
    preview: '可回收、低碳足跡的塑膠材質...',
    isFavorite: false
  },
  {
    id: '5',
    title: '不鏽鋼 316L',
    timestamp: '3 天前',
    preview: '醫療級不鏽鋼材質規格查詢...',
    isFavorite: true
  },
  {
    id: '6',
    title: '聚碳酸酯 PC',
    timestamp: '1 週前',
    preview: '透明、耐衝擊的 PC 材質...',
    isFavorite: false
  }
];

export function HistoryPanel() {
  const [history, setHistory] = useState(mockHistory);
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(history.filter(item => item.id !== id));
    console.log('刪除檢索記錄:', id);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(history.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const handleHistoryClick = (item: HistoryItem) => {
    console.log('開啟歷史檢索:', item);
  };

  const handleClearAll = () => {
    if (window.confirm('確定要清空所有記錄嗎？')) {
      setHistory([]);
    }
  };

  const filteredHistory = activeTab === 'favorites' 
    ? history.filter(item => item.isFavorite)
    : history;

  return (
    <aside className="w-80 h-full border-r border-border bg-card/30 backdrop-blur-sm flex flex-col shrink-0">
      {/* 標題 */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 text-foreground mb-4">
          <Clock className="w-5 h-5" />
          <h2 className="text-lg">檢索記錄</h2>
        </div>

        {/* 標籤切換 */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
              activeTab === 'recent'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            最近檢索
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            我的收藏
          </button>
        </div>
      </div>

      {/* 歷史列表 */}
      <div className="flex-1 overflow-y-auto history-panel-scroll">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {activeTab === 'favorites' ? '尚無收藏項目' : '尚無檢索記錄'}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="group w-full p-3 rounded-xl border border-transparent bg-transparent hover:bg-accent hover:border-border transition-all duration-200 text-left relative"
              >
                {/* 內容 */}
                <div className="pr-16">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm text-foreground line-clamp-1 flex-1 font-medium">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                    {item.preview}
                  </p>
                  <span className="text-xs text-muted-foreground/70">
                    {item.timestamp}
                  </span>
                </div>

                {/* 操作按鈕組 */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  {/* 收藏按鈕 */}
                  <button
                    onClick={(e) => handleToggleFavorite(item.id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 ${
                      item.isFavorite
                        ? 'text-amber-500 hover:bg-amber-500/10 opacity-100'
                        : 'text-muted-foreground hover:bg-muted hover:text-amber-500'
                    }`}
                    aria-label={item.isFavorite ? '取消收藏' : '收藏'}
                  >
                    {item.isFavorite ? (
                      <Star className="w-4 h-4 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </button>

                  {/* 刪除按鈕 */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
                    aria-label="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 箭頭指示 */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="px-3 py-2 border-t border-border space-y-1.5">
        <button 
          onClick={handleClearAll}
          disabled={history.length === 0}
          className="w-full py-2 px-3 rounded-lg border border-border bg-background hover:bg-accent text-sm text-foreground transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          清空所有記錄
        </button>
        
        <div className="text-xs text-center text-muted-foreground pt-1">
          共 {history.length} 筆記錄 · {history.filter(item => item.isFavorite).length} 個收藏
        </div>
      </div>
    </aside>
  );
}
