import webring from "../../../data/webring.json";
import type { WebringSite } from "./types";

export const sites = (webring as { sites: WebringSite[] }).sites;
