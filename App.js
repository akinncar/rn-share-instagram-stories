import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, StyleSheet, View, Button, Switch, Text} from 'react-native';

import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';

const App = () => {
  const appState = useRef(AppState.currentState);
  const [isLoading, setIsLoading] = useState(false);
  const [includeImage, setIncludeImage] = useState(false);
  const [includeVideo, setIncludeVideo] = useState(false);
  const [includeSticker, setIncludeSticker] = useState(false);
  const [includeBackgroundColor, setIncludeBackgroundColor] = useState(false);
  const [cachePaths, setCachePaths] = useState([]);

  const share = async () => {
    try {
      setIsLoading(true);
      const [cacheImage, cacheVideo, cacheSticker] = await Promise.all([
        RNFetchBlob.config({
          fileCache: true,
          appendExt: 'jpg',
        }).fetch('GET', 'https://via.placeholder.com/150.jpg/0000FF/808080'),
        RNFetchBlob.config({
          fileCache: true,
          appendExt: 'mp4',
        }).fetch('GET', 'https://www.w3schools.com/tags/movie.mp4'),
        RNFetchBlob.config({
          fileCache: true,
          appendExt: 'jpg',
        }).fetch('GET', 'https://via.placeholder.com/640x480.jpg'),
      ]);

      setCachePaths([
        cacheImage.path(),
        cacheVideo.path(),
        cacheSticker.path(),
      ]);

      const shareOptions = {
        backgroundImage: includeImage ? `file://${cacheImage.path()}` : null,
        backgroundVideo: includeVideo ? `file://${cacheVideo.path()}` : null,
        stickerImage: includeSticker ? `file://${cacheSticker.path()}` : null,
        backgroundTopColor: includeBackgroundColor ? '#cecec0' : null,
        backgroundBottomColor: includeBackgroundColor ? '#f0cccc' : null,
        attributionURL: 'https://github.com/akinncar',
        social: Share.Social.INSTAGRAM_STORIES,
      };
      await Share.shareSingle(shareOptions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTempFiles = useCallback(
    async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        await Promise.all(
          cachePaths.map((path) => RNFetchBlob.fs.unlink(path)),
        );
        setCachePaths([]);
      }

      appState.current = nextAppState;
    },
    [cachePaths],
  );

  useEffect(() => {
    AppState.addEventListener('change', removeTempFiles);

    return () => {
      AppState.removeEventListener('change', removeTempFiles);
    };
  }, [removeTempFiles]);

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.text}>With Image</Text>
        <Switch onValueChange={setIncludeImage} value={includeImage} />
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.text}>With Video</Text>
        <Switch onValueChange={setIncludeVideo} value={includeVideo} />
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.text}>With Sticker</Text>
        <Switch onValueChange={setIncludeSticker} value={includeSticker} />
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.text}>With Custom Background</Text>
        <Switch
          onValueChange={setIncludeBackgroundColor}
          value={includeBackgroundColor}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button disabled={isLoading} title="Share" onPress={share} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '70%',
  },
  buttonContainer: {
    width: '70%',
  },
});

export default App;
