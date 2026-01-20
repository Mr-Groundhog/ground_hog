import { prisma } from "@/lib/db";
import { Result, HttpCode, RequestHelper } from "@/lib/http";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findFirst({
      where: { id, isDelete: 0 },
    });

    if (!user) {
      return Result.error(HttpCode.NOT_FOUND, "User not found");
    }

    return Result.success(user);
  } catch (error) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "Internal server error");
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: body, error: parseError } = await RequestHelper.safeParse<any>(req);

    if (parseError || !body) {
      return Result.error(HttpCode.BAD_REQUEST, parseError || "Invalid JSON body");
    }
    
    // Prevent updating sensitive fields directly if needed
    // delete body.password; 

    const user = await prisma.user.update({
      where: { id },
      data: body,
    });

    return Result.success(user, "User updated successfully");
  } catch (error) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "Failed to update user");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Logical delete
    await prisma.user.update({
      where: { id },
      data: {
        isDelete: 2, // 2: deleted
        deletedAt: new Date(),
      },
    });

    return Result.success(null, "User deleted successfully");
  } catch (error) {
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "Failed to delete user");
  }
}
