import { useEffect, useState, useRef, memo, useMemo } from 'react';

// ============================================
// STANDARDIZED TIMING CONSTANTS (Desktop)
// ============================================
// These ensure consistent behavior across all text boxes
const STANDARD_FADE_IN_PERCENT = 0.05;    // 5% of range for fade-in
const STANDARD_FADE_OUT_PERCENT = 0.05;   // 5% of range for fade-out  
const STANDARD_STAY_CENTERED_PERCENT = 0.08; // 8% of range to stay centered after fade-in

const FloatingTextBox = memo(function FloatingTextBox({ 
  children, 
  scrollPosition, 
  triggerOffset, 
  id,
  isVisible, // State-based visibility trigger
  sectionRef, // Ref to the section element to track scroll position
  fadeOutDistance = 200, // Distance in pixels past section to start fading out
  scrollRange = null, // Optional: [startProgress, endProgress] for sequential behavior (0-1)
  stayCentered = false, // If true, text box stays centered (no upward scroll) and only fades
  staticPosition = false // If true, text box is fully static with no scroll tracking
}) {
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const rafIdRef = useRef(null);
  const lastValuesRef = useRef({ opacity: 0, translateY: 0 });
  const wasVisibleRef = useRef(false);
  const scrollStartPointRef = useRef(null); // Track when scrolling actually started
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track window size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoize calculations to avoid recalculation
  const calculations = useMemo(() => {
    if (!sectionRef?.current || scrollPosition === undefined) {
      return null;
    }

    const section = sectionRef.current;
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const scrollPastSection = scrollPosition - sectionTop;
    const scrollProgress = scrollPastSection / sectionHeight;

    return { sectionTop, sectionHeight, scrollPastSection, scrollProgress };
  }, [sectionRef, scrollPosition]);

  // Hybrid mode: State-based show, scroll-based hide
  useEffect(() => {
    // Cancel any pending animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const updatePosition = () => {
      if (isVisible === undefined) {
        // Fallback to scroll-based mode if isVisible not provided
        if (triggerOffset === undefined || scrollPosition === undefined) {
          if (lastValuesRef.current.opacity !== 0 || lastValuesRef.current.translateY !== 0) {
            setOpacity(0);
            setTranslateY(0);
            lastValuesRef.current = { opacity: 0, translateY: 0 };
          }
          return;
        }

        const viewportHeight = window.innerHeight;
        const scrollDistance = scrollPosition - triggerOffset;
        const visibilityWindow = 600;
        const startFade = -100;
        const endFade = visibilityWindow;
        
        if (scrollDistance >= startFade && scrollDistance <= endFade) {
          let newOpacity = 1;
          if (scrollDistance < 0) {
            newOpacity = Math.max(0, (scrollDistance - startFade) / (0 - startFade));
          } else if (scrollDistance > endFade - 200) {
            newOpacity = Math.max(0, 1 - (scrollDistance - (endFade - 200)) / 200);
          }
          const scrollProgress = Math.max(0, scrollDistance / visibilityWindow);
          const newTranslateY = -scrollProgress * 150;
          
          if (Math.abs(lastValuesRef.current.opacity - newOpacity) > 0.01 || 
              Math.abs(lastValuesRef.current.translateY - newTranslateY) > 1) {
            setOpacity(newOpacity);
            setTranslateY(newTranslateY);
            lastValuesRef.current = { opacity: newOpacity, translateY: newTranslateY };
          }
        } else {
          if (lastValuesRef.current.opacity !== 0 || lastValuesRef.current.translateY !== 0) {
            setOpacity(0);
            setTranslateY(0);
            lastValuesRef.current = { opacity: 0, translateY: 0 };
          }
        }
        return;
      }

      // When scrollRange is provided, skip the isVisible check entirely
      // and let scroll position control visibility
      // This prevents parent state changes from causing sudden disappearances
      if (!scrollRange && !isVisible) {
        wasVisibleRef.current = false;
        scrollStartPointRef.current = null;
        if (lastValuesRef.current.opacity !== 0 || lastValuesRef.current.translateY !== 0) {
          setOpacity(0);
          setTranslateY(0);
          lastValuesRef.current = { opacity: 0, translateY: 0 };
        }
        return;
      }

      // If calculations aren't available yet, show immediately with full opacity (only if no scrollRange)
      if (!calculations) {
        if (!scrollRange) {
          if (lastValuesRef.current.opacity !== 1 || lastValuesRef.current.translateY !== 0) {
            setOpacity(1);
            setTranslateY(0);
            lastValuesRef.current = { opacity: 1, translateY: 0 };
          }
        }
        return;
      }

      const { scrollProgress, scrollPastSection } = calculations;
      const viewportHeight = window.innerHeight;
      
      // Calculate max scroll distance - larger on mobile to ensure it goes off-screen
      const maxScrollUp = isMobile 
        ? viewportHeight * 0.8 + 300  // More aggressive scroll on mobile
        : viewportHeight * 0.5 + 200; // Original calculation for desktop
      
      // If scrollProgress is negative (scrolled above section), handle scroll-up behavior
      // Only for non-scrollRange textboxes - scrollRange handles its own visibility
      if (scrollProgress < 0 && !scrollRange) {
        // If textbox was never visible, hide it immediately
        if (!wasVisibleRef.current) {
          if (lastValuesRef.current.opacity !== 0 || lastValuesRef.current.translateY !== 0) {
            setOpacity(0);
            setTranslateY(0);
            lastValuesRef.current = { opacity: 0, translateY: 0 };
          }
          return;
        }
        
        // Textbox was visible - scroll it UP as user scrolls up
        const scrollAboveSection = Math.abs(scrollPastSection);
        const scrollFactor = 1.2;
        const targetTranslateY = scrollAboveSection * scrollFactor;
        
        // Fade out as the textbox scrolls up
        const fadeOutDist = viewportHeight * 0.3;
        const newOpacity = Math.max(0, 1 - (scrollAboveSection / fadeOutDist));
        const newTranslateY = Math.min(targetTranslateY, maxScrollUp);
        
        if (newOpacity <= 0.01) {
          wasVisibleRef.current = false;
          scrollStartPointRef.current = null;
          if (lastValuesRef.current.opacity !== 0) {
            setOpacity(0);
            setTranslateY(0);
            lastValuesRef.current = { opacity: 0, translateY: 0 };
          }
          return;
        }
        
        if (Math.abs(lastValuesRef.current.opacity - newOpacity) > 0.01 || 
            Math.abs(lastValuesRef.current.translateY - newTranslateY) > 1) {
          setOpacity(newOpacity);
          setTranslateY(newTranslateY);
          lastValuesRef.current = { opacity: newOpacity, translateY: newTranslateY };
        }
        return;
      }
      
      // Sequential behavior: use scrollRange if provided
      let newOpacity = 0;
      let newTranslateY = 0;
      
      if (scrollRange) {
        const [startProgress, endProgress] = scrollRange;
        const totalRange = endProgress - startProgress;
        
        // Use standardized timing constants for consistent behavior
        const fadeInRange = totalRange * STANDARD_FADE_IN_PERCENT;
        const fadeOutRange = totalRange * STANDARD_FADE_OUT_PERCENT;
        const stayCenteredRange = totalRange * STANDARD_STAY_CENTERED_PERCENT;
        
        const scrollStartProgress = startProgress + fadeInRange + stayCenteredRange;
        const scrollEndProgress = endProgress - fadeOutRange;
        
        // When scrollRange is provided, use ONLY scroll position to determine visibility
        // The isVisible prop is just an initial trigger, not an ongoing control
        // This prevents the parent's visibility state from causing sudden disappearances
        
        // Check if we're outside the range first (before or after)
        if (scrollProgress < startProgress) {
          // Before scroll range - hide textbox
          newOpacity = 0;
          newTranslateY = 0;
          scrollStartPointRef.current = null;
          wasVisibleRef.current = false;
        } else if (scrollProgress >= endProgress) {
          // After scroll range - hide textbox
          newOpacity = 0;
          newTranslateY = -maxScrollUp;
          wasVisibleRef.current = false;
          scrollStartPointRef.current = null;
        } else if (scrollProgress < startProgress + fadeInRange) {
          // Fade in phase - stay centered
          const fadeInProgress = (scrollProgress - startProgress) / fadeInRange;
          newOpacity = Math.min(1, Math.max(0, fadeInProgress));
          newTranslateY = 0;
          wasVisibleRef.current = true;
          scrollStartPointRef.current = null;
        } else if (scrollProgress < scrollStartProgress) {
          // Stay centered after fade-in (brief period)
          newOpacity = 1;
          newTranslateY = 0;
          wasVisibleRef.current = true;
          scrollStartPointRef.current = null;
        } else if (scrollProgress < scrollEndProgress) {
          // Scroll up phase - gradually move upward with smooth easing
          newOpacity = 1;
          wasVisibleRef.current = true;
          
          if (stayCentered) {
            newTranslateY = 0;
            scrollStartPointRef.current = null;
          } else {
            // Initialize scroll start point when we first enter scroll phase
            if (scrollStartPointRef.current === null) {
              scrollStartPointRef.current = scrollProgress;
            }
            
            // Calculate scroll from the point where scrolling actually started
            const scrollDistance = scrollProgress - scrollStartPointRef.current;
            const totalScrollDistance = scrollEndProgress - scrollStartPointRef.current;
            
            // Calculate progress (0 to 1) through the scroll phase
            const scrollProgressInRange = totalScrollDistance > 0 
              ? Math.max(0, Math.min(1, scrollDistance / totalScrollDistance))
              : 0;
            
            // Use ease-out curve for smoother transition (1 - (1-x)^2)
            const easedValue = 1 - Math.pow(1 - scrollProgressInRange, 2);
            newTranslateY = -easedValue * maxScrollUp;
          }
        } else if (scrollProgress < endProgress) {
          // Fade out phase - continue at max scroll position
          const fadeOutProgress = (scrollProgress - scrollEndProgress) / fadeOutRange;
          newOpacity = Math.max(0, 1 - fadeOutProgress);
          newTranslateY = stayCentered ? 0 : -maxScrollUp;
        }
      } else {
        // Default behavior: use standardized scrollRange [0, 0.40]
        // This ensures text box fades out before sticky section ends
        const defaultStart = 0;
        const defaultEnd = 0.40;
        const totalRange = defaultEnd - defaultStart;
        
        const fadeInRange = totalRange * STANDARD_FADE_IN_PERCENT;
        const fadeOutRange = totalRange * STANDARD_FADE_OUT_PERCENT;
        const stayCenteredRange = totalRange * STANDARD_STAY_CENTERED_PERCENT;
        
        const scrollStartProgress = defaultStart + fadeInRange + stayCenteredRange;
        const scrollEndProgress = defaultEnd - fadeOutRange;
        
        if (!isVisible || scrollProgress < 0) {
          // Hide if not visible or before section
          newOpacity = 0;
          newTranslateY = 0;
          wasVisibleRef.current = false;
        } else if (scrollProgress < defaultStart + fadeInRange) {
          // Fade in
          const fadeInProgress = scrollProgress / fadeInRange;
          newOpacity = Math.min(1, fadeInProgress);
          newTranslateY = 0;
          wasVisibleRef.current = true;
        } else if (scrollProgress < scrollStartProgress) {
          // Stay centered after fade-in
          newOpacity = 1;
          newTranslateY = 0;
          wasVisibleRef.current = true;
          scrollStartPointRef.current = null;
        } else if (scrollProgress < scrollEndProgress) {
          // Scroll up phase
          newOpacity = 1;
          wasVisibleRef.current = true;
          
          if (scrollStartPointRef.current === null) {
            scrollStartPointRef.current = scrollProgress;
          }
          
          const scrollDistance = scrollProgress - scrollStartPointRef.current;
          const totalScrollDistance = scrollEndProgress - scrollStartPointRef.current;
          const scrollProgressInRange = totalScrollDistance > 0 
            ? Math.max(0, Math.min(1, scrollDistance / totalScrollDistance))
            : 0;
          
          // Use ease-out curve for smooth scrolling
          const easedValue = 1 - Math.pow(1 - scrollProgressInRange, 2);
          newTranslateY = -easedValue * maxScrollUp;
        } else if (scrollProgress < defaultEnd) {
          // Fade out
          const fadeOutProgress = (scrollProgress - scrollEndProgress) / fadeOutRange;
          newOpacity = Math.max(0, 1 - fadeOutProgress);
          newTranslateY = -maxScrollUp;
        } else {
          // After range - hide completely
          newOpacity = 0;
          newTranslateY = -maxScrollUp;
          wasVisibleRef.current = false;
          scrollStartPointRef.current = null;
        }
      }
      
      // Only update if values changed significantly
      if (Math.abs(lastValuesRef.current.opacity - newOpacity) > 0.01 || 
          Math.abs(lastValuesRef.current.translateY - newTranslateY) > 1) {
        setOpacity(newOpacity);
        setTranslateY(newTranslateY);
        lastValuesRef.current = { opacity: newOpacity, translateY: newTranslateY };
      }
    };

    // Use requestAnimationFrame for smooth updates
    rafIdRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isVisible, scrollPosition, calculations, fadeOutDistance, triggerOffset, scrollRange, stayCentered, isMobile]);

  // Static position mode: fully static, no scroll tracking
  if (staticPosition) {
    if (!isVisible) {
      return null;
    }
    
    return (
      <div
        id={id}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        style={{
          pointerEvents: "none",
        }}
      >
        <div className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 mx-auto text-center ${
          isMobile ? 'px-4 py-4 max-w-[90vw]' : 'px-8 py-6 max-w-2xl'
        }`}>
          {children}
        </div>
      </div>
    );
  }

  // Hide completely when opacity is very low to prevent rendering issues
  if (opacity < 0.01) {
    return null;
  }

  return (
    <div
      id={id}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      style={{
        opacity: opacity,
        transform: `translate(-50%, calc(-50% + ${translateY}px))`,
        willChange: 'transform, opacity', // Optimize for animations
        visibility: opacity > 0.01 ? 'visible' : 'hidden', // Ensure hidden when opacity is low
      }}
    >
      <div className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 mx-auto text-center ${
        isMobile ? 'px-4 py-4 max-w-[90vw]' : 'px-8 py-6 max-w-2xl'
      }`}>
        {children}
      </div>
    </div>
  );
});

export default FloatingTextBox;

