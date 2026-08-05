import { useContext, useMemo, useState } from "react";
import { View, TouchableOpacity, Share, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { ColorsContext } from "@/context/colors-context";
import { LikesCount } from "@/components/feed/content/likes-count";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useRecyclingState } from "@shopify/flash-list";

export const ActionButtons = ({
  postId,
  username,
  likesInitial,
  isLikedInitial,
}: {
  postId: string;
  username: string;
  likesInitial: number;
  isLikedInitial: boolean;
}) => {
  const [likes, setLikes] = useRecyclingState(likesInitial, [postId]);
  const [isLiked, setIsLiked] = useRecyclingState(isLikedInitial, [postId]);
  const colors = useContext(ColorsContext);
  const router = useRouter();

  const likesText = useMemo(() => likes.toLocaleString() + ' likes', [likes]);

  const handleLike = () => {
    const prevIsLiked = isLiked;
    const nextIsLiked = !prevIsLiked;
    setIsLiked(nextIsLiked);
    setLikes(prevLikes => !prevIsLiked ? prevLikes + 1 : prevLikes - 1);
  };

  const handleComment = () => {
    router.push(`/post/comments/${postId}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post by @${username}: https://example.com/post/${postId}`,
        url: `https://example.com/post/${postId}`
      });
    } catch {
      // User cancelled
    }
  };

  const openLikes = () => {
    router.push(`/likes/${postId}`);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftButtons}>
          <TouchableOpacity onPress={handleLike} style={styles.iconButton}>
            <IconSymbol name={isLiked ? 'heart.fill' : 'heart'} size={26} color={isLiked ? "#FF6B6B" : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleComment}>
            <IconSymbol name='bubble.right' size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <IconSymbol name='paperplane' size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <LikesCount likesText={likesText} onPress={openLikes} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8
  },
  leftButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  iconButton: {
    padding: 2
  }
});
