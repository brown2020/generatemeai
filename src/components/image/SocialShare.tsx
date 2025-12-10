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

interface SocialShareProps {
  url: string;
}

/**
 * Social media sharing buttons.
 */
export const SocialShare = ({ url }: SocialShareProps) => {
  return (
    <div className="flex gap-3 justify-center py-4">
      <FacebookShareButton url={url}>
        <FacebookIcon
          size={40}
          round
          className="hover:opacity-80 transition-opacity"
        />
      </FacebookShareButton>
      <TwitterShareButton url={url}>
        <TwitterIcon
          size={40}
          round
          className="hover:opacity-80 transition-opacity"
        />
      </TwitterShareButton>
      <LinkedinShareButton url={url}>
        <LinkedinIcon
          size={40}
          round
          className="hover:opacity-80 transition-opacity"
        />
      </LinkedinShareButton>
      <EmailShareButton url={url}>
        <EmailIcon
          size={40}
          round
          className="hover:opacity-80 transition-opacity"
        />
      </EmailShareButton>
    </div>
  );
};
