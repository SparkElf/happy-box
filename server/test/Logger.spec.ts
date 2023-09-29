import { BaseLogger, PrismaLogger } from "@/utils/logger";
import { PrismaClient } from "@prisma/client";


describe('test logger', async () => {
    const logger = new BaseLogger()
    it('base logger', async () => {

        logger.info({msg:'This is info',tag:'Spark Elf Test'})
        logger.warn({msg:'This is warning',tag:'Spark Elf Test'})
        logger.error({msg:'This is error',tag:'Spark Elf Test'})
        logger.debug({msg:'This is debug',tag:'Spark Elf Test'})
        logger.success({msg:'This is success',tag:'Spark Elf Test'})
        logger.fail({msg:'This is fail',tag:'Spark Elf Test'})

        logger.multiLineInfo({title:"Logger Test Start...",tag:"Spark Elf Test",msg:[
            "Line One","Line Two","Line Three"
        ]})
        logger.multiLineWarn({title:"Logger Test Start...",tag:"Spark Elf Test",msg:[
            "Line One","Line Two","Line Three"
        ]})
        logger.multiLineError({title:"Logger Test Start...",tag:"Spark Elf Test",msg:[
            "Line One","Line Two","Line Three"
        ]})
        logger.multiLineDebug({title:"Logger Test Start...",tag:"Spark Elf Test",msg:[
            "Line One","Line Two","Line Three"
        ]})
        logger.multiLineSuccess({title:"Logger Test Start...",tag:"Spark Elf Test",msg:[
            "Line One","Line Two","Line Three"
        ]})
        logger.multiLineFail({title:"Logger Test Start...",tag:"Spark Elf Test",msg:[
            "Line One","Line Two","Line Three"
        ]})
    })
    it('prisma logger', async () => {
        let sql = 'SELECT name,create_time FROM user_table WHERE creatime=curdate()+curdate()-curdate()*curdate()/curdate()'
        let params="[21,s2]"
        const plogger = new PrismaLogger(logger)
        console.log(plogger.sql(sql))
        console.log(plogger.sqlParams(params))

        const client=new PrismaClient({
            log:[{
                level:'query',
                emit:'event'
            },{
                level:'query',
                emit:'stdout'
            },'info','error','warn'],
            errorFormat:'pretty'
        })
        client.$on('query',(e)=>{
            plogger.query(e)
        })
        await client.user.findUnique({
            where:{
                id:1
            }
        })
    })
    it('regex',async()=>{

    })
    it('temp', async () => {

        const client=new PrismaClient({
            log:['query','info','error','warn'],
            errorFormat:'pretty',

        })
        await client.user.findUnique({
            where:{
                id:1
            }
        })
    })
})