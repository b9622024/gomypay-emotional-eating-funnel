"use client";
import type {BadgeConfig} from "@/content/badgeConfig";
import Real3DBadgeViewer from "./Real3DBadgeViewer";
export default function UnlockBadgeModal({badge,actionPoints,onContinue}:{badge:BadgeConfig|null;actionPoints:number;onContinue:()=>void}){if(!badge)return null;return <div className="badge-modal-backdrop" role="dialog" aria-modal="true" aria-label="徽章已解鎖"><section className="badge-modal badge-modal-3d"><span>ACHIEVEMENT UNLOCKED</span><h2>徽章已解鎖！</h2><p>你已獲得「{badge.name}」</p><Real3DBadgeViewer modelUrl={badge.modelUrl} imageUrl={badge.imageUrl} badgeName={badge.name}/><strong>行動點數 ＋{actionPoints}</strong><button onClick={onContinue}>繼續下一關 →</button></section></div>}
