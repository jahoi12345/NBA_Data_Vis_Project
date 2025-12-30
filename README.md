# NBA Data Visualization Project

**Have NBA players gotten better?**

An interactive data visualization project exploring NBA player performance trends and shot patterns across multiple seasons (2004-2024). This project provides comprehensive visualizations of player statistics, shot charts, and performance metrics to answer the question: "Have NBA players gotten better over time?"

## Live Demo

**[View the live application →](https://jahoi12345.github.io/NBA_Data_Vis_Project/)**

## Features

- **Season-by-Season Analysis**: Explore NBA data from 2004 to 2024
- **Shot Visualizations**: 
  - Shot charts with grid and hexbin visualizations
  - Per-season shot data analysis
- **Player Statistics**: 
  - Player season averages
  - Usage and performance metrics
  - League-wide statistics
- **Interactive Visualizations**: Explore trends and patterns in NBA player performance over two decades

## Data Sources

The project includes comprehensive NBA data:

- **Per-Season Shots**: Detailed shot data for each season (2004-2024)
- **Shot Grids**: Processed shot data in grid format
- **Shot Hexbins**: Hexagonal binning visualizations of shot locations
- **Player Statistics**: 
  - `player_season_averages.csv`: Individual player performance metrics
  - `player_stats_usage_rs.csv`: Player usage statistics
  - `nba_avgs_per_season.csv`: League-wide averages per season

## Technologies

- **Vite**: Build tool and development server
- **JavaScript/ES6+**: Modern JavaScript features
- **Data Visualization Libraries**: For creating interactive charts and visualizations
- **CSV/JSON Data Processing**: Handling large datasets efficiently

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jahoi12345/NBA_Data_Vis_Project.git
cd NBA_Data_Vis_Project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 📂 Project Structure

```
nba_players_viz/
├── src/                    # Source files
│   ├── assets/            # Static assets
│   ├── data/              # Data files
│   └── utils/             # Utility functions
├── per_season_shots/      # Raw shot data (CSV)
├── per_season_shots_grid/ # Processed shot grids (JSON)
├── dist/                  # Production build output
└── public/                # Public assets
```

## Key Questions Explored

- How have shooting percentages changed over time?
- What are the trends in shot selection and location?
- How has player performance evolved across different metrics?
- Are modern NBA players statistically better than players from previous eras?

## License

This project is open source and available for educational and research purposes.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## Author

**jahoi12345**

---

*Built with ❤️ for NBA data enthusiasts*
