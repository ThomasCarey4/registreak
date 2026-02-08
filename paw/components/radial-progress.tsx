import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface RadialProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1 (used as fallback when segments not provided)
  progressColor: string;
  backgroundColor: string;
  /** Array of booleans – one per lecture. true = attended, false = missed. */
  segments?: boolean[];
}

/**
 * Build a closed "thick arc" path whose end-caps are perpendicular to the arc
 * (i.e. parallel to each other across the gap), rather than pointing at the
 * centre.  This gives clean, uniform gaps between segments.
 */
function describeThickArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const halfThickness = (outerR - innerR) / 2;

  // The end-cap arcs use a semicircle whose radius equals half the stroke
  // thickness.  Because the semicircle bridges from the outer radius to the
  // inner radius perpendicular to the tangent, both sides of each gap end
  // up parallel to each other — giving clean, uniform splits.

  const outerStart = {
    x: cx + outerR * Math.cos(startAngle),
    y: cy + outerR * Math.sin(startAngle),
  };
  const outerEnd = {
    x: cx + outerR * Math.cos(endAngle),
    y: cy + outerR * Math.sin(endAngle),
  };
  const innerEnd = {
    x: cx + innerR * Math.cos(endAngle),
    y: cy + innerR * Math.sin(endAngle),
  };
  const innerStart = {
    x: cx + innerR * Math.cos(startAngle),
    y: cy + innerR * Math.sin(startAngle),
  };

  const sweep = endAngle - startAngle;
  const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0;

  // Round end-caps: use a small rounded rectangle approach.
  // Instead we use rounded corners via two tiny arcs at each cap to get
  // a polished "stadium-cap" look.
  const capR = halfThickness; // radius for the rounded end-cap arcs

  return [
    // Move to outer-start
    `M ${outerStart.x} ${outerStart.y}`,
    // Outer arc to outer-end
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    // Rounded end cap at the END of the segment (outer→inner)
    `A ${capR} ${capR} 0 0 1 ${innerEnd.x} ${innerEnd.y}`,
    // Inner arc back to inner-start (reverse direction)
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    // Rounded end cap at the START of the segment (inner→outer)
    `A ${capR} ${capR} 0 0 1 ${outerStart.x} ${outerStart.y}`,
    "Z",
  ].join(" ");
}

export function RadialProgress({
  size,
  strokeWidth,
  progress,
  progressColor,
  backgroundColor,
  segments,
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Segmented mode (only when there are 2+ segments; 1 segment = full circle)
  if (segments && segments.length > 1) {
    const count = segments.length;
    // Gap in radians between segments (slightly larger to account for rounded caps)
    const gapAngle = count > 1 ? 0.3 : 0;
    const totalGap = gapAngle * count;
    const segmentAngle = (2 * Math.PI - totalGap) / count;
    // Offset so that gaps are centred at the split points
    // (e.g. 2 segments → gaps centred at top & bottom)
    const startOffset = -Math.PI / 2 + gapAngle / 2;

    const outerR = radius + strokeWidth / 2;
    const innerR = radius - strokeWidth / 2;

    const attendedCount = segments.filter(Boolean).length;
    const arcs = segments.map((_, i) => {
      const start = startOffset + i * (segmentAngle + gapAngle);
      const end = start + segmentAngle;
      return { attended: i < attendedCount, start, end };
    });

    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background arcs */}
          {arcs.map((arc, i) => (
            <Path
              key={`bg-${i}`}
              d={describeThickArc(cx, cy, outerR, innerR, arc.start, arc.end)}
              fill={backgroundColor}
            />
          ))}
          {/* Foreground (attended) arcs */}
          {arcs.map((arc, i) =>
            arc.attended ? (
              <Path
                key={`fg-${i}`}
                d={describeThickArc(cx, cy, outerR, innerR, arc.start, arc.end)}
                fill={progressColor}
              />
            ) : null,
          )}
        </Svg>
      </View>
    );
  }

  // Full circle: single segment or continuous progress fallback
  const effectiveProgress =
    segments && segments.length === 1 ? (segments[0] ? 1 : 0) : Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - effectiveProgress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} stroke={backgroundColor} strokeWidth={strokeWidth} fill="none" />
        {effectiveProgress > 0 && (
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
      </Svg>
    </View>
  );
}
