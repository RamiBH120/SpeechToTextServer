import { VideoContent } from "@/types/videoContents";

export const searchYoutubeVideos = async (query: string): Promise<VideoContent> => {
    try {
        // After Google Speech-to-Text gives you `transcribedText`
        const response = await fetch('http://localhost:4000/api/process-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: query })
        });
        
        const data = await response.json();
        return { 
            topic: data.topic, 
            videos: data.videos 
        };
    } catch (error) {
        console.error('AI search failed', error);
        return { 
            topic: '', 
            videos: [] 
        };
    }
}