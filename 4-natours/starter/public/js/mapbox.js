const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmlraXRvbjIyODkiLCJhIjoiY2xpMzMyNnFyMHM3dDNsbHBxbnh1bnF4eSJ9.3u00-ST0fxWR8p9USL-5XA';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/nikiton2289/cli33r98r00k201quha6od1x7',
        scrollZoom: false
        //    center: [30.630167, 50.461622],
        //     zoom: 10,
        //     interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Marker
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        // Pop Up
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100
        }
    });
};

if(document.getElementById('map')){
    const locations = JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locations);
}
