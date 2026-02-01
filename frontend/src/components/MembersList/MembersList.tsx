import { useMemo, useState } from "react";
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
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = !query
      ? sites
      : sites.filter((s) => {
          const dom = domainFromUrl(s.url).toLowerCase();
          const name = (s.name || "").toLowerCase();
          const owner = (s.owner || "").toLowerCase();
          const added = (s.added || "").toLowerCase();
          return dom.includes(query) || name.includes(query) || owner.includes(query) || added.includes(query);
        });

    return filtered
      .map((s) => ({ ...s, domain: domainFromUrl(s.url) }))
      .sort((a, b) => a.domain.localeCompare(b.domain));
  }, [q, sites]);

  return (
    <section className={styles.wrap} aria-label="Members">
      <div className={styles.searchRow}>
        <span className={styles.icon} aria-hidden="true">
          ⌕
        </span>
        <input
          className={styles.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search by site/year"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className={styles.rule} />

      <div className={styles.grid}>
        {rows.map((s) => (
          <a key={s.id} className={styles.item} href={s.url} target="_blank" rel="noreferrer" title={s.url}>
            {s.domain}
          </a>
        ))}
      </div>
    </section>
  );
}