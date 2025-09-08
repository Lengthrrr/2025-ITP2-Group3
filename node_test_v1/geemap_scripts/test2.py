import sys, re
import ee
import geemap
from ipyleaflet import Map, Marker, DivIcon, Popup, GeoJSON
from ipywidgets import HTML

# -------------------------------
# Authenticate with Service Account
# -------------------------------
if len(sys.argv) < 2:
    print("Usage: python3 create_geemap.py commands.txt")
    sys.exit(1)

commands_file = sys.argv[1]

service_account = "googleearthengine-932@ee-saoisactuallygood.iam.gserviceaccount.com"
credentials = ee.ServiceAccountCredentials(service_account, "./secret/google-earth-key.json")
ee.Initialize(credentials)

# -------------------------------
# Read commands.txt
# -------------------------------
with open(commands_file, "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f if line.strip() and not line.startswith("#")]

# -------------------------------
# Globals
# -------------------------------
m = geemap.Map()
m.add_basemap("CartoDB.Positron")

current_country_palette = "default"
current_palette = {}
markers_palette = {}
country_info = {}
layers = {}
current_layer = None

# Hardcoded city coords
city_coords = {"Tokyo":[35.682839,139.759455], "Sydney":[-33.8688,151.2093]}

# Map country names for EE
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
        # Already added above
        pass

    # PALETTES
    elif line.startswith("pallete add_country"):
        parts = line.split()
        name = parts[2]
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
                k,v = lines[i].split("=",1)
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
# Build each layer as a single EE FeatureCollection
# -------------------------------
for layer_name, countries in layers.items():
    print(f"Processing layer: {layer_name} ({len(countries)} countries)")
    fc_layer = ee.FeatureCollection([])
    for idx, (country, palette_name) in enumerate(countries):
        mapped_name = country_name_map.get(country,country)
        fc_country = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").filter(
            ee.Filter.eq("country_na", mapped_name))
        props = country_info.get(country,{})
        fc_country = fc_country.map(lambda f, p=props: f.set(p))
        fc_layer = fc_layer.merge(fc_country)
        print(f"  Step {idx+1}/{len(countries)}: {country}")
    # Convert once
    gj = geemap.ee_to_geojson(fc_layer)
    style = current_palette.get(countries[0][1], {"fill":"ffffff","width":1})
    gj_layer = GeoJSON(
        data=gj,
        style={
            "fillColor": f"#{style['fill']}",
            "color": f"#{style['fill']}",
            "weight": style['width'],
            "fillOpacity": 0.6
        }
    )
    m.add_layer(gj_layer)


# -------------------------------
# Add Layer control and save HTML
# -------------------------------
m.add_control(geemap.LayerControl())
m.to_html("six.html")
print("Map saved to six.html")
