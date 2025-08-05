import React, { useState, useEffect, useRef, useCallback } from "react";

interface DanmakuItem {
  id: string;
  text: string;
  top: number;
  left: number;
  speed: number;
  opacity: number;
  fontSize: number;
  color: string;
}

interface DanmakuComponentProps {
  isVisible: boolean;
  text: string;
  opacity?: number; // 透明度 0-1
  speed?: number; // 速度 1-10
  isLoop?: boolean; // 是否循环
  maxLines?: number; // 最大行数
  screenRatio?: number; // 屏幕占比 0-1
  interval?: number; // 间隔时间(ms)
  fontSize?: number; // 字体大小
  color?: string; // 文字颜色
  density?: number; // 密度 1-10
  randomHeight?: boolean; // 是否随机高度
  randomSpeed?: boolean; // 是否随机速度
  randomSize?: boolean; // 是否随机大小
  zIndex?: number; // 层级
}

const DanmakuComponent: React.FC<DanmakuComponentProps> = ({
  isVisible,
  text,
  opacity = 0.8,
  speed = 5,
  isLoop = true,
  maxLines = 10,
  screenRatio = 0.5,
  interval = 1000,
  fontSize = 16,
  color = "#ffffff",
  density = 5,
  randomHeight = true,
  randomSpeed = true,
  randomSize = true,
  zIndex = 10,
}) => {
  const [danmakus, setDanmakus] = useState<DanmakuItem[]>([]);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // 最大弹幕数量限制，防止内存泄漏
  const MAX_DANMAKU_COUNT = 50;

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);

      if (!isVisible) {
        // 页面不可见时，暂停动画和定时器
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      } else {
        // 页面重新可见时，清除所有弹幕并重新开始
        setDanmakus([]);
        lastTimeRef.current = performance.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 生成随机弹幕项
  const createDanmaku = useCallback((): DanmakuItem => {
    const containerHeight = window.innerHeight * screenRatio;
    const lineHeight = fontSize * 1.5;
    const maxTop = Math.max(0, containerHeight - lineHeight);

    return {
      id: Math.random().toString(36).substr(2, 9),
      text,
      top: randomHeight
        ? Math.random() * maxTop
        : Math.random() * maxLines * lineHeight,
      left: window.innerWidth,
      speed: randomSpeed ? speed * (0.5 + Math.random()) : speed,
      opacity: opacity * (0.7 + Math.random() * 0.3),
      fontSize: randomSize ? fontSize * (0.8 + Math.random() * 0.4) : fontSize,
      color,
    };
  }, [
    text,
    screenRatio,
    fontSize,
    randomHeight,
    maxLines,
    randomSpeed,
    speed,
    opacity,
    randomSize,
    color,
  ]);

  // 添加新弹幕（带数量限制）
  const addDanmaku = useCallback(() => {
    if (!isVisible || !isPageVisible) return;

    setDanmakus((prev) => {
      // 如果弹幕数量已达上限，移除最老的弹幕
      let currentDanmakus = prev;
      if (currentDanmakus.length >= MAX_DANMAKU_COUNT) {
        currentDanmakus = currentDanmakus.slice(-MAX_DANMAKU_COUNT + density);
      }

      const newDanmakus = [];
      for (let i = 0; i < density; i++) {
        newDanmakus.push(createDanmaku());
      }

      return [...currentDanmakus, ...newDanmakus];
    });
  }, [isVisible, isPageVisible, density, createDanmaku]);

  // 优化的动画更新（使用时间戳进行节流）
  const updateDanmakus = useCallback(
    (currentTime: number) => {
      // 节流：每16ms更新一次（约60fps）
      if (currentTime - lastTimeRef.current < 16) {
        if (isVisible && isPageVisible) {
          animationRef.current = requestAnimationFrame(updateDanmakus);
        }
        return;
      }

      lastTimeRef.current = currentTime;

      setDanmakus((prev) => {
        const updated = prev
          .map((danmaku) => ({
            ...danmaku,
            left: danmaku.left - danmaku.speed,
          }))
          .filter((danmaku) => danmaku.left > -300); // 增加过滤范围，减少频繁操作

        return updated;
      });

      if (isVisible && isPageVisible) {
        animationRef.current = requestAnimationFrame(updateDanmakus);
      }
    },
    [isVisible, isPageVisible]
  );

  // 主要的弹幕控制逻辑
  useEffect(() => {
    if (isVisible && isPageVisible) {
      // 立即添加第一批弹幕
      addDanmaku();

      // 设置定时添加弹幕
      if (isLoop) {
        intervalRef.current = setInterval(addDanmaku, interval);
      }

      // 开始动画
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(updateDanmakus);
    } else {
      // 清理定时器和动画
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // 如果组件不可见，清空所有弹幕
      if (!isVisible) {
        setDanmakus([]);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, isPageVisible, isLoop, interval, addDanmaku, updateDanmakus]);

  // 窗口大小变化时清理弹幕
  useEffect(() => {
    const handleResize = () => {
      setDanmakus([]);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        height: `${screenRatio * 100}%`,
        zIndex,
      }}
    >
      {danmakus.map((danmaku) => (
        <div
          key={danmaku.id}
          className="absolute whitespace-nowrap select-none"
          style={{
            top: `${danmaku.top}px`,
            left: `${danmaku.left}px`,
            opacity: danmaku.opacity,
            fontSize: `${danmaku.fontSize}px`,
            color: danmaku.color,
            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            fontWeight: "bold",
            transform: "translateZ(0)", // 硬件加速
            willChange: "transform", // 优化性能
          }}
        >
          {danmaku.text}
        </div>
      ))}
    </div>
  );
};

export default DanmakuComponent;
