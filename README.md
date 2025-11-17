# 방문자 추적 시스템 서버

Node.js + Express + SQLite 기반의 초간단 방문자 추적 시스템입니다.

## ✨ 특징

- **초간단 설치**: `npm install` → `npm run dev` 끝!
- **외부 DB 불필요**: SQLite 내장으로 MySQL/MariaDB 설치 필요 없음
- **자동 설정**: 데이터베이스와 테이블이 자동으로 생성됨
- **실시간 대시보드**: 브라우저에서 실시간 통계 확인
- **완전 독립**: 다른 시스템과 완전히 분리되어 작동

## 🚀 설치 및 실행

### 1단계: 패키지 설치

```bash
cd visitor_tracker_server
npm install
```

### 2단계: 서버 실행

```bash
npm run dev
```

### 3단계: 브라우저에서 확인

서버가 시작되면 자동으로 주소가 표시됩니다:

```
📊 대시보드: http://localhost:3000
📡 추적 API: http://localhost:3000/api/track
📈 통계 API: http://localhost:3000/api/stats
```

## 📖 사용 방법

### 대시보드 접속

브라우저에서 다음 주소로 접속:
```
http://localhost:3000
```

실시간 통계를 확인할 수 있습니다!

### 테스트 페이지

방문자 추적을 테스트하려면:
```
http://localhost:3000/test.html
```

이 페이지를 방문하면 자동으로 방문이 기록됩니다.

### 다른 웹페이지에 추적 코드 추가

다른 HTML 페이지에서 방문자를 추적하려면 `</body>` 태그 직전에 추가:

```html
<script src="http://localhost:3000/tracker.js"></script>
```

## 📊 수집되는 정보

- ✅ IP 주소
- ✅ 페이지 경로
- ✅ 방문 시간
- ✅ 브라우저 (Chrome, Firefox, Safari 등)
- ✅ 운영체제 (Windows, Mac, Linux, Android, iOS)
- ✅ 디바이스 타입 (Desktop, Mobile, Tablet)
- ✅ 유입 경로 (Referer)
- ✅ 세션 ID

## 📁 파일 구조

```
visitor_tracker_server/
├── server.js              # Express 서버 (메인)
├── package.json           # npm 설정
├── database/              # SQLite 데이터베이스 (자동 생성)
│   └── visitors.db        # 방문자 데이터 저장
└── public/                # 정적 파일
    ├── dashboard.html     # 대시보드 UI
    ├── test.html          # 테스트 페이지
    └── tracker.js         # 추적 스크립트
```

## 🔧 API 엔드포인트

### POST /api/track
방문자 추적 API

**요청 예시:**
```javascript
fetch('http://localhost:3000/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        page_path: '/about',
        query_string: '?utm_source=google',
        session_id: 'session_123'
    })
})
```

**응답:**
```json
{
    "success": true,
    "message": "Visit tracked successfully"
}
```

### GET /api/stats
통계 조회 API

**응답:**
```json
{
    "total_visits": 150,
    "unique_ips": 45,
    "today_visits": 23,
    "this_week_visits": 87,
    "top_pages": [...],
    "browser_stats": [...],
    "os_stats": [...],
    "device_stats": [...],
    "recent_visits": [...]
}
```

## 🛠️ 커스터마이징

### 포트 변경

`server.js` 파일에서 포트 변경:

```javascript
const PORT = 3000;  // 원하는 포트로 변경
```

### 자동 새로고침 간격 변경

`dashboard.html` 파일 하단:

```javascript
// 30초마다 자동 새로고침
setInterval(loadStats, 30000);  // 밀리초 단위
```

## 📊 대시보드 기능

대시보드에서 다음 정보를 확인할 수 있습니다:

1. **기본 통계**
   - 총 방문 횟수
   - 고유 방문자 수 (IP 기준)
   - 오늘 방문
   - 이번 주 방문

2. **브라우저/OS/디바이스 통계**
   - 시각화된 차트로 표시
   - 각 항목별 방문 횟수

3. **인기 페이지 TOP 10**
   - 가장 많이 방문한 페이지 순위

4. **최근 방문 기록 (최근 50개)**
   - 시간, IP, 페이지, 브라우저, OS, 디바이스 정보

## 🔄 데이터베이스 관리

### 데이터베이스 위치
```
visitor_tracker_server/database/visitors.db
```

### 데이터베이스 백업
```bash
# 백업 생성
cp database/visitors.db database/visitors_backup.db
```

### 데이터베이스 초기화 (모든 데이터 삭제)
```bash
# 서버 종료 후
rm database/visitors.db

# 서버 재시작 시 자동으로 새로운 DB 생성
npm run dev
```

## 🐛 문제 해결

### 문제: "Cannot find module 'express'" 에러

**해결책:**
```bash
npm install
```

### 문제: 포트가 이미 사용 중

**해결책:**
`server.js`에서 포트 번호를 변경하거나 다른 프로세스 종료

### 문제: CORS 에러

이미 CORS가 활성화되어 있습니다. 추가 설정이 필요한 경우 `server.js`에서:

```javascript
app.use(cors({
    origin: 'http://your-domain.com'  // 특정 도메인만 허용
}));
```

## 💡 활용 예시

### 예시 1: React 앱에 통합

```javascript
// React 컴포넌트에서
useEffect(() => {
    fetch('http://localhost:3000/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            page_path: window.location.pathname,
            session_id: sessionStorage.getItem('sessionId')
        })
    });
}, []);
```

### 예시 2: 정적 HTML 페이지

```html
<!DOCTYPE html>
<html>
<head>
    <title>내 웹사이트</title>
</head>
<body>
    <h1>환영합니다!</h1>

    <!-- 방문자 추적 스크립트 -->
    <script src="http://localhost:3000/tracker.js"></script>
</body>
</html>
```

## 🔒 보안 권장사항

1. **프로덕션 환경**: 실제 서비스에서는 HTTPS 사용
2. **인증 추가**: 대시보드에 로그인 기능 추가 고려
3. **Rate Limiting**: API 남용 방지를 위한 속도 제한 추가
4. **데이터 보호**: IP 주소 등 개인정보 수집 시 개인정보 처리방침 명시

## 📝 라이센스

MIT License

## 🆘 지원

문제가 발생하면:
1. 서버 콘솔에서 에러 메시지 확인
2. 브라우저 개발자 도구(F12)에서 네트워크 탭 확인
3. `database/` 폴더 권한 확인

---

**즐거운 추적되세요! 📊**
