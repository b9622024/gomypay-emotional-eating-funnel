"use client";
import type {BadgeConfig} from "@/content/badgeConfig";
import Real3DBadgeViewer from "./Real3DBadgeViewer";
export default function Badge3DModal({badge,onClose}:{badge:BadgeConfig|null;onClose:()=>void}){if(!badge)return null;return <div className="badge3d-backdrop" role="dialog" aria-modal="true" aria-label={`${badge.name} 3D 展示`}><section className="badge3d-modal"><button className="badge3d-close" onClick={onClose}>×</button><span>REAL 3D BADGE</span><h2>{badge.name}</h2><Real3DBadgeViewer modelUrl={badge.modelUrl} imageUrl={badge.imageUrl} badgeName={badge.name}/><p>{badge.description}</p></section></div>}
