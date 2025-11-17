/**
 * 방문자 추적 스크립트
 * 다른 웹페이지에 포함시켜 사용하세요
 */

(function() {
    'use strict';

    const TRACKING_SERVER = 'http://localhost:3000';

    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function getSessionId() {
        let sessionId = localStorage.getItem('visitor_session_id');
        if (!sessionId) {
            sessionId = generateSessionId();
            localStorage.setItem('visitor_session_id', sessionId);
        }
        return sessionId;
    }

    function trackVisit() {
        const sessionId = getSessionId();

        fetch(TRACKING_SERVER + '/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page_path: window.location.pathname,
                query_string: window.location.search,
                session_id: sessionId
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('✅ 방문자 추적:', data);
        })
        .catch(error => {
            console.error('❌ 추적 오류:', error);
        });
    }

    // 페이지 로드 완료 시 자동 추적
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackVisit);
    } else {
        trackVisit();
    }

    // 공개 API
    window.VisitorTracker = {
        track: trackVisit,
        trackEvent: function(eventName, eventData) {
            console.log('이벤트 추적:', eventName, eventData);
            // 필요시 이벤트 추적 기능 추가
        }
    };

})();
