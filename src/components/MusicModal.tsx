import React from "react";
import SvgIcon from "./SvgIcon";
import Image from "next/image";
import DanmakuComponent from "./DanmakuComponent";

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  musicUrl: string;
  author?: string;
  cover?: string;
  danmakuText: string;
  enableDanmaku: boolean;
}

interface LyricLine {
  time: string;
  text: string;
  artist?: string;
  section?: string;
}

interface LyricsData {
  metadata: {
    title: string;
    lyricists: string[];
    composer: string;
    arranger: string;
    mixer: string;
    guitarist: string;
  };
  lyrics: LyricLine[];
}

const MusicModal: React.FC<MusicModalProps> = ({
  isOpen,
  onClose,
  title,
  musicUrl,
  author = "未知艺术家",
  cover = "/images/default-music-cover.jpg",
  danmakuText = "好听",
  enableDanmaku = true,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isLoop, setIsLoop] = React.useState(false);
  const [lyrics, setLyrics] = React.useState<LyricLine[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = React.useState(-1);
  const [showLyrics, setShowLyrics] = React.useState(true); // 默认显示歌词
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = React.useRef<HTMLDivElement>(null);

  // 将时间字符串转换为秒数
  const timeToSeconds = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(":").map(parseFloat);
    return minutes * 60 + seconds;
  };

  // 加载歌词文件
  React.useEffect(() => {
    if (isOpen && title) {
      // 根据音乐标题加载对应的歌词文件
      fetch(`/ci/${title}.json`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("歌词文件不存在");
        })
        .then((data: LyricsData) => {
          setLyrics(data.lyrics);
        })
        .catch((error) => {
          console.log("无法加载歌词:", error);
          setLyrics([]);
        });
    }
  }, [isOpen, title]);

  // 根据当前播放时间更新当前歌词索引
  React.useEffect(() => {
    if (lyrics.length > 0) {
      let index = -1;
      for (let i = 0; i < lyrics.length; i++) {
        const lyricTime = timeToSeconds(lyrics[i].time);
        if (currentTime >= lyricTime) {
          index = i;
        } else {
          break;
        }
      }
      setCurrentLyricIndex(index);
    }
  }, [currentTime, lyrics]);

  React.useEffect(() => {
    if (currentLyricIndex >= 0 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;

      // 每句歌词高度37px，从第3句开始滚动
      if (currentLyricIndex >= 2) {
        // 让当前歌词显示在第3句的位置（索引2的位置）
        // 滚动距离 = (当前歌词索引 - 2) * 37px
        const scrollTop = (currentLyricIndex - 2) * 37;

        container.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      } else {
        // 前两句歌词不滚动，保持在顶部
        container.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } else if (currentLyricIndex === -1 && lyricsContainerRef.current) {
      // 如果没有当前歌词（开始播放前），滚动到顶部
      lyricsContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [currentLyricIndex]);

  React.useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentLyricIndex(-1);
      setShowLyrics(true); // 重置为默认显示歌词
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleLoop = () => {
    setIsLoop(!isLoop);
    if (audioRef.current) {
      audioRef.current.loop = !isLoop;
    }
  };

  // 切换歌词显示状态
  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const time = percentage * duration;

    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 弹幕层 - 在模态框后面 */}
      {enableDanmaku && (
        <DanmakuComponent
          isVisible={isOpen}
          text={danmakuText}
          opacity={0.7}
          speed={3}
          isLoop={true}
          maxLines={8}
          screenRatio={0.5}
          interval={800}
          fontSize={18}
          color="#ffffff"
          density={3}
          randomHeight={true}
          randomSpeed={true}
          randomSize={true}
          zIndex={45} // 在模态框背景之上，内容之下
        />
      )}
      <div
        className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-75 flex flex-col items-center justify-center z-50 transition-opacity duration-300 ease-in-out font-[family-name:var(--font-geist-sans)]"
        onClick={onClose}
      >
        <div
          className="bg-[#282A2A] rounded-lg p-8 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out relative flex flex-col items-center justify-center pt-[60px]"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: isOpen
              ? "modalSlideIn 0.3s ease-out"
              : "modalSlideOut 0.3s ease-in",
          }}
        >
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4"
          >
            <SvgIcon name="close" width={30} height={30} color="#333" />
          </button>

          <div className="text-center bg-[#3F4142] w-[300px] h-[300px] rounded-[50%] relative flex items-center justify-center shadow-lg">
            <Image
              src="/images/arm.png"
              alt="arm"
              width={150}
              height={150}
              className={`absolute left-[70%] translate-x-[-50%] top-[-30px] z-10  `}
              style={{
                transformOrigin: "13px 12px", // 更靠近左下角的旋转点
                transform: isPlaying ? "rotate(23deg)" : "rotate(0deg)",
                transition: "transform 1000ms ease-in-out",
              }}
            />
            <div className="w-[270px] h-[270px] bg-[#030303] rounded-full overflow-hidden shadow-lg flex items-center justify-center relative">
              <Image
                src={cover}
                alt={title}
                width={200}
                height={200}
                className={`object-cover rounded-full border-3 border-[#fff] transition-transform duration-1000 ${
                  isPlaying ? "animate-spin" : ""
                }`}
                style={{
                  animationDuration: "10s",
                }}
              />

              {/* 播放按钮 - 只在暂停时显示 */}
              {!isPlaying && (
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-[rgba(0,0,0,0.5)] w-[50px] h-[50px] rounded-full"
                  onClick={togglePlay}
                >
                  <SvgIcon name="play" width={50} height={50} color="#fff" />
                </div>
              )}

              {/* 暂停按钮 - 只在播放时显示 */}
              {isPlaying && (
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-[rgba(0,0,0,0.5)] w-[50px] h-[50px] rounded-full"
                  onClick={togglePlay}
                >
                  <SvgIcon name="pause" width={50} height={50} color="#fff" />
                </div>
              )}
            </div>
          </div>

          <div className="text-xl text-white mb-2 mt-6">{title}</div>
          <p className="text-gray-300 mb-6">{author}</p>

          <div className="flex gap-[20px] items-center mb-4">
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex gap-[10px] items-center">
              {!isLoop ? (
                <div onClick={toggleLoop}>
                  <SvgIcon
                    name="pepicons"
                    width={20}
                    height={20}
                    color="#fff"
                    className="cursor-pointer"
                  />
                </div>
              ) : (
                <div onClick={toggleLoop}>
                  <SvgIcon
                    name="no-pepicons"
                    width={20}
                    height={20}
                    color="#fff"
                    className="cursor-pointer"
                  />
                </div>
              )}
              <span
                className={`cursor-pointer text-white text-sm ${
                  showLyrics ? "font-bold" : "font-normal"
                }`}
                onClick={toggleLyrics}
              >
                词
              </span>
            </div>
          </div>

          {/* 自定义进度条 */}
          <div className="w-full mb-4">
            <div
              className="w-full h-2 bg-gray-600 rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
            >
              {/* 进度条背景 */}
              <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
              {/* 进度条填充 */}
              <div
                className="absolute top-0 left-0 h-full  bg-[#fff] rounded-full transition-all duration-100"
                style={{
                  width: `${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%`,
                }}
              ></div>
              {/* 进度条滑块 */}
              <div
                className="absolute top-[50%] transform w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer transition-all duration-100"
                style={{
                  left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  transform: "translate(-50%, -50%)",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={musicUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            loop={isLoop}
          />
        </div>

        {/* 歌词显示区域 - 在弹窗下方，只有在showLyrics为true且有歌词时才显示 */}
        {lyrics.length > 0 && showLyrics && (
          <div
            className="mt-4 w-full max-w-md mx-4 rounded-lg p-4 max-h-[234px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={lyricsContainerRef}
              className="h-full overflow-y-auto scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {lyrics.map((lyric, index) => {
                const isCurrentLyric = index === currentLyricIndex;
                const isPassedLyric = index < currentLyricIndex;

                return (
                  <div
                    key={index}
                    className={`py-2 px-2 transition-all duration-300 text-center ${
                      isCurrentLyric
                        ? "text-white text-lg font-bold transform scale-110"
                        : isPassedLyric
                        ? "text-gray-400 text-sm"
                        : "text-gray-300 text-sm"
                    }`}
                    style={{
                      lineHeight: "1.5",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {lyric.artist && (
                      <div className="text-xs text-gray-500 mb-1">
                        {lyric.artist}
                      </div>
                    )}
                    {lyric.section && (
                      <div className="text-xs text-blue-400 mb-1 font-semibold">
                        [{lyric.section}]
                      </div>
                    )}
                    <div>{lyric.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes modalSlideOut {
            from {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
            to {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
          }

          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </>
  );
};

export default MusicModal;
