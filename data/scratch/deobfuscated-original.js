(() => {
  window.PostBootReactLibX = window.PostBootReactLibX || {};
  const e = {};
  var t;
  e.getML = function (e, t) {
    return window.PostBootReactLibX.ml[e] || t;
  };
  var o = [e => {
      "use strict";

      e.exports = React;
    }, e => {
      "use strict";

      e.exports = ReactJSXRuntime;
    }, (e, t) => {
      "use strict";

      var o, r, i, n;
      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.browser = t.supportsNotifications = t.getPrefixedStyleName = t.getScrollY = t.geolocationPermissions = t.getGeolocation = t.isHLSDRMAvailable = t.getPlatform = t.getDeviceStylePrefix = t.TABLET_DEVICE_PREFIX = t.MOBILE_DEVICE_PREFIX = t.hasMomentumScrolling = t.isHLSStreamingAvailable = t.isHLSNativeStreamingAvailable = t.isMP4StreamingAvailable = t.isVideoStreamingSupported = t.isScrollSnapTogglingSupported = t.isFantasySportsAvailable = t.meetsMinimumOSVersion = t.getOSDetails = t.isLeapWebRTCStreamingAvailable = t.isWebRTCStreamingAvailable = t.isTHEOliveStreamingAvailable = t.isBrowserShareAvailable = t.isBetGeniusDRMnotAvailable = t.type = t.vendor = t.OS = undefined, function (e) {
        e.Android = "Android", e.iOS = "iOS";
      }(i || (t.OS = i = {})), t.vendor = {
        OPERA: "opera",
        CHROME: "chrome",
        SAFARI: "safari",
        FIREFOX: "firefox",
        MSIE: "msie",
        MSEDGE: "edge",
        MSEDGECHR: "edg/",
        UNKNOWN: "unknown"
      }, function (e) {
        e.Chrome = "google chrome", e.Edge = "microsoft edge";
      }(n || (n = {}));
      const s = navigator,
        a = ["", "-webkit-", "-moz-", "-o-", "-ms-"],
        c = null !== (r = null === (o = s.userAgentData) || undefined === o ? undefined : o.brands) && undefined !== r ? r : [],
        l = navigator.userAgent,
        getIOSVersion = () => {
          if (-1 === l.indexOf("iPhone") && -1 === l.indexOf("iPad")) return null;
          const e = /OS ([0-9]{1,2}\.[0-9]{1,2})/.exec(l.replace("_", "."));
          return e ? +e[1] : null;
        };
      t.type = (() => {
        const getUserAgentVendor = () => {
          const e = l.toLowerCase();
          return -1 !== e.indexOf(t.vendor.OPERA) || -1 !== e.indexOf("opr") ? t.vendor.OPERA : -1 !== e.indexOf(t.vendor.MSEDGE) ? t.vendor.MSEDGE : -1 !== e.indexOf(t.vendor.MSEDGECHR) ? t.vendor.MSEDGECHR : -1 !== e.indexOf(t.vendor.CHROME) ? t.vendor.CHROME : -1 !== e.indexOf(t.vendor.SAFARI) ? t.vendor.SAFARI : -1 !== e.indexOf(t.vendor.FIREFOX) ? t.vendor.FIREFOX : -1 !== e.indexOf(t.vendor.MSIE) || e.indexOf("trident/") > 0 ? t.vendor.MSIE : t.vendor.UNKNOWN;
        };
        return (() => {
          const searchBrands = e => {
            for (const t of c) if (t.brand.toLowerCase().indexOf(e) > -1) return true;
            return false;
          };
          return searchBrands(n.Chrome) ? t.vendor.CHROME : searchBrands(n.Edge) ? t.vendor.MSEDGECHR : getUserAgentVendor();
        })();
      })(), t.isBetGeniusDRMnotAvailable = (() => {
        if ((t.type === t.vendor.SAFARI || t.type === t.vendor.UNKNOWN) && (l.indexOf("iPhone") > -1 || l.indexOf("iPad") > -1)) {
          const e = getIOSVersion();
          return null !== e && e < 15.7;
        }
        return false;
      })();
      t.isBrowserShareAvailable = () => undefined !== navigator.share, t.isTHEOliveStreamingAvailable = (() => {
        if (l.indexOf("iPhone") > -1 || l.indexOf("iPad") > -1) {
          const e = getIOSVersion();
          return null !== e && e >= 17.1;
        }
        return true;
      })(), t.isWebRTCStreamingAvailable = !(-1 !== l.indexOf("OS 12_") || !(s.getUserMedia || s.webkitGetUserMedia || s.mozGetUserMedia || s.msGetUserMedia || window.RTCPeerConnection)), t.isLeapWebRTCStreamingAvailable = !!(s.getUserMedia || s.webkitGetUserMedia || s.mozGetUserMedia || s.msGetUserMedia || window.RTCPeerConnection), t.getOSDetails = (() => {
        if (-1 !== l.indexOf("iPhone") || -1 !== l.indexOf("iPad")) {
          const e = /OS ([0-9]{1,2}\.[0-9]{1,2})/.exec(l.replace("_", ".")),
            t = parseFloat(null == e ? undefined : e[1]);
          return !t || isNaN(t) ? ($log("Browser: Unable to parse OS version"), false) : {
            deviceType: i.iOS,
            version: t
          };
        }
        if (-1 !== l.indexOf("Android")) {
          const e = /Android\s(\d+)/.exec(l),
            t = parseFloat(null == e ? undefined : e[1]);
          return !t || isNaN(t) ? ($log("Browser: Unable to parse OS version"), false) : {
            deviceType: i.Android,
            version: t
          };
        }
        return false;
      })();
      t.meetsMinimumOSVersion = (e, o) => !t.getOSDetails || !(t.getOSDetails.deviceType === i.Android && parseFloat(o) > t.getOSDetails.version || t.getOSDetails.deviceType === i.iOS && parseFloat(e) > t.getOSDetails.version), t.isFantasySportsAvailable = (() => {
        if (-1 === l.indexOf("iPhone") && -1 === l.indexOf("iPad")) return true;
        const e = getIOSVersion();
        return null === e || e > 13.3;
      })(), t.isScrollSnapTogglingSupported = (() => {
        if (-1 === l.indexOf("iPhone") && -1 === l.indexOf("iPad")) return true;
        const e = getIOSVersion();
        return null === e || e >= 15;
      })(), t.isVideoStreamingSupported = -1 === l.indexOf("UCBrowser"), t.isMP4StreamingAvailable = (() => {
        const e = document.createElement("video");
        return !!e.canPlayType && e.canPlayType("video/mp4").length > 0;
      })();
      t.isHLSNativeStreamingAvailable = (e, o) => {
        if (!e && t.type !== t.vendor.SAFARI) return false;
        if (e && o) return false;
        const r = document.createElement("video");
        return /android/i.test(l) ? !!r.canPlayType && "probably" === r.canPlayType("application/vnd.apple.mpegurl") : !!r.canPlayType && "" !== r.canPlayType("application/vnd.apple.mpegurl");
      };
      t.isHLSStreamingAvailable = (e, o) => {
        if ((0, t.isHLSNativeStreamingAvailable)(e, o)) return true;
        if ("undefined" == typeof MediaSource && undefined === window.WebKitMediaSource) return false;
        const r = "undefined" != typeof MediaSource ? MediaSource : window.WebKitMediaSource;
        return undefined !== r && "function" == typeof r.isTypeSupported && r.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
      }, t.hasMomentumScrolling = ((e, t, o, r) => {
        const i = e + ":",
          n = document.createElement(o || "div").style;
        n.cssText = r ? i + t : a.join(i + t + ";") + i + t + ";" + i + a.join(t + ";" + i) + t + ";";
        const s = !!n.length;
        return n.cssText = "", s;
      })("-webkit-overflow-scrolling", "touch", undefined, true), t.MOBILE_DEVICE_PREFIX = "M", t.TABLET_DEVICE_PREFIX = "T";
      let d;
      t.getDeviceStylePrefix = () => {
        var e, o, r, i;
        if (d) return d;
        const n = null !== (i = null === (r = null === (o = null === (e = window.ns_gen5_ui) || undefined === e ? undefined : e.Application) || undefined === o ? undefined : o.currentApplication) || undefined === r ? undefined : r.width) && undefined !== i ? i : window.innerWidth;
        return d = n >= 767 ? t.TABLET_DEVICE_PREFIX : t.MOBILE_DEVICE_PREFIX, d;
      };
      t.getPlatform = () => window.navigator.platform.toLowerCase(), t.isHLSDRMAvailable = t.type === t.vendor.SAFARI && window.navigator.platform.toLowerCase().indexOf("mac") > -1 || window.navigator.userAgent.toLowerCase().indexOf("ipad") > -1 || window.navigator.platform.toLowerCase().indexOf("iphone") > -1;
      t.getGeolocation = () => window.navigator.geolocation;
      t.geolocationPermissions = (e, o, r, i) => {
        navigator.permissions ? navigator.permissions.query({
          name: "geolocation"
        }).then(t => {
          "granted" === t.state ? e() : "denied" === t.state ? o() : "prompt" === t.state && (o(), t.onchange = () => {
            r();
          });
        }) : (0, t.getGeolocation)().getCurrentPosition(e, o, i);
      };
      t.getScrollY = () => {
        const e = undefined !== window.pageXOffset,
          t = "CSS1Compat" === (document.compatMode || "");
        return e ? window.pageYOffset : t ? document.documentElement.scrollTop : document.body.scrollTop;
      }, t.getPrefixedStyleName = (() => {
        const e = document.createElement("div").style,
          t = {};
        return o => {
          const r = t[o];
          if (r) return r;
          for (const r of a) {
            const i = r + (o || "");
            if ("" === e[i]) return t[o] = i, i;
          }
          return null;
        };
      })(), t.supportsNotifications = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && "ServiceWorkerRegistration" in window && "PushSubscription" in window && Object.prototype.hasOwnProperty.call(ServiceWorkerRegistration.prototype, "showNotification") && Object.prototype.hasOwnProperty.call(PushSubscription.prototype, "getKey") && t.type === t.vendor.CHROME, t.browser = {
        vendor: t.vendor,
        type: t.type,
        isBetGeniusDRMnotAvailable: t.isBetGeniusDRMnotAvailable,
        isBrowserShareAvailable: t.isBrowserShareAvailable,
        isTHEOliveStreamingAvailable: t.isTHEOliveStreamingAvailable,
        isWebRTCStreamingAvailable: t.isWebRTCStreamingAvailable,
        isLeapWebRTCStreamingAvailable: t.isLeapWebRTCStreamingAvailable,
        getOSDetails: t.getOSDetails,
        meetsMinimumOSVersion: t.meetsMinimumOSVersion,
        isFantasySportsAvailable: t.isFantasySportsAvailable,
        isScrollSnapTogglingSupported: t.isScrollSnapTogglingSupported,
        isVideoStreamingSupported: t.isVideoStreamingSupported,
        isMP4StreamingAvailable: t.isMP4StreamingAvailable,
        isHLSNativeStreamingAvailable: t.isHLSNativeStreamingAvailable,
        isHLSStreamingAvailable: t.isHLSStreamingAvailable,
        hasMomentumScrolling: t.hasMomentumScrolling,
        getDeviceStylePrefix: t.getDeviceStylePrefix,
        getPlatform: t.getPlatform,
        isHLSDRMAvailable: t.isHLSDRMAvailable,
        getGeolocation: t.getGeolocation,
        geolocationPermissions: t.geolocationPermissions,
        getScrollY: t.getScrollY,
        getPrefixedStyleName: t.getPrefixedStyleName,
        supportsNotifications: t.supportsNotifications,
        MOBILE_DEVICE_PREFIX: t.MOBILE_DEVICE_PREFIX,
        TABLET_DEVICE_PREFIX: t.TABLET_DEVICE_PREFIX
      };
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.AccessibilityContext = undefined;
      const r = o(0);
      t.AccessibilityContext = (0, r.createContext)(undefined), t.AccessibilityContext.displayName = "AccessibilityContext";
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.BrowserContext = undefined;
      const r = o(0);
      t.BrowserContext = (0, r.createContext)(undefined), t.BrowserContext.displayName = "PostBootReactLib.BrowserContext";
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.LoginContext = undefined;
      const r = o(0);
      t.LoginContext = (0, r.createContext)(undefined), t.LoginContext.displayName = "PostBootReactLib.LoginContext";
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.PasscodeContext = undefined;
      const r = o(0);
      t.PasscodeContext = (0, r.createContext)(undefined), t.PasscodeContext.displayName = "PostBootReactLib.PasscodeContext";
    }, (e, t) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.ccrmStore = undefined;
      let o = false,
        r = false;
      const i = new Set();
      t.ccrmStore = {
        getCanShowOffersStatus: () => o,
        isCanShowOffersStatusSet: () => r,
        subscribe: e => (i.add(e), () => i.delete(e)),
        setCanShowOffersStatus(e) {
          o = e, r = true, i.forEach(e => {
            e();
          });
        }
      };
    }, (e, t) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.loginStore = undefined;
      const o = new Set();
      let r = {
          showLogin: false,
          availableLoginTypes: [],
          loginType: null,
          disableMask: false
        },
        i = null;
      t.loginStore = {
        setState(e) {
          r = Object.assign(Object.assign({}, r), e), o.forEach(e => e());
        },
        subscribe: e => (o.add(e), () => {
          o.delete(e);
        }),
        getSnapshot: () => r,
        registerLogoutHandler(e) {
          i = e;
        },
        logout(e, t) {
          i ? i(e, t) : $assert && $assert(i, "Logout handler not registered.");
        }
      };
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.oddsStore = undefined;
      let r = o(15).OddsType.FRACTIONAL;
      const i = new Set();
      t.oddsStore = {
        getOddsTypeId: () => r,
        subscribe: e => (i.add(e), () => i.delete(e)),
        setOddsTypeId(e) {
          r = e, i.forEach(e => {
            e();
          });
        }
      };
    }, (e, t) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.passcodeStore = undefined;
      const o = new Set();
      let r = {
        passcodeState: null,
        isPasscodeSupported: false,
        isPasscodeEnabled: false
      };
      t.passcodeStore = {
        setState(e) {
          r = Object.assign(Object.assign({}, r), e), o.forEach(e => e());
        },
        subscribe: e => (o.add(e), () => {
          o.delete(e);
        }),
        getSnapshot: () => r
      };
    }, t => {
      "use strict";

      t.exports = e;
    }, function (e, t, o) {
      "use strict";

      var r = this && this.__importDefault || function (e) {
        return e && e.__esModule ? e : {
          default: e
        };
      };
      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.AccessibilityAnchor = undefined;
      const i = o(1),
        n = o(0),
        s = o(3),
        a = o(11),
        c = r(o(17));
      t.AccessibilityAnchor = () => {
        const {
            enableAccessibility: e,
            isEnabled: t
          } = (0, n.useContext)(s.AccessibilityContext),
          o = (0, a.getML)("EnableAccessibility");
        return t ? null : (0, i.jsx)("div", {
          className: c.default.accessibilityAnchor,
          "aria-label": o,
          role: "link",
          tabIndex: 0,
          onFocus: e,
          onClick: e
        });
      }, t.AccessibilityAnchor.displayName = "PostBootReactLib.AccessibilityAnchor";
    }, function (e, t, o) {
      "use strict";

      var r = this && this.__importDefault || function (e) {
        return e && e.__esModule ? e : {
          default: e
        };
      };
      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.ErrorFallback = undefined;
      const i = o(1),
        n = o(11),
        s = r(o(18));
      t.ErrorFallback = () => {
        const e = (0, n.getML)("UnableToDisplayThisContent");
        return (0, i.jsx)("div", {
          className: s.default.errorContainer,
          children: (0, i.jsx)("div", {
            className: s.default.errorMessage,
            children: e
          })
        });
      }, t.ErrorFallback.displayName = "PostBootReactLib.ErrorFallback";
    }, (e, t) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.getScrollLock = undefined;
      let o = false,
        r = 0,
        i = null;
      const n = "g5-Application-scrolllock",
        getAppElement = () => (i || (i = document.body), i),
        lockScrolling = () => {
          if (o) return;
          const e = getAppElement();
          r = document.documentElement.scrollTop, e.style.top = `-${r}px`, e.classList.add(n), o = true;
        },
        unlockScrolling = () => {
          if (!o) return;
          const e = getAppElement();
          o = false, e.style.top = "", e.classList.remove(n), window.scrollTo(0, r), r = 0;
        };
      t.getScrollLock = () => ({
        scrollPos: r,
        isScrollLocked: o,
        lockScrolling,
        unlockScrolling
      });
    }, (e, t) => {
      "use strict";

      var o;
      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.OddsType = undefined, function (e) {
        e[e.UNSET = 0] = "UNSET", e[e.FRACTIONAL = 1] = "FRACTIONAL", e[e.DECIMAL = 2] = "DECIMAL", e[e.AMERICAN = 3] = "AMERICAN", e[e.AMERICANFRACTIONAL = 4] = "AMERICANFRACTIONAL";
      }(o || (t.OddsType = o = {}));
    }, (e, t) => {
      "use strict";

      let o;
      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.mouseDetector = undefined;
      const r = [];
      let i = false,
        n = false,
        s = 0,
        a = null,
        c = false;
      const touchStartHandler = () => {
          if (n = true, s = Date.now(), i) {
            i = false, o && o.setItem("ns_webconsolelib_util.inputType", "touch");
            for (const e of r) e.mouseModeDisabled();
            null == a || a.RecordMouseMode(false);
          }
        },
        touchEndHandler = () => {
          s = Date.now();
        },
        mouseMoveHandler = () => {
          if (!(i || Date.now() - s < 1500)) {
            s = 0, n = false, i = true, o && o.setItem("ns_webconsolelib_util.inputType", "mouse");
            for (const e of r) e.mouseModeEnabled();
            null == a || a.RecordMouseMode(true);
          }
        };
      t.mouseDetector = {
        addDelegate: e => {
          $assert && $assert(e, "The delegate did not exist"), $assert && $assert(-1 == r.indexOf(e), "The delegate is already added"), r.push(e), i && e.mouseModeEnabled();
        },
        removeDelegate: e => {
          const t = r.indexOf(e);
          $assert && $assert(e && t > -1, "The delegate did not exist"), r.splice(t, 1);
        },
        initialise: e => {
          if (c) return;
          if (a = e, null == a ? undefined : a.Replaying) return;
          let t;
          o = window.safeSessionStorage, c = true, o && (t = o.getItem("ns_webconsolelib_util.inputType")), t ? (n = "touch" === t, i = "mouse" === t) : (n = (() => {
            if ("PointerEvent" in window && "maxTouchPoints" in navigator) {
              if (navigator.maxTouchPoints > 0) return true;
            } else {
              if (window.matchMedia && window.matchMedia("(any-pointer:coarse)").matches) return true;
              if ("TouchEvent" in window || "ontouchstart" in window) return true;
            }
            return false;
          })(), i = !n), document.body.addEventListener("mousemove", mouseMoveHandler), document.body.addEventListener("touchstart", touchStartHandler), document.body.addEventListener("touchend", touchEndHandler), null == a || a.RecordMouseMode(i);
        },
        overrideMouseModeStateForReplay: e => {
          i = e, n = !e;
          for (const t of r) e ? t.mouseModeEnabled() : t.mouseModeDisabled();
        }
      };
    }, e => {
      e.exports = {
        accessibilityAnchor: "brl-e9384d"
      };
    }, e => {
      e.exports = {
        errorContainer: "brl-b7e30e",
        errorMessage: "brl-57123e"
      };
    },, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.ccrmStoreGen5 = undefined;
      const r = o(7);
      t.ccrmStoreGen5 = r.ccrmStore;
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.getScrollLockGen5 = undefined;
      const r = o(14);
      t.getScrollLockGen5 = r.getScrollLock;
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.loginStoreGen5 = undefined;
      const r = o(8);
      t.loginStoreGen5 = r.loginStore;
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.oddsStoreGen5 = undefined;
      const r = o(9);
      t.oddsStoreGen5 = r.oddsStore;
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.passcodeStoreGen5 = undefined;
      const r = o(10);
      t.passcodeStoreGen5 = r.passcodeStore;
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.BrowserFeatureDetection = undefined;
      const r = o(2);
      class BrowserFeatureDetection {
        static meetsMinimumOSVersion(e, t) {
          return (0, r.meetsMinimumOSVersion)(e, t);
        }
        static isHLSNativeStreamingAvailable(e, t) {
          return (0, r.isHLSNativeStreamingAvailable)(e, t);
        }
        static isHLSStreamingAvailable(e, t) {
          return (0, r.isHLSStreamingAvailable)(e, t);
        }
        static getDeviceStylePrefix() {
          return (0, r.getDeviceStylePrefix)();
        }
        static getPlatform() {
          return (0, r.getPlatform)();
        }
        static getGeolocation() {
          return (0, r.getGeolocation)();
        }
        static geolocationPermissions(e, t, o, i) {
          (0, r.geolocationPermissions)(e, t, o, i);
        }
        static getScrollY() {
          return (0, r.getScrollY)();
        }
        static getPrefixedStyleName(e) {
          return (0, r.getPrefixedStyleName)(e);
        }
      }
      t.BrowserFeatureDetection = BrowserFeatureDetection, BrowserFeatureDetection.vendor = r.vendor, BrowserFeatureDetection.type = r.type, BrowserFeatureDetection.isBetGeniusDRMnotAvailable = r.isBetGeniusDRMnotAvailable, BrowserFeatureDetection.isBrowserShareAvailable = r.isBrowserShareAvailable, BrowserFeatureDetection.isTHEOliveStreamingAvailable = r.isTHEOliveStreamingAvailable, BrowserFeatureDetection.isWebRTCStreamingAvailable = r.isWebRTCStreamingAvailable, BrowserFeatureDetection.isLeapWebRTCStreamingAvailable = r.isLeapWebRTCStreamingAvailable, BrowserFeatureDetection.getOSDetails = r.getOSDetails, BrowserFeatureDetection.isFantasySportsAvailable = r.isFantasySportsAvailable, BrowserFeatureDetection.isScrollSnapTogglingSupported = r.isScrollSnapTogglingSupported, BrowserFeatureDetection.isVideoStreamingSupported = r.isVideoStreamingSupported, BrowserFeatureDetection.isMP4StreamingAvailable = r.isMP4StreamingAvailable, BrowserFeatureDetection.hasMomentumScrolling = r.hasMomentumScrolling, BrowserFeatureDetection.isHLSDRMAvailable = r.isHLSDRMAvailable, BrowserFeatureDetection.supportsNotifications = r.supportsNotifications, BrowserFeatureDetection.MOBILE_DEVICE_PREFIX = r.MOBILE_DEVICE_PREFIX, BrowserFeatureDetection.TABLET_DEVICE_PREFIX = r.TABLET_DEVICE_PREFIX;
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.MouseDetector = undefined;
      const r = o(16);
      t.MouseDetector = class MouseDetector {
        static Init(e) {
          r.mouseDetector.initialise(e);
        }
        static OverrideDetectionStateForReplay(e) {
          r.mouseDetector.overrideMouseModeStateForReplay(e);
        }
        static AddDelegate(e) {
          r.mouseDetector.addDelegate(e);
        }
        static RemoveDelegate(e) {
          r.mouseDetector.removeDelegate(e);
        }
      };
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.useBrowserContext = undefined;
      const r = o(0),
        i = o(4);
      t.useBrowserContext = () => {
        const e = (0, r.useContext)(i.BrowserContext);
        return undefined === e && $assert && $assert(e, "useBrowserContext must be used within a BrowserContextProvider"), e;
      };
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.useCCRM = undefined;
      const r = o(7),
        i = o(0);
      t.useCCRM = () => ({
        canShowOffersStatus: (0, i.useSyncExternalStore)(r.ccrmStore.subscribe, r.ccrmStore.getCanShowOffersStatus),
        setCanShowOffersStatus: e => {
          r.ccrmStore.setCanShowOffersStatus(e);
        }
      });
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.useLoginContext = undefined;
      const r = o(0),
        i = o(5);
      t.useLoginContext = () => {
        const e = (0, r.useContext)(i.LoginContext);
        return undefined === e && $assert && $assert(e, "useLoginContext must be used within a LoginContextProvider"), e;
      };
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.useOdds = undefined;
      const r = o(0),
        i = o(9);
      t.useOdds = () => {
        const e = (0, r.useSyncExternalStore)(i.oddsStore.subscribe, i.oddsStore.getOddsTypeId),
          t = (0, r.useCallback)(e => {
            i.oddsStore.setOddsTypeId(e);
          }, []);
        return {
          oddsTypeId: e,
          setOddsTypeId: t
        };
      };
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.usePasscode = undefined;
      const r = o(0),
        i = o(6);
      t.usePasscode = () => {
        const e = (0, r.useContext)(i.PasscodeContext);
        return undefined === e && $assert && $assert(e, "usePasscode must be used within a PasscodeContextProvider"), Object.assign({}, e);
      };
    }, (e, t) => {
      "use strict";

      var o;
      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.AuthenticationTypes = undefined, function (e) {
        e.Standard = "Standard", e.Pin = "Pin", e.KML = "KML", e.RememberUser = "RememberUser";
      }(o || (t.AuthenticationTypes = o = {}));
    }, (e, t) => {
      "use strict";

      var o;
      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.LoginType = undefined, function (e) {
        e[e.DEFAULT = 0] = "DEFAULT", e[e.MY_TEAMS = 1] = "MY_TEAMS", e[e.STREAM = 2] = "STREAM", e[e.OTHERS_ON_REQUEST = 3] = "OTHERS_ON_REQUEST", e[e.FAVOURITES = 4] = "FAVOURITES", e[e.BETSLIP = 5] = "BETSLIP";
      }(o || (t.LoginType = o = {}));
    }, (e, t) => {
      "use strict";

      var o;
      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.PasscodeStates = undefined, function (e) {
        e.OFFER = "Offer", e.SETUP = "Setup", e.SETUP_SUCCESS = "SetupSuccess", e.SETUP_FAILED = "SetupFailed", e.LOGIN = "Login", e.FORGOTTEN = "Forgotten", e.NOT_AUTHORISED = "NotAuthorised", e.LOGIN_FAILED = "LoginFailed";
      }(o || (t.PasscodeStates = o = {}));
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.AccessibilityContextProvider = undefined;
      const r = o(1),
        i = o(0),
        n = o(3);
      t.AccessibilityContextProvider = ({
        children: e
      }) => {
        const [t, o] = (0, i.useState)(false),
          enableAccessibility = () => {
            var e, r, i, n, s;
            t || ((null === (e = window.ns_gen5_ui_accessibility) || undefined === e ? undefined : e.AccessibilityController) && (null === (i = (r = window.ns_gen5_ui_accessibility.AccessibilityController).RegisterFocusStyles) || undefined === i || i.call(r, ":focus { box-shadow: 0 0 0 1px #ccc inset; outline: 1px solid transparent; }"), null === (s = (n = window.ns_gen5_ui_accessibility.AccessibilityController).EnableAccessibility) || undefined === s || s.call(n)), o(true));
          };
        return (0, i.useEffect)(() => (window.bet365.messageBus.registerRequestHandler("accessibility.enable", ({
          enabled: e
        }) => {
          (e => {
            e ? enableAccessibility() : o(false);
          })(e);
        }), () => {
          window.bet365.messageBus.removeRequestHandler("accessibility.enable");
        }), [t]), (0, i.useEffect)(() => {
          t && window.bet365.messageBus.broadcastEvent("accessibility.enabled");
        }, [t]), (0, r.jsx)(n.AccessibilityContext.Provider, {
          value: {
            isEnabled: t,
            enableAccessibility,
            setIsEnabled: o
          },
          children: e
        });
      }, t.AccessibilityContextProvider.displayName = "PostBootReactLib.AccessibilityContextProvider";
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.BrowserContextProvider = undefined;
      const r = o(1),
        i = o(4),
        n = o(2);
      t.BrowserContextProvider = ({
        children: e
      }) => (0, r.jsx)(i.BrowserContext.Provider, {
        value: n.browser,
        children: e
      }), t.BrowserContextProvider.displayName = "PostBootReactLib.BrowserContextProvider";
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.LoginContextProvider = undefined;
      const r = o(1),
        i = o(0),
        n = o(5),
        s = o(8);
      t.LoginContextProvider = ({
        children: e
      }) => {
        const t = (0, i.useSyncExternalStore)(s.loginStore.subscribe, s.loginStore.getSnapshot),
          {
            getSnapshot: o
          } = s.loginStore,
          a = (0, i.useCallback)(e => {
            s.loginStore.setState(e);
          }, []);
        return (0, r.jsx)(n.LoginContext.Provider, {
          value: Object.assign(Object.assign({}, t), {
            setState: a,
            getSnapshot: o
          }),
          children: e
        });
      }, t.LoginContextProvider.displayName = "PostBootReactLib.LoginContextProvider";
    }, (e, t, o) => {
      "use strict";

      Object.defineProperty(t, "__esModule", {
        value: true
      }), t.PasscodeContextProvider = undefined;
      const r = o(1),
        i = o(0),
        n = o(6),
        s = o(10);
      t.PasscodeContextProvider = ({
        children: e
      }) => {
        const t = (0, i.useSyncExternalStore)(s.passcodeStore.subscribe, s.passcodeStore.getSnapshot),
          {
            getSnapshot: o
          } = s.passcodeStore,
          a = (0, i.useCallback)(e => {
            s.passcodeStore.setState({
              passcodeState: e
            });
          }, []),
          c = (0, i.useCallback)(e => {
            s.passcodeStore.setState({
              isPasscodeSupported: e
            });
          }, []),
          l = (0, i.useCallback)(() => {
            s.passcodeStore.setState({
              isPasscodeEnabled: true
            });
          }, []),
          d = (0, i.useCallback)(() => {
            s.passcodeStore.setState({
              isPasscodeEnabled: false
            });
          }, []);
        return (0, r.jsx)(n.PasscodeContext.Provider, {
          value: Object.assign(Object.assign({}, t), {
            setPasscodeState: a,
            setIsPasscodeSupported: c,
            disablePasscode: d,
            enablePasscode: l,
            getSnapshot: o
          }),
          children: e
        });
      }, t.PasscodeContextProvider.displayName = "PostBootReactLib.PasscodeContextProvider";
    }],
    r = {};
  function __webpack_require__(e) {
    var t = r[e];
    if (undefined !== t) return t.exports;
    var i = r[e] = {
      exports: {}
    };
    return o[e].call(i.exports, i, i.exports, __webpack_require__), i.exports;
  }
  var i = {};
  (() => {
    "use strict";

    var e = i;
    Object.defineProperty(e, "__esModule", {
      value: true
    }), e.PasscodeContextProvider = e.LoginContextProvider = e.BrowserContextProvider = e.AccessibilityContextProvider = e.ErrorFallback = e.AccessibilityAnchor = e.mouseDetector = e.getScrollLock = e.getML = e.browser = e.PasscodeStates = e.OddsType = e.LoginType = e.AuthenticationTypes = e.passcodeStore = e.oddsStore = e.loginStore = e.ccrmStore = e.usePasscode = e.useOdds = e.useLoginContext = e.useCCRM = e.useBrowserContext = e.MouseDetector = e.BrowserFeatureDetection = e.passcodeStoreGen5 = e.oddsStoreGen5 = e.loginStoreGen5 = e.getScrollLockGen5 = e.ccrmStoreGen5 = e.PasscodeContext = e.LoginContext = e.BrowserContext = e.AccessibilityContext = undefined;
    var t = __webpack_require__(3);
    Object.defineProperty(e, "AccessibilityContext", {
      enumerable: true,
      get: function () {
        return t.AccessibilityContext;
      }
    });
    var o = __webpack_require__(4);
    Object.defineProperty(e, "BrowserContext", {
      enumerable: true,
      get: function () {
        return o.BrowserContext;
      }
    });
    var r = __webpack_require__(5);
    Object.defineProperty(e, "LoginContext", {
      enumerable: true,
      get: function () {
        return r.LoginContext;
      }
    });
    var n = __webpack_require__(6);
    Object.defineProperty(e, "PasscodeContext", {
      enumerable: true,
      get: function () {
        return n.PasscodeContext;
      }
    });
    var s = __webpack_require__(20);
    Object.defineProperty(e, "ccrmStoreGen5", {
      enumerable: true,
      get: function () {
        return s.ccrmStoreGen5;
      }
    });
    var a = __webpack_require__(21);
    Object.defineProperty(e, "getScrollLockGen5", {
      enumerable: true,
      get: function () {
        return a.getScrollLockGen5;
      }
    });
    var c = __webpack_require__(22);
    Object.defineProperty(e, "loginStoreGen5", {
      enumerable: true,
      get: function () {
        return c.loginStoreGen5;
      }
    });
    var l = __webpack_require__(23);
    Object.defineProperty(e, "oddsStoreGen5", {
      enumerable: true,
      get: function () {
        return l.oddsStoreGen5;
      }
    });
    var d = __webpack_require__(24);
    Object.defineProperty(e, "passcodeStoreGen5", {
      enumerable: true,
      get: function () {
        return d.passcodeStoreGen5;
      }
    });
    var u = __webpack_require__(25);
    Object.defineProperty(e, "BrowserFeatureDetection", {
      enumerable: true,
      get: function () {
        return u.BrowserFeatureDetection;
      }
    });
    var b = __webpack_require__(26);
    Object.defineProperty(e, "MouseDetector", {
      enumerable: true,
      get: function () {
        return b.MouseDetector;
      }
    });
    var p = __webpack_require__(27);
    Object.defineProperty(e, "useBrowserContext", {
      enumerable: true,
      get: function () {
        return p.useBrowserContext;
      }
    });
    var v = __webpack_require__(28);
    Object.defineProperty(e, "useCCRM", {
      enumerable: true,
      get: function () {
        return v.useCCRM;
      }
    });
    var S = __webpack_require__(29);
    Object.defineProperty(e, "useLoginContext", {
      enumerable: true,
      get: function () {
        return S.useLoginContext;
      }
    });
    var _ = __webpack_require__(30);
    Object.defineProperty(e, "useOdds", {
      enumerable: true,
      get: function () {
        return _.useOdds;
      }
    });
    var g = __webpack_require__(31);
    Object.defineProperty(e, "usePasscode", {
      enumerable: true,
      get: function () {
        return g.usePasscode;
      }
    });
    var f = __webpack_require__(7);
    Object.defineProperty(e, "ccrmStore", {
      enumerable: true,
      get: function () {
        return f.ccrmStore;
      }
    });
    var m = __webpack_require__(8);
    Object.defineProperty(e, "loginStore", {
      enumerable: true,
      get: function () {
        return m.loginStore;
      }
    });
    var P = __webpack_require__(9);
    Object.defineProperty(e, "oddsStore", {
      enumerable: true,
      get: function () {
        return P.oddsStore;
      }
    });
    var y = __webpack_require__(10);
    Object.defineProperty(e, "passcodeStore", {
      enumerable: true,
      get: function () {
        return y.passcodeStore;
      }
    });
    var w = __webpack_require__(32);
    Object.defineProperty(e, "AuthenticationTypes", {
      enumerable: true,
      get: function () {
        return w.AuthenticationTypes;
      }
    });
    var O = __webpack_require__(33);
    Object.defineProperty(e, "LoginType", {
      enumerable: true,
      get: function () {
        return O.LoginType;
      }
    });
    var C = __webpack_require__(15);
    Object.defineProperty(e, "OddsType", {
      enumerable: true,
      get: function () {
        return C.OddsType;
      }
    });
    var A = __webpack_require__(34);
    Object.defineProperty(e, "PasscodeStates", {
      enumerable: true,
      get: function () {
        return A.PasscodeStates;
      }
    });
    var E = __webpack_require__(2);
    Object.defineProperty(e, "browser", {
      enumerable: true,
      get: function () {
        return E.browser;
      }
    });
    var x = __webpack_require__(11);
    Object.defineProperty(e, "getML", {
      enumerable: true,
      get: function () {
        return x.getML;
      }
    });
    var M = __webpack_require__(14);
    Object.defineProperty(e, "getScrollLock", {
      enumerable: true,
      get: function () {
        return M.getScrollLock;
      }
    });
    var L = __webpack_require__(16);
    Object.defineProperty(e, "mouseDetector", {
      enumerable: true,
      get: function () {
        return L.mouseDetector;
      }
    });
    var T = __webpack_require__(12);
    Object.defineProperty(e, "AccessibilityAnchor", {
      enumerable: true,
      get: function () {
        return T.AccessibilityAnchor;
      }
    });
    var R = __webpack_require__(13);
    Object.defineProperty(e, "ErrorFallback", {
      enumerable: true,
      get: function () {
        return R.ErrorFallback;
      }
    });
    var D = __webpack_require__(35);
    Object.defineProperty(e, "AccessibilityContextProvider", {
      enumerable: true,
      get: function () {
        return D.AccessibilityContextProvider;
      }
    });
    var h = __webpack_require__(36);
    Object.defineProperty(e, "BrowserContextProvider", {
      enumerable: true,
      get: function () {
        return h.BrowserContextProvider;
      }
    });
    var B = __webpack_require__(37);
    Object.defineProperty(e, "LoginContextProvider", {
      enumerable: true,
      get: function () {
        return B.LoginContextProvider;
      }
    });
    var j = __webpack_require__(38);
    Object.defineProperty(e, "PasscodeContextProvider", {
      enumerable: true,
      get: function () {
        return j.PasscodeContextProvider;
      }
    });
  })(), t = i, window.PostBootReactLib = Object.assign(window.PostBootReactLib || {}, t), window.ns_postbootreactlib_util_featureDetection_mouseDetection = window.PostBootReactLib, window.ns_postbootreactlib_util_featureDetection_browser = window.PostBootReactLib, window.ns_postbootreactlib = window.PostBootReactLib;
})();
//# sourceMappingURL=/sports-assets/map/sports?m=brl&t=js&v=23