import { z } from "zod";
export const MAIN = "emotional_eating_reset_7d";
export const BUMPS = ["ai_energy_assessment","sugary_drink_swap_pro","anti_binge_meal_plan_7d"] as const;
export const OTO = "coaching_deposit_3d";
const normalize = (s:string) => s.normalize("NFKC").trim();
export const orderSchema = z.object({
  name:z.string().transform(normalize).refine(v => /^[\p{Script=Han}A-Za-z\s·]{2,50}$/u.test(v), "姓名不可含數字或特殊符號"),
  email:z.string().transform(normalize).pipe(z.string().email()).refine(v => /^[\x00-\x7F]+$/.test(v), "Email 不可含全形字元"),
  phone:z.string().transform(v => normalize(v).replace(/\D/g, "")).refine(v => /^\d{8,15}$/.test(v), "手機號碼格式不正確"),
  lineId:z.string().transform(normalize).optional(),
  productCodes:z.array(z.string()).min(1).max(4)
});
