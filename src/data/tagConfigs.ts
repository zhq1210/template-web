export interface ImageModalConfig {
  isOpen: boolean;
  title: string;
  images: string[];
  danmakuText: string;
  enableDanmaku: boolean;
  imageWidth: number;
  imageHeight: number;
}

export interface MusicModalConfig {
  isOpen: boolean;
  title: string;
  musicUrl: string;
  cover: string;
  author: string;
  danmakuText: string;
  enableDanmaku: boolean;
}

export interface VideoModalConfig {
  isOpen: boolean;
  videoUrl: string;
  danmakuText: string;
  enableDanmaku: boolean;
}

export interface TagConfig {
  type: "image" | "music" | "video" | "link";
  config:
    | ImageModalConfig
    | MusicModalConfig
    | VideoModalConfig
    | { url: string };
}

export const tagConfigs: Record<string, TagConfig> = {
  做饭: {
    type: "image",
    config: {
      isOpen: true,
      title: "做饭",
      images: [],
      danmakuText: "好吃",
      enableDanmaku: true,
      imageWidth: 500,
      imageHeight: 500,
    },
  },
  摄影: {
    type: "image",
    config: {
      isOpen: true,
      title: "摄影作品",
      images: [],
      danmakuText: "好看",
      enableDanmaku: true,
      imageWidth: 800,
      imageHeight: 800,
    },
  },
  美食: {
    type: "image",
    config: {
      isOpen: true,
      title: "美食",
      images: [],
      danmakuText: "好吃",
      enableDanmaku: true,
      imageWidth: 500,
      imageHeight: 500,
    },
  },
  五哈: {
    type: "music",
    config: {
      isOpen: true,
      title: "wuha",
      musicUrl: "",
      cover: "/images/wuha.jpg",
      author: "邓超&陈赫&鹿晗&范志毅&宝石Gem&王勉",
      danmakuText: "好听",
      enableDanmaku: true,
    },
  },
  天空中的歌: {
    type: "music",
    config: {
      isOpen: true,
      title: "天空中的歌",
      musicUrl: "",
      cover: "/images/tkzdg.jpg",
      author: "崔一乔",
      danmakuText: "好听",
      enableDanmaku: true,
    },
  },
  鲜花: {
    type: "music",
    config: {
      isOpen: true,
      title: "鲜花",
      musicUrl: "",
      cover: "/images/xh.jpg",
      author: "回春丹乐队",
      danmakuText: "好听",
      enableDanmaku: true,
    },
  },
  蜡笔小新: {
    type: "video",
    config: {
      isOpen: true,
      videoUrl: "",
      danmakuText: "蜡笔小新",
      enableDanmaku: true,
    },
  },
  沧元图: {
    type: "video",
    config: {
      isOpen: true,
      videoUrl: "",
      danmakuText: "沧元图",
      enableDanmaku: true,
    },
  },
  枕刀歌: {
    type: "video",
    config: {
      isOpen: true,
      videoUrl: "",
      danmakuText: "枕刀歌",
      enableDanmaku: true,
    },
  },
  镖人: {
    type: "video",
    config: {
      isOpen: true,
      videoUrl: "",
      danmakuText: "镖人",
      enableDanmaku: true,
    },
  },
  英雄联盟手游: {
    type: "video",
    config: {
      isOpen: true,
      videoUrl: "",
      danmakuText: "五杀！我真牛！！",
      enableDanmaku: true,
    },
  },
  不良人: {
    type: "video",
    config: {
      isOpen: true,
      videoUrl: "",
      danmakuText: "有品",
      enableDanmaku: true,
    },
  },
  不良人天罡传: {
    type: "video",
    config: {
      isOpen: true,
      videoUrl: "4",
      danmakuText: "恭迎大帅",
      enableDanmaku: true,
    },
  },
  鬼灭之刃: {
    type: "video",
    config: {
      isOpen: true,
      videoUrl: "",
      danmakuText: "鬼灭之刃",
      enableDanmaku: true,
    },
  },
  音乐: {
    type: "link",
    config: {
      url: "https://y.qq.com/",
    },
  },
};
