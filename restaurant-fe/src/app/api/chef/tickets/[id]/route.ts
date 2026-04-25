import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { itemId, status } = await request.json();

  return Response.json({
    success: true,
    ticketId: params.id,
    itemId,
    status,
  });
}
