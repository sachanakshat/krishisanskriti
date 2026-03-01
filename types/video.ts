// Shared type for a video+blog document stored in MongoDB
export interface VideoPost {
  _id?: string;
  videoId: string;       // YouTube video ID — unique key (e.g. "dQw4w9WgXcQ")
  title: string;         // English title
  titleHi?: string;      // Hindi title (optional)
  description: string;   // Short description (English)
  descriptionHi?: string;
  blogContent: string;   // Full blog post in Markdown (English)
  blogContentHi?: string;
  publishedAt: string;   // ISO date string
  createdAt?: string;
  updatedAt?: string;
}
