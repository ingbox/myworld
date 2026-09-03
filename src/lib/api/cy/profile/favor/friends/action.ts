"use server";

import { redirect } from "next/navigation";

/**
 * 일촌 검색어를 쿼리스트링으로 붙여 일촌 페이지로 이동합니다.
 *
 * @param formData - `search` 검색어
 */
export const searchFriends = async (formData: FormData) => {
    const search = formData.get("search") as string;
    redirect(`/cy/profile/favor/friend?search=${encodeURIComponent(search)}`);
}