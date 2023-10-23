import type { Ref } from "vue"
import type { InjectionKey} from "vue"


export type RuleValidState={isValid:boolean,errorMsg:string}
export type FormItemValidState={isValid:boolean,errorMsg:string[]}
export const FormItemSymbol=Symbol() as InjectionKey<{
    validState:FormItemValidState
    label?:string
    required?:boolean|string
}>
export const FormSymbol=Symbol() as InjectionKey<{
    labelAlign:'left'|'right'|'top',
    errorAlign:'right'|'bottom'
    valids:Ref<(()=> Promise<{
        isValid: boolean,
        errorMsg: string[]
    }>)[]>
    resetValids:Ref<(()=> void)[]>
}>

export type FormItemInjection={
    ruleModel:Record<string,any>
}