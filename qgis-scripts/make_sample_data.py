"""
연습용 샘플 데이터 만들기
=========================

batch_reproject.py 를 연습할 수 있도록 좌표계가 제각각인 shp 파일 3개를
sample_data/ 폴더에 만듭니다.

  - 서울_주요지점.shp  : WGS84 경위도 (EPSG:4326)
  - 부산_주요지점.shp  : UTM-K (EPSG:5179)
  - 좌표계없음.shp     : .prj 파일이 없는 파일 (실무에서 자주 만나는 경우)

실행:  python make_sample_data.py
"""

import warnings
from pathlib import Path

import geopandas as gpd
from shapely.geometry import Point

OUT_DIR = Path(__file__).parent / "sample_data"
OUT_DIR.mkdir(exist_ok=True)

seoul = gpd.GeoDataFrame(
    {"이름": ["서울시청", "경복궁", "남산타워"]},
    geometry=[Point(126.9780, 37.5665), Point(126.9770, 37.5796), Point(126.9882, 37.5512)],
    crs="EPSG:4326",
)
seoul.to_file(OUT_DIR / "서울_주요지점.shp", encoding="UTF-8")

busan = gpd.GeoDataFrame(
    {"이름": ["부산시청", "해운대"]},
    geometry=[Point(129.0756, 35.1796), Point(129.1604, 35.1587)],
    crs="EPSG:4326",
).to_crs(epsg=5179)
busan.to_file(OUT_DIR / "부산_주요지점.shp", encoding="UTF-8")

# 좌표계 정보(.prj)가 없는 파일: 실제 좌표는 EPSG:4326 경위도
no_crs = gpd.GeoDataFrame(
    {"이름": ["대전시청"]},
    geometry=[Point(127.3845, 36.3504)],
)
warnings.filterwarnings("ignore", message="'crs' was not provided")
no_crs.to_file(OUT_DIR / "좌표계없음.shp", encoding="UTF-8")

print(f"샘플 데이터를 만들었습니다: {OUT_DIR}")
for f in sorted(OUT_DIR.glob("*.shp")):
    print("  -", f.name)
