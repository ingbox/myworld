type KeywordMazeShellProps = {
  children: React.ReactNode;
};

export default function KeywordMazeShell({ children }: KeywordMazeShellProps) {
  return (
    <div className="keyword-maze-root">
      <div className="keyword-maze-quiz">
        <p className="keyword-maze-label">KEYWORD MAZE</p>
        <h2 className="keyword-maze-title">키워드 미궁</h2>
        <p className="keyword-maze-desc">
          단계를 클리어할 때마다 다음 문제가 열리는 온라인 미궁이에요.
          문제를 풀 때 메모장을 열어 자유롭게 메모하세요.
        </p>
        {children}
      </div>
    </div>
  );
}
