# 둘의 여행 앨범

GitHub Pages로 보여 주고, 여행 기록과 사진은 Supabase(비공개)에 저장하는 커플 여행 사진첩이에요.

## 파일

| 파일 | 하는 일 |
| --- | --- |
| `index.html` | 화면 전체 (홈 · 여행지도 · 사진첩) |
| `korea-geo.js` | 시·도 / 시·군·구 지도 데이터 (2026년 10월 1일 행정동 경계를 시·군·구로 합침. 출처: [vuski/admdongkor](https://github.com/vuski/admdongkor) ver20261001) |
| `world-geo.js` | 해외 탭 세계 지도 (나라 경계, 로빈슨 투영·경도 150° 중심. 출처: [Natural Earth](https://www.naturalearthdata.com/) 1:50m, 퍼블릭 도메인) |
| `backend.js` | Supabase 연결 (문서 저장 · 사진 업로드 · 로그인) |
| `config.js` | Supabase 주소와 anon 키 |
| `supabase-setup.sql` | Supabase에 표 · 사진 버킷 · 접근 규칙을 만드는 SQL |

## Supabase 준비 (한 번만)

1. https://supabase.com 에서 새 프로젝트를 만들어요.
2. **Authentication → Sign In / Providers**에서 *Allow new users to sign up*을 꺼요.
3. **Authentication → Users → Add user**로 두 사람 계정(이메일 + 비밀번호)을 만들어요. *Auto Confirm User*를 켜 주세요.
4. `supabase-setup.sql` 맨 아래 이메일 두 개를 바꾸고, **SQL Editor**에 붙여 넣어 Run 해요.
5. **Project Settings → API**의 Project URL과 anon public 키를 `config.js`에 넣어요.
6. **Authentication → URL Configuration**의 Site URL을 GitHub Pages 주소로 바꿔요.

## 로컬에서 보기

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

브라우저에서 http://localhost:8000 을 열어요. (`index.html`을 더블클릭해서 열면 지도 데이터가 안 불러와질 수 있어요.)

## 보안 메모

- 사진 버킷은 비공개라, 로그인한 멤버만 7일짜리 서명 주소로 볼 수 있어요.
- `config.js`의 anon 키는 공개돼도 괜찮아요. 접근은 `members` 표와 RLS가 막아요. **service_role 키는 절대 넣지 마세요.**
