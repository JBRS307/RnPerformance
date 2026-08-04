import { View, Text } from "react-native";
import { Image } from 'expo-image';

import { FeedPost } from "@/data/mock-feed";
import { resized } from "@/utils/image-sizing";
import { type ChartColors } from "./chart-utils";
import { AnimatedNumber } from "./AnimatedNumber";

const AVATAR_SIZE = 36;

export function ChartPostHeader({ post, colors }: { post: FeedPost; colors: ChartColors }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <Image source={resized(post.user.avatar, AVATAR_SIZE)} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{post.user.username}</Text>
        <Text style={{ fontSize: 11, color: colors.icon }} numberOfLines={1}>{post.caption || "No caption"}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <AnimatedNumber value={post.likes} style={{ fontSize: 16, fontWeight: "700", color: colors.text }} />
        <Text style={{ fontSize: 10, color: colors.icon }}>total likes</Text>
      </View>
    </View>
  );
}
