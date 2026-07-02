import { mindfulNutritionContent as content } from "@/content/mindfulNutritionTracker";
export default function NutritionFormulaCard(){return <section className="nutrition-formula"><span>外食也能穩定</span><h2>{content.formula.title}</h2><strong>{content.formula.formula}</strong><div>{content.formula.tips.map(tip=><p key={tip}>✓ {tip}</p>)}</div></section>}
