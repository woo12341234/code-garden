# 스프라이트

모든 이미지는 `../tools/gen_sprites.py`로 생성한 오리지널 도트 그림입니다.
같은 파일명으로 다른 PNG를 덮어쓰면 게임에 그대로 적용되고, 파일을 지우면 색깔 원 + 이모지로 대체 표시됩니다.
(정사각형, 배경 투명, 그림이 가운데 오도록 넣어주세요. 플레이어 이미지는 왼쪽을 바라보게 그리면 이동 방향에 맞춰 뒤집힙니다.)

## 플레이어 진화 계열

| 단계 | 몽실이 계열 (균형) | 삐약이 계열 (날쌘) | 뭉치 계열 (튼튼) |
| --- | --- | --- | --- |
| 1단계 (Lv.1) | `mongsil.png` 몽실이 | `piyak.png` 삐약이 | `mungchi.png` 뭉치 |
| 2단계 (Lv.4) | `kkomul.png` 꼬물룡 | `jjaek.png` 짹짹이 | `meongmung.png` 멍뭉이 |
| 3단계 갈래 A (Lv.8) | `hwareu.png` 화르룡 (불꽃) | `jjirit.png` 찌릿새 (번개) | `seori.png` 서리늑대 (얼음) |
| 4단계 갈래 A (Lv.13) | `taeyang.png` 태양룡 | `beongae.png` 번개왕새 | `nunbora.png` 눈보라늑대 |
| 3단계 갈래 B (Lv.8) | `ipsae.png` 잎새룡 (잎새) | `sallang.png` 살랑새 (바람) | `bawi.png` 바위곰 (바위) |
| 4단계 갈래 B (Lv.13) | `kkotip.png` 꽃잎룡 | `hoeori.png` 회오리새 | `sanmaek.png` 산맥곰 |

## 적

| 파일 | 이름 |
| --- | --- |
| `slime.png` | 말랑이 (처음부터) |
| `mushroom.png` | 버섯돌이 (0:35부터) |
| `bee.png` | 꼬마벌 (1:15부터, 지그재그로 빠르게) |
| `turtle.png` | 돌거북 (2:30부터, 느리고 단단함) |
| `ghost.png` | 둥실유령 (3:30부터, 둥실둥실 반투명) |
| `bat.png` / `kingshroom.png` | 보스 박쥐대장 / 버섯대왕 (1:00부터 1분마다 번갈아) |

## 무기 · 아이템

| 파일 | 용도 |
| --- | --- |
| `bubble.png` / `fireball.png` / `leaf.png` | 방울탄 / 불꽃탄 / 잎새탄 |
| `feather.png` | 깃털 부메랑 |
| `star.png` | 별빛 수호 |
| `gem.png` / `gem_big.png` | 경험치 (일반 / 보스) |
| `heart.png` | HP 회복 |

번개, 서리 오라, 충격파는 이미지 없이 화면에 직접 그립니다.
