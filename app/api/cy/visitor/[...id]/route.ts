import { NextApiRequest } from "next";

export async function DELETE(req: NextApiRequest) {
    console.log(req);
    return Response.json({ success: true });
}