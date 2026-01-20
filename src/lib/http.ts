import { NextResponse } from "next/server";

export enum HttpCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  CONFLICT = 409,
}

export class Result {
  /**
   * Success Response
   * @param data Response data
   * @param message Success message
   * @param code HTTP status code (default: 200)
   */
  static success<T>(
    data: T,
    message: string = "操作成功",
    code: number = HttpCode.OK,
  ) {
    return NextResponse.json(
      {
        code,
        message,
        data,
      },
      { status: code }
    );
  }

  /**
   * Error Response
   * @param code HTTP status code or business error code
   * @param message Error message
   * @param data Additional error data
   */
  static error<T>(
    code: number = HttpCode.INTERNAL_SERVER_ERROR,
    message: string = "操作失败",
    data?: T,
  ) {
    return NextResponse.json(
      {
        code,
        message,
        data,
      },
      { status: code }
    );
  }
}

export class RequestHelper {
  /**
   * Safely parse JSON from request body
   * @param req The request object
   * @returns Object containing data or error
   */
  static async safeParse<T>(req: Request): Promise<{ data: T | null; error: string | null }> {
    try {
      // Relaxed check: We prefer application/json but if the body is parseable JSON, we accept it.
      // This helps with tools that might miss the header.
      /*
      const contentType = req.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return { data: null, error: "Invalid Content-Type. Expected application/json" };
      }
      */

      // Clone request to avoid "body stream is locked" if multiple reads happen (though typically we read once)
      // or just read directly. Direct read is standard for API routes.
      let text = "";
      try {
        text = await req.text();
      } catch (readError) {
        console.error("Failed to read request body:", readError);
        return { data: null, error: "Failed to read request body" };
      }
      
      if (!text) {
         return { data: null, error: "Empty request body" };
      }

      const data = JSON.parse(text) as T;
      return { data, error: null };
    } catch (e: unknown) {
      console.error("JSON Parse Error:", e);
      // Log the raw body to see what was actually received
      // Note: we can't clone here if we already consumed the body with req.text(), so we use the text variable
      console.error("Raw Body Content:", typeof text !== 'undefined' ? text : "undefined");
      return { data: null, error: "Invalid JSON format" };
    }
  }
}
