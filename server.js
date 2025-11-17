const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// 데이터베이스 디렉토리 생성
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// SQLite 데이터베이스 연결
const db = new Database(path.join(dbDir, 'visitors.db'));

// 테이블 생성
db.exec(`
    CREATE TABLE IF NOT EXISTS visitor_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT NOT NULL,
        page_path TEXT NOT NULL,
        query_string TEXT,
        referer TEXT,
        user_agent TEXT,
        visit_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_id TEXT,
        browser TEXT,
        os TEXT,
        device TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_ip ON visitor_logs(ip_address);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON visitor_logs(visit_timestamp);
    CREATE INDEX IF NOT EXISTS idx_page_path ON visitor_logs(page_path);

    CREATE TABLE IF NOT EXISTS page_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_path TEXT NOT NULL UNIQUE,
        total_visits INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        last_visit DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stat_date DATE NOT NULL UNIQUE,
        total_visits INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        unique_ips INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

console.log('✅ 데이터베이스 초기화 완료');

// User Agent 파싱 함수
function parseUserAgent(userAgent) {
    const ua = userAgent || '';
    const info = {
        browser: 'Unknown',
        os: 'Unknown',
        device: 'Desktop'
    };

    // 브라우저 감지
    if (/MSIE|Trident/i.test(ua)) {
        info.browser = 'Internet Explorer';
    } else if (/Edg/i.test(ua)) {
        info.browser = 'Microsoft Edge';
    } else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
        info.browser = 'Chrome';
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
        info.browser = 'Safari';
    } else if (/Firefox/i.test(ua)) {
        info.browser = 'Firefox';
    } else if (/Opera|OPR/i.test(ua)) {
        info.browser = 'Opera';
    }

    // OS 감지
    if (/Windows NT 10/i.test(ua)) {
        info.os = 'Windows 10';
    } else if (/Windows NT 11/i.test(ua)) {
        info.os = 'Windows 11';
    } else if (/Windows/i.test(ua)) {
        info.os = 'Windows';
    } else if (/Mac OS X/i.test(ua)) {
        info.os = 'Mac OS X';
    } else if (/Linux/i.test(ua)) {
        info.os = 'Linux';
    } else if (/Android/i.test(ua)) {
        info.os = 'Android';
    } else if (/iOS|iPhone|iPad/i.test(ua)) {
        info.os = 'iOS';
    }

    // 디바이스 감지
    if (/Mobile|Android|iPhone|iPod/i.test(ua)) {
        if (/iPad|Tablet/i.test(ua)) {
            info.device = 'Tablet';
        } else {
            info.device = 'Mobile';
        }
    }

    return info;
}

// IP 주소 추출
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           '0.0.0.0';
}

// API: 방문 추적
app.post('/api/track', (req, res) => {
    try {
        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const referer = req.headers['referer'] || req.headers['referrer'] || '';
        const { page_path, query_string, session_id } = req.body;

        const userAgentInfo = parseUserAgent(userAgent);

        // 방문 기록 저장
        const stmt = db.prepare(`
            INSERT INTO visitor_logs (
                ip_address, page_path, query_string, referer, user_agent,
                session_id, browser, os, device
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            ip,
            page_path || '/',
            query_string || '',
            referer,
            userAgent,
            session_id || '',
            userAgentInfo.browser,
            userAgentInfo.os,
            userAgentInfo.device
        );

        // 페이지 통계 업데이트
        const updatePage = db.prepare(`
            INSERT INTO page_statistics (page_path, total_visits, unique_visitors, last_visit)
            VALUES (?, 1, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(page_path) DO UPDATE SET
                total_visits = total_visits + 1,
                last_visit = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        `);
        updatePage.run(page_path || '/');

        // 일별 통계 업데이트
        const today = new Date().toISOString().split('T')[0];
        const updateDaily = db.prepare(`
            INSERT INTO daily_statistics (stat_date, total_visits, unique_visitors, unique_ips)
            VALUES (?, 1, 1, 1)
            ON CONFLICT(stat_date) DO UPDATE SET
                total_visits = total_visits + 1
        `);
        updateDaily.run(today);

        res.json({ success: true, message: 'Visit tracked successfully' });
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: 통계 조회
app.get('/api/stats', (req, res) => {
    try {
        const stats = {};

        // 총 방문 횟수
        stats.total_visits = db.prepare('SELECT COUNT(*) as count FROM visitor_logs').get().count;

        // 고유 방문자 (IP 기준)
        stats.unique_ips = db.prepare('SELECT COUNT(DISTINCT ip_address) as count FROM visitor_logs').get().count;

        // 오늘 방문
        stats.today_visits = db.prepare(`
            SELECT COUNT(*) as count FROM visitor_logs
            WHERE DATE(visit_timestamp) = DATE('now')
        `).get().count;

        // 이번 주 방문
        stats.this_week_visits = db.prepare(`
            SELECT COUNT(*) as count FROM visitor_logs
            WHERE strftime('%Y-%W', visit_timestamp) = strftime('%Y-%W', 'now')
        `).get().count;

        // 인기 페이지
        stats.top_pages = db.prepare(`
            SELECT page_path, COUNT(*) as visits
            FROM visitor_logs
            GROUP BY page_path
            ORDER BY visits DESC
            LIMIT 10
        `).all();

        // 브라우저 통계
        stats.browser_stats = db.prepare(`
            SELECT browser, COUNT(*) as count
            FROM visitor_logs
            GROUP BY browser
            ORDER BY count DESC
        `).all();

        // OS 통계
        stats.os_stats = db.prepare(`
            SELECT os, COUNT(*) as count
            FROM visitor_logs
            GROUP BY os
            ORDER BY count DESC
        `).all();

        // 디바이스 통계
        stats.device_stats = db.prepare(`
            SELECT device, COUNT(*) as count
            FROM visitor_logs
            GROUP BY device
            ORDER BY count DESC
        `).all();

        // 최근 방문 기록
        stats.recent_visits = db.prepare(`
            SELECT ip_address, page_path, visit_timestamp, browser, os, device, referer
            FROM visitor_logs
            ORDER BY visit_timestamp DESC
            LIMIT 50
        `).all();

        // 일별 통계 (최근 30일)
        stats.daily_chart = db.prepare(`
            SELECT DATE(visit_timestamp) as date, COUNT(*) as visits, COUNT(DISTINCT ip_address) as unique_ips
            FROM visitor_logs
            WHERE visit_timestamp >= DATE('now', '-30 days')
            GROUP BY DATE(visit_timestamp)
            ORDER BY date ASC
        `).all();

        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 루트 페이지 - 대시보드로 리다이렉트
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 방문자 추적 시스템 서버가 시작되었습니다!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log(`📊 대시보드: http://localhost:${PORT}`);
    console.log(`📡 추적 API: http://localhost:${PORT}/api/track`);
    console.log(`📈 통계 API: http://localhost:${PORT}/api/stats`);
    console.log('');
    console.log('💡 종료하려면 Ctrl+C를 누르세요');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
});
