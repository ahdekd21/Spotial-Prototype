# Spotial 팀 개발 가이드

아이폰 16 Pro의 Safari에서, 사용자가 현재 맥락에 맞는 카드를 발견하고 저장 당시의 화면까지 찾아가는 과정을 시연한다. 세 사람은 같은 웹앱을 개발한다. 현재 진입점은 카드 인터랙션 연습본이며, 아래의 역할과 화면 흐름은 이번 구현의 기준이다. [Figma · Entry Contexts](https://www.figma.com/design/eCbrUgqMU4ytwqAss4DzKz/?node-id=7448-1916)

## 처음 시작하기

GitHub 저장소의 **Code → HTTPS**에서 주소를 복사한다. 아래 예시는 성원 기준이다. 저장소 주소와 브랜치 이름을 본인 값으로 바꾼다. Node.js 22.12 이상을 사용한다.

```sh
git clone <저장소-HTTPS-주소> spotial
cd spotial
git switch team/seongwon
npm ci
npm run dev
```

터미널의 Local 주소로 실행한다. 현재 연습본은 주소 뒤에 `?mobile=1`을 붙이면 카드만 볼 수 있다. 같은 Wi-Fi의 아이폰에서는 터미널의 Network 주소로 화면을 확인한다. 마이크를 포함한 실기기 검수는 HTTPS 미리보기 주소에서 진행한다.

## 누가 무엇을 만드는가

| 담당 / 브랜치 | 담당 파일과 기능 | 첫 PR에서 보여줄 결과 |
| --- | --- | --- |
| 성원 · `team/seongwon` | `src/main.jsx`, `src/card/`, 앱 공통 스타일. 진입·Feed·Summary, 맥락 표시 토글, 제스처, 화면 간 상태와 최종 통합 | A 진입 → Feed → Summary → 스크롤로 접힌 Feed. 선택한 카드와 스크롤 위치가 이어진다. |
| 정헌 · `team/jeongheon` | 신규 `src/vibe/`. 바이브토크 UI, 실시간 전사, 강조할 단어 추출, 유한한 후보 중 카드 선택 | 예시 질문을 자기 말로 바꾼 두 발화가 같은 카드에 도달한다. 모호한 발화는 재질문하고 취소하면 원래 피드가 보인다. |
| 예주 · `team/yeju` | 신규 `src/data/`, `src/detail/`, `public/scenarios/`. A·B·C 데이터, Full, Source View, 앱 스크린샷, Summary CTA 목적지 | 한 카드의 청크를 세로·가로로 탐색하고 저장 화면 → 앱 화면까지 이동한다. |

성원이 앱 진입점과 세 모듈의 연결을 맡는다. 예주는 데이터를 공급하고 정헌은 이를 읽어 선택 결과를 돌려준다. 기존 `src/card/cardData.js`는 연습본의 렌더링 예시다. 새 시나리오 데이터의 원본은 `src/data/` 한 곳에 둔다.

## 세 브랜치가 맞출 데이터와 동작

| 단위 | 주고받을 값 | 용도 |
| --- | --- | --- |
| 시나리오 | `id`, `context`(출발 앱·장소·시각·목적), 순서가 있는 `cardIds` | 첫 ID가 중앙 카드다. A와 B는 피자 카드를 공유하고 도착 여부·거리 문구는 맥락에 따라 표시한다. |
| 카드 | `id`, `title`, `summary`, `tags`, 순서가 있는 `chunkIds`, `cta`(표시 문구·대상 이미지) | Feed, Summary, Full이 같은 카드 ID를 사용한다. |
| 청크 | `id`, `app`, `previewImage`, `savedScreen`, `appScreen` | Full에서는 같은 앱의 청크를 가로 스택으로 묶는다. 청크를 누르면 저장 시점 이미지, 한 번 더 누르면 앱 이미지를 연다. |
| 발화 결과 | `matchUtterance({ transcript, context, candidates })` → `{ status, cardId, keywords }` | 정헌이 구현한다. 성공은 `matched`, 불확실하면 `clarify`와 `cardId: null`을 반환한다. `keywords`는 화면에서 강조할 발화 원문의 부분 문자열이다. |

예주가 준비할 첫 카드 ID는 `jordan-pizza`, `harbour-eats`, `harbour-sunset`이다. A는 Reminders에서 피자로 시작해 발화 후 물가 식당으로 바뀐다. B는 Maps에서 근처 피자집과 길찾기로, C는 Camera에서 일몰 촬영 장소와 구도 레퍼런스로 이어진다. 피드 아래의 대안은 해당 시나리오에서 의미가 있는 저장 자료로 구성한다.

성원은 정헌의 `VibeTalk({ context, candidates, onMatch, onCancel })`와 예주의 `SpotlightFull({ card, chunks, onSelectChunk })`, `SourceView({ chunk, onOpenApp })`를 연결한다. `onMatch`는 위의 성공 결과, `onSelectChunk`는 청크 ID, `onOpenApp`은 앱 이미지 경로를 전달한다. 성공 시 선택한 카드를 피드 맨 앞으로 옮기고 인식한 단서로 맥락칩·텍스트를 함께 갱신한다. Summary의 아웃링크 CTA도 같은 앱 이미지 뷰를 사용한다.

## 바이브토크와 저장 범위

- 1차 버전은 브라우저에서 시나리오·카드·청크 파일을 읽고 현재 선택과 발화는 세션 메모리에 둔다. 영구 DB와 생성형 AI API는 1차 의존성에서 제외한다.
- 예시 질문은 방향을 알려준다. 예를 들어 “지난주 유튜브에서 본 물가 식당”과 “영상에 나온 바닷가 밥집 어디였지?”는 모두 `harbour-eats`로 연결한다. 정헌은 장소·출처·목적의 동의어와 현재 맥락으로 후보를 비교한다. 후보가 비거나 동점이거나 단서가 부족하면 기존 카드를 유지하고 구분에 필요한 단서를 묻는다.
- 실시간 전사와 카드 매칭을 분리한다. 첫날 아이폰에서 마이크 허용·거부, 중간 전사, 발화 종료를 검증한다. 음성을 쓸 수 없으면 같은 질문을 텍스트로 입력해 같은 매칭 경로를 이용한다. 실기기에서 중간 전사가 불안정하면 음성 인식 서비스 도입 여부를 별도로 결정한다.
- 확장 시 예주가 청크와 카드 조합을 추가하고 정헌이 기존·신규 발화 예시로 재검증한다. 자유 발화가 늘 때마다 카드를 추가할 필요는 없다.

## 구현과 머지 순서

1. **공통 기준 확정** — 위 ID와 콜백을 기준으로 시작한다. 성원은 샘플 데이터로 화면 이동을, 정헌은 발화 문자열로 매칭을, 예주는 A 카드 한 장으로 상세 화면을 병렬 개발한다.
2. **A 한 경로 연결** — 예주의 A 데이터 PR부터 머지한다. 성원의 Feed·Summary, 정헌의 바이브토크, 예주의 Full·Source View는 독립적으로 빌드되는 단위로 머지한다. 성원이 최신 `main`에서 연결해 A를 처음부터 끝까지 확인한다.
3. **B·C 확장 및 실기기 검수** — 같은 컴포넌트에 B·C 데이터를 넣는다. 아이폰에서 핸들 당기기·핀치로 두 단계 확장, Summary에서 스크롤로 Feed 복귀, Full의 세로 탐색과 가로 스택, 두 경로의 앱 이미지 열기를 확인한다. A에서는 자유 발화 성공·불확실·취소도 각각 확인한다.

## 매일 작업하고 PR 올리기

개인 브랜치에서 작업을 시작하기 전에 최신 원격 변경을 반영한다. 아래는 성원의 예시다.

```sh
git switch team/seongwon
git fetch origin
git merge origin/team/seongwon
git merge origin/main
```

작업 후에는 변경 목록을 확인하고 본인 기능에 해당하는 파일만 스테이징한다.

```sh
npm run build
git status --short
git add <이번에-변경한-파일이나-폴더>
git diff --cached --stat
git commit -m "Feed에서 Summary로 확장하는 제스처 구현"
git push -u origin team/seongwon
```

GitHub에서 **base를 `main`**, **compare를 본인 브랜치**로 PR을 연다. 본문에 바뀐 사용자 동작, 재현 순서, 빌드 결과, 아이폰 검수 여부를 적는다. 다른 팀원 한 명이 재현하고 검토한 뒤 **Create a merge commit**으로 합친다. 개인 브랜치는 다음 작업에도 사용한다. 머지 후 위 동기화 절차를 다시 실행한다.

바이브코딩을 시작할 때는 에이전트에게 “README에서 내 담당은 정헌이다. 현재 브랜치를 확인하고 이번 PR에서는 발화 매칭과 재질문만 구현해 줘. 성공 예시 두 개와 불확실한 예시 한 개로 확인해 줘”처럼 **담당자·이번 변경·검증 기준**을 함께 전달한다. 공통 ID나 콜백을 바꿔야 하면 이를 사용하는 팀원과 먼저 맞추고 같은 PR에서 이 문서를 갱신한다.
