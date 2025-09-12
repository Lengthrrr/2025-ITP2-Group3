import ee, geemap
from ipyleaflet import Marker, DivIcon, Popup
from ipywidgets import HTML  # <-- correct source for HTML widget
import geemap.foliumap as gf      # Folium-backed Map
import folium

service_account = "googleearthengine-932@ee-saoisactuallygood.iam.gserviceaccount.com"
credentials = ee.ServiceAccountCredentials(service_account, "./secret/google-earth-key.json")
ee.Initialize(credentials)

non_marker_colour = "a0a0a0"
non_marker_fill = "5ca2ff"
non_marker_width = 0.2

marker_colour = "000000"
marker_fill = "ffcc00"
marker_width = 1.4 

# List of dicts, dicst contain Type of Country, City or LatLong and descs
# Contains all the countries which will end up being highlighted
profiles = [
        {"Country": "Australia", "Capital": "Canberra", "Type": "Country",
     "RulingParty": "Australian Labor Party", "Opposition": "Liberal-Nationals Coalition",
     "Religion1": "No Religion (38.7%)", "Religion2": "Catholic (19.6%)"}
        ] 


world = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")

def attach_country_profile(p):
    fc = world.filter(ee.Filter.eq('country_na', p["Country"]))
    return fc.map(lambda f: f.set(p))

# TODO
def attach_city_profile(p):
    fc = world.filter(ee.Filter.eq('country_na', p["Country"]))
    return fc.map(lambda f: f.set(p))

# TODO
def attach_latlong_profile(p):
    fc = world.filter(ee.Filter.eq('country_na', p["Country"]))
    return fc.map(lambda f: f.set(p))

marker_fc = ee.FeatureCollection([])
for p in profiles:
    if p["Type"] == "Country":
        marker_fc = marker_fc.merge(attach_country_profile(p))


extent = ee.Geometry.Rectangle([-70, -50, 30, 40], geodesic=False)
non_marker_fc = world.filter(ee.Filter.Not(ee.Filter.intersects('.geo', extent)))

m = gf.Map(center=[-10, 140], zoom=3)
m.add_basemap("CartoDB.Positron")

non_marker_style = non_marker_fc.style(color=non_marker_colour, fillColor=non_marker_fill, width=non_marker_width)
marker_style     = marker_fc.style(color=marker_colour, fillColor=marker_fill, width=marker_width)

m.addLayer(non_marker_style, {}, "Non–Indo-Pacific (blue)", True, 0.18)
m.addLayer(marker_style, {}, "Indo-Pacific (polygons)")


centroids = marker_fc.map(lambda f: ee.Feature(f.geometry().centroid(1), f.toDictionary()))
gj = geemap.ee_to_geojson(centroids)

diamond_html = """
<div style="
  width:14px;height:14px;
  background:#ffcc00;
  border:2px solid white;
  transform: rotate(45deg);
  box-shadow: 0 0 3px rgba(0,0,0,0.35);
"></div>
"""

marker_group = folium.FeatureGroup(name="Country markers", show=True)

for feat in gj["features"]:
    lon, lat = feat["geometry"]["coordinates"]
    p = feat["properties"]

    popup_html = f"""
    <div style="font-family:system-ui;min-width:240px;line-height:1.35">
      <div style="font-weight:700;margin-bottom:4px">{p.get('Country','')}</div>
      <div><b>Capital:</b> {p.get('Capital','') or '—'}</div>
      <div><b>Ruling:</b> {p.get('RulingParty','') or '—'}</div>
      <div><b>Opposition:</b> {p.get('Opposition','') or '—'}</div>
      <div><b>Religions:</b> {p.get('Religion1','') or '—'}{', ' if p.get('Religion2') else ''}{p.get('Religion2','')}</div>
    </div>
    """

    folium.Marker(
        location=[lat, lon],
        popup=folium.Popup(popup_html, max_width=280),
        icon=folium.DivIcon(html=diamond_html)
    ).add_to(marker_group)

marker_group.add_to(m)
folium.LayerControl(collapsed=False).add_to(m)

# m.addLayer(extent, {"color": "FF0000"}, "Study extent", False)
# m.addLayerControl()
# m.to_html("./public/module/geemaps/geemap_id_1.html", title="Module 1", width="100%", height="800px")
m.save("./public/module/geemaps/geemap_id_1.html")




