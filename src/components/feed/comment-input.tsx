import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";

import { Colors } from "@/constants/theme";
import { FeedComment } from "@/data/mock-feed";
import { buildMentionSuggestions } from "@/utils/mention-utils";
import { IconSymbol } from "../ui/icon-symbol";

function MentionSuggestions({
  suggestions,
  colors,
  onSelect
}: {
  suggestions: { username: string; relevance: number }[];
  colors: typeof Colors.light;
  onSelect: (username: string) => void;
}) {
  // Run expensive work synchronously for each chip during this
  // component's render — this blocks the JS thread.
  const chips = suggestions.slice(0, 8).map(item => {
    const displayName = item.username;
    return { ...item, displayName };
  });

  return (
    <View
      style={{
        borderTopWidth: 0.5,
        borderTopColor: colors.icon + "30",
        backgroundColor: colors.background,
        paddingVertical: 8,
        paddingHorizontal: 12
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {chips.map(item => (
          <TouchableOpacity
            key={item.username}
            onPress={() => onSelect(item.username)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: colors.icon + "15",
              borderRadius: 16,
              marginRight: 8
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.text
              }}
            >
              @{item.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

interface ReplyBannerProps {
  colors: typeof Colors.light;
  replyInfo: ReplyInfo;
  cancelReply: () => void;
}

const ReplyBanner = ({ colors, replyInfo, cancelReply }: ReplyBannerProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.icon + "15",
        borderTopWidth: 0.5,
        borderTopColor: colors.icon + "30",
      }}
    >
      <Text style={{ fontSize: 13, color: colors.icon }}>
        Replying to{" "}
        <Text style={{ color: colors.text, fontWeight: "600" }}>
          @{replyInfo.username}
        </Text>
      </Text>
      <TouchableOpacity onPress={cancelReply}>
        <IconSymbol name="xmark" size={18} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );
}

interface CommentInputProps {
  onSubmit: (text: string, replyInfo?: ReplyInfo) => void;
  colors: typeof Colors.light;
  comments: FeedComment[];
  bottomInset: number;
}

interface ReplyInfo {
  commentId: string;
  username: string;
}

interface CommentInputHandle {
  focus: () => void;
  setText: (text: string) => void;
  setReplyInfo: (replyInfo: ReplyInfo) => void;
  clear: () => void;
}

/**
 * A comment input with a horizontal mention-suggestion bar that appears
 * when the user is typing an @mention.
 */
const CommentInput = forwardRef<CommentInputHandle, CommentInputProps>(function CommentInput(
  { onSubmit, colors, comments, bottomInset },
  ref
) {
  const [value, setValue] = useState('');
  const [replyInfo, setReplyInfo] = useState<ReplyInfo | null>(null);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setText: setValue,
    setReplyInfo: setReplyInfo,
    clear: () => {
      setValue('');
      setReplyInfo(null);
    }
  }), []);

  const isTypingMention = value.match(/@(\w*)$/) !== null;

  const mentionSuggestions = useMemo(() => buildMentionSuggestions(comments, value), [comments, value]);

  const showSuggestions = isTypingMention && mentionSuggestions.length > 0;

  const handleSelectMention = useCallback(
    (username: string) => {
      setValue(prev => {
        const atIndex = prev.lastIndexOf('@');
        if (atIndex === -1) return `${prev}@${username} `;
        return `${prev.slice(0, atIndex)}@${username} `;
      });
    },
    []
  );

  const cancelReply = () => {
    setReplyInfo(null);
    setValue('');
  };

  const showTopBorder = replyInfo === null;

  return (
    <View>
      {replyInfo && <ReplyBanner colors={colors} replyInfo={replyInfo} cancelReply={cancelReply} />}
      {/* Mention suggestions bar — each chip is artificially heavy */}
      {showSuggestions && (
        <MentionSuggestions suggestions={mentionSuggestions} colors={colors} onSelect={handleSelectMention} />
      )}

      {/* Input row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderTopWidth: showTopBorder ? 0.5 : 0,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          paddingBottom: bottomInset + 10
        }}
      >
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=68" }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
        />

        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            marginHorizontal: 12,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: colors.icon + "15",
            borderRadius: 20,
            color: colors.text,
            fontSize: 14
          }}
          placeholder={
            replyInfo
              ? `Reply to @${replyInfo.username}`
              : "Add a comment..."
          }
          placeholderTextColor={colors.icon}
          value={value}
          onChangeText={setValue}
          multiline
          maxLength={500}
        />

        <TouchableOpacity onPress={() => onSubmit(value, replyInfo ?? undefined)} disabled={!value.trim()}>
          <Text
            style={{
              color: value.trim() ? "#271c2d" : colors.icon,
              fontWeight: "600",
              fontSize: 14
            }}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export { CommentInput, CommentInputHandle };
