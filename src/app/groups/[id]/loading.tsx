import { GroupsSegmentSkeleton } from "@/shared/components/GroupsSegmentSkeleton";

/** グループ詳細へ遷移中（一覧・チャートから戻る含む） */
export default function GroupDetailLoading() {
  return <GroupsSegmentSkeleton />;
}
