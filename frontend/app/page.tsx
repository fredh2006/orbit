"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SpaceBackground from "./components/SpaceBackground";
import OnboardingModal from "./components/OnboardingModal";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has any systems
    const systemsData = localStorage.getItem("orbit_systems");
    if (systemsData) {
      const systems = JSON.parse(systemsData);
      if (systems.length > 0) {
        // Redirect to dashboard if systems exist
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleOnboardingComplete = () => {
    // Redirect to network visualization after completing onboarding
    router.push("/network");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <SpaceBackground />
      <OnboardingModal mode="onboarding" onComplete={handleOnboardingComplete} />
    </main>
  );
}
