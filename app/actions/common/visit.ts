import { getBaseUrl } from "../url";

  // ====== 방문자 통계 가져오기 ======
  export async function getVisitCount() {
    const url = getBaseUrl();
  
    const response = await fetch(
      `${url}/api/common/visit`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { tags: ['visitCount'] },
      }
    );
  
    if (!response.ok) {
      throw new Error('방문자 통계 조회 실패');
    }
    return response.json();
  }