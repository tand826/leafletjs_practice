var mymap = L.map("mapid", {
	center: [0, 0],
	zoom: 9,
	crs: L.CRS.Simple,
})

function getProperties() {

	fetch("/get_properties", {
	  method: "GET",
	}).then(response => response.text()
	).then(properties => {
		var properties = JSON.parse(properties)
		var fileName = properties["filename"]
		var slideWidth = properties["width"]
		var slideHeight = properties["height"]
		var levelCount = properties["level_count"]
		var z2slideWidth = properties["z2slideWidth"]
		var z2slideHeight = properties["z2slideHeight"]
		var z2patchWidth = properties["z2patchWidth"]
		var z2patchHeight = properties["z2patchHeight"]
		var z2tileCountLat = properties["z2tileCountLat"]
		var z2tileCountLng = properties["z2tileCountLng"]
		var tileSize = properties["tile_size"]
		var overlap = properties["overlap"]
		var defaultZoom = properties["default_zoom"] + 1

		mymap.setView([-Math.floor(z2slideHeight[defaultZoom]/2/tileSize)+1, Math.floor(z2slideWidth[defaultZoom]/2/tileSize)-1], defaultZoom)
		mymap.setMaxBounds([[0, 0], [-(slideHeight/z2patchHeight[defaultZoom]), (slideWidth/z2patchWidth[defaultZoom])]])
		mymap.setMinZoom(defaultZoom)
		mymap.setMaxZoom(levelCount-1)

		L.tileLayer("/{z}_{x}_{y}.png", {
			maxZoom: levelCount-1,
			minZoom: defaultZoom,
			tileSize: tileSize,
			attribution: fileName
			}
		).addTo(mymap)

	})
}

getProperties()
