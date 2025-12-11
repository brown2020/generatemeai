"use client";

import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
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
  { Button: FacebookShareButton, Icon: FacebookIcon, label: "Facebook" },
  { Button: TwitterShareButton, Icon: TwitterIcon, label: "Twitter" },
  { Button: LinkedinShareButton, Icon: LinkedinIcon, label: "LinkedIn" },
  { Button: EmailShareButton, Icon: EmailIcon, label: "Email" },
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
