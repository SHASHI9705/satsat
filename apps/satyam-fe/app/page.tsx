"use client";

import React, { useEffect, useState } from "react";
import SatyamLandingPage from "../components/HeroSection";
import Footer from "../components/Footer";
import Nav from "./nav/page";
import JobNotification from "../components/JobNotificaton.tsx";

export default function Page() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("jobNoticeSeen");
    const user = localStorage.getItem("user");

    // Only show the job notification to signed-in users who haven't seen it yet
    if (!seen && user) {
      setShowNotice(true);
    }
  }, []);

  const acceptNotice = () => {
    localStorage.setItem("jobNoticeSeen", "true");
    setShowNotice(false);
  };

  return (
    <>
      {showNotice && <JobNotification onAccept={acceptNotice} />}
      <Nav />
      <SatyamLandingPage />
      <Footer />
    </>
  );
}