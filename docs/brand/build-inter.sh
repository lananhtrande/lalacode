#!/bin/sh
# Sinh font giao diện apps/web/public/fonts/inter/ từ bản phát hành chính thức
# Inter 4.1 (https://github.com/rsms/inter/releases, file InterVariable.ttf).
#
# - Cắt trục độ đậm còn 400–800 (giao diện chỉ dùng 400/600/700/800), bỏ trục opsz.
# - Chia ba file theo unicode-range giống @font-face trong apps/web/src/index.css.
# - Giữ tính năng cv05 (`l` có đuôi). Bản trên Fontsource/Google Fonts đã bỏ hết
#   cv/ss nên không dùng được.
#
# Không thêm dependency vào repo: chạy trong một venv tạm.
#   python3 -m venv /tmp/ft && /tmp/ft/bin/pip install fonttools brotli
#   sh docs/brand/build-inter.sh /tmp/ft/bin/python InterVariable.ttf apps/web/public/fonts/inter
set -e
PY="$1"; SRC="$2"; OUT="$3"
mkdir -p "$OUT"
"$PY" -I -m fontTools.varLib.instancer "$SRC" wght=400:800 opsz=drop -o "$OUT/_wght.ttf" -q
VI='U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB'
EXT='U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
LATIN='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
for pair in "vietnamese:$VI" "latin-ext:$EXT" "latin:$LATIN"; do
  name="${pair%%:*}"; range="${pair#*:}"
  "$PY" -I -m fontTools.subset "$OUT/_wght.ttf" --unicodes="$range" \
    --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk,case,tnum,cv05' \
    --flavor=woff2 --output-file="$OUT/inter-$name-wght-normal.woff2"
done
rm "$OUT/_wght.ttf"
