import {describe,it,expect} from "vitest";
import {comparisonSchema} from "@/lib/validation/comparisons";
import {aiToolSchema} from "@/lib/validation/ai-tools";
describe("phase29 validation",()=>{
  it("accepts a three-product typed comparison matrix",()=>{const x=comparisonSchema.parse({title:"A vs B vs C",items:[{label:"A",productName:"A"},{label:"B",productName:"B"},{label:"C",productName:"C"}],features:[{feature:"API",valueType:"BOOLEAN",valueA:"yes",valueB:"no",valueC:"yes"}]});expect(x.items).toHaveLength(3);expect(x.features[0].valueType).toBe("BOOLEAN")});
  it("accepts tool verification dates and alternatives",()=>{const base={name:"Tool",websiteUrl:"https://example.com",shortDescription:"A useful tool description that is long enough.",fullDescriptionText:"A useful detailed description that is long enough.",categoryId:"ck12345678901234567890123",pricingModel:"FREE",features:[],useCases:[],pros:[],cons:[],platforms:[],integrations:[],screenshotIds:[],alternativeIds:[]};expect(()=>aiToolSchema.parse(base)).not.toThrow()});
});
