import React from "react";
import SvgIcon from "./SvgIcon";
import DanmakuComponent from "./DanmakuComponent";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  danmakuText: string;
  enableDanmaku: boolean;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  danmakuText = "好看",
  enableDanmaku = true,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
        className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-90 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      >
        <div
          ref={containerRef}
          className={`rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out relative ${
            isFullscreen
              ? "w-full h-full"
              : "max-w-4xl max-h-[90vh] w-full mx-4"
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: isOpen
              ? "modalSlideIn 0.3s ease-out"
              : "modalSlideOut 0.3s ease-in",
          }}
        >
          {!isFullscreen && (
            <button
              onClick={onClose}
              className="cursor-pointer absolute top-4 right-4 z-9999"
            >
              <SvgIcon name="close" width={30} height={30} color="#fff" />
            </button>
          )}

          <div className="relative group">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls={false}
              onClick={togglePlay}
            />

            {/* 自定义控制栏 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-gray-300 text-2xl transition-colors duration-200"
                  >
                    {isPlaying ? (
                      <SvgIcon
                        name="pause1"
                        width={30}
                        height={30}
                        color="#fff"
                      />
                    ) : (
                      <SvgIcon
                        name="play1"
                        width={30}
                        height={30}
                        color="#fff"
                      />
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-gray-300 text-lg transition-colors duration-200"
                  >
                    {isFullscreen ? "⛶" : "⛶"}
                  </button>
                </div>
              </div>
            </div>

            {/* 播放按钮覆盖层 */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="bg-black bg-opacity-50 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl hover:bg-opacity-75 transition-all duration-200 transform hover:scale-105"
                >
                  ▶
                </button>
              </div>
            )}
          </div>
        </div>

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
        `}</style>
      </div>
    </>
  );
};

export default VideoModal;
