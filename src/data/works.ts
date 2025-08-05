// 作品数据类型定义
export interface WorkItem {
  title: string;
  description: string;
  image: string;
  tech: string[];
  link: string;
  features: string[];
  desc?: string;
  download_url?: string;
  function?: {
    name: string;
    img1: string;
    img2?: string;
    img3?: string;
  }[];
}

// 作品数据
export const worksData: WorkItem[] = [
  {
    title: "wuxian's web",
    description:
      "基于Next.js开发的个人介绍网站，简单介绍了我自己个儿，歌和视频都很有品！！！！。",
    image: "/images/work1.jpg",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    link: "#",
    features: ["个人介绍", "作品集", "喜好", "留言"],
  },
];
