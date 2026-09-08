import "server-only";

import { cacheTag } from "next/cache";
import pool from "@/src/lib/db";
import { uploadObjectToS3 } from "@/src/util/shared/s3";
import { isHeicFile, resolveImageMeta } from "@/src/util/shared/image-meta";
import { SELECT_MINIROOM, SELECT_MINIROOM_ITEMS } from "./queries";
import type { MiniroomData, MiniroomItemData } from "./types";

/**
 * 미니룸 창고 아이템 목록을 조회합니다.
 */
export async function getMiniroomItems(): Promise<MiniroomItemData[]> {
    "use cache";
    cacheTag("miniroomItems");

    const result = await pool.query(SELECT_MINIROOM_ITEMS);
    return result.rows as MiniroomItemData[];
}

/**
 * 저장된 미니룸 배치를 조회합니다. 없으면 null.
 *
 * @returns 미니룸 행, 또는 아직 저장한 적 없으면 null
 */
export async function getMiniroom(): Promise<MiniroomData | null> {
    "use cache";
    cacheTag("miniroom");

    const result = await pool.query(SELECT_MINIROOM);
    const row = result.rows[0] as MiniroomData | undefined;
    if (!row) return null;

    return {
        ...row,
        layers: Array.isArray(row.layers) ? row.layers : [],
    };
}

/**
 * 미니룸 아이템을 S3 `cy/admin/miniroom/` 에 올립니다.
 */
export async function uploadMiniroomFile(file: File) {
    if (!file) throw new Error("파일이 없습니다.");
    if (isHeicFile(file)) {
        throw new Error("HEIC/HEIF 파일은 업로드할 수 없습니다.");
    }

    const { contentType, ext } = resolveImageMeta(file);
    if (!ext) {
        throw new Error("지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP)");
    }

    const baseName = file.name.replace(/\.[^/.]+$/i, "") || "item";
    const key = `cy/admin/miniroom/${Date.now()}-${baseName}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadObjectToS3(key, buffer, contentType);

    return { url };
}