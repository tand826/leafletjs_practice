from flask import Flask, jsonify, render_template, make_response
import pyvips

app = Flask(__name__)
sizes = [2**i for i in range(7, 17)]  # 128 ~ 65536
z2size = {0: 10240, 1: 5120}

path = "/Users/takumi/datasets/WSI/CMU-1.ndpi"
app.slide = pyvips.Image.new_from_file(path)
max_zoom = int(app.slide.get("openslide.level-count"))


@app.route("/get_maxZoom")
def get_maxZoom():
    app.max_zoom = max_zoom
    return jsonify({"maxZoom": max_zoom})


@app.route("/<loc>.png", methods=["POST", "GET"])
def get_patch(loc):
    z, x, y = [int(i) for i in loc.split("_")]
    patch_size = int(app.slide.get(f"openslide.level[{z}].tile-width")) * 2
    print(patch_size)
    scale = 256 / patch_size
    x = patch_size * x
    y = patch_size * y
    patch = app.slide.crop(x, y, patch_size, patch_size).resize(scale)
    patch_png = patch.pngsave_buffer()
    res = make_response(patch_png)
    res.mimetype = f"image/png"
    return res


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8888)
