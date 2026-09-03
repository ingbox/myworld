export type KeywordNode = {
  id: number;
  title: string | null;
  content: string;
};

export type KeywordSubmitResult =
  | { correct: true; node: KeywordNode | null; cleared: boolean; history?: number[] }
  | { correct: false };

export type KeywordProgressState = {
  node: KeywordNode;
  history: number[];
};
