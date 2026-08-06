import { KeywordMazeCardSkeleton } from "@/components/cy/profile/intro/keyword/KeywordMazeCardSkeleton";
import KeywordMazeShell from "@/components/cy/profile/intro/keyword/KeywordMazeShell";

export default function KeywordMazeSkeleton() {
  return (
    <div className="keyword-maze-root">
      <KeywordMazeShell>
        <KeywordMazeCardSkeleton />
      </KeywordMazeShell>
    </div>
  );
}
