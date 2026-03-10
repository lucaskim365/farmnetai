import React from "react";
import {
  Search,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Play,
  PenTool,
  Gift,
  BookOpen,
  Edit2,
  Wrench,
  LayoutGrid,
  Bug,
  CloudSun,
  TrendingUp,
  ClipboardList,
  Calculator,
  FlaskConical,
  Building2
} from "lucide-react";

export function getIconComponent(type: string, colorClass: string, size?: number) {
  const iconProps = { className: colorClass, size };

  switch (type) {
    case "Search": return <Search {...iconProps} />;
    case "Image": return <ImageIcon {...iconProps} />;
    case "Sparkles": return <Sparkles {...iconProps} />;
    case "FileText": return <FileText {...iconProps} />;
    case "Play": return <Play {...iconProps} />;
    case "PenTool": return <PenTool {...iconProps} />;
    case "Gift": return <Gift {...iconProps} />;
    case "BookOpen": return <BookOpen {...iconProps} />;
    case "Edit2": return <Edit2 {...iconProps} />;
    case "Wrench": return <Wrench {...iconProps} />;
    case "Bug": return <Bug {...iconProps} />;
    case "CloudSun": return <CloudSun {...iconProps} />;
    case "TrendingUp": return <TrendingUp {...iconProps} />;
    case "ClipboardList": return <ClipboardList {...iconProps} />;
    case "Calculator": return <Calculator {...iconProps} />;
    case "FlaskConical": return <FlaskConical {...iconProps} />;
    case "Building2": return <Building2 {...iconProps} />;
    default: return <LayoutGrid {...iconProps} />;
  }
}
