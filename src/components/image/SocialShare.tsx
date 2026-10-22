"use client";

import {
  FacebookShareButton,
  XShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookLegacyIcon,
  XLegacyIcon,
  LinkedinLegacyIcon,
  EmailLegacyIcon,
} from "react-share";
import { ComponentType, ReactNode } from "react";

interface SocialShareProps {
  url: string;
}

interface ShareButtonConfig {
  Button: ComponentType<{ url: string; children: ReactNode }>;
  Icon: ComponentType<{ size: number; round: boolean; className?: string }>;
  label: string;
}

const SHARE_BUTTONS: ShareButtonConfig[] = [
  { Button: FacebookShareButton, Icon: FacebookLegacyIcon, label: "Facebook" },
  { Button: XShareButton, Icon: XLegacyIcon, label: "X" },
  { Button: LinkedinShareButton, Icon: LinkedinLegacyIcon, label: "LinkedIn" },
  { Button: EmailShareButton, Icon: EmailLegacyIcon, label: "Email" },
];

const ICON_SIZE = 40;
const ICON_CLASS = "hover:opacity-80 transition-opacity";

/**
 * Social media sharing buttons.
 */
export const SocialShare = ({ url }: SocialShareProps) => {
  return (
    <div className="flex gap-3 justify-center py-4">
      {SHARE_BUTTONS.map(({ Button, Icon, label }) => (
        <Button key={label} url={url}>
          <Icon size={ICON_SIZE} round className={ICON_CLASS} />
        </Button>
      ))}
    </div>
  );
};
