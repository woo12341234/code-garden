# QGIS 연습용 자동화 스크립트

폴더 안에 있는 shp 파일들의 좌표계를 한 번에 바꾸는 연습용 스크립트입니다.

| 파일 | 설명 | 실행 환경 |
|---|---|---|
| `make_sample_data.py` | 좌표계가 제각각인 연습용 shp 3개를 `sample_data/`에 만듭니다 | 일반 Python |
| `batch_reproject.py` | 폴더 안 shp 좌표계 일괄 변환 (GeoPandas) | 일반 Python, VS Code |
| `batch_reproject_pyqgis.py` | 같은 작업을 QGIS 안에서 실행하고 결과를 지도에 추가 | QGIS Python 콘솔 |

## VS Code에서 따라 하기

1. VS Code에서 이 폴더(`qgis-scripts`)를 엽니다.
2. 터미널(`Ctrl + ``)에서 라이브러리를 설치합니다.
   ```bash
   pip install geopandas
   ```
3. 연습용 데이터를 만듭니다.
   ```bash
   python make_sample_data.py
   ```
4. 변환을 실행합니다. `batch_reproject.py`를 열고 오른쪽 위 ▶ 버튼을 눌러도 됩니다.
   ```bash
   python batch_reproject.py
   ```
5. `sample_data/변환결과_EPSG5186/` 폴더의 결과를 QGIS로 열어서 확인합니다.

실행하면 이렇게 나옵니다.
```
3개 파일을 EPSG:5186로 변환합니다.

  [완료] 부산_주요지점.shp : EPSG:5179 → EPSG:5186 (2개 객체)
  [완료] 서울_주요지점.shp : EPSG:4326 → EPSG:5186 (3개 객체)
  [건너뜀] 좌표계없음.shp : 좌표계 정보(.prj)가 없습니다. --src-epsg 로 원래 좌표계를 지정하세요.
```

`좌표계없음.shp`는 일부러 `.prj` 없이 만든 파일입니다. 원래 좌표계를 알려주면 함께 변환됩니다.
```bash
python batch_reproject.py --src-epsg 4326
```

## 내 데이터에 쓰기

```bash
python batch_reproject.py "C:/내자료/shp폴더" --epsg 5186
python batch_reproject.py "C:/내자료/shp폴더" --epsg 5179 --format gpkg --recursive
```

| 옵션 | 뜻 |
|---|---|
| `--epsg` | 바꿀 좌표계 (기본 5186) |
| `--src-epsg` | `.prj`가 없는 파일의 원래 좌표계 |
| `--format` | 저장 형식: `shp` 또는 `gpkg` |
| `--recursive` | 하위 폴더까지 변환 |

옵션 대신 파일 위쪽 **설정** 부분의 값을 고쳐도 됩니다. 원본 파일은 건드리지 않고 `변환결과_EPSG번호` 폴더에 새로 저장합니다.

## 자주 쓰는 한국 좌표계

| EPSG | 이름 | 주로 쓰는 곳 |
|---|---|---|
| 5186 | 중부원점 (GRS80) | 국토지리정보원 수치지도 등 |
| 5179 | UTM-K (GRS80) | 네이버 지도, 도로명주소 |
| 5174 | 중부원점 (Bessel) | 옛날 지적도 |
| 4326 | WGS84 경위도 | GPS, 구글 지도 |

## 한글 깨짐 처리
- 읽을 때: `.cpg` 파일이 있으면 그 인코딩을 따르고, 없으면 국내 자료에 흔한 CP949로 읽습니다.
- 저장할 때: UTF-8로 저장하고 `.cpg` 파일을 함께 만들어서 QGIS에서 한글이 깨지지 않습니다.
