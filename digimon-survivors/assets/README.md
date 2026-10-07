# 스프라이트

모든 이미지는 `../tools/gen_sprites.py`로 생성한 오리지널 도트 그림입니다.
같은 파일명으로 다른 PNG를 덮어쓰면 게임에 그대로 적용되고, 파일을 지우면 색깔 원 + 이모지로 대체 표시됩니다.
(정사각형, 배경 투명, 그림이 가운데 오도록 넣어주세요. 플레이어 이미지는 왼쪽을 바라보게 그리면 이동 방향에 맞춰 뒤집힙니다.)

## 플레이어 진화 계열

| 단계 | 몽실이 계열 (균형) | 삐약이 계열 (날쌘) | 뭉치 계열 (튼튼) | 냥콩이 계열 (마법) | 퐁당이 계열 (친구) |
| --- | --- | --- | --- | --- | --- |
| 1단계 (Lv.1) | `mongsil` 몽실이 | `piyak` 삐약이 | `mungchi` 뭉치 | `nyangkong` 냥콩이 | `pongdang` 퐁당이 |
| 2단계 (Lv.4) | `kkomul` 꼬물룡 | `jjaek` 짹짹이 | `meongmung` 멍뭉이 | `nyangnyang` 냥냥이 | `cheombeong` 첨벙이 |
| 3단계 A (Lv.8) | `hwareu` 화르룡 | `jjirit` 찌릿새 | `seori` 서리늑대 | `dalbit` 달빛냥 | `pado` 파도물범 |
| 4단계 A (Lv.13) | `taeyang` 태양룡 | `beongae` 번개왕새 | `nunbora` 눈보라늑대 | `eunha` 은하냥 | `haeil` 해일물범 |
| 3단계 B (Lv.8) | `ipsae` 잎새룡 | `sallang` 살랑새 | `bawi` 바위곰 | `satang` 사탕냥 | `sanho` 산호물범 |
| 4단계 B (Lv.13) | `kkotip` 꽃잎룡 | `hoeori` 회오리새 | `sanmaek` 산맥곰 | `chukje` 축제냥 | `jinju` 진주물범 |
| ★ 비밀 (Lv.13) | `mujigae` 무지개룡 | `byeolttong` 별똥새 | `hwanggeum` 황금곰 | `kkum` 꿈냥 | `badayojeong` 바다요정 |

(파일명 뒤에 `.png`가 붙어요.)

## 적

| 파일 | 이름 |
| --- | --- |
| `slime.png` | 말랑이 (처음부터) |
| `mushroom.png` | 버섯돌이 (0:35부터) |
| `bee.png` | 꼬마벌 (1:15부터, 지그재그로 빠르게) |
| `turtle.png` | 돌거북 (2:30부터, 느리고 단단함) |
| `ghost.png` | 둥실유령 (3:30부터, 둥실둥실 반투명) |
| `jelly.png` | 말랑젤리 (2:00부터, 쓰러지면 꼬마젤리 둘로 쪼개짐) |
| `snowman.png` | 꼬마눈사람 (4:30부터) |
| `bat.png` / `kingshroom.png` / `cloudking.png` | 보스 박쥐대장 / 버섯대왕 / 먹구름대왕 (1:00부터 1분마다 돌아가며) |

## 무기 · 아이템

| 파일 | 용도 |
| --- | --- |
| `bubble.png` / `fireball.png` / `leaf.png` | 방울탄 / 불꽃탄 / 잎새탄 |
| `feather.png` | 깃털 부메랑 |
| `fairy.png` / `shell.png` | 방울 요정 / 폭죽 |
| `star.png` | 별빛 수호 |
| `gem.png` / `gem_big.png` | 경험치 (일반 / 보스) |
| `heart.png` / `candy.png` | HP 회복 (25 / 60) |
| `magnet.png` | 화면의 경험치 보석을 전부 끌어옴 |
| `bomb.png` | 화면의 적을 한 번에 정리 |
| `chest.png` | 보물상자 (보스 드롭, 무료 업그레이드 1개) |

번개, 서리 오라, 충격파, 별빛 빔, 가시 덩굴은 이미지 없이 화면에 직접 그립니다.
