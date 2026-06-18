import { prisma } from "@/lib/db";
import { Result, HttpCode, RequestHelper } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: { isDelete: 0 },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.user.count({ where: { isDelete: 0 } });

    return Result.success(
      {
        list: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Users fetched successfully"
    );
  } catch (error) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "Internal server error");
  }
}

export async function POST(req: Request) {
  try {
    const { data: body, error: parseError } = await RequestHelper.safeParse<any>(req);

    if (parseError || !body) {
      return Result.error(HttpCode.BAD_REQUEST, parseError || "Invalid JSON body");
    }

    const { username, email, role } = body;

    if (!username || !email) {
      return Result.error(HttpCode.BAD_REQUEST, "Missing required fields");
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        role: role || "USER",
      },
    });

    return Result.success(user, "User created successfully", HttpCode.CREATED);
  } catch (error) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "Failed to create user");
  }
}
