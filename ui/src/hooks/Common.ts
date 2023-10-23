import type {Fn}from '@/hooks/Base'

//多次触发只有最后一次生效，可能长时间不执行
export function debounce<T>(fn:Fn<T> ,ms:number=100,init:ReturnType<Fn<T>>):(typeof fn){
    let lastTime=null
    let lastValue=init
    return function(){

        const curTime=new Date().getTime()
        if(init===undefined&&lastTime===null)lastTime=curTime
        if(curTime-lastTime>ms){
            lastTime=curTime
            return fn.apply(this, arguments)
        }else lastTime=curTime
        return lastValue
    } as Fn<T>

}
//n秒只执行一次 https://blog.csdn.net/dksks130/article/details/128198018?spm=1001.2101.3001.6650.5&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-5-128198018-blog-128460991.235%5Ev38%5Epc_relevant_anti_vip&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-5-128198018-blog-128460991.235%5Ev38%5Epc_relevant_anti_vip&ydreferer=aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3NvbmcxNzYzMTUzODQ5MC9hcnRpY2xlL2RldGFpbHMvMTI4NDYwOTkx
//https://zhuanlan.zhihu.com/p/87591677
export function throttle<T> (fn:Fn<T>,ms:number=100,init:ReturnType<Fn<T>>){
    let timer:ReturnType<typeof setTimeout>|null=null
    let lastValue:T=init

    return function(){
        if(timer!==null){
            return new Promise<T>((resolve,reject)=>{
                resolve(lastValue)
            })
        }
        else{
            return new Promise<T>((resolve,reject)=>{
                timer=setTimeout(()=>{
                    resolve(lastValue=fn.apply(this,arguments))
                    timer=null
                },ms)
            })
        }
    }
}