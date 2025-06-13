import React from "react";
import Heading from "./Heading";
import Features from "./Features";
import Team from "./Team";
import Footer from "./Footer";

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
