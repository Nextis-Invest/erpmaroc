"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/check-user-network-status";
exports.ids = ["vendor-chunks/check-user-network-status"];
exports.modules = {

/***/ "(ssr)/./node_modules/check-user-network-status/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/check-user-network-status/index.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n\r\n\r\nconst useNetworkStatus = () => {\r\n\r\n        const [networkStatus, setnetworkStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);\r\n\r\n        (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\r\n            window.addEventListener('online', () => {\r\n                setnetworkStatus(true);\r\n            })\r\n\r\n            window.addEventListener('offline', () => {\r\n                setnetworkStatus(false);\r\n            })\r\n        }, [])\r\n     \r\n       return networkStatus;\r\n};\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useNetworkStatus);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvY2hlY2stdXNlci1uZXR3b3JrLXN0YXR1cy9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMEM7QUFDMUM7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELCtDQUFRO0FBQzFEO0FBQ0EsUUFBUSxnREFBUztBQUNqQjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxnQkFBZ0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lbnRlcnByaXNlLXJlc291cmNlLW1hbmFnZW1lbnQtc3lzdGVtLy4vbm9kZV9tb2R1bGVzL2NoZWNrLXVzZXItbmV0d29yay1zdGF0dXMvaW5kZXguanM/MTVhNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3VzZVN0YXRlLCB1c2VFZmZlY3R9IGZyb20gXCJyZWFjdFwiO1xyXG5cclxuY29uc3QgdXNlTmV0d29ya1N0YXR1cyA9ICgpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgW25ldHdvcmtTdGF0dXMsIHNldG5ldHdvcmtTdGF0dXNdID0gdXNlU3RhdGUodHJ1ZSk7XHJcblxyXG4gICAgICAgIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZXRuZXR3b3JrU3RhdHVzKHRydWUpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29mZmxpbmUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZXRuZXR3b3JrU3RhdHVzKGZhbHNlKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LCBbXSlcclxuICAgICBcclxuICAgICAgIHJldHVybiBuZXR3b3JrU3RhdHVzO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdXNlTmV0d29ya1N0YXR1czsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/check-user-network-status/index.js\n");

/***/ })

};
;