import { createHmac, randomUUID, timingSafeEqual } from "crypto";

const SECRET = process.env.FISH_BAG_SECRET ?? "pokemon12";
const PLAYER_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function signPlayerId(id: string) {
  return createHmac("sha256", SECRET).update(id).digest("base64url");
}

/**
 * 방문자를 가리키는 UUID를 만듭니다.
 */
export function createPlayerId() {
  return randomUUID();
}

/**
 * 식별값을 서명된 쿠키 문자열로 만듭니다.
 *
 * @param id - 방문자 UUID
 */
export function encodePlayerCookie(id: string) {
  return `v1.${id}.${signPlayerId(id)}`;
}

/**
 * 서명이 맞은 식별값을 읽습니다. 예전 `"1"` 쿠키는 식별값이 없으니 null입니다.
 *
 * @param value - `game-started` 쿠키
 */
export function decodePlayerCookie(value: string | undefined) {
  if (!value || value === "1") return null;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const id = parts[1];
  if (!PLAYER_ID_RE.test(id)) return null;
  const expected = signPlayerId(id);
  const actual = parts[2];
  if (actual.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return null;
  return id;
}

/**
 * 튜토리얼을 이미 본 방문인지 봅니다. 예전 `"1"`도 시작한 것으로 봅니다.
 *
 * @param value - `game-started` 쿠키
 */
export function isGameStartedCookie(value: string | undefined) {
  if (value === "1") return true;
  return decodePlayerCookie(value) !== null;
}
