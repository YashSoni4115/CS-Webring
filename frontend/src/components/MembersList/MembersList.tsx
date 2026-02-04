import { useMemo, useState, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import styles from "./MembersList.module.css";

export type Site = {
  id: string;
  name: string;
  url: string;
  description?: string;
  owner?: string;
  added?: string;
};

function domainFromUrl(url: string) {
  try {
    const u = new URL(url);
    return u.host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

export default function MembersList({ sites }: { sites: Site[] }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(sites, {
        keys: ["name", "url", "owner", "description"],
        threshold: 0.35,
      }),
    [sites]
  );

  const results = useMemo(() => {
    if (!query.trim()) return sites;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, sites]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.searchRow}>
        <span className={`${styles.icon} ${focused ? styles.iconFocused : ""}`}>🔍</span>
        <input
          ref={inputRef}
          className={styles.search}
          type="search"
          placeholder="search by site/year"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Search members"
        />
      </div>
      <div className={styles.rule} />
      <div className={styles.grid}>
        {results.map((site) => (
          <a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.item}
          >
            {domainFromUrl(site.url)}
          </a>
        ))}
      </div>
    </div>
  );
}
