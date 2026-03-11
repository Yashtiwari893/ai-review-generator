import Chatbot from "@/components/Chatbot";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1>Smart Review AI</h1>
        <p>Turn your customers' feedback into professional Google local reviews instantly.</p>
      </div>
      <Chatbot />
      <footer className={styles.footer}>
        <p>© 2026 Loadmade AI Review Generator. Powered by Llama 3.</p>
      </footer>
    </main>
  );
}
