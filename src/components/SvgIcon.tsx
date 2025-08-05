import React from "react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

interface SvgIconProps {
  name: string;
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  lightColor?: string; // 浅色主题下的颜色
  darkColor?: string; // 深色主题下的颜色
}

export default function SvgIcon({
  name,
  width = 24,
  height = 24,
  className = "",
  color = "currentColor",
  lightColor,
  darkColor,
}: SvgIconProps) {
  const { theme } = useTheme();
  // 根据主题选择颜色
  const getThemeColor = () => {
    if (lightColor && darkColor) {
      return theme === "dark" ? darkColor : lightColor;
    }
    return color;
  };

  const finalColor = getThemeColor();

  return (
    <Image
      src={`/svgs/${name}.svg`}
      alt={name}
      width={width}
      height={height}
      className={className}
      style={{
        filter:
          finalColor !== "currentColor"
            ? `brightness(0) saturate(100%) ${getColorFilter(finalColor)}`
            : undefined,
      }}
    />
  );
}

// 辅助函数：将颜色转换为 CSS filter
function getColorFilter(color: string): string {
  const colorMap: Record<string, string> = {
    "#fff": "invert(100%)",
    "#ffffff": "invert(100%)",
    white: "invert(100%)",
    "#000": "invert(0%)",
    "#000000": "invert(0%)",
    black: "invert(0%)",
    "#6b7280":
      "invert(52%) sepia(6%) saturate(640%) hue-rotate(185deg) brightness(93%) contrast(88%)", // gray-500
    "#9ca3af":
      "invert(64%) sepia(11%) saturate(297%) hue-rotate(185deg) brightness(97%) contrast(87%)", // gray-400
    "#ff0000":
      "invert(13%) sepia(99%) saturate(7404%) hue-rotate(4deg) brightness(97%) contrast(118%)",
    red: "invert(13%) sepia(99%) saturate(7404%) hue-rotate(4deg) brightness(97%) contrast(118%)",
    // 可以添加更多预定义颜色
  };

  return colorMap[color.toLowerCase()] || "invert(50%)";
}
