import {
  Bookmark,
  Compass,
  Home,
  MessageCircle,
  Users,
} from "@/components/ui/icons";

export const navigation = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/explore", label: "Projects", icon: Compass },
  { href: "/cofounders", label: "Builders", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/bookmarks", label: "Saved", icon: Bookmark },
] as const;
