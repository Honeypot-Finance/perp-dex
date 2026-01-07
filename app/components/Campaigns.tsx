import { useMemo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@orderly.network/ui";
import {
  campaigns,
  getActiveCampaigns,
  getUpcomingCampaigns,
} from "@/utils/campaign-config";
import "@/styles/Campaigns.css";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "active" | "upcoming" | "ended";
  prize: string;
  participants?: number;
  tags?: string[];
  link?: string;
}

const CampaignCard = ({
  title,
  description,
  startDate,
  endDate,
  status,
  link,
}: CampaignCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusStyles = () => {
    switch (status) {
      case "active":
        return {
          badge: {
            backgroundColor: 'rgba(0, 181, 114, 0.15)',
            color: 'rgb(0, 181, 114)',
            border: '1px solid rgba(0, 181, 114, 0.3)',
          }
        };
      case "upcoming":
        return {
          badge: {
            backgroundColor: 'rgba(255, 176, 25, 0.15)',
            color: 'rgb(255, 176, 25)',
            border: '1px solid rgba(255, 176, 25, 0.3)',
          }
        };
      case "ended":
        return {
          badge: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.36)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }
        };
      default:
        return {
          badge: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.54)',
            border: 'none',
          }
        };
    }
  };

  const statusStyles = getStatusStyles();

  const CardContent = () => (
    <div
      className={cn(
        "oui-relative oui-rounded-2xl oui-p-5 oui-border oui-border-line-12",
        "oui-h-full oui-flex oui-flex-col oui-overflow-hidden campaign-card",
        link && "oui-cursor-pointer"
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
        transition: 'all 0.3s ease-out',
      }}
    >
      {/* Gradient overlay */}
      <div
        className="campaign-card-overlay oui-absolute oui-inset-0 oui-rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 120, 25, 0.08) 0%, transparent 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div className="oui-relative oui-z-10 oui-flex oui-flex-col oui-h-full">
        {/* Header with status badge */}
        <div className="oui-flex oui-items-start oui-justify-between oui-gap-3 oui-mb-3">
          <h3 className="oui-text-base oui-font-bold oui-text-base-contrast-98 oui-leading-tight oui-flex-1">
            {title}
          </h3>
          <span
            className="oui-px-4 oui-py-1 oui-rounded-full oui-text-2xs oui-font-semibold oui-uppercase oui-tracking-wide oui-flex-shrink-0"
            style={statusStyles.badge}
          >
            {status}
          </span>
        </div>

        {/* Description */}
        <p className="oui-text-sm oui-text-base-contrast-54 oui-leading-relaxed oui-line-clamp-2">
          {description}
        </p>

        {/* Duration */}
        <div className="oui-mt-4 oui-pt-4 oui-border-t oui-border-line-12">
          <div className="oui-flex oui-items-center oui-justify-between">
            <span className="oui-text-xs oui-text-base-contrast-36">
              Duration
            </span>
            <span className="oui-text-xs oui-font-semibold oui-text-base-contrast-80">
              {endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : `From ${formatDate(startDate)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (link) {
    // Check if it's an external link
    const isExternal = link.startsWith('http://') || link.startsWith('https://');

    if (isExternal) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="oui-block oui-h-full"
        >
          <CardContent />
        </a>
      );
    }

    return (
      <Link
        to={link}
        className="oui-block oui-h-full"
      >
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export const Campaigns = () => {
  const activeCampaigns = useMemo(() => getActiveCampaigns(), []);
  const upcomingCampaigns = useMemo(() => getUpcomingCampaigns(), []);

  const displayCampaigns = useMemo(() => {
    if (activeCampaigns.length > 0) {
      return activeCampaigns;
    }
    return upcomingCampaigns.slice(0, 3);
  }, [activeCampaigns, upcomingCampaigns]);

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="oui-mb-10" style={{ maxWidth: '950px', width: '100%' }}>
      {/* Section Header */}
      <div className="oui-mb-6">
        <div className="oui-flex oui-items-center oui-gap-3 oui-mb-2">
          <div className="oui-w-1 oui-h-8 oui-bg-gradient-to-b oui-from-primary oui-to-primary/50 oui-rounded-full" />
          <h2 className="oui-text-3xl oui-font-bold oui-text-base-contrast-98">
            Campaigns
          </h2>
        </div>
        <p className="oui-text-base oui-text-base-contrast-54 oui-ml-7">
          Join our active campaigns and compete for amazing prizes
        </p>
      </div>

      {/* Campaign Cards Grid */}
      <div className="oui-grid oui-grid-cols-1 sm:oui-grid-cols-2 lg:oui-grid-cols-3 xl:oui-grid-cols-4 oui-gap-4">
        {displayCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            {...campaign}
          />
        ))}
      </div>
    </div>
  );
};
