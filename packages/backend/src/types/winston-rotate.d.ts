import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: string; email: string; role: string };
    file?: Express.Multer.File;
    // מוודא שתמיד קיימים טיפוסים בסיסיים (any) ולא ניפול על TS2339
    params: any;
    query: any;
    body: any;
  }
}
