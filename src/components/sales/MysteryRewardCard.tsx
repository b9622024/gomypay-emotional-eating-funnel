import {mysteryRewardConfig as reward} from "@/content/mysteryRewardConfig";
import SalesAssetImage from "./SalesAssetImage";

export default function MysteryRewardCard({status="locked"}:{status?:"locked"|"unlocked"}){
  return <article className={`mystery-reward ${status}`}><div className="mystery-reward-visual"><SalesAssetImage src={reward.imageUrl} alt={reward.title} label="神秘禮物" fallbackVisual="🎁"/><span aria-hidden="true">{status==="locked"?"🔒":"✦"}</span></div><div><small>{status==="locked"?"FINAL REWARD · LOCKED":"FINAL REWARD · UNLOCKED"}</small><h3>{reward.title}</h3><p>{status==="locked"?reward.lockedDescription:reward.unlockedDescription}</p></div></article>
}
