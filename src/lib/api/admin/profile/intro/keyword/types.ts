export type KeywordRouteInput = {
  answer: string;
  nextNodeId: number | null;
};

export type KeywordNodeListItem = {
  id: number;
  title: string | null;
  is_start: boolean;
};

export type CreateKeywordNodeRequest = {
  title: string;
  content: string;
  isStart: boolean;
  routes: KeywordRouteInput[];
};

export type CreateKeywordNodeResult = {
  success: true;
  nodeId: number;
};
