import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface RadialProgressProps {
    size: number;
    strokeWidth: number;
    progress: number; // 0 to 1
    progressColor: string;
    backgroundColor: string;
}

export function RadialProgress({ size, strokeWidth, progress, progressColor, backgroundColor }: RadialProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {progress > 0 && (
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                )}
            </Svg>
        </View>
    );
}
