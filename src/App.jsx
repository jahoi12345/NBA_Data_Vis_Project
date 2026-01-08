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
import LoadingScreen from "./components/LoadingScreen";
import { parseNBAData } from "./utils/parseCSV";
import { loadPlayerAverages } from "./utils/loadPlayerAverages";
import { loadUsageData } from "./utils/loadUsageData";
import { loadShotGridData } from "./utils/loadShotGridData";
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
  const [shotDataProgress, setShotDataProgress] = useState(0);
  const chartSectionRef = useRef(null);
  const separatedSectionRef = useRef(null);
  const firstMetricRef = useRef(null);
  const secondMetricRef = useRef(null);
  const separatedStickyRef = useRef(null);
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
    // Debug: Log BASE_URL to verify it's set correctly
    console.log('BASE_URL:', import.meta.env.BASE_URL);
    
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
     LOAD SHOT DATA (Pre-aggregated grid data for performance)
  --------------------------------*/
  useEffect(() => {
    async function loadShots() {
      setShotDataLoading(true);
      setShotDataProgress(0);
      try {
        console.log('🔥 App: Loading pre-aggregated shot grid data...');
        setShotDataProgress(30); // Show some progress immediately
        const gridData = await loadShotGridData();
        console.log('🔥 App: Shot grid data loaded:', gridData.length, 'grid cells');
        setShotData(gridData);
        setShotDataProgress(100);
        // Small delay to show 100% before hiding loading screen
        setTimeout(() => {
          setShotDataLoading(false);
        }, 300);
      } catch (error) {
        console.error('🔥 App: Error loading shot grid data:', error);
        setShotDataProgress(100);
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
    // Wait for loading to complete before setting up observers
    if (shotDataLoading) return;
    
    if (!chartSectionRef.current) {
      console.log('⚠️ chartSectionRef is null');
      return;
    }

    console.log('📊 Setting up intersection observer for chart section');

    // Check if already in view on mount (with small delay to ensure DOM is ready)
    const checkInitialVisibility = () => {
      if (chartSectionRef.current) {
        const rect = chartSectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          console.log('✅ Chart section already in view - setting chartVisible to true');
          setChartVisible(true);
        }
      }
    };
    
    // Check immediately and after a small delay
    checkInitialVisibility();
    const timeoutId = setTimeout(checkInitialVisibility, 100);

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
      { threshold: [0, 0.1, 0.5, 1.0], rootMargin: '100px' }
    );

    observer.observe(chartSectionRef.current);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [shotDataLoading]);

  /* -------------------------------
     SCROLL-BASED SEPARATION TRIGGER
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up scroll handlers
    if (shotDataLoading) return;
    
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
  }, [showSeparated, shotDataLoading]);

  const [separatedVisible, setSeparatedVisible] = useState(false);
  const [showSeparatedText, setShowSeparatedText] = useState(false);

  /* -------------------------------
     DUAL AXIS CHART VISIBILITY
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up observers
    if (shotDataLoading) return;
    
    if (!dualAxisSectionRef.current) return;

    // Check if already in view on mount (with small delay to ensure DOM is ready)
    const checkInitialVisibility = () => {
      if (dualAxisSectionRef.current) {
        const rect = dualAxisSectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          setDualAxisVisible(true);
        }
      }
    };
    
    // Check immediately and after a small delay
    checkInitialVisibility();
    const timeoutId = setTimeout(checkInitialVisibility, 100);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDualAxisVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(dualAxisSectionRef.current);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [shotDataLoading]);

  /* -------------------------------
     DUAL AXIS ERA TRACKING
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up scroll handlers
    if (shotDataLoading) return;
    
    const handleScroll = () => {
      if (!dualAxisSectionRef.current) return;
      
      const sectionTop = dualAxisSectionRef.current.offsetTop;
      const sectionHeight = dualAxisSectionRef.current.offsetHeight;
      const scrollY = window.scrollY;
      const scrollPastSection = scrollY - sectionTop;
      const scrollProgress = scrollPastSection / sectionHeight;
      
      // Era ranges now aligned with standardized text box scrollRanges:
      // Main: [0, 0.20], Era 1: [0.20, 0.40], Era 2: [0.40, 0.60], Era 3: [0.60, 0.80]
      // Graph viewing without text: 0.80+
      
      if (scrollProgress < 0.20) {
        setActiveEraIndex(null); // No era active - still in initial display period
      } else if (scrollProgress < 0.40) {
        setActiveEraIndex(0); // Early Modern / Fast-Break Era (1979-1989)
      } else if (scrollProgress < 0.60) {
        setActiveEraIndex(1); // Deadball Era (1997-2004)
      } else if (scrollProgress < 0.80) {
        setActiveEraIndex(2); // Three-Point Revolution (2013-2019)
      } else {
        setActiveEraIndex(null); // Past all eras - viewing graph without text
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shotDataLoading]);

  /* -------------------------------
     LOLLIPOP CHART VISIBILITY
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up observers
    if (shotDataLoading) return;
    
    if (!lollipopSectionRef.current) return;

    // Check if already in view on mount (with small delay to ensure DOM is ready)
    const checkInitialVisibility = () => {
      if (lollipopSectionRef.current) {
        const rect = lollipopSectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          setLollipopVisible(true);
        }
      }
    };
    
    // Check immediately and after a small delay
    checkInitialVisibility();
    const timeoutId = setTimeout(checkInitialVisibility, 100);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLollipopVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(lollipopSectionRef.current);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [shotDataLoading]);

  /* -------------------------------
LEAGUE USAGE CHART VISIBILITY
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up observers
    if (shotDataLoading) return;
    
    if (!leagueUsageSectionRef.current) return;

    // Check if already in view on mount (with small delay to ensure DOM is ready)
    const checkInitialVisibility = () => {
      if (leagueUsageSectionRef.current) {
        const rect = leagueUsageSectionRef.current.getBoundingClientRect();
        // More aggressive check - if any part of section is in viewport or about to enter
        const isInView = rect.top < window.innerHeight + 200 && rect.bottom > -200;
        if (isInView) {
          setLeagueUsageVisible(true);
        }
      }
    };
    
    // Check immediately and after a small delay
    checkInitialVisibility();
    const timeoutId = setTimeout(checkInitialVisibility, 50);
    const timeoutId2 = setTimeout(checkInitialVisibility, 200);

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger immediately when any part enters viewport
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          setLeagueUsageVisible(true);
        }
      },
      { threshold: [0, 0.01, 0.1], rootMargin: '200px 0px' } // Larger rootMargin to trigger earlier
    );

    observer.observe(leagueUsageSectionRef.current);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      observer.disconnect();
    };
  }, [shotDataLoading]);

  /* -------------------------------
     NORMALIZED OFFENSE CHART VISIBILITY
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up observers
    if (shotDataLoading) return;
    
    if (!normalizedOffenseSectionRef.current) return;

    // Check if already in view on mount (with small delay to ensure DOM is ready)
    const checkInitialVisibility = () => {
      if (normalizedOffenseSectionRef.current) {
        const rect = normalizedOffenseSectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          setNormalizedOffenseVisible(true);
        }
      }
    };
    
    // Check immediately and after a small delay
    checkInitialVisibility();
    const timeoutId = setTimeout(checkInitialVisibility, 100);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNormalizedOffenseVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(normalizedOffenseSectionRef.current);
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [shotDataLoading]);

  /* -------------------------------
     SHOT HEAT MAP VISIBILITY
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up observers
    if (shotDataLoading) return;
    
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
  }, [shotDataLoading]);

  /* -------------------------------
     LEAGUE USAGE CHART SCROLL TRACKING
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up scroll handlers
    if (shotDataLoading) return;
    
    const handleScroll = () => {
      if (!leagueUsageSectionRef.current) return;
      
      const sectionTop = leagueUsageSectionRef.current.offsetTop;
      const sectionHeight = leagueUsageSectionRef.current.offsetHeight;
      const scrollY = window.scrollY;
      const scrollPastSection = scrollY - sectionTop;
      const scrollProgress = scrollPastSection / sectionHeight;
      
      // Three phases aligned with standardized text box scrollRanges:
      // Phase 1 (Main): 0-25% - Zoomed out, animate left to right
      // Phase 2 (Outliers): 25-50% - Zoomed out, highlight outliers
      // Phase 3 (Modern Era): 50-75% - Zoom into 2010+
      // Graph viewing: 75%+ - viewing without text
      
      let progress = 0;
      
      if (scrollProgress < 0.25) {
        // Phase 1: Zoomed out, animate left to right
        progress = scrollProgress / 0.25; // 0 to 1
      } else if (scrollProgress < 0.50) {
        // Phase 2: Zoomed out, show outliers
        progress = 1 + (scrollProgress - 0.25) / 0.25; // 1 to 2
      } else if (scrollProgress < 0.75) {
        // Phase 3: Post-2010 zoom
        progress = 2 + (scrollProgress - 0.50) / 0.25; // 2 to 3
      } else {
        progress = 3; // Past all phases - viewing graph without text
      }
      
      setLeagueUsageScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shotDataLoading]);



  /* -------------------------------
     SEPARATED CHARTS VISIBILITY
  --------------------------------*/
  useEffect(() => {
    // Wait for loading to complete before setting up observers
    if (shotDataLoading) return;
    
    console.log('🔍 Separated charts visibility check - showSeparated:', showSeparated);
    
    if (!showSeparated) {
      console.log('⏭️ Skipping - showSeparated is false');
      return;
    }
    
    if (!separatedSectionRef.current) {
      console.log('⚠️ separatedSectionRef is null');
      return;
    }

    // Force reflow on mobile Safari to ensure sticky positioning initializes correctly
    // This is needed because conditionally rendered elements may not initialize sticky correctly
    if (window.innerWidth < 768 && separatedStickyRef.current) {
      const stickyEl = separatedStickyRef.current;
      // Force a reflow by reading layout properties
      void stickyEl.offsetHeight;
      // Trigger a repaint
      requestAnimationFrame(() => {
        if (stickyEl) {
          // Force browser to recalculate sticky positioning
          stickyEl.style.transform = 'translateZ(0)';
          requestAnimationFrame(() => {
            if (stickyEl) {
              stickyEl.style.transform = '';
            }
          });
        }
      });
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
  }, [showSeparated, shotDataLoading]);

  /* -------------------------------
     ATTACH REFS TO INDIVIDUAL METRIC CHARTS
  --------------------------------*/
  useEffect(() => {
    if (!separatedSectionRef.current || !separatedVisible) return;

    // Retry logic to ensure refs are attached (especially on mobile with stacked charts)
    const attachRefs = () => {
      const metrics = separatedSectionRef.current?.querySelectorAll("[data-metric]");
      if (metrics && metrics.length >= 2) {
        firstMetricRef.current = metrics[0];
        secondMetricRef.current = metrics[1];
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/360cd766-cf64-4843-be3b-aeff7b6bb854',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:687',message:'Metric refs attached',data:{metricsCount:metrics.length,firstMetricRect:metrics[0].getBoundingClientRect(),secondMetricRect:metrics[1].getBoundingClientRect()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return true;
      }
      return false;
    };

    // Try immediately
    if (!attachRefs()) {
      // Retry after a delay if not found (charts might still be rendering)
      const timeoutId = setTimeout(() => {
        attachRefs();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [separatedVisible]);

  /* -------------------------------
     SCROLL TRACKING FOR STICKY BEHAVIOR
  --------------------------------*/
  useEffect(() => {
    if (!showSeparated || !separatedSectionRef.current || !separatedStickyRef.current) return;

    let lastScrollY = window.scrollY;
    let scrollTimeout = null;

    const handleScroll = () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY;
        const sectionEl = separatedSectionRef.current;
        const stickyEl = separatedStickyRef.current;
        if (!sectionEl || !stickyEl) return;

        const sectionRect = sectionEl.getBoundingClientRect();
        const stickyRect = stickyEl.getBoundingClientRect();
        const stickyStyle = window.getComputedStyle(stickyEl);
        const sectionTop = sectionEl.offsetTop;
        const scrollPastSection = scrollY - sectionTop;
        const sectionMinHeight = parseFloat(sectionEl.style.minHeight || '250vh') * window.innerHeight / 100;
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/360cd766-cf64-4843-be3b-aeff7b6bb854',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:scroll',message:'Scroll event - checking sticky behavior',data:{scrollY,scrollDelta:scrollY-lastScrollY,sectionTop,scrollPastSection,sectionHeight,sectionMinHeight,stickyRectTop:stickyRect.top,stickyRectBottom:stickyRect.bottom,sectionRectTop:sectionRect.top,sectionRectBottom:sectionRect.bottom,stickyPosition:stickyStyle.position,windowHeight:window.innerHeight,shouldBeSticky:scrollPastSection>=0&&scrollPastSection<sectionHeight,isSticking:stickyRect.top<=0.1,stickyShouldStay:sectionRect.bottom>window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        lastScrollY = scrollY;
        scrollTimeout = null;
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [showSeparated]);


  /* -------------------------------
     SEPARATED CHARTS TEXT VISIBILITY
  --------------------------------*/
  useEffect(() => {
    // Simply set showSeparatedText to true when section is shown
    // FloatingTextBox handles all scroll-based visibility via scrollRange
    if (showSeparated) {
      setShowSeparatedText(true);
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
    if (leagueUsageVisible && !textBoxShown.leagueUsage) {
      setTextBoxShown(prev => ({ ...prev, leagueUsage: true }));
    }
  }, [leagueUsageVisible, textBoxShown.leagueUsage]);

  // Outliers highlighted when progress is between 1 and 2 (25-50% of section)
  const showLeagueUsageOutliers = leagueUsageScrollProgress >= 1 && leagueUsageScrollProgress < 2;
  
  // Zoom in when progress is between 2 and 3 (50-75% of section)
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


  // Show loading screen until shot data is fully loaded
  if (shotDataLoading) {
    return <LoadingScreen progress={shotDataProgress} />;
  }

  return (
    <main className="bg-white text-gray-900">

      {/* ===============================
          HERO SECTION
      =============================== */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-8 bg-white pb-16 md:pb-24 relative overflow-hidden">
        <div className="max-w-7xl w-full text-center">
          <img src={nbaLogo} alt="NBA" className="h-96 md:h-[30rem] mx-auto mb-6" style={{ backgroundColor: 'white' }} />
          <h1 className="text-6xl md:text-7xl font-bold mb-12 md:mb-16">
            Have NBA Players Gotten Better?
          </h1>
          
          {/* Floating Cards - Horizontally Aligned */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-12 md:mb-16 px-4">
            {/* Card 1 - Genuine Skill Improvement */}
            <div className="w-full md:w-80 lg:w-96 bg-white rounded-xl shadow-2xl p-6 hover:scale-105 transition-transform duration-300 animate-float">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">Genuine Skill Improvement</h3>
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Players have genuinely improved their fundamental shooting skills. Free throw, field goal, and true shooting percentages have all increased consistently since 2000, demonstrating real skill development.
              </p>
            </div>

            {/* Card 2 - Heliocentric Systems */}
            <div className="w-full md:w-80 lg:w-96 bg-white rounded-xl shadow-2xl p-6 hover:scale-105 transition-transform duration-300 animate-float-delay-1">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">Heliocentric Systems</h3>
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Star players handle more offensive load than ever through heliocentric offenses built around high-usage superstars. But the entire league has become more efficient, a systemic shift in how the game is played.
              </p>
            </div>

            {/* Card 3 - Analytics Revolution */}
            <div className="w-full md:w-80 lg:w-96 bg-white rounded-xl shadow-2xl p-6 hover:scale-105 transition-transform duration-300 animate-float-delay-2">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">Analytics Revolution</h3>
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Analytics solved the geometry of basketball, revealing that three-pointers and shots at the rim are mathematically superior. Teams optimized offense accordingly, shifting from mid-range to the three-point revolution.
              </p>
            </div>
          </div>

          {/* Scroll to explore text - appears after cards */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Scroll to explore how NBA players and the game have evolved over time
          </p>
        </div>
      </section>

      {/* ===============================
          LOLLIPOP CHART SECTION
      =============================== */}
      <section
        ref={lollipopSectionRef}
        className="relative min-h-screen pt-8 sm:pt-12 md:pt-16 lg:pt-24"
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-start sm:items-center justify-center z-10 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                Elite Players Per Season
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                Number of players averaging &gt;25 points (pts), &gt;5 rebounds (reb), and &gt;5 assists (ast) per season (Regular Season only)
              </p>
            </div>

            {playerStatsLoading ? (
              <div className="h-[400px] sm:h-[500px] flex items-center justify-center text-gray-500">
                Processing player statistics...
              </div>
            ) : (
              <div className="flex justify-center mt-2 sm:mt-4 md:mt-6">
                <LollipopChart
                  data={playerStatsData}
                  width={Math.min(window.innerWidth - 32, 1400)}
                  height={400}
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
          scrollRange={[0, 0.40]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Anomaly
          </h3>
          <p className="text-gray-700 leading-relaxed">
            After 2017, a significant number of players began averaging 25+ points, 5+ rebounds, and 5+ assists per season, something 
            historically unprecedented. This surge raises a fundamental question: are we witnessing stat inflation, or genuine evolution?
          </p>
        </FloatingTextBox>
      </section>

      {/* ===============================
          DUAL AXIS CHART SECTION
      =============================== */}
      <section
        ref={dualAxisSectionRef}
        className="relative pt-8 sm:pt-12 md:pt-16 lg:pt-24"
        style={{ minHeight: '550vh' }} // 100vh (sticky element) + 450vh (spacer) = 550vh total
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-start sm:items-center justify-center z-10 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                Pace and Offensive Efficiency
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                NBA pace (possessions per game) and points per 100 possessions over time
              </p>
            </div>

            {loading ? (
              <div className="h-[400px] sm:h-[500px] flex items-center justify-center text-gray-500">
                Loading chart data…
              </div>
            ) : (
              <div className="flex justify-center mt-2 sm:mt-4 md:mt-6">
              <DualAxisChart
                data={data}
                width={Math.min(window.innerWidth - 32, 1400)}
                height={400}
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
        {/* Main text box: 0-20% of section scroll */}
        <FloatingTextBox 
          isVisible={textBoxShown.dualAxis} 
          sectionRef={dualAxisSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0, 0.20]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Pace Theory
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Pace (possessions per game) is up - there are more possessions per game than in previous eras. But pace alone doesn't explain the efficiency jump. 
            Teams aren't just playing faster; they're playing smarter, solving the geometry of the game in ways that previous generations couldn't.
          </p>
        </FloatingTextBox>

        {/* Era 1: 20-40% of section scroll */}
        <FloatingTextBox 
          isVisible={showDualAxisEra1} 
          sectionRef={dualAxisSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.20, 0.40]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Early Modern / Fast-Break Era (1979-1989)
          </h3>
          <p className="text-gray-700 leading-relaxed">
            The introduction of the three-point line in 1979 marked the beginning of a faster-paced era. Teams embraced 
            the fast break, leading to higher possession counts and a more open style of play.
          </p>
        </FloatingTextBox>

        {/* Era 2: 40-60% of section scroll */}
        <FloatingTextBox 
          isVisible={showDualAxisEra2} 
          sectionRef={dualAxisSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.40, 0.60]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Deadball Era (1997-2004)
          </h3>
          <p className="text-gray-700 leading-relaxed">
            This period saw a significant slowdown in pace as teams focused on half-court sets, physical defense, and 
            isolation plays. Possessions decreased while teams maintained relatively high efficiency through methodical offense.
          </p>
        </FloatingTextBox>

        {/* Era 3: 60-80% of section scroll */}
        <FloatingTextBox 
          isVisible={showDualAxisEra3} 
          sectionRef={dualAxisSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.60, 0.80]}
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
        className="relative min-h-screen pt-8 sm:pt-12 md:pt-16 lg:pt-24"
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-start sm:items-center justify-center z-10 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                League Average Shooting Percentages
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                NBA Free Throw (FT), Field Goal (FG), and True Shooting (TS) percentages by season (1979-80 onward)
              </p>
            </div>

            {loading ? (
              <div className="h-[400px] sm:h-[500px] flex items-center justify-center text-gray-500">
                Loading chart data…
              </div>
            ) : (
              <div className="flex justify-center mt-2 sm:mt-4 md:mt-6">
                <FTPercentChart
                  data={data}
                  width={Math.min(window.innerWidth - 32, 1400)}
                  height={400}
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
          scrollRange={[0, 0.40]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Rules Theory
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Rules have changed to favor offense - hand-checking restrictions, defensive three seconds, and other modifications. 
            But while rules create the conditions for higher scoring, they don't explain why players are hitting shots at historically 
            unprecedented rates. The math has changed, and players have adapted. Free Throw percentage (FT%) measures accuracy from the free throw line, 
            Field Goal percentage (FG%) measures accuracy on all field goal attempts, and True Shooting percentage (TS%) accounts for the value of 
            three-pointers and free throws to provide a comprehensive measure of shooting efficiency.
          </p>
        </FloatingTextBox>
      </section>

      {/* ===============================
          SEPARATED CHARTS SECTION
      =============================== */}
      {showSeparated && (
        <section
          ref={(el) => {
            separatedSectionRef.current = el;
            // #region agent log
            if (el) {
              setTimeout(() => {
                const sectionStyle = window.getComputedStyle(el);
                const sectionRect = el.getBoundingClientRect();
                const parent = el.parentElement;
                const parentStyle = parent ? window.getComputedStyle(parent) : null;
                fetch('http://127.0.0.1:7242/ingest/360cd766-cf64-4843-be3b-aeff7b6bb854',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:1092',message:'Section rendered - checking dimensions and parent styles',data:{sectionHeight:sectionRect.height,sectionMinHeight:sectionStyle.minHeight,sectionOverflow:sectionStyle.overflow,sectionPosition:sectionStyle.position,sectionTop:sectionRect.top,parentOverflow:parentStyle?.overflow,parentPosition:parentStyle?.position,parentTransform:parentStyle?.transform,windowScrollY:window.scrollY},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix2',hypothesisId:'B'})}).catch(()=>{});
              }, 100);
            }
            // #endregion
          }}
          className="relative pt-8 sm:pt-12 md:pt-16 lg:pt-24"
          style={{ 
            height: '250vh', // Fixed height (not minHeight) to ensure proper sticky containing block on mobile Safari
          }}
        >
          {/* Sticky chart - keeps charts static during scroll */}
          <div 
            ref={(el) => {
              separatedStickyRef.current = el;
              // #region agent log
              if (el) {
                const stickyEl = el;
                const sectionEl = separatedSectionRef.current;
                setTimeout(() => {
                  if (stickyEl && sectionEl) {
                    const stickyStyle = window.getComputedStyle(stickyEl);
                    const sectionStyle = window.getComputedStyle(sectionEl);
                    const stickyRect = stickyEl.getBoundingClientRect();
                    const sectionRect = sectionEl.getBoundingClientRect();
                    const mainEl = stickyEl.closest('main');
                    const mainStyle = mainEl ? window.getComputedStyle(mainEl) : null;
                    fetch('http://127.0.0.1:7242/ingest/360cd766-cf64-4843-be3b-aeff7b6bb854',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:1102',message:'Sticky element mounted - checking styles and dimensions',data:{stickyPosition:stickyStyle.position,stickyTop:stickyStyle.top,stickyZIndex:stickyStyle.zIndex,sectionHeight:sectionRect.height,sectionMinHeight:sectionStyle.minHeight,sectionOverflow:sectionStyle.overflow,sectionPosition:sectionStyle.position,mainOverflow:mainStyle?.overflow,mainPosition:mainStyle?.position,stickyRectTop:stickyRect.top,stickyRectHeight:stickyRect.height,windowHeight:window.innerWidth,isMobile:window.innerWidth<768},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                  }
                }, 100);
              }
              // #endregion
            }}
            className="sticky top-0 flex items-start sm:items-center justify-center z-10 overflow-y-auto"
            style={{
              position: 'sticky',
              top: 0,
              height: 'auto', // Auto height to accommodate content (especially stacked charts on mobile)
              minHeight: '100vh', // Ensure minimum viewport height
            }}
          >
            <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
              <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                  Individual Shooting Metrics
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                  Each metric shown separately (1999-present)
                </p>
              </div>

              {!loading && (
                <div className="flex justify-center mt-2 sm:mt-4 md:mt-6">
                  <SeparatedCharts
                    data={data}
                    width={Math.min(window.innerWidth - 32, 1400)}
                    height={400}
                    isVisible={separatedVisible}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Spacer to allow scrolling past sticky chart */}
          <div className="h-[150vh]" />

          {/* Floating Text Box - appears when first chart is visible, disappears before second chart */}
          <FloatingTextBox 
            isVisible={showSeparatedText} 
            sectionRef={separatedSectionRef}
            scrollPosition={scrollY}
            scrollRange={[0, 0.40]}
          >
            <h3 className="text-2xl font-semibold mb-3">
              The Skill Improvement
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Ever since 2000, we see each of these stats have increased. Players have genuinely improved their fundamental shooting 
              skills across the board - free throws, field goals, and overall efficiency. But this isn't just about individual skill; 
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
        className="relative pt-8 sm:pt-12 md:pt-16 lg:pt-24"
        style={{ minHeight: '450vh' }} // 150vh initial + 150vh zoom out + 150vh post-2010 = 450vh
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-start sm:items-center justify-center z-10 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                League Average Usage of Highest Usage Players
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                Average usage percentage of the highest usage player per team, per season
              </p>
            </div>

            {usageDataLoading ? (
              <div className="h-[400px] sm:h-[500px] flex items-center justify-center text-gray-500">
                Loading usage data...
              </div>
            ) : (
              <div className="flex justify-center mt-2 sm:mt-4 md:mt-6">
                <LeagueAverageUsageChart
                  data={usageData.leagueAverage}
                  width={Math.min(window.innerWidth - 32, 1400)}
                  height={400}
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
        {/* Main: 0-25% of section scroll */}
        <FloatingTextBox 
          isVisible={textBoxShown.leagueUsage} 
          sectionRef={leagueUsageSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0, 0.25]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Heliocentric Theory
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Star players are handling more offensive load than ever - heliocentric offenses built around high-usage superstars. 
            Usage percentage measures the percentage of team possessions a player uses while on the court, accounting for field goal attempts, 
            free throw attempts, and turnovers. But here's the thing: role players are also scoring more. The entire league has become more efficient, 
            not just the stars. This suggests something deeper than just better players - it's a systemic shift in how the game is played.
          </p>
        </FloatingTextBox>

        {/* Outliers: 25-50% of section scroll */}
        <FloatingTextBox 
          isVisible={showLeagueUsageOutliers} 
          sectionRef={leagueUsageSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.25, 0.50]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Highlighting Outliers
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Some teams and seasons stand out with unusually high or low usage rates for their top players, revealing 
            unique offensive philosophies and roster constructions.
          </p>
        </FloatingTextBox>

        {/* Modern Era: 50-75% of section scroll */}
        <FloatingTextBox 
          isVisible={showLeagueUsageZoom} 
          sectionRef={leagueUsageSectionRef}
          scrollPosition={scrollY}
          scrollRange={[0.50, 0.75]}
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
      <section ref={shotHeatmapSectionRef} className="relative min-h-screen pt-8 sm:pt-12 md:pt-16 lg:pt-24">
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-start sm:items-center justify-center z-10 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                Evolution of NBA Shot Selection
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                Explore how shot locations have changed across two decades (2004-2024). Use the slider to see the shift from post-up dominance to the three-point revolution.
              </p>
            </div>

            <div className="flex justify-center mt-2 sm:mt-4 md:mt-6">
              {shotDataLoading ? (
                <div className="flex items-center justify-center" style={{ 
                  width: Math.min(window.innerWidth - 32, 1000), 
                  height: window.innerWidth < 768 ? Math.max(600, window.innerHeight * 0.7) : 600 
                }}>
                  <p className="text-gray-600">Loading shot data...</p>
                </div>
              ) : (
                <ShotHeatMapArcGIS
                  width={Math.min(window.innerWidth - 32, 1000)}
                  height={window.innerWidth < 768 ? Math.max(600, window.innerHeight * 0.7) : 600}
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
          scrollRange={[0, 0.40]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            Solving the Geometry
          </h3>
          <p className="text-gray-700 leading-relaxed">
            The shift from mid-range to three-pointers and shots at the rim isn't just a stylistic change - it's the result of 
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
        className="relative min-h-screen pt-8 sm:pt-12 md:pt-16 lg:pt-24"
      >
        {/* Sticky chart */}
        <div className="sticky top-0 h-screen flex items-start sm:items-center justify-center z-10 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 md:mb-4 leading-tight">
                How Offense Has Changed, Relative to Itself
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                How offensive performance has evolved over time
              </p>
            </div>

            {loading ? (
              <div className="h-[400px] sm:h-[500px] flex items-center justify-center text-gray-500">
                Loading chart data…
              </div>
            ) : (
              <div className="flex justify-center mt-2 sm:mt-4 md:mt-6">
                <NormalizedOffenseChart
                  data={data}
                  width={Math.min(window.innerWidth - 32, 1400)}
                  height={400}
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
          scrollRange={[0, 0.40]}
        >
          <h3 className="text-2xl font-semibold mb-3">
            The Resolution
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Are the numbers we see today a symptom of stat inflation? Or have players simply gotten better? It's both. 
            The math has changed the game - analytics solved the geometry, spacing created new opportunities, and strategic 
            innovation optimized offense. But players have changed too - they've adapted, improved their skills, and learned to 
            thrive in this new system. The game evolved, and so did the players.
          </p>
        </FloatingTextBox>
      </section>

      {/* ===============================
          FINAL HERO SECTION
      =============================== */}
      <section className="h-screen w-full flex items-center justify-center px-8 bg-white pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="max-w-4xl text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            The Evolution Continues
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            NBA players have indeed gotten better, but not just in raw skill - they've adapted to a game that demands more versatility, efficiency, and strategic thinking than ever before.
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
