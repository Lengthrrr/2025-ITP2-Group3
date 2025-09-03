import sys, re
import ee
import geemap
from ipyleaflet import Map, Marker, DivIcon, Popup, LayerGroup
from ipywidgets import HTML

# -------------------------------
# Setup EE
# -------------------------------
if len(sys.argv) < 2:
    print("Usage: python3 create_geemap.py commands.txt")
    sys.exit(1)

commands_file = sys.argv[1]

ee.Initialize(project="ee-saoisactuallygood")

with open(commands_file, "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f if line.strip() and not line.startswith("#")]

# -------------------------------
# Globals
# -------------------------------
m = Map(center=[-10, 140], zoom=3)
current_country_palette = "default"
current_palette = {}
markers_palette = {}
country_info = {}
layers = {}
current_layer = None
city_coords = {"Tokyo":[35.682839,139.759455],"Sydney":[-33.8688,151.2093]}

country_name_map = {"Korea, South":"Republic of Korea","Korea, North":"Democratic People's Republic of Korea"}

# -------------------------------
# Parse commands.txt
# -------------------------------
i = 0
while i < len(lines):
    line = lines[i]

    # CONFIG
    if line.startswith("config map_center"):
        center = line.split("map_center")[1].strip()
        if "," in center:
            lat, lon = [float(x) for x in center.split(",")]
            m.center = (lat, lon)
        else:
            try:
                fc = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").filter(
                    ee.Filter.eq("country_na", center))
                centroid = fc.geometry().centroid().getInfo()['coordinates']
                m.center = (centroid[1], centroid[0])
            except:
                print(f"Could not center on {center}")
    elif line.startswith("config map_zoom"):
        m.zoom = int(line.split("map_zoom")[1].strip())

    elif line.startswith("config basemap"):
        m.add_basemap(line.split("config basemap")[1].strip())

    # PALETTES
    elif line.startswith("pallete add_country"):
        name = line.split()[2]
        fill = re.search(r"fill=([0-9a-f]+)", line)
        width = re.search(r"width=([\d\.]+)", line)
        current_palette[name] = {
            "fill": fill.group(1) if fill else "ffffff",
            "width": float(width.group(1)) if width else 1
        }
    elif line.startswith("pallete set_country"):
        current_country_palette = line.split("pallete set_country")[1].strip()

    elif line.startswith("pallete add_marker"):
        name = line.split()[2]
        fill = re.search(r"fill=([0-9a-f]+)", line)
        markers_palette[name] = {"fill": fill.group(1) if fill else "ffcc00"}

    # LAYERS
    elif line.startswith("layer"):
        current_layer = line.split("layer")[1].strip()
        layers[current_layer] = []

    elif line.startswith("add country") and current_layer:
        country = line.split("add country")[1].strip()
        layers[current_layer].append((country, current_country_palette))

    # METADATA
    elif line.startswith("modify country description"):
        country_name = line.split("modify country description")[1].strip()
        i += 1
        info = {}
        while i < len(lines) and not lines[i].startswith("%%%"):
            if "=" in lines[i]:
                k, v = lines[i].split("=",1)
                info[k.strip()] = v.strip().strip('"')
            i += 1
        country_info[country_name] = info

    # MARKERS
    elif line.startswith("marker country"):
        name = line.split("marker country")[1].strip()
        if name in city_coords:
            lat, lon = city_coords[name]
        else:
            mapped_name = country_name_map.get(name,name)
            try:
                fc = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").filter(
                    ee.Filter.eq("country_na", mapped_name))
                centroid = fc.geometry().centroid().getInfo()['coordinates']
                lon, lat = centroid
            except:
                print(f"Could not find {name}")
                i += 1
                continue

        props = country_info.get(name,{})
        popup_html = HTML(f"""
            <div style='font-family:system-ui; min-width:220px'>
            <b>{props.get('Country',name)}</b><br/>
            <b>Capital:</b> {props.get('Capital','')}<br/>
            <b>Ruling:</b> {props.get('RulingParty','')}<br/>
            <b>Opposition:</b> {props.get('Opposition','')}<br/>
            <b>Religions:</b> {props.get('Religion1','')}, {props.get('Religion2','')}
            </div>
        """)
        marker_html = f"""
            <div style='width:14px;height:14px;background:#{markers_palette['diamond_marker']['fill']};
                        border:2px solid white; transform: rotate(45deg);
                        box-shadow:0 0 3px rgba(0,0,0,0.35)'></div>
        """
        marker = Marker(location=(lat, lon), icon=DivIcon(html=marker_html))
        marker.popup = Popup(child=popup_html,max_width=260)
        m.add_layer(marker)

    i += 1

# -------------------------------
# Draw polygons as LayerGroups
# -------------------------------
for layer_name, countries in layers.items():
    print(f"Adding layer: {layer_name}")
    lg = LayerGroup()
    for country, palette_name in countries:
        try:
            fc = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").filter(
                ee.Filter.eq("country_na", country_name_map.get(country,country)))
            style = current_palette.get(palette_name,{"fill":"ffffff","width":1})
            gj = geemap.ee_to_geojson(fc)
            from ipyleaflet import GeoJSON
            GeoJSON(data=gj, style={'fillColor':f"#{style['fill']}",'color':f"#{style['fill']}",'weight':style['width']}).add_to(lg)
        except:
            print(f"Could not add {country}")
    m.add_layer(lg)

# -------------------------------
# Add layer control
# -------------------------------
m.add_control(geemap.LayerControl())
m.to_html("four.html")
