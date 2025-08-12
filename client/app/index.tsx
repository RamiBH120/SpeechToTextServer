import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect, useRef, useState } from 'react';
import { Audio, Video } from 'expo-av';
import { recordSpeech } from '@/functions/recordSpeech';
import { transcribeSpeech } from '@/functions/transcribeSpeech';
import useWebFocus from '@/hooks/useWebFocus';
import { searchYoutubeVideos } from '@/functions/searchYoutubeVideos';
import { VideoContent } from '@/types/videoContents';
import VideoList from '@/components/elements/VideoList';


export default function HomeScreen() {
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRecordingRef = useRef(new Audio.Recording());

  const isWebFocus = useWebFocus();
  const webAudioPermissionRef = useRef<MediaStream | null>(null);
  const [results, setResults] = useState<VideoContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isWebFocus) {
      const getMicrophonePermission = async () => {
        const permissions = await navigator.mediaDevices.getUserMedia({ audio: true });
        webAudioPermissionRef.current = permissions;
      };
      if (!webAudioPermissionRef.current) getMicrophonePermission();

    } else {
      if (webAudioPermissionRef.current) {
        webAudioPermissionRef.current
          .getTracks()
          .forEach(track => track.stop());
        webAudioPermissionRef.current = null;
      }
    }
  }, [isWebFocus,results]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    await recordSpeech(audioRecordingRef,
      setIsRecording,
      !!webAudioPermissionRef.current);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscription(speechTranscript || '');
    } catch (error) {
      console.error("Transcription failed:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const searchYouTube = async (query: string) => {
    try {
      setIsLoading(true);
      if (!query) {
        console.warn("No transcription available for YouTube search.");
        return;
      }
      const results = await searchYoutubeVideos(query);
      setResults(results);
      console.log("Search results:", results);
      
      
    } catch (error) {
      console.error("YouTube search failed:", error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.mainScrollContainer}>
        <View style={styles.mainInnerContainer}>
          <Text style={styles.title}>Welcome to the Agriculture Practices Speech-to-Text App</Text>
          <View style={styles.transcriptionContainer}>
            {isTranscribing ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Text style={{
                ...styles.transcriptionText,
                color: transcription ? '#000' : '#999'
              }}>{transcription ||
                "Your transcription will appear here"}
              </Text>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'row', gap: 20 }}>
          <TouchableOpacity
            style={{
              ...styles.recordButton,
              opacity: isRecording ? 1 : 0.7
            }}
            activeOpacity={0.7}
            onPressIn={handleStartRecording}
            onPressOut={handleStopRecording}
            disabled={isTranscribing || isRecording}
          >
            {isRecording ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <FontAwesome name="microphone" size={40} color="black" />
            )}
          </TouchableOpacity>


          <TouchableOpacity
            style={{
              ...styles.recordButton,
              backgroundColor: transcription ? '#4CAF50' : '#0c0',
              opacity: transcription.length > 0 ? 1 : 0.2,
            }}
            activeOpacity={0.7}
            onPress={() => searchYouTube(transcription)}
            disabled={transcription === ''}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <FontAwesome6 name="magnifying-glass" size={24} color="black" />
            )}
          </TouchableOpacity>
        </View>
          <View style={{ padding: 20, maxHeight: '100%', width: '100%', display: 'flex', flexDirection: 'column',borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginTop: 20 }}>
            {isLoading ? (
              <ActivityIndicator size='small' color="#0000ff" />
            ) : (
              <Text style={{
                ...styles.transcriptionText,
                color: transcription ? '#000' : '#999',
                textAlign: 'center',
                fontSize: 16,
              }}
              >{results?.topic ||
                "Start recording then search for feedback and YouTube videos."}
              </Text>
              
            )}
          </View>
        <View style={styles.videosContainer}>
          <Text style={styles.subtitle}>YouTube Videos {results?.videos && results?.videos?.length > 0 && `(${results?.videos?.length})`}</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
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
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    maxHeight: '100%',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  videosContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 20,
    maxHeight: 400,
  },
  videosScrollView: {
    width: '100%',
  },
  videoItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  videoThumbnailContainer: {
    marginRight: 12,
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    backgroundColor: '#000',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContent: {
    flex: 1,
    paddingRight: 8,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  videoUrl: {
    fontSize: 12,
    color: '#666',
  },
  videoContainer: {
    maxWidth: 300,
    height: 200,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    backgroundColor: '#ff0000',
    borderRadius: 50,
    marginTop: 20,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 15,
    elevation: 5,
  },
  mainScrollContainer: {
    height: '100%',
    width: '100%',
    padding: 20,
  },
  mainInnerContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  transcriptionContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
  },
});