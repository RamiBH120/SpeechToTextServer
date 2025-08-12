import { VideoContent } from '@/types/videoContents';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const VideoList = ({results,styles}: {results: VideoContent | null, styles: any}) => {
    return (
        <ScrollView style={styles.videosScrollView}>
            {results?.videos.map(video => (
                <TouchableOpacity
                    key={video.url}
                    style={styles.videoItem}
                    onPress={() => {
                        // Open the URL - this will work on web, for mobile you might need Linking
                        if (typeof window !== 'undefined') {
                            window.open(video.url, '_blank');
                        }
                    }}
                >
                    <View style={styles.videoThumbnailContainer}>
                        <View style={styles.videoThumbnail}>
                            <FontAwesome name="play-circle" size={40} color="#ff0000" />
                        </View>
                    </View>
                    <View style={styles.videoContent}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                            {video.title}
                        </Text>
                        <Text style={styles.videoUrl} numberOfLines={1}>
                            {video.url}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )
}

export default VideoList