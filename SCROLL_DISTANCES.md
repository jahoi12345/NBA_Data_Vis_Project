# Scroll Distances for Pace and Offensive Efficiency Graph

## Section Structure

The Pace and Offensive Efficiency section has the following structure:

1. **Sticky Chart**: `h-screen` = **100vh** (1 viewport height)
2. **Initial Spacer**: **150vh** (scroll past chart)
3. **Era 1 Spacer**: **150vh** (Deadball Era active)
4. **Era 2 Spacer**: **150vh** (Early Modern active)
5. **Era 3 Spacer**: **150vh** (Three-Point Revolution active)

**Total Section Height**: 700vh (7 viewport heights)

---

## Scroll Distances from Section Start

All distances are measured from the **beginning** of the Pace and Offensive Efficiency section (`dualAxisSectionRef.offsetTop`):

| Point | Distance (vh) | Description |
|-------|---------------|-------------|
| **Section Start** | 0vh | Beginning of Pace and Offensive Efficiency section |
| **End of Sticky Chart** | 100vh | Chart becomes unsticky, scrolling begins |
| **Start of Era 1** | 250vh | Deadball Era (1997-2004) highlight begins |
| **Start of Era 2** | 400vh | Early Modern / Fast-Break Era (1979-1989) highlight begins |
| **Start of Era 3** | 550vh | Three-Point Revolution (2013-2019) highlight begins |
| **End of Section** | 700vh | Section ends, next section begins |

---

## Scroll Distances in Pixels

**Note**: `vh` units are relative to viewport height. To convert to pixels:
- **1vh = viewportHeight / 100 pixels**

### Example Calculations:

#### For 800px viewport height:
- 1vh = 8px
- **Section Start**: 0px
- **End of Sticky Chart**: 800px (100vh × 8px)
- **Start of Era 1**: 2,000px (250vh × 8px)
- **Start of Era 2**: 3,200px (400vh × 8px)
- **Start of Era 3**: 4,400px (550vh × 8px)
- **End of Section**: 5,600px (700vh × 8px)

#### For 1000px viewport height:
- 1vh = 10px
- **Section Start**: 0px
- **End of Sticky Chart**: 1,000px (100vh × 10px)
- **Start of Era 1**: 2,500px (250vh × 10px)
- **Start of Era 2**: 4,000px (400vh × 10px)
- **Start of Era 3**: 5,500px (550vh × 10px)
- **End of Section**: 7,000px (700vh × 10px)

#### For 1080px viewport height:
- 1vh = 10.8px
- **Section Start**: 0px
- **End of Sticky Chart**: 1,080px (100vh × 10.8px)
- **Start of Era 1**: 2,700px (250vh × 10.8px)
- **Start of Era 2**: 4,320px (400vh × 10.8px)
- **Start of Era 3**: 5,940px (550vh × 10.8px)
- **End of Section**: 7,560px (700vh × 10.8px)

---

## Era Active Ranges

Each era is active for **150vh** of scroll:

- **Deadball Era**: Active from 250vh to 400vh (150vh duration)
- **Early Modern Era**: Active from 400vh to 550vh (150vh duration)
- **Three-Point Revolution**: Active from 550vh to 700vh (150vh duration)

---

## Formula for Any Viewport Height

To calculate pixel distances for any viewport height:

```javascript
const viewportHeight = window.innerHeight; // in pixels
const vhToPixels = viewportHeight / 100;

const distances = {
  sectionStart: 0,
  endOfStickyChart: 100 * vhToPixels,
  startOfEra1: 250 * vhToPixels,
  startOfEra2: 400 * vhToPixels,
  startOfEra3: 550 * vhToPixels,
  endOfSection: 700 * vhToPixels
};
```

---

## Current Implementation

The scroll tracking in `App.jsx` calculates:
- `scrollPastSection = scrollY - sectionTop`
- Era 1 starts at: `viewportHeight * 2.5` (250vh)
- Era 2 starts at: `viewportHeight * 4.0` (400vh)
- Era 3 starts at: `viewportHeight * 5.5` (550vh)

