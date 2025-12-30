import { useState, useEffect, useRef } from "react";
import FTPercentChart from "./components/FTPercentChart";
import SeparatedCharts from "./components/SeparatedCharts";
import FloatingTextBox from "./components/FloatingTextBox";
import LollipopChart from "./components/LollipopChart";
import DualAxisChart from "./components/DualAxisChart";
import LeagueAverageUsageChart from "./components/LeagueAverageUsageChart";
import CourtView from "./components/CourtView";
import ShotHeatMapArcGIS from "./components/ShotHeatMapArcGIS";
import NormalizedOffenseChart from "./components/NormalizedOffenseChart";
import { parseNBAData } from "./utils/parseCSV";
import { loadPlayerAverages } from "./utils/loadPlayerAverages";
import { loadUsageData } from "./utils/loadUsageData";
import { loadShotData } from "./utils/loadShotData";
import nbaLogo from "./assets/nba_logo_text.png";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [chartVisible, setChartVisible] = useState(false);
  const [showSeparated, setShowSeparated] = useState(false);
  const [playerStatsData, setPlayerStatsData] = useState([]);
  const [playerStatsLoading, setPlayerStatsLoading] = useState(true);
  const [usageData, setUsageData] = useState({ leagueAverage: [] });
  const [usageDataLoading, setUsageDataLoading] = useState(true);
  const [shotData, setShotData] = useState([]);
  const [shotDataLoading, setShotDataLoading] = useState(true);
  const chartSectionRef = useRef(null);
  const separatedSectionRef = useRef(null);
  const lollipopSectionRef = useRef(null);
  const dualAxisSectionRef = useRef(null);
  const leagueUsageSectionRef = useRef(null);
  const normalizedOffenseSectionRef = useRef(null);
  const shotHeatmapSectionRef = useRef(null);
  const [lollipopVisible, setLollipopVisible] = useState(false);
  const [dualAxisVisible, setDualAxisVisible] = useState(false);
  const [leagueUsageVisible, setLeagueUsageVisible] = useState(false);
  const [normalizedOffenseVisible, setNormalizedOffenseVisible] = useState(false);
  const [shotHeatmapVisible, setShotHeatmapVisible] = useState(false);
  const [leagueUsageScrollProgress, setLeagueUsageScrollProgress] = useState(0);
  const [activeEraIndex, setActiveEraIndex] = useState(null);
  
  // Track if text boxes should be shown (based on state changes)
  const [textBoxShown, setTextBoxShown] = useState({
    lollipop: false,
    dualAxis: false,
    dualAxisEra1: false,
    dualAxisEra2: false,
    dualAxisEra3: false,
    ftPercent: false,
    separated: false,
    leagueUsage: false,
    leagueUsageOutliers: false,
    leagueUsageZoom: false,
    shotHeatmap: false,
    normalizedOffense: false,
  });
  const [textBoxOffsets, setTextBoxOffsets] = useState({
    lollipop: 0,
    dualAxisInitial: 0,
    dualAxisEra1: 0,
    dualAxisEra2: 0,
    dualAxisEra3: 0,
    separated: 0,
    leagueUsage: 0,
    shotHeatmap: 0,
    normalizedOffense: 0,
  });

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔄 State update - showSeparated:', showSeparated, 'chartVisible:', chartVisible);
  }, [showSeparated, chartVisible]);


  /* -------------------------------
     LOAD DATA
  --------------------------------*/
  useEffect(() => {
    async function loadData() {
      const parsed = await parseNBAData();
      setData(parsed);
      setLoading(false);
    }
    loadData();
  }, []);

  /* -------------------------------
     LOAD PLAYER STATISTICS DATA
  --------------------------------*/
  useEffect(() => {
    async function loadPlayerStats() {
      setPlayerStatsLoading(true);
      try {
        const seasonCounts = await loadPlayerAverages();
        setPlayerStatsData(seasonCounts);
        setPlayerStatsLoading(false);
      } catch (error) {
        console.error('Error loading player statistics:', error);
        setPlayerStatsLoading(false);
      }
    }
    loadPlayerStats();
  }, []);

  /* -------------------------------
     LOAD USAGE DATA
  --------------------------------*/
  useEffect(() => {
    async function loadUsage() {
      setUsageDataLoading(true);
      try {
        const data = await loadUsageData();
        setUsageData(data);
        setUsageDataLoading(false);
      } catch (error) {
        console.error('Error loading usage data:', error);
        setUsageDataLoading(false);
      }
    }
    loadUsage();
  }, []);

  /* -------------------------------
     LOAD SHOT DATA
  --------------------------------*/
  useEffect(() => {
    async function loadShots() {
      setShotDataLoading(true);
      try {
        console.log('🔥 App: Loading shot data...');
        const shots = await loadShotData();
        console.log('🔥 App: Shot data loaded:', shots.length, 'shots');
        setShotData(shots);
        setShotDataLoading(false);
      } catch (error) {
        console.error('🔥 App: Error loading shot data:', error);
        setShotDataLoading(false);
      }
    }
    loadShots();
  }, []);


  /* -------------------------------
     SCROLL POSITION (Throttled for performance)
  --------------------------------*/
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* -------------------------------
     INTERSECTION OBSERVER
  --------------------------------*/
  useEffect(() => {
    if (!chartSectionRef.current) {
      console.log('⚠️ chartSectionRef is null');
      return;
    }

    console.log('📊 Setting up intersection observer for chart section');

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('👁️ Chart section intersection:', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          boundingClientRect: entry.boundingClientRect
        });
        
        if (entry.isIntersecting) {
          console.log('✅ Chart section entered viewport - setting chartVisible to true');
          setChartVisible(true);
        }
        // Don't set chartVisible to false when leaving - keep it true once animated
      },
      { threshold: [0, 0.1, 0.5, 1.0] }
    );

    observer.observe(chartSectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* -------------------------------
     SCROLL-BASED SEPARATION TRIGGER
  --------------------------------*/
  useEffect(() => {
    console.log('🔄 Setting up scroll handler - showSeparated:', showSeparated);
    
    if (showSeparated) {
      console.log('⏭️ Skipping scroll handler - already separated');
      return;
    }
    
    const handleScroll = () => {
      if (showSeparated) {
        console.log('⏭️ Scroll handler: already separated, returning');
        return;
      }
      
      if (!chartSectionRef.current) {
        console.log('⚠️ Scroll handler: chartSectionRef is null');
        return;
      }
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionRect = chartSectionRef.current.getBoundingClientRect();
      
      // Get absolute positions
      const sectionTop = chartSectionRef.current.offsetTop;
      const sectionHeight = chartSectionRef.current.offsetHeight;
      const sectionBottom = sectionTop + sectionHeight;
      
      // Calculate how much we've scrolled past the section
      const scrollPastSection = scrollY - sectionTop;
      const sectionProgress = scrollPastSection / sectionHeight;
      
      // Log every 200px of scroll or when near trigger point
      if (Math.floor(scrollY) % 200 === 0 || scrollY < 100 || (scrollY > sectionTop && scrollY < sectionBottom + 500)) {
        console.log('📍 Scroll Debug:', {
          scrollY: Math.round(scrollY),
          windowHeight: Math.round(windowHeight),
          sectionTop: Math.round(sectionTop),
          sectionHeight: Math.round(sectionHeight),
          sectionBottom: Math.round(sectionBottom),
          sectionRectBottom: Math.round(sectionRect.bottom),
          scrollPastSection: Math.round(scrollPastSection),
          sectionProgress: (sectionProgress * 100).toFixed(1) + '%',
          // Trigger conditions
          cond1: scrollY > sectionBottom - windowHeight * 1.5,
          cond2: sectionRect.bottom < windowHeight * 0.4,
          cond3: scrollPastSection > sectionHeight * 0.5,
          cond4: scrollPastSection > sectionHeight * 0.4 && scrollY > windowHeight * 2,
          cond5: scrollY > windowHeight * 2.5
        });
      }
      
      // Improved trigger conditions - more lenient
      // Condition 1: Scrolled past most of the section (accounting for sticky)
      const condition1 = scrollY > sectionBottom - windowHeight * 1.5;
      // Condition 2: Section bottom is well above viewport
      const condition2 = sectionRect.bottom < windowHeight * 0.4 && scrollY > sectionTop + sectionHeight * 0.3;
      // Condition 3: Scrolled past 50% of section height AND past 1.5 viewport heights
      const condition3 = scrollPastSection > sectionHeight * 0.5 && scrollY > windowHeight * 1.5;
      // Condition 4: Simple check - scrolled past 40% of section AND past 2 viewport heights
      const condition4 = scrollPastSection > sectionHeight * 0.4 && scrollY > windowHeight * 2;
      // Condition 5: Very simple - just scrolled past 2.5 viewport heights (safety net)
      const condition5 = scrollY > windowHeight * 2.5;
      
      if (condition1 || condition2 || condition3 || condition4 || condition5) {
        console.log('✅✅✅ TRIGGERING SEPARATION!', {
          condition1,
          condition2,
          condition3,
          condition4,
          condition5,
          scrollY: Math.round(scrollY),
          sectionBottom: Math.round(sectionBottom),
          sectionRectBottom: Math.round(sectionRect.bottom),
          scrollPastSection: Math.round(scrollPastSection),
          sectionProgress: (sectionProgress * 100).toFixed(1) + '%',
          windowHeight: Math.round(windowHeight)
        });
        setShowSeparated(true);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    console.log('✅ Scroll listener attached');
    handleScroll(); // Check on mount
    
    return () => {
      console.log('🧹 Cleaning up scroll listener');
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [showSeparated]);

  const [separatedVisible, setSeparatedVisible] = useState(false);

  /* -------------------------------
     DUAL AXIS CHART VISIBILITY
  --------------------------------*/
  useEffect(() => {
    if (!dualAxisSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDualAxisVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(dualAxisSectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* -------------------------------
     DUAL AXIS ERA TRACKING
  --------------------------------*/
  useEffect(() => {
    const handleScroll = () => {
      if (!dualAxisSectionRef.current) return;
      
      const sectionTop = dualAxisSectionRef.current.offsetTop;
      const scrollY = window.scrollY;
      const scrollPastSection = scrollY - sectionTop;
      const viewportHeight = window.innerHeight;
      
      // Eras start after 150vh initial display
      // Each era lasts 100vh (doubled from 50vh)
      // Total era scroll: 100vh * 3 = 300vh
      // Total sticky distance: 150vh (initial) + 300vh (eras) = 450vh
      
      const initialDisplayPeriod = viewportHeight * 1.5; // 150vh
      const eraScrollDistance = viewportHeight * 1.0; // 100vh per era (doubled)
      
      if (scrollPastSection < initialDisplayPeriod) {
        setActiveEraIndex(null); // No era active - still in initial display period
      } else if (scrollPastSection < initialDisplayPeriod + eraScrollDistance) {
        setActiveEraIndex(0); // Early Modern / Fast-Break Era (1979-1989)
      } else if (scrollPastSection < initialDisplayPeriod + eraScrollDistance * 2) {
        setActiveEraIndex(1); // Deadball Era (1997-2004)
      } else if (scrollPastSection < initialDisplayPeriod + eraScrollDistance * 3) {
        setActiveEraIndex(2); // Three-Point Revolution (2013-2019)
      } else {
        setActiveEraIndex(null); // Past all eras
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* -------------------------------
     LOLLIPOP CHART VISIBILITY
  --------------------------------*/
  useEffect(() => {
    if (!lollipopSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLollipopVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(lollipopSectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* -------------------------------
     LEAGUE USAGE CHART VISIBILITY
  --------------------------------*/
  useEffect(() => {
    if (!leagueUsageSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLeagueUsageVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(leagueUsageSectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* -------------------------------
     NORMALIZED OFFENSE CHART VISIBILITY
  --------------------------------*/
  useEffect(() => {
    if (!normalizedOffenseSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNormalizedOffenseVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(normalizedOffenseSectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* -------------------------------
     SHOT HEAT MAP VISIBILITY
  --------------------------------*/
  useEffect(() => {
    if (!shotHeatmapSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShotHeatmapVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(shotHeatmapSectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* -------------------------------
     LEAGUE USAGE CHART SCROLL TRACKING
  --------------------------------*/
  useEffect(() => {
    const handleScroll = () => {
      if (!leagueUsageSectionRef.current) return;
      
      const sectionTop = leagueUsageSectionRef.current.offsetTop;
      const scrollY = window.scrollY;
      const scrollPastSection = scrollY - sectionTop;
      const viewportHeight = window.innerHeight;
      
      // Three phases:
      // Phase 1: 0-150vh - Zoomed out (25-40%), animate left to right
      // Phase 2: 150vh-300vh - Zoomed out (25-40%), highlight outliers
      // Phase 3: 300vh-450vh - Zoom into 2010+
      
      const phase1End = viewportHeight * 1.5; // 150vh
      const phase2End = viewportHeight * 3.0; // 300vh
      const phase3End = viewportHeight * 4.5; // 450vh
      
      let progress = 0;
      
      if (scrollPastSection < phase1End) {
        // Phase 1: Zoomed out, animate left to right
        progress = scrollPastSection / phase1End; // 0 to 1
      } else if (scrollPastSection < phase2End) {
        // Phase 2: Zoomed out, show outliers
        progress = 1 + (scrollPastSection - phase1End) / (phase2End - phase1End); // 1 to 2
      } else if (scrollPastSection < phase3End) {
        // Phase 3: Post-2010 zoom
        progress = 2 + (scrollPastSection - phase2End) / (phase3End - phase2End); // 2 to 3
      } else {
        progress = 3; // Past all phases
      }
      
      setLeagueUsageScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  /* -------------------------------
     SEPARATED CHARTS VISIBILITY
  --------------------------------*/
  useEffect(() => {
    console.log('🔍 Separated charts visibility check - showSeparated:', showSeparated);
    
    if (!showSeparated) {
      console.log('⏭️ Skipping - showSeparated is false');
      return;
    }
    
    if (!separatedSectionRef.current) {
      console.log('⚠️ separatedSectionRef is null');
      return;
    }

    // Check if already visible
    const checkVisibility = () => {
      if (separatedSectionRef.current) {
        const rect = separatedSectionRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        console.log('👁️ Separated section visibility check:', {
          rectTop: Math.round(rect.top),
          rectBottom: Math.round(rect.bottom),
          windowHeight: window.innerHeight,
          isVisible
        });
        
        if (isVisible) {
          console.log('✅ Separated section already visible - setting separatedVisible to true');
          setSeparatedVisible(true);
          return true;
        }
      }
      return false;
    };

    // Check immediately
    if (!checkVisibility()) {
      console.log('👀 Setting up intersection observer for separated section');
      const observer = new IntersectionObserver(
        ([entry]) => {
          console.log('👁️ Separated section intersection:', {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio
          });
          
          if (entry.isIntersecting) {
            console.log('✅ Separated section entered viewport - setting separatedVisible to true');
            setSeparatedVisible(true);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(separatedSectionRef.current);
      return () => {
        console.log('🧹 Cleaning up separated section observer');
        observer.disconnect();
      };
    }
  }, [showSeparated]);

  /* -------------------------------
     TEXT BOX VISIBILITY TRACKING
  --------------------------------*/
  // Track when text boxes should show based on state changes
  useEffect(() => {
    if (lollipopVisible && !textBoxShown.lollipop) {
      setTextBoxShown(prev => ({ ...prev, lollipop: true }));
    }
  }, [lollipopVisible, textBoxShown.lollipop]);

  useEffect(() => {
    if (dualAxisVisible && !textBoxShown.dualAxis) {
      setTextBoxShown(prev => ({ ...prev, dualAxis: true }));
    }
  }, [dualAxisVisible, textBoxShown.dualAxis]);

  // Era text boxes show whenever their era is active
  const showDualAxisEra1 = activeEraIndex === 0;
  const showDualAxisEra2 = activeEraIndex === 1;
  const showDualAxisEra3 = activeEraIndex === 2;

  useEffect(() => {
    if (chartVisible && !textBoxShown.ftPercent) {
      setTextBoxShown(prev => ({ ...prev, ftPercent: true }));
    }
  }, [chartVisible, textBoxShown.ftPercent]);

  useEffect(() => {
    if (separatedVisible && !textBoxShown.separated) {
      setTextBoxShown(prev => ({ ...prev, separated: true }));
    }
  }, [separatedVisible, textBoxShown.separated]);

  useEffect(() => {
    if (leagueUsageVisible && !textBoxShown.leagueUsage) {
      setTextBoxShown(prev => ({ ...prev, leagueUsage: true }));
    }
  }, [leagueUsageVisible, textBoxShown.leagueUsage]);

  // Outliers highlighted when progress is between 1 and 2
  const showLeagueUsageOutliers = leagueUsageScrollProgress >= 1 && leagueUsageScrollProgress < 2;
  
  // Zoom in when progress is between 2 and 3
  const showLeagueUsageZoom = leagueUsageScrollProgress >= 2 && leagueUsageScrollProgress < 3;

  useEffect(() => {
    if (shotHeatmapVisible && !textBoxShown.shotHeatmap) {
      setTextBoxShown(prev => ({ ...prev, shotHeatmap: true }));
    }
  }, [shotHeatmapVisible, textBoxShown.shotHeatmap]);

  useEffect(() => {
    if (normalizedOffenseVisible && !textBoxShown.normalizedOffense) {
      setTextBoxShown(prev => ({ ...prev, normalizedOffense: true }));
    }
  }, [normalizedOffenseVisible, textBoxShown.normalizedOffense]);


  return (
    <main className="bg-white text-gray-900">

      {/* ===============================
          HERO SECTION
      =============================== */}
      <section className="h-screen w-full flex items-center justify-center px-8 bg-white">
        <div className="max-w-4xl text-center">
          <img src={nbaLogo} alt="NBA" className="h-96 md:h-[30rem] mx-auto mb-6" style={{ backgroundColor: 'white' }} />
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            Have NBA Players Gotten Better?
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Scroll to explore how shooting accuracy has evolved across NBA history
          </p>
        </div>
      </section>

      {/* ===============================
          LOLLIPOP CHART SECTION
      =============================== */}
      <section
        ref={lollipopSectionRef}
        className="relative min-h-screen"
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-center justify-center z-10">
          <div className="w-full px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold mb-2">
                Elite Players Per Season
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Number of players averaging &gt;25 pts, &gt;5 reb, and &gt;5 ast per season (Regular Season only)
              </p>
            </div>

            {playerStatsLoading ? (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                Processing player statistics...
              </div>
            ) : (
              <div className="flex justify-center">
                <LollipopChart
                  data={playerStatsData}
                  width={Math.min(window.innerWidth - 80, 1400)}
                  height={500}
                  isVisible={lollipopVisible}
                />
              </div>
            )}
          </div>
        </div>

        {/* Spacer to allow scrolling past sticky chart */}
        <div className="h-[150vh]" />

        {/* Floating Text Box */}
        <FloatingTextBox 
          isVisible={textBoxShown.lollipop} 
          sectionRef={lollipopSectionRef}
          scrollPosition={scrollY}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Anomaly
          </h3>
          <p className="text-gray-700 leading-relaxed">
            After 2017, a significant number of players began averaging 25+ points, 5+ rebounds, and 5+ assists per season—something 
            historically unprecedented. This surge raises a fundamental question: are we witnessing stat inflation, or genuine evolution?
          </p>
        </FloatingTextBox>
      </section>

      {/* ===============================
          DUAL AXIS CHART SECTION
      =============================== */}
      <section
        ref={dualAxisSectionRef}
        className="relative"
        style={{ minHeight: '550vh' }} // 100vh (sticky element) + 450vh (spacer) = 550vh total
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-center justify-center z-10">
          <div className="w-full px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold mb-2">
                Pace and Offensive Efficiency
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                NBA pace (possessions per game) and points per 100 possessions over time
              </p>
            </div>

            {loading ? (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                Loading chart data…
              </div>
            ) : (
              <div className="flex justify-center">
              <DualAxisChart
                data={data}
                width={Math.min(window.innerWidth - 80, 1400)}
                height={500}
                isVisible={dualAxisVisible}
                activeEraIndex={activeEraIndex}
              />
              </div>
            )}
          </div>
        </div>

        {/* Spacer to allow scrolling past sticky chart and through all eras */}
        {/* The graph stays sticky until the last era is completely scrolled through */}
        {/* Initial display: 150vh */}
        {/* 3 eras at 100vh each = 300vh */}
        {/* Total sticky distance: 150vh + 300vh = 450vh */}
        <div className="h-[450vh]" />

        {/* Floating Text Boxes for Dual Axis Chart - Sequential behavior */}
        {/* Main text box: 0-35% of section scroll (longer range for slower scroll) */}
        <FloatingTextBox 
          isVisible={textBoxShown.dualAxis} 
          sectionRef={dualAxisSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0, 0.35]}
          stayCentered={false}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Pace Theory
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Pace is up—there are more possessions per game than in previous eras. But pace alone doesn't explain the efficiency jump. 
            Teams aren't just playing faster; they're playing smarter, solving the geometry of the game in ways that previous generations couldn't.
          </p>
        </FloatingTextBox>

        {/* Era 1: 30-50% of section scroll (fades in as main fades out, scrolls away) */}
        <FloatingTextBox 
          isVisible={showDualAxisEra1} 
          sectionRef={dualAxisSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.30, 0.50]}
          stayCentered={false}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Early Modern / Fast-Break Era (1979-1989)
          </h3>
          <p className="text-gray-700 leading-relaxed">
            The introduction of the three-point line in 1979 marked the beginning of a faster-paced era. Teams embraced 
            the fast break, leading to higher possession counts and a more open style of play.
          </p>
        </FloatingTextBox>

        {/* Era 2: 45-65% of section scroll (fades in as era 1 fades out, scrolls away) */}
        <FloatingTextBox 
          isVisible={showDualAxisEra2} 
          sectionRef={dualAxisSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.45, 0.65]}
          stayCentered={false}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Deadball Era (1997-2004)
          </h3>
          <p className="text-gray-700 leading-relaxed">
            This period saw a significant slowdown in pace as teams focused on half-court sets, physical defense, and 
            isolation plays. Possessions decreased while teams maintained relatively high efficiency through methodical offense.
          </p>
        </FloatingTextBox>

        {/* Era 3: 55-75% of section scroll (starts in center, scrolls away) */}
        <FloatingTextBox 
          isVisible={showDualAxisEra3} 
          sectionRef={dualAxisSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.55, 0.75]}
          stayCentered={false}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Three-Point Revolution (2013-2019)
          </h3>
          <p className="text-gray-700 leading-relaxed">
            The modern era has seen both pace and efficiency reach new heights. Teams prioritize three-point shooting, 
            spacing, and analytics-driven strategies, resulting in faster games with historically high offensive ratings.
          </p>
        </FloatingTextBox>
      </section>

      {/* ===============================
          SCROLLYTELLING SECTION
      =============================== */}
      <section
        ref={chartSectionRef}
        className="relative min-h-screen"
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-center justify-center z-10">
          <div className="w-full px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold mb-2">
                League Average Shooting Percentages
              </h2>
              <p className="text-lg text-gray-600">
                NBA FT%, FG%, and TS% by season (1979–80 onward)
              </p>
            </div>

            {loading ? (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                Loading chart data…
              </div>
            ) : (
              <div className="flex justify-center">
                <FTPercentChart
                  data={data}
                  width={Math.min(window.innerWidth - 80, 1400)}
                  height={500}
                  isVisible={chartVisible}
                />
              </div>
            )}
          </div>
        </div>

        {/* Spacer to allow scrolling past sticky chart */}
        <div className="h-[150vh]" />

        {/* ===============================
            FLOATING TEXT BOXES
        =============================== */}
        <FloatingTextBox 
          isVisible={textBoxShown.ftPercent} 
          sectionRef={chartSectionRef}
          scrollPosition={scrollY}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Rules Theory
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Rules have changed to favor offense—hand-checking restrictions, defensive three seconds, and other modifications. 
            But while rules create the conditions for higher scoring, they don't explain why players are hitting shots at historically 
            unprecedented rates. The math has changed, and players have adapted.
          </p>
        </FloatingTextBox>
      </section>

      {/* ===============================
          SEPARATED CHARTS SECTION
      =============================== */}
      {showSeparated && (
        <section
          ref={separatedSectionRef}
          className="relative min-h-screen"
        >
          {/* Sticky chart */}
          <div className="sticky top-0 h-screen flex items-center justify-center z-10">
            <div className="w-full px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-semibold mb-2">
                  Individual Shooting Metrics
                </h2>
                <p className="text-lg text-gray-600">
                  Each metric shown separately (1999–present)
                </p>
              </div>

              {!loading && (
                <SeparatedCharts
                  data={data}
                  width={Math.min(window.innerWidth - 80, 1400)}
                  height={500}
                  isVisible={separatedVisible}
                />
              )}
            </div>
          </div>

          {/* Spacer to allow scrolling past sticky chart */}
          <div className="h-[150vh]" />

          {/* Floating Text Box */}
          <FloatingTextBox 
            isVisible={textBoxShown.separated} 
            sectionRef={separatedSectionRef}
            scrollPosition={scrollY}
          >
            <h3 className="text-2xl font-semibold mb-3">
              The Skill Improvement
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Ever since 2000, we see each of these stats have increased. Players have genuinely improved their fundamental shooting 
              skills across the board—free throws, field goals, and overall efficiency. But this isn't just about individual skill; 
              it's about how the game itself has been optimized through analytics and strategic innovation.
            </p>
          </FloatingTextBox>
        </section>
      )}

      {/* ===============================
          LEAGUE AVERAGE USAGE CHART SECTION
      =============================== */}
      <section
        ref={leagueUsageSectionRef}
        className="relative"
        style={{ minHeight: '450vh' }} // 150vh initial + 150vh zoom out + 150vh post-2010 = 450vh
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-center justify-center z-10">
          <div className="w-full px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold mb-2">
                League Average Usage of Highest Usage Players
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Average usage percentage of the highest usage player per team, per season
              </p>
            </div>

            {usageDataLoading ? (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                Loading usage data...
              </div>
            ) : (
              <div className="flex justify-center">
                <LeagueAverageUsageChart
                  data={usageData.leagueAverage}
                  width={Math.min(window.innerWidth - 80, 1400)}
                  height={500}
                  isVisible={leagueUsageVisible}
                  scrollProgress={leagueUsageScrollProgress}
                />
              </div>
            )}
          </div>
        </div>

        {/* Spacer for scroll transitions */}
        <div className="h-[450vh]" />

        {/* Floating Text Boxes for League Usage Chart - Sequential behavior */}
        {/* Concentration: 0-30% of section scroll (scrolls away) */}
        <FloatingTextBox 
          isVisible={textBoxShown.leagueUsage} 
          sectionRef={leagueUsageSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0, 0.30]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Heliocentric Theory
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Star players are handling more offensive load than ever—heliocentric offenses built around high-usage superstars. 
            But here's the thing: role players are also scoring more. The entire league has become more efficient, not just the stars. 
            This suggests something deeper than just better players—it's a systemic shift in how the game is played.
          </p>
        </FloatingTextBox>

        {/* Outliers: 30-55% of section scroll (starts in center, scrolls away before Modern Era) */}
        <FloatingTextBox 
          isVisible={showLeagueUsageOutliers} 
          sectionRef={leagueUsageSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.30, 0.55]}
          stayCentered={false}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Highlighting Outliers
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Some teams and seasons stand out with unusually high or low usage rates for their top players, revealing 
            unique offensive philosophies and roster constructions.
          </p>
        </FloatingTextBox>

        {/* Modern Era: 50-85% of section scroll (starts in center, scrolls away) */}
        <FloatingTextBox 
          isVisible={showLeagueUsageZoom} 
          sectionRef={leagueUsageSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.50, 0.85]}
          stayCentered={false}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Modern Era (2010+)
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Zooming into the post-2010 era shows how usage patterns have shifted in the modern NBA, with teams 
            increasingly relying on star players and high-usage offensive systems.
          </p>
        </FloatingTextBox>
      </section>



      {/* ===============================
          SHOT HEATMAP SECTION
      =============================== */}
      <section ref={shotHeatmapSectionRef} className="relative min-h-screen">
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-center justify-center z-10">
          <div className="w-full px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold mb-2">
                Evolution of NBA Shot Selection
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Explore how shot locations have changed across two decades (2004-2024). Use the slider to see the shift from post-up dominance to the three-point revolution.
              </p>
            </div>

            <div className="flex justify-center">
              {shotDataLoading ? (
                <div className="flex items-center justify-center" style={{ width: Math.min(window.innerWidth - 80, 1000), height: 600 }}>
                  <p className="text-gray-600">Loading shot data...</p>
                </div>
              ) : (
                <ShotHeatMapArcGIS
                  width={Math.min(window.innerWidth - 80, 1000)}
                  height={600}
                  isVisible={true}
                  season="2004"
                  shotData={shotData}
                />
              )}
            </div>
          </div>
        </div>

        {/* Spacer to allow scrolling past sticky chart */}
        <div className="h-[150vh]" />

        {/* Floating Text Box */}
        <FloatingTextBox 
          isVisible={textBoxShown.shotHeatmap} 
          sectionRef={shotHeatmapSectionRef}
          scrollPosition={scrollY}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Solving the Geometry
          </h3>
          <p className="text-gray-700 leading-relaxed">
            The shift from mid-range to three-pointers and shots at the rim isn't just a stylistic change—it's the result of 
            solving the geometry of basketball. Analytics revealed that certain shots are mathematically superior, and teams 
            have optimized their offense accordingly. The game has been solved, and players have adapted to this new reality.
          </p>
        </FloatingTextBox>
      </section>

      {/* ===============================
          NORMALIZED OFFENSE CHART SECTION
      =============================== */}
      <section
        ref={normalizedOffenseSectionRef}
        className="relative min-h-screen"
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-center justify-center z-10">
          <div className="w-full px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold mb-2">
                How Offense Has Changed, Relative to Itself
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                How offensive performance has evolved over time
              </p>
            </div>

            {loading ? (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                Loading chart data…
              </div>
            ) : (
              <div className="flex justify-center">
                <NormalizedOffenseChart
                  data={data}
                  width={Math.min(window.innerWidth - 80, 1400)}
                  height={500}
                  isVisible={normalizedOffenseVisible}
                />
              </div>
            )}
          </div>
        </div>

        {/* Spacer to allow scrolling past sticky chart */}
        <div className="h-[150vh]" />

        {/* Floating Text Box */}
        <FloatingTextBox 
          isVisible={textBoxShown.normalizedOffense} 
          sectionRef={normalizedOffenseSectionRef}
          scrollPosition={scrollY}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Resolution
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Are the numbers we see today a symptom of stat inflation? Or have players simply gotten better? It's both. 
            The math has changed the game—analytics solved the geometry, spacing created new opportunities, and strategic 
            innovation optimized offense. But players have changed too—they've adapted, improved their skills, and learned to 
            thrive in this new system. The game evolved, and so did the players.
          </p>
        </FloatingTextBox>
      </section>

      {/* ===============================
          FINAL HERO SECTION
      =============================== */}
      <section className="h-screen w-full flex items-center justify-center px-8 bg-white">
        <div className="max-w-4xl text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            The Evolution Continues
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            NBA players have indeed gotten better, but not just in raw skill—they've adapted to a game that demands more versatility, efficiency, and strategic thinking than ever before.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            The data tells a story of continuous improvement, driven by analytics, training, and an ever-evolving understanding of what makes basketball great.
          </p>
        </div>
      </section>

    </main>
  );
}

export default App;
