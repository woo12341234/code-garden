"""
폴더 안 shp 파일 좌표계 일괄 변환 (PyQGIS 버전)
==============================================

QGIS 안에서 실행하는 버전입니다. 변환한 레이어가 바로 지도에 추가됩니다.

실행 방법:
  1. QGIS 메뉴 [플러그인] → [Python 콘솔] 열기
  2. 콘솔 위쪽의 "편집기 보이기" 버튼 클릭 → 이 파일 열기
  3. 아래 "설정" 부분 수정 후 ▶(스크립트 실행) 버튼 클릭
"""

from pathlib import Path

import processing
from qgis.core import QgsCoordinateReferenceSystem, QgsProject, QgsVectorLayer

# ────────────── 설정 (여기만 고치면 됩니다) ──────────────
INPUT_DIR = r"C:/data/shp"     # 변환할 shp가 있는 폴더 (본인 경로로 변경)
TARGET_EPSG = 5186             # 바꿀 좌표계
SOURCE_EPSG_IF_MISSING = None  # .prj가 없는 파일의 원래 좌표계 (모르면 None → 건너뜀)
ADD_TO_MAP = True              # 결과를 지도에 바로 추가할지
# ─────────────────────────────────────────────────────────

input_dir = Path(INPUT_DIR)
output_dir = input_dir / f"변환결과_EPSG{TARGET_EPSG}"
output_dir.mkdir(exist_ok=True)
target_crs = QgsCoordinateReferenceSystem(f"EPSG:{TARGET_EPSG}")

files = sorted(input_dir.glob("*.shp"))
print(f"{len(files)}개 파일을 EPSG:{TARGET_EPSG}로 변환합니다.")

for f in files:
    layer = QgsVectorLayer(str(f), f.stem, "ogr")
    if not layer.isValid():
        print(f"  [실패] {f.name} : 파일을 열 수 없습니다.")
        continue

    # .cpg가 없으면 국내 자료에 흔한 CP949로 읽기 (한글 깨짐 방지)
    if not f.with_suffix(".cpg").exists():
        layer.setProviderEncoding("CP949")

    if not layer.crs().isValid():
        if SOURCE_EPSG_IF_MISSING is None:
            print(f"  [건너뜀] {f.name} : 좌표계 정보(.prj)가 없습니다.")
            continue
        layer.setCrs(QgsCoordinateReferenceSystem(f"EPSG:{SOURCE_EPSG_IF_MISSING}"))

    out_path = str(output_dir / f.name)
    processing.run("native:reprojectlayer", {
        "INPUT": layer,
        "TARGET_CRS": target_crs,
        "OUTPUT": out_path,
    })
    print(f"  [완료] {f.name} : {layer.crs().authid()} → EPSG:{TARGET_EPSG}")

    if ADD_TO_MAP:
        QgsProject.instance().addMapLayer(QgsVectorLayer(out_path, f"{f.stem}_{TARGET_EPSG}", "ogr"))

print(f"결과 폴더: {output_dir}")
