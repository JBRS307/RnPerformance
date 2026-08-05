import { View, StyleSheet } from "react-native";

import { FeedComment } from "@/data/mock-feed";

import { CommentPreview } from "./comment-preview";
import { useMappingHelper } from "@shopify/flash-list";

export const CommentList = ({
  comments,
  postId,
}: {
  comments: FeedComment[];
  postId: string;
}) => {
  const { getMappingKey } = useMappingHelper();
  if (comments.length === 0) return null;

  return (
    <View style={styles.container}>
      {comments.map((comment, index) => (
        <CommentPreview key={getMappingKey(comment.id, index)} comment={comment} postId={postId} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
});
