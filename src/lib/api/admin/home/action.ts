"use server";

import { updateTag } from "next/cache";
import pool from "@/src/lib/db";
import {
    DELETE_MINIROOM_ITEM,
    INSERT_EMOJI,
    INSERT_MINIROOM,
    INSERT_MINIROOM_ITEM,
    INSERT_STATUS_MESSAGE,
    SELECT_MINIROOM,
    UPDATE_MINIROOM,
} from "./queries";
import { uploadMiniroomFile } from "./service";
import type {
    MiniroomData,
    MiniroomItemData,
    MiniroomLayer,
    UploadMiniroomItemRequest,
} from "./types";

/**
 * 미니룸 창고에 이미지를 올립니다. GIF/PNG/JPG/WebP.
 *
 * @param file - 업로드할 이미지
 * @param width - 원본 가로 (클라이언트가 읽어서 넘김)
 * @param height - 원본 세로
 */
export async function uploadMiniroomItem({
    file,
    width,
    height,
}: UploadMiniroomItemRequest): Promise<MiniroomItemData> {

    const { url } = await uploadMiniroomFile(file);
    const name = file.name.replace(/\.[^/.]+$/i, "") || null;

    const result = await pool.query(INSERT_MINIROOM_ITEM, [
        name,
        url,
        width ?? null,
        height ?? null,
    ]);

    updateTag("miniroomItems");
    return result.rows[0] as MiniroomItemData;
}

function isMiniroomLayer(value: unknown): value is MiniroomLayer {
    if (typeof value !== "object" || value == null) return false;
    const layer = value as MiniroomLayer;
    return (
        typeof layer.id === "string" &&
        typeof layer.item_id === "number" &&
        typeof layer.x === "number" &&
        typeof layer.y === "number" &&
        typeof layer.w === "number" &&
        typeof layer.h === "number" &&
        typeof layer.z === "number"
    );
}

/**
 * 미니룸 소품 배치를 저장합니다. 행이 없으면 만들고, 있으면 layers만 갱신합니다.
 *
 * @param layers - 캔버스 위 소품 좌표 (0~1 비율)
 * @returns 저장된 미니룸 행
 * @throws 배치 데이터가 잘못됐거나 DB 저장에 실패한 경우
 */
export async function saveMiniroom(layers: MiniroomLayer[]): Promise<MiniroomData> {
    if (!Array.isArray(layers) || !layers.every(isMiniroomLayer)) {
        throw new Error("미니룸 배치 데이터가 올바르지 않습니다.");
    }

    const payload = JSON.stringify(layers);
    const existing = await pool.query(SELECT_MINIROOM);

    const result = existing.rows[0]
        ? await pool.query(UPDATE_MINIROOM, [payload, existing.rows[0].id])
        : await pool.query(INSERT_MINIROOM, [payload]);

    updateTag("miniroom");
    return result.rows[0] as MiniroomData;
}

/**
 * 미니룸 창고 아이템을 소프트 삭제합니다. (`deleted_at` 기록)
 * 저장된 배치에 그 소품이 있으면 같이 빼 둡니다.
 *
 * @param itemId - 삭제할 창고 아이템 id
 * @throws 삭제에 실패한 경우
 */
export async function deleteMiniroomItem(itemId: number) {
    if (!Number.isInteger(itemId) || itemId <= 0) {
        throw new Error("삭제할 아이템이 올바르지 않습니다.");
    }

    const result = await pool.query(DELETE_MINIROOM_ITEM, [itemId]);
    if (result.rowCount === 0) {
        throw new Error("아이템을 찾을 수 없습니다.");
    }

    const existing = await pool.query(SELECT_MINIROOM);
    const miniroom = existing.rows[0] as MiniroomData | undefined;
    if (miniroom?.layers) {
        const nextLayers = miniroom.layers.filter((layer) => layer.item_id !== itemId);
        if (nextLayers.length !== miniroom.layers.length) {
            await pool.query(UPDATE_MINIROOM, [JSON.stringify(nextLayers), miniroom.id]);
            updateTag("miniroom");
        }
    }

    updateTag("miniroomItems");
}

/**
 * 새로운 이모지를 데이터베이스에 추가합니다.
 *
 * Form action 전용 핸들러: FormData에서 emoji 값을 읽어 저장합니다.
 * 
 * @param formData - Form에서 전달된 데이터(FormData)
 * @returns 저장된 이모지 행
 * @throws 이모지 저장에 실패한 경우
 */
export async function insertEmoji(formData: FormData) {
    const emoji = (formData.get("emoji") as string)?.trim();
    if (!emoji) {
        throw new Error("이모지를 입력해 주세요.");
    }

    const result = await pool.query(INSERT_EMOJI, [emoji]);
    if (result.rowCount === 0) {
        throw new Error("이모지 저장에 실패했습니다.");
    }
    updateTag("emoji");
    return result.rows[0];
}

/**
 * 홈 왼쪽 상태 메시지를 추가합니다.
 * Form action 전용 핸들러: FormData에서 content를 읽어 저장합니다.
 *
 * @param formData - Form에서 전달된 데이터(FormData)
 * @returns 저장된 상태 메시지 행
 * @throws 저장에 실패한 경우
 */
export async function insertStatusMessage(formData: FormData) {
    const content = (formData.get("content") as string)?.trim();
    if (!content) {
        throw new Error("상태 메시지를 입력해 주세요.");
    }

    const result = await pool.query(INSERT_STATUS_MESSAGE, [content]);
    if (result.rowCount === 0) {
        throw new Error("상태 메시지 저장에 실패했습니다.");
    }
    updateTag("statusMessage");
    return result.rows[0];
}