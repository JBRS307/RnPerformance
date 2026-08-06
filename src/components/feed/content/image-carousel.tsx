import { useCallback, useContext, useLayoutEffect, useRef } from "react";
import { View, Pressable, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, useWindowDimensions, LayoutChangeEvent } from "react-native";

import { ColorsContext } from "@/context/colors-context";
import { FeedImage } from "@/data/mock-feed";
import { CarouselImage } from "./carousel-image";
import { FlashList, FlashListRef, useMappingHelper, useRecyclingState } from "@shopify/flash-list";

export const ImageCarousel = ({
  postId,
  images,
  onImagePress,
}: {
  postId: string;
  images: FeedImage[];
  onImagePress?: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useRecyclingState(0, [postId]);
  const colors = useContext(ColorsContext);
  const { getMappingKey } = useMappingHelper();
  const listRef = useRef<FlashListRef<FeedImage>>(null);

  const { width: windowWidth } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useRecyclingState(windowWidth, [postId]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setPageWidth(prev => width > 0 && width !== prev ? width : prev);
  }, []);

  useLayoutEffect(() => {
    listRef.current?.scrollToTop({ animated: false });
  }, [postId])

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / pageWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const renderItem = useCallback(({ item }: { item: FeedImage }) => (
    <Pressable onPress={onImagePress}>
      <CarouselImage image={item} width={pageWidth} />
    </Pressable>
  ), [onImagePress, pageWidth]);

  return (
    <View onLayout={handleLayout}>
      <FlashList
        ref={listRef}
        horizontal
        data={images}
        renderItem={renderItem}
        keyExtractor={item => item.uri}
        pagingEnabled
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      />

      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((img, i) => (
            <View
              key={getMappingKey(`dot-${img.uri}`, i)}
              style={[
                styles.dot,
                i === activeIndex
                  ? [styles.dotActive, { backgroundColor: colors.tint }]
                  : { backgroundColor: colors.icon + "40" },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
