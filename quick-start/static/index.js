

function getCenterLatLng(map, z2slideWidth, z2slideHeight, level) {
	return map.unproject([z2slideWidth[level]/2, z2slideHeight[level]/2], level)
}

function getBottomRight(map, z2slideWidth, z2slideHeight, level) {
	return map.unproject([z2slideWidth[level], z2slideHeight[level]], level)
}

function setMap() {
	var mymap = L.map("mapid", {
		center: [0, 0],
		zoom: 9,
		crs: L.CRS.Simple,
	})
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

		mymap.setView(getCenterLatLng(mymap, z2slideWidth, z2slideHeight, defaultZoom))
		mymap.setMaxBounds([[0, 0], getBottomRight(mymap, z2slideWidth, z2slideHeight, defaultZoom)])
		mymap.setMinZoom(defaultZoom)
		mymap.setMaxZoom(levelCount-1)

		var bottomright = L.latLng(-0.1, 0.1)
		L.marker(bottomright, {
	    draggable: true
		}).addTo(mymap).bindPopup();

		var tilesLayer = L.tileLayer("/{z}_{x}_{y}.png", {
			maxZoom: levelCount-1,
			minZoom: defaultZoom,
			tileSize: tileSize,
			attribution: fileName
			}
		)
		tilesLayer.addTo(mymap)

		var mapLayer = L.tileLayer("/{z}_{x}_{y}.png", {
			maxZoom: levelCount-1,
			minZoom: defaultZoom,
			tileSize: tileSize,
			attribution: fileName
			}
		)
		var miniMap = new L.Control.MiniMap(mapLayer)
		miniMap.addTo(mymap)

		mymap.on("zoomend", function(){
			var currentZoomLevel = this.getZoom()
			// this.unproject : returns [lat, lng ] at [h , w] of zoomlevel=z
			var newBounds = getBottomRight(this, z2slideWidth, z2slideHeight, currentZoomLevel)
			this.setMaxBounds([[0, 0], newBounds])
		})

	})
	return mymap
}

var map = setMap()
