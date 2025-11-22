import SpaceBackground from "./components/SpaceBackground";
import OnboardingModal from "./components/OnboardingModal";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <SpaceBackground />
      <OnboardingModal />
    </main>
  );
}
