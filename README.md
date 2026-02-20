# 📍 카카오 주소 검색 Airtable Extension

카카오 우편번호 서비스를 활용해 Airtable 레코드에 **도로명 주소, 지번 주소, 우편번호, 건물명**을 자동으로 채워주는 커스텀 익스텐션입니다.

---

## ✨ 주요 기능

- 🔍 카카오 우편번호 위젯으로 주소 검색
- 🏠 도로명 주소 / 지번 주소 동시 저장
- 📮 우편번호 자동 입력
- 🏢 건물명 자동 입력
- ⚙️ 설정 패널에서 테이블명 변경 가능 (GlobalConfig 저장)

---

## 📋 필수 조건

### Airtable 테이블 필드

아래 필드가 **Single line text** 타입으로 존재해야 합니다.

| 필드명 | 타입 |
|--------|------|
| 건물명 | Single line text |
| 도로명 주소 | Single line text |
| 지번 주소 | Single line text |
| 우편번호 | Single line text |

---

## 🚀 사용 방법

### 1. 설치된 Extension 사용법

1. Airtable **Grid View**에서 주소를 입력할 **행(Row)을 클릭**합니다.
2. 익스텐션 패널에서 **🔍 주소 검색 (클릭)** 버튼을 누릅니다.
3. 카카오 주소 검색창에서 주소를 검색하고 선택합니다.
4. **도로명 주소 / 지번 주소 / 우편번호 / 건물명**이 자동으로 입력됩니다.

### 2. 테이블 이름 변경

1. 우측 상단 **⚙️ 설정** 버튼 클릭
2. 테이블 이름 수정 후 **저장**

---

## 🛠️ 새 베이스에 직접 설치하기

### 사전 요구사항

- [Node.js](https://nodejs.org/) 설치
- [Git](https://git-scm.com/) 설치
- Airtable 계정

### 설치 단계

```bash
# 1. 소스코드 다운로드
git clone https://github.com/wkace01/kakao-address-airtable-extension.git
cd kakao-address-airtable-extension

# 2. 패키지 설치
npm install
```

### Airtable에서 새 Extension 등록

1. 설치할 Airtable 베이스 열기
2. **Add an extension** → **Build a custom extension** 클릭
3. 안내에 따라 새 Extension 생성 (새 Block ID 발급됨)
4. 생성 완료 후 아래 명령어로 배포:

```bash
npx block release
```

---

## 🔧 개발 환경 실행

```bash
npx block run
```

로컬 개발 서버가 실행됩니다. Airtable Extension에서 개발 URL을 연결하여 실시간 수정이 가능합니다.

---

## 📦 기술 스택

- [Airtable Blocks SDK](https://airtable.com/developers/extensions) v1.18.2
- React 16
- [카카오 우편번호 서비스](https://postcode.map.daum.net/guide)

---

## 📄 라이선스

MIT License
