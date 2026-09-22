# 물 섭취량 트래커 (Water Intake Tracker)

설치 없이 브라우저에서 바로 쓸 수 있는 물 섭취량 기록 웹앱입니다.

## 기능

- 원형 그래프로 오늘 목표 대비 섭취량 확인
- 100 / 200 / 350 / 500ml 빠른 추가 버튼 + 직접 입력
- 일일 목표(ml) 설정
- 오늘의 기록 목록 (시간별, 개별 삭제 가능)
- 최근 7일간 섭취량 막대그래프
- 데이터는 브라우저 `localStorage`에 저장되어 새로고침해도 유지됩니다

## 사용 방법

별도 설치나 빌드 과정 없이 `index.html`을 브라우저로 열면 바로 사용할 수 있습니다.

```bash
cd water-tracker
python3 -m http.server 8080
# 이후 브라우저에서 http://localhost:8080 접속
```

또는 `index.html` 파일을 더블클릭해서 바로 열어도 됩니다.

## 파일 구성

- `index.html` — 페이지 구조
- `style.css` — 스타일
- `script.js` — 기록 저장/조회 로직 (localStorage 기반)
