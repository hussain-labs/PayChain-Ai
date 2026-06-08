"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import sal from "sal.js";
import HomeCourse from "../01-Main-Demo/Home-Sections/HomeCourse";
import NewsletterThree from "../Newsletters/Newsletter-Three";
import Card from "../Cards/Card";
import BlogGrid from "../Blogs/BlogGrid";
import Instagram from "../Instagram/Instagram";
import CategorySix from "../Category/CategorySix";
import Counter from "../Counters/Counter";
import TestimonialSeven from "../Testimonials/Testimonial-Seven";
import TestimonialFour from "../Testimonials/Testimonial-Four";
import Service from "../Services/Service";
import TeacherGallery from "../Become-a-Teacher/TeacherGallery";
import NewsletterTwo from "../Newsletters/Newsletter-Two";

import worldImg from "../../public/images/shape/world.png";

// Crypto Wallet Vector SVGs (36x36 size)
const BitcoinIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#F7931A" />
    <path d="M22.5 13.7c.3-1.8-.7-2.8-2.6-3.4l.6-2.3-1.4-.3-.5 2.3c-.4-.1-.8-.2-1.2-.3l.5-2.3-1.4-.3-.6 2.3c-.3-.1-.6-.2-.9-.2l.0-.0-2-.5-.4 1.6s1.1.3 1.1.3c.6.2.7.5.5.9l-.6 2.4c.0 0 .1.0.2.1l-.2-.1-.8 3.3c-.1.2-.3.5-.7.4 0 0-1.1-.3-1.1-.3l-.7 1.7 1.9.5c.4.1.7.2 1.1.3l-.6 2.4 1.4.3.6-2.4c.4.1.8.2 1.2.2l-.6 2.4 1.4.3.6-2.4c2.4.5 4.2.3 5-1.9.6-1.8.0-2.8-1.3-3.5 1-.2 1.7-.8 1.9-2.1zm-3.5 6.6c-.4 1.7-3.4.8-4.3.6l.8-3.1c.9.2 3.9.7 3.5 2.5zm.4-4.5c-.4 1.5-2.9.7-3.7.6l.7-2.9c.8.2 3.4.6 3 2.3z" fill="white" />
  </svg>
);

const EthereumIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#627EEA" />
    <path d="M16.5 4.5v9.1l7.3 3.3-7.3-12.4z" fill="#FFF" fillOpacity=".6" />
    <path d="M16.5 4.5L9.2 16.9l7.3-3.3V4.5z" fill="#FFF" />
    <path d="M16.5 21v6.5l7.3-10.2-7.3 3.7z" fill="#FFF" fillOpacity=".6" />
    <path d="M16.5 27.5V21l-7.3-3.7 7.3 10.2z" fill="#FFF" />
    <path d="M16.5 19.8l7.3-3.7-7.3-3.3v7z" fill="#FFF" fillOpacity=".2" />
    <path d="M16.5 12.8L9.2 16.1l7.3 3.7v-7z" fill="#FFF" fillOpacity=".6" />
  </svg>
);

const SolanaIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#14F195" />
    <path d="M23 9.4H9.7l2.2-3.8H25.2L23 9.4zm-4.4 6.7l-2.2 3.8H25.2l2.2-3.8H18.6zM9.7 26.4h13.3l2.2-3.8H11.9l-2.2 3.8z" fill="#9945FF" />
  </svg>
);

const MetaMaskIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#E27625" />
    <path d="M25.5 13.5l-2.5-5.5-3 2.5 5.5 3z" fill="#E17726" />
    <path d="M6.5 13.5l2.5-5.5 3 2.5-5.5 3z" fill="#E17726" />
    <path d="M22.5 18.5l-1.5 5.5-2.5-2.5 4-3z" fill="#E17726" />
    <path d="M9.5 18.5l1.5 5.5 2.5-2.5-4-3z" fill="#E17726" />
    <path d="M16 11.5l3.5 2.5-1 4.5-2.5-1.5-2.5 1.5-1-4.5 3.5-2.5z" fill="#F6851B" />
    <path d="M16 23.5l-3.5-2 1-1h5l1 1-3.5 2z" fill="#D7C1B1" />
  </svg>
);

const CoinbaseIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#0052FF" />
    <rect x="9" y="9" width="14" height="14" rx="3.5" fill="white" />
    <circle cx="16" cy="16" r="4.5" fill="#0052FF" />
  </svg>
);

const TrustIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#0500FF" />
    <path d="M16 7.5L23 10.5V16C23 20.8 19.8 23.8 16 25C12.2 23.8 9 20.8 9 16V10.5L16 7.5Z" fill="white" />
    <path d="M16 10L21 12V16.5C21 20 18.5 22.3 16 23.2C13.5 22.3 11 20 11 16.5V12L16 10Z" fill="#0500FF" />
  </svg>
);

const BinanceIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
    <path d="M16 7.5l-3.3 3.3L16 14.1l3.3-3.3L16 7.5zm-5.8 5.8L7 16.6l3.2 3.3 3.3-3.3-3.3-3.3zm11.6 0l-3.3 3.3 3.3 3.3L27 16.6l-5.2-3.3zM16 19.1l-3.3 3.3 3.3 3.3 3.3-3.3-3.3-3.3z" fill="white" />
    <path d="M16 11.2l-2.1 2.1L16 15.4l2.1-2.1-2.1-2.1z" fill="white" />
  </svg>
);

const LedgerIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#1C1D21" />
    <rect x="9" y="9" width="14" height="14" rx="2" stroke="white" strokeWidth="2" />
    <path d="M13 13h6m-6 3h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const UniswapIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#FF007A" />
    <path d="M11 11c3-2 6 0 7 2s1 4 3 5 3-1 4-3c0 4-2 7-6 7s-5-2-6-5-1-4-2-6zM22 10c0-2-2-4-2-4s1 2 1 4z" fill="white" />
  </svg>
);

const CardanoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#0033AD" />
    <circle cx="16" cy="10" r="1.5" fill="white" />
    <circle cx="16" cy="22" r="1.5" fill="white" />
    <circle cx="10" cy="16" r="1.5" fill="white" />
    <circle cx="22" cy="16" r="1.5" fill="white" />
    <circle cx="12" cy="12" r="1" fill="white" />
    <circle cx="20" cy="20" r="1" fill="white" />
    <circle cx="20" cy="12" r="1" fill="white" />
    <circle cx="12" cy="20" r="1" fill="white" />
    <circle cx="16" cy="16" r="2.5" fill="white" />
  </svg>
);

const XrpIcon = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#23292F" />
    <path d="M9 10l5 5-5 5h4l4-4 4 4h4l-5-5 5-5h-4l-4 4-4-4H9z" fill="white" />
  </svg>
);

const cryptoWallets = [
  { name: "Bitcoin", icon: <BitcoinIcon /> },
  { name: "Ethereum", icon: <EthereumIcon /> },
  { name: "Solana", icon: <SolanaIcon /> },
  { name: "MetaMask", icon: <MetaMaskIcon /> },
  { name: "Coinbase Wallet", icon: <CoinbaseIcon /> },
  { name: "Trust Wallet", icon: <TrustIcon /> },
  { name: "Binance Wallet", icon: <BinanceIcon /> },
  { name: "Ledger Wallet", icon: <LedgerIcon /> },
  { name: "Uniswap", icon: <UniswapIcon /> },
  { name: "Cardano", icon: <CardanoIcon /> },
  { name: "XRP", icon: <XrpIcon /> },
];

const ClassicLms = ({ blogdata }) => {
  useEffect(() => {
    sal({
      threshold: 0.01,
      once: true,
    });
  }, []);
  return (
    <>
      <div className="rbt-banner-area rbt-banner-1 variation-2 height-750">
        <div className="hero-bg-animation">
          <div className="language-world">
            <div className="world">
              <Image src={worldImg} width={441} height={442} alt="Earth Globe" />
            </div>
            <div className="flages">
              {cryptoWallets.map((wallet, index) => (
                <div
                  className="flag"
                  key={index}
                  data-tooltip={wallet.name}
                  tabIndex={0}
                >
                  {wallet.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-8">
              <div className="content">
                <div className="inner">
                  <div className="rbt-new-badge rbt-new-badge-one">
                    <span className="rbt-new-badge-icon">🏆</span> Next-Gen Transaction Security
                  </div>
                  <h1 className="title">
                    Decentralized
                    <span className="color-primary px-3">Transaction Fraud</span>
                    Detection Engine.
                  </h1>
                  <p className="description">
                    Secure, audit, and monitor blockchain smart contracts and wallet behaviors in
                    <strong> real-time with zero latency</strong>.
                  </p>
                  <div className="slider-btn">
                    <Link
                      className="rbt-btn btn-gradient hover-icon-reverse"
                      href="/login"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Join Now</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="content">
                <div className="banner-card pb--60 swiper rbt-dot-bottom-center banner-swiper-active">
                  <HomeCourse start={3} end={6} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rbt-categories-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row g-5 align-items-start mb--30">
            <div className="col-lg-6 col-md-6 col-12">
              <div className="section-title">
                <h4 className="title">Security Frameworks.</h4>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="read-more-btn text-start text-md-end">
                <Link
                  className="rbt-btn rbt-switch-btn bg-primary-opacity btn-sm"
                  href="#"
                >
                  <span data-text="View All Engines">View All Engines</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="row g-5">
            <CategorySix />
          </div>
        </div>
      </div>

      <div className="rbt-service-area bg-color-extra2 rbt-section-gap">
        <div className="container">
          <div className="row mb--60">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <span className="subtitle bg-primary-opacity">
                  DECENTRALIZED PROTECTION
                </span>
                <h2 className="title">Why Choose PayChain AI?</h2>
              </div>
            </div>
          </div>
          <Service head={false} />
        </div>
      </div>

      {/* <div className="rbt-newsletter-area bg-gradient-6 ptb--50">
        <NewsletterThree />
      </div> */}
      <div className="rbt-course-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row mb--55 g-5 align-items-end">
            <div className="col-lg-6 col-md-6 col-12">
              <div className="section-title text-start">
                <span className="subtitle bg-pink-opacity">
                  Risk Verification Tools
                </span>
                <h2 className="title">
                  Active Security <span className="color-primary">Modules</span>
                </h2>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="load-more-btn text-start text-md-end">
                <Link
                  className="rbt-btn rbt-switch-btn bg-primary-opacity"
                  href="/course-filter-one-toggle"
                >
                  <span data-text="View All Engines">View All Engines</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="row g-5">
            <Card
              col="col-lg-4 col-md-6 col-sm-12 col-12"
              mt=""
              start={0}
              end={6}
              isDesc={true}
              isUser={true}
            />
          </div>
        </div>
      </div>

      <div className="rbt-counterup-area bg-color-extra2 rbt-section-gapBottom default-callto-action-overlap">
        <div className="container">
          <Counter isDesc={false} />
        </div>
      </div>

      <div className="rbt-testimonial-area bg-color-white rbt-section-gap overflow-hidden">
        <div className="wrapper">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="section-title text-center mb--10">
                  <span className="subtitle bg-primary-opacity">
                    DECENTRALIZED PROTECTION
                  </span>
                  <h2 className="title">
                    Securing Web3 protocols and nodes. <br /> Read our security reviews!
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <TestimonialSeven />
      </div>

      <div className="thumb-wrapper bg-color-white rbt-section-gapBottom">
        <TestimonialFour />
      </div>

      <div className="thumb-wrapper bg-color-white rbt-section-gapBottom">
        <TeacherGallery />
      </div>

      <div className="rbt-rbt-blog-area rbt-section-gapTop bg-color-white">
        <div className="container">
          <div className="row mb--55 g-5 align-items-end">
            <div className="col-lg-6 col-md-6 col-12">
              <div className="section-title text-start">
                <span className="subtitle bg-pink-opacity">Threat Intelligence</span>
                <h2 className="title">
                  Read our latest <span className="color-primary">security reports</span>
                </h2>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="load-more-btn text-start text-md-end">
                <Link
                  className="rbt-btn rbt-switch-btn bg-primary-opacity"
                  href="/blog-list"
                >
                  <span data-text="View All Reports">View All Reports</span>
                </Link>
              </div>
            </div>
          </div>

          <BlogGrid
            isPagination={false}
            top={false}
            start={4}
            end={7}
            blogdata={blogdata}
          />
        </div>
      </div>
      {/* Instagram block commented out to match premium decentralized security focus */}

      <div className="rbt-newsletter-area newsletter-style-2 bg-color-primary rbt-section-gap">
        <NewsletterTwo />
      </div>
    </>
  );
};

export default ClassicLms;
