import type { Metadata } from "next";

import HomeContent from "./home-content";
import "./styles/home.css";

export const metadata: Metadata = {
  title: "Lantern — A clear first day of school",
  description:
    "First Day helps newcomer families review school letters, resolve conflicting instructions, and carry a source-linked enrollment plan.",
};

export default function HomePage() {
  return <HomeContent />;
}
