"use client";
import { badgeConfig } from "@/content/badgeConfig";
import InteractiveBadgeCard from "./InteractiveBadgeCard";

export default function BadgeCollection({earnedBadges,entries=[],characterCreated=false,compact=false}:{earnedBadges:string[];entries?:Array<{earnedBadge:string;completedAt?:string|Date|null;actionPointsEarned?:number}>;characterCreated?:boolean;compact?:boolean}){
  return <section className={`badge-collection ${compact?"compact":""}`}><header><span>ACHIEVEMENT COLLECTION</span><h2>我的成就徽章</h2><p>已解鎖徽章可以用滑鼠或手指輕輕拖曳，查看 2.5D 收藏效果。</p></header><div className="badge-grid">{badgeConfig.map(badge=>{const entry=entries.find(x=>x.earnedBadge===badge.name),unlocked=badge.levelNumber===0?characterCreated:earnedBadges.includes(badge.name);return <InteractiveBadgeCard key={badge.id} badgeName={badge.name} badgeImageUrl={badge.imageUrl} badgeDescription={badge.description} lockedDescription={badge.lockedDescription} unlocked={unlocked} levelNumber={badge.levelNumber} earnedAt={badge.levelNumber===0?null:entry?.completedAt} actionPoints={badge.levelNumber===0?0:entry?.actionPointsEarned}/>})}</div></section>
}
