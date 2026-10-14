import type { Metadata } from "next";

import HomeContent from "./home-content";
import "./styles/home.css";

export const metadata: Metadata = {
  title: "Lantern — Understand a letter. Know what to do next.",
  description:
    "Understand a confusing letter in your language, or turn school papers into a clear first-day plan.",
};

export default function HomePage() {
  return <HomeContent />;
}
