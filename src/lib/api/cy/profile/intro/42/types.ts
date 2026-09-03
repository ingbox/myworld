export type AskRole = "user" | "assistant";

export type AskMessage = {
  id: number;
  user_email: string;
  role: AskRole;
  content: string;
  created_at: string;
};

export type AskUsage = {
  used: number;
  limit: number;
  remaining: number;
};

export type SendAskMessageResult = {
  user: AskMessage;
  assistant: AskMessage;
};
