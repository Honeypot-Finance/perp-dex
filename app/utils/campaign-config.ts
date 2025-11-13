export interface Campaign {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
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
    title: "Earn POT Points",
    description: "Participate in activities to earn points for the upcoming TGE airdrop allocation",
    startDate: "2024-10-01",
    endDate: "2024-12-25",
    status: "active",
    prize: "",
    participants: 0,
    tags: [],
    link: "https://points.honeypotfinance.xyz/loyalty",
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
