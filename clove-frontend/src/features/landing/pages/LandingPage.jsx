import React from "react";
import Heading from "features/landing/components/Heading";
import Features from "features/landing/components/Features";
import Team from "features/landing/components/Team";
import Footer from "features/landing/components/Footer";

export default function LandingPage() {
  return (
    <div className="LandingPage">
      <Heading />
      <Features />
      <Team />
      <Footer />
    </div>
  );
}
