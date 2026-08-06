export function KeywordMazeCardSkeleton() {
  return (
    <div className="keyword-maze-card" aria-hidden="true">
      <span className="keyword-maze-skeleton keyword-maze-skeleton-line w-20 h-3.5" />
      <div className="keyword-maze-skeleton keyword-maze-skeleton-block h-32" />
      <div className="keyword-maze-skeleton keyword-maze-skeleton-block h-9" />
      <div className="keyword-maze-actions">
        <div className="keyword-maze-skeleton keyword-maze-skeleton-block h-9 w-24" />
        <div className="keyword-maze-skeleton keyword-maze-skeleton-block h-9 w-16" />
      </div>
    </div>
  );
}
