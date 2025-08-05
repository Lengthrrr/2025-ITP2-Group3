// Current issues:
//
// Improve adding, removing, editing, remove the bugs
// Add removal of them.
// Make the map look nice.
    //
    // Quiz
    // Home pages
    // Markers open up the side page
    // Information Panel + Legend + UI + Beautify
    //
// Occlusion
//


let svg, g, projection, path, tooltip;
let current_mode = "view";
let currentTransform = d3.zoomIdentity;

export function setConstants(width_, height_, scale_) {
  const width = width_;
  const height = height_;
  svg = d3.select("svg").attr("width", width).attr("height", height);
  g = svg.append("g");

  tooltip = d3.select("#tooltip");

  // Use a world projection (e.g. Mercator)
  projection = d3
    .geoMercator()
    .scale(150)
    .rotate([180, 0])
    .center([20, 0])
    .translate([width / 2, height / 1.5]);

  path = d3.geoPath().projection(projection);
}

export function loadCountries(resolution) {
  document.addEventListener("DOMContentLoaded", () => {
    fetch("data/countries/" + resolution + "_resolution_all.geojson")
      .then((res) => res.json())
      .then((worldData) => {
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
      });
  });
}
export function setActions() {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('input[name="editor_mode"]').forEach((input) => {
      input.addEventListener("change", () => {
        const value = input.value;
        if (value === "view") current_mode = "view";
        else if (value === "edit") current_mode = "edit";
        else if (value === "create") current_mode = "create";
      });
    });
  });
  svg.on("click", function (event) {
    const [x, y] = d3.pointer(event, this);

    // ✅ Adjust for zoom/pan before projecting
    const [tx, ty] = currentTransform.invert([x, y]);
    const coords = projection.invert([tx, ty]);

    console.log("Mode:", current_mode, "Coords:", coords);

    if (current_mode === "view" || current_mode === "edit") {
      if (!event.target.closest("circle") && !event.target.closest("path")) {
        tooltip.style("display", "none");
      }
    }

    if (current_mode === "create") {
      console.log("Placing marker at:", coords);
      placeMarker(coords, {
        name: "Custom Marker",
        description: `Lon: ${coords[0].toFixed(2)}, Lat: ${coords[1].toFixed(2)}`,
      });
    }

    if (current_mode === "edit") {
      console.log("Edit mode clicked at", coords);
      // You can implement marker editing logic here
    }
  });

  // Save button updates marker data and tooltip
  saveBtn.onclick = () => {
    if (!currentEditingMarker) return;

    const newName = nameInput.value.trim();
    const newDesc = descInput.value.trim();

    const data = currentEditingMarker.datum();

    // Update data
    data.details.name = newName;
    data.details.description = newDesc;

    // Update tooltip behavior (so it shows new details)

    data.circle.on("click", (event) => {
      event.stopPropagation();
      if (current_mode === "edit") {
        showEditForm(
          currentEditingMarker || currentEditingMarker === null
            ? currentEditingMarker
            : markerGroup,
        );
      } else {
        tooltip
          .style("display", "block")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + "px")
          .html(`<strong>${newName}</strong><br>${newDesc}`);
      }
    });

    hideEditForm();
  };

  // Cancel button just hides the form
  cancelBtn.onclick = () => {
    hideEditForm();
  };

  // Optional: hide form on map click (outside marker)
  svg.on("click.editform", () => {
    hideEditForm();
  });
}
const editForm = document.getElementById("marker-edit-form");
const nameInput = document.getElementById("marker-name");
const descInput = document.getElementById("marker-desc");
const saveBtn = document.getElementById("save-marker-btn");
const cancelBtn = document.getElementById("cancel-marker-btn");

let currentEditingMarker = null;

function showEditForm(markerGroup) {
  currentEditingMarker = markerGroup;

  // Prefill inputs
  const data = markerGroup.datum();
  nameInput.value = data.details.name || "";
  descInput.value = data.details.description || "";

  // Position the form near the marker's screen position
  const [lon, lat] = data.location;
  const [x, y] = projection([lon, lat]);

  // Project the x,y on the screen (consider zoom/pan)
  const transformed = currentTransform.apply([x, y]);

  editForm.style.left = transformed[0] + 10 + "px";
  editForm.style.top = transformed[1] + "px";
  editForm.style.display = "block";
  nameInput.focus();
}

function hideEditForm() {
  editForm.style.display = "none";
  currentEditingMarker = null;
}

export function setBehaviour() {
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      currentTransform = event.transform;
      g.attr("transform", event.transform);
      g.selectAll("circle").attr("r", 8 / event.transform.k);
    });

  svg.call(zoom);
}

export function loadGeoJSON(geojsonName) {
  document.addEventListener("DOMContentLoaded", () => {
    fetch("data/module_data/" + geojsonName + ".geojson")
      .then((res) => res.json())
      .then((worldData) => {
        // Load world countries
        console.log(worldData.features);
        g.selectAll("path")
          .data(worldData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "blue")
          .attr("stroke", "red")
          .on("click", (event, d) => {
            tooltip
              .style("display", "block")
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY + "px")
              .html(`<strong>${d.properties.name}</strong>`);
          });
      });
  });
}

export function placeMIPData(mipdataName) {}
export function placeMarker(location, details) {
  const [longitude, latitude] = location;
  const [x, y] = projection([longitude, latitude]);

  // Create a group for marker + data (easier to manage later)
  const markerGroup = g.append("g").attr("class", "marker-group");

  const circle = markerGroup
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 5)
    .attr("fill", "red")
    .attr("stroke", "black")
    .style("cursor", "pointer");

  // Attach data to group for easy access
  markerGroup.datum({
    location,
    details,
    circle,
  });

  // Tooltip on click (only in view mode)
  circle.on("click", (event) => {
    event.stopPropagation(); // prevent bubbling to svg click

    if (current_mode === "edit") {
      showEditForm(markerGroup);
    } else {
      tooltip
        .style("display", "block")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + "px")
        .html(
          `<strong>${details.name}</strong><br>${details.description || ""}`,
        );
    }
  });
}

export function saveData(mipdataName) {}

export function initialise(
  width_,
  height_,
  scale_,
  module_name_,
  country_file_name_,
) {
  setConstants(width_, height_, scale_);
  loadCountries(country_file_name_);
  // loadGeoJSON(module_name_);
  setBehaviour();
  setActions();
  // activateEditMode();

  document.addEventListener("DOMContentLoaded", () => {
    placeMarker([171.21, 30.42], {
      name: "Tokyo",
      description: "Capital of Japan",
    });
  });
}

initialise(1500, 800, 150, "volcanoes", "low");
