import { INestApplication } from '@nestjs/common';
export function getAllRoutes(app:INestApplication){
    return app.getHttpServer()._events.request._router.stack
    .map(layer => {
      if (layer.route) {
        return {
          route: {
            path: layer.route?.path,
            method: layer.route?.stack[0].method,
          },
        };
      }
    }).filter(v=>v!=undefined)
}