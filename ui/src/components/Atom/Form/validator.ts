import type {RuleValidState } from "./type";

export abstract class FormRule{
    constructor(public errorMsg?:string){}
    abstract valid(value:any):RuleValidState;
}

export class  Required extends FormRule{
    constructor(public errorMsg?:string){
        errorMsg=errorMsg||'内容不能为空';
        super(errorMsg);
    }
    valid(value:string|number|number[]|undefined|null):RuleValidState{
        if(value===undefined||value===null||value===''){
            return {
                isValid:false,
                errorMsg:this.errorMsg!!
            };
        }
        return {
            isValid:true,
            errorMsg:''
        };
    }
}