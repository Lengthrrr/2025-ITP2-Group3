import os
import sys
import importlib
import ee, geemap
import geemap.foliumap as gf
import folium
from create_marker import create_marker

# ---- Google Earth Engine Auth ----
service_account = "googleearthengine-932@ee-saoisactuallygood.iam.gserviceaccount.com"
credentials = ee.ServiceAccountCredentials(service_account, "./secret/google-earth-key.json")
ee.Initialize(credentials)

import importlib.util
import os
import sys

if len(sys.argv) < 2:
    print("Usage: python create_geemap.py <module_id>")
    sys.exit(1)

module_id = sys.argv[1]
config_path = os.path.join("geemap_data", f"map_config_{module_id}.py")

if not os.path.exists(config_path):
    print(f"Config file {config_path} not found!")
    sys.exit(1)

spec = importlib.util.spec_from_file_location("config", config_path)
config = importlib.util.module_from_spec(spec)
spec.loader.exec_module(config)


# ---- Load world boundaries ----
world = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")

def attach_country_profile(p):
    fc = world.filter(ee.Filter.eq('country_na', p["Country"]))
    return fc.map(lambda f: f.set(p))

def attach_city_profile(p):
    point = ee.Geometry.Point([p["Lon"], p["Lat"]])
    feature = ee.Feature(point, p)
    return ee.FeatureCollection([feature])

def attach_latlong_profile(p):
    point = ee.Geometry.Point([p["Lon"], p["Lat"]])
    feature = ee.Feature(point, p)
    return ee.FeatureCollection([feature])

# ---- Build marker FeatureCollection ----
marker_fc = ee.FeatureCollection([])
for p in config.profiles:
    if p["Type"] == "Country":
        marker_fc = marker_fc.merge(attach_country_profile(p))
    elif p["Type"] == "City":
        marker_fc = marker_fc.merge(attach_city_profile(p))
    elif p["Type"] == "LatLong":
        marker_fc = marker_fc.merge(attach_latlong_profile(p))

# ---- Create map ----
m = gf.Map(center=config.map_center, zoom=config.map_zoom)
m.add_basemap("CartoDB.Positron")

non_marker_fc = world.filter(
    ee.Filter.Not(
        ee.Filter.intersects('.geo', ee.Geometry.Rectangle([-70, -50, 30, 40], geodesic=False))
    )
)

non_marker_style = non_marker_fc.style(
    color=config.non_marker_colour,
    fillColor=config.non_marker_fill,
    width=config.non_marker_width
)
marker_style = marker_fc.style(
    color=config.marker_colour,
    fillColor=config.marker_fill,
    width=config.marker_width
)

m.addLayer(non_marker_style, {}, "Non–Indo-Pacific (blue)", True, 0.18)
m.addLayer(marker_style, {}, "Indo-Pacific (polygons)")

# ---- Pre-generate marker icons from config ----
marker_icons = {}
for marker_type, settings in config.marker_types.items():
    marker_icons[marker_type] = create_marker(**settings)

# ---- Add markers ----
centroids = marker_fc.map(lambda f: ee.Feature(f.geometry().centroid(1), f.toDictionary()))
gj = geemap.ee_to_geojson(centroids)

marker_group = folium.FeatureGroup(name="Markers", show=True)

for feat in gj["features"]:
    lon, lat = feat["geometry"]["coordinates"]
    p = feat["properties"]

    popup_html = p.get("DescriptionHTML", f"<div>{p}</div>")
    marker_type = p.get("MarkerType")

    icon_html = marker_icons.get(marker_type, marker_icons.get("default"))

    folium.Marker(
        location=[lat, lon],
        popup=folium.Popup(popup_html, max_width=300),
        icon=folium.DivIcon(html=icon_html)
    ).add_to(marker_group)

marker_group.add_to(m)
folium.LayerControl(collapsed=False).add_to(m)

# ---- Save HTML ----
output_dir = "./public/geemaps"
os.makedirs(output_dir, exist_ok=True)
html_path = os.path.join(output_dir, f"geemap_id_{module_id}.html")
m.to_html(html_path)

print(f"Created {html_path}")
size_bytes = os.path.getsize(html_path)
print(f"File size: {size_bytes / 1024:.2f} KB ({size_bytes / (1024 * 1024):.2f} MB)")

