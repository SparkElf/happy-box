import { ColorFunction } from '@/types/Logger'
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import chalk from 'chalk'
import { NextFunction } from 'express'
import { json } from 'stream/consumers'
// import { createColorize } from 'colorize-template'
// let colorize = createColorize(pico)

export const SHAPE_RIGHT = '→'
export const SHAPE_DOWN = '↓'
export const SHAPE_UP = '↑'
export const SHAPE_DOWN_RIGHT = '↳'
export const SHAPE_POINTER = '❯'
export const SHAPE_DOT = '·'
export const SHAPE_CHECK = '✓'
export const SHAPE_CROSS = '×'
export const SHAPE_LONG_DASH = '⎯'
export const SHAPE_RIGHT_TRI = '▶'

export const { red, bgRed, yellow, bgYellow, green, bgGreen, blue, bgBlue, magenta, bgMagenta, bold } = chalk
export const orange = chalk.hex('#F07623')
export const bgOrange = chalk.bgHex('#F07623')

export class BaseLogger {
    public level(level: string, bgColor: ColorFunction, color: ColorFunction) {
        level = ` ${level} `.toUpperCase()
        return `${bold(bgColor(level)) + color('')} `
    }
    public tag(tag: string, color: ColorFunction) {
        return `${bold(color(" - " + tag + ":"))} `
    }
    public log({ msg, level, tag, color, bgColor }: {
        msg: string,
        level: string,
        tag: string,
        color: ColorFunction,
        bgColor: ColorFunction
    }) {
        let text = this.level(level, bgColor, color)
        if (tag) text += this.tag(tag, color)
        text += msg
        console.log(text)
    }
    public info({ msg, level = 'info', tag = "" }) {
        this.log({ msg, level, tag, bgColor: bgBlue, color: blue })
    }
    public warn({ msg, level = 'warn', tag = "" }) {
        this.log({ msg, level, tag, bgColor: bgYellow, color: yellow })
    }
    public error({ msg, level = 'error', tag = "" }) {
        this.log({ msg, level, tag, bgColor: bgRed, color: red })
    }
    public debug({ msg, level = 'debug', tag = "" }) {
        this.log({ msg, level, tag, bgColor: bgMagenta, color: magenta })
    }
    public success({ msg, level = 'success', tag = "" }) {
        this.log({ msg, level, tag, bgColor: bgGreen, color: green })
    }
    public fail({ msg, level = 'fail', tag = "" }) {
        this.error({ msg, level, tag })
    }
    public multiLine({ msg, level, tag, title, bgColor, color }: {
        msg?: string[],
        level?: string | 'info' | 'warn' | 'debug' | 'error' | 'fail' | 'success',
        tag?: string,
        title?: string,
        bgColor: ColorFunction,
        color: ColorFunction
    }) {
        this.log({ msg: color(bold(title)), level, tag, bgColor, color })

        const arrowLength = level.length + 6
        for (let i = 0; i < msg.length; i++) {
            let arrow = new Array(arrowLength - 4).fill("=").join("") + "> "
            console.log(bold(color(arrow)) + this.tag(tag, color) + msg[i])
        }
    }
    public multiLineInfo({ msg, level = "info", tag, title }) {
        return this.multiLine({ msg, tag, level, title, bgColor: bgBlue, color: blue })
    }
    public multiLineWarn({ msg, level = "warn", tag, title }) {
        return this.multiLine({ msg, tag, level, title, bgColor: bgYellow, color: yellow })
    }
    public multiLineError({ msg, level = "error", tag, title }) {
        return this.multiLine({ msg, tag, level, title, bgColor: bgRed, color: red })
    }
    public multiLineDebug({ msg, level = "info", tag, title }) {
        return this.multiLine({ msg, tag, level, title, bgColor: bgMagenta, color: magenta })
    }
    public multiLineSuccess({ msg, level = "info", tag, title }) {
        return this.multiLine({ msg, tag, level, title, bgColor: bgGreen, color: green })
    }
    public multiLineFail({ msg, level = "info", tag, title }) {
        return this.multiLine({ msg, tag, level, title, bgColor: bgRed, color: red })
    }
}
export class PrismaLogger {
    SQL_KEYWORD = /\b(OFFSET|SELECT|ADD|CONSTRAINT|ALTER|AND|AS|FROM|CREATE|DATABASE|WHERE|GROUP|BY|HAVING|ORDER|LIMIT|OR)\b/g
    SQL_OPERATOR = /(\+|-|\*|\/|=|>|<|>=|<=|&|\||%|!|\^|,|\?)/g
    SQL_FUNCTION = /([a-zA-Z_]*\(\))/g
    SQL_PARAM = /(\w+)/g
    SQL_NUMBER = /(\d+)/g
    constructor(public logger: BaseLogger) { }
    private sqlKeyword(keyword: string) {
        return bold(red(keyword))
    }
    private sqlOperator(sign: string) {
        return yellow(sign)
    }
    private sqlFunction(fn: string) {
        return blue(fn)
    }
    private sqlParam(param) {
        return bold(orange(param))
    }

    public sql(sql: string) {
        sql = sql.replace(this.SQL_KEYWORD, (keyword) => this.sqlKeyword(keyword))
        sql = sql.replace(this.SQL_OPERATOR, (keyword) => this.sqlOperator(keyword))
        sql = sql.replace(this.SQL_FUNCTION, (keyword) => this.sqlFunction(keyword))
        return sql
    }
    public sqlParams(params: string) {
        params = params.replace(this.SQL_PARAM, (param) => this.sqlParam(param))
        return params
    }
    public query(e: Prisma.QueryEvent) {
        const queryLog = bold('Query: ') + this.sql(e.query)
        const paramLog = bold('Params: ') + this.sqlParams(e.params)
        const durationLog = bold('Durations: ') + bold(orange(e.duration)) + " ms"
        this.logger.multiLineInfo({
            msg: [queryLog, paramLog, durationLog],
            tag: 'Prisma',
            title: 'Execute prisma query...'
        })
    }
    public info(e: Prisma.LogEvent) {
        this.logger.info({ msg: e.message, tag: 'Prisma' })
    }
}

export const logger = new BaseLogger()
export const prismaLogger = new PrismaLogger(logger)

// @Injectable()
// export class NestJSLoggerMiddleware implements NestMiddleware {
//     use(req: Request, res: Response, next: NextFunction) {
//         const headersLog = bold("Headers: ") + req.headers
//         logger.multiLineInfo({ msg: [headersLog], tag: "NestJS", title: "NestJS request info:" })
//         next()
//     }
// }
export function NestJSLoggerMiddlewareFn(req: Request, res: Response, next: NextFunction) {

    if(Reflect.has(req.headers,'Authorization')){
        const reqUrl=bold("Request Url: ")+req.url
        const jwt = bold("JWT Token: ") + req.headers['Authorization']
        logger.multiLineInfo({ msg: [reqUrl,jwt], tag: "NestJS", title: "NestJS Auth info:" })
    }
    else if(Reflect.has(req.headers,'authorization')){
        const reqUrl=bold("Request Url: ")+req.url
        const jwt = bold("JWT Token: ") + req.headers['authorization']
        logger.multiLineInfo({ msg: [reqUrl,jwt], tag: "NestJS", title: "NestJS Auth info:" })
    }
    next()
};




import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class NestJSLogInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(
                tap((res) => {
                    const req=context.switchToHttp().getRequest()
                    //const res=context.switchToHttp().getResponse()
                    const reqUrl=bold("Request Url: ")+req.originalUrl
                    const reqHeadersLog = bold("Request Headers: ") + JSON.stringify(req.headers)
                    const resBodyLog=bold("Response Body: ")+JSON.stringify(res)

                    logger.multiLineInfo({ msg: [reqUrl,reqHeadersLog,resBodyLog], tag: "NestJS", title: "NestJS request info:" })
                }),
            );
    }
}