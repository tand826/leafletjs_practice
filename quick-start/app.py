import sys
from io import BytesIO
from pathlib import Path
from PIL import Image
from flask import Flask, jsonify, render_template, make_response
import openslide
from openslide.deepzoom import DeepZoomGenerator

app = Flask(__name__)

path = sys.argv[1]
tile_size = 256
overlap = 0

app.slide = openslide.OpenSlide(path)
app.dz = DeepZoomGenerator(app.slide,
                           tile_size=tile_size,
                           overlap=overlap)


@app.route("/get_properties")
def get_properties():
    z2slideWidth = {zoom: app.dz.level_dimensions[zoom][0] for zoom in range(0, app.dz.level_count-1)}
    z2slideHeight = {zoom: app.dz.level_dimensions[zoom][1] for zoom in range(0, app.dz.level_count-1)}
    z2patchWidth = {zoom: app.dz.get_tile_dimensions(zoom, (0, 0))[0] for zoom in range(0, app.dz.level_count-1)}
    z2patchHeight = {zoom: app.dz.get_tile_dimensions(zoom, (0, 0))[1] for zoom in range(0, app.dz.level_count-1)}
    z2tileCountLat = {zoom: app.dz.level_tiles[zoom][0] for zoom in range(0, app.dz.level_count-1)}
    z2tileCountLng = {zoom: app.dz.level_tiles[zoom][1] for zoom in range(0, app.dz.level_count-1)}
    properties = {"level_count": app.dz.level_count,
                  "level_tiles": app.dz.level_tiles,
                  "level_dimensions": app.dz.level_dimensions,
                  "width": app.slide.dimensions[0],
                  "height": app.slide.dimensions[1],
                  "tile_size": tile_size,
                  "overlap": overlap,
                  "z2slideWidth": z2slideWidth,
                  "z2slideHeight": z2slideHeight,
                  "z2patchWidth": z2patchWidth,
                  "z2patchHeight": z2patchHeight,
                  "default_zoom": app.slide.level_count,
                  "dz_max_zoom": app.dz.level_count,
                  "filename": Path(path).name,
                  "z2tileCountLat": z2tileCountLat,
                  "z2tileCountLng": z2tileCountLng
                  }
    return jsonify(properties)


@app.route("/<loc>.png", methods=["POST", "GET"])
def get_patch(loc):
    z, x, y = [int(i) for i in loc.split("_")]
    try:
        patch = app.dz.get_tile(z, (x, y))
    except ValueError:
        return make_response()
    if patch.size[0] != patch.size[1]:
        patch = pad_rect(patch)
    buf = BytesIO()
    patch.save(buf, "png", quality=95)
    res = make_response(buf.getvalue())
    res.mimetype = f"image/png"
    return res


@app.route("/pad_rect")
def pad_rect(img):
    base = Image.new("RGBA", (tile_size, tile_size), (0, 0, 0, 0))
    base.paste(img)
    return base


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8888)
