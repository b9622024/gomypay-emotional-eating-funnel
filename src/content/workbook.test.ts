import { describe,expect,it } from "vitest";
import { workbookDays,type WorkbookField } from "./workbook";
import { validDay } from "../lib/workbook";

function keys(fields:WorkbookField[]):string[]{return fields.flatMap(field=>field.type==="repeat"?[field.key,...keys(field.fields)]:[field.key])}
describe("interactive workbook schema",()=>{
  it("contains all seven days and core interactive field types",()=>{
    expect(workbookDays).toHaveLength(7);
    const fields=workbookDays.flatMap(day=>day.sections.flatMap(section=>section.fields));
    const types=new Set(fields.flatMap(field=>field.type==="repeat"?[field.type,...field.fields.map(child=>child.type)]:[field.type]));
    expect([...types]).toEqual(expect.arrayContaining(["checkbox","radio","slider","textarea","text","datetime","number","repeat"]));
  });
  it("includes required report inputs and rejects invalid day numbers",()=>{
    const allKeys=workbookDays.flatMap(day=>keys(day.sections.flatMap(section=>section.fields)));
    expect(allKeys).toEqual(expect.arrayContaining(["hungerScore","stressScore","fatigueScore","mainTrigger","drinkName","gapSummary","biggestDiscovery","nextStep"]));
    expect(validDay("1")).toBe(1);expect(validDay("7")).toBe(7);expect(validDay("8")).toBeNull();
  });
});
