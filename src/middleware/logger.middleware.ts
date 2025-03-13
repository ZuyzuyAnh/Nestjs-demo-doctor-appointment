import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms`,
      );
    });

    next();
  }
}

export function logger(req: Request, res: Response, next: NextFunction) {
  const logger = new Logger('HTTP');
  const { ip, method, originalUrl } = req;
  const userAgent = req.get('user-agent') || '';

  logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

  const startTime = Date.now();

  res.on('finish', () => {
    const { statusCode } = res;
    const contentLength = res.get('content-length') || 0;
    const responseTime = Date.now() - startTime;

    logger.log(
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms`,
    );
  });

  next();
}
