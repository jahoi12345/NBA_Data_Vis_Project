import * as SliderPrimitive from '@radix-ui/react-slider';
import './Slider.css';

export function Slider({ label, value, onValueChange, min, max, step, ...props }) {
  const handleValueChange = (newValue) => {
    if (onValueChange) {
      // Radix returns an array, but we want a single number for this use case
      onValueChange(newValue[0]);
    }
  };

  return (
    <div className="react-aria-Slider">
      {label && <label className="react-aria-Label">{label}</label>}
      <div className="react-aria-SliderTrack">
        <SliderPrimitive.Root
          className="slider-root"
          value={[value]}
          onValueChange={handleValueChange}
          min={min}
          max={max}
          step={step}
          {...props}
        >
          <SliderPrimitive.Track className="slider-track">
            <SliderPrimitive.Range className="slider-range" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="slider-thumb" aria-label={label} />
        </SliderPrimitive.Root>
      </div>
    </div>
  );
}

