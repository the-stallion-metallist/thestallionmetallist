import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="login">
      <div className="lg-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.png" alt="" />
        <h2>Every can, bin and <em>rupee</em> in one place.</h2>
        <p>The team panel for Stallion Metallist&apos;s can and plastic collection in Dehradun.</p>
        <div className="ring" />
      </div>
      <div className="lg-form"><LoginForm /></div>
    </div>
  );
}
