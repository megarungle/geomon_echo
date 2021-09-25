function initGoogleMap()
{
//var map = document.getElementById('map');

	// The location of Uluru
	const uluru = { lat: -25.344, lng: 131.036 };
	// The map, centered at Uluru
	const map = new google.maps.Map(document.getElementById("map"), {
	  zoom: 4,
	  center: uluru,
	  mapTypeId: 'terrain'
	});
	// The marker, positioned at Uluru
	const marker = new google.maps.Marker({
	  position: uluru,
	  map: map,
	});

	// Define the LatLng coordinates for the polygon's path.
	var triangleCoords = [
		{lat: 25.774, lng: -80.190},
		{lat: 18.466, lng: -66.118},
		{lat: 32.321, lng: -64.757},
		{lat: 25.774, lng: -80.190}
	];
	
	// Construct the polygon.
	var bermudaTriangle = new google.maps.Polygon({
		paths: triangleCoords,
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.35
	});
	bermudaTriangle.setMap(map);
}
