import React from "react";
import Image from "next/image";
import SvgIcon from "./SvgIcon";
import DanmakuComponent from "./DanmakuComponent";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  images: string[];
  danmakuText?: string; // 弹幕文本
  enableDanmaku?: boolean; // 是否启用弹幕
  imageWidth?: number; // 图片宽度，默认500
  imageHeight?: number; // 图片高度，默认500
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  title,
  images,
  danmakuText = "好吃",
  enableDanmaku = true,
  imageWidth = 500,
  imageHeight = 500,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // 当模态框打开时重置图片索引
  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
        className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-in-out scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: isOpen
              ? "modalSlideIn 0.3s ease-out"
              : "modalSlideOut 0.3s ease-in",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button onClick={onClose} className="cursor-pointer">
              <SvgIcon name="close" width={30} height={30} color="#333" />
            </button>
          </div>

          <div className="relative">
            <div className="flex justify-center items-center">
              <Image
                src={images[currentIndex]}
                alt={`${title} ${currentIndex + 1}`}
                width={imageWidth}
                height={imageHeight}
                className="rounded-lg"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[rgba(0,0,0,0.5)] opacity-[50%] text-white p-2 rounded-full hover:opacity-[100%] transition-all duration-200 cursor-pointer"
                >
                  <SvgIcon name="left" width={20} height={20} color="#fff" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[rgba(0,0,0,0.5)] opacity-[50%] text-white p-2 rounded-full hover:opacity-[100%] transition-all duration-200 cursor-pointer"
                >
                  <SvgIcon name="right" width={20} height={20} color="#fff" />
                </button>
                <div className="flex justify-center mt-4 space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-1 rounded-[10px] transition-all duration-200 ${
                        index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </>
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

export default ImageModal;
