var slideWidth = 51200
var slideHeight = 38144

var zoom2tileSize = {0: 4096, 1: 2048}  // 続く
var bounds = [-(slideHeight/zoom2tileSize[0]), slideWidth/4096]

var mymap = L.map("mapid", {
	zoom: 0,
	center: [0, 0],
	crs: L.CRS.Simple,
	maxBounds: [[0, 0], bounds],
	doubleClickZoom: "center"
})
// var zoomToSize = getSize(zoom)

var maxZoom = getMaxZoom()

function getMaxZoom() {
	fetch("/get_maxZoom", {
		method: "GET",
		mode: "cors"
	}).then(response => {
		if (response.ok) {
			return response.json()
		}
	}).then(resJson => {
		return Number(resJson["maxZoom"])
	})
}

L.tileLayer("/{z}_{x}_{y}.png", {
	maxZoom: 5,
	minZoom: 0,
	tileSize: 256,
	attribution: "CMU-1.ndpi"
	}
).addTo(mymap)
