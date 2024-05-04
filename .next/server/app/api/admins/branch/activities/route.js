"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/admins/branch/activities/route";
exports.ids = ["app/api/admins/branch/activities/route"];
exports.modules = {

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute&page=%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute.js&appDir=C%3A%5CUsers%5Cnay30%5CDesktop%5CProgramming%5CProjects%5Centerprise-resource-management-system%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cnay30%5CDesktop%5CProgramming%5CProjects%5Centerprise-resource-management-system&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute&page=%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute.js&appDir=C%3A%5CUsers%5Cnay30%5CDesktop%5CProgramming%5CProjects%5Centerprise-resource-management-system%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cnay30%5CDesktop%5CProgramming%5CProjects%5Centerprise-resource-management-system&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_nay30_Desktop_Programming_Projects_enterprise_resource_management_system_app_api_admins_branch_activities_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admins/branch/activities/route.js */ \"(rsc)/./app/api/admins/branch/activities/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admins/branch/activities/route\",\n        pathname: \"/api/admins/branch/activities\",\n        filename: \"route\",\n        bundlePath: \"app/api/admins/branch/activities/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\nay30\\\\Desktop\\\\Programming\\\\Projects\\\\enterprise-resource-management-system\\\\app\\\\api\\\\admins\\\\branch\\\\activities\\\\route.js\",\n    nextConfigOutput,\n    userland: C_Users_nay30_Desktop_Programming_Projects_enterprise_resource_management_system_app_api_admins_branch_activities_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/admins/branch/activities/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbnMlMkZicmFuY2glMkZhY3Rpdml0aWVzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhZG1pbnMlMkZicmFuY2glMkZhY3Rpdml0aWVzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYWRtaW5zJTJGYnJhbmNoJTJGYWN0aXZpdGllcyUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNuYXkzMCU1Q0Rlc2t0b3AlNUNQcm9ncmFtbWluZyU1Q1Byb2plY3RzJTVDZW50ZXJwcmlzZS1yZXNvdXJjZS1tYW5hZ2VtZW50LXN5c3RlbSU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDbmF5MzAlNUNEZXNrdG9wJTVDUHJvZ3JhbW1pbmclNUNQcm9qZWN0cyU1Q2VudGVycHJpc2UtcmVzb3VyY2UtbWFuYWdlbWVudC1zeXN0ZW0maXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDdUY7QUFDcEs7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lbnRlcnByaXNlLXJlc291cmNlLW1hbmFnZW1lbnQtc3lzdGVtLz8yNzllIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXG5heTMwXFxcXERlc2t0b3BcXFxcUHJvZ3JhbW1pbmdcXFxcUHJvamVjdHNcXFxcZW50ZXJwcmlzZS1yZXNvdXJjZS1tYW5hZ2VtZW50LXN5c3RlbVxcXFxhcHBcXFxcYXBpXFxcXGFkbWluc1xcXFxicmFuY2hcXFxcYWN0aXZpdGllc1xcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYWRtaW5zL2JyYW5jaC9hY3Rpdml0aWVzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYWRtaW5zL2JyYW5jaC9hY3Rpdml0aWVzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hZG1pbnMvYnJhbmNoL2FjdGl2aXRpZXMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxuYXkzMFxcXFxEZXNrdG9wXFxcXFByb2dyYW1taW5nXFxcXFByb2plY3RzXFxcXGVudGVycHJpc2UtcmVzb3VyY2UtbWFuYWdlbWVudC1zeXN0ZW1cXFxcYXBwXFxcXGFwaVxcXFxhZG1pbnNcXFxcYnJhbmNoXFxcXGFjdGl2aXRpZXNcXFxccm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYWRtaW5zL2JyYW5jaC9hY3Rpdml0aWVzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute&page=%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute.js&appDir=C%3A%5CUsers%5Cnay30%5CDesktop%5CProgramming%5CProjects%5Centerprise-resource-management-system%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cnay30%5CDesktop%5CProgramming%5CProjects%5Centerprise-resource-management-system&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/admins/branch/activities/route.js":
/*!***************************************************!*\
  !*** ./app/api/admins/branch/activities/route.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var _lib_database_connectToDB__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/database/connectToDB */ \"(rsc)/./lib/database/connectToDB.js\");\n/* harmony import */ var _model_activities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/model/activities */ \"(rsc)/./model/activities.js\");\n/* harmony import */ var _model_activities__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_model_activities__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _model_branchData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/model/branchData */ \"(rsc)/./model/branchData.js\");\n/* harmony import */ var _model_branchData__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_model_branchData__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _auth0_nextjs_auth0__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @auth0/nextjs-auth0 */ \"(rsc)/./node_modules/@auth0/nextjs-auth0/dist/index.js\");\n/* harmony import */ var _auth0_nextjs_auth0__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_auth0_nextjs_auth0__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n\n\n\n\nconst GET = async (req, res)=>{\n    try {\n        const searchParams = req.nextUrl.searchParams;\n        // Extract query parameters\n        const branch = searchParams.get(\"branch\");\n        // Connect to the database\n        await (0,_lib_database_connectToDB__WEBPACK_IMPORTED_MODULE_0__.connectToDB)();\n        // console.log(\"🚀 ~ GET ~ ACTIVITIES:\", \"Branch: \", branch);\n        const branchExist = await _model_branchData__WEBPACK_IMPORTED_MODULE_2___default().findOne({\n            _id: branch\n        });\n        const res = new next_server__WEBPACK_IMPORTED_MODULE_4__.NextResponse();\n        const session = await (0,_auth0_nextjs_auth0__WEBPACK_IMPORTED_MODULE_3__.getSession)(res);\n        if (session.user.email != branchExist.manager) {\n            return next_server__WEBPACK_IMPORTED_MODULE_4__.NextResponse.json({\n                status: 401,\n                message: \"Failed to retrive.\",\n                errorCode: 401,\n                details: {\n                    error: \"Unauthourized\"\n                }\n            });\n        }\n        const activities = await _model_activities__WEBPACK_IMPORTED_MODULE_1___default().find({\n            branch: branch\n        }).sort({\n            timestamp: -1\n        }).limit(20);\n        // console.log(\"🚀 ~ GET ~ activities:\", activities);\n        // Return response\n        return next_server__WEBPACK_IMPORTED_MODULE_4__.NextResponse.json({\n            meta: {\n                status: 201,\n                branchId: branch\n            },\n            data: {\n                activities\n            }\n        });\n    } catch (error) {\n        throw error;\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWlucy9icmFuY2gvYWN0aXZpdGllcy9yb3V0ZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBeUQ7QUFDWjtBQUNMO0FBQ1M7QUFDTjtBQUVwQyxNQUFNSyxNQUFNLE9BQU9DLEtBQUtDO0lBQzdCLElBQUk7UUFDRixNQUFNQyxlQUFlRixJQUFJRyxPQUFPLENBQUNELFlBQVk7UUFFN0MsMkJBQTJCO1FBQzNCLE1BQU1FLFNBQVNGLGFBQWFHLEdBQUcsQ0FBQztRQUVoQywwQkFBMEI7UUFDMUIsTUFBTVgsc0VBQVdBO1FBQ2pCLDZEQUE2RDtRQUU3RCxNQUFNWSxjQUFjLE1BQU1WLGdFQUFjLENBQUM7WUFBRVksS0FBS0o7UUFBTztRQUV2RCxNQUFNSCxNQUFNLElBQUlILHFEQUFZQTtRQUM1QixNQUFNVyxVQUFVLE1BQU1aLCtEQUFVQSxDQUFDSTtRQUVqQyxJQUFHUSxRQUFRQyxJQUFJLENBQUNDLEtBQUssSUFBSUwsWUFBWU0sT0FBTyxFQUFDO1lBQzNDLE9BQU9kLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7Z0JBQ3ZCQyxRQUFRO2dCQUNSQyxTQUFTO2dCQUNUQyxXQUFXO2dCQUNYQyxTQUFTO29CQUNQQyxPQUFPO2dCQUNUO1lBQ0Y7UUFDRjtRQUVBLE1BQU1DLGFBQWEsTUFBTXhCLDZEQUFnQixDQUFDO1lBQUVTLFFBQVFBO1FBQU8sR0FDeERpQixJQUFJLENBQUM7WUFBRUMsV0FBVyxDQUFDO1FBQUUsR0FDckJDLEtBQUssQ0FBQztRQUVULHFEQUFxRDtRQUVyRCxrQkFBa0I7UUFDbEIsT0FBT3pCLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7WUFDdkJXLE1BQU07Z0JBQ0pWLFFBQVE7Z0JBQ1JXLFVBQVVyQjtZQUNaO1lBQ0FzQixNQUFNO2dCQUFFUDtZQUFXO1FBQ3JCO0lBQ0YsRUFBRSxPQUFPRCxPQUFPO1FBQ2QsTUFBTUE7SUFDUjtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lbnRlcnByaXNlLXJlc291cmNlLW1hbmFnZW1lbnQtc3lzdGVtLy4vYXBwL2FwaS9hZG1pbnMvYnJhbmNoL2FjdGl2aXRpZXMvcm91dGUuanM/NDM1NiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb25uZWN0VG9EQiB9IGZyb20gXCJAL2xpYi9kYXRhYmFzZS9jb25uZWN0VG9EQlwiO1xyXG5pbXBvcnQgQUNUSVZJVFlMT0cgZnJvbSBcIkAvbW9kZWwvYWN0aXZpdGllc1wiO1xyXG5pbXBvcnQgQlJBTkNIIGZyb20gXCJAL21vZGVsL2JyYW5jaERhdGFcIjtcclxuaW1wb3J0IHsgZ2V0U2Vzc2lvbiB9IGZyb20gXCJAYXV0aDAvbmV4dGpzLWF1dGgwXCI7XHJcbmltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEdFVCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzZWFyY2hQYXJhbXMgPSByZXEubmV4dFVybC5zZWFyY2hQYXJhbXM7XHJcblxyXG4gICAgLy8gRXh0cmFjdCBxdWVyeSBwYXJhbWV0ZXJzXHJcbiAgICBjb25zdCBicmFuY2ggPSBzZWFyY2hQYXJhbXMuZ2V0KFwiYnJhbmNoXCIpO1xyXG5cclxuICAgIC8vIENvbm5lY3QgdG8gdGhlIGRhdGFiYXNlXHJcbiAgICBhd2FpdCBjb25uZWN0VG9EQigpO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCLwn5qAIH4gR0VUIH4gQUNUSVZJVElFUzpcIiwgXCJCcmFuY2g6IFwiLCBicmFuY2gpO1xyXG5cclxuICAgIGNvbnN0IGJyYW5jaEV4aXN0ID0gYXdhaXQgQlJBTkNILmZpbmRPbmUoeyBfaWQ6IGJyYW5jaCB9KTtcclxuXHJcbiAgICBjb25zdCByZXMgPSBuZXcgTmV4dFJlc3BvbnNlKCk7XHJcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2Vzc2lvbihyZXMpO1xyXG5cclxuICAgIGlmKHNlc3Npb24udXNlci5lbWFpbCAhPSBicmFuY2hFeGlzdC5tYW5hZ2VyKXtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgICBzdGF0dXM6IDQwMSxcclxuICAgICAgICBtZXNzYWdlOiBcIkZhaWxlZCB0byByZXRyaXZlLlwiLFxyXG4gICAgICAgIGVycm9yQ29kZTogNDAxLFxyXG4gICAgICAgIGRldGFpbHM6IHtcclxuICAgICAgICAgIGVycm9yOiBcIlVuYXV0aG91cml6ZWRcIixcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhY3Rpdml0aWVzID0gYXdhaXQgQUNUSVZJVFlMT0cuZmluZCh7IGJyYW5jaDogYnJhbmNoIH0pXHJcbiAgICAgIC5zb3J0KHsgdGltZXN0YW1wOiAtMSB9KVxyXG4gICAgICAubGltaXQoMjApO1xyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKFwi8J+agCB+IEdFVCB+IGFjdGl2aXRpZXM6XCIsIGFjdGl2aXRpZXMpO1xyXG5cclxuICAgIC8vIFJldHVybiByZXNwb25zZVxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgbWV0YToge1xyXG4gICAgICAgIHN0YXR1czogMjAxLFxyXG4gICAgICAgIGJyYW5jaElkOiBicmFuY2gsXHJcbiAgICAgIH0sXHJcbiAgICAgIGRhdGE6IHsgYWN0aXZpdGllcyB9LFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHRocm93IGVycm9yO1xyXG4gIH1cclxufTtcclxuIl0sIm5hbWVzIjpbImNvbm5lY3RUb0RCIiwiQUNUSVZJVFlMT0ciLCJCUkFOQ0giLCJnZXRTZXNzaW9uIiwiTmV4dFJlc3BvbnNlIiwiR0VUIiwicmVxIiwicmVzIiwic2VhcmNoUGFyYW1zIiwibmV4dFVybCIsImJyYW5jaCIsImdldCIsImJyYW5jaEV4aXN0IiwiZmluZE9uZSIsIl9pZCIsInNlc3Npb24iLCJ1c2VyIiwiZW1haWwiLCJtYW5hZ2VyIiwianNvbiIsInN0YXR1cyIsIm1lc3NhZ2UiLCJlcnJvckNvZGUiLCJkZXRhaWxzIiwiZXJyb3IiLCJhY3Rpdml0aWVzIiwiZmluZCIsInNvcnQiLCJ0aW1lc3RhbXAiLCJsaW1pdCIsIm1ldGEiLCJicmFuY2hJZCIsImRhdGEiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admins/branch/activities/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/database/connectToDB.js":
/*!*************************************!*\
  !*** ./lib/database/connectToDB.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   connectToDB: () => (/* binding */ connectToDB)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst connectToDB = async ()=>{\n    console.log(\"\\x1b[32mConnecting to MongoDB\\x1b[0m\");\n    try {\n        await mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(process.env.MONGODB_URI);\n        await mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection.db.admin().command({\n            ping: 1\n        });\n        console.log(\"\\x1b[32mConnected to MongoDB\\x1b[0m\");\n        return true;\n    } catch (error) {\n        console.log(\"\\x1b[33mError in connecting to MongoDB\\x1b[0m\");\n        throw new Error(error || \"Error in connecting to MongoDB\");\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGF0YWJhc2UvY29ubmVjdFRvREIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWdDO0FBRXpCLE1BQU1DLGNBQWM7SUFDdkJDLFFBQVFDLEdBQUcsQ0FBQztJQUNaLElBQUk7UUFDQSxNQUFNSCx1REFBZ0IsQ0FBQ0ssUUFBUUMsR0FBRyxDQUFDQyxXQUFXO1FBQzlDLE1BQU1QLDBEQUFtQixDQUFDUyxFQUFFLENBQUNDLEtBQUssR0FBR0MsT0FBTyxDQUFDO1lBQUVDLE1BQU07UUFBRTtRQUN2RFYsUUFBUUMsR0FBRyxDQUFDO1FBQ1osT0FBTztJQUNYLEVBQUUsT0FBT1UsT0FBTztRQUNaWCxRQUFRQyxHQUFHLENBQUM7UUFDWixNQUFNLElBQUlXLE1BQU1ELFNBQVM7SUFDN0I7QUFDSixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZW50ZXJwcmlzZS1yZXNvdXJjZS1tYW5hZ2VtZW50LXN5c3RlbS8uL2xpYi9kYXRhYmFzZS9jb25uZWN0VG9EQi5qcz83OTZlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tIFwibW9uZ29vc2VcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBjb25uZWN0VG9EQiA9IGFzeW5jICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiXFx4MWJbMzJtQ29ubmVjdGluZyB0byBNb25nb0RCXFx4MWJbMG1cIik7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG1vbmdvb3NlLmNvbm5lY3QocHJvY2Vzcy5lbnYuTU9OR09EQl9VUkkpO1xyXG4gICAgICAgIGF3YWl0IG1vbmdvb3NlLmNvbm5lY3Rpb24uZGIuYWRtaW4oKS5jb21tYW5kKHsgcGluZzogMSB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlxceDFiWzMybUNvbm5lY3RlZCB0byBNb25nb0RCXFx4MWJbMG1cIik7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiXFx4MWJbMzNtRXJyb3IgaW4gY29ubmVjdGluZyB0byBNb25nb0RCXFx4MWJbMG1cIik7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yIHx8IFwiRXJyb3IgaW4gY29ubmVjdGluZyB0byBNb25nb0RCXCIpO1xyXG4gICAgfVxyXG59Il0sIm5hbWVzIjpbIm1vbmdvb3NlIiwiY29ubmVjdFRvREIiLCJjb25zb2xlIiwibG9nIiwiY29ubmVjdCIsInByb2Nlc3MiLCJlbnYiLCJNT05HT0RCX1VSSSIsImNvbm5lY3Rpb24iLCJkYiIsImFkbWluIiwiY29tbWFuZCIsInBpbmciLCJlcnJvciIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/database/connectToDB.js\n");

/***/ }),

/***/ "(rsc)/./model/activities.js":
/*!*****************************!*\
  !*** ./model/activities.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\nconst BRANCH = __webpack_require__(/*! ./branchData */ \"(rsc)/./model/branchData.js\"); // Import the Branch schema\nlet ACTIVITYLOG;\nif (mongoose.models && mongoose.models.ACTIVITYLOG) {\n    ACTIVITYLOG = mongoose.models.ACTIVITYLOG;\n} else {\n    const activityLogSchema = new mongoose.Schema({\n        branch: {\n            type: mongoose.Schema.Types.ObjectId,\n            ref: \"BRANCH\",\n            required: true\n        },\n        process: {\n            type: String,\n            required: true\n        },\n        timestamp: {\n            type: Date,\n            default: Date.now\n        }\n    });\n    ACTIVITYLOG = mongoose.model(\"ACTIVITYLOG\", activityLogSchema);\n}\nmodule.exports = ACTIVITYLOG;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9tb2RlbC9hY3Rpdml0aWVzLmpzIiwibWFwcGluZ3MiOiI7QUFBQSxNQUFNQSxXQUFXQyxtQkFBT0EsQ0FBQztBQUN6QixNQUFNQyxTQUFTRCxtQkFBT0EsQ0FBQyxpREFBYyxHQUFHLDJCQUEyQjtBQUVuRSxJQUFJRTtBQUVKLElBQUlILFNBQVNJLE1BQU0sSUFBSUosU0FBU0ksTUFBTSxDQUFDRCxXQUFXLEVBQUU7SUFDbERBLGNBQWNILFNBQVNJLE1BQU0sQ0FBQ0QsV0FBVztBQUMzQyxPQUFPO0lBQ0wsTUFBTUUsb0JBQW9CLElBQUlMLFNBQVNNLE1BQU0sQ0FBQztRQUM1Q0MsUUFBUTtZQUNOQyxNQUFNUixTQUFTTSxNQUFNLENBQUNHLEtBQUssQ0FBQ0MsUUFBUTtZQUNwQ0MsS0FBSztZQUNMQyxVQUFVO1FBQ1o7UUFDQUMsU0FBUztZQUNQTCxNQUFNTTtZQUNORixVQUFVO1FBQ1o7UUFDQUcsV0FBVztZQUNUUCxNQUFNUTtZQUNOQyxTQUFTRCxLQUFLRSxHQUFHO1FBQ25CO0lBQ0Y7SUFFQWYsY0FBY0gsU0FBU21CLEtBQUssQ0FBQyxlQUFlZDtBQUM5QztBQUVBZSxPQUFPQyxPQUFPLEdBQUdsQiIsInNvdXJjZXMiOlsid2VicGFjazovL2VudGVycHJpc2UtcmVzb3VyY2UtbWFuYWdlbWVudC1zeXN0ZW0vLi9tb2RlbC9hY3Rpdml0aWVzLmpzPzhiMjUiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xyXG5jb25zdCBCUkFOQ0ggPSByZXF1aXJlKFwiLi9icmFuY2hEYXRhXCIpOyAvLyBJbXBvcnQgdGhlIEJyYW5jaCBzY2hlbWFcclxuXHJcbmxldCBBQ1RJVklUWUxPRztcclxuXHJcbmlmIChtb25nb29zZS5tb2RlbHMgJiYgbW9uZ29vc2UubW9kZWxzLkFDVElWSVRZTE9HKSB7XHJcbiAgQUNUSVZJVFlMT0cgPSBtb25nb29zZS5tb2RlbHMuQUNUSVZJVFlMT0c7XHJcbn0gZWxzZSB7XHJcbiAgY29uc3QgYWN0aXZpdHlMb2dTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcclxuICAgIGJyYW5jaDoge1xyXG4gICAgICB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuT2JqZWN0SWQsXHJcbiAgICAgIHJlZjogJ0JSQU5DSCcsIC8vIFJlZmVyZW5jZSB0byB0aGUgQnJhbmNoIG1vZGVsXHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgcHJvY2Vzczoge1xyXG4gICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgdGltZXN0YW1wOiB7XHJcbiAgICAgIHR5cGU6IERhdGUsXHJcbiAgICAgIGRlZmF1bHQ6IERhdGUubm93XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIEFDVElWSVRZTE9HID0gbW9uZ29vc2UubW9kZWwoJ0FDVElWSVRZTE9HJywgYWN0aXZpdHlMb2dTY2hlbWEpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFDVElWSVRZTE9HO1xyXG4iXSwibmFtZXMiOlsibW9uZ29vc2UiLCJyZXF1aXJlIiwiQlJBTkNIIiwiQUNUSVZJVFlMT0ciLCJtb2RlbHMiLCJhY3Rpdml0eUxvZ1NjaGVtYSIsIlNjaGVtYSIsImJyYW5jaCIsInR5cGUiLCJUeXBlcyIsIk9iamVjdElkIiwicmVmIiwicmVxdWlyZWQiLCJwcm9jZXNzIiwiU3RyaW5nIiwidGltZXN0YW1wIiwiRGF0ZSIsImRlZmF1bHQiLCJub3ciLCJtb2RlbCIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./model/activities.js\n");

/***/ }),

/***/ "(rsc)/./model/branchData.js":
/*!*****************************!*\
  !*** ./model/branchData.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("// const mongoose = require(\"mongoose\");\n// const ADMIN = require(\"./admin\"); // Assuming adminSchema.js is in the same directory\n// const STAFF = require(\"./staffs\"); // Assuming staffSchema.js is in the same directory\n// let BRANCH;\n// if (mongoose.models.BRANCH) {\n//   BRANCH = mongoose.model(\"BRANCH\");\n// } else {\n//   const BranchSchema = new mongoose.Schema({\n//     _id: {\n//       type: mongoose.Schema.Types.ObjectId,\n//       auto: true, // Let MongoDB generate the _id automatically\n//     },\n//     id: {\n//       type: String,\n//       required: true,\n//     },\n//     cityName: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     companyName: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     countryName: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     branchEmail: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     phone: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     stateName: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     streetName: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     websiteUrl: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     manager: {\n//       type: String,\n//       required: true,\n//       unique: false,\n//     },\n//     keys: [\n//       {\n//         name: {\n//           type: String,\n//           required: true,\n//         },\n//         description: String,\n//         createdTime: {\n//           type: Date,\n//           default: Date.now,\n//         },\n//         key: {\n//           type: String,\n//           unique: true,\n//           required: true,\n//         },\n//       },\n//     ],\n//     childBranch: [\n//       {\n//         type: mongoose.Schema.Types.ObjectId,\n//         ref: BRANCH, // Reference to the Branch model\n//         default: NaN,\n//       },\n//     ],\n//   });\n//   BRANCH = mongoose.model(\"BRANCH\", BranchSchema);\n// }\n// module.exports = BRANCH;\n\nconst mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\n// Define the BranchSchema\nconst BranchSchema = new mongoose.Schema({\n    _id: {\n        type: mongoose.Schema.Types.ObjectId,\n        auto: true\n    },\n    id: {\n        type: String,\n        required: true\n    },\n    cityName: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    companyName: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    countryName: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    branchEmail: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    phone: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    stateName: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    streetName: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    websiteUrl: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    manager: {\n        type: String,\n        required: true,\n        unique: false\n    },\n    keys: [\n        {\n            name: {\n                type: String,\n                required: true\n            },\n            description: String,\n            createdTime: {\n                type: Date,\n                default: Date.now\n            },\n            key: {\n                type: String,\n                required: true\n            }\n        }\n    ],\n    childBranch: [\n        {\n            type: mongoose.Schema.Types.ObjectId,\n            ref: \"BRANCH\",\n            default: NaN\n        }\n    ]\n});\n// Create the BRANCH model\nconst BRANCH = mongoose.models.BRANCH || mongoose.model(\"BRANCH\", BranchSchema);\nmodule.exports = BRANCH;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFDQVMsTUFBTTtRQUNGO1lBQ0lDLE1BQU07Z0JBQ0ZsQixNQUFNSztnQkFDTkMsVUFBVTtZQUNkO1lBQ0FhLGFBQWFkO1lBQ2JlLGFBQWE7Z0JBQ1RwQixNQUFNcUI7Z0JBQ05DLFNBQVNELEtBQUtFLEdBQUc7WUFDckI7WUFDQUMsS0FBSztnQkFDRHhCLE1BQU1LO2dCQUNOQyxVQUFVO1lBQ2Q7UUFDSjtLQUNIO0lBQ0RtQixhQUFhO1FBQ1Q7WUFDSXpCLE1BQU1MLFNBQVNHLE1BQU0sQ0FBQ0csS0FBSyxDQUFDQyxRQUFRO1lBQ3BDd0IsS0FBSztZQUNMSixTQUFTSztRQUNiO0tBQ0g7QUFDTDtBQUVBLDBCQUEwQjtBQUMxQixNQUFNQyxTQUFTakMsU0FBU2tDLE1BQU0sQ0FBQ0QsTUFBTSxJQUFJakMsU0FBU21DLEtBQUssQ0FBQyxVQUFVakM7QUFFbEVrQyxPQUFPQyxPQUFPLEdBQUdKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZW50ZXJwcmlzZS1yZXNvdXJjZS1tYW5hZ2VtZW50LXN5c3RlbS8uL21vZGVsL2JyYW5jaERhdGEuanM/YWZlZCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb25zdCBtb25nb29zZSA9IHJlcXVpcmUoXCJtb25nb29zZVwiKTtcclxuLy8gY29uc3QgQURNSU4gPSByZXF1aXJlKFwiLi9hZG1pblwiKTsgLy8gQXNzdW1pbmcgYWRtaW5TY2hlbWEuanMgaXMgaW4gdGhlIHNhbWUgZGlyZWN0b3J5XHJcbi8vIGNvbnN0IFNUQUZGID0gcmVxdWlyZShcIi4vc3RhZmZzXCIpOyAvLyBBc3N1bWluZyBzdGFmZlNjaGVtYS5qcyBpcyBpbiB0aGUgc2FtZSBkaXJlY3RvcnlcclxuXHJcbi8vIGxldCBCUkFOQ0g7XHJcblxyXG4vLyBpZiAobW9uZ29vc2UubW9kZWxzLkJSQU5DSCkge1xyXG4vLyAgIEJSQU5DSCA9IG1vbmdvb3NlLm1vZGVsKFwiQlJBTkNIXCIpO1xyXG4vLyB9IGVsc2Uge1xyXG4vLyAgIGNvbnN0IEJyYW5jaFNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xyXG4vLyAgICAgX2lkOiB7XHJcbi8vICAgICAgIHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCxcclxuLy8gICAgICAgYXV0bzogdHJ1ZSwgLy8gTGV0IE1vbmdvREIgZ2VuZXJhdGUgdGhlIF9pZCBhdXRvbWF0aWNhbGx5XHJcbi8vICAgICB9LFxyXG4vLyAgICAgaWQ6IHtcclxuLy8gICAgICAgdHlwZTogU3RyaW5nLFxyXG4vLyAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuLy8gICAgIH0sXHJcbi8vICAgICBjaXR5TmFtZToge1xyXG4vLyAgICAgICB0eXBlOiBTdHJpbmcsXHJcbi8vICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4vLyAgICAgICB1bmlxdWU6IGZhbHNlLFxyXG4vLyAgICAgfSxcclxuLy8gICAgIGNvbXBhbnlOYW1lOiB7XHJcbi8vICAgICAgIHR5cGU6IFN0cmluZyxcclxuLy8gICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbi8vICAgICAgIHVuaXF1ZTogZmFsc2UsXHJcbi8vICAgICB9LFxyXG4vLyAgICAgY291bnRyeU5hbWU6IHtcclxuLy8gICAgICAgdHlwZTogU3RyaW5nLFxyXG4vLyAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuLy8gICAgICAgdW5pcXVlOiBmYWxzZSxcclxuLy8gICAgIH0sXHJcbi8vICAgICBicmFuY2hFbWFpbDoge1xyXG4vLyAgICAgICB0eXBlOiBTdHJpbmcsXHJcbi8vICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4vLyAgICAgICB1bmlxdWU6IGZhbHNlLFxyXG4vLyAgICAgfSxcclxuLy8gICAgIHBob25lOiB7XHJcbi8vICAgICAgIHR5cGU6IFN0cmluZyxcclxuLy8gICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbi8vICAgICAgIHVuaXF1ZTogZmFsc2UsXHJcbi8vICAgICB9LFxyXG4vLyAgICAgc3RhdGVOYW1lOiB7XHJcbi8vICAgICAgIHR5cGU6IFN0cmluZyxcclxuLy8gICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbi8vICAgICAgIHVuaXF1ZTogZmFsc2UsXHJcbi8vICAgICB9LFxyXG4vLyAgICAgc3RyZWV0TmFtZToge1xyXG4vLyAgICAgICB0eXBlOiBTdHJpbmcsXHJcbi8vICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4vLyAgICAgICB1bmlxdWU6IGZhbHNlLFxyXG4vLyAgICAgfSxcclxuLy8gICAgIHdlYnNpdGVVcmw6IHtcclxuLy8gICAgICAgdHlwZTogU3RyaW5nLFxyXG4vLyAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuLy8gICAgICAgdW5pcXVlOiBmYWxzZSxcclxuLy8gICAgIH0sXHJcbi8vICAgICBtYW5hZ2VyOiB7XHJcbi8vICAgICAgIHR5cGU6IFN0cmluZyxcclxuLy8gICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbi8vICAgICAgIHVuaXF1ZTogZmFsc2UsXHJcbi8vICAgICB9LFxyXG4vLyAgICAga2V5czogW1xyXG4vLyAgICAgICB7XHJcbi8vICAgICAgICAgbmFtZToge1xyXG4vLyAgICAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4vLyAgICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbi8vICAgICAgICAgfSxcclxuLy8gICAgICAgICBkZXNjcmlwdGlvbjogU3RyaW5nLFxyXG4vLyAgICAgICAgIGNyZWF0ZWRUaW1lOiB7XHJcbi8vICAgICAgICAgICB0eXBlOiBEYXRlLFxyXG4vLyAgICAgICAgICAgZGVmYXVsdDogRGF0ZS5ub3csXHJcbi8vICAgICAgICAgfSxcclxuLy8gICAgICAgICBrZXk6IHtcclxuLy8gICAgICAgICAgIHR5cGU6IFN0cmluZyxcclxuLy8gICAgICAgICAgIHVuaXF1ZTogdHJ1ZSxcclxuLy8gICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4vLyAgICAgICAgIH0sXHJcbi8vICAgICAgIH0sXHJcbi8vICAgICBdLFxyXG4vLyAgICAgY2hpbGRCcmFuY2g6IFtcclxuLy8gICAgICAge1xyXG4vLyAgICAgICAgIHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCxcclxuLy8gICAgICAgICByZWY6IEJSQU5DSCwgLy8gUmVmZXJlbmNlIHRvIHRoZSBCcmFuY2ggbW9kZWxcclxuLy8gICAgICAgICBkZWZhdWx0OiBOYU4sXHJcbi8vICAgICAgIH0sXHJcbi8vICAgICBdLFxyXG4vLyAgIH0pO1xyXG5cclxuLy8gICBCUkFOQ0ggPSBtb25nb29zZS5tb2RlbChcIkJSQU5DSFwiLCBCcmFuY2hTY2hlbWEpO1xyXG4vLyB9XHJcblxyXG4vLyBtb2R1bGUuZXhwb3J0cyA9IEJSQU5DSDtcclxuXHJcblxyXG5jb25zdCBtb25nb29zZSA9IHJlcXVpcmUoXCJtb25nb29zZVwiKTtcclxuXHJcbi8vIERlZmluZSB0aGUgQnJhbmNoU2NoZW1hXHJcbmNvbnN0IEJyYW5jaFNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xyXG4gICAgX2lkOiB7XHJcbiAgICAgICAgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk9iamVjdElkLFxyXG4gICAgICAgIGF1dG86IHRydWUsIC8vIExldCBNb25nb0RCIGdlbmVyYXRlIHRoZSBfaWQgYXV0b21hdGljYWxseVxyXG4gICAgfSxcclxuICAgIGlkOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIGNpdHlOYW1lOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgIHVuaXF1ZTogZmFsc2UsXHJcbiAgICB9LFxyXG4gICAgY29tcGFueU5hbWU6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgdW5pcXVlOiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBjb3VudHJ5TmFtZToge1xyXG4gICAgICAgIHR5cGU6IFN0cmluZyxcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICB1bmlxdWU6IGZhbHNlLFxyXG4gICAgfSxcclxuICAgIGJyYW5jaEVtYWlsOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgIHVuaXF1ZTogZmFsc2UsXHJcbiAgICB9LFxyXG4gICAgcGhvbmU6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgdW5pcXVlOiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBzdGF0ZU5hbWU6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgdW5pcXVlOiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBzdHJlZXROYW1lOiB7XHJcbiAgICAgICAgdHlwZTogU3RyaW5nLFxyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgIHVuaXF1ZTogZmFsc2UsXHJcbiAgICB9LFxyXG4gICAgd2Vic2l0ZVVybDoge1xyXG4gICAgICAgIHR5cGU6IFN0cmluZyxcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICB1bmlxdWU6IGZhbHNlLFxyXG4gICAgfSxcclxuICAgIG1hbmFnZXI6IHtcclxuICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgdW5pcXVlOiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBrZXlzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFN0cmluZyxcclxuICAgICAgICAgICAgY3JlYXRlZFRpbWU6IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IERhdGUsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBEYXRlLm5vdyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAga2V5OiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgXSxcclxuICAgIGNoaWxkQnJhbmNoOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuT2JqZWN0SWQsXHJcbiAgICAgICAgICAgIHJlZjogXCJCUkFOQ0hcIiwgLy8gUmVmZXJlbmNlIHRvIHRoZSBCcmFuY2ggbW9kZWxcclxuICAgICAgICAgICAgZGVmYXVsdDogTmFOLFxyXG4gICAgICAgIH0sXHJcbiAgICBdLFxyXG59KTtcclxuXHJcbi8vIENyZWF0ZSB0aGUgQlJBTkNIIG1vZGVsXHJcbmNvbnN0IEJSQU5DSCA9IG1vbmdvb3NlLm1vZGVscy5CUkFOQ0ggfHwgbW9uZ29vc2UubW9kZWwoXCJCUkFOQ0hcIiwgQnJhbmNoU2NoZW1hKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQlJBTkNIO1xyXG5cclxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwicmVxdWlyZSIsIkJyYW5jaFNjaGVtYSIsIlNjaGVtYSIsIl9pZCIsInR5cGUiLCJUeXBlcyIsIk9iamVjdElkIiwiYXV0byIsImlkIiwiU3RyaW5nIiwicmVxdWlyZWQiLCJjaXR5TmFtZSIsInVuaXF1ZSIsImNvbXBhbnlOYW1lIiwiY291bnRyeU5hbWUiLCJicmFuY2hFbWFpbCIsInBob25lIiwic3RhdGVOYW1lIiwic3RyZWV0TmFtZSIsIndlYnNpdGVVcmwiLCJtYW5hZ2VyIiwia2V5cyIsIm5hbWUiLCJkZXNjcmlwdGlvbiIsImNyZWF0ZWRUaW1lIiwiRGF0ZSIsImRlZmF1bHQiLCJub3ciLCJrZXkiLCJjaGlsZEJyYW5jaCIsInJlZiIsIk5hTiIsIkJSQU5DSCIsIm1vZGVscyIsIm1vZGVsIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./model/branchData.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc","vendor-chunks/joi","vendor-chunks/jose","vendor-chunks/@auth0","vendor-chunks/openid-client","vendor-chunks/@sideway","vendor-chunks/@hapi","vendor-chunks/debug","vendor-chunks/tslib","vendor-chunks/yallist","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/ms","vendor-chunks/supports-color","vendor-chunks/url-join","vendor-chunks/has-flag"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute&page=%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fbranch%2Factivities%2Froute.js&appDir=C%3A%5CUsers%5Cnay30%5CDesktop%5CProgramming%5CProjects%5Centerprise-resource-management-system%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cnay30%5CDesktop%5CProgramming%5CProjects%5Centerprise-resource-management-system&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();