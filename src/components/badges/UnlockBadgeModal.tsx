"use client";
import InteractiveBadgeCard from "./InteractiveBadgeCard";
import type { BadgeConfig } from "@/content/badgeConfig";
export default function UnlockBadgeModal({badge,actionPoints,onContinue}:{badge:BadgeConfig|null;actionPoints:number;onContinue:()=>void}){if(!badge)return null;return <div className="badge-modal-backdrop" role="dialog" aria-modal="true" aria-label="徽章已解鎖"><section className="badge-modal"><span>ACHIEVEMENT UNLOCKED</span><h2>徽章已解鎖！</h2><p>你已獲得「{badge.name}」</p><InteractiveBadgeCard badgeName={badge.name} badgeImageUrl={badge.imageUrl} badgeDescription={badge.description} unlocked levelNumber={badge.levelNumber} actionPoints={actionPoints} celebrate/><strong>行動點數 ＋{actionPoints}</strong><button onClick={onContinue}>繼續下一關 →</button></section></div>}
