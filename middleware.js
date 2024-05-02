// // // import { NextResponse } from "next/server";

// export function middleware (){
     
// }

// // export {default} from "next-auth/middleware"

// // export const config = {matcher: ["/", "/admin"]}

import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

export const config = {
    matcher: [
        '/((?!privacy-policy|_next/static|_next/image|favicon.ico|$).*)', //this protect api routes
        // '/((?!api|privacy-policy|_next/static|_next/image|favicon.ico|$).*)', //This doesn't protect api routes
    ]
}

export default withMiddlewareAuthRequired()