export type StatKey = "erotic" | "famous" | "friendly" | "karma" | "kind";

export type UserStatValue = {
  value: number;
  diff: number;
};

export type UserStatsDisplay = Record<string, UserStatValue>;

export type SaveUserStatsRequest = {
  erotic: number;
  famous: number;
  friendly: number;
  karma: number;
  kind: number;
  user_id?: number;
};
