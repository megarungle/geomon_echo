function getCoordsFromServerBySomething() {
	var allCoords = []
	var coords = []
	coords.push(56.29720095504402)
	coords.push(43.97701409422293)
	allCoords.push(coords)
	var coords = []
	coords.push(56.29662844536947)
	coords.push(43.97598233985933)
	allCoords.push(coords)
	return allCoords
}


function mapInitialization()
{	
	var mapOptions = {
	  zoom: 13,
	  center: new google.maps.LatLng(56.32255, 43.9831),
	  mapTypeControl: false,
	  streetViewControl: false
	};

	var drawingManager = new google.maps.drawing.DrawingManager({
	  drawingControl: false
	});
	
	drawingManager.setOptions({
	  polygonOptions: {
		fillColor: 'green',
		strokeColor: 'red',
		editable: true
	  }
	});

	var googleMaps2JTS = function(boundaries) {
	  var coordinates = [];
	  for (var i = 0; i < boundaries.getLength(); i++) {
		coordinates.push(new jsts.geom.Coordinate(
		  boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
		  console.log("lat", boundaries.getAt(i).lat(), "lng", boundaries.getAt(i).lng())
	  }
	  coordinates.push(coordinates[0]);
	  return coordinates;
	};

	var findSelfIntersects = function(googlePolygonPath) {
	  var coordinates = googleMaps2JTS(googlePolygonPath);
	  var geometryFactory = new jsts.geom.GeometryFactory();
	  var shell = geometryFactory.createLinearRing(coordinates);
	  var jstsPolygon = geometryFactory.createPolygon(shell);

	  // if the geometry is aleady a simple linear ring, do not
	  // try to find self intersection points.
	  var validator = new jsts.operation.IsSimpleOp(jstsPolygon);
	  if (validator.isSimpleLinearGeometry(jstsPolygon)) {
		return;
	  }
	  var res = [];
	  var graph = new jsts.geomgraph.GeometryGraph(0, jstsPolygon);
	  var cat = new jsts.operation.valid.ConsistentAreaTester(graph);
	  var r = cat.isNodeConsistentArea();
	  if (!r) {
		var pt = cat.getInvalidPoint();
		res.push([pt.x, pt.y]);
	  }
	  return res;
	};

	var map = new google.maps.Map(document.getElementById("map"), mapOptions);
	//
	drawingManager.setMap(map);
	document.getElementById("drawBtn").onclick = function() {
		drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
	};
	//
	google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
	  var intersects = findSelfIntersects(polygon.getPath());
	  polygon.setEditable(false);
	  if (intersects && intersects.length) {
		alert('Область обозначена и пересекает себя');
	  } else {
		alert('Область обозначена и не пересекает себя');
	  }
	  drawingManager.setDrawingMode(undefined);
	});

	document.getElementById("coordBtn").onclick = function() {
		var coords = getCoordsFromServerBySomething();
		for (var i = 0; i < coords.length; i++) {
			myLatLng = { lat: coords[i][0], lng: coords[i][1] };
			marker = new google.maps.Marker({
				position: myLatLng,
				map,
				title: i.toString(),
				icon: "pig_marker.png"
			});
			var infowindow = new google.maps.InfoWindow()
			google.maps.event.addListener(marker, 'click', (function(marker, infowindow){ 
				return function() {
					infowindow.setContent("Abobus number " + marker.title);
					infowindow.open(map, marker);
				};
			})(marker,infowindow));
		}
	};
}
