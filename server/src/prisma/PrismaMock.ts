import { PrismaClient, Prisma } from "@prisma/client";

import { MockTransactionClient } from "@/types/Test";
import { logger } from "@/utils/logger";

//TODO - 开发并行测试功能
//https://github.com/Quramy/jest-prisma/blob/main/packages/jest-prisma-core/src/delegate.ts
export class MockPrisma<T extends PrismaClient>{
    public originalClient: T;
    private transactionClient: MockTransactionClient<T>;
    public mockClient: MockTransactionClient<T>;//必须使用代理让DI成为可能，不然DI注入的时候transactionClient可能还没生成
    public finishTransaction: () => void=()=>void 0
    constructor(private readonly options: {
        maxWait?: number
        timeout?: number
        PrismaClientFactory?: () => T
    }) {
        this.originalClient = this.options.PrismaClientFactory?this.options.PrismaClientFactory():new PrismaClient() as T
        this.options.maxWait = this.options.maxWait ? this.options.maxWait : 100000
        this.options.timeout = this.options.timeout ? this.options.timeout : 100000
    }

    public async beginTransaction() {
        return new Promise<void>(resolve =>{
            this.originalClient
                .$transaction(
                    async tc => {
                        this.transactionClient = tc as MockTransactionClient<T>
                        resolve();
                        return new Promise(
                            (resolve, reject) => (this.finishTransaction = reject),
                        );
                    },
                    {
                        maxWait: this.options.maxWait,
                        timeout: this.options.timeout,
                    },
                )
                .catch((reason) => {
                    return true
                })
        });
    }
    public async init() {
        //must connect by userself because nestjs connect on module init ; disconnect on module destroy
        //await this.originalClient.$connect()
        this.mockClient = new Proxy<MockTransactionClient<T> >({} as never, {
            get: (target, name: string) => {
                if (!this.transactionClient){
                    logger.warn({msg:`transaction client not generate yet,access field ${name}`,tag:"Prisma Mock"})
                    return this.originalClient[name];
                }
                else if(this.transactionClient[name]===undefined){
                    logger.warn({msg:`transaction client missing filed ${name}`,tag:"Prisma Mock"})
                    return this.originalClient[name];
                }
                else return this.transactionClient[name];
            },
        })
        return this.mockClient
    }
    public async changeStatus(status:'START'|'DONE'){
        switch(status){
            case 'START':this.beginTransaction();break;
            case 'DONE':this.finishTransaction();break;
        }
    }

}