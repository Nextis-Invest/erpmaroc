// import GoogleProvider from "next-auth/providers/google";
// import NextAuth from "next-auth";
// import { connectToDB } from "@/lib/database/connectToDB";
// import ADMIN from "@/model/admin";

// export const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//       callbacks: {
//         async signIn({ account, profile }) {
//           console.log("🚀 ~ signIn ~ profile:", profile);
//           console.log("🚀 ~ signIn ~ account:", account);
//           if (account.provider === "google") {
//             let connected =  await connectToDB();
//             console.log("🚀 ~ signIn ~ connected:", connected)
//             try {
//               const existingUser = await ADMIN.findOne({ email: profile.email });
//               if(existingUser){
//                 return true;  //if user already exists, execuation will end here
//               }
//               const newAdmin = new ADMIN({
//                 email: profile.email,
//                 name: profile.name,
//                 profileImg: profile?.picture || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQJxKGGpPc9-5g25KWwnsCCy9O_dlS4HWo5A&usqp=CAU",
//               })
//               await newAdmin.save();
//               return true;
//             } catch (error) {
//               console.log("Error in creating Admin")
//               throw new Error(error || "Error in creating Admin");
//             }
//           }
//         },

//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 day
//   },
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET,
//     maxAge: 30 * 24 * 60 * 60, // 30 day

//   },
//   // pages: {
//   //   signIn: "/login", // Custom sign-in page
//   // },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
// app/api/auth/[auth0]/route.js
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();