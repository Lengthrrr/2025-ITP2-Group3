const width = 1000;
const height = 600;

const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

// Use a world projection (e.g. Mercator)
const projection = d3.geoMercator()
  .scale(150)
  .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

// Load world countries
d3.json("data/high_resolution_missing_europe_na.geojson").then(worldData => {
  svg.selectAll("path")
    .data(worldData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#d3d3d3")
    .attr("stroke", "#fff")
    .on("click", (event, d) => {
      tooltip
        .style("display", "block")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY) + "px")
        .html(`<strong>${d.properties.name}</strong>`);
    });
});

// Add example markers
const markers = [
  { name: "Tokyo", coords: [139.6917, 35.6895] },
  { name: "Sydney", coords: [151.2093, -33.8688] },
  { name: "Nairobi", coords: [36.8219, -1.2921] }
];

svg.selectAll("circle")
  .data(markers)
  .enter()
  .append("circle")
  .attr("cx", d => projection(d.coords)[0])
  .attr("cy", d => projection(d.coords)[1])
  .attr("r", 5)
  .attr("fill", "red")
  .on("click", (event, d) => {
    tooltip
      .style("display", "block")
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY) + "px")
      .html(`<strong>${d.name}</strong>`);
  });

// Hide tooltip on outside click
svg.on("click", (event) => {
  if (!event.target.closest("circle") && !event.target.closest("path")) {
    tooltip.style("display", "none");
  }
});

