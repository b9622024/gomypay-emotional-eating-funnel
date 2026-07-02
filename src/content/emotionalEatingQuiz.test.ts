import { describe,expect,it } from "vitest";
import { calculateQuizResult,emotionalEatingQuestions,emotionalEatingTypes } from "./emotionalEatingQuiz";

describe("emotional eating quiz",()=>{
  it("contains six types with four questions each",()=>{
    expect(Object.keys(emotionalEatingTypes)).toHaveLength(6);
    expect(emotionalEatingQuestions).toHaveLength(24);
    for(const type of Object.keys(emotionalEatingTypes))expect(emotionalEatingQuestions.filter(question=>question.type===type)).toHaveLength(4);
  });
  it("calculates a primary and secondary type",()=>{
    const answers=Object.fromEntries(emotionalEatingQuestions.map(question=>[String(question.id),question.type==="stress_release"?3:question.type==="fatigue_loss_control"?2:0]));
    const result=calculateQuizResult(answers);
    expect(result.primaryTypes).toEqual(["stress_release"]);
    expect(result.secondaryTypes).toEqual(["fatigue_loss_control"]);
    expect(result.scores.stress_release).toBe(12);
  });
  it("keeps all tied highest types as a mixed tendency",()=>{
    const answers=Object.fromEntries(emotionalEatingQuestions.map(question=>[String(question.id),question.type==="stress_release"||question.type==="compensation"?3:0]));
    const result=calculateQuizResult(answers);
    expect(result.primaryTypes).toEqual(["stress_release","compensation"]);
    expect(result.secondaryTypes).toEqual(["fatigue_loss_control","boredom_habit","sugary_drink_dependency","nutrition_gap"]);
    expect(result.isMixed).toBe(true);
  });
});
