"""
폴더 안 shp 파일 좌표계 일괄 변환 (GeoPandas 버전)
================================================

QGIS 없이 일반 Python으로 동작합니다. VS Code에서 열고 실행(▶) 버튼만 누르면 됩니다.

준비:  pip install geopandas

사용법 1) 아래 "설정" 부분의 값을 고치고 그냥 실행
사용법 2) 터미널에서 옵션으로 지정
    python batch_reproject.py 입력폴더 --epsg 5186
    python batch_reproject.py 입력폴더 --epsg 5186 --format gpkg --recursive
    python batch_reproject.py 입력폴더 --src-epsg 4326   (.prj 없는 파일의 원래 좌표계)

자주 쓰는 한국 좌표계:
    5186 : 중부원점 (GRS80)  - 국토지리정보원 수치지도 등
    5179 : UTM-K (GRS80)     - 네이버 지도, 도로명주소 등
    5174 : 중부원점 (Bessel) - 옛날 지적도 등
    4326 : WGS84 경위도      - GPS, 구글 지도 등
"""

import argparse
from pathlib import Path

import geopandas as gpd

# ────────────── 설정 (여기만 고치면 됩니다) ──────────────
INPUT_DIR = Path(__file__).parent / "sample_data"  # 변환할 shp가 있는 폴더
TARGET_EPSG = 5186          # 바꿀 좌표계
SOURCE_EPSG_IF_MISSING = None  # .prj가 없는 파일의 원래 좌표계 (모르면 None → 건너뜀)
OUTPUT_FORMAT = "shp"       # "shp" 또는 "gpkg"
RECURSIVE = False           # 하위 폴더까지 찾을지
# ─────────────────────────────────────────────────────────


def read_shp(path: Path) -> gpd.GeoDataFrame:
    """한글 인코딩을 고려해서 shp를 읽습니다.

    .cpg 파일이 있으면 거기 적힌 인코딩을 따르고,
    없으면 국내 자료에 흔한 CP949(EUC-KR)로 읽습니다.
    """
    if path.with_suffix(".cpg").exists():
        return gpd.read_file(path)
    return gpd.read_file(path, encoding="cp949")


def reproject_folder(input_dir, target_epsg, source_epsg=None, fmt="shp", recursive=False):
    input_dir = Path(input_dir)
    if not input_dir.is_dir():
        raise SystemExit(f"폴더를 찾을 수 없습니다: {input_dir}")

    output_dir = input_dir / f"변환결과_EPSG{target_epsg}"
    pattern = "**/*.shp" if recursive else "*.shp"
    files = [f for f in sorted(input_dir.glob(pattern)) if output_dir not in f.parents]

    if not files:
        print("shp 파일이 없습니다.")
        return

    print(f"{len(files)}개 파일을 EPSG:{target_epsg}로 변환합니다.\n")
    ok, skipped, failed = 0, 0, 0

    for f in files:
        rel = f.relative_to(input_dir)
        try:
            gdf = read_shp(f)

            if gdf.crs is None:
                if source_epsg is None:
                    print(f"  [건너뜀] {rel} : 좌표계 정보(.prj)가 없습니다. "
                          f"--src-epsg 로 원래 좌표계를 지정하세요.")
                    skipped += 1
                    continue
                gdf = gdf.set_crs(epsg=source_epsg)

            before = gdf.crs.to_epsg() or gdf.crs.name
            out_gdf = gdf.to_crs(epsg=target_epsg)

            out_path = (output_dir / rel).with_suffix(f".{fmt}")
            out_path.parent.mkdir(parents=True, exist_ok=True)
            # UTF-8로 저장하면 .cpg 파일이 함께 생겨서 QGIS에서 한글이 깨지지 않습니다.
            out_gdf.to_file(out_path, encoding="UTF-8")

            print(f"  [완료] {rel} : EPSG:{before} → EPSG:{target_epsg} ({len(out_gdf)}개 객체)")
            ok += 1
        except Exception as e:  # 한 파일이 실패해도 나머지는 계속 진행
            print(f"  [실패] {rel} : {e}")
            failed += 1

    print(f"\n완료 {ok}개 / 건너뜀 {skipped}개 / 실패 {failed}개")
    print(f"결과 폴더: {output_dir}")


def main():
    p = argparse.ArgumentParser(description="폴더 안 shp 파일 좌표계 일괄 변환")
    p.add_argument("input_dir", nargs="?", default=INPUT_DIR, help="shp 파일이 있는 폴더")
    p.add_argument("--epsg", type=int, default=TARGET_EPSG, help="바꿀 좌표계 (기본 5186)")
    p.add_argument("--src-epsg", type=int, default=SOURCE_EPSG_IF_MISSING,
                   help=".prj가 없는 파일의 원래 좌표계")
    p.add_argument("--format", choices=["shp", "gpkg"], default=OUTPUT_FORMAT, help="저장 형식")
    p.add_argument("--recursive", action="store_true", default=RECURSIVE, help="하위 폴더 포함")
    a = p.parse_args()
    reproject_folder(a.input_dir, a.epsg, a.src_epsg, a.format, a.recursive)


if __name__ == "__main__":
    main()
