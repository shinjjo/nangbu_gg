/**
 * Maps chef names to their local AI-generated caricature avatar paths.
 * These replace the original photo URLs from Supabase to avoid broken images
 * and copyright issues.
 */
const CHEF_AVATAR_MAP: Record<string, string> = {
    '정지선': '/images/avatars/jeong_jiseon.png',
    '최강록': '/images/avatars/choi_gangrok.png',
    '이미영': '/images/avatars/lee_mikyung.png',
    '윤남노': '/images/avatars/yoon_namno.png',
    '임태훈': '/images/avatars/im_taehoon.png',
    '권성준': '/images/avatars/kwon_sungjun.png',
    '정호영': '/images/avatars/jeong_hoyoung.png',
    '이연복': '/images/avatars/lee_yeonbok.png',
    '에드워드 리': '/images/avatars/edward_lee.png',
    '에드워드리': '/images/avatars/edward_lee.png',
    '샘킴': '/images/avatars/sam_kim.png',
    '손종원': '/images/avatars/son_jongwon.png',
    '김풍': '/images/avatars/kim_poong.png',
    '최현석': '/images/avatars/choi_hyunseok.png',
    '이원일': '/images/avatars/lee_wonil.png',
    '박은영': '/images/avatars/park_eunyoung.png',
    '파브리': '/images/avatars/fabrizio.png',
    '파브리치오 페라리': '/images/avatars/fabrizio.png',
    '안티모': '/images/avatars/antimo.png',
    '안티모 마리아 메로네': '/images/avatars/antimo.png',
    '김소희': '/images/avatars/kim_sohee.png',
    '조셉': '/images/avatars/joseph.png',
    '조셉 리저우드': '/images/avatars/joseph.png',
    '정창욱': '/images/avatars/takada.png',
    '여경래': '/images/avatars/yeo_gyeongrae.png',
    '다카다 유스케': '/images/avatars/takada.png',
    '다카다': '/images/avatars/takada.png',
    '다카다 마코토': '/images/avatars/takada.png',
    '타카다 유스케': '/images/avatars/takada.png',
    '타카다': '/images/avatars/takada.png',
    '한리광': '/images/avatars/han_rigwang.png',
    '장근석': '/images/avatars/jang_geunseok.png',
};

/**
 * Returns the local avatar URL for a chef by name.
 * Falls back to the original image_url if no local avatar is found,
 * and finally to a default placeholder.
 */
export function getChefAvatar(name?: string, fallbackUrl?: string): string {
    if (name && CHEF_AVATAR_MAP[name]) {
        return CHEF_AVATAR_MAP[name];
    }
    return fallbackUrl || '/images/avatars/default.png';
}
