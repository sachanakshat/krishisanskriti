import type { Metadata } from "next";
import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import type { VideoPost } from "@/types/video";
import BlogPostClient from "./BlogPostClient";

interface Props {
  params: Promise<{ videoId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  try {
    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    const video = await db.collection("videos").findOne({ videoId });
    if (!video) return { title: "Post Not Found" };
    return {
      title: `${video.title} | Krishi Sanskriti`,
      description: video.description,
      openGraph: {
        images: [`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`],
      },
    };
  } catch {
    return { title: "Krishi Sanskriti" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { videoId } = await params;

  let video;
  try {
    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    video = await db.collection("videos").findOne({ videoId });
  } catch {
    notFound();
  }

  if (!video) notFound();

  const serialized: VideoPost = {
    videoId: video.videoId as string,
    title: video.title as string,
    titleHi: video.titleHi as string | undefined,
    description: video.description as string,
    descriptionHi: video.descriptionHi as string | undefined,
    blogContent: video.blogContent as string,
    blogContentHi: video.blogContentHi as string | undefined,
    publishedAt: video.publishedAt as string,
    _id: video._id.toString(),
  };

  return <BlogPostClient video={serialized} />;
}
