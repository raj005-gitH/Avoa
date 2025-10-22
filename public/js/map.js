mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map ({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry && listing.geometry.coordinates
        ? listing.geometry.coordinates
        : [77.1025, 28.7041], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10, // starting zoom
});

const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates) //Listing.geometry.coordinates
    .setPopup(new mapboxgl.Popup({offset:25})
    .setHTML(`<h4>${listing.title}</h4><p>exact location provided after booking</p>`))
    .addTo(map);

