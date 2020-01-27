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
		var levelCount = properties["level_count"]
		var slideWidth = properties["width"]
		var slideHeight = properties["height"]
		var z2slideWidth = properties["z2slideWidth"]
		var z2slideHeight = properties["z2slideHeight"]
		var z2patchWidth = properties["z2patchWidth"]
		var z2patchHeight = properties["z2patchHeight"]
		var z2tileCountLat = properties["z2tileCountLat"]
		var z2tileCountLng = properties["z2tileCountLng"]
		var tileSize = properties["tile_size"]
		var overlap = properties["overlap"]
		var defaultZoom = properties["default_zoom"] + 1
		var dzMaxZoom = properties["dz_max_zoom"]

		mymap.setView([-Math.floor(z2slideHeight[defaultZoom]/2/tileSize)+1, Math.floor(z2slideWidth[defaultZoom]/2/tileSize)-1], defaultZoom)
		mymap.setMaxBounds([[0, 0], [-(slideHeight/z2patchHeight[defaultZoom]), (slideWidth/z2patchWidth[defaultZoom])]])
		mymap.setMinZoom(defaultZoom)
		mymap.setMaxZoom(levelCount-1)

		console.log("center of view")
		console.log([-Math.floor(z2slideHeight[defaultZoom]/2/tileSize)+1, Math.floor(z2slideWidth[defaultZoom]/2/tileSize)-1])

		console.log("max bounds")
		console.log([-(slideHeight/z2patchHeight[defaultZoom]), (slideWidth/z2patchWidth[defaultZoom])])

		var bottomright = L.latLng(-0.1, 0.1)
		L.marker(bottomright, {
	    draggable: true
		}).addTo(mymap).bindPopup();

		L.tileLayer("/{z}_{x}_{y}.png", {
			maxZoom: levelCount-1,
			minZoom: defaultZoom,
			tileSize: tileSize,
			attribution: fileName
			}
		).addTo(mymap)

		mymap.on("zoomend", function(){
			var currentZoomLevel = this.getZoom()
			// this.unproject : returns [lat, lng ] at [h , w] of zoomlevel=z
			var newBounds = this.unproject([z2slideWidth[currentZoomLevel], z2slideHeight[currentZoomLevel]], currentZoomLevel)
			this.setMaxBounds([[0, 0], newBounds])
		})

	})
}

getProperties()
