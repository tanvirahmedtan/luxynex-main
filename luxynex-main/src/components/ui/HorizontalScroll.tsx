import * as React from "react";
import { cn } from "@/lib/utils";

type HorizontalScrollProps = React.HTMLAttributes<HTMLDivElement>;

const HorizontalScroll = React.forwardRef<HTMLDivElement, HorizontalScrollProps>(
  ({ className, children, style, ...props }, forwardedRef) => {
    const localRef = React.useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const startX = React.useRef(0);
    const scrollLeft = React.useRef(0);

    React.useImperativeHandle(
      forwardedRef,
      () => localRef.current as HTMLDivElement,
      []
    );

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      const el = localRef.current;
      if (!el) return;
      setIsDragging(true);
      el.setPointerCapture(event.pointerId);
      startX.current = event.clientX;
      scrollLeft.current = el.scrollLeft;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const el = localRef.current;
      if (!el) return;
      const walk = startX.current - event.clientX;
      el.scrollLeft = scrollLeft.current + walk;
      event.preventDefault();
    };

    const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setIsDragging(false);
      const el = localRef.current;
      if (el) {
        try {
          el.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore if pointer capture is not available.
        }
      }
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      const el = localRef.current;
      if (!el) return;
      if (event.deltaY === 0) return;
      el.scrollLeft += event.deltaY;
      event.preventDefault();
    };

    return (
      <div
        ref={localRef}
        className={cn(
          "flex gap-4 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing select-none",
          className
        )}
        style={{ touchAction: "pan-y", ...style }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
        onWheel={handleWheel}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HorizontalScroll.displayName = "HorizontalScroll";

export default HorizontalScroll;
