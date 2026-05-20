import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"input">, "className"> & {
  icon: LucideIcon;
  /** input-field に追加するクラス（例: pl の上書きはしない） */
  inputClassName?: string;
};

/**
 * 認証フォーム用：左アイコンは装飾のみ（ラベル＋name が意味を持つ）
 */
export function AuthInputWithLeadingIcon({
  icon: Icon,
  inputClassName = "",
  ...props
}: Props) {
  return (
    <div className="relative isolate">
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
        strokeWidth={2}
        aria-hidden
      />
      <input
        className={`input-field relative z-0 pl-10 active:scale-100 ${inputClassName}`}
        {...props}
      />
    </div>
  );
}
