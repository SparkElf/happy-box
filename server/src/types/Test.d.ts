import { PrismaClient } from "@prisma/client"

export type MockTransactionClient<T> =Omit<T, "$transaction" | "$on" | "$connect" | "$disconnect" | "$use" | "$extends">