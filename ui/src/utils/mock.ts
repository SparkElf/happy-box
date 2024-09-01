export function createRandomInt(min:number,max:number){
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export function createIntSequence(min:number,max:number,step:number=1){
    let arr = [];
    for(let i=min;i<=max;i+=step){
        arr.push(i);
    }
    return arr;
}