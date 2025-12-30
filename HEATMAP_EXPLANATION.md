# NBA Shot Heat Map Explanation

## How the ArcGIS Example Creates the Heat Map

### Overview
The example uses **pre-generated hexagonal bins** stored in an ArcGIS Feature Service, not client-side aggregation.

### Key Components:

#### 1. **FeatureLayer with Hexbins**
```javascript
var hexbinsFeatureServiceUrl = 'https://services1.arcgis.com/.../StephCurry_2016_17_WFL1/FeatureServer/0';
var featureLayer = new FeatureLayer({
  url: hexbinsFeatureServiceUrl,
  definitionExpression: 'GAME_DATE = \'2016-10-25\'',
  renderer: renderer
});
```
- **Hexbins are pre-generated** on the server (not created client-side)
- Each hexbin polygon has a `Point_Count` attribute (number of shots)
- Uses `definitionExpression` to filter by date (like our season filter)

#### 2. **SimpleRenderer with Visual Variables**
```javascript
var renderer = new SimpleRenderer({
  symbol: new PolygonSymbol3D({
    symbolLayers: [new ExtrudeSymbol3DLayer()]
  }),
  visualVariables: [
    { type: 'size', field: 'Point_Count', stops: [...] },
    { type: 'color', field: 'Point_Count', stops: [...] }
  ]
});
```

**Size Stops (Height):**
- `1 → 10` feet
- `2 → 20` feet
- `4 → 40` feet
- `8 → 80` feet
- `14 → 140` feet
- `24 → 240` feet

**Color Stops:**
- `1 → [212, 227, 245]` (light blue)
- `2 → [133, 154, 250]` (blue)
- `4 → [62, 90, 253]` (darker blue)
- `8 → [10, 42, 244]` (dark blue)
- `14 → [132, 149, 122]` (green)
- `24 → [255, 255, 0]` (yellow)

#### 3. **How It Works:**
1. **Pre-processing**: Hexagonal bins are created server-side with shot counts
2. **Filtering**: `definitionExpression` filters hexbins by date
3. **Rendering**: ArcGIS automatically:
   - Looks up each hexbin's `Point_Count`
   - Finds the appropriate size/color stop
   - Extrudes the hexagon to the specified height
   - Colors it according to the stop

#### 4. **Minimum/Maximum:**
- **Minimum shots for display**: `1` (value: 1, size: 10 feet, light blue)
- **Maximum height**: `240` feet (when `Point_Count >= 24`, yellow)
- **How many shots needed**: 
  - Minimum: **1 shot** (displays at 10 feet, light blue)
  - Maximum: **24+ shots** (displays at 240 feet, yellow)

---

## Our Implementation

### Differences:

#### 1. **Data Source:**
- **Example**: Pre-generated hexbins in Feature Service
- **Ours**: Pre-aggregated rectangular grid cells in JSON files

#### 2. **Grid Layout:**
- **Example**: True hexagonal grid (pre-generated on server)
- **Ours**: Rectangular grid converted to hexagonal visual layout (offset rows)

#### 3. **Minimum Threshold:**
- **Example**: 1 shot minimum
- **Ours**: **5 shots minimum** (configurable via `MIN_SHOTS`)

#### 4. **Height/Color Mapping:**
- **Example**: Fixed stops (1, 2, 4, 8, 14, 24)
- **Ours**: Dynamic stops based on percentiles of the data:
  - 5 shots → 10 feet (green)
  - 10th percentile → 30 feet
  - 25th percentile → 60 feet
  - 50th percentile → 120 feet
  - 75th percentile → 180 feet
  - Maximum → 240 feet (dark red)

#### 5. **Color Scheme:**
- **Example**: Blue gradient (light blue → yellow)
- **Ours**: Green → Yellow → Red gradient

### Our Current Settings:

**Minimum Shots Required:** `5 shots`
- Any cell with fewer than 5 shots is **not displayed**

**Height Range:**
- **Minimum**: `10 feet` (5 shots)
- **Maximum**: `240 feet` (cell with most shots in that season)

**Shot Counts for Heights:**
- `5 shots` → 10 feet
- `~10th percentile` → 30 feet
- `~25th percentile` → 60 feet
- `~50th percentile` → 120 feet
- `~75th percentile` → 180 feet
- `Maximum count` → 240 feet

**Example for 2004 Season:**
- Minimum: 5 shots → 10 feet
- Maximum: 47,795 shots → 240 feet
- The exact percentile stops depend on the distribution of shot counts

---

## Hexagonal Grid Layout

### How Our Hexagonal Grid Works:

1. **Preprocessing**: Creates rectangular 1-foot grid cells
2. **Visual Conversion**: Converts rectangular positions to hexagonal layout:
   - Even rows: hexagons align normally
   - Odd rows: hexagons offset by half hex width
   - Creates proper hexagonal tiling pattern

3. **Spacing:**
   - Hexagon radius: 1 foot (in court coordinates)
   - Horizontal spacing: `√3 × radius` between hex centers
   - Vertical spacing: `1.5 × radius` between hex centers

This creates a true hexagonal grid visualization, even though the underlying data is aggregated in a rectangular grid.

