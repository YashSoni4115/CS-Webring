import webring from "../../../data/webring.json";

export type Site = {
  id: string;
  name: string;
  url: string;
  description?: string;
  owner?: string;
  added?: string;
};

export const sites = (webring as any).sites as Site[];