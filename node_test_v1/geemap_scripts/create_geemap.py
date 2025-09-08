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
output_dir = "./public/module/geemaps"
os.makedirs(output_dir, exist_ok=True)
html_path = os.path.join(output_dir, f"geemap_id_{module_id}.html")
m.to_html(html_path)

print(f"Created {html_path}")
size_bytes = os.path.getsize(html_path)
print(f"File size: {size_bytes / 1024:.2f} KB ({size_bytes / (1024 * 1024):.2f} MB)")




# import os

# import ee, geemap
# import geemap.foliumap as gf      # Folium-backed Map
# import folium
#
# from create_marker import create_marker
#
#
# service_account = "googleearthengine-932@ee-saoisactuallygood.iam.gserviceaccount.com"
# credentials = ee.ServiceAccountCredentials(service_account, "./secret/google-earth-key.json")
# ee.Initialize(credentials)
#
# non_marker_colour = "a0a0a0"
# non_marker_fill = "5ca2ff"
# non_marker_width = 0.2
#
# marker_colour = "000000"
# marker_fill = "ffcc00"
# marker_width = 1.4 
#
# # List of dicts, dicst contain Type of Country, City or LatLong and descs
# # Contains all the countries which will end up being highlighted
#
# #
# # profiles = [
# #     {
# #         "Country": "Australia",
# #         "Type": "Country",
# #         "DescriptionHTML": """
# #         <div style="font-family:system-ui;min-width:240px;line-height:1.35">
# #           <h3>Australia</h3>
# #           <p>This is a manually created description for the Australia marker. You can include
# #           <b>any HTML</b> here, including images, links, or styled text.</p>
# #         </div>
# #         """
# #     },
# #     {
# #         "Country": "Australia",
# #         "City": "Sydney",
# #         "Lat": -33.8688,
# #         "Lon": 151.2093,
# #         "Type": "City",
# #         "DescriptionHTML": "<div><b>Sydney:</b> A major city in Australia.</div>"
# #     },
# #     {
# #         "Country": "Pacific Ocean",
# #         "Lat": 0,
# #         "Lon": -160,
# #         "Type": "LatLong",
# #         "DescriptionHTML": "<div><b>Random Point:</b> Example of arbitrary point marker.</div>"
# #     }
# # ]
# #
#
#
# world = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
#
#
#
# def attach_country_profile(p):
#     fc = world.filter(ee.Filter.eq('country_na', p["Country"]))
#     # Set DescriptionHTML if exists
#     return fc.map(lambda f: f.set(p))
#
# def attach_city_profile(p):
#     point = ee.Geometry.Point([p["Lon"], p["Lat"]])
#     feature = ee.Feature(point, p)
#     return ee.FeatureCollection([feature])
#
# def attach_latlong_profile(p):
#     point = ee.Geometry.Point([p["Lon"], p["Lat"]])
#     feature = ee.Feature(point, p)
#     return ee.FeatureCollection([feature])
# marker_fc = ee.FeatureCollection([])
#
# for p in profiles:
#     if p["Type"] == "Country":
#         marker_fc = marker_fc.merge(attach_country_profile(p))
#     elif p["Type"] == "City":
#         marker_fc = marker_fc.merge(attach_city_profile(p))
#     elif p["Type"] == "LatLong":
#         marker_fc = marker_fc.merge(attach_latlong_profile(p))
#
#
#
# extent = ee.Geometry.Rectangle([-70, -50, 30, 40], geodesic=False)
# non_marker_fc = world.filter(ee.Filter.Not(ee.Filter.intersects('.geo', extent)))
#
# m = gf.Map(center=[-10, 140], zoom=3)
# # m = gf.Map(center=[0, 0], zoom=2)  # global view
# # m.fit_bounds([[-90, -180], [90, 180]])  # enforce world bounds
#
# m.add_basemap("CartoDB.Positron")
#
# non_marker_style = non_marker_fc.style(color=non_marker_colour, fillColor=non_marker_fill, width=non_marker_width)
# marker_style     = marker_fc.style(color=marker_colour, fillColor=marker_fill, width=marker_width)
#
# m.addLayer(non_marker_style, {}, "Non–Indo-Pacific (blue)", True, 0.18)
# m.addLayer(marker_style, {}, "Indo-Pacific (polygons)")
#
#
# # centroids = marker_fc.map(lambda f: ee.Feature(f.geometry().centroid(1), f.toDictionary()))
# # gj = geemap.ee_to_geojson(centroids)
#
# diamond_html = create_marker(
#     shape="diamond",
#     width=21,
#     height=21,
#     color="#ffccff",
#     border_width=15,
#     border_color="black",
#     shadow_width=3,
#     shadow_alpha=1.0
# )
#
# square_html = create_marker(
#     shape="square",
#     width=14,
#     height=14,
#     color="#ffcc00",
#     border_width=2,
#     border_color="white",
#     shadow_width=3,
#     shadow_alpha=0.35
# )
#
# triangle_html = create_marker(
#     shape="triangle",
#     width=14,   # half-width for borders
#     height=14,  # height of the triangle
#     color="red",
#     border_width=0,  # triangle doesn't use border in this setup
#     border_color="",
#     shadow_width=0,
#     shadow_alpha=0
# )
#
# # marker_group = folium.FeatureGroup(name="Country markers", show=True)
# #
# # for feat in gj["features"]:
# #     lon, lat = feat["geometry"]["coordinates"]
# #     p = feat["properties"]
# #
# #     popup_html = f"""
# #     <div style="font-family:system-ui;min-width:240px;line-height:1.35">
# #       <div style="font-weight:700;margin-bottom:4px">{p.get('Country','')}</div>
# #       <div><b>Capital:</b> {p.get('Capital','') or '—'}</div>
# #       <div><b>Ruling:</b> {p.get('RulingParty','') or '—'}</div>
# #       <div><b>Opposition:</b> {p.get('Opposition','') or '—'}</div>
# #       <div><b>Religions:</b> {p.get('Religion1','') or '—'}{', ' if p.get('Religion2') else ''}{p.get('Religion2','')}</div>
# #     </div>
# #     """
# #
# #     folium.Marker(
# #         location=[lat, lon],
# #         popup=folium.Popup(popup_html, max_width=280),
# #         icon=folium.DivIcon(html=diamond_html)
# #     ).add_to(marker_group)
# #
# # marker_group.add_to(m)
# # folium.LayerControl(collapsed=False).add_to(m)
#
# centroids = marker_fc.map(lambda f: ee.Feature(f.geometry().centroid(1), f.toDictionary()))
# gj = geemap.ee_to_geojson(centroids)
#
# marker_group = folium.FeatureGroup(name="Markers", show=True)
#
# for feat in gj["features"]:
#     lon, lat = feat["geometry"]["coordinates"]
#     p = feat["properties"]
#
#     # Use custom HTML if present
#     popup_html = p.get("DescriptionHTML", f"<div>{p}</div>")
#
#     # Choose marker icon based on type
#     if p.get("Type") == "Country":
#         icon_html = diamond_html
#     elif p.get("Type") == "City":
#         icon_html = square_html
#     else:  # LatLong
#         icon_html = triangle_html
#
#     folium.Marker(
#         location=[lat, lon],
#         popup=folium.Popup(popup_html, max_width=300),
#         icon=folium.DivIcon(html=icon_html)
#     ).add_to(marker_group)
#
# # m = gf.Map(center=[0, 0], zoom=2)  # start centered globally
# # m.add_basemap("CartoDB.Positron")
#
# # Add marker group
# marker_group.add_to(m)
# folium.LayerControl(collapsed=False).add_to(m)
#
#
# # Expose map object for iframe editing
# html_path = "./public/module/geemaps/geemap_id_1.html"
# m.to_html(html_path)
#
# size_bytes = os.path.getsize(html_path)
# print(f"File size: {size_bytes / 1024:.2f} KB")
# print(f"File size: {size_bytes / (1024 * 1024):.2f} MB")
#
