var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/papaparse/papaparse.min.js
var require_papaparse_min = __commonJS({
  "node_modules/papaparse/papaparse.min.js"(exports, module) {
    ((e, t) => {
      "function" == typeof define && define.amd ? define([], t) : "object" == typeof module && "undefined" != typeof exports ? module.exports = t() : e.Papa = t();
    })(exports, function r() {
      var n = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== n ? n : {};
      var s = !n.document && !!n.postMessage, a = n.IS_PAPA_WORKER || false, o = {}, h = 0, w = {};
      function q(e) {
        return 65279 === e.charCodeAt(0) ? e.slice(1) : e;
      }
      function u(e) {
        this._handle = null, this._finished = false, this._completed = false, this._halted = false, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = true, this._completeResults = { data: [], errors: [], meta: {} }, function(e2) {
          var t = E(e2);
          t.chunkSize = parseInt(t.chunkSize), e2.step || e2.chunk || (t.chunkSize = null);
          this._handle = new i(t), (this._handle.streamer = this)._config = t;
        }.call(this, e), this.parseChunk = function(t, e2) {
          var i2 = parseInt(this._config.skipFirstNLines) || 0;
          if (this.isFirstChunk && 0 < i2) {
            let e3 = this._config.newline;
            e3 || (r2 = this._config.quoteChar || '"', e3 = this._handle.guessLineEndings(t, r2)), t = [...t.split(e3).slice(i2)].join(e3);
          }
          this.isFirstChunk && U(this._config.beforeFirstChunk) && void 0 !== (r2 = this._config.beforeFirstChunk(t)) && (t = r2), this.isFirstChunk = false, this._halted = false;
          var i2 = this._partialLine + t, r2 = (this._partialLine = "", this._handle.parse(i2, this._baseIndex, !this._finished));
          if (!this._handle.paused() && !this._handle.aborted()) {
            t = r2.meta.cursor, i2 = (this._finished || (this._partialLine = i2.substring(t - this._baseIndex), this._baseIndex = t), r2 && r2.data && (this._rowCount += r2.data.length), this._finished || this._config.preview && this._rowCount >= this._config.preview);
            if (a) n.postMessage({ results: r2, workerId: w.WORKER_ID, finished: i2 });
            else if (U(this._config.chunk) && !e2) {
              if (this._config.chunk(r2, this._handle), this._handle.paused() || this._handle.aborted()) return void (this._halted = true);
              this._completeResults = r2 = void 0;
            }
            return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(r2.data), this._completeResults.errors = this._completeResults.errors.concat(r2.errors), this._completeResults.meta = r2.meta), this._completed || !i2 || !U(this._config.complete) || r2 && r2.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = true), i2 || r2 && r2.meta.paused || this._nextChunk(), r2;
          }
          this._halted = true;
        }, this._sendError = function(e2) {
          U(this._config.error) ? this._config.error(e2) : a && this._config.error && n.postMessage({ workerId: w.WORKER_ID, error: e2, finished: false });
        };
      }
      function d(e) {
        var r2;
        (e = e || {}).chunkSize || (e.chunkSize = w.RemoteChunkSize), u.call(this, e), this._nextChunk = s ? function() {
          this._readChunk(), this._chunkLoaded();
        } : function() {
          this._readChunk();
        }, this.stream = function(e2) {
          this._input = e2, this._nextChunk();
        }, this._readChunk = function() {
          if (this._finished) this._chunkLoaded();
          else {
            if (r2 = new XMLHttpRequest(), this._config.withCredentials && (r2.withCredentials = this._config.withCredentials), s || (r2.onload = m(this._chunkLoaded, this), r2.onerror = m(this._chunkError, this)), r2.ontimeout = m(this._chunkTimeout, this), r2.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !s), this._config.downloadTimeout && !s && (r2.timeout = this._config.downloadTimeout), this._config.downloadRequestHeaders) {
              var e2, t = this._config.downloadRequestHeaders;
              for (e2 in t) r2.setRequestHeader(e2, t[e2]);
            }
            var i2;
            this._config.chunkSize && (i2 = this._start + this._config.chunkSize - 1, r2.setRequestHeader("Range", "bytes=" + this._start + "-" + i2));
            try {
              r2.send(this._config.downloadRequestBody);
            } catch (e3) {
              this._chunkError(e3.message);
            }
            s && 0 === r2.status && this._chunkError();
          }
        }, this._chunkLoaded = function() {
          4 === r2.readyState && (r2.status < 200 || 400 <= r2.status ? this._chunkError() : (this._start += this._config.chunkSize || r2.responseText.length, this._finished = !this._config.chunkSize || this._start >= ((e2) => null !== (e2 = e2.getResponseHeader("Content-Range")) ? parseInt(e2.substring(e2.lastIndexOf("/") + 1)) : -1)(r2), this.parseChunk(r2.responseText)));
        }, this._chunkError = function(e2) {
          e2 = r2.statusText || e2;
          this._sendError(new Error(e2));
        }, this._chunkTimeout = function() {
          this._chunkError("Request timed out after " + this._config.downloadTimeout + "ms");
        };
      }
      function l(e) {
        (e = e || {}).chunkSize || (e.chunkSize = w.LocalChunkSize), u.call(this, e);
        var i2, r2, n2 = "undefined" != typeof FileReader;
        this.stream = function(e2) {
          this._input = e2, r2 = e2.slice || e2.webkitSlice || e2.mozSlice, n2 ? ((i2 = new FileReader()).onload = m(this._chunkLoaded, this), i2.onerror = m(this._chunkError, this)) : i2 = new FileReaderSync(), this._nextChunk();
        }, this._nextChunk = function() {
          this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
        }, this._readChunk = function() {
          var e2 = this._input, t = (this._config.chunkSize && (t = Math.min(this._start + this._config.chunkSize, this._input.size), e2 = r2.call(e2, this._start, t)), i2.readAsText(e2, this._config.encoding));
          n2 || this._chunkLoaded({ target: { result: t } });
        }, this._chunkLoaded = function(e2) {
          this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e2.target.result);
        }, this._chunkError = function() {
          this._sendError(i2.error);
        };
      }
      function f(e) {
        var i2;
        u.call(this, e = e || {}), this.stream = function(e2) {
          return i2 = e2, this._nextChunk();
        }, this._nextChunk = function() {
          var e2, t;
          if (!this._finished) return e2 = this._config.chunkSize, i2 = e2 ? (t = i2.substring(0, e2), i2.substring(e2)) : (t = i2, ""), this._finished = !i2, this.parseChunk(t);
        };
      }
      function c(e) {
        u.call(this, e = e || {});
        var t = [], i2 = true, r2 = false;
        this.pause = function() {
          u.prototype.pause.apply(this, arguments), this._input.pause();
        }, this.resume = function() {
          u.prototype.resume.apply(this, arguments), this._input.resume();
        }, this.stream = function(e2) {
          this._input = e2, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
        }, this._checkIsFinished = function() {
          r2 && 1 === t.length && (this._finished = true);
        }, this._nextChunk = function() {
          this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : i2 = true;
        }, this._streamData = m(function(e2) {
          try {
            t.push("string" == typeof e2 ? e2 : e2.toString(this._config.encoding)), i2 && (i2 = false, this._checkIsFinished(), this.parseChunk(t.shift()));
          } catch (e3) {
            this._streamError(e3);
          }
        }, this), this._streamError = m(function(e2) {
          this._streamCleanUp(), this._sendError(e2);
        }, this), this._streamEnd = m(function() {
          this._streamCleanUp(), r2 = true, this._streamData("");
        }, this), this._streamCleanUp = m(function() {
          this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
        }, this);
      }
      function i(m2) {
        var n2, s2, a2, t, o2 = Math.pow(2, 53), h2 = -o2, u2 = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, d2 = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, i2 = this, r2 = 0, l2 = 0, f2 = false, e = false, c2 = [], p2 = { data: [], errors: [], meta: {} };
        function y(e2) {
          return "greedy" === m2.skipEmptyLines ? "" === e2.join("").trim() : 1 === e2.length && 0 === e2[0].length;
        }
        function _2() {
          if (p2 && a2 && (k("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + w.DefaultDelimiter + "'"), a2 = false), m2.skipEmptyLines && (p2.data = p2.data.filter(function(e3) {
            return !y(e3);
          })), g2()) {
            let t3 = function(e3) {
              c2.push(e3);
            };
            var t2 = t3;
            if (p2) if (Array.isArray(p2.data[0])) {
              for (var e2 = 0; g2() && e2 < p2.data.length; e2++) p2.data[e2].forEach(t3);
              p2.data.splice(0, 1);
            } else p2.data.forEach(t3);
          }
          function i3(e3, t3) {
            for (var i4 = m2.header ? {} : [], r4 = 0; r4 < e3.length; r4++) {
              var n3 = r4, s3 = e3[r4], s3 = ((e4, t4) => ((e5) => (m2.dynamicTypingFunction && void 0 === m2.dynamicTyping[e5] && (m2.dynamicTyping[e5] = m2.dynamicTypingFunction(e5)), true === (m2.dynamicTyping[e5] || m2.dynamicTyping)))(e4) ? "true" === t4 || "TRUE" === t4 || "false" !== t4 && "FALSE" !== t4 && (((e5) => {
                if (u2.test(e5)) {
                  e5 = parseFloat(e5);
                  if (h2 < e5 && e5 < o2) return 1;
                }
              })(t4) ? parseFloat(t4) : d2.test(t4) ? new Date(t4) : "" === t4 ? null : t4) : t4)(n3 = m2.header ? r4 >= c2.length ? "__parsed_extra" : c2[r4] : n3, s3 = m2.transform ? m2.transform(s3, n3) : s3);
              "__parsed_extra" === n3 ? (i4[n3] = i4[n3] || [], i4[n3].push(s3)) : i4[n3] = s3;
            }
            return m2.header && (r4 > c2.length ? k("FieldMismatch", "TooManyFields", "Too many fields: expected " + c2.length + " fields but parsed " + r4, l2 + t3) : r4 < c2.length && k("FieldMismatch", "TooFewFields", "Too few fields: expected " + c2.length + " fields but parsed " + r4, l2 + t3)), i4;
          }
          var r3;
          p2 && (m2.header || m2.dynamicTyping || m2.transform) && (r3 = 1, !p2.data.length || Array.isArray(p2.data[0]) ? (p2.data = p2.data.map(i3), r3 = p2.data.length) : p2.data = i3(p2.data, 0), m2.header && p2.meta && (p2.meta.fields = c2), l2 += r3);
        }
        function g2() {
          return m2.header && 0 === c2.length;
        }
        function k(e2, t2, i3, r3) {
          e2 = { type: e2, code: t2, message: i3 };
          void 0 !== r3 && (e2.row = r3), p2.errors.push(e2);
        }
        U(m2.step) && (t = m2.step, m2.step = function(e2) {
          p2 = e2, g2() ? _2() : (_2(), 0 !== p2.data.length && (r2 += e2.data.length, m2.preview && r2 > m2.preview ? s2.abort() : (p2.data = p2.data[0], t(p2, i2))));
        }), this.parse = function(e2, t2, i3) {
          var r3 = m2.quoteChar || '"', r3 = (m2.newline || (m2.newline = this.guessLineEndings(e2, r3)), a2 = false, m2.delimiter ? U(m2.delimiter) && (m2.delimiter = m2.delimiter(e2), p2.meta.delimiter = m2.delimiter) : ((r3 = ((e3, t3, i4, r4, n3) => {
            var s3, a3, o3, h3;
            n3 = n3 || [",", "	", "|", ";", w.RECORD_SEP, w.UNIT_SEP];
            for (var u3 = 0; u3 < n3.length; u3++) {
              for (var d3, l3 = n3[u3], f3 = 0, c3 = 0, p3 = 0, _3 = (o3 = void 0, new b({ comments: r4, delimiter: l3, newline: t3, preview: 10 }).parse(e3)), g3 = 0; g3 < _3.data.length; g3++) i4 && y(_3.data[g3]) ? p3++ : (d3 = _3.data[g3].length, c3 += d3, void 0 === o3 ? o3 = d3 : 0 < d3 && (f3 += Math.abs(d3 - o3), o3 = d3));
              0 < _3.data.length && (c3 /= _3.data.length - p3), 1.99 < c3 && (void 0 === a3 || f3 < a3 || f3 === a3 && h3 < c3) && (a3 = f3, s3 = l3, h3 = c3);
            }
            return { successful: !!(m2.delimiter = s3), bestDelimiter: s3 };
          })(e2, m2.newline, m2.skipEmptyLines, m2.comments, m2.delimitersToGuess)).successful ? m2.delimiter = r3.bestDelimiter : (a2 = true, m2.delimiter = w.DefaultDelimiter), p2.meta.delimiter = m2.delimiter), E(m2));
          return r3.header = g2(), m2.preview && m2.header && r3.preview++, n2 = e2, s2 = new b(r3), p2 = s2.parse(n2, t2, i3), _2(), f2 ? { meta: { paused: true } } : p2 || { meta: { paused: false } };
        }, this.paused = function() {
          return f2;
        }, this.pause = function() {
          f2 = true, s2.abort(), n2 = U(m2.chunk) ? "" : n2.substring(s2.getCharIndex());
        }, this.resume = function() {
          i2.streamer._halted ? (f2 = false, i2.streamer.parseChunk(n2, true)) : setTimeout(i2.resume, 3);
        }, this.aborted = function() {
          return e;
        }, this.abort = function() {
          e = true, s2.abort(), p2.meta.aborted = true, U(m2.complete) && m2.complete(p2), n2 = "";
        }, this.guessLineEndings = function(e2, t2) {
          e2 = e2.substring(0, 1048576);
          var t2 = new RegExp(P(t2) + "([^]*?)" + P(t2), "gm"), i3 = (e2 = e2.replace(t2, "")).split("\r"), t2 = e2.split("\n"), e2 = 1 < t2.length && t2[0].length < i3[0].length;
          if (1 === i3.length || e2) return "\n";
          for (var r3 = 0, n3 = 0; n3 < i3.length; n3++) "\n" === i3[n3][0] && r3++;
          return r3 >= i3.length / 2 ? "\r\n" : "\r";
        };
      }
      function P(e) {
        return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      function b(C) {
        var S = (C = C || {}).delimiter, O = C.newline, x = C.comments, T = C.step, I = C.preview, A = C.fastMode, D = null, L = false, F = null == C.quoteChar ? '"' : C.quoteChar, z = F;
        if (void 0 !== C.escapeChar && (z = C.escapeChar), ("string" != typeof S || -1 < w.BAD_DELIMITERS.indexOf(S)) && (S = ","), x === S) throw new Error("Comment character same as delimiter");
        true === x ? x = "#" : ("string" != typeof x || -1 < w.BAD_DELIMITERS.indexOf(x)) && (x = false), "\n" !== O && "\r" !== O && "\r\n" !== O && (O = "\n");
        var M = 0, j = false;
        this.parse = function(i2, t, r2) {
          if ("string" != typeof i2) throw new Error("Input must be a string");
          var n2 = i2.length, e = S.length, s2 = O.length, a2 = x.length, o2 = U(T), h2 = [], u2 = [], d2 = [], l2 = M = 0;
          if (!i2) return v();
          if (A || false !== A && -1 === i2.indexOf(F)) {
            for (var f2 = i2.split(O), c2 = 0; c2 < f2.length; c2++) {
              if (d2 = f2[c2], M += d2.length, c2 !== f2.length - 1) M += O.length;
              else if (r2) return v();
              if (!x || d2.substring(0, a2) !== x) {
                if (o2) {
                  if (h2 = [], k(d2.split(S)), R(), j) return v();
                } else k(d2.split(S));
                if (I && I <= c2) return h2 = h2.slice(0, I), v(true);
              }
            }
            return v();
          }
          for (var p2 = i2.indexOf(S, M), _2 = i2.indexOf(O, M), g2 = new RegExp(P(z) + P(F), "g"), m2 = i2.indexOf(F, M); ; ) if (i2[M] === F) for (m2 = M, M++; ; ) {
            if (-1 === (m2 = i2.indexOf(F, m2 + 1))) return r2 || u2.push({ type: "Quotes", code: "MissingQuotes", message: "Quoted field unterminated", row: h2.length, index: M }), b3();
            if (m2 === n2 - 1) return b3(i2.substring(M, m2).replace(g2, F));
            if (F === z && i2[m2 + 1] === z) m2++;
            else if (F === z || 0 === m2 || i2[m2 - 1] !== z) {
              -1 !== p2 && p2 < m2 + 1 && (p2 = i2.indexOf(S, m2 + 1));
              var y = w2(-1 === (_2 = -1 !== _2 && _2 < m2 + 1 ? i2.indexOf(O, m2 + 1) : _2) ? p2 : Math.min(p2, _2));
              if (i2.substr(m2 + 1 + y, e) === S) {
                d2.push(i2.substring(M, m2).replace(g2, F)), i2[M = m2 + 1 + y + e] !== F && (m2 = i2.indexOf(F, M)), -1 !== p2 && p2 < M && (p2 = i2.indexOf(S, M)), -1 !== _2 && _2 < M && (_2 = i2.indexOf(O, M));
                break;
              }
              y = w2(_2);
              if (i2.substring(m2 + 1 + y, m2 + 1 + y + s2) === O) {
                if (d2.push(i2.substring(M, m2).replace(g2, F)), E2(m2 + 1 + y + s2), -1 !== p2 && p2 < M && (p2 = i2.indexOf(S, M)), m2 = i2.indexOf(F, M), o2 && (R(), j)) return v();
                if (I && h2.length >= I) return v(true);
                break;
              }
              u2.push({ type: "Quotes", code: "InvalidQuotes", message: "Trailing quote on quoted field is malformed", row: h2.length, index: M }), m2++;
            }
          }
          else if (x && 0 === d2.length && i2.substring(M, M + a2) === x) {
            if (-1 === _2) return v();
            M = _2 + s2, _2 = i2.indexOf(O, M), -1 !== p2 && p2 < M && (p2 = i2.indexOf(S, M));
          } else if (-1 !== p2 && (p2 < _2 || -1 === _2)) d2.push(i2.substring(M, p2)), M = p2 + e, p2 = i2.indexOf(S, M);
          else {
            if (-1 === _2) break;
            if (d2.push(i2.substring(M, _2)), E2(_2 + s2), o2 && (R(), j)) return v();
            if (I && h2.length >= I) return v(true);
          }
          return b3();
          function k(e2) {
            h2.push(e2), l2 = M;
          }
          function w2(e2) {
            var t2 = 0;
            return t2 = -1 !== e2 && (e2 = i2.substring(m2 + 1, e2)) && "" === e2.trim() ? e2.length : t2;
          }
          function b3(e2) {
            return r2 || (void 0 === e2 && (e2 = i2.substring(M)), d2.push(e2), M = n2, k(d2), o2 && R()), v();
          }
          function E2(e2) {
            M = e2, k(d2), d2 = [], _2 = i2.indexOf(O, M);
          }
          function v(e2) {
            if (C.header && !t && h2.length && !L) {
              var s3 = h2[0], a3 = /* @__PURE__ */ Object.create(null), o3 = new Set(s3);
              let n3 = false;
              for (let r3 = 0; r3 < s3.length; r3++) {
                let i3 = q(s3[r3]);
                if (a3[i3 = U(C.transformHeader) ? C.transformHeader(i3, r3) : i3]) {
                  let e3, t2 = a3[i3];
                  for (; e3 = i3 + "_" + t2, t2++, o3.has(e3); ) ;
                  o3.add(e3), s3[r3] = e3, a3[i3]++, n3 = true, (D = null === D ? {} : D)[e3] = i3;
                } else a3[i3] = 1, s3[r3] = i3;
                o3.add(i3);
              }
              n3 && console.warn("Duplicate headers found and renamed."), L = true;
            }
            return { data: h2, errors: u2, meta: { delimiter: S, linebreak: O, aborted: j, truncated: !!e2, cursor: l2 + (t || 0), renamedHeaders: D } };
          }
          function R() {
            T(v()), h2 = [], u2 = [];
          }
        }, this.abort = function() {
          j = true;
        }, this.getCharIndex = function() {
          return M;
        };
      }
      function p(e) {
        var t = e.data, i2 = o[t.workerId], r2 = false;
        if (t.error) i2.userError(t.error, t.file);
        else if (t.results && t.results.data) {
          var n2 = { abort: function() {
            r2 = true, _(t.workerId, { data: [], errors: [], meta: { aborted: true } });
          }, pause: g, resume: g };
          if (U(i2.userStep)) {
            for (var s2 = 0; s2 < t.results.data.length && (i2.userStep({ data: t.results.data[s2], errors: t.results.errors, meta: t.results.meta }, n2), !r2); s2++) ;
            delete t.results;
          } else U(i2.userChunk) && (i2.userChunk(t.results, n2, t.file), delete t.results);
        }
        t.finished && !r2 && _(t.workerId, t.results);
      }
      function _(e, t) {
        var i2 = o[e];
        U(i2.userComplete) && i2.userComplete(t), i2.terminate(), delete o[e];
      }
      function g() {
        throw new Error("Not implemented.");
      }
      function E(e) {
        if ("object" != typeof e || null === e) return e;
        var t, i2 = Array.isArray(e) ? [] : {};
        for (t in e) i2[t] = E(e[t]);
        return i2;
      }
      function m(e, t) {
        return function() {
          e.apply(t, arguments);
        };
      }
      function U(e) {
        return "function" == typeof e;
      }
      return w.parse = function(e, t) {
        var i2 = (t = t || {}).dynamicTyping || false;
        U(i2) && (t.dynamicTypingFunction = i2, i2 = {});
        if (t.dynamicTyping = i2, t.transform = !!U(t.transform) && t.transform, void 0 !== t.downloadTimeout) {
          var i2 = parseInt(t.downloadTimeout);
          if (isNaN(i2)) throw new Error("Config downloadTimeout value (" + t.downloadTimeout + ") not parsable by parseInt(val).");
          t.downloadTimeout = i2;
        }
        if (!t.worker || !w.WORKERS_SUPPORTED) return i2 = null, w.NODE_STREAM_INPUT, "string" == typeof e ? (e = q(e), i2 = new (t.download ? d : f)(t)) : true === e.readable && U(e.read) && U(e.on) ? i2 = new c(t) : (n.File && e instanceof File || e instanceof Object) && (i2 = new l(t)), i2.stream(e);
        (i2 = (() => {
          var e2;
          return !!w.WORKERS_SUPPORTED && (e2 = (() => {
            var e3 = n.URL || n.webkitURL || null, t2 = r.toString();
            return w.BLOB_URL || (w.BLOB_URL = e3.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", t2, ")();"], { type: "text/javascript" })));
          })(), (e2 = new n.Worker(e2)).onmessage = p, e2.id = h++, o[e2.id] = e2);
        })()).userStep = t.step, i2.userChunk = t.chunk, i2.userComplete = t.complete, i2.userError = t.error, t.step = U(t.step), t.chunk = U(t.chunk), t.complete = U(t.complete), t.error = U(t.error), delete t.worker, i2.postMessage({ input: e, config: t, workerId: i2.id });
      }, w.unparse = function(e, t) {
        var s2 = false, g2 = true, m2 = ",", y = "\r\n", a2 = '"', o2 = a2 + a2, i2 = false, r2 = null, h2 = false, u2 = ((() => {
          if ("object" == typeof t) {
            if ("string" != typeof t.delimiter || w.BAD_DELIMITERS.filter(function(e2) {
              return -1 !== t.delimiter.indexOf(e2);
            }).length || (m2 = t.delimiter), "boolean" != typeof t.quotes && "function" != typeof t.quotes && !Array.isArray(t.quotes) || (s2 = t.quotes), "boolean" != typeof t.skipEmptyLines && "string" != typeof t.skipEmptyLines || (i2 = t.skipEmptyLines), "string" == typeof t.newline && (y = t.newline), "string" == typeof t.quoteChar && (a2 = t.quoteChar, o2 = a2 + a2), "boolean" == typeof t.header && (g2 = t.header), Array.isArray(t.columns)) {
              if (0 === t.columns.length) throw new Error("Option columns is empty");
              r2 = t.columns;
            }
            void 0 !== t.escapeChar && (o2 = t.escapeChar + a2), t.escapeFormulae instanceof RegExp ? h2 = t.escapeFormulae : "boolean" == typeof t.escapeFormulae && t.escapeFormulae && (h2 = /^[=+\-@\t\r].*$/);
          }
        })(), new RegExp(P(a2), "g"));
        "string" == typeof e && (e = JSON.parse(e));
        if (Array.isArray(e)) {
          if (!e.length) return n2(r2, e, i2);
          if (Array.isArray(e[0])) return n2(null, e, i2);
          if ("object" == typeof e[0]) return n2(r2 || Object.keys(e[0]), e, i2);
        } else if ("object" == typeof e) return "string" == typeof e.data && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || r2), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : "object" == typeof e.data[0] ? Object.keys(e.data[0]) : []), Array.isArray(e.data[0]) || "object" == typeof e.data[0] || (e.data = [e.data])), n2(e.fields || [], e.data || [], i2);
        throw new Error("Unable to serialize unrecognized input");
        function n2(e2, t2, i3) {
          var r3 = "", n3 = ("string" == typeof e2 && (e2 = JSON.parse(e2)), "string" == typeof t2 && (t2 = JSON.parse(t2)), Array.isArray(e2) && 0 < e2.length), s3 = !Array.isArray(t2[0]);
          if (n3 && g2) {
            for (var a3 = 0; a3 < e2.length; a3++) 0 < a3 && (r3 += m2), r3 += k(e2[a3], a3);
            0 < t2.length && (r3 += y);
          }
          for (var o3 = 0; o3 < t2.length; o3++) {
            var h3 = (n3 ? e2 : t2[o3]).length, u3 = false, d2 = n3 ? 0 === Object.keys(t2[o3]).length : 0 === t2[o3].length;
            if (i3 && !n3 && (u3 = "greedy" === i3 ? "" === t2[o3].join("").trim() : 1 === t2[o3].length && (null == t2[o3][0] || 0 === t2[o3][0].length)), "greedy" === i3 && n3) {
              for (var l2 = [], f2 = 0; f2 < h3; f2++) {
                var c2 = s3 ? e2[f2] : f2;
                l2.push(t2[o3][c2]);
              }
              u3 = "" === l2.join("").trim();
            }
            if (!u3) {
              for (var p2 = 0; p2 < h3; p2++) {
                0 < p2 && !d2 && (r3 += m2);
                var _2 = n3 && s3 ? e2[p2] : p2;
                r3 += k(t2[o3][_2], p2);
              }
              o3 < t2.length - 1 && (!i3 || 0 < h3 && !d2) && (r3 += y);
            }
          }
          return r3;
        }
        function k(e2, t2) {
          var i3, r3, n3;
          return null == e2 ? "" : e2.constructor === Date ? isNaN(e2.getTime()) ? "" : e2.toISOString() : (n3 = false, i3 = e2.toString(), h2 && "number" != typeof e2 && "bigint" != typeof e2 && "boolean" != typeof e2 && h2.test(i3) && (e2 = i3 = "'" + i3, n3 = true), r3 = i3.replace(u2, o2), (n3 = n3 || true === s2 || "function" == typeof s2 && s2(e2, t2) || Array.isArray(s2) && s2[t2] || ((e3, t3) => {
            for (var i4 = 0; i4 < t3.length; i4++) if (-1 < e3.indexOf(t3[i4])) return true;
            return false;
          })(r3, w.BAD_DELIMITERS) || -1 < r3.indexOf(m2) || -1 < i3.indexOf(a2) || " " === r3.charAt(0) || " " === r3.charAt(r3.length - 1)) ? a2 + r3 + a2 : r3);
        }
      }, w.RECORD_SEP = String.fromCharCode(30), w.UNIT_SEP = String.fromCharCode(31), w.BYTE_ORDER_MARK = "\uFEFF", w.BAD_DELIMITERS = ["\r", "\n", '"', w.BYTE_ORDER_MARK], w.WORKERS_SUPPORTED = !s && !!n.Worker, w.NODE_STREAM_INPUT = 1, w.LocalChunkSize = 10485760, w.RemoteChunkSize = 5242880, w.DefaultDelimiter = ",", w.Parser = b, w.ParserHandle = i, w.NetworkStreamer = d, w.FileStreamer = l, w.StringStreamer = f, w.ReadableStreamStreamer = c, a && (n.onmessage = function(e) {
        e = e.data;
        void 0 === w.WORKER_ID && e && (w.WORKER_ID = e.workerId);
        "string" == typeof e.input ? n.postMessage({ workerId: w.WORKER_ID, results: w.parse(e.input, e.config), finished: true }) : (n.File && e.input instanceof File || e.input instanceof Object) && (e = w.parse(e.input, e.config)) && n.postMessage({ workerId: w.WORKER_ID, results: e, finished: true });
      }), (d.prototype = Object.create(u.prototype)).constructor = d, (l.prototype = Object.create(u.prototype)).constructor = l, (f.prototype = Object.create(f.prototype)).constructor = f, (c.prototype = Object.create(u.prototype)).constructor = c, w;
    });
  }
});

// node_modules/worker-f/lib/stringifyFunctionReferences.js
var JAVASCRIPT_VARIABLE_NAME_REG_EXP = /^[$_\u0080-\uFFFFa-zA-Z][$_\u0080-\uFFFF\w]*$/;
function stringifyFunctionReferences(getDependencies) {
  const functions = {};
  const variables = {};
  const references = getDependencies();
  const getReferencesSourceCode = getDependencies.toString();
  const referencedNames = getReferencesSourceCode.slice(getReferencesSourceCode.indexOf("[") + 1, getReferencesSourceCode.lastIndexOf("]")).split(",").map((_) => _.trim());
  for (const name of referencedNames) {
    if (!JAVASCRIPT_VARIABLE_NAME_REG_EXP.test(name)) {
      throw new Error(`Invalid dependency name: ${name}`);
    }
  }
  let i = 0;
  while (i < references.length) {
    let name = referencedNames[i];
    let value = references[i];
    if (typeof value === "function") {
      functions[name] = getFunctionSourceCode(value, name);
    } else {
      variables[name] = value;
    }
    i++;
  }
  return {
    functions,
    variables
  };
}
function getFunctionSourceCode(func, name) {
  const funcSourceCode = func.toString();
  if (func.prototype) {
    if (funcSourceCode.indexOf("[native code]") >= 0) {
      const funcNameStartsAt = funcSourceCode.indexOf(" ", "function".length) + " ".length;
      const funcNameEndsBefore = funcSourceCode.indexOf("(", funcNameStartsAt);
      return funcSourceCode.slice(funcNameStartsAt, funcNameEndsBefore);
    } else {
      let code = funcSourceCode;
      for (const key in func.prototype) {
        code += ";" + name + ".prototype." + key + "=" + func.prototype[key].toString();
      }
      return code;
    }
  } else {
    return funcSourceCode;
  }
}

// node_modules/worker-f/lib/createWorker.js
function createWorker(createWorkerInEnvironment, createInputHandler, onError, onOutput, getFromCache, setInCache) {
  let started = false;
  let worker;
  const stop = () => {
    worker.stop();
  };
  const ingest = (data, transferList) => {
    try {
      worker.ingest(data, transferList);
    } catch (error) {
      stop();
      throw error;
    }
  };
  const start = (arrayOfGetDependenciesFunctions, dependenciesTransferList) => {
    if (started) {
      throw new Error("Was started");
    }
    started = true;
    const cacheValue = getFromCache();
    const cachedCodeAndVars = cacheValue && cacheValue._;
    const codeAndVars = cachedCodeAndVars || getCodeAndVars(createInputHandler, arrayOfGetDependenciesFunctions);
    if (!cachedCodeAndVars) {
      setInCache({ _: codeAndVars });
    }
    const [code, vars] = codeAndVars;
    const getOtherFromCache = () => {
      const properties = getFromCache();
      if (properties) {
        return properties.other;
      }
    };
    const setOtherInCache = (value) => {
      setInCache(Object.assign(Object.assign({}, getFromCache()), { other: value }));
    };
    worker = createWorkerInEnvironment(code, getOtherFromCache, setOtherInCache, onError, onOutput);
    if (vars) {
      ingest(vars, dependenciesTransferList);
    }
  };
  return {
    start,
    stop,
    ingest
  };
}
var JAVASCRIPT_CODE_BEFORE_CREATE_INPUT_HANDLER_FUNCTION = (
  // Handles any messages that're sent from the main thread.
  "var onMessage = function(data) {for (var key in data) {self[key] = data[key]}onMessage = ("
);
var JAVASCRIPT_CODE_AFTER_CREATE_INPUT_HANDLER_FUNCTION = ")(postMessage)}";
function getCodeAndVars(createInputHandler, arrayOfGetDependenciesFunctions) {
  const [functionDefinitions, vars] = createFunctionsCodeAndVars(arrayOfGetDependenciesFunctions);
  const code = functionDefinitions + ";" + JAVASCRIPT_CODE_BEFORE_CREATE_INPUT_HANDLER_FUNCTION + createInputHandler.toString() + JAVASCRIPT_CODE_AFTER_CREATE_INPUT_HANDLER_FUNCTION;
  return [code, vars];
}
function createFunctionsCodeAndVars(arrayOfGetDependenciesFunctions) {
  let funcs = {};
  let vars = {};
  for (const getDependencies of arrayOfGetDependenciesFunctions) {
    const { functions, variables } = stringifyFunctionReferences(getDependencies);
    funcs = Object.assign(Object.assign({}, funcs), functions);
    vars = Object.assign(Object.assign({}, vars), variables);
  }
  const functionDefinitions = Object.keys(funcs).map((functionName) => {
    return functionName + "=" + funcs[functionName];
  }).join(";");
  return [functionDefinitions, vars];
}

// node_modules/worker-f/lib/createWorkerFunctionOrStream.js
function createWorkerFunctionOrStream(createWorkerInEnvironment, fnOrAlias, createMethods, createInputHandler, handleError, handleOutput) {
  let started = false;
  let stopped = false;
  let getDependenciesFunctions = [];
  const dependenciesTransferList = void 0;
  let inputTransferList = () => [];
  let outputTransferList = () => [];
  let alias = void 0;
  let cacheValue = void 0;
  const getFromCache = (cacheKey) => {
    return CACHE[cacheKey];
  };
  const setInCache = (cacheKey, value) => {
    CACHE[cacheKey] = value;
  };
  const mustHaveStarted = () => {
    if (!started) {
      throw new Error("Not started");
    }
  };
  const mustNotHaveStarted = () => {
    if (started) {
      throw new Error("Was started");
    }
  };
  const mustNotHaveStopped = () => {
    if (stopped) {
      throw new Error("Was stopped");
    }
  };
  const mustNotHaveAlias = () => {
    if (alias) {
      throw new Error("Has alias");
    }
  };
  const argumentMustBeFunction = (arg) => {
    if (typeof arg !== "function") {
      throw new TypeError("Argument must be a function");
    }
  };
  let fn;
  if (typeof fnOrAlias === "string") {
    alias = fnOrAlias;
    cacheValue = getFromCache(alias);
    if (!cacheValue || !cacheValue.$) {
      throw new Error("Not found");
    }
    fn = cacheValue.$[0];
    getDependenciesFunctions = cacheValue.$[1];
    inputTransferList = cacheValue.$[2];
    outputTransferList = cacheValue.$[3];
    cacheValue.$[4];
  } else {
    fn = fnOrAlias;
  }
  argumentMustBeFunction(fn);
  let worker;
  const addDependencies_ = (getDependencies) => {
    mustNotHaveStopped();
    mustNotHaveStarted();
    argumentMustBeFunction(getDependencies);
    getDependenciesFunctions.push(getDependencies);
  };
  const start = () => {
    mustNotHaveStopped();
    mustNotHaveStarted();
    const getInitialDependencies = () => [
      fn,
      outputTransferList,
      createInputHandler
    ];
    addDependencies_(getInitialDependencies);
    started = true;
    worker.start(getDependenciesFunctions, dependenciesTransferList);
  };
  const stop = () => {
    stopped = true;
    worker.stop();
  };
  const sendToWorker = (inputArgs) => {
    worker.ingest([Date.now(), inputArgs], inputTransferList(...inputArgs));
  };
  let numberOrUndefined;
  const workerFn = Object.assign({
    inputLatency: numberOrUndefined,
    outputLatency: numberOrUndefined,
    /**
     * Adds external dependencies.
     * These dependencies must not change after the function is started.
     *
     * @param {function} getDependencies — A "closure" function that returns an array of dependencies — global variables or functions — that will be used in this worker. If some dependencies get overlooked, the worker will throw "[name] is not defined".
     */
    addDependencies(getDependencies) {
      mustNotHaveAlias();
      addDependencies_(getDependencies);
    },
    // `transferList` for the arguments of the function.
    inputTransferList: (fn2) => {
      mustNotHaveStopped();
      mustNotHaveStarted();
      mustNotHaveAlias();
      argumentMustBeFunction(fn2);
      inputTransferList = fn2;
    },
    // `transferList` for the result of the function.
    outputTransferList: (fn2) => {
      mustNotHaveStopped();
      mustNotHaveStarted();
      mustNotHaveAlias();
      argumentMustBeFunction(fn2);
      outputTransferList = fn2;
    },
    // (optional) Enables caching.
    alias(alias_) {
      mustNotHaveStopped();
      mustNotHaveStarted();
      mustNotHaveAlias();
      alias = alias_;
      setInCache(alias, {
        $: [fn, getDependenciesFunctions, inputTransferList, outputTransferList]
      });
    },
    start,
    stop
  }, createMethods(start, stop, started, stopped, sendToWorker, mustHaveStarted, mustNotHaveStarted, mustNotHaveStopped));
  const getOtherFromCache = () => {
    if (alias) {
      const properties = getFromCache(alias);
      if (properties) {
        return properties.other;
      }
    }
  };
  const setOtherInCache = (value) => {
    if (alias) {
      setInCache(alias, Object.assign(Object.assign({}, getFromCache(alias)), { other: value }));
    }
  };
  worker = createWorker(
    // Creates a worker in a specific environment such as a web browser or Node.js.
    createWorkerInEnvironment,
    // This function will be executed in the worker thread.
    // It will be stringified and injected in the worker source code.
    // It must create an input handler function.
    (sendOutput_) => {
      let inputSentTimestamp = -1;
      let inputReceivedTimestamp = -1;
      const sendOutput = (output) => {
        sendOutput_([inputSentTimestamp, inputReceivedTimestamp, Date.now(), output], outputTransferList(output));
      };
      const inputHandler = createInputHandler(fn, sendOutput);
      return ([inputSentAt, input]) => {
        inputSentTimestamp = inputSentAt;
        inputReceivedTimestamp = Date.now();
        return inputHandler(input);
      };
    },
    // This function will be executed in the main thread
    // when an error is received from the worker.
    // Currently, we are in the main thread.
    (error) => {
      if (!stopped) {
        handleError(error);
      }
    },
    // This function will be executed in the main thread
    // when output is received from the worker.
    // Currently, we are in the main thread.
    ([inputSentTimestamp, inputReceivedTimestamp, outputTimestamp, output]) => {
      if (!stopped) {
        if (inputSentTimestamp !== -1) {
          workerFn.inputLatency = inputReceivedTimestamp - inputSentTimestamp;
        }
        workerFn.outputLatency = Date.now() - outputTimestamp;
        handleOutput(output);
      }
    },
    // Caching.
    getOtherFromCache,
    setOtherInCache
  );
  return workerFn;
}
var CACHE = {};

// node_modules/worker-f/lib/createWorkerFunction.js
function createWorkerFunction(createWorkerInEnvironment, fnOrAlias) {
  let resolveCall = void 0;
  let rejectCall = void 0;
  const createMethods = (start, stop, started, stopped, sendToWorker, mustHaveStarted, mustNotHaveStarted, mustNotHaveStopped) => ({
    // Calls the function. Could be used multiple times.
    call(...args) {
      mustNotHaveStopped();
      mustHaveStarted();
      if (resolveCall || rejectCall) {
        throw new Error("Previous call not finished");
      }
      return new Promise((resolve, reject) => {
        resolveCall = resolve;
        rejectCall = reject;
        sendToWorker(args);
      });
    },
    // Calls the function once.
    callOnce(...args) {
      start();
      return this.call(...args).finally(stop);
    }
  });
  const createInputHandler = (fn, emit) => {
    const isPromise2 = (anything) => {
      return anything !== null && typeof anything === "object" && typeof anything.then === "function";
    };
    return (args) => {
      const result = fn(...args);
      if (isPromise2(result)) {
        result.then(emit);
      } else {
        emit(result);
      }
    };
  };
  const handleError = (error) => {
    if (rejectCall) {
      rejectCall(error);
      resolveCall = void 0;
      rejectCall = void 0;
    } else {
      throw new Error("`reject` callback not found");
    }
  };
  const handleOutput = (output) => {
    if (resolveCall) {
      resolveCall(output);
      resolveCall = void 0;
      rejectCall = void 0;
    } else {
      throw new Error("`resolve` callback not found");
    }
  };
  return createWorkerFunctionOrStream(createWorkerInEnvironment, fnOrAlias, createMethods, createInputHandler, handleError, handleOutput);
}

// node_modules/worker-f/lib/environment/createWorkerInBrowser.js
function createWorkerInBrowser(javascriptCode, getFromCache, setInCache, onError, onOutput) {
  let url = getFromCache();
  if (!url) {
    url = createWorkerCodeUrl(javascriptCode);
    setInCache(url);
  }
  const worker = new Worker(url);
  worker.onmessage = (event) => {
    const data = event.data;
    const errorData = data ? data[ERROR_MESSAGE_PROPERTY_NAME] : void 0;
    if (errorData) {
      const error = new Error(errorData[0]);
      error.stack = errorData[1];
      let i = 2;
      while (i < errorData.length) {
        error[errorData[i][0]] = errorData[i][1];
        i++;
      }
      onError(error);
      worker.terminate();
    } else {
      onOutput(data);
    }
  };
  return {
    // Calling `worker.terminate()` will kill the worker thread immediately.
    // Calling `worker.terminate()` multiple times is safe and will not throw any errors.
    stop: worker.terminate.bind(worker),
    ingest: worker.postMessage.bind(worker)
  };
}
function createWorkerCodeUrl(javascriptCode) {
  return URL.createObjectURL(new Blob([
    javascriptCode + ";" + JAVASCRIPT_CODE_ADDITIONAL
  ], { type: "text/javascript" }));
}
var ERROR_MESSAGE_PROPERTY_NAME = "$err$";
var JAVASCRIPT_CODE_ADDITIONAL = (
  // Listen to incoming messages from the main thread.
  "self.onmessage = function(evt) {onMessage(evt.data)};function onErr(err_, msg) {var err = err_ instanceof Error ? err_ : new Error(msg);postMessage({" + ERROR_MESSAGE_PROPERTY_NAME + ':[err.message,err.stack].concat(Object.keys(err).map(function(k){return[k,err[k]]}))})};var postMessage = self.postMessage;addEventListener("error",function(evt) {onErr(evt.error, evt.message)});addEventListener("unhandledrejection",function(evt) {evt.preventDefault();onErr(evt.reason, String(evt.reason))})'
);

// node_modules/worker-f/lib/export/browser/createWorkerFunctionInBrowser.js
function createWorkerFunctionInBrowser(fnOrAlias) {
  return createWorkerFunction(createWorkerInBrowser, fnOrAlias);
}

// node_modules/read-excel-file/modules/saxen/parser.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function Parser_(options) {
  var fromCharCode = String.fromCharCode;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var ENTITY_PATTERN = /&#(\d+);|&#x([0-9a-f]+);|&(\w+);/ig;
  var ENTITY_MAPPING = {
    "amp": "&",
    "apos": "'",
    "gt": ">",
    "lt": "<",
    "quot": '"'
  };
  Object.keys(ENTITY_MAPPING).forEach(function(k) {
    ENTITY_MAPPING[k.toUpperCase()] = ENTITY_MAPPING[k];
  });
  function replaceEntities(_, d, x, z) {
    if (z) {
      if (hasOwnProperty.call(ENTITY_MAPPING, z)) {
        return ENTITY_MAPPING[z];
      } else {
        return "&" + z + ";";
      }
    }
    if (d) {
      return fromCharCode(d);
    }
    return fromCharCode(parseInt(x, 16));
  }
  function decodeEntities(s) {
    if (s.length > 3 && s.indexOf("&") !== -1) {
      return s.replace(ENTITY_PATTERN, replaceEntities);
    }
    return s;
  }
  var NON_WHITESPACE_OUTSIDE_ROOT_NODE = "non-whitespace outside of root node";
  function error(msg) {
    return new Error(msg);
  }
  function missingNamespaceForPrefix(prefix) {
    return "missing namespace for prefix <" + prefix + ">";
  }
  function getter(getFn) {
    return {
      "get": getFn,
      "enumerable": true
    };
  }
  function cloneNsMatrix(nsMatrix) {
    var clone = {}, key;
    for (key in nsMatrix) {
      clone[key] = nsMatrix[key];
    }
    return clone;
  }
  var NAME_CACHE = Symbol("nameCache");
  function uriPrefix(prefix) {
    return prefix + "$uri";
  }
  function buildNsMatrix(nsUriToPrefix) {
    var nsMatrix = {}, uri, prefix;
    for (uri in nsUriToPrefix) {
      prefix = nsUriToPrefix[uri];
      nsMatrix[prefix] = prefix;
      nsMatrix[uriPrefix(prefix)] = uri;
    }
    return nsMatrix;
  }
  function noopGetContext() {
    return {
      line: 0,
      column: 0
    };
  }
  function throwFunc(err2) {
    throw err2;
  }
  function Parser(options2) {
    if (!this) {
      return new Parser(options2);
    }
    var proxy = options2 && options2["proxy"];
    var onText, onOpenTag, onCloseTag, onCDATA, onError = throwFunc, onWarning, onComment, onQuestion, onAttention;
    var getContext = noopGetContext;
    var streaming = false;
    var rootTagFound = false;
    var leftoverXml = "";
    var maybeNS = false;
    var isNamespace = false;
    var returnError = null;
    var parseStop = false;
    var nsMatrixStack, nsMatrix, nodeStack;
    var nsUriToPrefix;
    function handleError(err2) {
      if (!(err2 instanceof Error)) {
        err2 = error(err2);
      }
      returnError = err2;
      onError(err2, getContext);
    }
    function handleWarning(err2) {
      if (!onWarning) {
        return;
      }
      if (!(err2 instanceof Error)) {
        err2 = error(err2);
      }
      onWarning(err2, getContext);
    }
    this["on"] = function(name, cb) {
      if (typeof cb !== "function") {
        throw error("required args <name, cb>");
      }
      switch (name) {
        case "openTag":
          onOpenTag = cb;
          break;
        case "text":
          onText = cb;
          break;
        case "closeTag":
          onCloseTag = cb;
          break;
        case "error":
          onError = cb;
          break;
        case "warn":
          onWarning = cb;
          break;
        case "cdata":
          onCDATA = cb;
          break;
        case "attention":
          onAttention = cb;
          break;
        // <!XXXXX zzzz="eeee">
        case "question":
          onQuestion = cb;
          break;
        // <? ....  ?>
        case "comment":
          onComment = cb;
          break;
        default:
          throw error("unsupported event: " + name);
      }
      return this;
    };
    this["ns"] = function(nsMap) {
      if (typeof nsMap === "undefined") {
        nsMap = {};
      }
      if (_typeof(nsMap) !== "object") {
        throw error("required args <nsMap={}>");
      }
      var _nsUriToPrefix = {}, k;
      for (k in nsMap) {
        _nsUriToPrefix[k] = nsMap[k];
      }
      isNamespace = true;
      nsUriToPrefix = _nsUriToPrefix;
      return this;
    };
    function resetState() {
      nsMatrixStack = isNamespace ? [] : null;
      nsMatrix = isNamespace ? buildNsMatrix(nsUriToPrefix) : null;
      nodeStack = [];
      getContext = noopGetContext;
      parseStop = false;
      returnError = null;
      rootTagFound = false;
      leftoverXml = "";
    }
    this["parse"] = function(xml) {
      if (typeof xml !== "string") {
        throw error("required args <xml=string>");
      }
      if (streaming) {
        throw error("parse during stream; call end() first");
      }
      resetState();
      parse(xml);
      getContext = noopGetContext;
      parseStop = false;
      return returnError;
    };
    this["write"] = function(xml) {
      if (typeof xml !== "string") {
        throw error("required args <xml=string>");
      }
      if (!streaming) {
        resetState();
        streaming = true;
      }
      if (!returnError) {
        leftoverXml = parse(leftoverXml + xml, true) || "";
      }
      return this;
    };
    this["end"] = function() {
      if (!streaming) {
        resetState();
      }
      streaming = false;
      if (!returnError) {
        parse(leftoverXml);
      }
      leftoverXml = "";
      getContext = noopGetContext;
      parseStop = false;
      return returnError;
    };
    this["stop"] = function() {
      parseStop = true;
    };
    function parse(xml) {
      var streaming2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
      var elNameCache = null, elNameCacheMatrix = null;
      var _nsMatrix, anonymousNsCount = 0, tagStart = false, tagEnd = false, i = 0, j = 0, x, y, q, w, v, xmlns, elementName, _elementName, elementProxy;
      var attrsString = "", attrsStart = 0, cachedAttrs;
      function normalizeAttrName(name, defaultAlias) {
        var w2 = name.indexOf(":");
        if (w2 === -1) {
          return name;
        }
        var nsName = nsMatrix[name.substring(0, w2)];
        if (!nsName) {
          handleWarning(missingNamespaceForPrefix(name.substring(0, w2)));
          return null;
        }
        return defaultAlias === nsName ? name.substr(w2 + 1) : nsName + name.substr(w2);
      }
      function getAttrs() {
        if (cachedAttrs !== null) {
          return cachedAttrs;
        }
        var nsUri, nsUriPrefix, defaultAlias = isNamespace && nsMatrix["xmlns"], attrList = isNamespace && maybeNS ? [] : null, i2 = attrsStart, s = attrsString, l = s.length, hasNewMatrix, newalias, value, alias, name, attrs = {}, seenAttrs = /* @__PURE__ */ new Set(), skipAttr, w2, j2;
        parseAttr: for (; i2 < l; i2++) {
          skipAttr = false;
          w2 = s.charCodeAt(i2);
          if (w2 === 32 || w2 < 14 && w2 > 8) {
            continue;
          }
          if (w2 < 65 || w2 > 122 || w2 > 90 && w2 < 97) {
            if (w2 !== 95 && w2 !== 58) {
              handleWarning("illegal first char attribute name");
              skipAttr = true;
            }
          }
          for (j2 = i2 + 1; j2 < l; j2++) {
            w2 = s.charCodeAt(j2);
            if (w2 > 96 && w2 < 123 || w2 > 64 && w2 < 91 || w2 > 47 && w2 < 59 || w2 === 46 || // '.'
            w2 === 45 || // '-'
            w2 === 95) {
              continue;
            }
            if (w2 === 32 || w2 < 14 && w2 > 8) {
              handleWarning("missing attribute value");
              i2 = j2;
              continue parseAttr;
            }
            if (w2 === 61) {
              break;
            }
            handleWarning("illegal attribute name char");
            skipAttr = true;
          }
          name = s.substring(i2, j2);
          if (name === "xmlns:xmlns") {
            handleWarning("illegal declaration of xmlns");
            skipAttr = true;
          }
          w2 = s.charCodeAt(j2 + 1);
          if (w2 === 34) {
            j2 = s.indexOf('"', i2 = j2 + 2);
            if (j2 === -1) {
              j2 = s.indexOf("'", i2);
              if (j2 !== -1) {
                handleWarning("attribute value quote missmatch");
                skipAttr = true;
              }
            }
          } else if (w2 === 39) {
            j2 = s.indexOf("'", i2 = j2 + 2);
            if (j2 === -1) {
              j2 = s.indexOf('"', i2);
              if (j2 !== -1) {
                handleWarning("attribute value quote missmatch");
                skipAttr = true;
              }
            }
          } else {
            handleWarning("missing attribute value quotes");
            skipAttr = true;
            for (j2 = j2 + 1; j2 < l; j2++) {
              w2 = s.charCodeAt(j2 + 1);
              if (w2 === 32 || w2 < 14 && w2 > 8) {
                break;
              }
            }
          }
          if (j2 === -1) {
            handleWarning("missing closing quotes");
            j2 = l;
            skipAttr = true;
          }
          if (!skipAttr) {
            value = s.substring(i2, j2);
          }
          i2 = j2;
          for (; j2 + 1 < l; j2++) {
            w2 = s.charCodeAt(j2 + 1);
            if (w2 === 32 || w2 < 14 && w2 > 8) {
              break;
            }
            if (i2 === j2) {
              handleWarning("illegal character after attribute end");
              skipAttr = true;
            }
          }
          i2 = j2 + 1;
          if (skipAttr) {
            continue parseAttr;
          }
          if (seenAttrs.has(name)) {
            handleWarning("attribute <" + name + "> already defined");
            continue;
          }
          seenAttrs.add(name);
          if (!isNamespace) {
            attrs[name] = value;
            continue;
          }
          if (maybeNS) {
            newalias = name === "xmlns" ? "xmlns" : name.charCodeAt(0) === 120 && name.substr(0, 6) === "xmlns:" ? name.substr(6) : null;
            if (newalias !== null) {
              nsUri = decodeEntities(value);
              nsUriPrefix = uriPrefix(newalias);
              alias = nsUriToPrefix[nsUri];
              if (!alias) {
                if (newalias === "xmlns" || nsUriPrefix in nsMatrix && nsMatrix[nsUriPrefix] !== nsUri) {
                  do {
                    alias = "ns" + anonymousNsCount++;
                  } while (typeof nsMatrix[alias] !== "undefined");
                } else {
                  alias = newalias;
                }
                nsUriToPrefix[nsUri] = alias;
              }
              if (nsMatrix[newalias] !== alias) {
                if (!hasNewMatrix) {
                  nsMatrix = cloneNsMatrix(nsMatrix);
                  hasNewMatrix = true;
                }
                nsMatrix[newalias] = alias;
                if (newalias === "xmlns") {
                  nsMatrix[uriPrefix(alias)] = nsUri;
                  defaultAlias = alias;
                }
                nsMatrix[nsUriPrefix] = nsUri;
              }
              attrs[name] = value;
              continue;
            }
            attrList.push(name, value);
            continue;
          }
          name = normalizeAttrName(name, defaultAlias);
          if (name === null) {
            continue;
          }
          attrs[name] = value;
        }
        if (maybeNS) {
          for (i2 = 0, l = attrList.length; i2 < l; i2++) {
            name = normalizeAttrName(attrList[i2++], defaultAlias);
            value = attrList[i2];
            if (name === null) {
              continue;
            }
            attrs[name] = value;
          }
        }
        return cachedAttrs = attrs;
      }
      function getParseContext() {
        var splitsRe = /(\r\n|\r|\n)/g;
        var line = 0;
        var column = 0;
        var startOfLine = 0;
        var endOfLine = j;
        var match;
        var data;
        while (i >= startOfLine) {
          match = splitsRe.exec(xml);
          if (!match) {
            break;
          }
          endOfLine = match[0].length + match.index;
          if (endOfLine > i) {
            break;
          }
          line += 1;
          startOfLine = endOfLine;
        }
        if (i == -1) {
          column = endOfLine;
          data = xml.substring(j);
        } else if (j === 0) {
          data = xml.substring(j, i);
        } else {
          column = i - startOfLine;
          data = j == -1 ? xml.substring(i) : xml.substring(i, j + 1);
        }
        return {
          "data": data,
          "line": line,
          "column": column
        };
      }
      getContext = getParseContext;
      if (proxy) {
        elementProxy = Object.create({}, {
          "name": getter(function() {
            return elementName;
          }),
          "originalName": getter(function() {
            return _elementName;
          }),
          "attrs": getter(getAttrs),
          "ns": getter(function() {
            return nsMatrix;
          })
        });
      }
      while (j !== -1) {
        if (xml.charCodeAt(j) === 60) {
          i = j;
        } else {
          i = xml.indexOf("<", j);
        }
        if (i === -1) {
          if (streaming2) {
            return xml.substring(j);
          }
          if (nodeStack.length) {
            return handleError("unexpected end of file");
          }
          if (!rootTagFound) {
            return handleError("missing start tag");
          }
          if (j < xml.length) {
            if (xml.substring(j).trim()) {
              handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
            }
          }
          return;
        }
        if (!rootTagFound) {
          rootTagFound = true;
        }
        if (j !== i) {
          if (nodeStack.length) {
            if (onText) {
              onText(xml.substring(j, i), decodeEntities, getContext);
              if (parseStop) {
                return;
              }
            }
          } else {
            if (xml.substring(j, i).trim()) {
              handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
              if (parseStop) {
                return;
              }
            }
          }
        }
        w = xml.charCodeAt(i + 1);
        if (w === 33) {
          q = xml.charCodeAt(i + 2);
          if (q === 91 && xml.substr(i + 3, 6) === "CDATA[") {
            j = xml.indexOf("]]>", i);
            if (j === -1) {
              if (streaming2) {
                return xml.substring(i);
              }
              return handleError("unclosed cdata");
            }
            if (onCDATA) {
              onCDATA(xml.substring(i + 9, j), getContext);
              if (parseStop) {
                return;
              }
            }
            j += 3;
            continue;
          }
          if (q === 45 && xml.charCodeAt(i + 3) === 45) {
            j = xml.indexOf("-->", i);
            if (j === -1) {
              if (streaming2) {
                return xml.substring(i);
              }
              return handleError("unclosed comment");
            }
            if (onComment) {
              onComment(xml.substring(i + 4, j), decodeEntities, getContext);
              if (parseStop) {
                return;
              }
            }
            j += 3;
            continue;
          }
        }
        if (w === 63) {
          j = xml.indexOf("?>", i);
          if (j === -1) {
            if (streaming2) {
              return xml.substring(i);
            }
            return handleError("unclosed question");
          }
          if (onQuestion) {
            onQuestion(xml.substring(i, j + 2), getContext);
            if (parseStop) {
              return;
            }
          }
          j += 2;
          continue;
        }
        for (x = i + 1; ; x++) {
          v = xml.charCodeAt(x);
          if (isNaN(v)) {
            if (streaming2) {
              return xml.substring(i);
            }
            j = -1;
            return handleError("unclosed tag");
          }
          if (v === 34) {
            q = xml.indexOf('"', x + 1);
            x = q !== -1 ? q : x;
          } else if (v === 39) {
            q = xml.indexOf("'", x + 1);
            x = q !== -1 ? q : x;
          } else if (v === 62) {
            j = x;
            break;
          }
        }
        if (w === 33) {
          if (onAttention) {
            onAttention(xml.substring(i, j + 1), decodeEntities, getContext);
            if (parseStop) {
              return;
            }
          }
          j += 1;
          continue;
        }
        cachedAttrs = {};
        if (w === 47) {
          tagStart = false;
          tagEnd = true;
          if (!nodeStack.length) {
            return handleError("missing open tag");
          }
          x = elementName = nodeStack.pop();
          q = i + 2 + x.length;
          if (xml.substring(i + 2, q) !== x) {
            return handleError("closing tag mismatch");
          }
          for (; q < j; q++) {
            w = xml.charCodeAt(q);
            if (w === 32 || w > 8 && w < 14) {
              continue;
            }
            return handleError("close tag");
          }
        } else {
          if (xml.charCodeAt(j - 1) === 47) {
            x = elementName = xml.substring(i + 1, j - 1);
            tagStart = true;
            tagEnd = true;
          } else {
            x = elementName = xml.substring(i + 1, j);
            tagStart = true;
            tagEnd = false;
          }
          if (!(w > 96 && w < 123 || w > 64 && w < 91 || w === 95 || w === 58)) {
            return handleError("illegal first char nodeName");
          }
          for (q = 1, y = x.length; q < y; q++) {
            w = x.charCodeAt(q);
            if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w == 46) {
              continue;
            }
            if (w === 32 || w < 14 && w > 8) {
              elementName = x.substring(0, q);
              cachedAttrs = null;
              break;
            }
            return handleError("invalid nodeName");
          }
          if (!tagEnd) {
            nodeStack.push(elementName);
          }
        }
        if (isNamespace) {
          _nsMatrix = nsMatrix;
          if (tagStart) {
            if (!tagEnd) {
              nsMatrixStack.push(_nsMatrix);
            }
            if (cachedAttrs === null) {
              if (maybeNS = x.indexOf("xmlns", q) !== -1) {
                attrsStart = q;
                attrsString = x;
                getAttrs();
                maybeNS = false;
              }
            }
          }
          _elementName = elementName;
          if (elNameCacheMatrix !== nsMatrix) {
            elNameCache = nsMatrix[NAME_CACHE];
            if (elNameCache === void 0) {
              elNameCache = nsMatrix[NAME_CACHE] = {};
            }
            elNameCacheMatrix = nsMatrix;
          }
          var _cachedName = elNameCache[elementName];
          if (_cachedName !== void 0) {
            elementName = _cachedName;
          } else {
            w = elementName.indexOf(":");
            if (w !== -1) {
              xmlns = nsMatrix[elementName.substring(0, w)];
              if (!xmlns) {
                return handleError("missing namespace on <" + _elementName + ">");
              }
              elementName = elementName.substr(w + 1);
            } else {
              xmlns = nsMatrix["xmlns"];
            }
            if (xmlns) {
              elementName = xmlns + ":" + elementName;
            }
            elNameCache[_elementName] = elementName;
          }
        }
        if (tagStart) {
          attrsStart = q;
          attrsString = x;
          if (onOpenTag) {
            if (proxy) {
              onOpenTag(elementProxy, decodeEntities, tagEnd, getContext);
            } else {
              onOpenTag(elementName, getAttrs, decodeEntities, tagEnd, getContext);
            }
            if (parseStop) {
              return;
            }
          }
        }
        if (tagEnd) {
          if (onCloseTag) {
            onCloseTag(proxy ? elementProxy : elementName, decodeEntities, tagStart, getContext);
            if (parseStop) {
              return;
            }
          }
          if (isNamespace) {
            if (!tagStart) {
              nsMatrix = nsMatrixStack.pop();
            } else {
              nsMatrix = _nsMatrix;
            }
          }
        }
        j += 1;
      }
    }
  }
  return new Parser(options);
}

// node_modules/read-excel-file/modules/xml/parseXmlStream.saxen.js
function parseXmlStream(state, onOpenTag, onCloseTag, onText) {
  var errored = false;
  var mustNotHaveErrored = function mustNotHaveErrored2() {
    if (errored) {
      throw new Error("Errored");
    }
  };
  var resolvePromise;
  var parser = new Parser_();
  var write = function write2(xml) {
    mustNotHaveErrored();
    parser.write(xml);
  };
  var end = function end2() {
    mustNotHaveErrored();
    parser.end();
    resolvePromise();
  };
  var promise = new Promise(function(resolve, reject) {
    resolvePromise = resolve;
    var onerror = function onerror2(error) {
      errored = true;
      throw error;
    };
    var ontext = function ontext2(text, decodeEntities) {
      if (onText) {
        onText(decodeEntities(text), state);
      }
    };
    var onopentag = function onopentag2(elementName, getAttributes, decodeEntities, selfClosing, getContext) {
      if (onOpenTag) {
        var attributes = getAttributes();
        for (var name in attributes) {
          attributes[trimXmlnsPrefix(name, true)] = decodeEntities(attributes[name]);
        }
        onOpenTag(trimXmlnsPrefix(elementName), attributes, state);
      }
    };
    var onclosetag = function onclosetag2(elementName) {
      if (onCloseTag) {
        onCloseTag(trimXmlnsPrefix(elementName), state);
      }
    };
    parser.on("error", onerror);
    parser.on("text", ontext);
    parser.on("openTag", onopentag);
    parser.on("closeTag", onclosetag);
  });
  return {
    promise,
    write,
    end
  };
}
function trimXmlnsPrefix(string, isAttributeName) {
  var i = 0;
  while (i < string.length) {
    if (string[i] === ":") {
      if (isAttributeName && i === 5 && string.slice(0, 5) === "xmlns") {
      } else {
        return string.slice(i + 1);
      }
    }
    i++;
  }
  return string;
}

// node_modules/read-excel-file/modules/xlsx/InvalidSpreadsheetError.js
function _typeof2(o) {
  "@babel/helpers - typeof";
  return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof2(o);
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof2(key) === "symbol" ? key : String(key);
}
function _toPrimitive(input, hint) {
  if (_typeof2(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof2(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _possibleConstructorReturn(self2, call) {
  if (call && (_typeof2(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self2);
}
function _assertThisInitialized(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper = function _wrapNativeSuper5(Class2) {
    if (Class2 === null || !_isNativeFunction(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct(Class2, arguments, _getPrototypeOf(this).constructor);
    }
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf(Wrapper, Class2);
  };
  return _wrapNativeSuper(Class);
}
function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct.bind();
  } else {
    _construct = function _construct5(Parent2, args2, Class2) {
      var a = [null];
      a.push.apply(a, args2);
      var Constructor = Function.bind.apply(Parent2, a);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf(instance, Class2.prototype);
      return instance;
    };
  }
  return _construct.apply(null, arguments);
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf5(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf(o, p);
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf5(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf(o);
}
var InvalidSpreadsheetError = /* @__PURE__ */ (function(_Error) {
  _inherits(InvalidSpreadsheetError2, _Error);
  var _super = _createSuper(InvalidSpreadsheetError2);
  function InvalidSpreadsheetError2(message) {
    var _this;
    _classCallCheck(this, InvalidSpreadsheetError2);
    _this = _super.call(this, message);
    _this.name = "InvalidSpreadsheetError";
    return _this;
  }
  return _createClass(InvalidSpreadsheetError2);
})(/* @__PURE__ */ _wrapNativeSuper(Error));

// node_modules/read-excel-file/modules/xml/parseXml.js
function parseXml(xml, state, onOpenTag, onCloseTag, onText, onProgress) {
  var parser = parseXmlStream(state, onOpenTag, onCloseTag, onText);
  if (onProgress) {
    parseXmlInChunks(parser, xml, onProgress);
  } else {
    parser.write(xml);
    parser.end();
  }
  return parser.promise.then(function(result) {
    return result;
  }, function(error) {
    var spreadsheetError = new InvalidSpreadsheetError(error.message);
    spreadsheetError.stack = error.stack;
    spreadsheetError.cause = error;
    throw spreadsheetError;
  });
  function parseXmlInChunks(parser2, xml2, onProgress2, nonBlocking) {
    var MAX_CHUNK_PROCESSING_TIME = 7;
    var INITIAL_CHUNK_SIZE = 64 * 1024;
    var chunksCount = 0;
    var chunkSize = INITIAL_CHUNK_SIZE;
    var parseNextChunk = function parseNextChunk2() {
      chunksCount++;
      var startedAt = Date.now();
      if (xml2.length > chunkSize) {
        parser2.write(xml2.slice(0, chunkSize));
        if (onProgress2) {
          onProgress2(false);
        }
        xml2 = xml2.slice(chunkSize);
        var chunkProcessingTime = Date.now() - startedAt;
        if (chunkProcessingTime < MAX_CHUNK_PROCESSING_TIME * 0.5) {
          chunkSize *= 2;
        } else if (chunkProcessingTime > MAX_CHUNK_PROCESSING_TIME) {
          chunkSize /= 2;
        }
        return true;
      } else {
        parser2.write(xml2);
        parser2.end();
        if (onProgress2) {
          onProgress2(true);
        }
        return false;
      }
    };
    var loop = function loop2() {
      if (parseNextChunk()) {
        if (nonBlocking) {
          if (typeof setImmediate !== "undefined") {
            setImmediate(loop2);
          } else {
            setTimeout(loop2, 0);
          }
        } else {
          loop2();
        }
      } else {
      }
    };
    loop();
  }
}

// node_modules/fflate/esm/browser.js
var ch2 = {};
var wk = (function(c, id, msg, transfer, cb) {
  var w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
    c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
  ], { type: "text/javascript" }))));
  w.onmessage = function(e) {
    var d = e.data, ed = d.$e$;
    if (ed) {
      var err2 = new Error(ed[0]);
      err2["code"] = ed[1];
      err2.stack = ed[2];
      cb(err2, null);
    } else
      cb(null, d);
  };
  w.postMessage(msg, transfer);
  return w;
});
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var wcln = function(fn, fnStr, td2) {
  var dt = fn();
  var st = fn.toString();
  var ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/\s+/g, "").split(",");
  for (var i = 0; i < dt.length; ++i) {
    var v = dt[i], k = ks[i];
    if (typeof v == "function") {
      fnStr += ";" + k + "=";
      var st_1 = v.toString();
      if (v.prototype) {
        if (st_1.indexOf("[native code]") != -1) {
          var spInd = st_1.indexOf(" ", 8) + 1;
          fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
        } else {
          fnStr += st_1;
          for (var t in v.prototype)
            fnStr += ";" + k + ".prototype." + t + "=" + v.prototype[t].toString();
        }
      } else
        fnStr += st_1;
    } else
      td2[k] = v;
  }
  return fnStr;
};
var ch = [];
var cbfs = function(v) {
  var tl = [];
  for (var k in v) {
    if (v[k].buffer) {
      tl.push((v[k] = new v[k].constructor(v[k])).buffer);
    }
  }
  return tl;
};
var wrkr = function(fns, init, id, cb) {
  if (!ch[id]) {
    var fnStr = "", td_1 = {}, m = fns.length - 1;
    for (var i = 0; i < m; ++i)
      fnStr = wcln(fns[i], fnStr, td_1);
    ch[id] = { c: wcln(fns[m], fnStr, td_1), e: td_1 };
  }
  var td2 = mrg({}, ch[id].e);
  return wk(ch[id].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + init.toString() + "}", id, td2, cbfs(td2), cb);
};
var bInflt = function() {
  return [u8, u16, i32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gopt];
};
var pbf = function(msg) {
  return postMessage(msg, [msg.buffer]);
};
var gopt = function(o) {
  return o && {
    out: o.size && new u8(o.size),
    dictionary: o.dictionary
  };
};
var cbify = function(dat, opts, fns, init, id, cb) {
  var w = wrkr(fns, init, id, function(err2, dat2) {
    w.terminate();
    cb(err2, dat2);
  });
  w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
  return function() {
    w.terminate();
  };
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflate(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  return cbify(data, opts, [
    bInflt
  ], function(ev) {
    return pbf(inflateSync(ev.data[0], gopt(ev.data[1])));
  }, 1, cb);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var mt = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(fn) {
  fn();
};
function unzip(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  var term = [];
  var tAll = function() {
    for (var i2 = 0; i2 < term.length; ++i2)
      term[i2]();
  };
  var files = {};
  var cbd = function(a, b) {
    mt(function() {
      cb(a, b);
    });
  };
  mt(function() {
    cbd = cb;
  });
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558) {
      cbd(err(13, 0, 1), null);
      return tAll;
    }
  }
  ;
  var lft = b2(data, e + 8);
  if (lft) {
    var c = lft;
    var o = b4(data, e + 16);
    var z = b4(data, e - 20) == 117853008;
    if (z) {
      var ze = b4(data, e - 12);
      z = b4(data, ze) == 101075792;
      if (z) {
        c = lft = b4(data, ze + 32);
        o = b4(data, ze + 48);
      }
    }
    var fltr = opts && opts.filter;
    var _loop_3 = function(i2) {
      var _a2 = zh(data, o, z), c_1 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
      o = no;
      var cbl = function(e2, d) {
        if (e2) {
          tAll();
          cbd(e2, null);
        } else {
          if (d)
            files[fn] = d;
          if (!--lft)
            cbd(null, files);
        }
      };
      if (!fltr || fltr({
        name: fn,
        size: sc,
        originalSize: su,
        compression: c_1
      })) {
        if (!c_1)
          cbl(null, slc(data, b, b + sc));
        else if (c_1 == 8) {
          var infl = data.subarray(b, b + sc);
          if (su < 524288 || sc > 0.8 * su) {
            try {
              cbl(null, inflateSync(infl, { out: new u8(su) }));
            } catch (e2) {
              cbl(e2, null);
            }
          } else
            term.push(inflate(infl, { size: su }, cbl));
        } else
          cbl(err(14, "unknown compression type " + c_1, 1), null);
      } else
        cbl(null, null);
    };
    for (var i = 0; i < c; ++i) {
      _loop_3(i);
    }
  } else
    cbd(null, {});
  return tAll;
}

// node_modules/read-excel-file/modules/zip/UnzipError.js
function _typeof3(o) {
  "@babel/helpers - typeof";
  return _typeof3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof3(o);
}
function _defineProperties2(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey2(descriptor.key), descriptor);
  }
}
function _createClass2(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties2(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties2(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey2(arg) {
  var key = _toPrimitive2(arg, "string");
  return _typeof3(key) === "symbol" ? key : String(key);
}
function _toPrimitive2(input, hint) {
  if (_typeof3(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof3(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _classCallCheck2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _inherits2(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf2(subClass, superClass);
}
function _createSuper2(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct2();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf2(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf2(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn2(this, result);
  };
}
function _possibleConstructorReturn2(self2, call) {
  if (call && (_typeof3(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized2(self2);
}
function _assertThisInitialized2(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _wrapNativeSuper2(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper2 = function _wrapNativeSuper5(Class2) {
    if (Class2 === null || !_isNativeFunction2(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct2(Class2, arguments, _getPrototypeOf2(this).constructor);
    }
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf2(Wrapper, Class2);
  };
  return _wrapNativeSuper2(Class);
}
function _construct2(Parent, args, Class) {
  if (_isNativeReflectConstruct2()) {
    _construct2 = Reflect.construct.bind();
  } else {
    _construct2 = function _construct5(Parent2, args2, Class2) {
      var a = [null];
      a.push.apply(a, args2);
      var Constructor = Function.bind.apply(Parent2, a);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf2(instance, Class2.prototype);
      return instance;
    };
  }
  return _construct2.apply(null, arguments);
}
function _isNativeReflectConstruct2() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
function _isNativeFunction2(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _setPrototypeOf2(o, p) {
  _setPrototypeOf2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf5(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf2(o, p);
}
function _getPrototypeOf2(o) {
  _getPrototypeOf2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf5(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf2(o);
}
var UnzipError = /* @__PURE__ */ (function(_Error) {
  _inherits2(UnzipError2, _Error);
  var _super = _createSuper2(UnzipError2);
  function UnzipError2() {
    _classCallCheck2(this, UnzipError2);
    return _super.apply(this, arguments);
  }
  return _createClass2(UnzipError2);
})(/* @__PURE__ */ _wrapNativeSuper2(Error));
function createUnzipError(error) {
  var unzipError = new UnzipError(error.message);
  if (error.stack) {
    unzipError.stack = error.stack;
  }
  if (Error.captureStackTrace) {
    Error.captureStackTrace(unzipError, createUnzipError);
  }
  unzipError.cause = error;
  return unzipError;
}

// node_modules/read-excel-file/modules/zip/unzipFromArrayBuffer.js
function unzipFromArrayBuffer(input, options) {
  return unzipFromArrayBufferUsingFunction(input, options, unzipAsync, true);
}
function unzipFromArrayBufferUsingFunction(input) {
  var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _filter = _ref.filter;
  var unzip2 = arguments.length > 2 ? arguments[2] : void 0;
  var isAsync = arguments.length > 3 ? arguments[3] : void 0;
  return unzip2(new Uint8Array(input), {
    // Ignore certain types of files.
    filter: function filter(file) {
      if (_filter) {
        return _filter({
          path: file.name
        });
      }
      return true;
    }
  }).then(function(result) {
    return result;
  }, function(error) {
    if (isFlateError(error)) {
      throw createUnzipError(error);
    } else {
      throw error;
    }
  });
}
function unzipAsync(archive) {
  return new Promise(function(resolve, reject) {
    unzip(archive, function(error, files) {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}
function isFlateError(error) {
  return typeof error.code === "number";
}

// node_modules/read-excel-file/modules/xlsx/file/InvalidInputError.js
function _typeof4(o) {
  "@babel/helpers - typeof";
  return _typeof4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof4(o);
}
function _defineProperties3(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey3(descriptor.key), descriptor);
  }
}
function _createClass3(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties3(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties3(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey3(arg) {
  var key = _toPrimitive3(arg, "string");
  return _typeof4(key) === "symbol" ? key : String(key);
}
function _toPrimitive3(input, hint) {
  if (_typeof4(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof4(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _classCallCheck3(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _inherits3(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf3(subClass, superClass);
}
function _createSuper3(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct3();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf3(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf3(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn3(this, result);
  };
}
function _possibleConstructorReturn3(self2, call) {
  if (call && (_typeof4(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized3(self2);
}
function _assertThisInitialized3(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _wrapNativeSuper3(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper3 = function _wrapNativeSuper5(Class2) {
    if (Class2 === null || !_isNativeFunction3(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct3(Class2, arguments, _getPrototypeOf3(this).constructor);
    }
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf3(Wrapper, Class2);
  };
  return _wrapNativeSuper3(Class);
}
function _construct3(Parent, args, Class) {
  if (_isNativeReflectConstruct3()) {
    _construct3 = Reflect.construct.bind();
  } else {
    _construct3 = function _construct5(Parent2, args2, Class2) {
      var a = [null];
      a.push.apply(a, args2);
      var Constructor = Function.bind.apply(Parent2, a);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf3(instance, Class2.prototype);
      return instance;
    };
  }
  return _construct3.apply(null, arguments);
}
function _isNativeReflectConstruct3() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
function _isNativeFunction3(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _setPrototypeOf3(o, p) {
  _setPrototypeOf3 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf5(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf3(o, p);
}
function _getPrototypeOf3(o) {
  _getPrototypeOf3 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf5(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf3(o);
}
var MESSAGES = {
  XLS_FILE_NOT_SUPPORTED: "You passed a legacy `.xls` file. Only `.xlsx` files are supported",
  FILE_NOT_SUPPORTED: "Doesn't look like an `.xlsx` file",
  INVALID_ZIP: "Couldn't unzip `.xlsx` file contents",
  NO_DATA: "No data"
};
var InvalidInputError = /* @__PURE__ */ (function(_Error) {
  _inherits3(InvalidInputError2, _Error);
  var _super = _createSuper3(InvalidInputError2);
  function InvalidInputError2(code, cause) {
    var _this;
    _classCallCheck3(this, InvalidInputError2);
    _this = _super.call(this, MESSAGES[code] || code);
    _this.code = code;
    _this.name = "InvalidInputError";
    _this.cause = cause;
    return _this;
  }
  return _createClass3(InvalidInputError2);
})(/* @__PURE__ */ _wrapNativeSuper3(Error));

// node_modules/read-excel-file/modules/export/filterZipArchiveEntry.js
function filterZipArchiveEntry(_ref) {
  var path = _ref.path;
  return path.endsWith(".xml") || path.endsWith(".xml.rels");
}

// node_modules/read-excel-file/modules/xlsx/file/createFileTypeDetector.js
var ZIP_FILE_SIGNATURE = [80, 75];
var XLS_FILE_SIGNATURE = [208, 207, 17, 224];
var FILE_TYPE_SIGNATURES = [ZIP_FILE_SIGNATURE, XLS_FILE_SIGNATURE];
var XLSX_FILE_TYPE = FILE_TYPE_SIGNATURES.indexOf(ZIP_FILE_SIGNATURE);
var XLS_FILE_TYPE = FILE_TYPE_SIGNATURES.indexOf(XLS_FILE_SIGNATURE);
function createFileTypeDetector() {
  var type;
  var possibleTypes = indexesOf(FILE_TYPE_SIGNATURES);
  var i = 0;
  return function(_byte) {
    if (isNaN(type)) {
      var t;
      possibleTypes = possibleTypes.filter(function(typeIndex) {
        if (_byte === FILE_TYPE_SIGNATURES[typeIndex][i]) {
          if (FILE_TYPE_SIGNATURES[typeIndex].length === i + 1) {
            t = typeIndex;
          }
          return true;
        }
      });
      if (possibleTypes.length === 1) {
        type = t;
      } else if (possibleTypes.length === 0) {
        type = -1;
      }
    }
    i++;
    return type;
  };
}
function indexesOf(array) {
  var indexes = [];
  var i = 0;
  while (i < array.length) {
    indexes.push(i);
    i++;
  }
  return indexes;
}

// node_modules/read-excel-file/modules/xlsx/file/validateLeadingBytes.js
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function() {
      if (i >= o.length) return { done: true };
      return { done: false, value: o[i++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function validateLeadingBytes(bytes) {
  var fileTypeDetector = createFileTypeDetector();
  for (var _iterator = _createForOfIteratorHelperLoose(bytes), _step; !(_step = _iterator()).done; ) {
    var _byte = _step.value;
    if (validateByte(_byte, fileTypeDetector)) {
      return;
    }
  }
  noFileTypeCouldBeDetermined(bytes.length);
}
function validateByte(_byte2, fileTypeDetector) {
  var fileType = fileTypeDetector(_byte2);
  if (fileType !== void 0) {
    if (fileType === XLS_FILE_TYPE) {
      throw new InvalidInputError("XLS_FILE_NOT_SUPPORTED");
    }
    if (fileType < 0) {
      throw new InvalidInputError("FILE_NOT_SUPPORTED");
    }
    return true;
  }
}
function noFileTypeCouldBeDetermined(byteCount) {
  throw new InvalidInputError(byteCount === 0 ? "NO_DATA" : "FILE_NOT_SUPPORTED");
}

// node_modules/read-excel-file/modules/utility/checkpoint.js
var latestCheckpointTimestamp;
function checkpoint(name) {
  var now = Date.now();
  var shouldOutputLog = typeof global !== "undefined" ? Boolean(global.READ_EXCEL_FILE_CHECKPOINTS) : typeof window !== "undefined" ? Boolean(window.READ_EXCEL_FILE_CHECKPOINTS) : false;
  if (shouldOutputLog) {
    if (latestCheckpointTimestamp) {
      console.log("  -", now - latestCheckpointTimestamp, "ms");
    }
    console.log("*", name);
  }
  latestCheckpointTimestamp = now;
}
function resetCheckpoint() {
  latestCheckpointTimestamp = void 0;
}

// node_modules/read-excel-file/modules/export/unpackXlsxFileBrowser.js
function unpackXlsxFile(input) {
  resetCheckpoint();
  checkpoint("unpack files");
  if (input instanceof File || input instanceof Blob) {
    return input.arrayBuffer().then(getResultFromArrayBuffer);
  }
  return Promise.resolve(input).then(getResultFromArrayBuffer);
}
function getResultFromArrayBuffer(arrayBuffer) {
  validateLeadingBytes(new Uint8Array(arrayBuffer));
  return unzipFromArrayBuffer(arrayBuffer, {
    filter: filterZipArchiveEntry
  }).then(function(result) {
    return result;
  }, function(error) {
    if (error instanceof UnzipError) {
      throw new InvalidInputError("INVALID_ZIP", error.cause);
    } else {
      throw error;
    }
  });
}

// node_modules/read-excel-file/modules/xlsx/parseSpreadsheetInfo.js
function parseSpreadsheetInfo(content, parseXml2) {
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, null, null).then(function() {
    return getResultFromState(state);
  });
  function createInitialState() {
    return {
      workbookPr: void 0,
      sheets: []
    };
  }
  function getResultFromState(state2) {
    return {
      epoch1904: state2.workbookPr ? state2.workbookPr.epoch1904 : false,
      sheets: state2.sheets
    };
  }
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "workbookPr") {
      if (!state2.workbookPr) {
        state2.workbookPr = {
          epoch1904: attributes.date1904 === "1"
        };
      }
    } else if (tagName === "sheet") {
      if (attributes.name) {
        state2.sheets.push({
          // `sheetId` attribute value is an arbitrary, `1`-based unique positive integer
          // assigned to a worksheet, typically starting at `1` for the first sheet.
          //  Deleting and adding new sheets might cause the sheetId values to become non-sequential.
          // For example, `sheetId`s could be `1`, `2`, `4`, if sheet `3` was deleted.
          id: Number(attributes.sheetId),
          name: attributes.name,
          relationId: attributes.id
        });
      }
    }
  }
}

// node_modules/read-excel-file/modules/xlsx/parseFilePaths.js
function parseFilePaths(content, parseXml2) {
  var RELATIONSHIPS_BASE_URL_TRANSITIONAL_STANDARD = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
  var RELATIONSHIPS_BASE_URL_STRICT_STANDARD = "http://purl.oclc.org/ooxml/officeDocument/relationships/";
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, null, null).then(function() {
    return getResultFromState(state);
  });
  function createInitialState() {
    return {
      sheets: {},
      sharedStrings: void 0,
      styles: void 0
    };
  }
  function getResultFromState(state2) {
    return state2;
  }
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "Relationship") {
      addFilePathForRelation(state2, attributes.Id, attributes.Type, attributes.Target);
    }
  }
  function addFilePathForRelation(state2, id, type, target) {
    switch (type) {
      case RELATIONSHIPS_BASE_URL_TRANSITIONAL_STANDARD + "styles":
      case RELATIONSHIPS_BASE_URL_STRICT_STANDARD + "styles":
        state2.styles = getFilePathFromRelationTarget(target);
        break;
      case RELATIONSHIPS_BASE_URL_TRANSITIONAL_STANDARD + "sharedStrings":
      case RELATIONSHIPS_BASE_URL_STRICT_STANDARD + "sharedStrings":
        state2.sharedStrings = getFilePathFromRelationTarget(target);
        break;
      case RELATIONSHIPS_BASE_URL_TRANSITIONAL_STANDARD + "worksheet":
      case RELATIONSHIPS_BASE_URL_STRICT_STANDARD + "worksheet":
        state2.sheets[id] = getFilePathFromRelationTarget(target);
        break;
    }
  }
  function getFilePathFromRelationTarget(path) {
    if (path[0] === "/") {
      return path.slice("/".length);
    }
    return "xl/" + path;
  }
}

// node_modules/read-excel-file/modules/xlsx/parseStyles.js
function _typeof5(o) {
  "@babel/helpers - typeof";
  return _typeof5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof5(o);
}
var _excluded = ["xfId"];
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey4(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey4(arg) {
  var key = _toPrimitive4(arg, "string");
  return _typeof5(key) === "symbol" ? key : String(key);
}
function _toPrimitive4(input, hint) {
  if (_typeof5(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof5(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function parseStyles(content, parseXml2) {
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, onCloseTag, null).then(function() {
    return getResultFromState(state);
  });
  function createInitialState() {
    return {
      numberFormats: [],
      baseStyles: [],
      // The first `164` elements of the `styles` array are going to be `undefined`
      // because those represent the built-in "default" styles in `.xlsx` specification.
      // These "default" styles have IDs from `0` to `163`, i.e. according to their index.
      styles: [],
      cellStyleXfs: false,
      cellXfs: false
    };
  }
  function getResultFromState(state2) {
    return state2.styles.map(function(style) {
      if (style.xfId) {
        var xfId = style.xfId, styleProperties = _objectWithoutProperties(style, _excluded);
        return _objectSpread(_objectSpread({}, state2.baseStyles[xfId]), styleProperties);
      } else {
        return style;
      }
    });
  }
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "numFmt") {
      var numFmtId = Number(attributes.numFmtId);
      var numberFormat = {
        id: numFmtId
      };
      if (numFmtId >= 100) {
        numberFormat.template = attributes.formatCode;
      }
      state2.numberFormats[numFmtId] = numberFormat;
    } else if (tagName === "cellStyleXfs") {
      state2.cellStyleXfs = true;
    } else if (tagName === "cellXfs") {
      state2.cellXfs = true;
    } else if (tagName === "xf") {
      if (state2.cellStyleXfs) {
        state2.baseStyles.push(parseCellStyle(attributes));
      } else if (state2.cellXfs) {
        var style = parseCellStyle(attributes, state2.numberFormats);
        if (attributes.xfId) {
          style.xfId = Number(attributes.xfId);
        }
        state2.styles.push(style);
      }
    }
  }
  function onCloseTag(tagName, state2) {
    if (tagName === "cellStyleXfs") {
      state2.cellStyleXfs = false;
    } else if (tagName === "cellXfs") {
      state2.cellXfs = false;
    }
  }
  function parseCellStyle(attributes, numberFormats) {
    var style = {};
    if (attributes.numFmtId) {
      var numFmtId = Number(attributes.numFmtId);
      if (numberFormats && numberFormats[numFmtId]) {
        style.numberFormat = numberFormats[numFmtId];
      } else {
        style.numberFormat = {
          id: numFmtId
        };
      }
    }
    return style;
  }
}

// node_modules/read-excel-file/modules/xlsx/parseSharedStrings.js
function parseSharedStrings(content, parseXml2) {
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, onCloseTag, onText).then(function() {
    return getResultFromState(state);
  });
  function createInitialState() {
    return {
      si: void 0,
      strings: []
    };
  }
  function getResultFromState(state2) {
    return state2.strings;
  }
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "si") {
      state2.si = createInitialStateInSharedString();
    } else if (state2.si) {
      onOpenTagInSharedString(tagName, attributes, state2.si);
    }
  }
  function onCloseTag(tagName, state2) {
    if (tagName === "si") {
      state2.strings.push(state2.si.string);
      state2.si = void 0;
    } else if (state2.si) {
      onCloseTagInSharedString(tagName, state2.si);
    }
  }
  function onText(text, state2) {
    if (state2.si) {
      onTextInSharedString(text, state2.si);
    }
  }
  function createInitialStateInSharedString() {
    return {
      t: false,
      r: false,
      rPh: false,
      string: ""
    };
  }
  function onOpenTagInSharedString(tagName, attributes, state2) {
    if (tagName === "t") {
      state2.t = true;
    } else if (tagName === "r") {
      state2.r = true;
    } else if (tagName === "rPh") {
      state2.rPh = true;
    }
  }
  function onCloseTagInSharedString(tagName, state2) {
    if (tagName === "t") {
      state2.t = false;
    } else if (tagName === "r") {
      state2.r = false;
    } else if (tagName === "rPh") {
      state2.rPh = false;
    }
  }
  function onTextInSharedString(text, state2) {
    if (state2.rPh) {
    } else if (state2.t) {
      if (state2.r) {
        state2.string += text;
      } else {
        state2.string = text;
      }
    }
  }
}

// node_modules/read-excel-file/modules/xlsx/parseExcelTimestamp.js
function parseExcelTimestamp(excelSerialDate, epoch1904) {
  var NUMBER_OF_LEAP_YEARS_BETWEEN_1900_AND_1970 = 17;
  var JANUARY_0TH_1900_DAY = 1;
  var ERRONEOUS_FEBRUARY_29_1990_DAY = 1;
  var DAY = 24 * 60 * 60 * 1e3;
  var DAYS_IN_YEAR = 365;
  if (epoch1904) {
    excelSerialDate += (1904 - 1900) * DAYS_IN_YEAR + JANUARY_0TH_1900_DAY + ERRONEOUS_FEBRUARY_29_1990_DAY;
  }
  var daysBeforeUnixEpoch = JANUARY_0TH_1900_DAY + ERRONEOUS_FEBRUARY_29_1990_DAY + (1970 - 1900) * DAYS_IN_YEAR + NUMBER_OF_LEAP_YEARS_BETWEEN_1900_AND_1970;
  return Math.floor((excelSerialDate - daysBeforeUnixEpoch) * DAY);
}

// node_modules/read-excel-file/modules/xlsx/isDateFormat.js
var DATE_FORMAT_POSTFIX_THAT_ALLOWS_ANY_ARBITRARY_TEXT_INPUT = /;@$/;
var DATE_FORMAT_TOKEN_SPLITTER_REG_EXP = /[^a-z0#\?%]+/;
function isDateFormat(formatId, template, dateFormatDetectionCache) {
  var cachedResult = dateFormatDetectionCache[formatId];
  if (cachedResult === void 0) {
    return dateFormatDetectionCache[formatId] = isDateFormatTemplate(template);
  }
  return cachedResult;
}
function isDateFormatTemplate(template) {
  template = template.toLowerCase();
  template = template.replace(DATE_FORMAT_POSTFIX_THAT_ALLOWS_ANY_ARBITRARY_TEXT_INPUT, "");
  template = template.replace(/\\./g, " ");
  var templates = template.split(";");
  return templates.some(isDateFormatSubTemplate);
  function isDateFormatSubTemplate(template2) {
    template2 = template2.replace(/"[^"]*"/g, " ");
    template2 = template2.replace(/(\[?[smhd]{1,2}\]?)[\.\,]00?0?/g, "$1");
    template2 = template2.replace(/\[([smhd]{1,2})\]/g, "$1");
    template2 = template2.replace(/\[[^\]]*\]/g, "");
    var tokens = template2.split(DATE_FORMAT_TOKEN_SPLITTER_REG_EXP).filter(function(_) {
      return _;
    });
    return tokens.length === 0 ? false : tokens.every(function(token) {
      return DATE_FORMAT_TEMPLATE_TOKENS.indexOf(token) >= 0;
    });
  }
}
var DATE_FORMAT_TEMPLATE_TOKENS = [
  // Seconds.
  "s",
  // Seconds (min two digits). Example: "05".
  "ss",
  // Minutes. Could also means months, depending on the context. Example: "5".
  "m",
  // Minutes (min two digits). Could also means months, depending on the context. Example: "05".
  "mm",
  // Hours. Example: "1".
  "h",
  // Hours (min two digits). Example: "01".
  "hh",
  // "am" part of "am/pm" or "AM/PM".
  "am",
  // "pm" part of "am/pm" or "AM/PM".
  "pm",
  // "a" part of "a/p" or "A/P".
  "a",
  // "p" part of "a/p" or "A/P".
  "p",
  // Day. Example: "1"
  "d",
  // Day (min two digits). Example: "01"
  "dd",
  // Short, three-letter abbreviation for the day of the week. Example: "Mon"
  "ddd",
  // Full name of the day of the week. Example: "Monday"
  "dddd",
  // Abbreviated weekday name. Example: "Mon", "Tue"
  "aaa",
  // Full weekday name. Example: "Monday", "Tuesday"
  "aaaa",
  // First letter of the weekday name. Example: "M", "T"
  "aaaaa",
  // Month (numeric). Could also mean minutes, depending on the context. Example: "1".
  "m",
  // Month (numeric, min two digits). Could also mean minutes, depending on the context. Example: "01".
  "mm",
  // Month (shortened month name). Example: "Jan".
  "mmm",
  // Month (full month name). Example: "January".
  "mmmm",
  // Month (first letter). Example: "J".
  "mmmmm",
  // Excel typically treats a single `y` the same as `yy` in custom formatting,
  // though standard practice is using `yy` or `yyyy`.
  "y",
  // Two-digit year, with a leading zero if needed. Example: "01".
  "yy",
  // Full year. Example: "2001".
  "yyyy",
  //
  // `e` or `ee` token stands for "era year" and represents an era-based year,
  // primarily supporting Japanese, Taiwanese, or Minguo/Buddhist calendar systems.
  // An example of an "era year" would be Heisei or Reiwa year numbers,
  // or Buddhist Era years which are Gregorian years plus 543.
  //
  // * `e` outputs the era year as a 4-digit (or unpadded) number.
  //   For example, `2026` or `115` depending on the active regional era.
  //   In standard Western/Gregorian locales, Excel often falls back to treating `e`
  //   similarly to a regular year layout.
  //
  // * `ee` outputs a 2-digit padded era year. For example, `26` or `15`.
  //
  // * `eeee` — While `yyyy` is the standard token for a 4-digit year,
  //   `eeee` is historically used for specialized international calendar eras
  //   (like the Japanese or Taiwanese imperial eras). However, in standard
  //   Western/Gregorian system locales, Excel treats `eeee` exactly like `yyyy`.
  "e",
  "ee",
  "eeee"
];

// node_modules/read-excel-file/modules/xlsx/isDateFormatStyle.js
function isDateFormatStyle(style, defaultDateFormat, shouldGuessDateFormatFromNumberFormatTemplate, dateFormatDetectionCache) {
  if (!style.numberFormat) {
    return false;
  }
  if (
    // Whether it's a "number format" that's conventionally used for storing date timestamps.
    BUILT_IN_DATE_FORMAT_IDS.indexOf(style.numberFormat.id) >= 0 || // Whether it's a "number format" that uses a "formatting template"
    // that the developer is certain is a date formatting template.
    defaultDateFormat && style.numberFormat.template === defaultDateFormat || // Whether the "smart formatting template" feature is not disabled
    // and it has detected that it's a date formatting template by looking at it.
    shouldGuessDateFormatFromNumberFormatTemplate && style.numberFormat.template && isDateFormat(style.numberFormat.id, style.numberFormat.template, dateFormatDetectionCache)
  ) {
    return true;
  }
  return false;
}
var LOCALE_INDEPENDENT_BUILT_IN_DATE_FORMAT_IDS = [
  14,
  // mm-dd-yy
  15,
  // d-mmm-yy
  16,
  // d-mmm
  17,
  // mmm-yy
  18,
  // h:mm AM/PM
  19,
  // h:mm:ss AM/PM
  20,
  // h:mm
  21,
  // h:mm:ss
  22,
  // m/d/yy h:mm
  45,
  // mm:ss
  46,
  // [h]:mm:ss
  47
  // mmss.0
];
var MAINLAND_CHINESE_OR_TAIWANESE_LOCALE_BUILT_IN_DATE_FORMAT_IDS = [
  27,
  // [$-404]e/m/d OR yyyy"年"m"月"
  28,
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
  29,
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
  30,
  // m/d/yy OR m-d-yy
  31,
  // yyyy"年"m"月"d"日" OR yyyy"年"m"月"d"日"
  32,
  // hh"時"mm"分" OR h"时"mm"分"
  33,
  // hh"時"mm"分"ss"秒" OR h"时"mm"分"ss"秒"
  34,
  // 上午/下午hh"時"mm"分" OR 上午/下午h"时"mm"分"
  35,
  // 上午/下午hh"時"mm"分"ss"秒" OR 上午/下午h"时"mm"分"ss"秒"
  36,
  // [$-404]e/m/d OR yyyy"年"m"月"
  50,
  // [$-404]e/m/d OR yyyy"年"m"月"
  51,
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
  52,
  // 上午/下午hh"時"mm"分" OR yyyy"年"m"月"
  53,
  // 上午/下午hh"時"mm"分"ss"秒" OR m"月"d"日"
  54,
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
  55,
  // 上午/下午hh"時"mm"分" OR 上午/下午h"时"mm"分"
  56,
  // 上午/下午hh"時"mm"分"ss"秒" OR 上午/下午h"时"mm"分"ss"秒"
  57,
  // [$-404]e/m/d OR yyyy"年"m"月"
  58
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
];
var JAPANESE_OR_KOREAN_LOCALE_BUILT_IN_DATE_FORMAT_IDS = [
  27,
  // [$-411]ge.m.d OR yyyy"年" mm"月" dd"日"
  28,
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
  29,
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
  30,
  // m/d/yy OR mm-dd-yy
  31,
  // yyyy"年"m"月"d"日" OR yyyy"년" mm"월" dd"일"
  32,
  // h"時"mm"分" OR h"시" mm"분"
  33,
  // h"時"mm"分"ss"秒" OR h"시" mm"분" ss"초"
  34,
  // yyyy"年"m"月" OR yyyy-mm-dd
  35,
  // m"月"d"日" OR yyyy-mm-dd
  36,
  // [$-411]ge.m.d OR yyyy"年" mm"月" dd"日"
  50,
  // [$-411]ge.m.d OR yyyy"年" mm"月" dd"日"
  51,
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
  52,
  // yyyy"年"m"月" OR yyyy-mm-dd
  53,
  // m"月"d"日" OR yyyy-mm-dd
  54,
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
  55,
  // yyyy"年"m"月" OR yyyy-mm-dd
  56,
  // m"月"d"日" OR yyyy-mm-dd
  57,
  // [$-411]ge.m.d OR yyyy"年" mm"月" dd"日"
  58
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
];
var THAI_LOCALE_BUILT_IN_DATE_FORMAT_IDS = [
  71,
  // ว/ด/ปปปป
  72,
  // ว-ดดด-ปป
  73,
  // ว-ดดด
  74,
  // ดดด-ปป
  75,
  // ช:นน
  76,
  // ช:นน:ทท
  77,
  // ว/ด/ปปปป ช:นน
  78,
  // นน:ทท
  79,
  // [ช]:นน:ทท
  80,
  // นน:ทท.0
  81
  // d/m/bb
];
var BUILT_IN_DATE_FORMAT_IDS = LOCALE_INDEPENDENT_BUILT_IN_DATE_FORMAT_IDS.concat(
  // Add Mainland Chinese or Taiwanese date format IDs that haven't already been added.
  MAINLAND_CHINESE_OR_TAIWANESE_LOCALE_BUILT_IN_DATE_FORMAT_IDS
).concat(
  // Add Japanese or Korean date format IDs that haven't already been added.
  JAPANESE_OR_KOREAN_LOCALE_BUILT_IN_DATE_FORMAT_IDS.filter(function(numberFormatId) {
    return MAINLAND_CHINESE_OR_TAIWANESE_LOCALE_BUILT_IN_DATE_FORMAT_IDS.indexOf(numberFormatId) < 0;
  })
).concat(
  // Add Thai date format IDs that haven't already been added.
  THAI_LOCALE_BUILT_IN_DATE_FORMAT_IDS.filter(function(numberFormatId) {
    return MAINLAND_CHINESE_OR_TAIWANESE_LOCALE_BUILT_IN_DATE_FORMAT_IDS.indexOf(numberFormatId) < 0;
  }).filter(function(numberFormatId) {
    return JAPANESE_OR_KOREAN_LOCALE_BUILT_IN_DATE_FORMAT_IDS.indexOf(numberFormatId) < 0;
  })
);

// node_modules/read-excel-file/modules/xlsx/parseCell.js
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray2(arr, i) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray2(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray2(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray2(o, minLen);
}
function _arrayLikeToArray2(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
var EMPTY_CELL_VALUE = null;
var EMPTY_CELL = [null, EMPTY_CELL_VALUE];
function parseCell(t, s, v, inlineString, _ref) {
  var _ref2 = _slicedToArray(_ref, 7), sharedStrings = _ref2[0], styles = _ref2[1], epoch1904 = _ref2[2], dateFormatDetectionCache = _ref2[3], defaultDateFormat = _ref2[4], dateTemplateParser = _ref2[5], parseNumberCustom = _ref2[6];
  switch (t || "n") {
    // `t="str"` means that the cell value is calculated using a formula.
    // The formula is defined as the text of a child `<f/>` element.
    //
    // It could optionally include a `<v/>` element whose text is the cached result
    // of the calculation from the last time the file was saved in a spreadsheet editor application.
    //
    // An optional `<v/>` element holds a pre-computed result of the formula defined by `<f/>`.
    //
    // Example:
    //
    // <c r="B3" t="str">
    // 	<f>CONCATENATE(C1,D1)</f>
    // 	<v>C1ValueD1Value</v>
    // </c>
    //
    // Here's a guide on formulas in XLSX files:
    // https://github.com/MiniMax-AI/skills/blob/main/skills/minimax-xlsx/references/validate.md
    //
    case "str":
      if (v === void 0) {
        return "VALUE_MISSING";
      }
      if (!v) {
        return EMPTY_CELL;
      }
      return ["s", v];
    // `t="inlineStr"` means that `<is/>` holds the string value.
    //
    // Inside a `<c t="inlineStr"/>`, the specification requires there to exist an `<is/>` element,
    // and within that `<is/>` element it requires to exist a `<t/>` element.
    //
    // Example:
    //
    // <c r="A1" s="1" t="inlineStr">
    //   <is>
    //     <t>
    //       Test 123
    //     </t>
    //   </is>
    // </c>
    //
    case "inlineStr":
      if (inlineString === void 0) {
        return "VALUE_MISSING";
      }
      return ["s", inlineString];
    // `type="s"` means that the string value is stored in the Shared Strings Table.
    // This way it attempts to compress the `.xlsx` file by reusing all string values
    // in case they repeat throughout the spreadsheet.
    //
    // This optimization can't be used when writing an `.xlsx` file in a "streaming"
    // fashion, i.e. when the entire spreadsheet data is not known in adavance
    // at the start of writing the file.
    // But it can be used in all other situations. And hence, it is used.
    // So this is the most common cell type, actually.
    //
    // Example:
    //
    // <c r="A3" t="s">
    //   <v>3</v>
    // </c>
    //
    case "s":
      if (!v) {
        return "VALUE_MISSING";
      }
      var sharedStringIndex = Number(v);
      if (isNaN(sharedStringIndex) || sharedStrings[sharedStringIndex] === void 0) {
        return "VALUE_INVALID";
      }
      return ["s", sharedStrings[sharedStringIndex]];
    // Boolean (TRUE/FALSE) values are stored as either "1" or "0" in cells of type "b".
    //
    // Example:
    //
    // <c r="A1" t="b">
    //   <v>1</v>
    // </c>
    //
    case "b":
      if (!v) {
        return "VALUE_MISSING";
      }
      if (v === "1") {
        return ["b", true];
      }
      if (v === "0") {
        return ["b", false];
      }
      return "VALUE_INVALID";
    // If cell type is "e", the `<v/>` element's text is an error code string (required).
    //
    // Example:
    //
    // <c r="A1" t="e">
    //   <f>1/0</f>
    //   <v>#DIV/0!</v>
    // </c>
    //
    case "e":
      if (!v) {
        return "VALUE_MISSING";
      }
      return ["e", v];
    // XLSX supports date cells of type "d", though it seems like it (almost?) never
    // uses type "d" for storing dates, preferring type "n" and numeric timestamp instead.
    // The value of a "d" cell is supposedly a string in "ISO 8601" format.
    // I haven't seen an `.xlsx` file having such cells.
    //
    // Example:
    //
    // <c r="A1" s="1" t="d">
    //   <v>
    //     2021-06-10T00:47:45.700Z
    //   </v>
    // </c>
    //
    case "d":
      if (!v) {
        return EMPTY_CELL;
      }
      var parsedDate = new Date(v);
      if (isNaN(parsedDate.valueOf())) {
        return "VALUE_INVALID";
      }
      return ["d", parsedDate.getTime()];
    // type "n" is used for numeric cells.
    //
    // An optional `s` attribute defines how this number should be formatted — 
    // it should be a zero-based index of the style (XF record) in `styles.xml`.
    //
    // Example:
    //
    // <c r="A1" s="1" t="n">
    //   <v>123.45</v>
    // </c>
    //
    case "n":
      if (!v) {
        return EMPTY_CELL;
      }
      if (s) {
        var styleId = Number(s);
        if (isNaN(styleId) || styles[styleId] === void 0) {
          return "FORMAT_INVALID";
        }
        if (isDateFormatStyle(styles[styleId], defaultDateFormat, dateTemplateParser, dateFormatDetectionCache)) {
          var timestamp = Number(v);
          if (isNaN(timestamp)) {
            return "VALUE_INVALID";
          }
          return ["d", parseExcelTimestamp(timestamp, epoch1904)];
        }
      }
      if (parseNumberCustom) {
        return ["n", v];
      }
      var number = Number(v);
      if (isNaN(number)) {
        return "VALUE_INVALID";
      }
      return ["n", number];
    default:
      return "TYPE_INVALID";
  }
}

// node_modules/read-excel-file/modules/xlsx/parseCellAddress.js
function parseCellAddress(cellAddress) {
  var columnNumber = 0;
  var i = 0;
  while (i < cellAddress.length) {
    var charCode = cellAddress.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      var rowNumber = Number(cellAddress.slice(i));
      if (isNaN(rowNumber)) {
        invalidCellAddress(cellAddress);
      }
      return [
        // Row number (starting at `1`).
        rowNumber,
        // Column number (starting at `1`).
        columnNumber
      ];
    }
    columnNumber *= 26;
    columnNumber += cellAddress.charCodeAt(i) - 64;
    i++;
  }
  invalidCellAddress(cellAddress);
}
function invalidCellAddress(cellAddress) {
  throw new Error('<c r="'.concat(cellAddress, '">'));
}

// node_modules/read-excel-file/modules/xlsx/parseSheet.js
function _slicedToArray2(arr, i) {
  return _arrayWithHoles2(arr) || _iterableToArrayLimit2(arr, i) || _unsupportedIterableToArray3(arr, i) || _nonIterableRest2();
}
function _nonIterableRest2() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArrayLimit2(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles2(arr) {
  if (Array.isArray(arr)) return arr;
}
function _createForOfIteratorHelperLoose2(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray3(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function() {
      if (i >= o.length) return { done: true };
      return { done: false, value: o[i++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray3(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray3(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray3(o, minLen);
}
function _arrayLikeToArray3(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
var EMPTY_CELL_VALUE2 = null;
function parseSheet(content, parseXml2, _ref) {
  var sharedStrings = _ref.sharedStrings, styles = _ref.styles, epoch1904 = _ref.epoch1904, dateFormatDetectionCache = _ref.dateFormatDetectionCache, options = _ref.options;
  var parseCellParameters = [
    sharedStrings,
    styles,
    epoch1904,
    dateFormatDetectionCache,
    options.dateFormat,
    // defaultDateFormat
    options.smartDateParser !== false,
    // dateTemplateParser
    options.parseNumber
    // parseNumberCustom
  ];
  var rows = [];
  var errors = [];
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, onCloseTag, onText, onProgress).then(function() {
    var _state$sheetData = state.sheetData, rowCount = _state$sheetData.rowCount, columnCount = _state$sheetData.columnCount, dataRowCount = _state$sheetData.dataRowCount, dataColumnCount = _state$sheetData.dataColumnCount;
    if (dataRowCount < rowCount) {
      rows = rows.slice(0, dataRowCount);
    }
    if (dataColumnCount < columnCount) {
      var i = 0;
      while (i < rows.length) {
        if (rows[i].length > dataColumnCount) {
          rows[i] = rows[i].slice(0, dataColumnCount);
        }
        i++;
      }
    }
    var startedAt = Date.now();
    for (var _iterator = _createForOfIteratorHelperLoose2(rows), _step; !(_step = _iterator()).done; ) {
      var row = _step.value;
      while (row.length < dataColumnCount) {
        row.push(EMPTY_CELL_VALUE2);
      }
    }
    return rows;
  });
  function createInitialState() {
    return {
      dimension: void 0,
      sheetData: void 0
    };
  }
  function getRowsFromState(state2) {
    return state2.sheetData.rows;
  }
  function setRowsInState(state2, rows2) {
    state2.sheetData.rowIndexShift += state2.sheetData.rows.length - rows2.length;
    state2.sheetData.rows = rows2;
  }
  function getErrorsFromState(state2) {
    return state2.sheetData.errors;
  }
  function setErrorsInState(state2, errors2) {
    state2.sheetData.errors = errors2;
  }
  var THROW_ON_FIRST_CELL_ERROR = true;
  function throwInvalidCellError(_ref2) {
    var row = _ref2.row, column = _ref2.column, error = _ref2.error;
    throw new InvalidSpreadsheetError("<c/> at row ".concat(row, ", col ").concat(column, ": ").concat(error));
  }
  function onProgress(end) {
    if (!state.sheetData) {
      return;
    }
    var rowsRead = getRowsFromState(state);
    var errorsEncountered = getErrorsFromState(state);
    if (end) {
      rows = rows.concat(rowsRead);
      errors = errors.concat(errorsEncountered);
      if (errors.length > 0) {
        throwInvalidCellError(errors[0]);
      }
    } else {
      if (rowsRead.length > 1) {
        var finalizedRows = rowsRead.slice(0, -1);
        rows = rows.concat(finalizedRows);
        errors = errors.concat(errorsEncountered);
        setRowsInState(state, rowsRead.slice(-1));
        setErrorsInState(state, []);
      }
    }
  }
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "dimension") {
      state2.dimension = parseSheetDimensionRef(attributes.ref);
    } else if (tagName === "sheetData") {
      state2.sheetData = createInitialStateInSheetData();
    } else if (state2.sheetData) {
      onOpenTagInSheetData(tagName, attributes, state2.sheetData);
    }
  }
  function onCloseTag(tagName, state2) {
    if (state2.sheetData) {
      onCloseTagInSheetData(tagName, state2.sheetData);
    }
  }
  function onText(text, state2) {
    if (state2.sheetData) {
      onTextInSheetData(text, state2.sheetData);
    }
  }
  function parseSheetDimensionRef(ref) {
    var dimensions = ref.split(":").map(parseCellAddress);
    if (dimensions.length === 1) {
      dimensions = [dimensions[0], dimensions[0]];
    }
    return dimensions;
  }
  function createInitialStateInSheetData() {
    return {
      c: void 0,
      rows: [],
      row: void 0,
      rowNumber: void 0,
      // How many rows have been removed from the start of `state.rows`
      // as part of `onProgress()` handler calls.
      rowIndexShift: 0,
      // Current position in the sheet.
      cursor: [0, 0],
      // Total row count.
      rowCount: 0,
      // Total column count.
      columnCount: 0,
      // Non-empty row count.
      dataRowCount: 0,
      // Non-empty column count.
      dataColumnCount: 0,
      // Cell with errors.
      errors: []
    };
  }
  function onOpenTagInSheetData(tagName, attributes, state2) {
    if (tagName === "row") {
      if (attributes.r) {
        state2.rowNumber = Number(attributes.r);
      }
      state2.row = [];
    } else if (tagName === "c") {
      state2.c = createInitialStateInCell();
      state2.c.attributes = attributes;
    } else if (state2.c) {
      onOpenTagInCell(tagName, attributes, state2.c);
    }
  }
  function onCloseTagInSheetData(tagName, state2) {
    if (tagName === "row") {
      if (state2.rowNumber) {
        var previousRowNumber = state2.rowIndexShift + state2.rows.length;
        if (state2.rowNumber <= previousRowNumber) {
          throw new InvalidSpreadsheetError("Out-of-place <row/> number ".concat(state2.rowNumber, " follows <row/> number ").concat(previousRowNumber));
        }
        while (state2.rowNumber > state2.rowIndexShift + state2.rows.length + 1) {
          state2.rows.push([]);
        }
      }
      state2.rows.push(state2.row);
      if (state2.row.length > 0) {
        state2.dataRowCount = state2.rowNumber;
      }
      if (state2.rowNumber > state2.rowCount) {
        state2.rowCount = state2.rowNumber;
      }
      state2.row = void 0;
      state2.rowNumber = void 0;
    } else if (tagName === "c") {
      var cell2 = parseCellFromXmlData(state2.c);
      if (cell2.row < state2.cursor[0] || cell2.row === state2.cursor[0] && cell2.column <= state2.cursor[1]) {
        throw new InvalidSpreadsheetError("Out-of-place <c/> at row ".concat(cell2.row, " col ").concat(cell2.column, " follows <c/> at row ").concat(state2.cursor[0], " col ").concat(state2.cursor[1]));
      }
      state2.cursor[0] = cell2.row;
      state2.cursor[1] = cell2.column;
      if (!state2.rowNumber) {
        state2.rowNumber = cell2.row;
      }
      if (cell2.error) {
        if (THROW_ON_FIRST_CELL_ERROR) {
          throwInvalidCellError(cell2);
        }
        state2.errors.push(cell2);
      } else if (cell2.value !== EMPTY_CELL_VALUE2) {
        while (cell2.column > state2.row.length + 1) {
          state2.row.push(EMPTY_CELL_VALUE2);
        }
        state2.row.push(cell2.value);
        if (cell2.column > state2.dataColumnCount) {
          state2.dataColumnCount = cell2.column;
        }
      }
      if (cell2.column > state2.columnCount) {
        state2.columnCount = cell2.column;
      }
      state2.c = void 0;
    } else if (state2.c) {
      onCloseTagInCell(tagName, state2.c);
    }
  }
  function onTextInSheetData(text, state2) {
    if (state2.c) {
      onTextInCell(text, state2.c);
    }
  }
  function parseCellFromXmlData(_ref3) {
    var attributes = _ref3.attributes, inlineString = _ref3.inlineString, vText = _ref3.vText;
    var _parseCellAddress = parseCellAddress(attributes.r), _parseCellAddress2 = _slicedToArray2(_parseCellAddress, 2), row = _parseCellAddress2[0], column = _parseCellAddress2[1];
    var errorOrTypeAndValue = parseCellAndTrimValue(attributes.t, attributes.s, vText, inlineString, parseCellParameters, options.trim !== false);
    if (typeof errorOrTypeAndValue === "string") {
      return {
        row,
        column,
        error: errorOrTypeAndValue
        // // Report the "raw" unparsed value of the cell for potential debugging.
        // // Also report the cell type and the format in case of a numeric value.
        // //
        // // For "inline string" cells, the value should actually be the `inlineString` argument
        // // rather than `vText` argument, but the only case when it could throw an error
        // // when parsing an "inline string" cell is `VALUE_MISSING` which means that
        // // `inlineString` argument is `undefined`, same as `vText` argument in this case,
        // // so the resulting `value` property is correct anyway.
        // //
        // value: vText,
        // type: attributes.t,
        // formatId: attributes.s
      };
    }
    return {
      row,
      column,
      value: parseCellValue(errorOrTypeAndValue[1], errorOrTypeAndValue[0])
    };
  }
  function parseCellAndTrimValue(t, s, v, inlineString, parameters, trimStrings) {
    var errorOrTypeAndValue = parseCellWithRepairAbility(t, s, v, inlineString, parameters);
    if (Array.isArray(errorOrTypeAndValue) && errorOrTypeAndValue[0] === "s") {
      if (trimStrings) {
        errorOrTypeAndValue[1] = errorOrTypeAndValue[1].trim();
      }
      if (errorOrTypeAndValue[1] === "") {
        return EMPTY_CELL;
      }
    }
    return errorOrTypeAndValue;
  }
  function parseCellWithRepairAbility(t, s, v, inlineString, parameters) {
    var errorOrTypeAndValue = parseCell(t, s, v, inlineString, parameters);
    if (errorOrTypeAndValue === "VALUE_MISSING") {
      switch (t || "n") {
        // * If the cell is defined by a formula.
        // * Or contains an inline string.
        // * Or contains a shared string.
        // * Or contains a boolean value.
        case "str":
        case "inlineStr":
        case "s":
        case "b":
          return EMPTY_CELL;
      }
    }
    if (t === "e") {
      return EMPTY_CELL;
    }
    return errorOrTypeAndValue;
  }
  function parseCellValue(value, type) {
    if (type === "n") {
      if (options.parseNumber) {
        return options.parseNumber(value);
      }
      return value;
    } else if (type === "d") {
      return new Date(value);
    } else {
      return value;
    }
  }
  function createInitialStateInCell() {
    return {
      v: false,
      is: false,
      t: false,
      r: false,
      rPh: false,
      vText: void 0,
      inlineString: void 0,
      attributes: void 0
    };
  }
  function onOpenTagInCell(tagName, attributes, state2) {
    if (tagName === "v") {
      state2.v = true;
    } else if (tagName === "is") {
      state2.is = true;
      state2.inlineString = "";
    } else if (tagName === "t") {
      state2.t = true;
    } else if (tagName === "r") {
      state2.r = true;
    } else if (tagName === "rPh") {
      state2.rPh = true;
    }
  }
  function onCloseTagInCell(tagName, state2) {
    if (tagName === "v") {
      state2.v = false;
      state2.vText || (state2.vText = "");
    } else if (tagName === "is") {
      state2.is = false;
    } else if (tagName === "t") {
      state2.t = false;
    } else if (tagName === "r") {
      state2.r = false;
    } else if (tagName === "rPh") {
      state2.rPh = false;
    }
  }
  function onTextInCell(text, state2) {
    if (state2.v) {
      state2.vText = text;
    } else if (state2.is) {
      if (state2.rPh) {
      } else if (state2.t) {
        if (state2.r) {
          state2.inlineString += text;
        } else {
          state2.inlineString = text;
        }
      }
    }
  }
  function getSheetDimensions(cells) {
    var minRow = cells.length === 0 ? 0 : 1;
    var minCol = cells.length === 0 ? 0 : 1;
    var maxRow = 0;
    var maxCol = 0;
    for (var _iterator2 = _createForOfIteratorHelperLoose2(cells), _step2; !(_step2 = _iterator2()).done; ) {
      var cell2 = _step2.value;
      if (maxRow < cell2.row) {
        maxRow = cell2.row;
      }
      if (maxCol < cell2.column) {
        maxCol = cell2.column;
      }
    }
    return [[minRow, minCol], [maxRow, maxCol]];
  }
}

// node_modules/read-excel-file/modules/utility/convertValuesFromUint8ArraysToStrings.js
function convertValuesFromUint8ArraysToStrings(entries) {
  checkpoint("convert files to strings");
  var convertedEntries = {};
  for (var _i = 0, _Object$keys = Object.keys(entries); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    convertedEntries[key] = strFromU82(entries[key]);
  }
  return convertedEntries;
}
function strFromU82(data) {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(data);
  } else {
    return strFromU8(data);
  }
}

// node_modules/read-excel-file/modules/utility/isPromise.js
function _typeof6(o) {
  "@babel/helpers - typeof";
  return _typeof6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof6(o);
}
function isPromise(anything) {
  return _typeof6(anything) === "object" && typeof anything.then === "function";
}

// node_modules/read-excel-file/modules/xlsx/SheetNotFoundError.js
function _typeof7(o) {
  "@babel/helpers - typeof";
  return _typeof7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof7(o);
}
function _defineProperties4(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey5(descriptor.key), descriptor);
  }
}
function _createClass4(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties4(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties4(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey5(arg) {
  var key = _toPrimitive5(arg, "string");
  return _typeof7(key) === "symbol" ? key : String(key);
}
function _toPrimitive5(input, hint) {
  if (_typeof7(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof7(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _classCallCheck4(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _inherits4(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf4(subClass, superClass);
}
function _createSuper4(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct4();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf4(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf4(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn4(this, result);
  };
}
function _possibleConstructorReturn4(self2, call) {
  if (call && (_typeof7(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized4(self2);
}
function _assertThisInitialized4(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _wrapNativeSuper4(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper4 = function _wrapNativeSuper5(Class2) {
    if (Class2 === null || !_isNativeFunction4(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct4(Class2, arguments, _getPrototypeOf4(this).constructor);
    }
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf4(Wrapper, Class2);
  };
  return _wrapNativeSuper4(Class);
}
function _construct4(Parent, args, Class) {
  if (_isNativeReflectConstruct4()) {
    _construct4 = Reflect.construct.bind();
  } else {
    _construct4 = function _construct5(Parent2, args2, Class2) {
      var a = [null];
      a.push.apply(a, args2);
      var Constructor = Function.bind.apply(Parent2, a);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf4(instance, Class2.prototype);
      return instance;
    };
  }
  return _construct4.apply(null, arguments);
}
function _isNativeReflectConstruct4() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
function _isNativeFunction4(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _setPrototypeOf4(o, p) {
  _setPrototypeOf4 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf5(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf4(o, p);
}
function _getPrototypeOf4(o) {
  _getPrototypeOf4 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf5(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf4(o);
}
var SheetNotFoundError = /* @__PURE__ */ (function(_Error) {
  _inherits4(SheetNotFoundError2, _Error);
  var _super = _createSuper4(SheetNotFoundError2);
  function SheetNotFoundError2(sheet, sheets) {
    var _this;
    _classCallCheck4(this, SheetNotFoundError2);
    _this = _super.call(this, "Sheet not found: ".concat(typeof sheet === "number" ? sheet + ". Sheet count: " + sheets.length : sheet + ". Available sheets: " + sheets.join(", ")));
    _this.name = "SheetNotFoundError";
    _this.sheet = sheet;
    _this.sheets = sheets;
    return _this;
  }
  return _createClass4(SheetNotFoundError2);
})(/* @__PURE__ */ _wrapNativeSuper4(Error));

// node_modules/read-excel-file/modules/xlsx/parseSpreadsheetContents.js
function _typeof8(o) {
  "@babel/helpers - typeof";
  return _typeof8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof8(o);
}
function _createForOfIteratorHelperLoose3(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray4(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function() {
      if (i >= o.length) return { done: true };
      return { done: false, value: o[i++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray4(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray4(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray4(o, minLen);
}
function _arrayLikeToArray4(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function ownKeys2(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys2(Object(t), true).forEach(function(r2) {
      _defineProperty2(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty2(obj, key, value) {
  key = _toPropertyKey6(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey6(arg) {
  var key = _toPrimitive6(arg, "string");
  return _typeof8(key) === "symbol" ? key : String(key);
}
function _toPrimitive6(input, hint) {
  if (_typeof8(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof8(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function parseSpreadsheetContents(parseXml2, contents_) {
  var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  var contents = convertValuesFromUint8ArraysToStrings(contents_);
  checkpoint("parse spreadsheet info and file paths");
  return readFiles(getXmlFilesAtFixedPaths(), contents, parseXml2).then(function(_ref) {
    var spreadsheetInfo = _ref.spreadsheetInfo, filePaths = _ref.filePaths;
    checkpoint('parse "shared strings" and "styles"');
    return readFiles(getXmlFilesAtNonFixedPaths(filePaths), contents, parseXml2).then(function(_ref2) {
      var sharedStrings = _ref2.sharedStrings, styles = _ref2.styles;
      var sheetRelationIdsToRead = options.sheets ? options.sheets.map(function(sheet) {
        return getSheetRelationId(sheet, spreadsheetInfo.sheets);
      }) : spreadsheetInfo.sheets.map(function(_) {
        return _.relationId;
      });
      checkpoint("parse sheet".concat(sheetRelationIdsToRead.length === 1 ? "" : "s", " data"));
      var dateFormatDetectionCache = [];
      return readFiles(getSheetDataXmlFiles(filePaths, sheetRelationIdsToRead, {
        sharedStrings,
        styles,
        epoch1904: spreadsheetInfo.epoch1904,
        dateFormatDetectionCache,
        options
      }), contents, parseXml2).then(function(sheetsData) {
        checkpoint("end");
        return sheetRelationIdsToRead.map(function(sheetRelationId) {
          return {
            sheet: getSheetNameByRelationId(sheetRelationId, spreadsheetInfo.sheets),
            data: sheetsData[sheetRelationId]
          };
        });
      });
    });
  });
}
function parseSpreadsheetContentsInWorker(createWorkerFunction2, parseXml2, contents, options) {
  if (!(options && options.parseNumber)) {
    options = _objectSpread2(_objectSpread2({}, options), {}, {
      parseNumber: null
    });
  }
  return parseSpreadsheetContents(parseXml2, contents, options);
}
function getSheetRelationId(sheet, sheets) {
  if (typeof sheet === "string") {
    for (var _iterator = _createForOfIteratorHelperLoose3(sheets), _step; !(_step = _iterator()).done; ) {
      var _sheet = _step.value;
      if (_sheet.name === sheet) {
        return _sheet.relationId;
      }
    }
  } else {
    if (sheet <= sheets.length) {
      return sheets[sheet - 1].relationId;
    }
  }
  throw new SheetNotFoundError(sheet, sheets.map(function(_) {
    return _.name;
  }));
}
function getSheetNameByRelationId(sheetRelationId, sheets) {
  for (var _iterator2 = _createForOfIteratorHelperLoose3(sheets), _step2; !(_step2 = _iterator2()).done; ) {
    var sheet = _step2.value;
    if (sheet.relationId === sheetRelationId) {
      return sheet.name;
    }
  }
  throw new Error("Sheet relation ID not found: ".concat(sheetRelationId));
}
function getXmlFilesAtFixedPaths() {
  return {
    // Read the paths to certain files inside the `.xlsx` file, which is itself just a `.zip` archive.
    // These paths aren't standardized between different spreadsheet editors.
    // https://github.com/tidyverse/readxl/issues/104
    "xl/_rels/workbook.xml.rels": {
      name: "filePaths",
      parse: parseFilePaths
    },
    // General info on the spreadsheet.
    "xl/workbook.xml": {
      name: "spreadsheetInfo",
      parse: parseSpreadsheetInfo
    }
  };
}
function getXmlFilesAtNonFixedPaths(filePaths) {
  var _ref3;
  return _ref3 = {}, _defineProperty2(_ref3, filePaths.sharedStrings || "xl/sharedStrings.xml", {
    name: "sharedStrings",
    // `parseSharedStrings()` returns a `Promise`.
    parse: parseSharedStrings,
    // It seems that "sharedStrings.xml" is not required to exist.
    // For example, that could be the case when a spreadsheet doesn't contain any strings.
    // https://github.com/catamphetamine/read-excel-file/issues/85
    fallback: Promise.resolve([])
  }), _defineProperty2(_ref3, filePaths.styles || "xl/styles.xml", {
    name: "styles",
    parse: parseStyles,
    fallback: {}
  }), _ref3;
}
function getSheetDataXmlFiles(filePaths, sheetRelationIdsToRead, sheetDataParserParameters) {
  return Object.keys(filePaths.sheets).filter(function(sheetRelationId) {
    return sheetRelationIdsToRead.includes(sheetRelationId);
  }).reduce(function(filesInfo, sheetRelationId) {
    return _objectSpread2(_objectSpread2({}, filesInfo), {}, _defineProperty2({}, filePaths.sheets[sheetRelationId], {
      name: sheetRelationId,
      // `parseSheet()` returns a `Promise`.
      parse: function parse(content, parseXml2) {
        return parseSheet(content, parseXml2, sheetDataParserParameters);
      }
    }));
  }, {});
}
function readFiles(filesInfo, contents, parseXml2) {
  var results = {};
  var _loop = function _loop3() {
    var filePath = _Object$keys[_i];
    var fileInfo = filesInfo[filePath];
    results[fileInfo.name] = contents[filePath] === void 0 ? fileInfo.fallback === void 0 ? (function() {
      throw new InvalidSpreadsheetError('"'.concat(filePath, '" file not found inside the `.xlsx` file'));
    })() : fileInfo.fallback : fileInfo.parse(contents[filePath], parseXml2);
  };
  for (var _i = 0, _Object$keys = Object.keys(filesInfo); _i < _Object$keys.length; _i++) {
    _loop();
  }
  var promises = [];
  var _loop2 = function _loop22() {
    var name = _Object$keys2[_i2];
    if (isPromise(results[name])) {
      promises.push(results[name].then(function(result) {
        results[name] = result;
      }));
    }
  };
  for (var _i2 = 0, _Object$keys2 = Object.keys(results); _i2 < _Object$keys2.length; _i2++) {
    _loop2();
  }
  if (promises.length > 0) {
    return Promise.all(promises).then(function() {
      return results;
    });
  }
  return results;
}

// node_modules/read-excel-file/modules/export/readXlsxFileBrowser.js
function readXlsxFile(input, options) {
  return unpackXlsxFile(input).then(function(contents) {
    return parseSpreadsheetContentsInWorker(createWorkerFunctionInBrowser, parseXml, contents, options);
  });
}

// assets/js/client-file-reader.js
var import_papaparse = __toESM(require_papaparse_min());
var aliases = {
  name: /^(razon social|nombre|nombres|nombre completo|cliente|empresa|nombre o razon social)$/,
  id: /^(ruc|dni|ruc o dni|ruc dni|documento|numero de documento|nro documento|nro de documento)$/,
  phone: /^(celular|telefono|telefono celular|movil|whatsapp)$/,
  email: /^(email|e mail|correo|correo electronico)$/,
  contact: /^(contacto|persona de contacto|nombre de contacto)$/,
  date: /^(fecha|fecha de ingreso)$/,
  description: /^(descripcion|descripcion del servicio|servicio)$/,
  unitPrice: /^(p unitario|precio unitario)$/,
  total: /^(monto igv 18|monto con igv|total con igv|importe total)$/,
  invoice: /^(factura|comprobante)$/,
  plate: /^placa$/,
  status: /^estado$/
};
var cell = (value) => String(value ?? "").trim();
var header = (value) => cell(value).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
async function readClientFiles(files) {
  const clients = [];
  const services = [];
  const rejected = [];
  const unsupported = [];
  for (const file of files) {
    try {
      let sheets;
      if (/\.xlsx$/i.test(file.name)) {
        sheets = await readXlsxFile(file);
      } else if (/\.csv$/i.test(file.name)) {
        const bytes = await file.arrayBuffer();
        let content;
        try {
          content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        } catch {
          content = new TextDecoder("windows-1252").decode(bytes);
        }
        sheets = [{ name: "", data: import_papaparse.default.parse(content, {
          delimiter: content.split(/\r?\n/).find((line) => /\bruc\b|\bdni\b/i.test(line))?.includes(";") ? ";" : "",
          skipEmptyLines: "greedy"
        }).data }];
      } else {
        throw Error("Usa un archivo .xlsx o .csv.");
      }
      let recognized = false;
      for (const sheet of sheets) {
        const rows = sheet.data;
        const columnsFor = (row) => Object.fromEntries(Object.entries(aliases).map(([key, pattern]) => [key, row.findIndex((value) => pattern.test(header(value)))]));
        const start = rows.findIndex((row) => {
          const c = columnsFor(row);
          return c.name >= 0 && c.id >= 0;
        });
        if (start < 0) continue;
        recognized = true;
        const columns = columnsFor(rows[start]);
        rows.slice(start + 1).forEach((row, offset) => {
          const get = (key) => cell(row[columns[key]]);
          const name = get("name");
          const id = get("id").replace(/[\s-]/g, "");
          if (!name && !id) return;
          if (name.length < 3 || !/^(\d{8}|\d{11})$/.test(id)) {
            rejected.push(`${file.name}${sheet.name ? " / " + sheet.name : ""} \xB7 fila ${start + offset + 2}`);
            return;
          }
          clients.push({
            id,
            name,
            type: id.length === 11 ? "ruc" : "dni",
            phone: get("phone"),
            email: get("email"),
            contact: get("contact")
          });
          const description = get("description");
          if (description && columns.date >= 0) {
            const rawDate = row[columns.date];
            const date = rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : get("date");
            services.push({
              clientId: id,
              date,
              description,
              unitPrice: get("unitPrice"),
              total: get("total"),
              invoice: get("invoice"),
              plate: get("plate"),
              status: get("status")
            });
          }
        });
      }
      if (!recognized) unsupported.push(file.name + " \xB7 faltan columnas de nombre y RUC/DNI.");
    } catch (error) {
      unsupported.push(file.name + " \xB7 " + error.message);
    }
  }
  return { clients, services, rejected, unsupported };
}
export {
  readClientFiles
};
/*! Bundled license information:

papaparse/papaparse.min.js:
  (* @license
  Papa Parse
  v5.7.1
  https://github.com/mholt/PapaParse
  License: MIT
  *)
*/
