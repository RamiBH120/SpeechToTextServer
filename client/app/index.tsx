import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet,Text,TouchableOpacity,View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { recordSpeech } from '@/functions/recordSpeech';
import { transcribeSpeech } from '@/functions/transcribeSpeech';
import useWebFocus from '@/hooks/useWebFocus';
import { searchYoutubeVideos } from '@/functions/searchYoutubeVideos';
import { VideoContent } from '@/types/videoContents';

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
    if(isWebFocus){
      const getMicrophonePermission = async () => {
        const permissions= await navigator.mediaDevices.getUserMedia({ audio: true });
        webAudioPermissionRef.current = permissions;
      };
      if(!webAudioPermissionRef.current) getMicrophonePermission();
      
    }else { 
      if( webAudioPermissionRef.current) {
        webAudioPermissionRef.current
        .getTracks()
        .forEach(track => track.stop());
        webAudioPermissionRef.current = null;
      }
    }
  }, [isWebFocus]);

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
          <Text style={styles.title}>Welcome to the Speech-to-Text App</Text>
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
          <Text style={styles.subtitle}>
            {results?.topic}
          </Text>
        </View>
        </View>
        <View style={{alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'row',gap: 20}}>
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
          opacity: transcription ? 1 : 0.7,
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
        <Text style={styles.subtitle}>YouTube Videos:</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
        <View style={{marginBottom: 20}}>
          {results?.videos.length === 0 ? (
            <Text>No videos found for this topic.</Text>
          ):(
            <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results?.videos.map(video => (
                <View key={video.url}>
                  <Text>{video.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        )}
        
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  recordButton: {
    backgroundColor: '#ff0000',
    borderRadius: 50,
    marginTop: 100,
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