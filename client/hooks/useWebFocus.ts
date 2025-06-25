import e from "express";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const useWebFocus = () => {
  const [isFocused, setIsFocused] = useState(Platform.OS === "web" && document.hasFocus());

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isFocused;
}

export default useWebFocus;