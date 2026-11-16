# Spotial 카드 컴포넌트

Figma `7230:2010`의 시드니 카드로 구성한 인터랙션 검토 버전입니다.
제안 → 요약 카드 확장까지 구현합니다. Gen UI, Raw Data, 원출처 이동은 이번 범위에 포함하지 않습니다.

## 교체할 데이터

`cardData.js`의 `cards`에서 타이틀, 맥락칩, 이미지 4개, 요약, 펼침 내용을 수정합니다.
현재 세 카드는 스택 인터랙션 확인을 위해 동일한 내용을 사용합니다.
`titleAsset`은 Figma의 정확한 글자 형태를 보존한 SVG입니다. 다른 제목을 입력할 때는 이 속성을 제거하면 실제 텍스트를 표시합니다.

## 역할

- `CardContent.jsx`: 타이틀 / 맥락칩 / 이미지 블럭 / 요약설명 / 펼침 블럭
- `SpotialCard.jsx`: 카드 표면과 구성요소 생성 전환
- `CardSkeleton.jsx`: 800ms 로딩 뒤 220ms 페이드아웃, 종료 시 DOM 제거
- `CardAtmosphere.jsx`: Paper MeshGradient. 활성 카드만 GPU 렌더링, 숨긴 탭과 모션 감소 설정에서는 정지
- `CardHandles.jsx`: SVG 외곽 경로를 따라 이동하는 핸들, 포인터 캡처와 취소 복귀
- `CardDeck.jsx`: 스와이프 / 휠 / 방향키 입력, 속도 기반 스냅, 이동 중 핸들 숨김
- `card.css`: Figma 좌표 기준 레이아웃과 반응형 미리보기

타이틀·칩·이미지는 하나의 DOM 요소를 유지하고 동일한 MotionValue로 위치·크기를 보간합니다.
카드 높이는 406 → 610px, 스프링은 stiffness 250 / damping 30 / mass 0.9입니다.
핸들 등장 시간은 650ms, 생성된 내용의 등장 시간은 340ms이며 35ms 간격으로 순차 등장합니다.

## 검토

`npm run dev` 실행 후 루트 화면에서 생성 반복 / 펼침 / 이전·다음 버튼으로 검토합니다.
`?mobile=1`은 검토 패널 없는 모바일 화면입니다. 카드 본문을 위아래로 밀고 모서리 핸들을 대각선 바깥으로 당깁니다.
펼친 상태에서는 핸들을 안쪽으로 당기거나 왼쪽 아래 접기 버튼을 누릅니다.

브라우저에서 생성, 위·아래 핸들 확장/접기, 드래그와 휠의 2·3번째 카드 정착을 확인했습니다.
S24 실제 기기에서의 GPU 프레임률, 발열 및 터치 감도는 별도 검토가 필요합니다.

## 오픈소스

- Motion (MIT): https://motion.dev/docs/react-animation
- Paper Shaders (Apache-2.0): https://github.com/paper-design/shaders

실제 이미지와 도형은 Figma에서 추출해 `public/assets`에 저장했습니다.
