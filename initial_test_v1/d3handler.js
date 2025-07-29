const width = 1500;
const height = 850;
const svg = d3.select("svg").attr("width", width).attr("height", height);
const g = svg.append("g");

const tooltip = d3.select("#tooltip");

// Use a world projection (e.g. Mercator)
const projection = d3
  .geoMercator()
  .scale(150)
  .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);
Promise.all([
  d3.json("data/low_resolution_all.geojson"),
  d3.json("data/plate_boundaries.geojson"),
  d3.json("data/volcanoes.geojson"),
]).then(([worldData, plateData, volcanoData]) => {
  // Load world countries
  g.selectAll("path")
    .data(worldData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#d3d3d3")
    .attr("stroke", "#fff")
    .on("click", (event, d) => {
      tooltip
        .style("display", "block")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + "px")
        .html(`<strong>${d.properties.name}</strong>`);
    });

  // Load custom line features (plate boundaries)
  g.selectAll(".plate-boundary")
    .data(plateData.features)
    .enter()
    .append("path")
    .attr("class", "plate-boundary")
    .attr("d", path)
    .attr("fill", "none") // since they're lines
    .attr("stroke", (d, i) => d3.schemeCategory10[i % 10]) // different colors
    .attr("stroke-width", 2)
    .on("click", (event, d) => {
      tooltip
        .style("display", "block")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + "px").html(`
                    <strong>Plate Boundary</strong><br>
                    ${Object.entries(d.properties)
                      .map(([key, val]) => `${key}: ${val}`)
                      .join("<br>")}
                `);
      event.stopPropagation(); // prevent tooltip from hiding immediately
    });
  const circles = g
    .selectAll("circle.volcano")
    .data(volcanoData.features)
    .enter()
    .append("circle")
    .attr("class", "volcano")
    .attr("cx", (d) => projection(d.geometry.coordinates)[0])
    .attr("cy", (d) => projection(d.geometry.coordinates)[1])
    .attr("r", 8)
    .attr("fill", "orange")
    .on("click", (event, d) => {
      tooltip
        .style("display", "block")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + "px")
        .html(`<strong>${d.properties["Volcano Name"]}</strong><br>
                       Country: ${d.properties["Country"]}<br>
                       Elevation: ${d.properties["Elevation (m)"]} m<br>
                       Last Eruption: ${d.properties["Last Known Eruption"]}`);
    });
});
const markers = [
  { name: "Tokyo", coords: [139.6917, 35.6895] },
  { name: "Sydney", coords: [151.2093, -33.8688] },
  { name: "Nairobi", coords: [36.8219, -1.2921] },
];

const zoom = d3
  .zoom()
  .scaleExtent([1, 8])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);

    // To keep markers same screen size:
    g.selectAll("circle.volcano").attr("r", 8 / event.transform.k); // adjust based on zoom level
  });

svg.call(zoom);
// .zoom()
// .scaleExtent([1, 40])
// .translateExtent([
//   [-100, -100],
//   [width + 90, height + 100],
// ])
// .filter(filter)
// .on("zoom", zoomed);

// svg
//     .selectAll("circle")
//     .data(markers)
//     .enter()
//     .append("circle")
//     .attr("cx", (d) => projection(d.coords)[0])
//     .attr("cy", (d) => projection(d.coords)[1])
//     .attr("r", 5)
//     .attr("fill", "red")
//     .on("click", (event, d) => {
//         tooltip
//             .style("display", "block")
//             .style("left", event.pageX + 10 + "px")
//             .style("top", event.pageY + "px")
//             .html(`<strong>${d.name}</strong>`);
//     });
//
// Hide tooltip on outside click
svg.on("click", (event) => {
  if (!event.target.closest("circle") && !event.target.closest("path")) {
    tooltip.style("display", "none");
  }
});
