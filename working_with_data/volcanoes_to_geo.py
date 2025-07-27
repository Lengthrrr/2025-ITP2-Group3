import pandas as pd
import geopandas as gpd

# Load the Excel file
df = pd.read_excel("Example_Data_From_Client/volcanoes.xlsx", skiprows=1, engine="openpyxl")

print(df.head())
# Optional: drop rows missing coordinates
df = df.dropna(subset=["Latitude", "Longitude"])

# Create GeoDataFrame with WGS84 projection
gdf = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df["Longitude"], df["Latitude"]),
    crs="EPSG:4326"
)

# Export to GeoJSON with all columns intact
gdf.to_file("volcanoes.geojson", driver="GeoJSON")

