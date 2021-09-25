var mapOptions = {
  zoom: 16,
  center: new google.maps.LatLng(62.1482, 6.0696)
};

var drawingManager = new google.maps.drawing.DrawingManager({
  drawingControl: false,
  polygonOptions: {
    editable: false
  },
  
});
drawingManager.setOptions({
  polygonOptions: {
    fillColor: 'green',
    strokeColor: 'red',
    editable: true,
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
drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
drawingManager.setMap(map);
google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
  //var polyPath = event.overlay.getPath();
  var intersects = findSelfIntersects(polygon.getPath());
  
  if (intersects && intersects.length) {
    alert('Область обозначена и пересекает себя');
  } else {
    alert('Область обозначена и не пересекает себя');
  }
});