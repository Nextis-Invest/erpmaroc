import BRANCH from "@/model/branchData";
import { NextResponse } from "next/server";

// export const GET = async (req, Request, Response) => {
//     const { email } = req.query;
//     console.log("🚀 ~ GET ~ email:", email)
//     // const searchParams = req.nextUrl.searchParams;
//     // const email = searchParams.get("email");
//     // console.log(req)
//     // console.log("R", Request)
//     console.log("Getting Branch data");
//     try {
//       await connectToDB();
//       const branch = await BRANCH.findOne({ manager: email });
//       console.log("🚀 ~ GET ~ branch:", branch)
  
//       return NextResponse.json({
//         meta: {
//           status: 200,
//           manager: branch?.manager,
//           branchId: branch._id,
//         },
//         data: {
//           branch,
//         },
//       });
//     } catch (error) {
//       throw error;
//     }
//   };
  