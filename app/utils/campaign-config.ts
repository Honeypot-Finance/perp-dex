export interface Campaign {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "active" | "upcoming" | "ended";
  prize: string;
  participants?: number;
  image?: string;
  link?: string;
  tags?: string[];
}

export const campaigns: Campaign[] = [
  {
    id: "1",
    title: "Season 2 Pot Point",
    description:
      "Participate in activities to earn points for the upcoming Season 2 airdrop allocation",
    startDate: "2026-01-01",
    status: "active",
    prize: "",
    participants: 0,
    tags: [],
    link: "https://points.honeypotfinance.xyz",
  },
];

export const getActiveCampaigns = () => {
  return campaigns.filter((campaign) => campaign.status === "active");
};

export const getUpcomingCampaigns = () => {
  return campaigns.filter((campaign) => campaign.status === "upcoming");
};

export const getAllCampaigns = () => {
  return campaigns;
};
