import { VideoContent } from "@/types/videoContents";

export const searchYoutubeVideos = async (query: string): Promise<VideoContent> => {
    // After Google Speech-to-Text gives you `transcribedText`
    fetch('http://localhost:4000/api/process-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Detected Topic:', data.topic);
        console.log('YouTube Videos:', data.videos);
        // Display videos in your UI
        return {
            topic: data.topic,
            videos: data.videos.map((video: { title: string; url: string }) => ({
                title: video.title,
                url: video.url
            }))
        }
    })
    .catch(error => {
        console.error('AI search failed', error);
    });
    return { topic: '', videos: [] }; // Placeholder return, actual data will be handled in the .then block

}