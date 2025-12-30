import { useEffect, useState, useRef, memo, useMemo } from 'react';

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
  noStickyPeriod = false // If true, start scrolling immediately after fade-in (no stay-centered period)
}) {
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const rafIdRef = useRef(null);
  const lastValuesRef = useRef({ opacity: 0, translateY: 0 });
  const wasVisibleRef = useRef(false);
  const scrollStartPointRef = useRef(null); // Track when scrolling actually started

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

      // State-based visibility with scroll-based upward movement
      if (!isVisible) {
        wasVisibleRef.current = false;
        scrollStartPointRef.current = null;
        if (lastValuesRef.current.opacity !== 0 || lastValuesRef.current.translateY !== 0) {
          setOpacity(0);
          setTranslateY(0);
          lastValuesRef.current = { opacity: 0, translateY: 0 };
        }
        return;
      }

      // If visible by state, check scroll position to determine upward scroll
      if (!calculations) {
        if (lastValuesRef.current.opacity !== 1 || lastValuesRef.current.translateY !== 0) {
          setOpacity(1);
          setTranslateY(0);
          lastValuesRef.current = { opacity: 1, translateY: 0 };
        }
        return;
      }

      const { scrollProgress } = calculations;
      const viewportHeight = window.innerHeight;
      
      // Sequential behavior: use scrollRange if provided
      let newOpacity = 0;
      let newTranslateY = 0;
      
      if (scrollRange) {
        const [startProgress, endProgress] = scrollRange;
        const totalRange = endProgress - startProgress;
        const fadeInRange = Math.min(0.03, totalRange * 0.05); // 3% fade in, or 5% of range if smaller
        const fadeOutRange = Math.min(0.03, totalRange * 0.05); // 3% fade out, or 5% of range if smaller
        const stayCenteredRange = noStickyPeriod ? 0 : Math.min(0.05, totalRange * 0.1); // Stay centered for 5% of range, or 0 if noStickyPeriod
        
        const scrollStartProgress = startProgress + fadeInRange + stayCenteredRange;
        const scrollEndProgress = endProgress - fadeOutRange;
        
        // Track when textbox first becomes visible
        const justBecameVisible = isVisible && !wasVisibleRef.current;
        if (justBecameVisible) {
          wasVisibleRef.current = true;
          scrollStartPointRef.current = null; // Reset scroll start point
        }
        
        if (scrollProgress < startProgress) {
          newOpacity = 0;
          newTranslateY = 0;
          scrollStartPointRef.current = null;
        } else if (scrollProgress < startProgress + fadeInRange) {
          // Fade in - stay centered
          const fadeInProgress = (scrollProgress - startProgress) / fadeInRange;
          newOpacity = fadeInProgress;
          newTranslateY = 0;
          scrollStartPointRef.current = null;
        } else if (scrollProgress < scrollStartProgress) {
          // Stay centered after fade-in (brief period)
          newOpacity = 1;
          newTranslateY = 0;
          scrollStartPointRef.current = null;
        } else if (scrollProgress < scrollEndProgress) {
          // Fully visible - scroll up gradually with smooth easing
          newOpacity = 1;
          if (stayCentered) {
            // Stay in center, don't scroll up
            newTranslateY = 0;
            scrollStartPointRef.current = null;
          } else {
            // Initialize scroll start point when we first enter scroll phase
            if (scrollStartPointRef.current === null) {
              scrollStartPointRef.current = scrollProgress;
            }
            
            // Calculate scroll from the point where scrolling actually started
            // This ensures smooth transition from centered (translateY = 0) to scrolling
            const scrollDistance = scrollProgress - scrollStartPointRef.current;
            const totalScrollDistance = scrollEndProgress - scrollStartPointRef.current;
            
            // Calculate progress (0 to 1) through the scroll phase
            const scrollProgressInRange = totalScrollDistance > 0 
              ? Math.max(0, Math.min(1, scrollDistance / totalScrollDistance))
              : 0;
            
            // Use ease-out curve for smoother transition (1 - (1-x)^2)
            const easedValue = 1 - Math.pow(1 - scrollProgressInRange, 2);
            const maxScrollUp = viewportHeight * 0.5 + 200;
            // Continuous scroll from 0 to maxScrollUp
            newTranslateY = -easedValue * maxScrollUp;
          }
        } else if (scrollProgress < endProgress) {
          // Fade out - continue scrolling smoothly
          const fadeOutProgress = (scrollProgress - scrollEndProgress) / fadeOutRange;
          newOpacity = 1 - fadeOutProgress;
          if (stayCentered) {
            // Stay in center while fading out
            newTranslateY = 0;
          } else {
            // Continue scrolling up while fading out (already at max)
            const maxScrollUp = viewportHeight * 0.5 + 200;
            newTranslateY = -maxScrollUp;
          }
        } else {
          newOpacity = 0;
          newTranslateY = -viewportHeight * 0.5 - 200;
        }
      } else {
        // Default behavior: fade in and scroll up through entire section
        const fadeInRange = 0.1; // Fade in over first 10% of section
        const fadeOutRange = 0.1; // Fade out over last 10% of section
        
        if (scrollProgress < 0) {
          newOpacity = 0;
          newTranslateY = 0;
        } else if (scrollProgress < fadeInRange) {
          // Fade in
          const fadeInProgress = scrollProgress / fadeInRange;
          newOpacity = fadeInProgress;
          newTranslateY = 0;
        } else if (scrollProgress < 1 - fadeOutRange) {
          // Fully visible, scroll up
          newOpacity = 1;
          const progressInRange = (scrollProgress - fadeInRange) / (1 - fadeInRange - fadeOutRange);
          const maxScrollUp = viewportHeight * 0.5 + 200;
          newTranslateY = -progressInRange * maxScrollUp;
        } else {
          // Fade out
          const fadeOutProgress = (scrollProgress - (1 - fadeOutRange)) / fadeOutRange;
          newOpacity = 1 - fadeOutProgress;
          const maxScrollUp = viewportHeight * 0.5 + 200;
          newTranslateY = -maxScrollUp;
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
  }, [isVisible, scrollPosition, calculations, fadeOutDistance, triggerOffset, scrollRange, stayCentered, noStickyPeriod]);

  if (opacity === 0) {
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
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 px-8 py-6 max-w-2xl mx-auto text-center">
        {children}
      </div>
    </div>
  );
});

export default FloatingTextBox;

