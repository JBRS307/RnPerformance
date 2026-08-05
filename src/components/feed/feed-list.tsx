import { useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import { FeedItem } from "@/components/feed/feed-item";
import { SuggestedPostsSection } from "@/components/feed/suggestions/suggested-posts-section";
import { FeedListItem } from "@/data/mock-feed";
import Animated, { SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

export const FeedList = ({
  data,
}: {
  data: FeedListItem[];
}) => {
  const progress = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler(event => {
    const offset = event.contentOffset.y;
    const max = Math.max(1, event.contentSize.height - event.layoutMeasurement.height);
    const p = Math.min(1, Math.max(0, offset / max));
    progress.set(p);
  });

  const renderItem = useCallback(({ item }: { item: FeedListItem }) => (
    item.type === 'suggestions' ? (
      <SuggestedPostsSection posts={item.posts} />
    ) : (
      <FeedItem item={item} />
    )
  ), []);

  return (
    <View style={styles.wrapper}>
      <ProgressBar progress={progress} />
      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const ProgressBar = ({ progress }: { progress: SharedValue<number> }) => {
  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }))
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF3B30",
  },
});
