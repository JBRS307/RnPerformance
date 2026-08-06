import { useState, useContext, memo } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { ColorsContext } from "@/context/colors-context";
import { FeedPostSlim } from "@/data/mock-feed";

import { ActionButtons } from "./actions/action-buttons";
import { CommentList } from "./comments/comment-list";
import { CommentsLink } from "./comments/comments-link";
import { ImageCarousel } from "./content/image-carousel";
import { PostCaption } from "./content/post-caption";
import { PostTimestamp } from "./content/post-timestamp";
import { TagList } from "./content/tag-list";
import { PostHeader } from "./header/post-header";
import { useRecyclingState } from "@shopify/flash-list";

export const FeedItem = memo(function FeedItem({
  item,
}: {
  item: FeedPostSlim;
}) {
  const colors = useContext(ColorsContext);
  const router = useRouter();
  const [isHidden, setIsHidden] = useRecyclingState(false, [item.id])

  if (isHidden) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <PostHeader
        postId={item.id}
        username={item.user.username}
        avatar={item.user.avatar}
        isVerified={item.user.isVerified}
        locationName={item.location.name}
        onHidePost={() => setIsHidden(true)}
      />

      <ImageCarousel
        postId={item.id}
        images={item.images}
        onImagePress={() => router.push(`/post/${item.id}`)}
      />

      <ActionButtons
        postId={item.id}
        username={item.user.username}
        likesInitial={item.likes}
        isLikedInitial={item.isLiked}
      />

      <PostCaption username={item.user.username} caption={item.caption} />

      <TagList tags={item.tags} />

      <CommentsLink totalComments={item.totalComments} postId={item.id} />

      <CommentList comments={item.comments} postId={item.id} />

      <PostTimestamp timestamp={item.timestamp} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
    borderBottomWidth: 0.5,
  },
});
