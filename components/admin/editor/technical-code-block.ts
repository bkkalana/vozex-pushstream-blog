import CodeBlock from "@tiptap/extension-code-block";
export const TechnicalCodeBlock=CodeBlock.extend({
  addAttributes(){return{...this.parent?.(),language:{default:null},filename:{default:null},lineNumbers:{default:false}}},
});
