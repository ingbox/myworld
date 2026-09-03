/**
 * 사이트맵·robots 등에서 쓰는 공개 URL 베이스를 반환합니다.
 * 개발 환경은 localhost, 배포는 `NEXT_PUBLIC_BASE_URL`을 사용합니다.
 */
export const getBaseUrl = () =>
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : (process.env.NEXT_PUBLIC_BASE_URL ?? "");
