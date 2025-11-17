/**
 * 샘플 데이터 생성 스크립트
 * 테스트용 방문 기록을 자동으로 추가합니다
 */

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database', 'visitors.db'));

console.log('🔄 샘플 데이터 생성 중...\n');

// 샘플 데이터
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const os = ['Windows 10', 'Mac OS X', 'Linux', 'Android', 'iOS'];
const devices = ['Desktop', 'Mobile', 'Tablet'];
const pages = ['/', '/about', '/contact', '/products', '/blog', '/services'];
const ips = [
    '192.168.1.1', '192.168.1.2', '192.168.1.3', '10.0.0.1', '10.0.0.2',
    '172.16.0.1', '172.16.0.2', '203.0.113.1', '203.0.113.2', '198.51.100.1'
];

// 랜덤 선택 함수
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 랜덤 날짜 생성 (최근 30일)
function randomDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
}

// 방문 기록 생성
const stmt = db.prepare(`
    INSERT INTO visitor_logs (
        ip_address, page_path, query_string, referer, user_agent,
        visit_timestamp, session_id, browser, os, device
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updatePage = db.prepare(`
    INSERT INTO page_statistics (page_path, total_visits, unique_visitors, last_visit)
    VALUES (?, 1, 1, ?)
    ON CONFLICT(page_path) DO UPDATE SET
        total_visits = total_visits + 1,
        last_visit = ?,
        updated_at = CURRENT_TIMESTAMP
`);

// 100개의 샘플 방문 기록 생성
for (let i = 0; i < 100; i++) {
    const ip = random(ips);
    const page = random(pages);
    const browser = random(browsers);
    const osName = random(os);
    const device = random(devices);
    const timestamp = randomDate();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userAgent = `Mozilla/5.0 (${osName}) ${browser}`;
    const referer = i % 3 === 0 ? 'https://google.com' : (i % 3 === 1 ? 'https://facebook.com' : '');

    try {
        stmt.run(
            ip,
            page,
            '',
            referer,
            userAgent,
            timestamp,
            sessionId,
            browser,
            osName,
            device
        );

        updatePage.run(page, timestamp, timestamp);

    } catch (error) {
        console.error('Error inserting data:', error);
    }

    // 진행 상황 표시
    if ((i + 1) % 20 === 0) {
        console.log(`✅ ${i + 1}개 생성 완료...`);
    }
}

// 일별 통계 업데이트
const dates = [...new Set(Array.from({length: 100}, () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
}))];

const updateDaily = db.prepare(`
    INSERT INTO daily_statistics (stat_date, total_visits, unique_visitors, unique_ips)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(stat_date) DO UPDATE SET
        total_visits = total_visits + ?
`);

dates.forEach(date => {
    const visits = Math.floor(Math.random() * 20) + 5;
    updateDaily.run(date, visits, visits, visits, visits);
});

console.log('\n✅ 샘플 데이터 생성 완료!');
console.log(`📊 총 ${100}개의 방문 기록이 추가되었습니다.\n`);

// 통계 출력
const stats = db.prepare('SELECT COUNT(*) as count FROM visitor_logs').get();
console.log(`📈 현재 총 방문 기록: ${stats.count}개`);

const uniqueIPs = db.prepare('SELECT COUNT(DISTINCT ip_address) as count FROM visitor_logs').get();
console.log(`👥 고유 방문자 (IP): ${uniqueIPs.count}개`);

const topPage = db.prepare(`
    SELECT page_path, COUNT(*) as visits
    FROM visitor_logs
    GROUP BY page_path
    ORDER BY visits DESC
    LIMIT 1
`).get();
console.log(`🔥 가장 인기 있는 페이지: ${topPage.page_path} (${topPage.visits}회)\n`);

console.log('💡 대시보드를 새로고침해서 확인하세요: http://localhost:3000\n');

db.close();
