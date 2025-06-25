import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet,Text,TouchableOpacity,View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { recordSpeech } from '@/functions/recordSpeech';
import { transcribeSpeech } from '@/functions/transcribeSpeech';
import useWebFocus from '@/hooks/useWebFocus';

export default function HomeScreen() {
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRecordingRef = useRef(new Audio.Recording());

  const isWebFocus = useWebFocus();
  const webAudioPermissionRef = useRef<MediaStream | null>(null);

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
          </View>
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
      </View>
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