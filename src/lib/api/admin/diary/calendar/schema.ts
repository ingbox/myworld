import { z } from "zod";

export const createDiarySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "다이어리 내용을 입력해 주세요."),
  diaryDate: z
    .string()
    .trim()
    .min(1, "날짜를 선택해 주세요."),
});

export const createDiaryEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "제목을 입력해 주세요."),
    allDay: z.boolean(),
    start: z
      .string()
      .trim()
      .min(1, "시작 날짜를 입력해 주세요."),
    end: z
      .string()
      .trim()
      .min(1, "종료 날짜를 입력해 주세요."),
    repeat: z.enum([
      "none",
      "daily",
      "weekly",
      "biweekly",
      "monthly",
      "yearly",
    ]),
    color: z
      .string()
      .trim()
      .min(1, "색깔을 선택해 주세요."),
    memo: z.string(),
  })
  .refine((data) => data.start <= data.end, {
    message: "시작이 종료보다 늦을 수 없습니다.",
    path: ["end"],
  });

export type CreateDiaryFormData = z.infer<typeof createDiarySchema>;
export type CreateDiaryEventFormData = z.infer<typeof createDiaryEventSchema>;