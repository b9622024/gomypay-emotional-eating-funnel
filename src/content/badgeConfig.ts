export type BadgeConfig = { id:string; name:string; imageUrl:string; modelUrl:string; description:string; lockedDescription:string; levelNumber:number };
const base="/game-assets/characters/badges/transparent";
export const badgeConfig:BadgeConfig[]=[
  {id:"character-creation",name:"角色創建徽章",imageUrl:`${base}/badge-character-creation.png`,modelUrl:"/game-assets/badges-3d/badge-character-creation.glb",description:"完成第 0 天角色創建後解鎖",lockedDescription:"完成第 0 天角色創建即可解鎖",levelNumber:0},
  {id:"time-detective",name:"時間偵探徽章",imageUrl:`${base}/badge-time-detective.png`,modelUrl:"/game-assets/badges-3d/badge-time-detective.glb",description:"完成第 1 關後解鎖",lockedDescription:"找出破功時間後解鎖",levelNumber:1},
  {id:"scene-detective",name:"場景偵探徽章",imageUrl:`${base}/badge-scene-detective.png`,modelUrl:"/game-assets/badges-3d/badge-scene-detective.glb",description:"完成第 2 關後解鎖",lockedDescription:"找出高風險場景後解鎖",levelNumber:2},
  {id:"body-mind",name:"身心連結徽章",imageUrl:`${base}/badge-body-mind.png`,modelUrl:"/game-assets/badges-3d/badge-body-mind.glb",description:"完成第 3 關後解鎖",lockedDescription:"完成身心訊號任務後解鎖",levelNumber:3},
  {id:"branch-route",name:"專屬支線徽章",imageUrl:`${base}/badge-branch-route.png`,modelUrl:"/game-assets/badges-3d/badge-branch-route.glb",description:"完成第 4 關後解鎖",lockedDescription:"選擇專屬支線後解鎖",levelNumber:4},
  {id:"nutrition-gap",name:"營養補洞徽章",imageUrl:`${base}/badge-nutrition-gap.png`,modelUrl:"/game-assets/badges-3d/badge-nutrition-gap.glb",description:"完成第 5 關後解鎖",lockedDescription:"完成營養缺口掃描後解鎖",levelNumber:5},
  {id:"dinner-stable",name:"晚餐穩定徽章",imageUrl:`${base}/badge-dinner-stable.png`,modelUrl:"/game-assets/badges-3d/badge-dinner-stable.glb",description:"完成第 6 關後解鎖",lockedDescription:"建立晚餐防線後解鎖",levelNumber:6},
  {id:"rescue-map",name:"止損地圖完成徽章",imageUrl:`${base}/badge-rescue-map.png`,modelUrl:"/game-assets/badges-3d/badge-rescue-map.glb",description:"完成第 7 關後解鎖",lockedDescription:"生成個人止損地圖後解鎖",levelNumber:7},
];
export function badgeForLevel(level:number){return badgeConfig.find(b=>b.levelNumber===level)}
