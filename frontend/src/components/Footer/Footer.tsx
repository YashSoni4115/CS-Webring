import styles from "./Footer.module.css";

export default function Footer({ joinUrl }: { joinUrl: string }) {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} CS Webring</span>
      <a href={joinUrl} target="_blank" rel="noreferrer">Join the ring</a>
    </footer>
  );
}
