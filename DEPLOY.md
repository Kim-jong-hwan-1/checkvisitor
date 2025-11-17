# 🚀 추적 서버 배포 가이드 (Render)

Render에 무료로 배포하여 Vercel에 배포된 front와 연동하는 방법입니다.

## 📋 준비물

- GitHub 계정 (코드 업로드용)
- Render 계정 (무료) - https://render.com

## 1단계: GitHub에 코드 업로드

### 1-1. 깃허브 저장소 생성

1. https://github.com 접속
2. "New repository" 클릭
3. 저장소 이름: `visitor-tracker-server`
4. Public 또는 Private 선택
5. "Create repository" 클릭

### 1-2. 코드 푸시

```bash
cd visitor_tracker_server

# Git 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: visitor tracker server"

# 원격 저장소 연결 (YOUR_USERNAME을 본인 깃허브 아이디로 변경)
git remote add origin https://github.com/YOUR_USERNAME/visitor-tracker-server.git

# 푸시
git branch -M main
git push -u origin main
```

## 2단계: Render에 배포

### 2-1. Render 계정 생성

1. https://render.com 접속
2. "Get Started for Free" 클릭
3. GitHub 계정으로 로그인

### 2-2. 새 Web Service 생성

1. Render 대시보드에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub 저장소 연결
4. 방금 만든 `visitor-tracker-server` 저장소 선택
5. "Connect" 클릭

### 2-3. 배포 설정

다음 설정을 입력하세요:

**Name**: `visitor-tracker-server` (원하는 이름)

**Region**: `Singapore` (한국과 가장 가까움)

**Branch**: `main`

**Root Directory**: (비워두기)

**Runtime**: `Node`

**Build Command**:
```
npm install
```

**Start Command**:
```
npm start
```

**Instance Type**: `Free` (무료)

### 2-4. 환경 변수 설정 (선택사항)

"Advanced" 섹션에서:
- **Environment Variables** (필요시 추가)

### 2-5. 배포 시작

1. "Create Web Service" 클릭
2. 배포가 시작됩니다 (5-10분 소요)
3. 완료되면 URL이 생성됩니다
   - 예: `https://visitor-tracker-server.onrender.com`

## 3단계: Front 프로젝트에 환경 변수 설정

### 3-1. Vercel 환경 변수 추가

1. Vercel 대시보드 접속: https://vercel.com
2. front 프로젝트 선택
3. "Settings" → "Environment Variables" 클릭
4. 새 환경 변수 추가:

**Name**:
```
NEXT_PUBLIC_TRACKING_SERVER
```

**Value**: (Render에서 생성된 URL 입력)
```
https://visitor-tracker-server.onrender.com
```

**Environment**: `Production`, `Preview`, `Development` 모두 체크

5. "Save" 클릭

### 3-2. Vercel 재배포

1. Vercel 대시보드에서 "Deployments" 탭
2. 최신 배포 옆의 "..." 메뉴 클릭
3. "Redeploy" 클릭
4. 재배포 완료 대기 (1-2분)

## 4단계: 테스트

### 4-1. 추적 서버 대시보드 접속

브라우저에서:
```
https://visitor-tracker-server.onrender.com
```

대시보드가 보이면 성공!

### 4-2. Front 웹사이트 방문

Vercel에 배포된 사이트 방문:
```
https://your-site.vercel.app
```

### 4-3. 통계 확인

추적 서버 대시보드를 새로고침하면 방문 기록이 표시됩니다!

## 🔧 로컬 개발 환경 설정

로컬에서 테스트할 때:

### Front 프로젝트에 .env.local 파일 생성

```bash
cd front
```

`.env.local` 파일 생성:
```env
NEXT_PUBLIC_TRACKING_SERVER=http://localhost:3000
```

이제 로컬 개발 시:
1. 추적 서버: `cd visitor_tracker_server && npm run dev`
2. Front 서버: `cd front && npm run dev`

## 📊 배포 완료 체크리스트

- [ ] GitHub 저장소 생성 완료
- [ ] 코드 푸시 완료
- [ ] Render에 배포 완료
- [ ] Render URL 확인 (예: https://visitor-tracker-server.onrender.com)
- [ ] Vercel 환경 변수 추가 완료
- [ ] Vercel 재배포 완료
- [ ] 대시보드 접속 테스트
- [ ] Front 사이트 방문 테스트
- [ ] 방문 기록 확인 완료

## 🐛 문제 해결

### 문제: Render 배포 실패

**해결책:**
1. Render 로그 확인
2. `package.json`의 `engines.node` 버전 확인
3. `npm install`이 성공하는지 확인

### 문제: CORS 에러

**해결책:**
`server.js`에 이미 CORS가 활성화되어 있습니다. 추가 설정이 필요하면:

```javascript
app.use(cors({
    origin: ['https://your-site.vercel.app', 'http://localhost:3001'],
    credentials: true
}));
```

### 문제: 데이터가 수집되지 않음

**해결책:**
1. 브라우저 콘솔(F12) 확인
2. Network 탭에서 `/api/track` 요청 확인
3. Vercel 환경 변수가 올바른지 확인
4. Render 서버 로그 확인

## 💡 무료 플랜 제한사항

**Render Free Tier:**
- 15분 동안 요청이 없으면 서버가 sleep 모드로 전환
- Sleep 후 첫 요청은 느림 (30초-1분)
- 월 750시간 무료 실행 시간

**해결책:**
- UptimeRobot 같은 서비스로 5분마다 핑 보내기
- 또는 유료 플랜 사용 ($7/월)

## 🎉 완료!

이제 배포된 사이트에서 방문자가 추적됩니다!

대시보드: `https://visitor-tracker-server.onrender.com`
