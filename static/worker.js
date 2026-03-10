var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// ../node_modules/tseep/lib/types.js
var require_types = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// ../node_modules/tseep/lib/task-collection/utils.js
var require_utils = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports._fast_remove_single = undefined;
  function _fast_remove_single(arr, index) {
    if (index === -1)
      return;
    if (index === 0)
      arr.shift();
    else if (index === arr.length - 1)
      arr.length = arr.length - 1;
    else
      arr.splice(index, 1);
  }
  exports._fast_remove_single = _fast_remove_single;
});

// ../node_modules/tseep/lib/task-collection/bake-collection.js
var require_bake_collection = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.bakeCollectionVariadic = exports.bakeCollectionAwait = exports.bakeCollection = exports.BAKED_EMPTY_FUNC = undefined;
  exports.BAKED_EMPTY_FUNC = function() {};
  var FORLOOP_FALLBACK = 1500;
  function generateArgsDefCode(numArgs) {
    var argsDefCode2 = "";
    if (numArgs === 0)
      return argsDefCode2;
    for (var i = 0;i < numArgs - 1; ++i) {
      argsDefCode2 += "arg" + String(i) + ", ";
    }
    argsDefCode2 += "arg" + String(numArgs - 1);
    return argsDefCode2;
  }
  function generateBodyPartsCode(argsDefCode2, collectionLength) {
    var funcDefCode2 = "", funcCallCode2 = "";
    for (var i = 0;i < collectionLength; ++i) {
      funcDefCode2 += "var f".concat(i, " = collection[").concat(i, `];
`);
      funcCallCode2 += "f".concat(i, "(").concat(argsDefCode2, `)
`);
    }
    return { funcDefCode: funcDefCode2, funcCallCode: funcCallCode2 };
  }
  function generateBodyPartsVariadicCode(collectionLength) {
    var funcDefCode2 = "", funcCallCode2 = "";
    for (var i = 0;i < collectionLength; ++i) {
      funcDefCode2 += "var f".concat(i, " = collection[").concat(i, `];
`);
      funcCallCode2 += "f".concat(i, `.apply(undefined, arguments)
`);
    }
    return { funcDefCode: funcDefCode2, funcCallCode: funcCallCode2 };
  }
  function bakeCollection(collection, fixedArgsNum) {
    if (collection.length === 0)
      return exports.BAKED_EMPTY_FUNC;
    else if (collection.length === 1)
      return collection[0];
    var funcFactoryCode;
    if (collection.length < FORLOOP_FALLBACK) {
      var argsDefCode = generateArgsDefCode(fixedArgsNum);
      var _a = generateBodyPartsCode(argsDefCode, collection.length), funcDefCode = _a.funcDefCode, funcCallCode = _a.funcCallCode;
      funcFactoryCode = `(function(collection) {
            `.concat(funcDefCode, `
            collection = undefined;
            return (function(`).concat(argsDefCode, `) {
                `).concat(funcCallCode, `
            });
        })`);
    } else {
      var argsDefCode = generateArgsDefCode(fixedArgsNum);
      if (collection.length % 10 === 0) {
        funcFactoryCode = `(function(collection) {
                return (function(`.concat(argsDefCode, `) {
                    for (var i = 0; i < collection.length; i += 10) {
                        collection[i](`).concat(argsDefCode, `);
                        collection[i+1](`).concat(argsDefCode, `);
                        collection[i+2](`).concat(argsDefCode, `);
                        collection[i+3](`).concat(argsDefCode, `);
                        collection[i+4](`).concat(argsDefCode, `);
                        collection[i+5](`).concat(argsDefCode, `);
                        collection[i+6](`).concat(argsDefCode, `);
                        collection[i+7](`).concat(argsDefCode, `);
                        collection[i+8](`).concat(argsDefCode, `);
                        collection[i+9](`).concat(argsDefCode, `);
                    }
                });
            })`);
      } else if (collection.length % 4 === 0) {
        funcFactoryCode = `(function(collection) {
                return (function(`.concat(argsDefCode, `) {
                    for (var i = 0; i < collection.length; i += 4) {
                        collection[i](`).concat(argsDefCode, `);
                        collection[i+1](`).concat(argsDefCode, `);
                        collection[i+2](`).concat(argsDefCode, `);
                        collection[i+3](`).concat(argsDefCode, `);
                    }
                });
            })`);
      } else if (collection.length % 3 === 0) {
        funcFactoryCode = `(function(collection) {
                return (function(`.concat(argsDefCode, `) {
                    for (var i = 0; i < collection.length; i += 3) {
                        collection[i](`).concat(argsDefCode, `);
                        collection[i+1](`).concat(argsDefCode, `);
                        collection[i+2](`).concat(argsDefCode, `);
                    }
                });
            })`);
      } else {
        funcFactoryCode = `(function(collection) {
                return (function(`.concat(argsDefCode, `) {
                    for (var i = 0; i < collection.length; ++i) {
                        collection[i](`).concat(argsDefCode, `);
                    }
                });
            })`);
      }
    }
    {
      var bakeCollection_1 = undefined;
      var fixedArgsNum_1 = undefined;
      var bakeCollectionVariadic_1 = undefined;
      var bakeCollectionAwait_1 = undefined;
      var funcFactory = eval(funcFactoryCode);
      return funcFactory(collection);
    }
  }
  exports.bakeCollection = bakeCollection;
  function bakeCollectionAwait(collection, fixedArgsNum) {
    if (collection.length === 0)
      return exports.BAKED_EMPTY_FUNC;
    else if (collection.length === 1)
      return collection[0];
    var funcFactoryCode;
    if (collection.length < FORLOOP_FALLBACK) {
      var argsDefCode = generateArgsDefCode(fixedArgsNum);
      var _a = generateBodyPartsCode(argsDefCode, collection.length), funcDefCode = _a.funcDefCode, funcCallCode = _a.funcCallCode;
      funcFactoryCode = `(function(collection) {
            `.concat(funcDefCode, `
            collection = undefined;
            return (function(`).concat(argsDefCode, `) {
                return Promise.all([ `).concat(funcCallCode, ` ]);
            });
        })`);
    } else {
      var argsDefCode = generateArgsDefCode(fixedArgsNum);
      funcFactoryCode = `(function(collection) {
            return (function(`.concat(argsDefCode, `) {
                var promises = Array(collection.length);
                for (var i = 0; i < collection.length; ++i) {
                    promises[i] = collection[i](`).concat(argsDefCode, `);
                }
                return Promise.all(promises);
            });
        })`);
    }
    {
      var bakeCollection_2 = undefined;
      var fixedArgsNum_2 = undefined;
      var bakeCollectionVariadic_2 = undefined;
      var bakeCollectionAwait_2 = undefined;
      var funcFactory = eval(funcFactoryCode);
      return funcFactory(collection);
    }
  }
  exports.bakeCollectionAwait = bakeCollectionAwait;
  function bakeCollectionVariadic(collection) {
    if (collection.length === 0)
      return exports.BAKED_EMPTY_FUNC;
    else if (collection.length === 1)
      return collection[0];
    var funcFactoryCode;
    if (collection.length < FORLOOP_FALLBACK) {
      var _a = generateBodyPartsVariadicCode(collection.length), funcDefCode = _a.funcDefCode, funcCallCode = _a.funcCallCode;
      funcFactoryCode = `(function(collection) {
            `.concat(funcDefCode, `
            collection = undefined;
            return (function() {
                `).concat(funcCallCode, `
            });
        })`);
    } else {
      funcFactoryCode = `(function(collection) {
            return (function() {
                for (var i = 0; i < collection.length; ++i) {
                    collection[i].apply(undefined, arguments);
                }
            });
        })`;
    }
    {
      var bakeCollection_3 = undefined;
      var fixedArgsNum = undefined;
      var bakeCollectionVariadic_3 = undefined;
      var bakeCollectionAwait_3 = undefined;
      var funcFactory = eval(funcFactoryCode);
      return funcFactory(collection);
    }
  }
  exports.bakeCollectionVariadic = bakeCollectionVariadic;
});

// ../node_modules/tseep/lib/task-collection/task-collection.js
var require_task_collection = __commonJS((exports) => {
  var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar;i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.TaskCollection = undefined;
  var utils_1 = require_utils();
  var bake_collection_1 = require_bake_collection();
  function push_norebuild(a, b) {
    var len = this.length;
    if (len > 1) {
      if (b) {
        var _a2;
        (_a2 = this._tasks).push.apply(_a2, arguments);
        this.length += arguments.length;
      } else {
        this._tasks.push(a);
        this.length++;
      }
    } else {
      if (b) {
        if (len === 1) {
          var newAr = Array(1 + arguments.length);
          newAr.push(newAr);
          newAr.push.apply(newAr, arguments);
          this._tasks = newAr;
        } else {
          var newAr = Array(arguments.length);
          newAr.push.apply(newAr, arguments);
          this._tasks = newAr;
        }
        this.length += arguments.length;
      } else {
        if (len === 1)
          this._tasks = [this._tasks, a];
        else
          this._tasks = a;
        this.length++;
      }
    }
  }
  function push_rebuild(a, b) {
    var len = this.length;
    if (len > 1) {
      if (b) {
        var _a2;
        (_a2 = this._tasks).push.apply(_a2, arguments);
        this.length += arguments.length;
      } else {
        this._tasks.push(a);
        this.length++;
      }
    } else {
      if (b) {
        if (len === 1) {
          var newAr = Array(1 + arguments.length);
          newAr.push(newAr);
          newAr.push.apply(newAr, arguments);
          this._tasks = newAr;
        } else {
          var newAr = Array(arguments.length);
          newAr.push.apply(newAr, arguments);
          this._tasks = newAr;
        }
        this.length += arguments.length;
      } else {
        if (len === 1)
          this._tasks = [this._tasks, a];
        else
          this._tasks = a;
        this.length++;
      }
    }
    if (this.firstEmitBuildStrategy)
      this.call = rebuild_on_first_call;
    else
      this.rebuild();
  }
  function removeLast_norebuild(a) {
    if (this.length === 0)
      return;
    if (this.length === 1) {
      if (this._tasks === a) {
        this.length = 0;
      }
    } else {
      (0, utils_1._fast_remove_single)(this._tasks, this._tasks.lastIndexOf(a));
      if (this._tasks.length === 1) {
        this._tasks = this._tasks[0];
        this.length = 1;
      } else
        this.length = this._tasks.length;
    }
  }
  function removeLast_rebuild(a) {
    if (this.length === 0)
      return;
    if (this.length === 1) {
      if (this._tasks === a) {
        this.length = 0;
      }
      if (this.firstEmitBuildStrategy) {
        this.call = bake_collection_1.BAKED_EMPTY_FUNC;
        return;
      } else {
        this.rebuild();
        return;
      }
    } else {
      (0, utils_1._fast_remove_single)(this._tasks, this._tasks.lastIndexOf(a));
      if (this._tasks.length === 1) {
        this._tasks = this._tasks[0];
        this.length = 1;
      } else
        this.length = this._tasks.length;
    }
    if (this.firstEmitBuildStrategy)
      this.call = rebuild_on_first_call;
    else
      this.rebuild();
  }
  function insert_norebuild(index) {
    var _b;
    var func = [];
    for (var _i = 1;_i < arguments.length; _i++) {
      func[_i - 1] = arguments[_i];
    }
    if (this.length === 0) {
      this._tasks = func;
      this.length = 1;
    } else if (this.length === 1) {
      func.unshift(this._tasks);
      this._tasks = func;
      this.length = this._tasks.length;
    } else {
      (_b = this._tasks).splice.apply(_b, __spreadArray([index, 0], func, false));
      this.length = this._tasks.length;
    }
  }
  function insert_rebuild(index) {
    var _b;
    var func = [];
    for (var _i = 1;_i < arguments.length; _i++) {
      func[_i - 1] = arguments[_i];
    }
    if (this.length === 0) {
      this._tasks = func;
      this.length = 1;
    } else if (this.length === 1) {
      func.unshift(this._tasks);
      this._tasks = func;
      this.length = this._tasks.length;
    } else {
      (_b = this._tasks).splice.apply(_b, __spreadArray([index, 0], func, false));
      this.length = this._tasks.length;
    }
    if (this.firstEmitBuildStrategy)
      this.call = rebuild_on_first_call;
    else
      this.rebuild();
  }
  function rebuild_noawait() {
    if (this.length === 0)
      this.call = bake_collection_1.BAKED_EMPTY_FUNC;
    else if (this.length === 1)
      this.call = this._tasks;
    else
      this.call = (0, bake_collection_1.bakeCollection)(this._tasks, this.argsNum);
  }
  function rebuild_await() {
    if (this.length === 0)
      this.call = bake_collection_1.BAKED_EMPTY_FUNC;
    else if (this.length === 1)
      this.call = this._tasks;
    else
      this.call = (0, bake_collection_1.bakeCollectionAwait)(this._tasks, this.argsNum);
  }
  function rebuild_on_first_call() {
    this.rebuild();
    this.call.apply(undefined, arguments);
  }
  var TaskCollection = function() {
    function TaskCollection2(argsNum, autoRebuild, initialTasks, awaitTasks) {
      if (autoRebuild === undefined) {
        autoRebuild = true;
      }
      if (initialTasks === undefined) {
        initialTasks = null;
      }
      if (awaitTasks === undefined) {
        awaitTasks = false;
      }
      this.awaitTasks = awaitTasks;
      this.call = bake_collection_1.BAKED_EMPTY_FUNC;
      this.argsNum = argsNum;
      this.firstEmitBuildStrategy = true;
      if (awaitTasks)
        this.rebuild = rebuild_await.bind(this);
      else
        this.rebuild = rebuild_noawait.bind(this);
      this.setAutoRebuild(autoRebuild);
      if (initialTasks) {
        if (typeof initialTasks === "function") {
          this._tasks = initialTasks;
          this.length = 1;
        } else {
          this._tasks = initialTasks;
          this.length = initialTasks.length;
        }
      } else {
        this._tasks = null;
        this.length = 0;
      }
      if (autoRebuild)
        this.rebuild();
    }
    return TaskCollection2;
  }();
  exports.TaskCollection = TaskCollection;
  function fastClear() {
    this._tasks = null;
    this.length = 0;
    this.call = bake_collection_1.BAKED_EMPTY_FUNC;
  }
  function clear() {
    this._tasks = null;
    this.length = 0;
    this.call = bake_collection_1.BAKED_EMPTY_FUNC;
  }
  function growArgsNum(argsNum) {
    if (this.argsNum < argsNum) {
      this.argsNum = argsNum;
      if (this.firstEmitBuildStrategy)
        this.call = rebuild_on_first_call;
      else
        this.rebuild();
    }
  }
  function setAutoRebuild(newVal) {
    if (newVal) {
      this.push = push_rebuild.bind(this);
      this.insert = insert_rebuild.bind(this);
      this.removeLast = removeLast_rebuild.bind(this);
    } else {
      this.push = push_norebuild.bind(this);
      this.insert = insert_norebuild.bind(this);
      this.removeLast = removeLast_norebuild.bind(this);
    }
  }
  function tasksAsArray() {
    if (this.length === 0)
      return [];
    if (this.length === 1)
      return [this._tasks];
    return this._tasks;
  }
  function setTasks(tasks) {
    if (tasks.length === 0) {
      this.length = 0;
      this.call = bake_collection_1.BAKED_EMPTY_FUNC;
    } else if (tasks.length === 1) {
      this.length = 1;
      this.call = tasks[0];
      this._tasks = tasks[0];
    } else {
      this.length = tasks.length;
      this._tasks = tasks;
      if (this.firstEmitBuildStrategy)
        this.call = rebuild_on_first_call;
      else
        this.rebuild();
    }
  }
  TaskCollection.prototype.fastClear = fastClear;
  TaskCollection.prototype.clear = clear;
  TaskCollection.prototype.growArgsNum = growArgsNum;
  TaskCollection.prototype.setAutoRebuild = setAutoRebuild;
  TaskCollection.prototype.tasksAsArray = tasksAsArray;
  TaskCollection.prototype.setTasks = setTasks;
});

// ../node_modules/tseep/lib/task-collection/index.js
var require_task_collection2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(require_task_collection(), exports);
});

// ../node_modules/tseep/lib/utils.js
var require_utils2 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.nullObj = undefined;
  function nullObj() {
    var x = {};
    x.__proto__ = null;
    return x;
  }
  exports.nullObj = nullObj;
});

// ../node_modules/tseep/lib/ee.js
var require_ee = __commonJS((exports) => {
  var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar;i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.EventEmitter = undefined;
  var task_collection_1 = require_task_collection2();
  var utils_1 = require_utils();
  var utils_2 = require_utils2();
  function emit(event, a, b, c, d, e) {
    var ev = this.events[event];
    if (ev) {
      if (ev.length === 0)
        return false;
      if (ev.argsNum < 6) {
        ev.call(a, b, c, d, e);
      } else {
        var arr = new Array(ev.argsNum);
        for (var i = 0, len = arr.length;i < len; ++i) {
          arr[i] = arguments[i + 1];
        }
        ev.call.apply(undefined, arr);
      }
      return true;
    }
    return false;
  }
  function emitHasOnce(event, a, b, c, d, e) {
    var ev = this.events[event];
    var argsArr;
    if (ev !== undefined) {
      if (ev.length === 0)
        return false;
      if (ev.argsNum < 6) {
        ev.call(a, b, c, d, e);
      } else {
        argsArr = new Array(ev.argsNum);
        for (var i = 0, len = argsArr.length;i < len; ++i) {
          argsArr[i] = arguments[i + 1];
        }
        ev.call.apply(undefined, argsArr);
      }
    }
    var oev = this.onceEvents[event];
    if (oev) {
      if (typeof oev === "function") {
        this.onceEvents[event] = undefined;
        if (arguments.length < 6) {
          oev(a, b, c, d, e);
        } else {
          if (argsArr === undefined) {
            argsArr = new Array(arguments.length - 1);
            for (var i = 0, len = argsArr.length;i < len; ++i) {
              argsArr[i] = arguments[i + 1];
            }
          }
          oev.apply(undefined, argsArr);
        }
      } else {
        var fncs = oev;
        this.onceEvents[event] = undefined;
        if (arguments.length < 6) {
          for (var i = 0;i < fncs.length; ++i) {
            fncs[i](a, b, c, d, e);
          }
        } else {
          if (argsArr === undefined) {
            argsArr = new Array(arguments.length - 1);
            for (var i = 0, len = argsArr.length;i < len; ++i) {
              argsArr[i] = arguments[i + 1];
            }
          }
          for (var i = 0;i < fncs.length; ++i) {
            fncs[i].apply(undefined, argsArr);
          }
        }
      }
      return true;
    }
    return ev !== undefined;
  }
  var EventEmitter = function() {
    function EventEmitter2() {
      this.events = (0, utils_2.nullObj)();
      this.onceEvents = (0, utils_2.nullObj)();
      this._symbolKeys = new Set;
      this.maxListeners = Infinity;
    }
    Object.defineProperty(EventEmitter2.prototype, "_eventsCount", {
      get: function() {
        return this.eventNames().length;
      },
      enumerable: false,
      configurable: true
    });
    return EventEmitter2;
  }();
  exports.EventEmitter = EventEmitter;
  function once(event, listener) {
    if (this.emit === emit) {
      this.emit = emitHasOnce;
    }
    switch (typeof this.onceEvents[event]) {
      case "undefined":
        this.onceEvents[event] = listener;
        if (typeof event === "symbol")
          this._symbolKeys.add(event);
        break;
      case "function":
        this.onceEvents[event] = [this.onceEvents[event], listener];
        break;
      case "object":
        this.onceEvents[event].push(listener);
    }
    return this;
  }
  function addListener(event, listener, argsNum) {
    if (argsNum === undefined) {
      argsNum = listener.length;
    }
    if (typeof listener !== "function")
      throw new TypeError("The listener must be a function");
    var evtmap = this.events[event];
    if (!evtmap) {
      this.events[event] = new task_collection_1.TaskCollection(argsNum, true, listener, false);
      if (typeof event === "symbol")
        this._symbolKeys.add(event);
    } else {
      evtmap.push(listener);
      evtmap.growArgsNum(argsNum);
      if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length)
        console.warn('Maximum event listeners for "'.concat(String(event), '" event!'));
    }
    return this;
  }
  function removeListener(event, listener) {
    var evt = this.events[event];
    if (evt) {
      evt.removeLast(listener);
    }
    var evto = this.onceEvents[event];
    if (evto) {
      if (typeof evto === "function") {
        this.onceEvents[event] = undefined;
      } else if (typeof evto === "object") {
        if (evto.length === 1 && evto[0] === listener) {
          this.onceEvents[event] = undefined;
        } else {
          (0, utils_1._fast_remove_single)(evto, evto.lastIndexOf(listener));
        }
      }
    }
    return this;
  }
  function addListenerBound(event, listener, bindTo, argsNum) {
    if (bindTo === undefined) {
      bindTo = this;
    }
    if (argsNum === undefined) {
      argsNum = listener.length;
    }
    if (!this.boundFuncs)
      this.boundFuncs = new Map;
    var bound = listener.bind(bindTo);
    this.boundFuncs.set(listener, bound);
    return this.addListener(event, bound, argsNum);
  }
  function removeListenerBound(event, listener) {
    var _a2, _b;
    var bound = (_a2 = this.boundFuncs) === null || _a2 === undefined ? undefined : _a2.get(listener);
    (_b = this.boundFuncs) === null || _b === undefined || _b.delete(listener);
    return this.removeListener(event, bound);
  }
  function hasListeners(event) {
    return this.events[event] && !!this.events[event].length;
  }
  function prependListener(event, listener, argsNum) {
    if (argsNum === undefined) {
      argsNum = listener.length;
    }
    if (typeof listener !== "function")
      throw new TypeError("The listener must be a function");
    var evtmap = this.events[event];
    if (!evtmap || !(evtmap instanceof task_collection_1.TaskCollection)) {
      evtmap = this.events[event] = new task_collection_1.TaskCollection(argsNum, true, listener, false);
      if (typeof event === "symbol")
        this._symbolKeys.add(event);
    } else {
      evtmap.insert(0, listener);
      evtmap.growArgsNum(argsNum);
      if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length)
        console.warn('Maximum event listeners for "'.concat(String(event), '" event!'));
    }
    return this;
  }
  function prependOnceListener(event, listener) {
    if (this.emit === emit) {
      this.emit = emitHasOnce;
    }
    var evtmap = this.onceEvents[event];
    if (!evtmap) {
      this.onceEvents[event] = [listener];
      if (typeof event === "symbol")
        this._symbolKeys.add(event);
    } else if (typeof evtmap !== "object") {
      this.onceEvents[event] = [listener, evtmap];
      if (typeof event === "symbol")
        this._symbolKeys.add(event);
    } else {
      evtmap.unshift(listener);
      if (this.maxListeners !== Infinity && this.maxListeners <= evtmap.length) {
        console.warn('Maximum event listeners for "'.concat(String(event), '" once event!'));
      }
    }
    return this;
  }
  function removeAllListeners(event) {
    if (event === undefined) {
      this.events = (0, utils_2.nullObj)();
      this.onceEvents = (0, utils_2.nullObj)();
      this._symbolKeys = new Set;
    } else {
      this.events[event] = undefined;
      this.onceEvents[event] = undefined;
      if (typeof event === "symbol")
        this._symbolKeys.delete(event);
    }
    return this;
  }
  function setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }
  function getMaxListeners() {
    return this.maxListeners;
  }
  function listeners(event) {
    if (this.emit === emit)
      return this.events[event] ? this.events[event].tasksAsArray().slice() : [];
    else {
      if (this.events[event] && this.onceEvents[event]) {
        return __spreadArray(__spreadArray([], this.events[event].tasksAsArray(), true), typeof this.onceEvents[event] === "function" ? [this.onceEvents[event]] : this.onceEvents[event], true);
      } else if (this.events[event])
        return this.events[event].tasksAsArray();
      else if (this.onceEvents[event])
        return typeof this.onceEvents[event] === "function" ? [this.onceEvents[event]] : this.onceEvents[event];
      else
        return [];
    }
  }
  function eventNames() {
    var _this = this;
    if (this.emit === emit) {
      var keys = Object.keys(this.events);
      return __spreadArray(__spreadArray([], keys, true), Array.from(this._symbolKeys), true).filter(function(x) {
        return x in _this.events && _this.events[x] && _this.events[x].length;
      });
    } else {
      var keys = Object.keys(this.events).filter(function(x) {
        return _this.events[x] && _this.events[x].length;
      });
      var keysO = Object.keys(this.onceEvents).filter(function(x) {
        return _this.onceEvents[x] && _this.onceEvents[x].length;
      });
      return __spreadArray(__spreadArray(__spreadArray([], keys, true), keysO, true), Array.from(this._symbolKeys).filter(function(x) {
        return x in _this.events && _this.events[x] && _this.events[x].length || x in _this.onceEvents && _this.onceEvents[x] && _this.onceEvents[x].length;
      }), true);
    }
  }
  function listenerCount(type) {
    if (this.emit === emit)
      return this.events[type] && this.events[type].length || 0;
    else
      return (this.events[type] && this.events[type].length || 0) + (this.onceEvents[type] && this.onceEvents[type].length || 0);
  }
  EventEmitter.prototype.emit = emit;
  EventEmitter.prototype.on = addListener;
  EventEmitter.prototype.once = once;
  EventEmitter.prototype.addListener = addListener;
  EventEmitter.prototype.removeListener = removeListener;
  EventEmitter.prototype.addListenerBound = addListenerBound;
  EventEmitter.prototype.removeListenerBound = removeListenerBound;
  EventEmitter.prototype.hasListeners = hasListeners;
  EventEmitter.prototype.prependListener = prependListener;
  EventEmitter.prototype.prependOnceListener = prependOnceListener;
  EventEmitter.prototype.off = removeListener;
  EventEmitter.prototype.removeAllListeners = removeAllListeners;
  EventEmitter.prototype.setMaxListeners = setMaxListeners;
  EventEmitter.prototype.getMaxListeners = getMaxListeners;
  EventEmitter.prototype.listeners = listeners;
  EventEmitter.prototype.eventNames = eventNames;
  EventEmitter.prototype.listenerCount = listenerCount;
});

// ../node_modules/tseep/lib/index.js
var require_lib = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(require_types(), exports);
  __exportStar(require_ee(), exports);
});

// ../node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  }
  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  }
  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  }
});

// ../node_modules/debug/src/common.js
var require_common = __commonJS((exports, module) => {
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0;i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self2 = debug;
        const curr = Number(new Date);
        const ms = curr - (prevTime || curr);
        self2.diff = ms;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  module.exports = setup;
});

// ../node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module) => {
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    let m;
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  exports.log = console.debug || console.log || (() => {});
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {}
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
    } catch (error) {}
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {}
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// ../node_modules/typescript-lru-cache/dist/LRUCacheNode.js
var require_LRUCacheNode = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.LRUCacheNode = undefined;

  class LRUCacheNode {
    constructor(key, value, options) {
      const { entryExpirationTimeInMS = null, next = null, prev = null, onEntryEvicted, onEntryMarkedAsMostRecentlyUsed, clone, cloneFn } = options !== null && options !== undefined ? options : {};
      if (typeof entryExpirationTimeInMS === "number" && (entryExpirationTimeInMS <= 0 || Number.isNaN(entryExpirationTimeInMS))) {
        throw new Error("entryExpirationTimeInMS must either be null (no expiry) or greater than 0");
      }
      this.clone = clone !== null && clone !== undefined ? clone : false;
      this.cloneFn = cloneFn !== null && cloneFn !== undefined ? cloneFn : this.defaultClone;
      this.key = key;
      this.internalValue = this.clone ? this.cloneFn(value) : value;
      this.created = Date.now();
      this.entryExpirationTimeInMS = entryExpirationTimeInMS;
      this.next = next;
      this.prev = prev;
      this.onEntryEvicted = onEntryEvicted;
      this.onEntryMarkedAsMostRecentlyUsed = onEntryMarkedAsMostRecentlyUsed;
    }
    get value() {
      return this.clone ? this.cloneFn(this.internalValue) : this.internalValue;
    }
    get isExpired() {
      return typeof this.entryExpirationTimeInMS === "number" && Date.now() - this.created > this.entryExpirationTimeInMS;
    }
    invokeOnEvicted() {
      if (this.onEntryEvicted) {
        const { key, value, isExpired } = this;
        this.onEntryEvicted({ key, value, isExpired });
      }
    }
    invokeOnEntryMarkedAsMostRecentlyUsed() {
      if (this.onEntryMarkedAsMostRecentlyUsed) {
        const { key, value } = this;
        this.onEntryMarkedAsMostRecentlyUsed({ key, value });
      }
    }
    defaultClone(value) {
      if (typeof value === "boolean" || typeof value === "string" || typeof value === "number") {
        return value;
      }
      return JSON.parse(JSON.stringify(value));
    }
  }
  exports.LRUCacheNode = LRUCacheNode;
});

// ../node_modules/typescript-lru-cache/dist/LRUCache.js
var require_LRUCache = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.LRUCache = undefined;
  var LRUCacheNode_1 = require_LRUCacheNode();

  class LRUCache {
    constructor(options) {
      this.lookupTable = new Map;
      this.head = null;
      this.tail = null;
      const { maxSize = 25, entryExpirationTimeInMS = null, onEntryEvicted, onEntryMarkedAsMostRecentlyUsed, cloneFn, clone } = options !== null && options !== undefined ? options : {};
      if (Number.isNaN(maxSize) || maxSize <= 0) {
        throw new Error("maxSize must be greater than 0.");
      }
      if (typeof entryExpirationTimeInMS === "number" && (entryExpirationTimeInMS <= 0 || Number.isNaN(entryExpirationTimeInMS))) {
        throw new Error("entryExpirationTimeInMS must either be null (no expiry) or greater than 0");
      }
      this.maxSizeInternal = maxSize;
      this.entryExpirationTimeInMS = entryExpirationTimeInMS;
      this.onEntryEvicted = onEntryEvicted;
      this.onEntryMarkedAsMostRecentlyUsed = onEntryMarkedAsMostRecentlyUsed;
      this.clone = clone;
      this.cloneFn = cloneFn;
    }
    get size() {
      this.cleanCache();
      return this.lookupTable.size;
    }
    get remainingSize() {
      return this.maxSizeInternal - this.size;
    }
    get newest() {
      if (!this.head) {
        return null;
      }
      if (this.head.isExpired) {
        this.removeNodeFromListAndLookupTable(this.head);
        return this.newest;
      }
      return this.mapNodeToEntry(this.head);
    }
    get oldest() {
      if (!this.tail) {
        return null;
      }
      if (this.tail.isExpired) {
        this.removeNodeFromListAndLookupTable(this.tail);
        return this.oldest;
      }
      return this.mapNodeToEntry(this.tail);
    }
    get maxSize() {
      return this.maxSizeInternal;
    }
    set maxSize(value) {
      if (Number.isNaN(value) || value <= 0) {
        throw new Error("maxSize must be greater than 0.");
      }
      this.maxSizeInternal = value;
      this.enforceSizeLimit();
    }
    set(key, value, entryOptions) {
      const currentNodeForKey = this.lookupTable.get(key);
      if (currentNodeForKey) {
        this.removeNodeFromListAndLookupTable(currentNodeForKey);
      }
      const node = new LRUCacheNode_1.LRUCacheNode(key, value, {
        entryExpirationTimeInMS: this.entryExpirationTimeInMS,
        onEntryEvicted: this.onEntryEvicted,
        onEntryMarkedAsMostRecentlyUsed: this.onEntryMarkedAsMostRecentlyUsed,
        clone: this.clone,
        cloneFn: this.cloneFn,
        ...entryOptions
      });
      this.setNodeAsHead(node);
      this.lookupTable.set(key, node);
      this.enforceSizeLimit();
      return this;
    }
    get(key) {
      const node = this.lookupTable.get(key);
      if (!node) {
        return null;
      }
      if (node.isExpired) {
        this.removeNodeFromListAndLookupTable(node);
        return null;
      }
      this.setNodeAsHead(node);
      return node.value;
    }
    peek(key) {
      const node = this.lookupTable.get(key);
      if (!node) {
        return null;
      }
      if (node.isExpired) {
        this.removeNodeFromListAndLookupTable(node);
        return null;
      }
      return node.value;
    }
    delete(key) {
      const node = this.lookupTable.get(key);
      if (!node) {
        return false;
      }
      return this.removeNodeFromListAndLookupTable(node);
    }
    has(key) {
      const node = this.lookupTable.get(key);
      if (!node) {
        return false;
      }
      if (node.isExpired) {
        this.removeNodeFromListAndLookupTable(node);
        return false;
      }
      return true;
    }
    clear() {
      this.head = null;
      this.tail = null;
      this.lookupTable.clear();
    }
    find(condition) {
      let node = this.head;
      while (node) {
        if (node.isExpired) {
          const next = node.next;
          this.removeNodeFromListAndLookupTable(node);
          node = next;
          continue;
        }
        const entry = this.mapNodeToEntry(node);
        if (condition(entry)) {
          this.setNodeAsHead(node);
          return entry;
        }
        node = node.next;
      }
      return null;
    }
    forEach(callback) {
      let node = this.head;
      let index = 0;
      while (node) {
        if (node.isExpired) {
          const next = node.next;
          this.removeNodeFromListAndLookupTable(node);
          node = next;
          continue;
        }
        callback(node.value, node.key, index);
        node = node.next;
        index++;
      }
    }
    *values() {
      let node = this.head;
      while (node) {
        if (node.isExpired) {
          const next = node.next;
          this.removeNodeFromListAndLookupTable(node);
          node = next;
          continue;
        }
        yield node.value;
        node = node.next;
      }
    }
    *keys() {
      let node = this.head;
      while (node) {
        if (node.isExpired) {
          const next = node.next;
          this.removeNodeFromListAndLookupTable(node);
          node = next;
          continue;
        }
        yield node.key;
        node = node.next;
      }
    }
    *entries() {
      let node = this.head;
      while (node) {
        if (node.isExpired) {
          const next = node.next;
          this.removeNodeFromListAndLookupTable(node);
          node = next;
          continue;
        }
        yield this.mapNodeToEntry(node);
        node = node.next;
      }
    }
    *[Symbol.iterator]() {
      let node = this.head;
      while (node) {
        if (node.isExpired) {
          const next = node.next;
          this.removeNodeFromListAndLookupTable(node);
          node = next;
          continue;
        }
        yield this.mapNodeToEntry(node);
        node = node.next;
      }
    }
    enforceSizeLimit() {
      let node = this.tail;
      while (node !== null && this.size > this.maxSizeInternal) {
        const prev = node.prev;
        this.removeNodeFromListAndLookupTable(node);
        node = prev;
      }
    }
    mapNodeToEntry({ key, value }) {
      return {
        key,
        value
      };
    }
    setNodeAsHead(node) {
      this.removeNodeFromList(node);
      if (!this.head) {
        this.head = node;
        this.tail = node;
      } else {
        node.next = this.head;
        this.head.prev = node;
        this.head = node;
      }
      node.invokeOnEntryMarkedAsMostRecentlyUsed();
    }
    removeNodeFromList(node) {
      if (node.prev !== null) {
        node.prev.next = node.next;
      }
      if (node.next !== null) {
        node.next.prev = node.prev;
      }
      if (this.head === node) {
        this.head = node.next;
      }
      if (this.tail === node) {
        this.tail = node.prev;
      }
      node.next = null;
      node.prev = null;
    }
    removeNodeFromListAndLookupTable(node) {
      node.invokeOnEvicted();
      this.removeNodeFromList(node);
      return this.lookupTable.delete(node.key);
    }
    cleanCache() {
      if (!this.entryExpirationTimeInMS) {
        return;
      }
      const expiredNodes = [];
      for (const node of this.lookupTable.values()) {
        if (node.isExpired) {
          expiredNodes.push(node);
        }
      }
      expiredNodes.forEach((node) => this.removeNodeFromListAndLookupTable(node));
    }
  }
  exports.LRUCache = LRUCache;
});

// ../node_modules/typescript-lru-cache/dist/index.js
var require_dist = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(require_LRUCache(), exports);
});

// ../node_modules/light-bolt11-decoder/node_modules/@scure/base/lib/index.js
var require_lib2 = __commonJS((exports) => {
  /*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.bytes = exports.stringToBytes = exports.str = exports.bytesToString = exports.hex = exports.utf8 = exports.bech32m = exports.bech32 = exports.base58check = exports.base58xmr = exports.base58xrp = exports.base58flickr = exports.base58 = exports.base64url = exports.base64 = exports.base32crockford = exports.base32hex = exports.base32 = exports.base16 = exports.utils = exports.assertNumber = undefined;
  function assertNumber2(n) {
    if (!Number.isSafeInteger(n))
      throw new Error(`Wrong integer: ${n}`);
  }
  exports.assertNumber = assertNumber2;
  function chain2(...args) {
    const wrap = (a, b) => (c) => a(b(c));
    const encode = Array.from(args).reverse().reduce((acc, i2) => acc ? wrap(acc, i2.encode) : i2.encode, undefined);
    const decode2 = args.reduce((acc, i2) => acc ? wrap(acc, i2.decode) : i2.decode, undefined);
    return { encode, decode: decode2 };
  }
  function alphabet2(alphabet3) {
    return {
      encode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("alphabet.encode input should be an array of numbers");
        return digits.map((i2) => {
          assertNumber2(i2);
          if (i2 < 0 || i2 >= alphabet3.length)
            throw new Error(`Digit index outside alphabet: ${i2} (alphabet: ${alphabet3.length})`);
          return alphabet3[i2];
        });
      },
      decode: (input) => {
        if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
          throw new Error("alphabet.decode input should be array of strings");
        return input.map((letter) => {
          if (typeof letter !== "string")
            throw new Error(`alphabet.decode: not string element=${letter}`);
          const index = alphabet3.indexOf(letter);
          if (index === -1)
            throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet3}`);
          return index;
        });
      }
    };
  }
  function join2(separator = "") {
    if (typeof separator !== "string")
      throw new Error("join separator should be string");
    return {
      encode: (from) => {
        if (!Array.isArray(from) || from.length && typeof from[0] !== "string")
          throw new Error("join.encode input should be array of strings");
        for (let i2 of from)
          if (typeof i2 !== "string")
            throw new Error(`join.encode: non-string input=${i2}`);
        return from.join(separator);
      },
      decode: (to) => {
        if (typeof to !== "string")
          throw new Error("join.decode input should be string");
        return to.split(separator);
      }
    };
  }
  function padding2(bits, chr = "=") {
    assertNumber2(bits);
    if (typeof chr !== "string")
      throw new Error("padding chr should be string");
    return {
      encode(data) {
        if (!Array.isArray(data) || data.length && typeof data[0] !== "string")
          throw new Error("padding.encode input should be array of strings");
        for (let i2 of data)
          if (typeof i2 !== "string")
            throw new Error(`padding.encode: non-string input=${i2}`);
        while (data.length * bits % 8)
          data.push(chr);
        return data;
      },
      decode(input) {
        if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
          throw new Error("padding.encode input should be array of strings");
        for (let i2 of input)
          if (typeof i2 !== "string")
            throw new Error(`padding.decode: non-string input=${i2}`);
        let end = input.length;
        if (end * bits % 8)
          throw new Error("Invalid padding: string should have whole number of bytes");
        for (;end > 0 && input[end - 1] === chr; end--) {
          if (!((end - 1) * bits % 8))
            throw new Error("Invalid padding: string has too much padding");
        }
        return input.slice(0, end);
      }
    };
  }
  function normalize2(fn) {
    if (typeof fn !== "function")
      throw new Error("normalize fn should be function");
    return { encode: (from) => from, decode: (to) => fn(to) };
  }
  function convertRadix3(data, from, to) {
    if (from < 2)
      throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
    if (to < 2)
      throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
    if (!Array.isArray(data))
      throw new Error("convertRadix: data should be array");
    if (!data.length)
      return [];
    let pos = 0;
    const res = [];
    const digits = Array.from(data);
    digits.forEach((d) => {
      assertNumber2(d);
      if (d < 0 || d >= from)
        throw new Error(`Wrong integer: ${d}`);
    });
    while (true) {
      let carry = 0;
      let done = true;
      for (let i2 = pos;i2 < digits.length; i2++) {
        const digit = digits[i2];
        const digitBase = from * carry + digit;
        if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
          throw new Error("convertRadix: carry overflow");
        }
        carry = digitBase % to;
        digits[i2] = Math.floor(digitBase / to);
        if (!Number.isSafeInteger(digits[i2]) || digits[i2] * to + carry !== digitBase)
          throw new Error("convertRadix: carry overflow");
        if (!done)
          continue;
        else if (!digits[i2])
          pos = i2;
        else
          done = false;
      }
      res.push(carry);
      if (done)
        break;
    }
    for (let i2 = 0;i2 < data.length - 1 && data[i2] === 0; i2++)
      res.push(0);
    return res.reverse();
  }
  var gcd2 = (a, b) => !b ? a : gcd2(b, a % b);
  var radix2carry2 = (from, to) => from + (to - gcd2(from, to));
  function convertRadix22(data, from, to, padding3) {
    if (!Array.isArray(data))
      throw new Error("convertRadix2: data should be array");
    if (from <= 0 || from > 32)
      throw new Error(`convertRadix2: wrong from=${from}`);
    if (to <= 0 || to > 32)
      throw new Error(`convertRadix2: wrong to=${to}`);
    if (radix2carry2(from, to) > 32) {
      throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry2(from, to)}`);
    }
    let carry = 0;
    let pos = 0;
    const mask = 2 ** to - 1;
    const res = [];
    for (const n of data) {
      assertNumber2(n);
      if (n >= 2 ** from)
        throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
      carry = carry << from | n;
      if (pos + from > 32)
        throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
      pos += from;
      for (;pos >= to; pos -= to)
        res.push((carry >> pos - to & mask) >>> 0);
      carry &= 2 ** pos - 1;
    }
    carry = carry << to - pos & mask;
    if (!padding3 && pos >= from)
      throw new Error("Excess padding");
    if (!padding3 && carry)
      throw new Error(`Non-zero padding: ${carry}`);
    if (padding3 && pos > 0)
      res.push(carry >>> 0);
    return res;
  }
  function radix3(num2) {
    assertNumber2(num2);
    return {
      encode: (bytes4) => {
        if (!(bytes4 instanceof Uint8Array))
          throw new Error("radix.encode input should be Uint8Array");
        return convertRadix3(Array.from(bytes4), 2 ** 8, num2);
      },
      decode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("radix.decode input should be array of strings");
        return Uint8Array.from(convertRadix3(digits, num2, 2 ** 8));
      }
    };
  }
  function radix22(bits, revPadding = false) {
    assertNumber2(bits);
    if (bits <= 0 || bits > 32)
      throw new Error("radix2: bits should be in (0..32]");
    if (radix2carry2(8, bits) > 32 || radix2carry2(bits, 8) > 32)
      throw new Error("radix2: carry overflow");
    return {
      encode: (bytes4) => {
        if (!(bytes4 instanceof Uint8Array))
          throw new Error("radix2.encode input should be Uint8Array");
        return convertRadix22(Array.from(bytes4), 8, bits, !revPadding);
      },
      decode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("radix2.decode input should be array of strings");
        return Uint8Array.from(convertRadix22(digits, bits, 8, revPadding));
      }
    };
  }
  function unsafeWrapper2(fn) {
    if (typeof fn !== "function")
      throw new Error("unsafeWrapper fn should be function");
    return function(...args) {
      try {
        return fn.apply(null, args);
      } catch (e) {}
    };
  }
  function checksum(len, fn) {
    assertNumber2(len);
    if (typeof fn !== "function")
      throw new Error("checksum fn should be function");
    return {
      encode(data) {
        if (!(data instanceof Uint8Array))
          throw new Error("checksum.encode: input should be Uint8Array");
        const checksum2 = fn(data).slice(0, len);
        const res = new Uint8Array(data.length + len);
        res.set(data);
        res.set(checksum2, data.length);
        return res;
      },
      decode(data) {
        if (!(data instanceof Uint8Array))
          throw new Error("checksum.decode: input should be Uint8Array");
        const payload = data.slice(0, -len);
        const newChecksum = fn(payload).slice(0, len);
        const oldChecksum = data.slice(-len);
        for (let i2 = 0;i2 < len; i2++)
          if (newChecksum[i2] !== oldChecksum[i2])
            throw new Error("Invalid checksum");
        return payload;
      }
    };
  }
  exports.utils = { alphabet: alphabet2, chain: chain2, checksum, radix: radix3, radix2: radix22, join: join2, padding: padding2 };
  exports.base16 = chain2(radix22(4), alphabet2("0123456789ABCDEF"), join2(""));
  exports.base32 = chain2(radix22(5), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding2(5), join2(""));
  exports.base32hex = chain2(radix22(5), alphabet2("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding2(5), join2(""));
  exports.base32crockford = chain2(radix22(5), alphabet2("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), join2(""), normalize2((s) => s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1")));
  exports.base64 = chain2(radix22(6), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding2(6), join2(""));
  exports.base64url = chain2(radix22(6), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding2(6), join2(""));
  var genBase582 = (abc) => chain2(radix3(58), alphabet2(abc), join2(""));
  exports.base58 = genBase582("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
  exports.base58flickr = genBase582("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ");
  exports.base58xrp = genBase582("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
  var XMR_BLOCK_LEN2 = [0, 2, 3, 5, 6, 7, 9, 10, 11];
  exports.base58xmr = {
    encode(data) {
      let res = "";
      for (let i2 = 0;i2 < data.length; i2 += 8) {
        const block = data.subarray(i2, i2 + 8);
        res += exports.base58.encode(block).padStart(XMR_BLOCK_LEN2[block.length], "1");
      }
      return res;
    },
    decode(str) {
      let res = [];
      for (let i2 = 0;i2 < str.length; i2 += 11) {
        const slice = str.slice(i2, i2 + 11);
        const blockLen = XMR_BLOCK_LEN2.indexOf(slice.length);
        const block = exports.base58.decode(slice);
        for (let j = 0;j < block.length - blockLen; j++) {
          if (block[j] !== 0)
            throw new Error("base58xmr: wrong padding");
        }
        res = res.concat(Array.from(block.slice(block.length - blockLen)));
      }
      return Uint8Array.from(res);
    }
  };
  var base58check = (sha2565) => chain2(checksum(4, (data) => sha2565(sha2565(data))), exports.base58);
  exports.base58check = base58check;
  var BECH_ALPHABET2 = chain2(alphabet2("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), join2(""));
  var POLYMOD_GENERATORS2 = [996825010, 642813549, 513874426, 1027748829, 705979059];
  function bech32Polymod2(pre) {
    const b = pre >> 25;
    let chk = (pre & 33554431) << 5;
    for (let i2 = 0;i2 < POLYMOD_GENERATORS2.length; i2++) {
      if ((b >> i2 & 1) === 1)
        chk ^= POLYMOD_GENERATORS2[i2];
    }
    return chk;
  }
  function bechChecksum2(prefix, words, encodingConst = 1) {
    const len = prefix.length;
    let chk = 1;
    for (let i2 = 0;i2 < len; i2++) {
      const c = prefix.charCodeAt(i2);
      if (c < 33 || c > 126)
        throw new Error(`Invalid prefix (${prefix})`);
      chk = bech32Polymod2(chk) ^ c >> 5;
    }
    chk = bech32Polymod2(chk);
    for (let i2 = 0;i2 < len; i2++)
      chk = bech32Polymod2(chk) ^ prefix.charCodeAt(i2) & 31;
    for (let v of words)
      chk = bech32Polymod2(chk) ^ v;
    for (let i2 = 0;i2 < 6; i2++)
      chk = bech32Polymod2(chk);
    chk ^= encodingConst;
    return BECH_ALPHABET2.encode(convertRadix22([chk % 2 ** 30], 30, 5, false));
  }
  function genBech322(encoding) {
    const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
    const _words = radix22(5);
    const fromWords = _words.decode;
    const toWords = _words.encode;
    const fromWordsUnsafe = unsafeWrapper2(fromWords);
    function encode(prefix, words, limit2 = 90) {
      if (typeof prefix !== "string")
        throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
      if (!Array.isArray(words) || words.length && typeof words[0] !== "number")
        throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
      const actualLength = prefix.length + 7 + words.length;
      if (limit2 !== false && actualLength > limit2)
        throw new TypeError(`Length ${actualLength} exceeds limit ${limit2}`);
      prefix = prefix.toLowerCase();
      return `${prefix}1${BECH_ALPHABET2.encode(words)}${bechChecksum2(prefix, words, ENCODING_CONST)}`;
    }
    function decode2(str, limit2 = 90) {
      if (typeof str !== "string")
        throw new Error(`bech32.decode input should be string, not ${typeof str}`);
      if (str.length < 8 || limit2 !== false && str.length > limit2)
        throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit2})`);
      const lowered = str.toLowerCase();
      if (str !== lowered && str !== str.toUpperCase())
        throw new Error(`String must be lowercase or uppercase`);
      str = lowered;
      const sepIndex = str.lastIndexOf("1");
      if (sepIndex === 0 || sepIndex === -1)
        throw new Error(`Letter "1" must be present between prefix and data only`);
      const prefix = str.slice(0, sepIndex);
      const _words2 = str.slice(sepIndex + 1);
      if (_words2.length < 6)
        throw new Error("Data must be at least 6 characters long");
      const words = BECH_ALPHABET2.decode(_words2).slice(0, -6);
      const sum = bechChecksum2(prefix, words, ENCODING_CONST);
      if (!_words2.endsWith(sum))
        throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
      return { prefix, words };
    }
    const decodeUnsafe = unsafeWrapper2(decode2);
    function decodeToBytes(str) {
      const { prefix, words } = decode2(str, false);
      return { prefix, words, bytes: fromWords(words) };
    }
    return { encode, decode: decode2, decodeToBytes, decodeUnsafe, fromWords, fromWordsUnsafe, toWords };
  }
  exports.bech32 = genBech322("bech32");
  exports.bech32m = genBech322("bech32m");
  exports.utf8 = {
    encode: (data) => new TextDecoder().decode(data),
    decode: (str) => new TextEncoder().encode(str)
  };
  exports.hex = chain2(radix22(4), alphabet2("0123456789abcdef"), join2(""), normalize2((s) => {
    if (typeof s !== "string" || s.length % 2)
      throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
    return s.toLowerCase();
  }));
  var CODERS2 = {
    utf8: exports.utf8,
    hex: exports.hex,
    base16: exports.base16,
    base32: exports.base32,
    base64: exports.base64,
    base64url: exports.base64url,
    base58: exports.base58,
    base58xmr: exports.base58xmr
  };
  var coderTypeError2 = `Invalid encoding type. Available types: ${Object.keys(CODERS2).join(", ")}`;
  var bytesToString = (type, bytes4) => {
    if (typeof type !== "string" || !CODERS2.hasOwnProperty(type))
      throw new TypeError(coderTypeError2);
    if (!(bytes4 instanceof Uint8Array))
      throw new TypeError("bytesToString() expects Uint8Array");
    return CODERS2[type].encode(bytes4);
  };
  exports.bytesToString = bytesToString;
  exports.str = exports.bytesToString;
  var stringToBytes = (type, str) => {
    if (!CODERS2.hasOwnProperty(type))
      throw new TypeError(coderTypeError2);
    if (typeof str !== "string")
      throw new TypeError("stringToBytes() expects string");
    return CODERS2[type].decode(str);
  };
  exports.stringToBytes = stringToBytes;
  exports.bytes = exports.stringToBytes;
});

// ../node_modules/light-bolt11-decoder/bolt11.js
var require_bolt11 = __commonJS((exports, module) => {
  var { bech32: bech322, hex: hex2, utf8: utf82 } = require_lib2();
  var DEFAULTNETWORK = {
    bech32: "bc",
    pubKeyHash: 0,
    scriptHash: 5,
    validWitnessVersions: [0]
  };
  var TESTNETWORK = {
    bech32: "tb",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  };
  var SIGNETNETWORK = {
    bech32: "tbs",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  };
  var REGTESTNETWORK = {
    bech32: "bcrt",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  };
  var SIMNETWORK = {
    bech32: "sb",
    pubKeyHash: 63,
    scriptHash: 123,
    validWitnessVersions: [0]
  };
  var FEATUREBIT_ORDER = [
    "option_data_loss_protect",
    "initial_routing_sync",
    "option_upfront_shutdown_script",
    "gossip_queries",
    "var_onion_optin",
    "gossip_queries_ex",
    "option_static_remotekey",
    "payment_secret",
    "basic_mpp",
    "option_support_large_channel"
  ];
  var DIVISORS = {
    m: BigInt(1000),
    u: BigInt(1e6),
    n: BigInt(1e9),
    p: BigInt(1000000000000)
  };
  var MAX_MILLISATS = BigInt("2100000000000000000");
  var MILLISATS_PER_BTC = BigInt(100000000000);
  var TAGCODES = {
    payment_hash: 1,
    payment_secret: 16,
    description: 13,
    payee: 19,
    description_hash: 23,
    expiry: 6,
    min_final_cltv_expiry: 24,
    fallback_address: 9,
    route_hint: 3,
    feature_bits: 5,
    metadata: 27
  };
  var TAGNAMES = {};
  for (let i2 = 0, keys = Object.keys(TAGCODES);i2 < keys.length; i2++) {
    const currentName = keys[i2];
    const currentCode = TAGCODES[keys[i2]].toString();
    TAGNAMES[currentCode] = currentName;
  }
  var TAGPARSERS = {
    1: (words) => hex2.encode(bech322.fromWordsUnsafe(words)),
    16: (words) => hex2.encode(bech322.fromWordsUnsafe(words)),
    13: (words) => utf82.encode(bech322.fromWordsUnsafe(words)),
    19: (words) => hex2.encode(bech322.fromWordsUnsafe(words)),
    23: (words) => hex2.encode(bech322.fromWordsUnsafe(words)),
    27: (words) => hex2.encode(bech322.fromWordsUnsafe(words)),
    6: wordsToIntBE,
    24: wordsToIntBE,
    3: routingInfoParser,
    5: featureBitsParser
  };
  function getUnknownParser(tagCode) {
    return (words) => ({
      tagCode: parseInt(tagCode),
      words: bech322.encode("unknown", words, Number.MAX_SAFE_INTEGER)
    });
  }
  function wordsToIntBE(words) {
    return words.reverse().reduce((total, item, index) => {
      return total + item * Math.pow(32, index);
    }, 0);
  }
  function routingInfoParser(words) {
    const routes = [];
    let pubkey, shortChannelId, feeBaseMSats, feeProportionalMillionths, cltvExpiryDelta;
    let routesBuffer = bech322.fromWordsUnsafe(words);
    while (routesBuffer.length > 0) {
      pubkey = hex2.encode(routesBuffer.slice(0, 33));
      shortChannelId = hex2.encode(routesBuffer.slice(33, 41));
      feeBaseMSats = parseInt(hex2.encode(routesBuffer.slice(41, 45)), 16);
      feeProportionalMillionths = parseInt(hex2.encode(routesBuffer.slice(45, 49)), 16);
      cltvExpiryDelta = parseInt(hex2.encode(routesBuffer.slice(49, 51)), 16);
      routesBuffer = routesBuffer.slice(51);
      routes.push({
        pubkey,
        short_channel_id: shortChannelId,
        fee_base_msat: feeBaseMSats,
        fee_proportional_millionths: feeProportionalMillionths,
        cltv_expiry_delta: cltvExpiryDelta
      });
    }
    return routes;
  }
  function featureBitsParser(words) {
    const bools = words.slice().reverse().map((word) => [
      !!(word & 1),
      !!(word & 2),
      !!(word & 4),
      !!(word & 8),
      !!(word & 16)
    ]).reduce((finalArr, itemArr) => finalArr.concat(itemArr), []);
    while (bools.length < FEATUREBIT_ORDER.length * 2) {
      bools.push(false);
    }
    const featureBits = {};
    FEATUREBIT_ORDER.forEach((featureName, index) => {
      let status;
      if (bools[index * 2]) {
        status = "required";
      } else if (bools[index * 2 + 1]) {
        status = "supported";
      } else {
        status = "unsupported";
      }
      featureBits[featureName] = status;
    });
    const extraBits = bools.slice(FEATUREBIT_ORDER.length * 2);
    featureBits.extra_bits = {
      start_bit: FEATUREBIT_ORDER.length * 2,
      bits: extraBits,
      has_required: extraBits.reduce((result, bit, index) => index % 2 !== 0 ? result || false : result || bit, false)
    };
    return featureBits;
  }
  function hrpToMillisat(hrpString, outputString) {
    let divisor, value;
    if (hrpString.slice(-1).match(/^[munp]$/)) {
      divisor = hrpString.slice(-1);
      value = hrpString.slice(0, -1);
    } else if (hrpString.slice(-1).match(/^[^munp0-9]$/)) {
      throw new Error("Not a valid multiplier for the amount");
    } else {
      value = hrpString;
    }
    if (!value.match(/^\d+$/))
      throw new Error("Not a valid human readable amount");
    const valueBN = BigInt(value);
    const millisatoshisBN = divisor ? valueBN * MILLISATS_PER_BTC / DIVISORS[divisor] : valueBN * MILLISATS_PER_BTC;
    if (divisor === "p" && !(valueBN % BigInt(10) === BigInt(0)) || millisatoshisBN > MAX_MILLISATS) {
      throw new Error("Amount is outside of valid range");
    }
    return outputString ? millisatoshisBN.toString() : millisatoshisBN;
  }
  function decode2(paymentRequest, network) {
    if (typeof paymentRequest !== "string")
      throw new Error("Lightning Payment Request must be string");
    if (paymentRequest.slice(0, 2).toLowerCase() !== "ln")
      throw new Error("Not a proper lightning payment request");
    const sections = [];
    const decoded = bech322.decode(paymentRequest, Number.MAX_SAFE_INTEGER);
    paymentRequest = paymentRequest.toLowerCase();
    const prefix = decoded.prefix;
    let words = decoded.words;
    let letters = paymentRequest.slice(prefix.length + 1);
    let sigWords = words.slice(-104);
    words = words.slice(0, -104);
    let prefixMatches = prefix.match(/^ln(\S+?)(\d*)([a-zA-Z]?)$/);
    if (prefixMatches && !prefixMatches[2])
      prefixMatches = prefix.match(/^ln(\S+)$/);
    if (!prefixMatches) {
      throw new Error("Not a proper lightning payment request");
    }
    sections.push({
      name: "lightning_network",
      letters: "ln"
    });
    const bech32Prefix = prefixMatches[1];
    let coinNetwork;
    if (!network) {
      switch (bech32Prefix) {
        case DEFAULTNETWORK.bech32:
          coinNetwork = DEFAULTNETWORK;
          break;
        case TESTNETWORK.bech32:
          coinNetwork = TESTNETWORK;
          break;
        case SIGNETNETWORK.bech32:
          coinNetwork = SIGNETNETWORK;
          break;
        case REGTESTNETWORK.bech32:
          coinNetwork = REGTESTNETWORK;
          break;
        case SIMNETWORK.bech32:
          coinNetwork = SIMNETWORK;
          break;
      }
    } else {
      if (network.bech32 === undefined || network.pubKeyHash === undefined || network.scriptHash === undefined || !Array.isArray(network.validWitnessVersions))
        throw new Error("Invalid network");
      coinNetwork = network;
    }
    if (!coinNetwork || coinNetwork.bech32 !== bech32Prefix) {
      throw new Error("Unknown coin bech32 prefix");
    }
    sections.push({
      name: "coin_network",
      letters: bech32Prefix,
      value: coinNetwork
    });
    const value = prefixMatches[2];
    let millisatoshis;
    if (value) {
      const divisor = prefixMatches[3];
      millisatoshis = hrpToMillisat(value + divisor, true);
      sections.push({
        name: "amount",
        letters: prefixMatches[2] + prefixMatches[3],
        value: millisatoshis
      });
    } else {
      millisatoshis = null;
    }
    sections.push({
      name: "separator",
      letters: "1"
    });
    const timestamp = wordsToIntBE(words.slice(0, 7));
    words = words.slice(7);
    sections.push({
      name: "timestamp",
      letters: letters.slice(0, 7),
      value: timestamp
    });
    letters = letters.slice(7);
    let tagName, parser, tagLength, tagWords;
    while (words.length > 0) {
      const tagCode = words[0].toString();
      tagName = TAGNAMES[tagCode] || "unknown_tag";
      parser = TAGPARSERS[tagCode] || getUnknownParser(tagCode);
      words = words.slice(1);
      tagLength = wordsToIntBE(words.slice(0, 2));
      words = words.slice(2);
      tagWords = words.slice(0, tagLength);
      words = words.slice(tagLength);
      sections.push({
        name: tagName,
        tag: letters[0],
        letters: letters.slice(0, 1 + 2 + tagLength),
        value: parser(tagWords)
      });
      letters = letters.slice(1 + 2 + tagLength);
    }
    sections.push({
      name: "signature",
      letters: letters.slice(0, 104),
      value: hex2.encode(bech322.fromWordsUnsafe(sigWords))
    });
    letters = letters.slice(104);
    sections.push({
      name: "checksum",
      letters
    });
    let result = {
      paymentRequest,
      sections,
      get expiry() {
        let exp = sections.find((s) => s.name === "expiry");
        if (exp)
          return getValue("timestamp") + exp.value;
      },
      get route_hints() {
        return sections.filter((s) => s.name === "route_hint").map((s) => s.value);
      }
    };
    for (let name in TAGCODES) {
      if (name === "route_hint") {
        continue;
      }
      Object.defineProperty(result, name, {
        get() {
          return getValue(name);
        }
      });
    }
    return result;
    function getValue(name) {
      let section = sections.find((s) => s.name === name);
      return section ? section.value : undefined;
    }
  }
  module.exports = {
    decode: decode2,
    hrpToMillisat
  };
});

// ../node_modules/wa-sqlite/dist/wa-sqlite-async.mjs
var Module = (() => {
  var _scriptName = import.meta.url;
  return function(moduleArg = {}) {
    var moduleRtn;
    var Module2 = moduleArg;
    var readyPromiseResolve, readyPromiseReject;
    var readyPromise = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var ENVIRONMENT_IS_WEB = typeof window == "object";
    var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
    var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
    var moduleOverrides = Object.assign({}, Module2);
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module2["locateFile"]) {
        return Module2["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptName) {
        scriptDirectory = _scriptName;
      }
      if (scriptDirectory.startsWith("blob:")) {
        scriptDirectory = "";
      } else {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
      }
      {
        read_ = (url) => {
          var xhr = new XMLHttpRequest;
          xhr.open("GET", url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(xhr.response);
          };
        }
        readAsync = (url, onload, onerror) => {
          fetch(url, { credentials: "same-origin" }).then((response) => {
            if (response.ok) {
              return response.arrayBuffer();
            }
            return Promise.reject(new Error(response.status + " : " + response.url));
          }).then(onload, onerror);
        };
      }
    } else {}
    var out = Module2["print"] || console.log.bind(console);
    var err = Module2["printErr"] || console.error.bind(console);
    Object.assign(Module2, moduleOverrides);
    moduleOverrides = null;
    if (Module2["arguments"])
      arguments_ = Module2["arguments"];
    if (Module2["thisProgram"])
      thisProgram = Module2["thisProgram"];
    if (Module2["quit"])
      quit_ = Module2["quit"];
    var wasmBinary;
    if (Module2["wasmBinary"])
      wasmBinary = Module2["wasmBinary"];
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateMemoryViews() {
      var b = wasmMemory.buffer;
      Module2["HEAP8"] = HEAP8 = new Int8Array(b);
      Module2["HEAP16"] = HEAP16 = new Int16Array(b);
      Module2["HEAPU8"] = HEAPU8 = new Uint8Array(b);
      Module2["HEAPU16"] = HEAPU16 = new Uint16Array(b);
      Module2["HEAP32"] = HEAP32 = new Int32Array(b);
      Module2["HEAPU32"] = HEAPU32 = new Uint32Array(b);
      Module2["HEAPF32"] = HEAPF32 = new Float32Array(b);
      Module2["HEAPF64"] = HEAPF64 = new Float64Array(b);
    }
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    function preRun() {
      if (Module2["preRun"]) {
        if (typeof Module2["preRun"] == "function")
          Module2["preRun"] = [Module2["preRun"]];
        while (Module2["preRun"].length) {
          addOnPreRun(Module2["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      if (!Module2["noFSInit"] && !FS.init.initialized)
        FS.init();
      FS.ignorePermissions = false;
      TTY.init();
      callRuntimeCallbacks(__ATINIT__);
    }
    function preMain() {
      callRuntimeCallbacks(__ATMAIN__);
    }
    function postRun() {
      if (Module2["postRun"]) {
        if (typeof Module2["postRun"] == "function")
          Module2["postRun"] = [Module2["postRun"]];
        while (Module2["postRun"].length) {
          addOnPostRun(Module2["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function getUniqueRunDependency(id) {
      return id;
    }
    function addRunDependency(id) {
      runDependencies++;
      Module2["monitorRunDependencies"]?.(runDependencies);
    }
    function removeRunDependency(id) {
      runDependencies--;
      Module2["monitorRunDependencies"]?.(runDependencies);
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      Module2["onAbort"]?.(what);
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var dataURIPrefix = "data:application/octet-stream;base64,";
    var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
    function findWasmBinary() {
      if (Module2["locateFile"]) {
        var f = "wa-sqlite-async.wasm";
        if (!isDataURI(f)) {
          return locateFile(f);
        }
        return f;
      }
      return new URL("wa-sqlite-async.wasm", import.meta.url).href;
    }
    var wasmBinaryFile;
    function getBinarySync(file) {
      if (file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary);
      }
      if (readBinary) {
        return readBinary(file);
      }
      throw "both async and sync fetching of the wasm failed";
    }
    function getBinaryPromise(binaryFile) {
      if (!wasmBinary) {
        return new Promise((resolve, reject) => {
          readAsync(binaryFile, (response) => resolve(new Uint8Array(response)), (error) => {
            try {
              resolve(getBinarySync(binaryFile));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      return Promise.resolve().then(() => getBinarySync(binaryFile));
    }
    function instantiateArrayBuffer(binaryFile, imports, receiver) {
      return getBinaryPromise(binaryFile).then((binary) => WebAssembly.instantiate(binary, imports)).then(receiver, (reason) => {
        err(`failed to asynchronously prepare wasm: ${reason}`);
        abort(reason);
      });
    }
    function instantiateAsync(binary, binaryFile, imports, callback) {
      if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && typeof fetch == "function") {
        return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
          var result = WebAssembly.instantiateStreaming(response, imports);
          return result.then(callback, function(reason) {
            err(`wasm streaming compile failed: ${reason}`);
            err("falling back to ArrayBuffer instantiation");
            return instantiateArrayBuffer(binaryFile, imports, callback);
          });
        });
      }
      return instantiateArrayBuffer(binaryFile, imports, callback);
    }
    function getWasmImports() {
      return { a: wasmImports };
    }
    function createWasm() {
      var info = getWasmImports();
      function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmExports = Asyncify.instrumentWasmExports(wasmExports);
        wasmMemory = wasmExports["la"];
        updateMemoryViews();
        wasmTable = wasmExports["ef"];
        addOnInit(wasmExports["ma"]);
        removeRunDependency("wasm-instantiate");
        return wasmExports;
      }
      addRunDependency("wasm-instantiate");
      function receiveInstantiationResult(result) {
        receiveInstance(result["instance"]);
      }
      if (Module2["instantiateWasm"]) {
        try {
          return Module2["instantiateWasm"](info, receiveInstance);
        } catch (e) {
          err(`Module.instantiateWasm callback failed with error: ${e}`);
          readyPromiseReject(e);
        }
      }
      if (!wasmBinaryFile)
        wasmBinaryFile = findWasmBinary();
      instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
      return {};
    }
    var tempDouble;
    var tempI64;
    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }
    var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        callbacks.shift()(Module2);
      }
    };
    function getValue(ptr, type = "i8") {
      if (type.endsWith("*"))
        type = "*";
      switch (type) {
        case "i1":
          return HEAP8[ptr];
        case "i8":
          return HEAP8[ptr];
        case "i16":
          return HEAP16[ptr >> 1];
        case "i32":
          return HEAP32[ptr >> 2];
        case "i64":
          abort("to do getValue(i64) use WASM_BIGINT");
        case "float":
          return HEAPF32[ptr >> 2];
        case "double":
          return HEAPF64[ptr >> 3];
        case "*":
          return HEAPU32[ptr >> 2];
        default:
          abort(`invalid type for getValue: ${type}`);
      }
    }
    var noExitRuntime = Module2["noExitRuntime"] || true;
    function setValue(ptr, value, type = "i8") {
      if (type.endsWith("*"))
        type = "*";
      switch (type) {
        case "i1":
          HEAP8[ptr] = value;
          break;
        case "i8":
          HEAP8[ptr] = value;
          break;
        case "i16":
          HEAP16[ptr >> 1] = value;
          break;
        case "i32":
          HEAP32[ptr >> 2] = value;
          break;
        case "i64":
          abort("to do setValue(i64) use WASM_BIGINT");
        case "float":
          HEAPF32[ptr >> 2] = value;
          break;
        case "double":
          HEAPF64[ptr >> 3] = value;
          break;
        case "*":
          HEAPU32[ptr >> 2] = value;
          break;
        default:
          abort(`invalid type for setValue: ${type}`);
      }
    }
    var stackRestore = (val) => __emscripten_stack_restore(val);
    var stackSave = () => _emscripten_stack_get_current();
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
    var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx))
        ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = "";
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode((u0 & 31) << 6 | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = (u0 & 15) << 12 | u1 << 6 | u2;
        } else {
          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        }
      }
      return str;
    };
    var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    var ___assert_fail = (condition, filename, line, func) => {
      abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
    };
    var PATH = { isAbs: (path) => path.charAt(0) === "/", splitPath: (filename) => {
      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return splitPathRe.exec(filename).slice(1);
    }, normalizeArray: (parts, allowAboveRoot) => {
      var up = 0;
      for (var i = parts.length - 1;i >= 0; i--) {
        var last = parts[i];
        if (last === ".") {
          parts.splice(i, 1);
        } else if (last === "..") {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (;up; up--) {
          parts.unshift("..");
        }
      }
      return parts;
    }, normalize: (path) => {
      var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
      path = PATH.normalizeArray(path.split("/").filter((p) => !!p), !isAbsolute).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    }, dirname: (path) => {
      var result = PATH.splitPath(path), root = result[0], dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    }, basename: (path) => {
      if (path === "/")
        return "/";
      path = PATH.normalize(path);
      path = path.replace(/\/$/, "");
      var lastSlash = path.lastIndexOf("/");
      if (lastSlash === -1)
        return path;
      return path.substr(lastSlash + 1);
    }, join: (...paths) => PATH.normalize(paths.join("/")), join2: (l, r) => PATH.normalize(l + "/" + r) };
    var initRandomFill = () => {
      if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
        return (view) => crypto.getRandomValues(view);
      } else
        abort("initRandomDevice");
    };
    var randomFill = (view) => (randomFill = initRandomFill())(view);
    var PATH_FS = { resolve: (...args) => {
      var resolvedPath = "", resolvedAbsolute = false;
      for (var i = args.length - 1;i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? args[i] : FS.cwd();
        if (typeof path != "string") {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          return "";
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = PATH.isAbs(path);
      }
      resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }, relative: (from, to) => {
      from = PATH_FS.resolve(from).substr(1);
      to = PATH_FS.resolve(to).substr(1);
      function trim(arr) {
        var start = 0;
        for (;start < arr.length; start++) {
          if (arr[start] !== "")
            break;
        }
        var end = arr.length - 1;
        for (;end >= 0; end--) {
          if (arr[end] !== "")
            break;
        }
        if (start > end)
          return [];
        return arr.slice(start, end - start + 1);
      }
      var fromParts = trim(from.split("/"));
      var toParts = trim(to.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0;i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      var outputParts = [];
      for (var i = samePartsLength;i < fromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    } };
    var FS_stdin_getChar_buffer = [];
    var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0;i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
          len++;
        } else if (c <= 2047) {
          len += 2;
        } else if (c >= 55296 && c <= 57343) {
          len += 4;
          ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
    var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      if (!(maxBytesToWrite > 0))
        return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0;i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = 65536 + ((u & 1023) << 10) | u1 & 1023;
        }
        if (u <= 127) {
          if (outIdx >= endIdx)
            break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx)
            break;
          heap[outIdx++] = 192 | u >> 6;
          heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx)
            break;
          heap[outIdx++] = 224 | u >> 12;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        } else {
          if (outIdx + 3 >= endIdx)
            break;
          heap[outIdx++] = 240 | u >> 18;
          heap[outIdx++] = 128 | u >> 12 & 63;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull)
        u8array.length = numBytesWritten;
      return u8array;
    }
    var FS_stdin_getChar = () => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        if (typeof window != "undefined" && typeof window.prompt == "function") {
          result = window.prompt("Input: ");
          if (result !== null) {
            result += `
`;
          }
        } else {}
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    };
    var TTY = { ttys: [], init() {}, shutdown() {}, register(dev, ops) {
      TTY.ttys[dev] = { input: [], output: [], ops };
      FS.registerDevice(dev, TTY.stream_ops);
    }, stream_ops: { open(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    }, close(stream) {
      stream.tty.ops.fsync(stream.tty);
    }, fsync(stream) {
      stream.tty.ops.fsync(stream.tty);
    }, read(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0;i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined)
          break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    }, write(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0;i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i;
    } }, default_tty_ops: { get_char(tty) {
      return FS_stdin_getChar();
    }, put_char(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0)
          tty.output.push(val);
      }
    }, fsync(tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    }, ioctl_tcgets(tty) {
      return { c_iflag: 25856, c_oflag: 5, c_cflag: 191, c_lflag: 35387, c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
    }, ioctl_tcsets(tty, optional_actions, data) {
      return 0;
    }, ioctl_tiocgwinsz(tty) {
      return [24, 80];
    } }, default_tty1_ops: { put_char(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0)
          tty.output.push(val);
      }
    }, fsync(tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    } } };
    var zeroMemory = (address, size) => {
      HEAPU8.fill(0, address, address + size);
      return address;
    };
    var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
    var mmapAlloc = (size) => {
      size = alignMemory(size, 65536);
      var ptr = _emscripten_builtin_memalign(65536, size);
      if (!ptr)
        return 0;
      return zeroMemory(ptr, size);
    };
    var MEMFS = { ops_table: null, mount(mount) {
      return MEMFS.createNode(null, "/", 16384 | 511, 0);
    }, createNode(parent, name, mode, dev) {
      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
        throw new FS.ErrnoError(63);
      }
      MEMFS.ops_table ||= { dir: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink }, stream: { llseek: MEMFS.stream_ops.llseek } }, file: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: { llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, allocate: MEMFS.stream_ops.allocate, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync } }, link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops } };
      var node = FS.createNode(parent, name, mode, dev);
      if (FS.isDir(node.mode)) {
        node.node_ops = MEMFS.ops_table.dir.node;
        node.stream_ops = MEMFS.ops_table.dir.stream;
        node.contents = {};
      } else if (FS.isFile(node.mode)) {
        node.node_ops = MEMFS.ops_table.file.node;
        node.stream_ops = MEMFS.ops_table.file.stream;
        node.usedBytes = 0;
        node.contents = null;
      } else if (FS.isLink(node.mode)) {
        node.node_ops = MEMFS.ops_table.link.node;
        node.stream_ops = MEMFS.ops_table.link.stream;
      } else if (FS.isChrdev(node.mode)) {
        node.node_ops = MEMFS.ops_table.chrdev.node;
        node.stream_ops = MEMFS.ops_table.chrdev.stream;
      }
      node.timestamp = Date.now();
      if (parent) {
        parent.contents[name] = node;
        parent.timestamp = node.timestamp;
      }
      return node;
    }, getFileDataAsTypedArray(node) {
      if (!node.contents)
        return new Uint8Array(0);
      if (node.contents.subarray)
        return node.contents.subarray(0, node.usedBytes);
      return new Uint8Array(node.contents);
    }, expandFileStorage(node, newCapacity) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity)
        return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
      if (prevCapacity != 0)
        newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0)
        node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    }, resizeFileStorage(node, newSize) {
      if (node.usedBytes == newSize)
        return;
      if (newSize == 0) {
        node.contents = null;
        node.usedBytes = 0;
      } else {
        var oldContents = node.contents;
        node.contents = new Uint8Array(newSize);
        if (oldContents) {
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
        }
        node.usedBytes = newSize;
      }
    }, node_ops: { getattr(node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    }, setattr(node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    }, lookup(parent, name) {
      throw FS.genericErrors[44];
    }, mknod(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    }, rename(old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now();
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
    }, unlink(parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, rmdir(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, readdir(node) {
      var entries = [".", ".."];
      for (var key of Object.keys(node.contents)) {
        entries.push(key);
      }
      return entries;
    }, symlink(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    }, readlink(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    } }, stream_ops: { read(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes)
        return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0;i < size; i++)
          buffer[offset + i] = contents[position + i];
      }
      return size;
    }, write(stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length)
        return 0;
      var node = stream.node;
      node.timestamp = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0;i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    }, llseek(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    }, allocate(stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    }, mmap(stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length);
          }
        }
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        HEAP8.set(contents, ptr);
      }
      return { ptr, allocated };
    }, msync(stream, buffer, offset, length, mmapFlags) {
      MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      return 0;
    } } };
    var asyncLoad = (url, onload, onerror, noRunDep) => {
      var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
      readAsync(url, (arrayBuffer) => {
        onload(new Uint8Array(arrayBuffer));
        if (dep)
          removeRunDependency(dep);
      }, (event) => {
        if (onerror) {
          onerror();
        } else {
          throw `Loading data file "${url}" failed.`;
        }
      });
      if (dep)
        addRunDependency(dep);
    };
    var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
      FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
    };
    var preloadPlugins = Module2["preloadPlugins"] || [];
    var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      if (typeof Browser != "undefined")
        Browser.init();
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled)
          return;
        if (plugin["canHandle"](fullname)) {
          plugin["handle"](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
    var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`);
      function processData(byteArray) {
        function finish(byteArray2) {
          preFinish?.();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
          }
          onload?.();
          removeRunDependency(dep);
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror?.();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == "string") {
        asyncLoad(url, processData, onerror);
      } else {
        processData(url);
      }
    };
    var FS_modeStringToFlags = (str) => {
      var flagModes = { r: 0, "r+": 2, w: 512 | 64 | 1, "w+": 512 | 64 | 2, a: 1024 | 64 | 1, "a+": 1024 | 64 | 2 };
      var flags = flagModes[str];
      if (typeof flags == "undefined") {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
    var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead)
        mode |= 292 | 73;
      if (canWrite)
        mode |= 146;
      return mode;
    };
    var FS = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, ErrnoError: class {
      constructor(errno) {
        this.name = "ErrnoError";
        this.errno = errno;
      }
    }, genericErrors: {}, filesystems: null, syncFSRequests: 0, FSStream: class {
      constructor() {
        this.shared = {};
      }
      get object() {
        return this.node;
      }
      set object(val) {
        this.node = val;
      }
      get isRead() {
        return (this.flags & 2097155) !== 1;
      }
      get isWrite() {
        return (this.flags & 2097155) !== 0;
      }
      get isAppend() {
        return this.flags & 1024;
      }
      get flags() {
        return this.shared.flags;
      }
      set flags(val) {
        this.shared.flags = val;
      }
      get position() {
        return this.shared.position;
      }
      set position(val) {
        this.shared.position = val;
      }
    }, FSNode: class {
      constructor(parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
        this.readMode = 292 | 73;
        this.writeMode = 146;
      }
      get read() {
        return (this.mode & this.readMode) === this.readMode;
      }
      set read(val) {
        val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
      }
      get write() {
        return (this.mode & this.writeMode) === this.writeMode;
      }
      set write(val) {
        val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
      }
      get isFolder() {
        return FS.isDir(this.mode);
      }
      get isDevice() {
        return FS.isChrdev(this.mode);
      }
    }, lookupPath(path, opts = {}) {
      path = PATH_FS.resolve(path);
      if (!path)
        return { path: "", node: null };
      var defaults = { follow_mount: true, recurse_count: 0 };
      opts = Object.assign(defaults, opts);
      if (opts.recurse_count > 8) {
        throw new FS.ErrnoError(32);
      }
      var parts = path.split("/").filter((p) => !!p);
      var current = FS.root;
      var current_path = "/";
      for (var i = 0;i < parts.length; i++) {
        var islast = i === parts.length - 1;
        if (islast && opts.parent) {
          break;
        }
        current = FS.lookupNode(current, parts[i]);
        current_path = PATH.join2(current_path, parts[i]);
        if (FS.isMountpoint(current)) {
          if (!islast || islast && opts.follow_mount) {
            current = current.mounted.root;
          }
        }
        if (!islast || opts.follow) {
          var count = 0;
          while (FS.isLink(current.mode)) {
            var link = FS.readlink(current_path);
            current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
            var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
            current = lookup.node;
            if (count++ > 40) {
              throw new FS.ErrnoError(32);
            }
          }
        }
      }
      return { path: current_path, node: current };
    }, getPath(node) {
      var path;
      while (true) {
        if (FS.isRoot(node)) {
          var mount = node.mount.mountpoint;
          if (!path)
            return mount;
          return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
        }
        path = path ? `${node.name}/${path}` : node.name;
        node = node.parent;
      }
    }, hashName(parentid, name) {
      var hash = 0;
      for (var i = 0;i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
      }
      return (parentid + hash >>> 0) % FS.nameTable.length;
    }, hashAddNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      node.name_next = FS.nameTable[hash];
      FS.nameTable[hash] = node;
    }, hashRemoveNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) {
        FS.nameTable[hash] = node.name_next;
      } else {
        var current = FS.nameTable[hash];
        while (current) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
      }
    }, lookupNode(parent, name) {
      var errCode = FS.mayLookup(parent);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      var hash = FS.hashName(parent.id, name);
      for (var node = FS.nameTable[hash];node; node = node.name_next) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) {
          return node;
        }
      }
      return FS.lookup(parent, name);
    }, createNode(parent, name, mode, rdev) {
      var node = new FS.FSNode(parent, name, mode, rdev);
      FS.hashAddNode(node);
      return node;
    }, destroyNode(node) {
      FS.hashRemoveNode(node);
    }, isRoot(node) {
      return node === node.parent;
    }, isMountpoint(node) {
      return !!node.mounted;
    }, isFile(mode) {
      return (mode & 61440) === 32768;
    }, isDir(mode) {
      return (mode & 61440) === 16384;
    }, isLink(mode) {
      return (mode & 61440) === 40960;
    }, isChrdev(mode) {
      return (mode & 61440) === 8192;
    }, isBlkdev(mode) {
      return (mode & 61440) === 24576;
    }, isFIFO(mode) {
      return (mode & 61440) === 4096;
    }, isSocket(mode) {
      return (mode & 49152) === 49152;
    }, flagsToPermissionString(flag) {
      var perms = ["r", "w", "rw"][flag & 3];
      if (flag & 512) {
        perms += "w";
      }
      return perms;
    }, nodePermissions(node, perms) {
      if (FS.ignorePermissions) {
        return 0;
      }
      if (perms.includes("r") && !(node.mode & 292)) {
        return 2;
      } else if (perms.includes("w") && !(node.mode & 146)) {
        return 2;
      } else if (perms.includes("x") && !(node.mode & 73)) {
        return 2;
      }
      return 0;
    }, mayLookup(dir) {
      if (!FS.isDir(dir.mode))
        return 54;
      var errCode = FS.nodePermissions(dir, "x");
      if (errCode)
        return errCode;
      if (!dir.node_ops.lookup)
        return 2;
      return 0;
    }, mayCreate(dir, name) {
      try {
        var node = FS.lookupNode(dir, name);
        return 20;
      } catch (e) {}
      return FS.nodePermissions(dir, "wx");
    }, mayDelete(dir, name, isdir) {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      var errCode = FS.nodePermissions(dir, "wx");
      if (errCode) {
        return errCode;
      }
      if (isdir) {
        if (!FS.isDir(node.mode)) {
          return 54;
        }
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
          return 10;
        }
      } else {
        if (FS.isDir(node.mode)) {
          return 31;
        }
      }
      return 0;
    }, mayOpen(node, flags) {
      if (!node) {
        return 44;
      }
      if (FS.isLink(node.mode)) {
        return 32;
      } else if (FS.isDir(node.mode)) {
        if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
          return 31;
        }
      }
      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    }, MAX_OPEN_FDS: 4096, nextfd() {
      for (var fd = 0;fd <= FS.MAX_OPEN_FDS; fd++) {
        if (!FS.streams[fd]) {
          return fd;
        }
      }
      throw new FS.ErrnoError(33);
    }, getStreamChecked(fd) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      return stream;
    }, getStream: (fd) => FS.streams[fd], createStream(stream, fd = -1) {
      stream = Object.assign(new FS.FSStream, stream);
      if (fd == -1) {
        fd = FS.nextfd();
      }
      stream.fd = fd;
      FS.streams[fd] = stream;
      return stream;
    }, closeStream(fd) {
      FS.streams[fd] = null;
    }, dupStream(origStream, fd = -1) {
      var stream = FS.createStream(origStream, fd);
      stream.stream_ops?.dup?.(stream);
      return stream;
    }, chrdev_stream_ops: { open(stream) {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      stream.stream_ops.open?.(stream);
    }, llseek() {
      throw new FS.ErrnoError(70);
    } }, major: (dev) => dev >> 8, minor: (dev) => dev & 255, makedev: (ma, mi) => ma << 8 | mi, registerDevice(dev, ops) {
      FS.devices[dev] = { stream_ops: ops };
    }, getDevice: (dev) => FS.devices[dev], getMounts(mount) {
      var mounts = [];
      var check = [mount];
      while (check.length) {
        var m = check.pop();
        mounts.push(m);
        check.push(...m.mounts);
      }
      return mounts;
    }, syncfs(populate, callback) {
      if (typeof populate == "function") {
        callback = populate;
        populate = false;
      }
      FS.syncFSRequests++;
      if (FS.syncFSRequests > 1) {
        err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
      }
      var mounts = FS.getMounts(FS.root.mount);
      var completed = 0;
      function doCallback(errCode) {
        FS.syncFSRequests--;
        return callback(errCode);
      }
      function done(errCode) {
        if (errCode) {
          if (!done.errored) {
            done.errored = true;
            return doCallback(errCode);
          }
          return;
        }
        if (++completed >= mounts.length) {
          doCallback(null);
        }
      }
      mounts.forEach((mount) => {
        if (!mount.type.syncfs) {
          return done(null);
        }
        mount.type.syncfs(mount, populate, done);
      });
    }, mount(type, opts, mountpoint) {
      var root = mountpoint === "/";
      var pseudo = !mountpoint;
      var node;
      if (root && FS.root) {
        throw new FS.ErrnoError(10);
      } else if (!root && !pseudo) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        mountpoint = lookup.path;
        node = lookup.node;
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        if (!FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
      }
      var mount = { type, opts, mountpoint, mounts: [] };
      var mountRoot = type.mount(mount);
      mountRoot.mount = mount;
      mount.root = mountRoot;
      if (root) {
        FS.root = mountRoot;
      } else if (node) {
        node.mounted = mount;
        if (node.mount) {
          node.mount.mounts.push(mount);
        }
      }
      return mountRoot;
    }, unmount(mountpoint) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      if (!FS.isMountpoint(lookup.node)) {
        throw new FS.ErrnoError(28);
      }
      var node = lookup.node;
      var mount = node.mounted;
      var mounts = FS.getMounts(mount);
      Object.keys(FS.nameTable).forEach((hash) => {
        var current = FS.nameTable[hash];
        while (current) {
          var next = current.name_next;
          if (mounts.includes(current.mount)) {
            FS.destroyNode(current);
          }
          current = next;
        }
      });
      node.mounted = null;
      var idx = node.mount.mounts.indexOf(mount);
      node.mount.mounts.splice(idx, 1);
    }, lookup(parent, name) {
      return parent.node_ops.lookup(parent, name);
    }, mknod(path, mode, dev) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      if (!name || name === "." || name === "..") {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.mayCreate(parent, name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.mknod) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.mknod(parent, name, mode, dev);
    }, create(path, mode) {
      mode = mode !== undefined ? mode : 438;
      mode &= 4095;
      mode |= 32768;
      return FS.mknod(path, mode, 0);
    }, mkdir(path, mode) {
      mode = mode !== undefined ? mode : 511;
      mode &= 511 | 512;
      mode |= 16384;
      return FS.mknod(path, mode, 0);
    }, mkdirTree(path, mode) {
      var dirs = path.split("/");
      var d = "";
      for (var i = 0;i < dirs.length; ++i) {
        if (!dirs[i])
          continue;
        d += "/" + dirs[i];
        try {
          FS.mkdir(d, mode);
        } catch (e) {
          if (e.errno != 20)
            throw e;
        }
      }
    }, mkdev(path, mode, dev) {
      if (typeof dev == "undefined") {
        dev = mode;
        mode = 438;
      }
      mode |= 8192;
      return FS.mknod(path, mode, dev);
    }, symlink(oldpath, newpath) {
      if (!PATH_FS.resolve(oldpath)) {
        throw new FS.ErrnoError(44);
      }
      var lookup = FS.lookupPath(newpath, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var newname = PATH.basename(newpath);
      var errCode = FS.mayCreate(parent, newname);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.symlink) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.symlink(parent, newname, oldpath);
    }, rename(old_path, new_path) {
      var old_dirname = PATH.dirname(old_path);
      var new_dirname = PATH.dirname(new_path);
      var old_name = PATH.basename(old_path);
      var new_name = PATH.basename(new_path);
      var lookup, old_dir, new_dir;
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
      if (!old_dir || !new_dir)
        throw new FS.ErrnoError(44);
      if (old_dir.mount !== new_dir.mount) {
        throw new FS.ErrnoError(75);
      }
      var old_node = FS.lookupNode(old_dir, old_name);
      var relative = PATH_FS.relative(old_path, new_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(28);
      }
      relative = PATH_FS.relative(new_path, old_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(55);
      }
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {}
      if (old_node === new_node) {
        return;
      }
      var isdir = FS.isDir(old_node.mode);
      var errCode = FS.mayDelete(old_dir, old_name, isdir);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!old_dir.node_ops.rename) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
        throw new FS.ErrnoError(10);
      }
      if (new_dir !== old_dir) {
        errCode = FS.nodePermissions(old_dir, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      FS.hashRemoveNode(old_node);
      try {
        old_dir.node_ops.rename(old_node, new_dir, new_name);
        old_node.parent = new_dir;
      } catch (e) {
        throw e;
      } finally {
        FS.hashAddNode(old_node);
      }
    }, rmdir(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, true);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.rmdir) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.rmdir(parent, name);
      FS.destroyNode(node);
    }, readdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node.node_ops.readdir) {
        throw new FS.ErrnoError(54);
      }
      return node.node_ops.readdir(node);
    }, unlink(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, false);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.unlink) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.unlink(parent, name);
      FS.destroyNode(node);
    }, readlink(path) {
      var lookup = FS.lookupPath(path);
      var link = lookup.node;
      if (!link) {
        throw new FS.ErrnoError(44);
      }
      if (!link.node_ops.readlink) {
        throw new FS.ErrnoError(28);
      }
      return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
    }, stat(path, dontFollow) {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      var node = lookup.node;
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (!node.node_ops.getattr) {
        throw new FS.ErrnoError(63);
      }
      return node.node_ops.getattr(node);
    }, lstat(path) {
      return FS.stat(path, true);
    }, chmod(path, mode, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, { mode: mode & 4095 | node.mode & ~4095, timestamp: Date.now() });
    }, lchmod(path, mode) {
      FS.chmod(path, mode, true);
    }, fchmod(fd, mode) {
      var stream = FS.getStreamChecked(fd);
      FS.chmod(stream.node, mode);
    }, chown(path, uid, gid, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, { timestamp: Date.now() });
    }, lchown(path, uid, gid) {
      FS.chown(path, uid, gid, true);
    }, fchown(fd, uid, gid) {
      var stream = FS.getStreamChecked(fd);
      FS.chown(stream.node, uid, gid);
    }, truncate(path, len) {
      if (len < 0) {
        throw new FS.ErrnoError(28);
      }
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isDir(node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!FS.isFile(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.nodePermissions(node, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
    }, ftruncate(fd, len) {
      var stream = FS.getStreamChecked(fd);
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(28);
      }
      FS.truncate(stream.node, len);
    }, utime(path, atime, mtime) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
    }, open(path, flags, mode) {
      if (path === "") {
        throw new FS.ErrnoError(44);
      }
      flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
      if (flags & 64) {
        mode = typeof mode == "undefined" ? 438 : mode;
        mode = mode & 4095 | 32768;
      } else {
        mode = 0;
      }
      var node;
      if (typeof path == "object") {
        node = path;
      } else {
        path = PATH.normalize(path);
        try {
          var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
          node = lookup.node;
        } catch (e) {}
      }
      var created = false;
      if (flags & 64) {
        if (node) {
          if (flags & 128) {
            throw new FS.ErrnoError(20);
          }
        } else {
          node = FS.mknod(path, mode, 0);
          created = true;
        }
      }
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (FS.isChrdev(node.mode)) {
        flags &= ~512;
      }
      if (flags & 65536 && !FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
      if (!created) {
        var errCode = FS.mayOpen(node, flags);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      if (flags & 512 && !created) {
        FS.truncate(node, 0);
      }
      flags &= ~(128 | 512 | 131072);
      var stream = FS.createStream({ node, path: FS.getPath(node), flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false });
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
      if (Module2["logReadFiles"] && !(flags & 1)) {
        if (!FS.readFiles)
          FS.readFiles = {};
        if (!(path in FS.readFiles)) {
          FS.readFiles[path] = 1;
        }
      }
      return stream;
    }, close(stream) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (stream.getdents)
        stream.getdents = null;
      try {
        if (stream.stream_ops.close) {
          stream.stream_ops.close(stream);
        }
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      stream.fd = null;
    }, isClosed(stream) {
      return stream.fd === null;
    }, llseek(stream, offset, whence) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (!stream.seekable || !stream.stream_ops.llseek) {
        throw new FS.ErrnoError(70);
      }
      if (whence != 0 && whence != 1 && whence != 2) {
        throw new FS.ErrnoError(28);
      }
      stream.position = stream.stream_ops.llseek(stream, offset, whence);
      stream.ungotten = [];
      return stream.position;
    }, read(stream, buffer, offset, length, position) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.read) {
        throw new FS.ErrnoError(28);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
      if (!seeking)
        stream.position += bytesRead;
      return bytesRead;
    }, write(stream, buffer, offset, length, position, canOwn) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.write) {
        throw new FS.ErrnoError(28);
      }
      if (stream.seekable && stream.flags & 1024) {
        FS.llseek(stream, 0, 2);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
      if (!seeking)
        stream.position += bytesWritten;
      return bytesWritten;
    }, allocate(stream, offset, length) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (offset < 0 || length <= 0) {
        throw new FS.ErrnoError(28);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (!stream.stream_ops.allocate) {
        throw new FS.ErrnoError(138);
      }
      stream.stream_ops.allocate(stream, offset, length);
    }, mmap(stream, length, position, prot, flags) {
      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
        throw new FS.ErrnoError(2);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(2);
      }
      if (!stream.stream_ops.mmap) {
        throw new FS.ErrnoError(43);
      }
      return stream.stream_ops.mmap(stream, length, position, prot, flags);
    }, msync(stream, buffer, offset, length, mmapFlags) {
      if (!stream.stream_ops.msync) {
        return 0;
      }
      return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
    }, ioctl(stream, cmd, arg) {
      if (!stream.stream_ops.ioctl) {
        throw new FS.ErrnoError(59);
      }
      return stream.stream_ops.ioctl(stream, cmd, arg);
    }, readFile(path, opts = {}) {
      opts.flags = opts.flags || 0;
      opts.encoding = opts.encoding || "binary";
      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
        throw new Error(`Invalid encoding type "${opts.encoding}"`);
      }
      var ret;
      var stream = FS.open(path, opts.flags);
      var stat = FS.stat(path);
      var length = stat.size;
      var buf = new Uint8Array(length);
      FS.read(stream, buf, 0, length, 0);
      if (opts.encoding === "utf8") {
        ret = UTF8ArrayToString(buf, 0);
      } else if (opts.encoding === "binary") {
        ret = buf;
      }
      FS.close(stream);
      return ret;
    }, writeFile(path, data, opts = {}) {
      opts.flags = opts.flags || 577;
      var stream = FS.open(path, opts.flags, opts.mode);
      if (typeof data == "string") {
        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
        FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
      } else if (ArrayBuffer.isView(data)) {
        FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
      } else {
        throw new Error("Unsupported data type");
      }
      FS.close(stream);
    }, cwd: () => FS.currentPath, chdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      if (lookup.node === null) {
        throw new FS.ErrnoError(44);
      }
      if (!FS.isDir(lookup.node.mode)) {
        throw new FS.ErrnoError(54);
      }
      var errCode = FS.nodePermissions(lookup.node, "x");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.currentPath = lookup.path;
    }, createDefaultDirectories() {
      FS.mkdir("/tmp");
      FS.mkdir("/home");
      FS.mkdir("/home/web_user");
    }, createDefaultDevices() {
      FS.mkdir("/dev");
      FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length });
      FS.mkdev("/dev/null", FS.makedev(1, 3));
      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
      FS.mkdev("/dev/tty", FS.makedev(5, 0));
      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var randomBuffer = new Uint8Array(1024), randomLeft = 0;
      var randomByte = () => {
        if (randomLeft === 0) {
          randomLeft = randomFill(randomBuffer).byteLength;
        }
        return randomBuffer[--randomLeft];
      };
      FS.createDevice("/dev", "random", randomByte);
      FS.createDevice("/dev", "urandom", randomByte);
      FS.mkdir("/dev/shm");
      FS.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories() {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd");
      FS.mount({ mount() {
        var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
        node.node_ops = { lookup(parent, name) {
          var fd = +name;
          var stream = FS.getStreamChecked(fd);
          var ret = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: () => stream.path } };
          ret.parent = ret;
          return ret;
        } };
        return node;
      } }, {}, "/proc/self/fd");
    }, createStandardStreams() {
      if (Module2["stdin"]) {
        FS.createDevice("/dev", "stdin", Module2["stdin"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdin");
      }
      if (Module2["stdout"]) {
        FS.createDevice("/dev", "stdout", null, Module2["stdout"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdout");
      }
      if (Module2["stderr"]) {
        FS.createDevice("/dev", "stderr", null, Module2["stderr"]);
      } else {
        FS.symlink("/dev/tty1", "/dev/stderr");
      }
      var stdin = FS.open("/dev/stdin", 0);
      var stdout = FS.open("/dev/stdout", 1);
      var stderr = FS.open("/dev/stderr", 1);
    }, staticInit() {
      [44].forEach((code) => {
        FS.genericErrors[code] = new FS.ErrnoError(code);
        FS.genericErrors[code].stack = "<generic error, no stack>";
      });
      FS.nameTable = new Array(4096);
      FS.mount(MEMFS, {}, "/");
      FS.createDefaultDirectories();
      FS.createDefaultDevices();
      FS.createSpecialDirectories();
      FS.filesystems = { MEMFS };
    }, init(input, output, error) {
      FS.init.initialized = true;
      Module2["stdin"] = input || Module2["stdin"];
      Module2["stdout"] = output || Module2["stdout"];
      Module2["stderr"] = error || Module2["stderr"];
      FS.createStandardStreams();
    }, quit() {
      FS.init.initialized = false;
      for (var i = 0;i < FS.streams.length; i++) {
        var stream = FS.streams[i];
        if (!stream) {
          continue;
        }
        FS.close(stream);
      }
    }, findObject(path, dontResolveLastLink) {
      var ret = FS.analyzePath(path, dontResolveLastLink);
      if (!ret.exists) {
        return null;
      }
      return ret.object;
    }, analyzePath(path, dontResolveLastLink) {
      try {
        var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        path = lookup.path;
      } catch (e) {}
      var ret = { isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null };
      try {
        var lookup = FS.lookupPath(path, { parent: true });
        ret.parentExists = true;
        ret.parentPath = lookup.path;
        ret.parentObject = lookup.node;
        ret.name = PATH.basename(path);
        lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        ret.exists = true;
        ret.path = lookup.path;
        ret.object = lookup.node;
        ret.name = lookup.node.name;
        ret.isRoot = lookup.path === "/";
      } catch (e) {
        ret.error = e.errno;
      }
      return ret;
    }, createPath(parent, path, canRead, canWrite) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      var parts = path.split("/").reverse();
      while (parts.length) {
        var part = parts.pop();
        if (!part)
          continue;
        var current = PATH.join2(parent, part);
        try {
          FS.mkdir(current);
        } catch (e) {}
        parent = current;
      }
      return current;
    }, createFile(parent, name, properties, canRead, canWrite) {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS_getMode(canRead, canWrite);
      return FS.create(path, mode);
    }, createDataFile(parent, name, data, canRead, canWrite, canOwn) {
      var path = name;
      if (parent) {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        path = name ? PATH.join2(parent, name) : parent;
      }
      var mode = FS_getMode(canRead, canWrite);
      var node = FS.create(path, mode);
      if (data) {
        if (typeof data == "string") {
          var arr = new Array(data.length);
          for (var i = 0, len = data.length;i < len; ++i)
            arr[i] = data.charCodeAt(i);
          data = arr;
        }
        FS.chmod(node, mode | 146);
        var stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, canOwn);
        FS.close(stream);
        FS.chmod(node, mode);
      }
    }, createDevice(parent, name, input, output) {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS_getMode(!!input, !!output);
      if (!FS.createDevice.major)
        FS.createDevice.major = 64;
      var dev = FS.makedev(FS.createDevice.major++, 0);
      FS.registerDevice(dev, { open(stream) {
        stream.seekable = false;
      }, close(stream) {
        if (output?.buffer?.length) {
          output(10);
        }
      }, read(stream, buffer, offset, length, pos) {
        var bytesRead = 0;
        for (var i = 0;i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined)
            break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      }, write(stream, buffer, offset, length, pos) {
        for (var i = 0;i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i;
      } });
      return FS.mkdev(path, mode, dev);
    }, forceLoadFile(obj) {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
        return true;
      if (typeof XMLHttpRequest != "undefined") {
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      } else if (read_) {
        try {
          obj.contents = intArrayFromString(read_(obj.url), true);
          obj.usedBytes = obj.contents.length;
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
      } else {
        throw new Error("Cannot load without read() or XMLHttpRequest.");
      }
    }, createLazyFile(parent, name, url, canRead, canWrite) {

      class LazyUint8Array {
        constructor() {
          this.lengthKnown = false;
          this.chunks = [];
        }
        get(idx) {
          if (idx > this.length - 1 || idx < 0) {
            return;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = idx / this.chunkSize | 0;
          return this.getter(chunkNum)[chunkOffset];
        }
        setDataGetter(getter) {
          this.getter = getter;
        }
        cacheLength() {
          var xhr = new XMLHttpRequest;
          xhr.open("HEAD", url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
          var chunkSize = 1024 * 1024;
          if (!hasByteServing)
            chunkSize = datalength;
          var doXHR = (from, to) => {
            if (from > to)
              throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength - 1)
              throw new Error("only " + datalength + " bytes available! programmer error!");
            var xhr2 = new XMLHttpRequest;
            xhr2.open("GET", url, false);
            if (datalength !== chunkSize)
              xhr2.setRequestHeader("Range", "bytes=" + from + "-" + to);
            xhr2.responseType = "arraybuffer";
            if (xhr2.overrideMimeType) {
              xhr2.overrideMimeType("text/plain; charset=x-user-defined");
            }
            xhr2.send(null);
            if (!(xhr2.status >= 200 && xhr2.status < 300 || xhr2.status === 304))
              throw new Error("Couldn't load " + url + ". Status: " + xhr2.status);
            if (xhr2.response !== undefined) {
              return new Uint8Array(xhr2.response || []);
            }
            return intArrayFromString(xhr2.responseText || "", true);
          };
          var lazyArray2 = this;
          lazyArray2.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum + 1) * chunkSize - 1;
            end = Math.min(end, datalength - 1);
            if (typeof lazyArray2.chunks[chunkNum] == "undefined") {
              lazyArray2.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray2.chunks[chunkNum] == "undefined")
              throw new Error("doXHR failed!");
            return lazyArray2.chunks[chunkNum];
          });
          if (usesGzip || !datalength) {
            chunkSize = datalength = 1;
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        get length() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._length;
        }
        get chunkSize() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._chunkSize;
        }
      }
      if (typeof XMLHttpRequest != "undefined") {
        if (!ENVIRONMENT_IS_WORKER)
          throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var lazyArray = new LazyUint8Array;
        var properties = { isDevice: false, contents: lazyArray };
      } else {
        var properties = { isDevice: false, url };
      }
      var node = FS.createFile(parent, name, properties, canRead, canWrite);
      if (properties.contents) {
        node.contents = properties.contents;
      } else if (properties.url) {
        node.contents = null;
        node.url = properties.url;
      }
      Object.defineProperties(node, { usedBytes: { get: function() {
        return this.contents.length;
      } } });
      var stream_ops = {};
      var keys = Object.keys(node.stream_ops);
      keys.forEach((key) => {
        var fn = node.stream_ops[key];
        stream_ops[key] = (...args) => {
          FS.forceLoadFile(node);
          return fn(...args);
        };
      });
      function writeChunks(stream, buffer, offset, length, position) {
        var contents = stream.node.contents;
        if (position >= contents.length)
          return 0;
        var size = Math.min(contents.length - position, length);
        if (contents.slice) {
          for (var i = 0;i < size; i++) {
            buffer[offset + i] = contents[position + i];
          }
        } else {
          for (var i = 0;i < size; i++) {
            buffer[offset + i] = contents.get(position + i);
          }
        }
        return size;
      }
      stream_ops.read = (stream, buffer, offset, length, position) => {
        FS.forceLoadFile(node);
        return writeChunks(stream, buffer, offset, length, position);
      };
      stream_ops.mmap = (stream, length, position, prot, flags) => {
        FS.forceLoadFile(node);
        var ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        writeChunks(stream, HEAP8, ptr, length, position);
        return { ptr, allocated: true };
      };
      node.stream_ops = stream_ops;
      return node;
    } };
    var SYSCALLS = { DEFAULT_POLLMASK: 5, calculateAt(dirfd, path, allowEmpty) {
      if (PATH.isAbs(path)) {
        return path;
      }
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = SYSCALLS.getStreamFromFD(dirfd);
        dir = dirstream.path;
      }
      if (path.length == 0) {
        if (!allowEmpty) {
          throw new FS.ErrnoError(44);
        }
        return dir;
      }
      return PATH.join2(dir, path);
    }, doStat(func, path, buf) {
      var stat = func(path);
      HEAP32[buf >> 2] = stat.dev;
      HEAP32[buf + 4 >> 2] = stat.mode;
      HEAPU32[buf + 8 >> 2] = stat.nlink;
      HEAP32[buf + 12 >> 2] = stat.uid;
      HEAP32[buf + 16 >> 2] = stat.gid;
      HEAP32[buf + 20 >> 2] = stat.rdev;
      tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 24 >> 2] = tempI64[0], HEAP32[buf + 28 >> 2] = tempI64[1];
      HEAP32[buf + 32 >> 2] = 4096;
      HEAP32[buf + 36 >> 2] = stat.blocks;
      var atime = stat.atime.getTime();
      var mtime = stat.mtime.getTime();
      var ctime = stat.ctime.getTime();
      tempI64 = [Math.floor(atime / 1000) >>> 0, (tempDouble = Math.floor(atime / 1000), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
      HEAPU32[buf + 48 >> 2] = atime % 1000 * 1000;
      tempI64 = [Math.floor(mtime / 1000) >>> 0, (tempDouble = Math.floor(mtime / 1000), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 56 >> 2] = tempI64[0], HEAP32[buf + 60 >> 2] = tempI64[1];
      HEAPU32[buf + 64 >> 2] = mtime % 1000 * 1000;
      tempI64 = [Math.floor(ctime / 1000) >>> 0, (tempDouble = Math.floor(ctime / 1000), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 72 >> 2] = tempI64[0], HEAP32[buf + 76 >> 2] = tempI64[1];
      HEAPU32[buf + 80 >> 2] = ctime % 1000 * 1000;
      tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 88 >> 2] = tempI64[0], HEAP32[buf + 92 >> 2] = tempI64[1];
      return 0;
    }, doMsync(addr, stream, len, flags, offset) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (flags & 2) {
        return 0;
      }
      var buffer = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, buffer, offset, len, flags);
    }, getStreamFromFD(fd) {
      var stream = FS.getStreamChecked(fd);
      return stream;
    }, varargs: undefined, getStr(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    } };
    function ___syscall_chmod(path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        FS.chmod(path, mode);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_faccessat(dirfd, path, amode, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (amode & ~7) {
          return -28;
        }
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node) {
          return -44;
        }
        var perms = "";
        if (amode & 4)
          perms += "r";
        if (amode & 2)
          perms += "w";
        if (amode & 1)
          perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
          return -2;
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_fchmod(fd, mode) {
      try {
        FS.fchmod(fd, mode);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_fchown32(fd, owner, group) {
      try {
        FS.fchown(fd, owner, group);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function syscallGetVarargI() {
      var ret = HEAP32[+SYSCALLS.varargs >> 2];
      SYSCALLS.varargs += 4;
      return ret;
    }
    var syscallGetVarargP = syscallGetVarargI;
    function ___syscall_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
          case 0: {
            var arg = syscallGetVarargI();
            if (arg < 0) {
              return -28;
            }
            while (FS.streams[arg]) {
              arg++;
            }
            var newStream;
            newStream = FS.dupStream(stream, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return stream.flags;
          case 4: {
            var arg = syscallGetVarargI();
            stream.flags |= arg;
            return 0;
          }
          case 12: {
            var arg = syscallGetVarargP();
            var offset = 0;
            HEAP16[arg + offset >> 1] = 2;
            return 0;
          }
          case 13:
          case 14:
            return 0;
        }
        return -28;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_fstat64(fd, buf) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return SYSCALLS.doStat(FS.stat, stream.path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
    function ___syscall_ftruncate64(fd, length_low, length_high) {
      var length = convertI32PairToI53Checked(length_low, length_high);
      try {
        if (isNaN(length))
          return 61;
        FS.ftruncate(fd, length);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    function ___syscall_getcwd(buf, size) {
      try {
        if (size === 0)
          return -28;
        var cwd = FS.cwd();
        var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
        if (size < cwdLengthInBytes)
          return -68;
        stringToUTF8(cwd, buf, size);
        return cwdLengthInBytes;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_lstat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.lstat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_mkdirat(dirfd, path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/")
          path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_newfstatat(dirfd, path, buf, flags) {
      try {
        path = SYSCALLS.getStr(path);
        var nofollow = flags & 256;
        var allowEmpty = flags & 4096;
        flags = flags & ~6400;
        path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
        return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_openat(dirfd, path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        var mode = varargs ? syscallGetVarargI() : 0;
        return FS.open(path, flags, mode).fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (bufsize <= 0)
          return -28;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_rmdir(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.rmdir(path);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_stat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.stat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_unlinkat(dirfd, path, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (flags === 0) {
          FS.unlink(path);
        } else if (flags === 512) {
          FS.rmdir(path);
        } else {
          abort("Invalid flags passed to unlinkat");
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var readI53FromI64 = (ptr) => HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296;
    function ___syscall_utimensat(dirfd, path, times, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path, true);
        if (!times) {
          var atime = Date.now();
          var mtime = atime;
        } else {
          var seconds = readI53FromI64(times);
          var nanoseconds = HEAP32[times + 8 >> 2];
          atime = seconds * 1000 + nanoseconds / (1000 * 1000);
          times += 16;
          seconds = readI53FromI64(times);
          nanoseconds = HEAP32[times + 8 >> 2];
          mtime = seconds * 1000 + nanoseconds / (1000 * 1000);
        }
        FS.utime(path, atime, mtime);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var ydayFromDate = (date) => {
      var leap = isLeapYear(date.getFullYear());
      var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
      var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
      return yday;
    };
    function __localtime_js(time_low, time_high, tmPtr) {
      var time = convertI32PairToI53Checked(time_low, time_high);
      var date = new Date(time * 1000);
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getHours();
      HEAP32[tmPtr + 12 >> 2] = date.getDate();
      HEAP32[tmPtr + 16 >> 2] = date.getMonth();
      HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
      HEAP32[tmPtr + 24 >> 2] = date.getDay();
      var yday = ydayFromDate(date) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
      HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
      HEAP32[tmPtr + 32 >> 2] = dst;
    }
    function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        if (isNaN(offset))
          return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        var res = FS.mmap(stream, len, offset, prot, flags);
        var ptr = res.ptr;
        HEAP32[allocated >> 2] = res.allocated;
        HEAPU32[addr >> 2] = ptr;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (prot & 2) {
          SYSCALLS.doMsync(addr, stream, len, flags, offset);
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var __tzset_js = (timezone, daylight, std_name, dst_name) => {
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
      HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
      HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
      var extractZone = (date) => date.toLocaleTimeString(undefined, { hour12: false, timeZoneName: "short" }).split(" ")[1];
      var winterName = extractZone(winter);
      var summerName = extractZone(summer);
      if (summerOffset < winterOffset) {
        stringToUTF8(winterName, std_name, 17);
        stringToUTF8(summerName, dst_name, 17);
      } else {
        stringToUTF8(winterName, dst_name, 17);
        stringToUTF8(summerName, std_name, 17);
      }
    };
    var _emscripten_date_now = () => Date.now();
    var _emscripten_get_now;
    _emscripten_get_now = () => performance.now();
    var getHeapMax = () => 2147483648;
    var growMemory = (size) => {
      var b = wasmMemory.buffer;
      var pages = (size - b.byteLength + 65535) / 65536;
      try {
        wasmMemory.grow(pages);
        updateMemoryViews();
        return 1;
      } catch (e) {}
    };
    var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      requestedSize >>>= 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
      for (var cutDown = 1;cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = growMemory(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    };
    var ENV = {};
    var getExecutableName = () => thisProgram || "./this.program";
    var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        var env = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: lang, _: getExecutableName() };
        for (var x in ENV) {
          if (ENV[x] === undefined)
            delete env[x];
          else
            env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
    var stringToAscii = (str, buffer) => {
      for (var i = 0;i < str.length; ++i) {
        HEAP8[buffer++] = str.charCodeAt(i);
      }
      HEAP8[buffer] = 0;
    };
    var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[__environ + i * 4 >> 2] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    };
    var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach((string) => bufSize += string.length + 1);
      HEAPU32[penviron_buf_size >> 2] = bufSize;
      return 0;
    };
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    function _fd_fdstat_get(fd, pbuf) {
      try {
        var rightsBase = 0;
        var rightsInheriting = 0;
        var flags = 0;
        {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
        }
        HEAP8[pbuf] = type;
        HEAP16[pbuf + 2 >> 1] = flags;
        tempI64 = [rightsBase >>> 0, (tempDouble = rightsBase, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[pbuf + 8 >> 2] = tempI64[0], HEAP32[pbuf + 12 >> 2] = tempI64[1];
        tempI64 = [rightsInheriting >>> 0, (tempDouble = rightsInheriting, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[pbuf + 16 >> 2] = tempI64[0], HEAP32[pbuf + 20 >> 2] = tempI64[1];
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0;i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0)
          return -1;
        ret += curr;
        if (curr < len)
          break;
        if (typeof offset != "undefined") {
          offset += curr;
        }
      }
      return ret;
    };
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doReadv(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        if (isNaN(offset))
          return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0)
          stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    var _fd_sync = function(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return Asyncify.handleSleep((wakeUp) => {
          var mount = stream.node.mount;
          if (!mount.type.syncfs) {
            wakeUp(0);
            return;
          }
          mount.type.syncfs(mount, false, (err2) => {
            if (err2) {
              wakeUp(29);
              return;
            }
            wakeUp(0);
          });
        });
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    };
    _fd_sync.isAsync = true;
    var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0;i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0)
          return -1;
        ret += curr;
        if (typeof offset != "undefined") {
          offset += curr;
        }
      }
      return ret;
    };
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    var adapters_support = function() {
      const handleAsync = typeof Asyncify === "object" ? Asyncify.handleAsync.bind(Asyncify) : null;
      Module2["handleAsync"] = handleAsync;
      const targets = new Map;
      Module2["setCallback"] = (key, target) => targets.set(key, target);
      Module2["getCallback"] = (key) => targets.get(key);
      Module2["deleteCallback"] = (key) => targets.delete(key);
      adapters_support = function(isAsync, key, ...args) {
        const receiver = targets.get(key);
        let methodName = null;
        const f = typeof receiver === "function" ? receiver : receiver[methodName = UTF8ToString(args.shift())];
        if (isAsync) {
          if (handleAsync) {
            return handleAsync(() => f.apply(receiver, args));
          }
          throw new Error("Synchronous WebAssembly cannot call async function");
        }
        const result = f.apply(receiver, args);
        if (typeof result?.then == "function") {
          console.error("unexpected Promise", f);
          throw new Error(`${methodName} unexpectedly returned a Promise`);
        }
        return result;
      };
    };
    function _ipp(...args) {
      return adapters_support(false, ...args);
    }
    function _ipp_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipp_async.isAsync = true;
    function _ippipppp(...args) {
      return adapters_support(false, ...args);
    }
    function _ippipppp_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippipppp_async.isAsync = true;
    function _ippp(...args) {
      return adapters_support(false, ...args);
    }
    function _ippp_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippp_async.isAsync = true;
    function _ipppi(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppi_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppi_async.isAsync = true;
    function _ipppiii(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppiii_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppiii_async.isAsync = true;
    function _ipppiiip(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppiiip_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppiiip_async.isAsync = true;
    function _ipppip(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppip_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppip_async.isAsync = true;
    function _ipppj(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppj_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppj_async.isAsync = true;
    function _ipppp(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppp_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppp_async.isAsync = true;
    function _ippppi(...args) {
      return adapters_support(false, ...args);
    }
    function _ippppi_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippppi_async.isAsync = true;
    function _ippppij(...args) {
      return adapters_support(false, ...args);
    }
    function _ippppij_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippppij_async.isAsync = true;
    function _ippppip(...args) {
      return adapters_support(false, ...args);
    }
    function _ippppip_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippppip_async.isAsync = true;
    function _ipppppip(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppppip_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppppip_async.isAsync = true;
    function _vppippii(...args) {
      return adapters_support(false, ...args);
    }
    function _vppippii_async(...args) {
      return adapters_support(true, ...args);
    }
    _vppippii_async.isAsync = true;
    function _vppp(...args) {
      return adapters_support(false, ...args);
    }
    function _vppp_async(...args) {
      return adapters_support(true, ...args);
    }
    _vppp_async.isAsync = true;
    function _vpppip(...args) {
      return adapters_support(false, ...args);
    }
    function _vpppip_async(...args) {
      return adapters_support(true, ...args);
    }
    _vpppip_async.isAsync = true;
    var runtimeKeepaliveCounter = 0;
    var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
    var _proc_exit = (code) => {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        Module2["onExit"]?.(code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    };
    var exitJS = (status, implicit) => {
      EXITSTATUS = status;
      _proc_exit(status);
    };
    var handleException = (e) => {
      if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
      }
      quit_(1, e);
    };
    var runAndAbortIfError = (func) => {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    };
    var _exit = exitJS;
    var maybeExit = () => {
      if (!keepRuntimeAlive()) {
        try {
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    };
    var callUserCallback = (func) => {
      if (ABORT) {
        return;
      }
      try {
        func();
        maybeExit();
      } catch (e) {
        handleException(e);
      }
    };
    var sigToWasmTypes = (sig) => {
      var typeNames = { i: "i32", j: "i64", f: "f32", d: "f64", e: "externref", p: "i32" };
      var type = { parameters: [], results: sig[0] == "v" ? [] : [typeNames[sig[0]]] };
      for (var i = 1;i < sig.length; ++i) {
        type.parameters.push(typeNames[sig[i]]);
      }
      return type;
    };
    var runtimeKeepalivePush = () => {
      runtimeKeepaliveCounter += 1;
    };
    var runtimeKeepalivePop = () => {
      runtimeKeepaliveCounter -= 1;
    };
    var Asyncify = { instrumentWasmImports(imports) {
      var importPattern = /^(ipp|ipp_async|ippp|ippp_async|vppp|vppp_async|ipppj|ipppj_async|ipppi|ipppi_async|ipppp|ipppp_async|ipppip|ipppip_async|vpppip|vpppip_async|ippppi|ippppi_async|ippppij|ippppij_async|ipppiii|ipppiii_async|ippppip|ippppip_async|ippipppp|ippipppp_async|ipppppip|ipppppip_async|ipppiiip|ipppiiip_async|vppippii|vppippii_async|invoke_.*|__asyncjs__.*)$/;
      for (let [x, original] of Object.entries(imports)) {
        if (typeof original == "function") {
          let isAsyncifyImport = original.isAsync || importPattern.test(x);
        }
      }
    }, instrumentWasmExports(exports) {
      var ret = {};
      for (let [x, original] of Object.entries(exports)) {
        if (typeof original == "function") {
          ret[x] = (...args) => {
            Asyncify.exportCallStack.push(x);
            try {
              return original(...args);
            } finally {
              if (!ABORT) {
                var y = Asyncify.exportCallStack.pop();
                Asyncify.maybeStopUnwind();
              }
            }
          };
        } else {
          ret[x] = original;
        }
      }
      return ret;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 16384, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(funcName) {
      var id = Asyncify.callStackNameToId[funcName];
      if (id === undefined) {
        id = Asyncify.callStackId++;
        Asyncify.callStackNameToId[funcName] = id;
        Asyncify.callStackIdToName[id] = funcName;
      }
      return id;
    }, maybeStopUnwind() {
      if (Asyncify.currData && Asyncify.state === Asyncify.State.Unwinding && Asyncify.exportCallStack.length === 0) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(_asyncify_stop_unwind);
        if (typeof Fibers != "undefined") {
          Fibers.trampoline();
        }
      }
    }, whenDone() {
      return new Promise((resolve, reject) => {
        Asyncify.asyncPromiseHandlers = { resolve, reject };
      });
    }, allocateData() {
      var ptr = _malloc(12 + Asyncify.StackSize);
      Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
      Asyncify.setDataRewindFunc(ptr);
      return ptr;
    }, setDataHeader(ptr, stack, stackSize) {
      HEAPU32[ptr >> 2] = stack;
      HEAPU32[ptr + 4 >> 2] = stack + stackSize;
    }, setDataRewindFunc(ptr) {
      var bottomOfCallStack = Asyncify.exportCallStack[0];
      var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
      HEAP32[ptr + 8 >> 2] = rewindId;
    }, getDataRewindFuncName(ptr) {
      var id = HEAP32[ptr + 8 >> 2];
      var name = Asyncify.callStackIdToName[id];
      return name;
    }, getDataRewindFunc(name) {
      var func = wasmExports[name];
      return func;
    }, doRewind(ptr) {
      var name = Asyncify.getDataRewindFuncName(ptr);
      var func = Asyncify.getDataRewindFunc(name);
      return func();
    }, handleSleep(startAsync) {
      if (ABORT)
        return;
      if (Asyncify.state === Asyncify.State.Normal) {
        var reachedCallback = false;
        var reachedAfterCallback = false;
        startAsync((handleSleepReturnValue = 0) => {
          if (ABORT)
            return;
          Asyncify.handleSleepReturnValue = handleSleepReturnValue;
          reachedCallback = true;
          if (!reachedAfterCallback) {
            return;
          }
          Asyncify.state = Asyncify.State.Rewinding;
          runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
          if (typeof Browser != "undefined" && Browser.mainLoop.func) {
            Browser.mainLoop.resume();
          }
          var asyncWasmReturnValue, isError = false;
          try {
            asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
          } catch (err2) {
            asyncWasmReturnValue = err2;
            isError = true;
          }
          var handled = false;
          if (!Asyncify.currData) {
            var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
            if (asyncPromiseHandlers) {
              Asyncify.asyncPromiseHandlers = null;
              (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
              handled = true;
            }
          }
          if (isError && !handled) {
            throw asyncWasmReturnValue;
          }
        });
        reachedAfterCallback = true;
        if (!reachedCallback) {
          Asyncify.state = Asyncify.State.Unwinding;
          Asyncify.currData = Asyncify.allocateData();
          if (typeof Browser != "undefined" && Browser.mainLoop.func) {
            Browser.mainLoop.pause();
          }
          runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
        }
      } else if (Asyncify.state === Asyncify.State.Rewinding) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(_asyncify_stop_rewind);
        _free(Asyncify.currData);
        Asyncify.currData = null;
        Asyncify.sleepCallbacks.forEach(callUserCallback);
      } else {
        abort(`invalid state: ${Asyncify.state}`);
      }
      return Asyncify.handleSleepReturnValue;
    }, handleAsync(startAsync) {
      return Asyncify.handleSleep((wakeUp) => {
        startAsync().then(wakeUp);
      });
    } };
    var uleb128Encode = (n, target) => {
      if (n < 128) {
        target.push(n);
      } else {
        target.push(n % 128 | 128, n >> 7);
      }
    };
    var generateFuncType = (sig, target) => {
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
      target.push(96);
      uleb128Encode(sigParam.length, target);
      for (var i = 0;i < sigParam.length; ++i) {
        target.push(typeCodes[sigParam[i]]);
      }
      if (sigRet == "v") {
        target.push(0);
      } else {
        target.push(1, typeCodes[sigRet]);
      }
    };
    var convertJsFunctionToWasm = (func, sig) => {
      if (typeof WebAssembly.Function == "function") {
        return new WebAssembly.Function(sigToWasmTypes(sig), func);
      }
      var typeSectionBody = [1];
      generateFuncType(sig, typeSectionBody);
      var bytes = [0, 97, 115, 109, 1, 0, 0, 0, 1];
      uleb128Encode(typeSectionBody.length, bytes);
      bytes.push(...typeSectionBody);
      bytes.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
      var module = new WebAssembly.Module(new Uint8Array(bytes));
      var instance = new WebAssembly.Instance(module, { e: { f: func } });
      var wrappedFunc = instance.exports["f"];
      return wrappedFunc;
    };
    var wasmTable;
    var getWasmTableEntry = (funcPtr) => wasmTable.get(funcPtr);
    var updateTableMap = (offset, count) => {
      if (functionsInTableMap) {
        for (var i = offset;i < offset + count; i++) {
          var item = getWasmTableEntry(i);
          if (item) {
            functionsInTableMap.set(item, i);
          }
        }
      }
    };
    var functionsInTableMap;
    var getFunctionAddress = (func) => {
      if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap;
        updateTableMap(0, wasmTable.length);
      }
      return functionsInTableMap.get(func) || 0;
    };
    var freeTableIndexes = [];
    var getEmptyTableSlot = () => {
      if (freeTableIndexes.length) {
        return freeTableIndexes.pop();
      }
      try {
        wasmTable.grow(1);
      } catch (err2) {
        if (!(err2 instanceof RangeError)) {
          throw err2;
        }
        throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
      }
      return wasmTable.length - 1;
    };
    var setWasmTableEntry = (idx, func) => wasmTable.set(idx, func);
    var addFunction = (func, sig) => {
      var rtn = getFunctionAddress(func);
      if (rtn) {
        return rtn;
      }
      var ret = getEmptyTableSlot();
      try {
        setWasmTableEntry(ret, func);
      } catch (err2) {
        if (!(err2 instanceof TypeError)) {
          throw err2;
        }
        var wrapped = convertJsFunctionToWasm(func, sig);
        setWasmTableEntry(ret, wrapped);
      }
      functionsInTableMap.set(func, ret);
      return ret;
    };
    var getCFunc = (ident) => {
      var func = Module2["_" + ident];
      return func;
    };
    var writeArrayToMemory = (array, buffer) => {
      HEAP8.set(array, buffer);
    };
    var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
    var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };
    var ccall = (ident, returnType, argTypes, args, opts) => {
      var toC = { string: (str) => {
        var ret2 = 0;
        if (str !== null && str !== undefined && str !== 0) {
          ret2 = stringToUTF8OnStack(str);
        }
        return ret2;
      }, array: (arr) => {
        var ret2 = stackAlloc(arr.length);
        writeArrayToMemory(arr, ret2);
        return ret2;
      } };
      function convertReturnValue(ret2) {
        if (returnType === "string") {
          return UTF8ToString(ret2);
        }
        if (returnType === "boolean")
          return Boolean(ret2);
        return ret2;
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      if (args) {
        for (var i = 0;i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0)
              stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var previousAsync = Asyncify.currData;
      var ret = func(...cArgs);
      function onDone(ret2) {
        runtimeKeepalivePop();
        if (stack !== 0)
          stackRestore(stack);
        return convertReturnValue(ret2);
      }
      var asyncMode = opts?.async;
      runtimeKeepalivePush();
      if (Asyncify.currData != previousAsync) {
        return Asyncify.whenDone().then(onDone);
      }
      ret = onDone(ret);
      if (asyncMode)
        return Promise.resolve(ret);
      return ret;
    };
    var cwrap = (ident, returnType, argTypes, opts) => {
      var numericArgs = !argTypes || argTypes.every((type) => type === "number" || type === "boolean");
      var numericRet = returnType !== "string";
      if (numericRet && numericArgs && !opts) {
        return getCFunc(ident);
      }
      return (...args) => ccall(ident, returnType, argTypes, args, opts);
    };
    var getTempRet0 = (val) => __emscripten_tempret_get();
    var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
      maxBytesToWrite ??= 2147483647;
      if (maxBytesToWrite < 2)
        return 0;
      maxBytesToWrite -= 2;
      var startPtr = outPtr;
      var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i = 0;i < numCharsToWrite; ++i) {
        var codeUnit = str.charCodeAt(i);
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
      }
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr;
    };
    var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
      maxBytesToWrite ??= 2147483647;
      if (maxBytesToWrite < 4)
        return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0;i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr)
          break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    };
    var AsciiToString = (ptr) => {
      var str = "";
      while (true) {
        var ch = HEAPU8[ptr++];
        if (!ch)
          return str;
        str += String.fromCharCode(ch);
      }
    };
    var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;
    var UTF16ToString = (ptr, maxBytesToRead) => {
      var endPtr = ptr;
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      while (!(idx >= maxIdx) && HEAPU16[idx])
        ++idx;
      endPtr = idx << 1;
      if (endPtr - ptr > 32 && UTF16Decoder)
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
      var str = "";
      for (var i = 0;!(i >= maxBytesToRead / 2); ++i) {
        var codeUnit = HEAP16[ptr + i * 2 >> 1];
        if (codeUnit == 0)
          break;
        str += String.fromCharCode(codeUnit);
      }
      return str;
    };
    var UTF32ToString = (ptr, maxBytesToRead) => {
      var i = 0;
      var str = "";
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[ptr + i * 4 >> 2];
        if (utf32 == 0)
          break;
        ++i;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    };
    function intArrayToString(array) {
      var ret = [];
      for (var i = 0;i < array.length; i++) {
        var chr = array[i];
        if (chr > 255) {
          chr &= 255;
        }
        ret.push(String.fromCharCode(chr));
      }
      return ret.join("");
    }
    FS.createPreloadedFile = FS_createPreloadedFile;
    FS.staticInit();
    adapters_support();
    var wasmImports = { a: ___assert_fail, Y: ___syscall_chmod, $: ___syscall_faccessat, Z: ___syscall_fchmod, X: ___syscall_fchown32, b: ___syscall_fcntl64, W: ___syscall_fstat64, y: ___syscall_ftruncate64, Q: ___syscall_getcwd, U: ___syscall_lstat64, N: ___syscall_mkdirat, S: ___syscall_newfstatat, M: ___syscall_openat, K: ___syscall_readlinkat, J: ___syscall_rmdir, V: ___syscall_stat64, G: ___syscall_unlinkat, F: ___syscall_utimensat, w: __localtime_js, u: __mmap_js, v: __munmap_js, H: __tzset_js, n: _emscripten_date_now, m: _emscripten_get_now, D: _emscripten_resize_heap, O: _environ_get, P: _environ_sizes_get, o: _fd_close, E: _fd_fdstat_get, L: _fd_read, x: _fd_seek, R: _fd_sync, I: _fd_write, s: _ipp, t: _ipp_async, ga: _ippipppp, ka: _ippipppp_async, i: _ippp, j: _ippp_async, c: _ipppi, d: _ipppi_async, ca: _ipppiii, da: _ipppiii_async, ea: _ipppiiip, fa: _ipppiiip_async, g: _ipppip, h: _ipppip_async, z: _ipppj, A: _ipppj_async, e: _ipppp, f: _ipppp_async, aa: _ippppi, ba: _ippppi_async, B: _ippppij, C: _ippppij_async, p: _ippppip, q: _ippppip_async, ha: _ipppppip, ia: _ipppppip_async, ja: _vppippii, r: _vppippii_async, k: _vppp, l: _vppp_async, T: _vpppip, _: _vpppip_async };
    var wasmExports = createWasm();
    var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["ma"])();
    var _sqlite3_status64 = Module2["_sqlite3_status64"] = (a0, a1, a2, a3) => (_sqlite3_status64 = Module2["_sqlite3_status64"] = wasmExports["na"])(a0, a1, a2, a3);
    var _sqlite3_status = Module2["_sqlite3_status"] = (a0, a1, a2, a3) => (_sqlite3_status = Module2["_sqlite3_status"] = wasmExports["oa"])(a0, a1, a2, a3);
    var _sqlite3_db_status = Module2["_sqlite3_db_status"] = (a0, a1, a2, a3, a4) => (_sqlite3_db_status = Module2["_sqlite3_db_status"] = wasmExports["pa"])(a0, a1, a2, a3, a4);
    var _sqlite3_msize = Module2["_sqlite3_msize"] = (a0) => (_sqlite3_msize = Module2["_sqlite3_msize"] = wasmExports["qa"])(a0);
    var _sqlite3_vfs_find = Module2["_sqlite3_vfs_find"] = (a0) => (_sqlite3_vfs_find = Module2["_sqlite3_vfs_find"] = wasmExports["ra"])(a0);
    var _sqlite3_vfs_register = Module2["_sqlite3_vfs_register"] = (a0, a1) => (_sqlite3_vfs_register = Module2["_sqlite3_vfs_register"] = wasmExports["sa"])(a0, a1);
    var _sqlite3_vfs_unregister = Module2["_sqlite3_vfs_unregister"] = (a0) => (_sqlite3_vfs_unregister = Module2["_sqlite3_vfs_unregister"] = wasmExports["ta"])(a0);
    var _sqlite3_release_memory = Module2["_sqlite3_release_memory"] = (a0) => (_sqlite3_release_memory = Module2["_sqlite3_release_memory"] = wasmExports["ua"])(a0);
    var _sqlite3_soft_heap_limit64 = Module2["_sqlite3_soft_heap_limit64"] = (a0, a1) => (_sqlite3_soft_heap_limit64 = Module2["_sqlite3_soft_heap_limit64"] = wasmExports["va"])(a0, a1);
    var _sqlite3_memory_used = Module2["_sqlite3_memory_used"] = () => (_sqlite3_memory_used = Module2["_sqlite3_memory_used"] = wasmExports["wa"])();
    var _sqlite3_hard_heap_limit64 = Module2["_sqlite3_hard_heap_limit64"] = (a0, a1) => (_sqlite3_hard_heap_limit64 = Module2["_sqlite3_hard_heap_limit64"] = wasmExports["xa"])(a0, a1);
    var _sqlite3_memory_highwater = Module2["_sqlite3_memory_highwater"] = (a0) => (_sqlite3_memory_highwater = Module2["_sqlite3_memory_highwater"] = wasmExports["ya"])(a0);
    var _sqlite3_malloc = Module2["_sqlite3_malloc"] = (a0) => (_sqlite3_malloc = Module2["_sqlite3_malloc"] = wasmExports["za"])(a0);
    var _sqlite3_malloc64 = Module2["_sqlite3_malloc64"] = (a0, a1) => (_sqlite3_malloc64 = Module2["_sqlite3_malloc64"] = wasmExports["Aa"])(a0, a1);
    var _sqlite3_free = Module2["_sqlite3_free"] = (a0) => (_sqlite3_free = Module2["_sqlite3_free"] = wasmExports["Ba"])(a0);
    var _sqlite3_realloc = Module2["_sqlite3_realloc"] = (a0, a1) => (_sqlite3_realloc = Module2["_sqlite3_realloc"] = wasmExports["Ca"])(a0, a1);
    var _sqlite3_realloc64 = Module2["_sqlite3_realloc64"] = (a0, a1, a2) => (_sqlite3_realloc64 = Module2["_sqlite3_realloc64"] = wasmExports["Da"])(a0, a1, a2);
    var _sqlite3_str_vappendf = Module2["_sqlite3_str_vappendf"] = (a0, a1, a2) => (_sqlite3_str_vappendf = Module2["_sqlite3_str_vappendf"] = wasmExports["Ea"])(a0, a1, a2);
    var _sqlite3_str_append = Module2["_sqlite3_str_append"] = (a0, a1, a2) => (_sqlite3_str_append = Module2["_sqlite3_str_append"] = wasmExports["Fa"])(a0, a1, a2);
    var _sqlite3_str_appendchar = Module2["_sqlite3_str_appendchar"] = (a0, a1, a2) => (_sqlite3_str_appendchar = Module2["_sqlite3_str_appendchar"] = wasmExports["Ga"])(a0, a1, a2);
    var _sqlite3_str_appendall = Module2["_sqlite3_str_appendall"] = (a0, a1) => (_sqlite3_str_appendall = Module2["_sqlite3_str_appendall"] = wasmExports["Ha"])(a0, a1);
    var _sqlite3_str_appendf = Module2["_sqlite3_str_appendf"] = (a0, a1, a2) => (_sqlite3_str_appendf = Module2["_sqlite3_str_appendf"] = wasmExports["Ia"])(a0, a1, a2);
    var _sqlite3_str_finish = Module2["_sqlite3_str_finish"] = (a0) => (_sqlite3_str_finish = Module2["_sqlite3_str_finish"] = wasmExports["Ja"])(a0);
    var _sqlite3_str_errcode = Module2["_sqlite3_str_errcode"] = (a0) => (_sqlite3_str_errcode = Module2["_sqlite3_str_errcode"] = wasmExports["Ka"])(a0);
    var _sqlite3_str_length = Module2["_sqlite3_str_length"] = (a0) => (_sqlite3_str_length = Module2["_sqlite3_str_length"] = wasmExports["La"])(a0);
    var _sqlite3_str_value = Module2["_sqlite3_str_value"] = (a0) => (_sqlite3_str_value = Module2["_sqlite3_str_value"] = wasmExports["Ma"])(a0);
    var _sqlite3_str_reset = Module2["_sqlite3_str_reset"] = (a0) => (_sqlite3_str_reset = Module2["_sqlite3_str_reset"] = wasmExports["Na"])(a0);
    var _sqlite3_str_new = Module2["_sqlite3_str_new"] = (a0) => (_sqlite3_str_new = Module2["_sqlite3_str_new"] = wasmExports["Oa"])(a0);
    var _sqlite3_vmprintf = Module2["_sqlite3_vmprintf"] = (a0, a1) => (_sqlite3_vmprintf = Module2["_sqlite3_vmprintf"] = wasmExports["Pa"])(a0, a1);
    var _sqlite3_mprintf = Module2["_sqlite3_mprintf"] = (a0, a1) => (_sqlite3_mprintf = Module2["_sqlite3_mprintf"] = wasmExports["Qa"])(a0, a1);
    var _sqlite3_vsnprintf = Module2["_sqlite3_vsnprintf"] = (a0, a1, a2, a3) => (_sqlite3_vsnprintf = Module2["_sqlite3_vsnprintf"] = wasmExports["Ra"])(a0, a1, a2, a3);
    var _sqlite3_snprintf = Module2["_sqlite3_snprintf"] = (a0, a1, a2, a3) => (_sqlite3_snprintf = Module2["_sqlite3_snprintf"] = wasmExports["Sa"])(a0, a1, a2, a3);
    var _sqlite3_log = Module2["_sqlite3_log"] = (a0, a1, a2) => (_sqlite3_log = Module2["_sqlite3_log"] = wasmExports["Ta"])(a0, a1, a2);
    var _sqlite3_randomness = Module2["_sqlite3_randomness"] = (a0, a1) => (_sqlite3_randomness = Module2["_sqlite3_randomness"] = wasmExports["Ua"])(a0, a1);
    var _sqlite3_stricmp = Module2["_sqlite3_stricmp"] = (a0, a1) => (_sqlite3_stricmp = Module2["_sqlite3_stricmp"] = wasmExports["Va"])(a0, a1);
    var _sqlite3_strnicmp = Module2["_sqlite3_strnicmp"] = (a0, a1, a2) => (_sqlite3_strnicmp = Module2["_sqlite3_strnicmp"] = wasmExports["Wa"])(a0, a1, a2);
    var _sqlite3_os_init = Module2["_sqlite3_os_init"] = () => (_sqlite3_os_init = Module2["_sqlite3_os_init"] = wasmExports["Xa"])();
    var _sqlite3_os_end = Module2["_sqlite3_os_end"] = () => (_sqlite3_os_end = Module2["_sqlite3_os_end"] = wasmExports["Ya"])();
    var _sqlite3_serialize = Module2["_sqlite3_serialize"] = (a0, a1, a2, a3) => (_sqlite3_serialize = Module2["_sqlite3_serialize"] = wasmExports["Za"])(a0, a1, a2, a3);
    var _sqlite3_prepare_v2 = Module2["_sqlite3_prepare_v2"] = (a0, a1, a2, a3, a4) => (_sqlite3_prepare_v2 = Module2["_sqlite3_prepare_v2"] = wasmExports["_a"])(a0, a1, a2, a3, a4);
    var _sqlite3_step = Module2["_sqlite3_step"] = (a0) => (_sqlite3_step = Module2["_sqlite3_step"] = wasmExports["$a"])(a0);
    var _sqlite3_column_int64 = Module2["_sqlite3_column_int64"] = (a0, a1) => (_sqlite3_column_int64 = Module2["_sqlite3_column_int64"] = wasmExports["ab"])(a0, a1);
    var _sqlite3_reset = Module2["_sqlite3_reset"] = (a0) => (_sqlite3_reset = Module2["_sqlite3_reset"] = wasmExports["bb"])(a0);
    var _sqlite3_exec = Module2["_sqlite3_exec"] = (a0, a1, a2, a3, a4) => (_sqlite3_exec = Module2["_sqlite3_exec"] = wasmExports["cb"])(a0, a1, a2, a3, a4);
    var _sqlite3_column_int = Module2["_sqlite3_column_int"] = (a0, a1) => (_sqlite3_column_int = Module2["_sqlite3_column_int"] = wasmExports["db"])(a0, a1);
    var _sqlite3_finalize = Module2["_sqlite3_finalize"] = (a0) => (_sqlite3_finalize = Module2["_sqlite3_finalize"] = wasmExports["eb"])(a0);
    var _sqlite3_deserialize = Module2["_sqlite3_deserialize"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_sqlite3_deserialize = Module2["_sqlite3_deserialize"] = wasmExports["fb"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _sqlite3_database_file_object = Module2["_sqlite3_database_file_object"] = (a0) => (_sqlite3_database_file_object = Module2["_sqlite3_database_file_object"] = wasmExports["gb"])(a0);
    var _sqlite3_backup_init = Module2["_sqlite3_backup_init"] = (a0, a1, a2, a3) => (_sqlite3_backup_init = Module2["_sqlite3_backup_init"] = wasmExports["hb"])(a0, a1, a2, a3);
    var _sqlite3_backup_step = Module2["_sqlite3_backup_step"] = (a0, a1) => (_sqlite3_backup_step = Module2["_sqlite3_backup_step"] = wasmExports["ib"])(a0, a1);
    var _sqlite3_backup_finish = Module2["_sqlite3_backup_finish"] = (a0) => (_sqlite3_backup_finish = Module2["_sqlite3_backup_finish"] = wasmExports["jb"])(a0);
    var _sqlite3_backup_remaining = Module2["_sqlite3_backup_remaining"] = (a0) => (_sqlite3_backup_remaining = Module2["_sqlite3_backup_remaining"] = wasmExports["kb"])(a0);
    var _sqlite3_backup_pagecount = Module2["_sqlite3_backup_pagecount"] = (a0) => (_sqlite3_backup_pagecount = Module2["_sqlite3_backup_pagecount"] = wasmExports["lb"])(a0);
    var _sqlite3_clear_bindings = Module2["_sqlite3_clear_bindings"] = (a0) => (_sqlite3_clear_bindings = Module2["_sqlite3_clear_bindings"] = wasmExports["mb"])(a0);
    var _sqlite3_value_blob = Module2["_sqlite3_value_blob"] = (a0) => (_sqlite3_value_blob = Module2["_sqlite3_value_blob"] = wasmExports["nb"])(a0);
    var _sqlite3_value_text = Module2["_sqlite3_value_text"] = (a0) => (_sqlite3_value_text = Module2["_sqlite3_value_text"] = wasmExports["ob"])(a0);
    var _sqlite3_value_bytes = Module2["_sqlite3_value_bytes"] = (a0) => (_sqlite3_value_bytes = Module2["_sqlite3_value_bytes"] = wasmExports["pb"])(a0);
    var _sqlite3_value_bytes16 = Module2["_sqlite3_value_bytes16"] = (a0) => (_sqlite3_value_bytes16 = Module2["_sqlite3_value_bytes16"] = wasmExports["qb"])(a0);
    var _sqlite3_value_double = Module2["_sqlite3_value_double"] = (a0) => (_sqlite3_value_double = Module2["_sqlite3_value_double"] = wasmExports["rb"])(a0);
    var _sqlite3_value_int = Module2["_sqlite3_value_int"] = (a0) => (_sqlite3_value_int = Module2["_sqlite3_value_int"] = wasmExports["sb"])(a0);
    var _sqlite3_value_int64 = Module2["_sqlite3_value_int64"] = (a0) => (_sqlite3_value_int64 = Module2["_sqlite3_value_int64"] = wasmExports["tb"])(a0);
    var _sqlite3_value_subtype = Module2["_sqlite3_value_subtype"] = (a0) => (_sqlite3_value_subtype = Module2["_sqlite3_value_subtype"] = wasmExports["ub"])(a0);
    var _sqlite3_value_pointer = Module2["_sqlite3_value_pointer"] = (a0, a1) => (_sqlite3_value_pointer = Module2["_sqlite3_value_pointer"] = wasmExports["vb"])(a0, a1);
    var _sqlite3_value_text16 = Module2["_sqlite3_value_text16"] = (a0) => (_sqlite3_value_text16 = Module2["_sqlite3_value_text16"] = wasmExports["wb"])(a0);
    var _sqlite3_value_text16be = Module2["_sqlite3_value_text16be"] = (a0) => (_sqlite3_value_text16be = Module2["_sqlite3_value_text16be"] = wasmExports["xb"])(a0);
    var _sqlite3_value_text16le = Module2["_sqlite3_value_text16le"] = (a0) => (_sqlite3_value_text16le = Module2["_sqlite3_value_text16le"] = wasmExports["yb"])(a0);
    var _sqlite3_value_type = Module2["_sqlite3_value_type"] = (a0) => (_sqlite3_value_type = Module2["_sqlite3_value_type"] = wasmExports["zb"])(a0);
    var _sqlite3_value_encoding = Module2["_sqlite3_value_encoding"] = (a0) => (_sqlite3_value_encoding = Module2["_sqlite3_value_encoding"] = wasmExports["Ab"])(a0);
    var _sqlite3_value_nochange = Module2["_sqlite3_value_nochange"] = (a0) => (_sqlite3_value_nochange = Module2["_sqlite3_value_nochange"] = wasmExports["Bb"])(a0);
    var _sqlite3_value_frombind = Module2["_sqlite3_value_frombind"] = (a0) => (_sqlite3_value_frombind = Module2["_sqlite3_value_frombind"] = wasmExports["Cb"])(a0);
    var _sqlite3_value_dup = Module2["_sqlite3_value_dup"] = (a0) => (_sqlite3_value_dup = Module2["_sqlite3_value_dup"] = wasmExports["Db"])(a0);
    var _sqlite3_value_free = Module2["_sqlite3_value_free"] = (a0) => (_sqlite3_value_free = Module2["_sqlite3_value_free"] = wasmExports["Eb"])(a0);
    var _sqlite3_result_blob = Module2["_sqlite3_result_blob"] = (a0, a1, a2, a3) => (_sqlite3_result_blob = Module2["_sqlite3_result_blob"] = wasmExports["Fb"])(a0, a1, a2, a3);
    var _sqlite3_result_blob64 = Module2["_sqlite3_result_blob64"] = (a0, a1, a2, a3, a4) => (_sqlite3_result_blob64 = Module2["_sqlite3_result_blob64"] = wasmExports["Gb"])(a0, a1, a2, a3, a4);
    var _sqlite3_result_double = Module2["_sqlite3_result_double"] = (a0, a1) => (_sqlite3_result_double = Module2["_sqlite3_result_double"] = wasmExports["Hb"])(a0, a1);
    var _sqlite3_result_error = Module2["_sqlite3_result_error"] = (a0, a1, a2) => (_sqlite3_result_error = Module2["_sqlite3_result_error"] = wasmExports["Ib"])(a0, a1, a2);
    var _sqlite3_result_error16 = Module2["_sqlite3_result_error16"] = (a0, a1, a2) => (_sqlite3_result_error16 = Module2["_sqlite3_result_error16"] = wasmExports["Jb"])(a0, a1, a2);
    var _sqlite3_result_int = Module2["_sqlite3_result_int"] = (a0, a1) => (_sqlite3_result_int = Module2["_sqlite3_result_int"] = wasmExports["Kb"])(a0, a1);
    var _sqlite3_result_int64 = Module2["_sqlite3_result_int64"] = (a0, a1, a2) => (_sqlite3_result_int64 = Module2["_sqlite3_result_int64"] = wasmExports["Lb"])(a0, a1, a2);
    var _sqlite3_result_null = Module2["_sqlite3_result_null"] = (a0) => (_sqlite3_result_null = Module2["_sqlite3_result_null"] = wasmExports["Mb"])(a0);
    var _sqlite3_result_pointer = Module2["_sqlite3_result_pointer"] = (a0, a1, a2, a3) => (_sqlite3_result_pointer = Module2["_sqlite3_result_pointer"] = wasmExports["Nb"])(a0, a1, a2, a3);
    var _sqlite3_result_subtype = Module2["_sqlite3_result_subtype"] = (a0, a1) => (_sqlite3_result_subtype = Module2["_sqlite3_result_subtype"] = wasmExports["Ob"])(a0, a1);
    var _sqlite3_result_text = Module2["_sqlite3_result_text"] = (a0, a1, a2, a3) => (_sqlite3_result_text = Module2["_sqlite3_result_text"] = wasmExports["Pb"])(a0, a1, a2, a3);
    var _sqlite3_result_text64 = Module2["_sqlite3_result_text64"] = (a0, a1, a2, a3, a4, a5) => (_sqlite3_result_text64 = Module2["_sqlite3_result_text64"] = wasmExports["Qb"])(a0, a1, a2, a3, a4, a5);
    var _sqlite3_result_text16 = Module2["_sqlite3_result_text16"] = (a0, a1, a2, a3) => (_sqlite3_result_text16 = Module2["_sqlite3_result_text16"] = wasmExports["Rb"])(a0, a1, a2, a3);
    var _sqlite3_result_text16be = Module2["_sqlite3_result_text16be"] = (a0, a1, a2, a3) => (_sqlite3_result_text16be = Module2["_sqlite3_result_text16be"] = wasmExports["Sb"])(a0, a1, a2, a3);
    var _sqlite3_result_text16le = Module2["_sqlite3_result_text16le"] = (a0, a1, a2, a3) => (_sqlite3_result_text16le = Module2["_sqlite3_result_text16le"] = wasmExports["Tb"])(a0, a1, a2, a3);
    var _sqlite3_result_value = Module2["_sqlite3_result_value"] = (a0, a1) => (_sqlite3_result_value = Module2["_sqlite3_result_value"] = wasmExports["Ub"])(a0, a1);
    var _sqlite3_result_error_toobig = Module2["_sqlite3_result_error_toobig"] = (a0) => (_sqlite3_result_error_toobig = Module2["_sqlite3_result_error_toobig"] = wasmExports["Vb"])(a0);
    var _sqlite3_result_zeroblob = Module2["_sqlite3_result_zeroblob"] = (a0, a1) => (_sqlite3_result_zeroblob = Module2["_sqlite3_result_zeroblob"] = wasmExports["Wb"])(a0, a1);
    var _sqlite3_result_zeroblob64 = Module2["_sqlite3_result_zeroblob64"] = (a0, a1, a2) => (_sqlite3_result_zeroblob64 = Module2["_sqlite3_result_zeroblob64"] = wasmExports["Xb"])(a0, a1, a2);
    var _sqlite3_result_error_code = Module2["_sqlite3_result_error_code"] = (a0, a1) => (_sqlite3_result_error_code = Module2["_sqlite3_result_error_code"] = wasmExports["Yb"])(a0, a1);
    var _sqlite3_result_error_nomem = Module2["_sqlite3_result_error_nomem"] = (a0) => (_sqlite3_result_error_nomem = Module2["_sqlite3_result_error_nomem"] = wasmExports["Zb"])(a0);
    var _sqlite3_user_data = Module2["_sqlite3_user_data"] = (a0) => (_sqlite3_user_data = Module2["_sqlite3_user_data"] = wasmExports["_b"])(a0);
    var _sqlite3_context_db_handle = Module2["_sqlite3_context_db_handle"] = (a0) => (_sqlite3_context_db_handle = Module2["_sqlite3_context_db_handle"] = wasmExports["$b"])(a0);
    var _sqlite3_vtab_nochange = Module2["_sqlite3_vtab_nochange"] = (a0) => (_sqlite3_vtab_nochange = Module2["_sqlite3_vtab_nochange"] = wasmExports["ac"])(a0);
    var _sqlite3_vtab_in_first = Module2["_sqlite3_vtab_in_first"] = (a0, a1) => (_sqlite3_vtab_in_first = Module2["_sqlite3_vtab_in_first"] = wasmExports["bc"])(a0, a1);
    var _sqlite3_vtab_in_next = Module2["_sqlite3_vtab_in_next"] = (a0, a1) => (_sqlite3_vtab_in_next = Module2["_sqlite3_vtab_in_next"] = wasmExports["cc"])(a0, a1);
    var _sqlite3_aggregate_context = Module2["_sqlite3_aggregate_context"] = (a0, a1) => (_sqlite3_aggregate_context = Module2["_sqlite3_aggregate_context"] = wasmExports["dc"])(a0, a1);
    var _sqlite3_get_auxdata = Module2["_sqlite3_get_auxdata"] = (a0, a1) => (_sqlite3_get_auxdata = Module2["_sqlite3_get_auxdata"] = wasmExports["ec"])(a0, a1);
    var _sqlite3_set_auxdata = Module2["_sqlite3_set_auxdata"] = (a0, a1, a2, a3) => (_sqlite3_set_auxdata = Module2["_sqlite3_set_auxdata"] = wasmExports["fc"])(a0, a1, a2, a3);
    var _sqlite3_column_count = Module2["_sqlite3_column_count"] = (a0) => (_sqlite3_column_count = Module2["_sqlite3_column_count"] = wasmExports["gc"])(a0);
    var _sqlite3_data_count = Module2["_sqlite3_data_count"] = (a0) => (_sqlite3_data_count = Module2["_sqlite3_data_count"] = wasmExports["hc"])(a0);
    var _sqlite3_column_blob = Module2["_sqlite3_column_blob"] = (a0, a1) => (_sqlite3_column_blob = Module2["_sqlite3_column_blob"] = wasmExports["ic"])(a0, a1);
    var _sqlite3_column_bytes = Module2["_sqlite3_column_bytes"] = (a0, a1) => (_sqlite3_column_bytes = Module2["_sqlite3_column_bytes"] = wasmExports["jc"])(a0, a1);
    var _sqlite3_column_bytes16 = Module2["_sqlite3_column_bytes16"] = (a0, a1) => (_sqlite3_column_bytes16 = Module2["_sqlite3_column_bytes16"] = wasmExports["kc"])(a0, a1);
    var _sqlite3_column_double = Module2["_sqlite3_column_double"] = (a0, a1) => (_sqlite3_column_double = Module2["_sqlite3_column_double"] = wasmExports["lc"])(a0, a1);
    var _sqlite3_column_text = Module2["_sqlite3_column_text"] = (a0, a1) => (_sqlite3_column_text = Module2["_sqlite3_column_text"] = wasmExports["mc"])(a0, a1);
    var _sqlite3_column_value = Module2["_sqlite3_column_value"] = (a0, a1) => (_sqlite3_column_value = Module2["_sqlite3_column_value"] = wasmExports["nc"])(a0, a1);
    var _sqlite3_column_text16 = Module2["_sqlite3_column_text16"] = (a0, a1) => (_sqlite3_column_text16 = Module2["_sqlite3_column_text16"] = wasmExports["oc"])(a0, a1);
    var _sqlite3_column_type = Module2["_sqlite3_column_type"] = (a0, a1) => (_sqlite3_column_type = Module2["_sqlite3_column_type"] = wasmExports["pc"])(a0, a1);
    var _sqlite3_column_name = Module2["_sqlite3_column_name"] = (a0, a1) => (_sqlite3_column_name = Module2["_sqlite3_column_name"] = wasmExports["qc"])(a0, a1);
    var _sqlite3_column_name16 = Module2["_sqlite3_column_name16"] = (a0, a1) => (_sqlite3_column_name16 = Module2["_sqlite3_column_name16"] = wasmExports["rc"])(a0, a1);
    var _sqlite3_bind_blob = Module2["_sqlite3_bind_blob"] = (a0, a1, a2, a3, a4) => (_sqlite3_bind_blob = Module2["_sqlite3_bind_blob"] = wasmExports["sc"])(a0, a1, a2, a3, a4);
    var _sqlite3_bind_blob64 = Module2["_sqlite3_bind_blob64"] = (a0, a1, a2, a3, a4, a5) => (_sqlite3_bind_blob64 = Module2["_sqlite3_bind_blob64"] = wasmExports["tc"])(a0, a1, a2, a3, a4, a5);
    var _sqlite3_bind_double = Module2["_sqlite3_bind_double"] = (a0, a1, a2) => (_sqlite3_bind_double = Module2["_sqlite3_bind_double"] = wasmExports["uc"])(a0, a1, a2);
    var _sqlite3_bind_int = Module2["_sqlite3_bind_int"] = (a0, a1, a2) => (_sqlite3_bind_int = Module2["_sqlite3_bind_int"] = wasmExports["vc"])(a0, a1, a2);
    var _sqlite3_bind_int64 = Module2["_sqlite3_bind_int64"] = (a0, a1, a2, a3) => (_sqlite3_bind_int64 = Module2["_sqlite3_bind_int64"] = wasmExports["wc"])(a0, a1, a2, a3);
    var _sqlite3_bind_null = Module2["_sqlite3_bind_null"] = (a0, a1) => (_sqlite3_bind_null = Module2["_sqlite3_bind_null"] = wasmExports["xc"])(a0, a1);
    var _sqlite3_bind_pointer = Module2["_sqlite3_bind_pointer"] = (a0, a1, a2, a3, a4) => (_sqlite3_bind_pointer = Module2["_sqlite3_bind_pointer"] = wasmExports["yc"])(a0, a1, a2, a3, a4);
    var _sqlite3_bind_text = Module2["_sqlite3_bind_text"] = (a0, a1, a2, a3, a4) => (_sqlite3_bind_text = Module2["_sqlite3_bind_text"] = wasmExports["zc"])(a0, a1, a2, a3, a4);
    var _sqlite3_bind_text64 = Module2["_sqlite3_bind_text64"] = (a0, a1, a2, a3, a4, a5, a6) => (_sqlite3_bind_text64 = Module2["_sqlite3_bind_text64"] = wasmExports["Ac"])(a0, a1, a2, a3, a4, a5, a6);
    var _sqlite3_bind_text16 = Module2["_sqlite3_bind_text16"] = (a0, a1, a2, a3, a4) => (_sqlite3_bind_text16 = Module2["_sqlite3_bind_text16"] = wasmExports["Bc"])(a0, a1, a2, a3, a4);
    var _sqlite3_bind_value = Module2["_sqlite3_bind_value"] = (a0, a1, a2) => (_sqlite3_bind_value = Module2["_sqlite3_bind_value"] = wasmExports["Cc"])(a0, a1, a2);
    var _sqlite3_bind_zeroblob = Module2["_sqlite3_bind_zeroblob"] = (a0, a1, a2) => (_sqlite3_bind_zeroblob = Module2["_sqlite3_bind_zeroblob"] = wasmExports["Dc"])(a0, a1, a2);
    var _sqlite3_bind_zeroblob64 = Module2["_sqlite3_bind_zeroblob64"] = (a0, a1, a2, a3) => (_sqlite3_bind_zeroblob64 = Module2["_sqlite3_bind_zeroblob64"] = wasmExports["Ec"])(a0, a1, a2, a3);
    var _sqlite3_bind_parameter_count = Module2["_sqlite3_bind_parameter_count"] = (a0) => (_sqlite3_bind_parameter_count = Module2["_sqlite3_bind_parameter_count"] = wasmExports["Fc"])(a0);
    var _sqlite3_bind_parameter_name = Module2["_sqlite3_bind_parameter_name"] = (a0, a1) => (_sqlite3_bind_parameter_name = Module2["_sqlite3_bind_parameter_name"] = wasmExports["Gc"])(a0, a1);
    var _sqlite3_bind_parameter_index = Module2["_sqlite3_bind_parameter_index"] = (a0, a1) => (_sqlite3_bind_parameter_index = Module2["_sqlite3_bind_parameter_index"] = wasmExports["Hc"])(a0, a1);
    var _sqlite3_db_handle = Module2["_sqlite3_db_handle"] = (a0) => (_sqlite3_db_handle = Module2["_sqlite3_db_handle"] = wasmExports["Ic"])(a0);
    var _sqlite3_stmt_readonly = Module2["_sqlite3_stmt_readonly"] = (a0) => (_sqlite3_stmt_readonly = Module2["_sqlite3_stmt_readonly"] = wasmExports["Jc"])(a0);
    var _sqlite3_stmt_isexplain = Module2["_sqlite3_stmt_isexplain"] = (a0) => (_sqlite3_stmt_isexplain = Module2["_sqlite3_stmt_isexplain"] = wasmExports["Kc"])(a0);
    var _sqlite3_stmt_explain = Module2["_sqlite3_stmt_explain"] = (a0, a1) => (_sqlite3_stmt_explain = Module2["_sqlite3_stmt_explain"] = wasmExports["Lc"])(a0, a1);
    var _sqlite3_stmt_busy = Module2["_sqlite3_stmt_busy"] = (a0) => (_sqlite3_stmt_busy = Module2["_sqlite3_stmt_busy"] = wasmExports["Mc"])(a0);
    var _sqlite3_next_stmt = Module2["_sqlite3_next_stmt"] = (a0, a1) => (_sqlite3_next_stmt = Module2["_sqlite3_next_stmt"] = wasmExports["Nc"])(a0, a1);
    var _sqlite3_stmt_status = Module2["_sqlite3_stmt_status"] = (a0, a1, a2) => (_sqlite3_stmt_status = Module2["_sqlite3_stmt_status"] = wasmExports["Oc"])(a0, a1, a2);
    var _sqlite3_sql = Module2["_sqlite3_sql"] = (a0) => (_sqlite3_sql = Module2["_sqlite3_sql"] = wasmExports["Pc"])(a0);
    var _sqlite3_expanded_sql = Module2["_sqlite3_expanded_sql"] = (a0) => (_sqlite3_expanded_sql = Module2["_sqlite3_expanded_sql"] = wasmExports["Qc"])(a0);
    var _sqlite3_value_numeric_type = Module2["_sqlite3_value_numeric_type"] = (a0) => (_sqlite3_value_numeric_type = Module2["_sqlite3_value_numeric_type"] = wasmExports["Rc"])(a0);
    var _sqlite3_blob_open = Module2["_sqlite3_blob_open"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_sqlite3_blob_open = Module2["_sqlite3_blob_open"] = wasmExports["Sc"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _sqlite3_blob_close = Module2["_sqlite3_blob_close"] = (a0) => (_sqlite3_blob_close = Module2["_sqlite3_blob_close"] = wasmExports["Tc"])(a0);
    var _sqlite3_blob_read = Module2["_sqlite3_blob_read"] = (a0, a1, a2, a3) => (_sqlite3_blob_read = Module2["_sqlite3_blob_read"] = wasmExports["Uc"])(a0, a1, a2, a3);
    var _sqlite3_blob_write = Module2["_sqlite3_blob_write"] = (a0, a1, a2, a3) => (_sqlite3_blob_write = Module2["_sqlite3_blob_write"] = wasmExports["Vc"])(a0, a1, a2, a3);
    var _sqlite3_blob_bytes = Module2["_sqlite3_blob_bytes"] = (a0) => (_sqlite3_blob_bytes = Module2["_sqlite3_blob_bytes"] = wasmExports["Wc"])(a0);
    var _sqlite3_blob_reopen = Module2["_sqlite3_blob_reopen"] = (a0, a1, a2) => (_sqlite3_blob_reopen = Module2["_sqlite3_blob_reopen"] = wasmExports["Xc"])(a0, a1, a2);
    var _sqlite3_set_authorizer = Module2["_sqlite3_set_authorizer"] = (a0, a1, a2) => (_sqlite3_set_authorizer = Module2["_sqlite3_set_authorizer"] = wasmExports["Yc"])(a0, a1, a2);
    var _sqlite3_strglob = Module2["_sqlite3_strglob"] = (a0, a1) => (_sqlite3_strglob = Module2["_sqlite3_strglob"] = wasmExports["Zc"])(a0, a1);
    var _sqlite3_strlike = Module2["_sqlite3_strlike"] = (a0, a1, a2) => (_sqlite3_strlike = Module2["_sqlite3_strlike"] = wasmExports["_c"])(a0, a1, a2);
    var _sqlite3_errmsg = Module2["_sqlite3_errmsg"] = (a0) => (_sqlite3_errmsg = Module2["_sqlite3_errmsg"] = wasmExports["$c"])(a0);
    var _sqlite3_auto_extension = Module2["_sqlite3_auto_extension"] = (a0) => (_sqlite3_auto_extension = Module2["_sqlite3_auto_extension"] = wasmExports["ad"])(a0);
    var _sqlite3_cancel_auto_extension = Module2["_sqlite3_cancel_auto_extension"] = (a0) => (_sqlite3_cancel_auto_extension = Module2["_sqlite3_cancel_auto_extension"] = wasmExports["bd"])(a0);
    var _sqlite3_reset_auto_extension = Module2["_sqlite3_reset_auto_extension"] = () => (_sqlite3_reset_auto_extension = Module2["_sqlite3_reset_auto_extension"] = wasmExports["cd"])();
    var _sqlite3_prepare = Module2["_sqlite3_prepare"] = (a0, a1, a2, a3, a4) => (_sqlite3_prepare = Module2["_sqlite3_prepare"] = wasmExports["dd"])(a0, a1, a2, a3, a4);
    var _sqlite3_prepare_v3 = Module2["_sqlite3_prepare_v3"] = (a0, a1, a2, a3, a4, a5) => (_sqlite3_prepare_v3 = Module2["_sqlite3_prepare_v3"] = wasmExports["ed"])(a0, a1, a2, a3, a4, a5);
    var _sqlite3_prepare16 = Module2["_sqlite3_prepare16"] = (a0, a1, a2, a3, a4) => (_sqlite3_prepare16 = Module2["_sqlite3_prepare16"] = wasmExports["fd"])(a0, a1, a2, a3, a4);
    var _sqlite3_prepare16_v2 = Module2["_sqlite3_prepare16_v2"] = (a0, a1, a2, a3, a4) => (_sqlite3_prepare16_v2 = Module2["_sqlite3_prepare16_v2"] = wasmExports["gd"])(a0, a1, a2, a3, a4);
    var _sqlite3_prepare16_v3 = Module2["_sqlite3_prepare16_v3"] = (a0, a1, a2, a3, a4, a5) => (_sqlite3_prepare16_v3 = Module2["_sqlite3_prepare16_v3"] = wasmExports["hd"])(a0, a1, a2, a3, a4, a5);
    var _sqlite3_get_table = Module2["_sqlite3_get_table"] = (a0, a1, a2, a3, a4, a5) => (_sqlite3_get_table = Module2["_sqlite3_get_table"] = wasmExports["id"])(a0, a1, a2, a3, a4, a5);
    var _sqlite3_free_table = Module2["_sqlite3_free_table"] = (a0) => (_sqlite3_free_table = Module2["_sqlite3_free_table"] = wasmExports["jd"])(a0);
    var _sqlite3_create_module = Module2["_sqlite3_create_module"] = (a0, a1, a2, a3) => (_sqlite3_create_module = Module2["_sqlite3_create_module"] = wasmExports["kd"])(a0, a1, a2, a3);
    var _sqlite3_create_module_v2 = Module2["_sqlite3_create_module_v2"] = (a0, a1, a2, a3, a4) => (_sqlite3_create_module_v2 = Module2["_sqlite3_create_module_v2"] = wasmExports["ld"])(a0, a1, a2, a3, a4);
    var _sqlite3_drop_modules = Module2["_sqlite3_drop_modules"] = (a0, a1) => (_sqlite3_drop_modules = Module2["_sqlite3_drop_modules"] = wasmExports["md"])(a0, a1);
    var _sqlite3_declare_vtab = Module2["_sqlite3_declare_vtab"] = (a0, a1) => (_sqlite3_declare_vtab = Module2["_sqlite3_declare_vtab"] = wasmExports["nd"])(a0, a1);
    var _sqlite3_vtab_on_conflict = Module2["_sqlite3_vtab_on_conflict"] = (a0) => (_sqlite3_vtab_on_conflict = Module2["_sqlite3_vtab_on_conflict"] = wasmExports["od"])(a0);
    var _sqlite3_vtab_config = Module2["_sqlite3_vtab_config"] = (a0, a1, a2) => (_sqlite3_vtab_config = Module2["_sqlite3_vtab_config"] = wasmExports["pd"])(a0, a1, a2);
    var _sqlite3_vtab_collation = Module2["_sqlite3_vtab_collation"] = (a0, a1) => (_sqlite3_vtab_collation = Module2["_sqlite3_vtab_collation"] = wasmExports["qd"])(a0, a1);
    var _sqlite3_vtab_in = Module2["_sqlite3_vtab_in"] = (a0, a1, a2) => (_sqlite3_vtab_in = Module2["_sqlite3_vtab_in"] = wasmExports["rd"])(a0, a1, a2);
    var _sqlite3_vtab_rhs_value = Module2["_sqlite3_vtab_rhs_value"] = (a0, a1, a2) => (_sqlite3_vtab_rhs_value = Module2["_sqlite3_vtab_rhs_value"] = wasmExports["sd"])(a0, a1, a2);
    var _sqlite3_vtab_distinct = Module2["_sqlite3_vtab_distinct"] = (a0) => (_sqlite3_vtab_distinct = Module2["_sqlite3_vtab_distinct"] = wasmExports["td"])(a0);
    var _sqlite3_keyword_name = Module2["_sqlite3_keyword_name"] = (a0, a1, a2) => (_sqlite3_keyword_name = Module2["_sqlite3_keyword_name"] = wasmExports["ud"])(a0, a1, a2);
    var _sqlite3_keyword_count = Module2["_sqlite3_keyword_count"] = () => (_sqlite3_keyword_count = Module2["_sqlite3_keyword_count"] = wasmExports["vd"])();
    var _sqlite3_keyword_check = Module2["_sqlite3_keyword_check"] = (a0, a1) => (_sqlite3_keyword_check = Module2["_sqlite3_keyword_check"] = wasmExports["wd"])(a0, a1);
    var _sqlite3_complete = Module2["_sqlite3_complete"] = (a0) => (_sqlite3_complete = Module2["_sqlite3_complete"] = wasmExports["xd"])(a0);
    var _sqlite3_complete16 = Module2["_sqlite3_complete16"] = (a0) => (_sqlite3_complete16 = Module2["_sqlite3_complete16"] = wasmExports["yd"])(a0);
    var _sqlite3_libversion = Module2["_sqlite3_libversion"] = () => (_sqlite3_libversion = Module2["_sqlite3_libversion"] = wasmExports["zd"])();
    var _sqlite3_libversion_number = Module2["_sqlite3_libversion_number"] = () => (_sqlite3_libversion_number = Module2["_sqlite3_libversion_number"] = wasmExports["Ad"])();
    var _sqlite3_threadsafe = Module2["_sqlite3_threadsafe"] = () => (_sqlite3_threadsafe = Module2["_sqlite3_threadsafe"] = wasmExports["Bd"])();
    var _sqlite3_initialize = Module2["_sqlite3_initialize"] = () => (_sqlite3_initialize = Module2["_sqlite3_initialize"] = wasmExports["Cd"])();
    var _sqlite3_shutdown = Module2["_sqlite3_shutdown"] = () => (_sqlite3_shutdown = Module2["_sqlite3_shutdown"] = wasmExports["Dd"])();
    var _sqlite3_config = Module2["_sqlite3_config"] = (a0, a1) => (_sqlite3_config = Module2["_sqlite3_config"] = wasmExports["Ed"])(a0, a1);
    var _sqlite3_db_mutex = Module2["_sqlite3_db_mutex"] = (a0) => (_sqlite3_db_mutex = Module2["_sqlite3_db_mutex"] = wasmExports["Fd"])(a0);
    var _sqlite3_db_release_memory = Module2["_sqlite3_db_release_memory"] = (a0) => (_sqlite3_db_release_memory = Module2["_sqlite3_db_release_memory"] = wasmExports["Gd"])(a0);
    var _sqlite3_db_cacheflush = Module2["_sqlite3_db_cacheflush"] = (a0) => (_sqlite3_db_cacheflush = Module2["_sqlite3_db_cacheflush"] = wasmExports["Hd"])(a0);
    var _sqlite3_db_config = Module2["_sqlite3_db_config"] = (a0, a1, a2) => (_sqlite3_db_config = Module2["_sqlite3_db_config"] = wasmExports["Id"])(a0, a1, a2);
    var _sqlite3_last_insert_rowid = Module2["_sqlite3_last_insert_rowid"] = (a0) => (_sqlite3_last_insert_rowid = Module2["_sqlite3_last_insert_rowid"] = wasmExports["Jd"])(a0);
    var _sqlite3_set_last_insert_rowid = Module2["_sqlite3_set_last_insert_rowid"] = (a0, a1, a2) => (_sqlite3_set_last_insert_rowid = Module2["_sqlite3_set_last_insert_rowid"] = wasmExports["Kd"])(a0, a1, a2);
    var _sqlite3_changes64 = Module2["_sqlite3_changes64"] = (a0) => (_sqlite3_changes64 = Module2["_sqlite3_changes64"] = wasmExports["Ld"])(a0);
    var _sqlite3_changes = Module2["_sqlite3_changes"] = (a0) => (_sqlite3_changes = Module2["_sqlite3_changes"] = wasmExports["Md"])(a0);
    var _sqlite3_total_changes64 = Module2["_sqlite3_total_changes64"] = (a0) => (_sqlite3_total_changes64 = Module2["_sqlite3_total_changes64"] = wasmExports["Nd"])(a0);
    var _sqlite3_total_changes = Module2["_sqlite3_total_changes"] = (a0) => (_sqlite3_total_changes = Module2["_sqlite3_total_changes"] = wasmExports["Od"])(a0);
    var _sqlite3_txn_state = Module2["_sqlite3_txn_state"] = (a0, a1) => (_sqlite3_txn_state = Module2["_sqlite3_txn_state"] = wasmExports["Pd"])(a0, a1);
    var _sqlite3_close = Module2["_sqlite3_close"] = (a0) => (_sqlite3_close = Module2["_sqlite3_close"] = wasmExports["Qd"])(a0);
    var _sqlite3_close_v2 = Module2["_sqlite3_close_v2"] = (a0) => (_sqlite3_close_v2 = Module2["_sqlite3_close_v2"] = wasmExports["Rd"])(a0);
    var _sqlite3_busy_handler = Module2["_sqlite3_busy_handler"] = (a0, a1, a2) => (_sqlite3_busy_handler = Module2["_sqlite3_busy_handler"] = wasmExports["Sd"])(a0, a1, a2);
    var _sqlite3_progress_handler = Module2["_sqlite3_progress_handler"] = (a0, a1, a2, a3) => (_sqlite3_progress_handler = Module2["_sqlite3_progress_handler"] = wasmExports["Td"])(a0, a1, a2, a3);
    var _sqlite3_busy_timeout = Module2["_sqlite3_busy_timeout"] = (a0, a1) => (_sqlite3_busy_timeout = Module2["_sqlite3_busy_timeout"] = wasmExports["Ud"])(a0, a1);
    var _sqlite3_interrupt = Module2["_sqlite3_interrupt"] = (a0) => (_sqlite3_interrupt = Module2["_sqlite3_interrupt"] = wasmExports["Vd"])(a0);
    var _sqlite3_is_interrupted = Module2["_sqlite3_is_interrupted"] = (a0) => (_sqlite3_is_interrupted = Module2["_sqlite3_is_interrupted"] = wasmExports["Wd"])(a0);
    var _sqlite3_create_function = Module2["_sqlite3_create_function"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_sqlite3_create_function = Module2["_sqlite3_create_function"] = wasmExports["Xd"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _sqlite3_create_function_v2 = Module2["_sqlite3_create_function_v2"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_sqlite3_create_function_v2 = Module2["_sqlite3_create_function_v2"] = wasmExports["Yd"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    var _sqlite3_create_window_function = Module2["_sqlite3_create_window_function"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_sqlite3_create_window_function = Module2["_sqlite3_create_window_function"] = wasmExports["Zd"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    var _sqlite3_create_function16 = Module2["_sqlite3_create_function16"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_sqlite3_create_function16 = Module2["_sqlite3_create_function16"] = wasmExports["_d"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _sqlite3_overload_function = Module2["_sqlite3_overload_function"] = (a0, a1, a2) => (_sqlite3_overload_function = Module2["_sqlite3_overload_function"] = wasmExports["$d"])(a0, a1, a2);
    var _sqlite3_trace_v2 = Module2["_sqlite3_trace_v2"] = (a0, a1, a2, a3) => (_sqlite3_trace_v2 = Module2["_sqlite3_trace_v2"] = wasmExports["ae"])(a0, a1, a2, a3);
    var _sqlite3_commit_hook = Module2["_sqlite3_commit_hook"] = (a0, a1, a2) => (_sqlite3_commit_hook = Module2["_sqlite3_commit_hook"] = wasmExports["be"])(a0, a1, a2);
    var _sqlite3_update_hook = Module2["_sqlite3_update_hook"] = (a0, a1, a2) => (_sqlite3_update_hook = Module2["_sqlite3_update_hook"] = wasmExports["ce"])(a0, a1, a2);
    var _sqlite3_rollback_hook = Module2["_sqlite3_rollback_hook"] = (a0, a1, a2) => (_sqlite3_rollback_hook = Module2["_sqlite3_rollback_hook"] = wasmExports["de"])(a0, a1, a2);
    var _sqlite3_autovacuum_pages = Module2["_sqlite3_autovacuum_pages"] = (a0, a1, a2, a3) => (_sqlite3_autovacuum_pages = Module2["_sqlite3_autovacuum_pages"] = wasmExports["ee"])(a0, a1, a2, a3);
    var _sqlite3_wal_autocheckpoint = Module2["_sqlite3_wal_autocheckpoint"] = (a0, a1) => (_sqlite3_wal_autocheckpoint = Module2["_sqlite3_wal_autocheckpoint"] = wasmExports["fe"])(a0, a1);
    var _sqlite3_wal_hook = Module2["_sqlite3_wal_hook"] = (a0, a1, a2) => (_sqlite3_wal_hook = Module2["_sqlite3_wal_hook"] = wasmExports["ge"])(a0, a1, a2);
    var _sqlite3_wal_checkpoint_v2 = Module2["_sqlite3_wal_checkpoint_v2"] = (a0, a1, a2, a3, a4) => (_sqlite3_wal_checkpoint_v2 = Module2["_sqlite3_wal_checkpoint_v2"] = wasmExports["he"])(a0, a1, a2, a3, a4);
    var _sqlite3_wal_checkpoint = Module2["_sqlite3_wal_checkpoint"] = (a0, a1) => (_sqlite3_wal_checkpoint = Module2["_sqlite3_wal_checkpoint"] = wasmExports["ie"])(a0, a1);
    var _sqlite3_error_offset = Module2["_sqlite3_error_offset"] = (a0) => (_sqlite3_error_offset = Module2["_sqlite3_error_offset"] = wasmExports["je"])(a0);
    var _sqlite3_errmsg16 = Module2["_sqlite3_errmsg16"] = (a0) => (_sqlite3_errmsg16 = Module2["_sqlite3_errmsg16"] = wasmExports["ke"])(a0);
    var _sqlite3_errcode = Module2["_sqlite3_errcode"] = (a0) => (_sqlite3_errcode = Module2["_sqlite3_errcode"] = wasmExports["le"])(a0);
    var _sqlite3_extended_errcode = Module2["_sqlite3_extended_errcode"] = (a0) => (_sqlite3_extended_errcode = Module2["_sqlite3_extended_errcode"] = wasmExports["me"])(a0);
    var _sqlite3_system_errno = Module2["_sqlite3_system_errno"] = (a0) => (_sqlite3_system_errno = Module2["_sqlite3_system_errno"] = wasmExports["ne"])(a0);
    var _sqlite3_errstr = Module2["_sqlite3_errstr"] = (a0) => (_sqlite3_errstr = Module2["_sqlite3_errstr"] = wasmExports["oe"])(a0);
    var _sqlite3_limit = Module2["_sqlite3_limit"] = (a0, a1, a2) => (_sqlite3_limit = Module2["_sqlite3_limit"] = wasmExports["pe"])(a0, a1, a2);
    var _sqlite3_open = Module2["_sqlite3_open"] = (a0, a1) => (_sqlite3_open = Module2["_sqlite3_open"] = wasmExports["qe"])(a0, a1);
    var _sqlite3_open_v2 = Module2["_sqlite3_open_v2"] = (a0, a1, a2, a3) => (_sqlite3_open_v2 = Module2["_sqlite3_open_v2"] = wasmExports["re"])(a0, a1, a2, a3);
    var _sqlite3_open16 = Module2["_sqlite3_open16"] = (a0, a1) => (_sqlite3_open16 = Module2["_sqlite3_open16"] = wasmExports["se"])(a0, a1);
    var _sqlite3_create_collation = Module2["_sqlite3_create_collation"] = (a0, a1, a2, a3, a4) => (_sqlite3_create_collation = Module2["_sqlite3_create_collation"] = wasmExports["te"])(a0, a1, a2, a3, a4);
    var _sqlite3_create_collation_v2 = Module2["_sqlite3_create_collation_v2"] = (a0, a1, a2, a3, a4, a5) => (_sqlite3_create_collation_v2 = Module2["_sqlite3_create_collation_v2"] = wasmExports["ue"])(a0, a1, a2, a3, a4, a5);
    var _sqlite3_create_collation16 = Module2["_sqlite3_create_collation16"] = (a0, a1, a2, a3, a4) => (_sqlite3_create_collation16 = Module2["_sqlite3_create_collation16"] = wasmExports["ve"])(a0, a1, a2, a3, a4);
    var _sqlite3_collation_needed = Module2["_sqlite3_collation_needed"] = (a0, a1, a2) => (_sqlite3_collation_needed = Module2["_sqlite3_collation_needed"] = wasmExports["we"])(a0, a1, a2);
    var _sqlite3_collation_needed16 = Module2["_sqlite3_collation_needed16"] = (a0, a1, a2) => (_sqlite3_collation_needed16 = Module2["_sqlite3_collation_needed16"] = wasmExports["xe"])(a0, a1, a2);
    var _sqlite3_get_clientdata = Module2["_sqlite3_get_clientdata"] = (a0, a1) => (_sqlite3_get_clientdata = Module2["_sqlite3_get_clientdata"] = wasmExports["ye"])(a0, a1);
    var _sqlite3_set_clientdata = Module2["_sqlite3_set_clientdata"] = (a0, a1, a2, a3) => (_sqlite3_set_clientdata = Module2["_sqlite3_set_clientdata"] = wasmExports["ze"])(a0, a1, a2, a3);
    var _sqlite3_get_autocommit = Module2["_sqlite3_get_autocommit"] = (a0) => (_sqlite3_get_autocommit = Module2["_sqlite3_get_autocommit"] = wasmExports["Ae"])(a0);
    var _sqlite3_table_column_metadata = Module2["_sqlite3_table_column_metadata"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (_sqlite3_table_column_metadata = Module2["_sqlite3_table_column_metadata"] = wasmExports["Be"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    var _sqlite3_sleep = Module2["_sqlite3_sleep"] = (a0) => (_sqlite3_sleep = Module2["_sqlite3_sleep"] = wasmExports["Ce"])(a0);
    var _sqlite3_extended_result_codes = Module2["_sqlite3_extended_result_codes"] = (a0, a1) => (_sqlite3_extended_result_codes = Module2["_sqlite3_extended_result_codes"] = wasmExports["De"])(a0, a1);
    var _sqlite3_file_control = Module2["_sqlite3_file_control"] = (a0, a1, a2, a3) => (_sqlite3_file_control = Module2["_sqlite3_file_control"] = wasmExports["Ee"])(a0, a1, a2, a3);
    var _sqlite3_test_control = Module2["_sqlite3_test_control"] = (a0, a1) => (_sqlite3_test_control = Module2["_sqlite3_test_control"] = wasmExports["Fe"])(a0, a1);
    var _sqlite3_create_filename = Module2["_sqlite3_create_filename"] = (a0, a1, a2, a3, a4) => (_sqlite3_create_filename = Module2["_sqlite3_create_filename"] = wasmExports["Ge"])(a0, a1, a2, a3, a4);
    var _sqlite3_free_filename = Module2["_sqlite3_free_filename"] = (a0) => (_sqlite3_free_filename = Module2["_sqlite3_free_filename"] = wasmExports["He"])(a0);
    var _sqlite3_uri_parameter = Module2["_sqlite3_uri_parameter"] = (a0, a1) => (_sqlite3_uri_parameter = Module2["_sqlite3_uri_parameter"] = wasmExports["Ie"])(a0, a1);
    var _sqlite3_uri_key = Module2["_sqlite3_uri_key"] = (a0, a1) => (_sqlite3_uri_key = Module2["_sqlite3_uri_key"] = wasmExports["Je"])(a0, a1);
    var _sqlite3_uri_boolean = Module2["_sqlite3_uri_boolean"] = (a0, a1, a2) => (_sqlite3_uri_boolean = Module2["_sqlite3_uri_boolean"] = wasmExports["Ke"])(a0, a1, a2);
    var _sqlite3_uri_int64 = Module2["_sqlite3_uri_int64"] = (a0, a1, a2, a3) => (_sqlite3_uri_int64 = Module2["_sqlite3_uri_int64"] = wasmExports["Le"])(a0, a1, a2, a3);
    var _sqlite3_filename_database = Module2["_sqlite3_filename_database"] = (a0) => (_sqlite3_filename_database = Module2["_sqlite3_filename_database"] = wasmExports["Me"])(a0);
    var _sqlite3_filename_journal = Module2["_sqlite3_filename_journal"] = (a0) => (_sqlite3_filename_journal = Module2["_sqlite3_filename_journal"] = wasmExports["Ne"])(a0);
    var _sqlite3_filename_wal = Module2["_sqlite3_filename_wal"] = (a0) => (_sqlite3_filename_wal = Module2["_sqlite3_filename_wal"] = wasmExports["Oe"])(a0);
    var _sqlite3_db_name = Module2["_sqlite3_db_name"] = (a0, a1) => (_sqlite3_db_name = Module2["_sqlite3_db_name"] = wasmExports["Pe"])(a0, a1);
    var _sqlite3_db_filename = Module2["_sqlite3_db_filename"] = (a0, a1) => (_sqlite3_db_filename = Module2["_sqlite3_db_filename"] = wasmExports["Qe"])(a0, a1);
    var _sqlite3_db_readonly = Module2["_sqlite3_db_readonly"] = (a0, a1) => (_sqlite3_db_readonly = Module2["_sqlite3_db_readonly"] = wasmExports["Re"])(a0, a1);
    var _sqlite3_compileoption_used = Module2["_sqlite3_compileoption_used"] = (a0) => (_sqlite3_compileoption_used = Module2["_sqlite3_compileoption_used"] = wasmExports["Se"])(a0);
    var _sqlite3_compileoption_get = Module2["_sqlite3_compileoption_get"] = (a0) => (_sqlite3_compileoption_get = Module2["_sqlite3_compileoption_get"] = wasmExports["Te"])(a0);
    var _sqlite3_sourceid = Module2["_sqlite3_sourceid"] = () => (_sqlite3_sourceid = Module2["_sqlite3_sourceid"] = wasmExports["Ue"])();
    var _malloc = Module2["_malloc"] = (a0) => (_malloc = Module2["_malloc"] = wasmExports["Ve"])(a0);
    var _free = Module2["_free"] = (a0) => (_free = Module2["_free"] = wasmExports["We"])(a0);
    var _RegisterExtensionFunctions = Module2["_RegisterExtensionFunctions"] = (a0) => (_RegisterExtensionFunctions = Module2["_RegisterExtensionFunctions"] = wasmExports["Xe"])(a0);
    var _getSqliteFree = Module2["_getSqliteFree"] = () => (_getSqliteFree = Module2["_getSqliteFree"] = wasmExports["Ye"])();
    var _main = Module2["_main"] = (a0, a1) => (_main = Module2["_main"] = wasmExports["Ze"])(a0, a1);
    var _libauthorizer_set_authorizer = Module2["_libauthorizer_set_authorizer"] = (a0, a1, a2) => (_libauthorizer_set_authorizer = Module2["_libauthorizer_set_authorizer"] = wasmExports["_e"])(a0, a1, a2);
    var _libfunction_create_function = Module2["_libfunction_create_function"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_libfunction_create_function = Module2["_libfunction_create_function"] = wasmExports["$e"])(a0, a1, a2, a3, a4, a5, a6, a7);
    var _libhook_commit_hook = Module2["_libhook_commit_hook"] = (a0, a1, a2) => (_libhook_commit_hook = Module2["_libhook_commit_hook"] = wasmExports["af"])(a0, a1, a2);
    var _libhook_update_hook = Module2["_libhook_update_hook"] = (a0, a1, a2) => (_libhook_update_hook = Module2["_libhook_update_hook"] = wasmExports["bf"])(a0, a1, a2);
    var _libprogress_progress_handler = Module2["_libprogress_progress_handler"] = (a0, a1, a2, a3) => (_libprogress_progress_handler = Module2["_libprogress_progress_handler"] = wasmExports["cf"])(a0, a1, a2, a3);
    var _libvfs_vfs_register = Module2["_libvfs_vfs_register"] = (a0, a1, a2, a3, a4, a5) => (_libvfs_vfs_register = Module2["_libvfs_vfs_register"] = wasmExports["df"])(a0, a1, a2, a3, a4, a5);
    var _emscripten_builtin_memalign = (a0, a1) => (_emscripten_builtin_memalign = wasmExports["ff"])(a0, a1);
    var __emscripten_tempret_get = () => (__emscripten_tempret_get = wasmExports["gf"])();
    var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports["hf"])(a0);
    var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports["jf"])(a0);
    var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["kf"])();
    var _asyncify_start_unwind = (a0) => (_asyncify_start_unwind = wasmExports["lf"])(a0);
    var _asyncify_stop_unwind = () => (_asyncify_stop_unwind = wasmExports["mf"])();
    var _asyncify_start_rewind = (a0) => (_asyncify_start_rewind = wasmExports["nf"])(a0);
    var _asyncify_stop_rewind = () => (_asyncify_stop_rewind = wasmExports["of"])();
    var _sqlite3_version = Module2["_sqlite3_version"] = 3232;
    Module2["getTempRet0"] = getTempRet0;
    Module2["ccall"] = ccall;
    Module2["cwrap"] = cwrap;
    Module2["addFunction"] = addFunction;
    Module2["setValue"] = setValue;
    Module2["getValue"] = getValue;
    Module2["UTF8ToString"] = UTF8ToString;
    Module2["stringToUTF8"] = stringToUTF8;
    Module2["lengthBytesUTF8"] = lengthBytesUTF8;
    Module2["intArrayFromString"] = intArrayFromString;
    Module2["intArrayToString"] = intArrayToString;
    Module2["AsciiToString"] = AsciiToString;
    Module2["UTF16ToString"] = UTF16ToString;
    Module2["stringToUTF16"] = stringToUTF16;
    Module2["UTF32ToString"] = UTF32ToString;
    Module2["stringToUTF32"] = stringToUTF32;
    Module2["writeArrayToMemory"] = writeArrayToMemory;
    var calledRun;
    dependenciesFulfilled = function runCaller() {
      if (!calledRun)
        run();
      if (!calledRun)
        dependenciesFulfilled = runCaller;
    };
    function callMain() {
      var entryFunction = _main;
      var argc = 0;
      var argv = 0;
      try {
        var ret = entryFunction(argc, argv);
        exitJS(ret, true);
        return ret;
      } catch (e) {
        return handleException(e);
      }
    }
    function run() {
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun)
          return;
        calledRun = true;
        Module2["calledRun"] = true;
        if (ABORT)
          return;
        initRuntime();
        preMain();
        readyPromiseResolve(Module2);
        if (Module2["onRuntimeInitialized"])
          Module2["onRuntimeInitialized"]();
        if (shouldRunNow)
          callMain();
        postRun();
      }
      if (Module2["setStatus"]) {
        Module2["setStatus"]("Running...");
        setTimeout(function() {
          setTimeout(function() {
            Module2["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    if (Module2["preInit"]) {
      if (typeof Module2["preInit"] == "function")
        Module2["preInit"] = [Module2["preInit"]];
      while (Module2["preInit"].length > 0) {
        Module2["preInit"].pop()();
      }
    }
    var shouldRunNow = true;
    if (Module2["noInitialRun"])
      shouldRunNow = false;
    run();
    (function() {
      const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
      let pAsyncFlags = 0;
      Module2["set_authorizer"] = function(db, xAuthorizer, pApp) {
        if (pAsyncFlags) {
          Module2["deleteCallback"](pAsyncFlags);
          Module2["_sqlite3_free"](pAsyncFlags);
          pAsyncFlags = 0;
        }
        pAsyncFlags = Module2["_sqlite3_malloc"](4);
        setValue(pAsyncFlags, xAuthorizer instanceof AsyncFunction ? 1 : 0, "i32");
        const result = ccall("libauthorizer_set_authorizer", "number", ["number", "number", "number"], [db, xAuthorizer ? 1 : 0, pAsyncFlags]);
        if (!result && xAuthorizer) {
          Module2["setCallback"](pAsyncFlags, (_, iAction, p3, p4, p5, p6) => xAuthorizer(pApp, iAction, p3, p4, p5, p6));
        }
        return result;
      };
    })();
    (function() {
      const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
      const FUNC_METHODS = ["xFunc", "xStep", "xFinal"];
      const mapFunctionNameToKey = new Map;
      Module2["create_function"] = function(db, zFunctionName, nArg, eTextRep, pApp, xFunc, xStep, xFinal) {
        const pAsyncFlags = Module2["_sqlite3_malloc"](4);
        const target = { xFunc, xStep, xFinal };
        setValue(pAsyncFlags, FUNC_METHODS.reduce((mask, method, i) => {
          if (target[method] instanceof AsyncFunction) {
            return mask | 1 << i;
          }
          return mask;
        }, 0), "i32");
        const result = ccall("libfunction_create_function", "number", ["number", "string", "number", "number", "number", "number", "number", "number"], [db, zFunctionName, nArg, eTextRep, pAsyncFlags, xFunc ? 1 : 0, xStep ? 1 : 0, xFinal ? 1 : 0]);
        if (!result) {
          if (mapFunctionNameToKey.has(zFunctionName)) {
            const oldKey = mapFunctionNameToKey.get(zFunctionName);
            Module2["deleteCallback"](oldKey);
          }
          mapFunctionNameToKey.set(zFunctionName, pAsyncFlags);
          Module2["setCallback"](pAsyncFlags, { xFunc, xStep, xFinal });
        }
        return result;
      };
    })();
    (function() {
      const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
      let pAsyncFlags = 0;
      Module2["update_hook"] = function(db, xUpdateHook) {
        if (pAsyncFlags) {
          Module2["deleteCallback"](pAsyncFlags);
          Module2["_sqlite3_free"](pAsyncFlags);
          pAsyncFlags = 0;
        }
        pAsyncFlags = Module2["_sqlite3_malloc"](4);
        setValue(pAsyncFlags, xUpdateHook instanceof AsyncFunction ? 1 : 0, "i32");
        ccall("libhook_update_hook", "void", ["number", "number", "number"], [db, xUpdateHook ? 1 : 0, pAsyncFlags]);
        if (xUpdateHook) {
          Module2["setCallback"](pAsyncFlags, (_, iUpdateType, dbName, tblName, lo32, hi32) => xUpdateHook(iUpdateType, dbName, tblName, lo32, hi32));
        }
      };
    })();
    (function() {
      const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
      let pAsyncFlags = 0;
      Module2["commit_hook"] = function(db, xCommitHook) {
        if (pAsyncFlags) {
          Module2["deleteCallback"](pAsyncFlags);
          Module2["_sqlite3_free"](pAsyncFlags);
          pAsyncFlags = 0;
        }
        pAsyncFlags = Module2["_sqlite3_malloc"](4);
        setValue(pAsyncFlags, xCommitHook instanceof AsyncFunction ? 1 : 0, "i32");
        ccall("libhook_commit_hook", "void", ["number", "number", "number"], [db, xCommitHook ? 1 : 0, pAsyncFlags]);
        if (xCommitHook) {
          Module2["setCallback"](pAsyncFlags, (_) => xCommitHook());
        }
      };
    })();
    (function() {
      const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
      let pAsyncFlags = 0;
      Module2["progress_handler"] = function(db, nOps, xProgress, pApp) {
        if (pAsyncFlags) {
          Module2["deleteCallback"](pAsyncFlags);
          Module2["_sqlite3_free"](pAsyncFlags);
          pAsyncFlags = 0;
        }
        pAsyncFlags = Module2["_sqlite3_malloc"](4);
        setValue(pAsyncFlags, xProgress instanceof AsyncFunction ? 1 : 0, "i32");
        ccall("libprogress_progress_handler", "number", ["number", "number", "number", "number"], [db, nOps, xProgress ? 1 : 0, pAsyncFlags]);
        if (xProgress) {
          Module2["setCallback"](pAsyncFlags, (_) => xProgress(pApp));
        }
      };
    })();
    (function() {
      const VFS_METHODS = ["xOpen", "xDelete", "xAccess", "xFullPathname", "xRandomness", "xSleep", "xCurrentTime", "xGetLastError", "xCurrentTimeInt64", "xClose", "xRead", "xWrite", "xTruncate", "xSync", "xFileSize", "xLock", "xUnlock", "xCheckReservedLock", "xFileControl", "xSectorSize", "xDeviceCharacteristics", "xShmMap", "xShmLock", "xShmBarrier", "xShmUnmap"];
      const mapVFSNameToKey = new Map;
      Module2["vfs_register"] = function(vfs, makeDefault) {
        let methodMask = 0;
        let asyncMask = 0;
        VFS_METHODS.forEach((method, i) => {
          if (vfs[method]) {
            methodMask |= 1 << i;
            if (vfs["hasAsyncMethod"](method)) {
              asyncMask |= 1 << i;
            }
          }
        });
        const vfsReturn = Module2["_sqlite3_malloc"](4);
        try {
          const result = ccall("libvfs_vfs_register", "number", ["string", "number", "number", "number", "number", "number"], [vfs.name, vfs.mxPathname, methodMask, asyncMask, makeDefault ? 1 : 0, vfsReturn]);
          if (!result) {
            if (mapVFSNameToKey.has(vfs.name)) {
              const oldKey = mapVFSNameToKey.get(vfs.name);
              Module2["deleteCallback"](oldKey);
            }
            const key = getValue(vfsReturn, "*");
            mapVFSNameToKey.set(vfs.name, key);
            Module2["setCallback"](key, vfs);
          }
          return result;
        } finally {
          Module2["_sqlite3_free"](vfsReturn);
        }
      };
    })();
    moduleRtn = readyPromise;
    return moduleRtn;
  };
})();
var wa_sqlite_async_default = Module;

// ../node_modules/wa-sqlite/src/sqlite-constants.js
var SQLITE_OK = 0;
var SQLITE_BUSY = 5;
var SQLITE_IOERR = 10;
var SQLITE_NOTFOUND = 12;
var SQLITE_CANTOPEN = 14;
var SQLITE_MISUSE = 21;
var SQLITE_RANGE = 25;
var SQLITE_NOTICE = 27;
var SQLITE_ROW = 100;
var SQLITE_DONE = 101;
var SQLITE_IOERR_ACCESS = 3338;
var SQLITE_IOERR_CLOSE = 4106;
var SQLITE_IOERR_DELETE = 2570;
var SQLITE_IOERR_FSTAT = 1802;
var SQLITE_IOERR_FSYNC = 1034;
var SQLITE_IOERR_READ = 266;
var SQLITE_IOERR_SHORT_READ = 522;
var SQLITE_IOERR_TRUNCATE = 1546;
var SQLITE_IOERR_WRITE = 778;
var SQLITE_OPEN_READWRITE = 2;
var SQLITE_OPEN_CREATE = 4;
var SQLITE_OPEN_DELETEONCLOSE = 8;
var SQLITE_OPEN_URI = 64;
var SQLITE_OPEN_MAIN_DB = 256;
var SQLITE_OPEN_TEMP_DB = 512;
var SQLITE_OPEN_TRANSIENT_DB = 1024;
var SQLITE_OPEN_MAIN_JOURNAL = 2048;
var SQLITE_OPEN_TEMP_JOURNAL = 4096;
var SQLITE_OPEN_SUBJOURNAL = 8192;
var SQLITE_OPEN_SUPER_JOURNAL = 16384;
var SQLITE_OPEN_WAL = 524288;
var SQLITE_LOCK_NONE = 0;
var SQLITE_FCNTL_PRAGMA = 14;
var SQLITE_INTEGER = 1;
var SQLITE_FLOAT = 2;
var SQLITE_TEXT = 3;
var SQLITE_BLOB = 4;
var SQLITE_NULL = 5;

// ../node_modules/wa-sqlite/src/sqlite-api.js
var MAX_INT64 = 0x7fffffffffffffffn;
var MIN_INT64 = -0x8000000000000000n;
var AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

class SQLiteError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}
var async = true;
function Factory(Module2) {
  const sqlite3 = {};
  Module2.retryOps = [];
  const sqliteFreeAddress = Module2._getSqliteFree();
  const tmp = Module2._malloc(8);
  const tmpPtr = [tmp, tmp + 4];
  const textEncoder = new TextEncoder;
  function createUTF8(s) {
    if (typeof s !== "string")
      return 0;
    const utf8 = textEncoder.encode(s);
    const zts = Module2._sqlite3_malloc(utf8.byteLength + 1);
    Module2.HEAPU8.set(utf8, zts);
    Module2.HEAPU8[zts + utf8.byteLength] = 0;
    return zts;
  }
  function cvt32x2ToBigInt(lo32, hi32) {
    return BigInt(hi32) << 32n | BigInt(lo32) & 0xffffffffn;
  }
  const cvt32x2AsSafe = function() {
    const hiMax = BigInt(Number.MAX_SAFE_INTEGER) >> 32n;
    const hiMin = BigInt(Number.MIN_SAFE_INTEGER) >> 32n;
    return function(lo32, hi32) {
      if (hi32 > hiMax || hi32 < hiMin) {
        return cvt32x2ToBigInt(lo32, hi32);
      } else {
        return hi32 * 4294967296 + (lo32 & 2147483647) - (lo32 & 2147483648);
      }
    };
  }();
  const databases = new Set;
  function verifyDatabase(db) {
    if (!databases.has(db)) {
      throw new SQLiteError("not a database", SQLITE_MISUSE);
    }
  }
  const mapStmtToDB = new Map;
  function verifyStatement(stmt) {
    if (!mapStmtToDB.has(stmt)) {
      throw new SQLiteError("not a statement", SQLITE_MISUSE);
    }
  }
  sqlite3.bind_collection = function(stmt, bindings) {
    verifyStatement(stmt);
    const isArray = Array.isArray(bindings);
    const nBindings = sqlite3.bind_parameter_count(stmt);
    for (let i = 1;i <= nBindings; ++i) {
      const key = isArray ? i - 1 : sqlite3.bind_parameter_name(stmt, i);
      const value = bindings[key];
      if (value !== undefined) {
        sqlite3.bind(stmt, i, value);
      }
    }
    return SQLITE_OK;
  };
  sqlite3.bind = function(stmt, i, value) {
    verifyStatement(stmt);
    switch (typeof value) {
      case "number":
        if (value === (value | 0)) {
          return sqlite3.bind_int(stmt, i, value);
        } else {
          return sqlite3.bind_double(stmt, i, value);
        }
      case "string":
        return sqlite3.bind_text(stmt, i, value);
      case "boolean":
        return sqlite3.bind_int(stmt, i, value ? 1 : 0);
      default:
        if (value instanceof Uint8Array || Array.isArray(value)) {
          return sqlite3.bind_blob(stmt, i, value);
        } else if (value === null) {
          return sqlite3.bind_null(stmt, i);
        } else if (typeof value === "bigint") {
          return sqlite3.bind_int64(stmt, i, value);
        } else if (value === undefined) {
          return SQLITE_NOTICE;
        } else {
          console.warn("unknown binding converted to null", value);
          return sqlite3.bind_null(stmt, i);
        }
    }
  };
  sqlite3.bind_blob = function() {
    const fname = "sqlite3_bind_blob";
    const f = Module2.cwrap(fname, ...decl("nnnnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      const byteLength = value.byteLength ?? value.length;
      const ptr = Module2._sqlite3_malloc(byteLength);
      Module2.HEAPU8.subarray(ptr).set(value);
      const result = f(stmt, i, ptr, byteLength, sqliteFreeAddress);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_parameter_count = function() {
    const fname = "sqlite3_bind_parameter_count";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return result;
    };
  }();
  sqlite3.bind_double = function() {
    const fname = "sqlite3_bind_double";
    const f = Module2.cwrap(fname, ...decl("nnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      const result = f(stmt, i, value);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_int = function() {
    const fname = "sqlite3_bind_int";
    const f = Module2.cwrap(fname, ...decl("nnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      if (value > 2147483647 || value < -2147483648)
        return SQLITE_RANGE;
      const result = f(stmt, i, value);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_int64 = function() {
    const fname = "sqlite3_bind_int64";
    const f = Module2.cwrap(fname, ...decl("nnnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      if (value > MAX_INT64 || value < MIN_INT64)
        return SQLITE_RANGE;
      const lo32 = value & 0xffffffffn;
      const hi32 = value >> 32n;
      const result = f(stmt, i, Number(lo32), Number(hi32));
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_null = function() {
    const fname = "sqlite3_bind_null";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(stmt, i) {
      verifyStatement(stmt);
      const result = f(stmt, i);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_parameter_name = function() {
    const fname = "sqlite3_bind_parameter_name";
    const f = Module2.cwrap(fname, ...decl("n:s"));
    return function(stmt, i) {
      verifyStatement(stmt);
      const result = f(stmt, i);
      return result;
    };
  }();
  sqlite3.bind_text = function() {
    const fname = "sqlite3_bind_text";
    const f = Module2.cwrap(fname, ...decl("nnnnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      const ptr = createUTF8(value);
      const result = f(stmt, i, ptr, -1, sqliteFreeAddress);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.changes = function() {
    const fname = "sqlite3_changes";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(db) {
      verifyDatabase(db);
      const result = f(db);
      return result;
    };
  }();
  sqlite3.clear_bindings = function() {
    const fname = "sqlite3_clear_bindings";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.close = function() {
    const fname = "sqlite3_close";
    const f = Module2.cwrap(fname, ...decl("n:n"), { async });
    return async function(db) {
      verifyDatabase(db);
      const result = await f(db);
      databases.delete(db);
      return check(fname, result, db);
    };
  }();
  sqlite3.column = function(stmt, iCol) {
    verifyStatement(stmt);
    const type = sqlite3.column_type(stmt, iCol);
    switch (type) {
      case SQLITE_BLOB:
        return sqlite3.column_blob(stmt, iCol);
      case SQLITE_FLOAT:
        return sqlite3.column_double(stmt, iCol);
      case SQLITE_INTEGER:
        const lo32 = sqlite3.column_int(stmt, iCol);
        const hi32 = Module2.getTempRet0();
        return cvt32x2AsSafe(lo32, hi32);
      case SQLITE_NULL:
        return null;
      case SQLITE_TEXT:
        return sqlite3.column_text(stmt, iCol);
      default:
        throw new SQLiteError("unknown type", type);
    }
  };
  sqlite3.column_blob = function() {
    const fname = "sqlite3_column_blob";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const nBytes = sqlite3.column_bytes(stmt, iCol);
      const address = f(stmt, iCol);
      const result = Module2.HEAPU8.subarray(address, address + nBytes);
      return result;
    };
  }();
  sqlite3.column_bytes = function() {
    const fname = "sqlite3_column_bytes";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_count = function() {
    const fname = "sqlite3_column_count";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return result;
    };
  }();
  sqlite3.column_double = function() {
    const fname = "sqlite3_column_double";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_int = function() {
    const fname = "sqlite3_column_int64";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_int64 = function() {
    const fname = "sqlite3_column_int64";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const lo32 = f(stmt, iCol);
      const hi32 = Module2.getTempRet0();
      const result = cvt32x2ToBigInt(lo32, hi32);
      return result;
    };
  }();
  sqlite3.column_name = function() {
    const fname = "sqlite3_column_name";
    const f = Module2.cwrap(fname, ...decl("nn:s"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_names = function(stmt) {
    const columns = [];
    const nColumns = sqlite3.column_count(stmt);
    for (let i = 0;i < nColumns; ++i) {
      columns.push(sqlite3.column_name(stmt, i));
    }
    return columns;
  };
  sqlite3.column_text = function() {
    const fname = "sqlite3_column_text";
    const f = Module2.cwrap(fname, ...decl("nn:s"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_type = function() {
    const fname = "sqlite3_column_type";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.create_function = function(db, zFunctionName, nArg, eTextRep, pApp, xFunc, xStep, xFinal) {
    verifyDatabase(db);
    function adapt(f) {
      return f instanceof AsyncFunction ? async (ctx, n, values) => f(ctx, Module2.HEAP32.subarray(values / 4, values / 4 + n)) : (ctx, n, values) => f(ctx, Module2.HEAP32.subarray(values / 4, values / 4 + n));
    }
    const result = Module2.create_function(db, zFunctionName, nArg, eTextRep, pApp, xFunc && adapt(xFunc), xStep && adapt(xStep), xFinal);
    return check("sqlite3_create_function", result, db);
  };
  sqlite3.data_count = function() {
    const fname = "sqlite3_data_count";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return result;
    };
  }();
  sqlite3.exec = async function(db, sql, callback) {
    for await (const stmt of sqlite3.statements(db, sql)) {
      let columns;
      while (await sqlite3.step(stmt) === SQLITE_ROW) {
        if (callback) {
          columns = columns ?? sqlite3.column_names(stmt);
          const row = sqlite3.row(stmt);
          await callback(row, columns);
        }
      }
    }
    return SQLITE_OK;
  };
  sqlite3.finalize = function() {
    const fname = "sqlite3_finalize";
    const f = Module2.cwrap(fname, ...decl("n:n"), { async });
    return async function(stmt) {
      const result = await f(stmt);
      mapStmtToDB.delete(stmt);
      return result;
    };
  }();
  sqlite3.get_autocommit = function() {
    const fname = "sqlite3_get_autocommit";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(db) {
      const result = f(db);
      return result;
    };
  }();
  sqlite3.libversion = function() {
    const fname = "sqlite3_libversion";
    const f = Module2.cwrap(fname, ...decl(":s"));
    return function() {
      const result = f();
      return result;
    };
  }();
  sqlite3.libversion_number = function() {
    const fname = "sqlite3_libversion_number";
    const f = Module2.cwrap(fname, ...decl(":n"));
    return function() {
      const result = f();
      return result;
    };
  }();
  sqlite3.limit = function() {
    const fname = "sqlite3_limit";
    const f = Module2.cwrap(fname, ...decl("nnn:n"));
    return function(db, id, newVal) {
      const result = f(db, id, newVal);
      return result;
    };
  }();
  sqlite3.open_v2 = function() {
    const fname = "sqlite3_open_v2";
    const f = Module2.cwrap(fname, ...decl("snnn:n"), { async });
    return async function(zFilename, flags, zVfs) {
      flags = flags || SQLITE_OPEN_CREATE | SQLITE_OPEN_READWRITE;
      zVfs = createUTF8(zVfs);
      try {
        const rc = await retry(() => f(zFilename, tmpPtr[0], flags, zVfs));
        const db = Module2.getValue(tmpPtr[0], "*");
        databases.add(db);
        Module2.ccall("RegisterExtensionFunctions", "void", ["number"], [db]);
        check(fname, rc);
        return db;
      } finally {
        Module2._sqlite3_free(zVfs);
      }
    };
  }();
  sqlite3.progress_handler = function(db, nProgressOps, handler, userData) {
    verifyDatabase(db);
    Module2.progress_handler(db, nProgressOps, handler, userData);
  };
  sqlite3.reset = function() {
    const fname = "sqlite3_reset";
    const f = Module2.cwrap(fname, ...decl("n:n"), { async });
    return async function(stmt) {
      verifyStatement(stmt);
      const result = await f(stmt);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.result = function(context, value) {
    switch (typeof value) {
      case "number":
        if (value === (value | 0)) {
          sqlite3.result_int(context, value);
        } else {
          sqlite3.result_double(context, value);
        }
        break;
      case "string":
        sqlite3.result_text(context, value);
        break;
      default:
        if (value instanceof Uint8Array || Array.isArray(value)) {
          sqlite3.result_blob(context, value);
        } else if (value === null) {
          sqlite3.result_null(context);
        } else if (typeof value === "bigint") {
          return sqlite3.result_int64(context, value);
        } else {
          console.warn("unknown result converted to null", value);
          sqlite3.result_null(context);
        }
        break;
    }
  };
  sqlite3.result_blob = function() {
    const fname = "sqlite3_result_blob";
    const f = Module2.cwrap(fname, ...decl("nnnn:n"));
    return function(context, value) {
      const byteLength = value.byteLength ?? value.length;
      const ptr = Module2._sqlite3_malloc(byteLength);
      Module2.HEAPU8.subarray(ptr).set(value);
      f(context, ptr, byteLength, sqliteFreeAddress);
    };
  }();
  sqlite3.result_double = function() {
    const fname = "sqlite3_result_double";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(context, value) {
      f(context, value);
    };
  }();
  sqlite3.result_int = function() {
    const fname = "sqlite3_result_int";
    const f = Module2.cwrap(fname, ...decl("nn:n"));
    return function(context, value) {
      f(context, value);
    };
  }();
  sqlite3.result_int64 = function() {
    const fname = "sqlite3_result_int64";
    const f = Module2.cwrap(fname, ...decl("nnn:n"));
    return function(context, value) {
      if (value > MAX_INT64 || value < MIN_INT64)
        return SQLITE_RANGE;
      const lo32 = value & 0xffffffffn;
      const hi32 = value >> 32n;
      f(context, Number(lo32), Number(hi32));
    };
  }();
  sqlite3.result_null = function() {
    const fname = "sqlite3_result_null";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(context) {
      f(context);
    };
  }();
  sqlite3.result_text = function() {
    const fname = "sqlite3_result_text";
    const f = Module2.cwrap(fname, ...decl("nnnn:n"));
    return function(context, value) {
      const ptr = createUTF8(value);
      f(context, ptr, -1, sqliteFreeAddress);
    };
  }();
  sqlite3.row = function(stmt) {
    const row = [];
    const nColumns = sqlite3.data_count(stmt);
    for (let i = 0;i < nColumns; ++i) {
      const value = sqlite3.column(stmt, i);
      row.push(value?.buffer === Module2.HEAPU8.buffer ? value.slice() : value);
    }
    return row;
  };
  sqlite3.set_authorizer = function(db, xAuth, pApp) {
    verifyDatabase(db);
    function cvtArgs(_, iAction, p3, p4, p5, p6) {
      return [
        _,
        iAction,
        Module2.UTF8ToString(p3),
        Module2.UTF8ToString(p4),
        Module2.UTF8ToString(p5),
        Module2.UTF8ToString(p6)
      ];
    }
    function adapt(f) {
      return f instanceof AsyncFunction ? async (_, iAction, p3, p4, p5, p6) => f(...cvtArgs(_, iAction, p3, p4, p5, p6)) : (_, iAction, p3, p4, p5, p6) => f(...cvtArgs(_, iAction, p3, p4, p5, p6));
    }
    const result = Module2.set_authorizer(db, adapt(xAuth), pApp);
    return check("sqlite3_set_authorizer", result, db);
  };
  sqlite3.sql = function() {
    const fname = "sqlite3_sql";
    const f = Module2.cwrap(fname, ...decl("n:s"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return result;
    };
  }();
  sqlite3.statements = function(db, sql, options = {}) {
    const prepare = Module2.cwrap("sqlite3_prepare_v3", "number", ["number", "number", "number", "number", "number", "number"], { async: true });
    return async function* () {
      const onFinally = [];
      try {
        let maybeFinalize = function() {
          if (stmt && !options.unscoped) {
            sqlite3.finalize(stmt);
          }
          stmt = 0;
        };
        const utf8 = textEncoder.encode(sql);
        const allocSize = utf8.byteLength - utf8.byteLength % 4 + 12;
        const pzHead = Module2._sqlite3_malloc(allocSize);
        const pzEnd = pzHead + utf8.byteLength + 1;
        onFinally.push(() => Module2._sqlite3_free(pzHead));
        Module2.HEAPU8.set(utf8, pzHead);
        Module2.HEAPU8[pzEnd - 1] = 0;
        const pStmt = pzHead + allocSize - 8;
        const pzTail = pzHead + allocSize - 4;
        let stmt;
        onFinally.push(maybeFinalize);
        Module2.setValue(pzTail, pzHead, "*");
        do {
          maybeFinalize();
          const zTail = Module2.getValue(pzTail, "*");
          const rc = await retry(() => {
            return prepare(db, zTail, pzEnd - pzTail, options.flags || 0, pStmt, pzTail);
          });
          if (rc !== SQLITE_OK) {
            check("sqlite3_prepare_v3", rc, db);
          }
          stmt = Module2.getValue(pStmt, "*");
          if (stmt) {
            mapStmtToDB.set(stmt, db);
            yield stmt;
          }
        } while (stmt);
      } finally {
        while (onFinally.length) {
          onFinally.pop()();
        }
      }
    }();
  };
  sqlite3.step = function() {
    const fname = "sqlite3_step";
    const f = Module2.cwrap(fname, ...decl("n:n"), { async });
    return async function(stmt) {
      verifyStatement(stmt);
      const rc = await retry(() => f(stmt));
      return check(fname, rc, mapStmtToDB.get(stmt), [SQLITE_ROW, SQLITE_DONE]);
    };
  }();
  sqlite3.commit_hook = function(db, xCommitHook) {
    verifyDatabase(db);
    Module2.commit_hook(db, xCommitHook);
  };
  sqlite3.update_hook = function(db, xUpdateHook) {
    verifyDatabase(db);
    function cvtArgs(iUpdateType, dbName, tblName, lo32, hi32) {
      return [
        iUpdateType,
        Module2.UTF8ToString(dbName),
        Module2.UTF8ToString(tblName),
        cvt32x2ToBigInt(lo32, hi32)
      ];
    }
    function adapt(f) {
      return f instanceof AsyncFunction ? async (iUpdateType, dbName, tblName, lo32, hi32) => f(...cvtArgs(iUpdateType, dbName, tblName, lo32, hi32)) : (iUpdateType, dbName, tblName, lo32, hi32) => f(...cvtArgs(iUpdateType, dbName, tblName, lo32, hi32));
    }
    Module2.update_hook(db, adapt(xUpdateHook));
  };
  sqlite3.value = function(pValue) {
    const type = sqlite3.value_type(pValue);
    switch (type) {
      case SQLITE_BLOB:
        return sqlite3.value_blob(pValue);
      case SQLITE_FLOAT:
        return sqlite3.value_double(pValue);
      case SQLITE_INTEGER:
        const lo32 = sqlite3.value_int(pValue);
        const hi32 = Module2.getTempRet0();
        return cvt32x2AsSafe(lo32, hi32);
      case SQLITE_NULL:
        return null;
      case SQLITE_TEXT:
        return sqlite3.value_text(pValue);
      default:
        throw new SQLiteError("unknown type", type);
    }
  };
  sqlite3.value_blob = function() {
    const fname = "sqlite3_value_blob";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const nBytes = sqlite3.value_bytes(pValue);
      const address = f(pValue);
      const result = Module2.HEAPU8.subarray(address, address + nBytes);
      return result;
    };
  }();
  sqlite3.value_bytes = function() {
    const fname = "sqlite3_value_bytes";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.value_double = function() {
    const fname = "sqlite3_value_double";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.value_int = function() {
    const fname = "sqlite3_value_int64";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.value_int64 = function() {
    const fname = "sqlite3_value_int64";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const lo32 = f(pValue);
      const hi32 = Module2.getTempRet0();
      const result = cvt32x2ToBigInt(lo32, hi32);
      return result;
    };
  }();
  sqlite3.value_text = function() {
    const fname = "sqlite3_value_text";
    const f = Module2.cwrap(fname, ...decl("n:s"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.value_type = function() {
    const fname = "sqlite3_value_type";
    const f = Module2.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.vfs_register = function(vfs, makeDefault) {
    const result = Module2.vfs_register(vfs, makeDefault);
    return check("sqlite3_vfs_register", result);
  };
  function check(fname, result, db = null, allowed = [SQLITE_OK]) {
    if (allowed.includes(result))
      return result;
    const message = db ? Module2.ccall("sqlite3_errmsg", "string", ["number"], [db]) : fname;
    throw new SQLiteError(message, result);
  }
  async function retry(f) {
    let rc;
    do {
      if (Module2.retryOps.length) {
        try {
          await Promise.all(Module2.retryOps);
        } finally {
          Module2.retryOps = [];
        }
      }
      rc = await f();
    } while (rc && Module2.retryOps.length);
    return rc;
  }
  return sqlite3;
}
function decl(s) {
  const result = [];
  const m = s.match(/([ns@]*):([nsv@])/);
  switch (m[2]) {
    case "n":
      result.push("number");
      break;
    case "s":
      result.push("string");
      break;
    case "v":
      result.push(null);
      break;
  }
  const args = [];
  for (let c of m[1]) {
    switch (c) {
      case "n":
        args.push("number");
        break;
      case "s":
        args.push("string");
        break;
    }
  }
  result.push(args);
  return result;
}

// ../node_modules/wa-sqlite/src/VFS.js
var DEFAULT_SECTOR_SIZE = 512;

class Base {
  name;
  mxPathname = 64;
  _module;
  constructor(name, module) {
    this.name = name;
    this._module = module;
  }
  close() {}
  isReady() {
    return true;
  }
  hasAsyncMethod(methodName) {
    return false;
  }
  xOpen(pVfs, zName, pFile, flags, pOutFlags) {
    return SQLITE_CANTOPEN;
  }
  xDelete(pVfs, zName, syncDir) {
    return SQLITE_OK;
  }
  xAccess(pVfs, zName, flags, pResOut) {
    return SQLITE_OK;
  }
  xFullPathname(pVfs, zName, nOut, zOut) {
    return SQLITE_OK;
  }
  xGetLastError(pVfs, nBuf, zBuf) {
    return SQLITE_OK;
  }
  xClose(pFile) {
    return SQLITE_OK;
  }
  xRead(pFile, pData, iAmt, iOffsetLo, iOffsetHi) {
    return SQLITE_OK;
  }
  xWrite(pFile, pData, iAmt, iOffsetLo, iOffsetHi) {
    return SQLITE_OK;
  }
  xTruncate(pFile, sizeLo, sizeHi) {
    return SQLITE_OK;
  }
  xSync(pFile, flags) {
    return SQLITE_OK;
  }
  xFileSize(pFile, pSize) {
    return SQLITE_OK;
  }
  xLock(pFile, lockType) {
    return SQLITE_OK;
  }
  xUnlock(pFile, lockType) {
    return SQLITE_OK;
  }
  xCheckReservedLock(pFile, pResOut) {
    return SQLITE_OK;
  }
  xFileControl(pFile, op, pArg) {
    return SQLITE_NOTFOUND;
  }
  xSectorSize(pFile) {
    return DEFAULT_SECTOR_SIZE;
  }
  xDeviceCharacteristics(pFile) {
    return 0;
  }
}
var FILE_TYPE_MASK = [
  SQLITE_OPEN_MAIN_DB,
  SQLITE_OPEN_MAIN_JOURNAL,
  SQLITE_OPEN_TEMP_DB,
  SQLITE_OPEN_TEMP_JOURNAL,
  SQLITE_OPEN_TRANSIENT_DB,
  SQLITE_OPEN_SUBJOURNAL,
  SQLITE_OPEN_SUPER_JOURNAL,
  SQLITE_OPEN_WAL
].reduce((mask, element) => mask | element);

// ../node_modules/wa-sqlite/src/FacadeVFS.js
var AsyncFunction2 = Object.getPrototypeOf(async function() {}).constructor;

class FacadeVFS extends Base {
  constructor(name, module) {
    super(name, module);
  }
  hasAsyncMethod(methodName) {
    const jMethodName = `j${methodName.slice(1)}`;
    return this[jMethodName] instanceof AsyncFunction2;
  }
  getFilename(pFile) {
    throw new Error("unimplemented");
  }
  jOpen(filename, pFile, flags, pOutFlags) {
    return SQLITE_CANTOPEN;
  }
  jDelete(filename, syncDir) {
    return SQLITE_OK;
  }
  jAccess(filename, flags, pResOut) {
    return SQLITE_OK;
  }
  jFullPathname(filename, zOut) {
    const { read, written } = new TextEncoder().encodeInto(filename, zOut);
    if (read < filename.length)
      return SQLITE_IOERR;
    if (written >= zOut.length)
      return SQLITE_IOERR;
    zOut[written] = 0;
    return SQLITE_OK;
  }
  jGetLastError(zBuf) {
    return SQLITE_OK;
  }
  jClose(pFile) {
    return SQLITE_OK;
  }
  jRead(pFile, pData, iOffset) {
    pData.fill(0);
    return SQLITE_IOERR_SHORT_READ;
  }
  jWrite(pFile, pData, iOffset) {
    return SQLITE_IOERR_WRITE;
  }
  jTruncate(pFile, size) {
    return SQLITE_OK;
  }
  jSync(pFile, flags) {
    return SQLITE_OK;
  }
  jFileSize(pFile, pSize) {
    return SQLITE_OK;
  }
  jLock(pFile, lockType) {
    return SQLITE_OK;
  }
  jUnlock(pFile, lockType) {
    return SQLITE_OK;
  }
  jCheckReservedLock(pFile, pResOut) {
    pResOut.setInt32(0, 0, true);
    return SQLITE_OK;
  }
  jFileControl(pFile, op, pArg) {
    return SQLITE_NOTFOUND;
  }
  jSectorSize(pFile) {
    return super.xSectorSize(pFile);
  }
  jDeviceCharacteristics(pFile) {
    return 0;
  }
  xOpen(pVfs, zName, pFile, flags, pOutFlags) {
    const filename = this.#decodeFilename(zName, flags);
    const pOutFlagsView = this.#makeTypedDataView("Int32", pOutFlags);
    this["log"]?.("jOpen", filename, pFile, "0x" + flags.toString(16));
    return this.jOpen(filename, pFile, flags, pOutFlagsView);
  }
  xDelete(pVfs, zName, syncDir) {
    const filename = this._module.UTF8ToString(zName);
    this["log"]?.("jDelete", filename, syncDir);
    return this.jDelete(filename, syncDir);
  }
  xAccess(pVfs, zName, flags, pResOut) {
    const filename = this._module.UTF8ToString(zName);
    const pResOutView = this.#makeTypedDataView("Int32", pResOut);
    this["log"]?.("jAccess", filename, flags);
    return this.jAccess(filename, flags, pResOutView);
  }
  xFullPathname(pVfs, zName, nOut, zOut) {
    const filename = this._module.UTF8ToString(zName);
    const zOutArray = this._module.HEAPU8.subarray(zOut, zOut + nOut);
    this["log"]?.("jFullPathname", filename, nOut);
    return this.jFullPathname(filename, zOutArray);
  }
  xGetLastError(pVfs, nBuf, zBuf) {
    const zBufArray = this._module.HEAPU8.subarray(zBuf, zBuf + nBuf);
    this["log"]?.("jGetLastError", nBuf);
    return this.jGetLastError(zBufArray);
  }
  xClose(pFile) {
    this["log"]?.("jClose", pFile);
    return this.jClose(pFile);
  }
  xRead(pFile, pData, iAmt, iOffsetLo, iOffsetHi) {
    const pDataArray = this.#makeDataArray(pData, iAmt);
    const iOffset = delegalize(iOffsetLo, iOffsetHi);
    this["log"]?.("jRead", pFile, iAmt, iOffset);
    return this.jRead(pFile, pDataArray, iOffset);
  }
  xWrite(pFile, pData, iAmt, iOffsetLo, iOffsetHi) {
    const pDataArray = this.#makeDataArray(pData, iAmt);
    const iOffset = delegalize(iOffsetLo, iOffsetHi);
    this["log"]?.("jWrite", pFile, pDataArray, iOffset);
    return this.jWrite(pFile, pDataArray, iOffset);
  }
  xTruncate(pFile, sizeLo, sizeHi) {
    const size = delegalize(sizeLo, sizeHi);
    this["log"]?.("jTruncate", pFile, size);
    return this.jTruncate(pFile, size);
  }
  xSync(pFile, flags) {
    this["log"]?.("jSync", pFile, flags);
    return this.jSync(pFile, flags);
  }
  xFileSize(pFile, pSize) {
    const pSizeView = this.#makeTypedDataView("BigInt64", pSize);
    this["log"]?.("jFileSize", pFile);
    return this.jFileSize(pFile, pSizeView);
  }
  xLock(pFile, lockType) {
    this["log"]?.("jLock", pFile, lockType);
    return this.jLock(pFile, lockType);
  }
  xUnlock(pFile, lockType) {
    this["log"]?.("jUnlock", pFile, lockType);
    return this.jUnlock(pFile, lockType);
  }
  xCheckReservedLock(pFile, pResOut) {
    const pResOutView = this.#makeTypedDataView("Int32", pResOut);
    this["log"]?.("jCheckReservedLock", pFile);
    return this.jCheckReservedLock(pFile, pResOutView);
  }
  xFileControl(pFile, op, pArg) {
    const pArgView = new DataView(this._module.HEAPU8.buffer, this._module.HEAPU8.byteOffset + pArg);
    this["log"]?.("jFileControl", pFile, op, pArgView);
    return this.jFileControl(pFile, op, pArgView);
  }
  xSectorSize(pFile) {
    this["log"]?.("jSectorSize", pFile);
    return this.jSectorSize(pFile);
  }
  xDeviceCharacteristics(pFile) {
    this["log"]?.("jDeviceCharacteristics", pFile);
    return this.jDeviceCharacteristics(pFile);
  }
  #makeTypedDataView(type, byteOffset) {
    return new DataViewProxy(this._module, byteOffset, type);
  }
  #makeDataArray(byteOffset, byteLength) {
    return new Uint8ArrayProxy(this._module, byteOffset, byteLength);
  }
  #decodeFilename(zName, flags) {
    if (flags & SQLITE_OPEN_URI) {
      let pName = zName;
      let state = 1;
      const charCodes = [];
      while (state) {
        const charCode = this._module.HEAPU8[pName++];
        if (charCode) {
          charCodes.push(charCode);
        } else {
          if (!this._module.HEAPU8[pName])
            state = null;
          switch (state) {
            case 1:
              charCodes.push(63);
              state = 2;
              break;
            case 2:
              charCodes.push(61);
              state = 3;
              break;
            case 3:
              charCodes.push(38);
              state = 2;
              break;
          }
        }
      }
      return new TextDecoder().decode(new Uint8Array(charCodes));
    }
    return zName ? this._module.UTF8ToString(zName) : null;
  }
}
function delegalize(lo32, hi32) {
  return hi32 * 4294967296 + lo32 + (lo32 < 0 ? 2 ** 32 : 0);
}

class Uint8ArrayProxy {
  #module;
  #_array = new Uint8Array;
  get #array() {
    if (this.#_array.buffer.byteLength === 0) {
      this.#_array = this.#module.HEAPU8.subarray(this.byteOffset, this.byteOffset + this.byteLength);
    }
    return this.#_array;
  }
  constructor(module, byteOffset, byteLength) {
    this.#module = module;
    this.byteOffset = byteOffset;
    this.length = this.byteLength = byteLength;
  }
  get buffer() {
    return this.#array.buffer;
  }
  at(index) {
    return this.#array.at(index);
  }
  copyWithin(target, start, end) {
    this.#array.copyWithin(target, start, end);
  }
  entries() {
    return this.#array.entries();
  }
  every(predicate) {
    return this.#array.every(predicate);
  }
  fill(value, start, end) {
    this.#array.fill(value, start, end);
  }
  filter(predicate) {
    return this.#array.filter(predicate);
  }
  find(predicate) {
    return this.#array.find(predicate);
  }
  findIndex(predicate) {
    return this.#array.findIndex(predicate);
  }
  findLast(predicate) {
    return this.#array.findLast(predicate);
  }
  findLastIndex(predicate) {
    return this.#array.findLastIndex(predicate);
  }
  forEach(callback) {
    this.#array.forEach(callback);
  }
  includes(value, start) {
    return this.#array.includes(value, start);
  }
  indexOf(value, start) {
    return this.#array.indexOf(value, start);
  }
  join(separator) {
    return this.#array.join(separator);
  }
  keys() {
    return this.#array.keys();
  }
  lastIndexOf(value, start) {
    return this.#array.lastIndexOf(value, start);
  }
  map(callback) {
    return this.#array.map(callback);
  }
  reduce(callback, initialValue) {
    return this.#array.reduce(callback, initialValue);
  }
  reduceRight(callback, initialValue) {
    return this.#array.reduceRight(callback, initialValue);
  }
  reverse() {
    this.#array.reverse();
  }
  set(array, offset) {
    this.#array.set(array, offset);
  }
  slice(start, end) {
    return this.#array.slice(start, end);
  }
  some(predicate) {
    return this.#array.some(predicate);
  }
  sort(compareFn) {
    this.#array.sort(compareFn);
  }
  subarray(begin, end) {
    return this.#array.subarray(begin, end);
  }
  toLocaleString(locales, options) {
    return this.#array.toLocaleString(locales, options);
  }
  toReversed() {
    return this.#array.toReversed();
  }
  toSorted(compareFn) {
    return this.#array.toSorted(compareFn);
  }
  toString() {
    return this.#array.toString();
  }
  values() {
    return this.#array.values();
  }
  with(index, value) {
    return this.#array.with(index, value);
  }
  [Symbol.iterator]() {
    return this.#array[Symbol.iterator]();
  }
}

class DataViewProxy {
  #module;
  #type;
  #_view = new DataView(new ArrayBuffer(0));
  get #view() {
    if (this.#_view.buffer.byteLength === 0) {
      this.#_view = new DataView(this.#module.HEAPU8.buffer, this.#module.HEAPU8.byteOffset + this.byteOffset);
    }
    return this.#_view;
  }
  constructor(module, byteOffset, type) {
    this.#module = module;
    this.byteOffset = byteOffset;
    this.#type = type;
  }
  get buffer() {
    return this.#view.buffer;
  }
  get byteLength() {
    return this.#type === "Int32" ? 4 : 8;
  }
  getInt32(byteOffset, littleEndian) {
    if (this.#type !== "Int32") {
      throw new Error("invalid type");
    }
    if (!littleEndian)
      throw new Error("must be little endian");
    return this.#view.getInt32(byteOffset, littleEndian);
  }
  setInt32(byteOffset, value, littleEndian) {
    if (this.#type !== "Int32") {
      throw new Error("invalid type");
    }
    if (!littleEndian)
      throw new Error("must be little endian");
    this.#view.setInt32(byteOffset, value, littleEndian);
  }
  getBigInt64(byteOffset, littleEndian) {
    if (this.#type !== "BigInt64") {
      throw new Error("invalid type");
    }
    if (!littleEndian)
      throw new Error("must be little endian");
    return this.#view.getBigInt64(byteOffset, littleEndian);
  }
  setBigInt64(byteOffset, value, littleEndian) {
    if (this.#type !== "BigInt64") {
      throw new Error("invalid type");
    }
    if (!littleEndian)
      throw new Error("must be little endian");
    this.#view.setBigInt64(byteOffset, value, littleEndian);
  }
}

// ../node_modules/wa-sqlite/src/examples/OPFSCoopSyncVFS.js
var DEFAULT_TEMPORARY_FILES = 10;
var LOCK_NOTIFY_INTERVAL = 1000;
var DB_RELATED_FILE_SUFFIXES = ["", "-journal", "-wal"];
var finalizationRegistry = new FinalizationRegistry((releaser) => releaser());

class File {
  path;
  flags;
  accessHandle;
  persistentFile;
  constructor(path, flags) {
    this.path = path;
    this.flags = flags;
  }
}

class PersistentFile {
  fileHandle;
  accessHandle = null;
  isLockBusy = false;
  isFileLocked = false;
  isRequestInProgress = false;
  handleLockReleaser = null;
  handleRequestChannel;
  isHandleRequested = false;
  constructor(fileHandle) {
    this.fileHandle = fileHandle;
  }
}

class OPFSCoopSyncVFS extends FacadeVFS {
  mapIdToFile = new Map;
  lastError = null;
  log = null;
  persistentFiles = new Map;
  boundAccessHandles = new Map;
  unboundAccessHandles = new Set;
  accessiblePaths = new Set;
  releaser = null;
  static async create(name, module) {
    const vfs = new OPFSCoopSyncVFS(name, module);
    await Promise.all([
      vfs.isReady(),
      vfs.#initialize(DEFAULT_TEMPORARY_FILES)
    ]);
    return vfs;
  }
  constructor(name, module) {
    super(name, module);
  }
  async#initialize(nTemporaryFiles) {
    const root = await navigator.storage.getDirectory();
    for await (const entry of root.values()) {
      if (entry.kind === "directory" && entry.name.startsWith(".ahp-")) {
        await navigator.locks.request(entry.name, { ifAvailable: true }, async (lock) => {
          if (lock) {
            this.log?.(`Deleting temporary directory ${entry.name}`);
            await root.removeEntry(entry.name, { recursive: true });
          } else {
            this.log?.(`Temporary directory ${entry.name} is in use`);
          }
        });
      }
    }
    const tmpDirName = `.ahp-${Math.random().toString(36).slice(2)}`;
    this.releaser = await new Promise((resolve) => {
      navigator.locks.request(tmpDirName, () => {
        return new Promise((release) => {
          resolve(release);
        });
      });
    });
    finalizationRegistry.register(this, this.releaser);
    const tmpDir = await root.getDirectoryHandle(tmpDirName, { create: true });
    for (let i = 0;i < nTemporaryFiles; i++) {
      const tmpFile = await tmpDir.getFileHandle(`${i}.tmp`, { create: true });
      const tmpAccessHandle = await tmpFile.createSyncAccessHandle();
      this.unboundAccessHandles.add(tmpAccessHandle);
    }
  }
  jOpen(zName, fileId, flags, pOutFlags) {
    try {
      const url = new URL(zName || Math.random().toString(36).slice(2), "file://");
      const path = url.pathname;
      if (flags & SQLITE_OPEN_MAIN_DB) {
        const persistentFile = this.persistentFiles.get(path);
        if (persistentFile?.isRequestInProgress) {
          return SQLITE_BUSY;
        } else if (!persistentFile) {
          this.log?.(`creating persistent file for ${path}`);
          const create = !!(flags & SQLITE_OPEN_CREATE);
          this._module.retryOps.push((async () => {
            try {
              let dirHandle = await navigator.storage.getDirectory();
              const directories = path.split("/").filter((d) => d);
              const filename = directories.pop();
              for (const directory of directories) {
                dirHandle = await dirHandle.getDirectoryHandle(directory, { create });
              }
              for (const suffix of DB_RELATED_FILE_SUFFIXES) {
                const fileHandle = await dirHandle.getFileHandle(filename + suffix, { create });
                await this.#createPersistentFile(fileHandle);
              }
              const file2 = new File(path, flags);
              file2.persistentFile = this.persistentFiles.get(path);
              await this.#requestAccessHandle(file2);
            } catch (e) {
              const persistentFile2 = new PersistentFile(null);
              this.persistentFiles.set(path, persistentFile2);
              console.error(e);
            }
          })());
          return SQLITE_BUSY;
        } else if (!persistentFile.fileHandle) {
          this.persistentFiles.delete(path);
          return SQLITE_CANTOPEN;
        } else if (!persistentFile.accessHandle) {
          this._module.retryOps.push((async () => {
            const file2 = new File(path, flags);
            file2.persistentFile = this.persistentFiles.get(path);
            await this.#requestAccessHandle(file2);
          })());
          return SQLITE_BUSY;
        }
      }
      if (!this.accessiblePaths.has(path) && !(flags & SQLITE_OPEN_CREATE)) {
        throw new Error(`File ${path} not found`);
      }
      const file = new File(path, flags);
      this.mapIdToFile.set(fileId, file);
      if (this.persistentFiles.has(path)) {
        file.persistentFile = this.persistentFiles.get(path);
      } else if (this.boundAccessHandles.has(path)) {
        file.accessHandle = this.boundAccessHandles.get(path);
      } else if (this.unboundAccessHandles.size) {
        file.accessHandle = this.unboundAccessHandles.values().next().value;
        file.accessHandle.truncate(0);
        this.unboundAccessHandles.delete(file.accessHandle);
        this.boundAccessHandles.set(path, file.accessHandle);
      }
      this.accessiblePaths.add(path);
      pOutFlags.setInt32(0, flags, true);
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_CANTOPEN;
    }
  }
  jDelete(zName, syncDir) {
    try {
      const url = new URL(zName, "file://");
      const path = url.pathname;
      if (this.persistentFiles.has(path)) {
        const persistentFile = this.persistentFiles.get(path);
        persistentFile.accessHandle.truncate(0);
      } else {
        this.boundAccessHandles.get(path)?.truncate(0);
      }
      this.accessiblePaths.delete(path);
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR_DELETE;
    }
  }
  jAccess(zName, flags, pResOut) {
    try {
      const url = new URL(zName, "file://");
      const path = url.pathname;
      pResOut.setInt32(0, this.accessiblePaths.has(path) ? 1 : 0, true);
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR_ACCESS;
    }
  }
  jClose(fileId) {
    try {
      const file = this.mapIdToFile.get(fileId);
      this.mapIdToFile.delete(fileId);
      if (file?.flags & SQLITE_OPEN_MAIN_DB) {
        if (file.persistentFile?.handleLockReleaser) {
          this.#releaseAccessHandle(file);
        }
      } else if (file?.flags & SQLITE_OPEN_DELETEONCLOSE) {
        file.accessHandle.truncate(0);
        this.accessiblePaths.delete(file.path);
        if (!this.persistentFiles.has(file.path)) {
          this.boundAccessHandles.delete(file.path);
          this.unboundAccessHandles.add(file.accessHandle);
        }
      }
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR_CLOSE;
    }
  }
  jRead(fileId, pData, iOffset) {
    try {
      const file = this.mapIdToFile.get(fileId);
      const accessHandle = file.accessHandle || file.persistentFile.accessHandle;
      const bytesRead = accessHandle.read(pData.subarray(), { at: iOffset });
      if (file.flags & SQLITE_OPEN_MAIN_DB && !file.persistentFile.isFileLocked) {
        this.#releaseAccessHandle(file);
      }
      if (bytesRead < pData.byteLength) {
        pData.fill(0, bytesRead);
        return SQLITE_IOERR_SHORT_READ;
      }
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR_READ;
    }
  }
  jWrite(fileId, pData, iOffset) {
    try {
      const file = this.mapIdToFile.get(fileId);
      const accessHandle = file.accessHandle || file.persistentFile.accessHandle;
      const nBytes = accessHandle.write(pData.subarray(), { at: iOffset });
      if (nBytes !== pData.byteLength)
        throw new Error("short write");
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR_WRITE;
    }
  }
  jTruncate(fileId, iSize) {
    try {
      const file = this.mapIdToFile.get(fileId);
      const accessHandle = file.accessHandle || file.persistentFile.accessHandle;
      accessHandle.truncate(iSize);
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR_TRUNCATE;
    }
  }
  jSync(fileId, flags) {
    try {
      const file = this.mapIdToFile.get(fileId);
      const accessHandle = file.accessHandle || file.persistentFile.accessHandle;
      accessHandle.flush();
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR_FSYNC;
    }
  }
  jFileSize(fileId, pSize64) {
    try {
      const file = this.mapIdToFile.get(fileId);
      const accessHandle = file.accessHandle || file.persistentFile.accessHandle;
      const size = accessHandle.getSize();
      pSize64.setBigInt64(0, BigInt(size), true);
      return SQLITE_OK;
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR_FSTAT;
    }
  }
  jLock(fileId, lockType) {
    const file = this.mapIdToFile.get(fileId);
    if (file.persistentFile.isRequestInProgress) {
      file.persistentFile.isLockBusy = true;
      return SQLITE_BUSY;
    }
    file.persistentFile.isFileLocked = true;
    if (!file.persistentFile.handleLockReleaser) {
      file.persistentFile.handleRequestChannel.onmessage = () => {
        this.log?.(`received notification for ${file.path}`);
        if (file.persistentFile.isFileLocked) {
          file.persistentFile.isHandleRequested = true;
        } else {
          this.#releaseAccessHandle(file);
        }
        file.persistentFile.handleRequestChannel.onmessage = null;
      };
      this.#requestAccessHandle(file);
      this.log?.("returning SQLITE_BUSY");
      file.persistentFile.isLockBusy = true;
      return SQLITE_BUSY;
    }
    file.persistentFile.isLockBusy = false;
    return SQLITE_OK;
  }
  jUnlock(fileId, lockType) {
    const file = this.mapIdToFile.get(fileId);
    if (lockType === SQLITE_LOCK_NONE) {
      if (!file.persistentFile.isLockBusy) {
        if (file.persistentFile.isHandleRequested) {
          this.#releaseAccessHandle(file);
          file.persistentFile.isHandleRequested = false;
        }
        file.persistentFile.isFileLocked = false;
      }
    }
    return SQLITE_OK;
  }
  jFileControl(fileId, op, pArg) {
    try {
      const file = this.mapIdToFile.get(fileId);
      switch (op) {
        case SQLITE_FCNTL_PRAGMA:
          const key = extractString(pArg, 4);
          const value = extractString(pArg, 8);
          this.log?.("xFileControl", file.path, "PRAGMA", key, value);
          switch (key.toLowerCase()) {
            case "journal_mode":
              if (value && !["off", "memory", "delete", "wal"].includes(value.toLowerCase())) {
                throw new Error('journal_mode must be "off", "memory", "delete", or "wal"');
              }
              break;
          }
          break;
      }
    } catch (e) {
      this.lastError = e;
      return SQLITE_IOERR;
    }
    return SQLITE_NOTFOUND;
  }
  jGetLastError(zBuf) {
    if (this.lastError) {
      console.error(this.lastError);
      const outputArray = zBuf.subarray(0, zBuf.byteLength - 1);
      const { written } = new TextEncoder().encodeInto(this.lastError.message, outputArray);
      zBuf[written] = 0;
    }
    return SQLITE_OK;
  }
  async#createPersistentFile(fileHandle) {
    const persistentFile = new PersistentFile(fileHandle);
    const root = await navigator.storage.getDirectory();
    const relativePath = await root.resolve(fileHandle);
    const path = `/${relativePath.join("/")}`;
    persistentFile.handleRequestChannel = new BroadcastChannel(`ahp:${path}`);
    this.persistentFiles.set(path, persistentFile);
    const f = await fileHandle.getFile();
    if (f.size) {
      this.accessiblePaths.add(path);
    }
    return persistentFile;
  }
  #requestAccessHandle(file) {
    console.assert(!file.persistentFile.handleLockReleaser);
    if (!file.persistentFile.isRequestInProgress) {
      file.persistentFile.isRequestInProgress = true;
      this._module.retryOps.push((async () => {
        file.persistentFile.handleLockReleaser = await this.#acquireLock(file.persistentFile);
        try {
          this.log?.(`creating access handles for ${file.path}`);
          await Promise.all(DB_RELATED_FILE_SUFFIXES.map(async (suffix) => {
            const persistentFile = this.persistentFiles.get(file.path + suffix);
            if (persistentFile) {
              persistentFile.accessHandle = await persistentFile.fileHandle.createSyncAccessHandle();
            }
          }));
        } catch (e) {
          this.log?.(`failed to create access handles for ${file.path}`, e);
          this.#releaseAccessHandle(file);
          throw e;
        } finally {
          file.persistentFile.isRequestInProgress = false;
        }
      })());
      return this._module.retryOps.at(-1);
    }
    return Promise.resolve();
  }
  #releaseAccessHandle(file) {
    DB_RELATED_FILE_SUFFIXES.forEach((suffix) => {
      const persistentFile = this.persistentFiles.get(file.path + suffix);
      if (persistentFile) {
        persistentFile.accessHandle?.close();
        persistentFile.accessHandle = null;
      }
    });
    this.log?.(`access handles closed for ${file.path}`);
    file.persistentFile.handleLockReleaser?.();
    file.persistentFile.handleLockReleaser = null;
    this.log?.(`lock released for ${file.path}`);
  }
  #acquireLock(persistentFile) {
    return new Promise((resolve) => {
      const lockName = persistentFile.handleRequestChannel.name;
      const notify = () => {
        this.log?.(`notifying for ${lockName}`);
        persistentFile.handleRequestChannel.postMessage(null);
      };
      const notifyId = setInterval(notify, LOCK_NOTIFY_INTERVAL);
      setTimeout(notify);
      this.log?.(`lock requested: ${lockName}`);
      navigator.locks.request(lockName, (lock) => {
        this.log?.(`lock acquired: ${lockName}`, lock);
        clearInterval(notifyId);
        return new Promise(resolve);
      });
    });
  }
}
function extractString(dataView, offset) {
  const p = dataView.getUint32(offset, true);
  if (p) {
    const chars = new Uint8Array(dataView.buffer, p);
    return new TextDecoder().decode(chars.subarray(0, chars.indexOf(0)));
  }
  return null;
}

// src/db/wa-sqlite-db.ts
var moduleInstance = null;
var sqlite3Instance = null;
var vfsInstance = null;
var vfsRegistered = false;
async function getModule() {
  if (!moduleInstance) {
    moduleInstance = await wa_sqlite_async_default();
  }
  return moduleInstance;
}
async function getSqlite3() {
  if (!sqlite3Instance) {
    const module = await getModule();
    sqlite3Instance = Factory(module);
  }
  return sqlite3Instance;
}

class WaSqliteDatabase {
  sqlite3;
  db;
  vfs;
  persistenceMode;
  constructor(sqlite3, db, vfs, persistenceMode) {
    this.sqlite3 = sqlite3;
    this.db = db;
    this.vfs = vfs;
    this.persistenceMode = persistenceMode;
  }
  static async create(dbPath) {
    const module = await getModule();
    const sqlite3 = await getSqlite3();
    const persistenceMode = "opfs";
    if (!vfsRegistered) {
      try {
        const vfsName = "opfs-coop";
        vfsInstance = await OPFSCoopSyncVFS.create(vfsName, module);
        sqlite3.vfs_register(vfsInstance, true);
        vfsRegistered = true;
        console.log("[wa-sqlite] OPFSCoopSyncVFS registered:", vfsInstance.name);
      } catch (e) {
        console.error("[wa-sqlite] Failed to register OPFS VFS:", e?.message);
        throw e;
      }
    }
    const db = await sqlite3.open_v2(dbPath, SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE, vfsInstance.name);
    console.log("[wa-sqlite] Database opened with OPFS, handle:", db);
    const database = new WaSqliteDatabase(sqlite3, db, vfsInstance, persistenceMode);
    await database.exec("PRAGMA cache_size = -8192");
    await database.exec("PRAGMA synchronous = normal");
    await database.exec("PRAGMA locking_mode = exclusive");
    return database;
  }
  static async createInMemory() {
    const sqlite3 = await getSqlite3();
    const db = await sqlite3.open_v2(":memory:", SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE);
    return new WaSqliteDatabase(sqlite3, db, null, "memory");
  }
  async exec(sql, params) {
    const results = [];
    let currentResult = null;
    try {
      for await (const stmt of this.sqlite3.statements(this.db, sql)) {
        if (params && params.length > 0) {
          this.sqlite3.bind_collection(stmt, params);
        }
        const columns = this.sqlite3.column_names(stmt);
        while (await this.sqlite3.step(stmt) === SQLITE_ROW) {
          if (!currentResult || currentResult.columns.join(",") !== columns.join(",")) {
            currentResult = { columns: [...columns], values: [] };
            results.push(currentResult);
          }
          const row = [];
          for (let i = 0;i < columns.length; i++) {
            row.push(this.sqlite3.column(stmt, i));
          }
          currentResult.values.push(row);
        }
      }
      return results;
    } catch (error) {
      console.error("[wa-sqlite] exec error:", error.message);
      throw error;
    }
  }
  async run(sql, params) {
    try {
      for await (const stmt of this.sqlite3.statements(this.db, sql)) {
        if (params && params.length > 0) {
          this.sqlite3.bind_collection(stmt, params);
        }
        await this.sqlite3.step(stmt);
      }
    } catch (error) {
      console.error("[wa-sqlite] run error:", error.message);
      throw error;
    }
  }
  async queryOne(sql, params) {
    const results = await this.exec(sql, params);
    if (!results[0] || !results[0].values[0]) {
      return null;
    }
    const { columns, values } = results[0];
    const row = {};
    for (let i = 0;i < columns.length; i++) {
      row[columns[i]] = values[0][i];
    }
    return row;
  }
  async queryAll(sql, params) {
    const results = await this.exec(sql, params);
    if (!results[0]) {
      return [];
    }
    const { columns, values } = results[0];
    return values.map((row) => {
      const obj = {};
      for (let i = 0;i < columns.length; i++) {
        obj[columns[i]] = row[i];
      }
      return obj;
    });
  }
  async sync() {
    try {
      await this.exec("PRAGMA wal_checkpoint(PASSIVE)");
    } catch {}
    await this.exec("SELECT 1");
  }
  async close() {
    await this.sqlite3.close(this.db);
  }
}

// src/db/indexeddb-utils.ts
function openIndexedDB(dbName) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("db", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function loadFromIndexedDB(dbName) {
  try {
    const db = await openIndexedDB(dbName);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("db", "readonly");
      const store = tx.objectStore("db");
      const getReq = store.get("main");
      getReq.onsuccess = () => resolve(getReq.result ? getReq.result.data : null);
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (e) {
    return null;
  }
}

// src/db/migration.ts
async function cleanupOldIndexedDB(dbName) {
  let oldData;
  try {
    oldData = await loadFromIndexedDB(dbName);
  } catch {
    return false;
  }
  if (!oldData || oldData.byteLength === 0) {
    return false;
  }
  const oldSizeMB = (oldData.byteLength / 1024 / 1024).toFixed(2);
  console.log(`[Migration] Found old IndexedDB cache (${oldSizeMB}MB) - cleaning up...`);
  try {
    const idb = await openIndexedDB(dbName);
    const tx = idb.transaction("db", "readwrite");
    tx.objectStore("db").delete("main");
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    idb.close();
    console.log(`[Migration] Old cache cleaned up. New OPFS cache will rebuild automatically.`);
    return true;
  } catch (e) {
    console.warn("[Migration] Could not delete old IndexedDB data:", e);
    return false;
  }
}

// src/db/schema.ts
var SCHEMA = {
  events: `
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            pubkey TEXT,
            created_at INTEGER,
            kind INTEGER,
            tags TEXT,
            content TEXT,
            sig TEXT,
            raw TEXT,
            deleted INTEGER DEFAULT 0,
            relay_url TEXT
        )
    `,
  events_indexes: [
    "CREATE INDEX IF NOT EXISTS idx_events_pubkey ON events(pubkey)",
    "CREATE INDEX IF NOT EXISTS idx_events_kind ON events(kind)",
    "CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_events_kind_created_at ON events(kind, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_events_pubkey_created_at ON events(pubkey, created_at)"
  ],
  profiles: `
        CREATE TABLE IF NOT EXISTS profiles (
            pubkey TEXT PRIMARY KEY,
            profile TEXT,
            updated_at INTEGER
        );
    `,
  decrypted_events: `
        CREATE TABLE IF NOT EXISTS decrypted_events (
            id TEXT PRIMARY KEY,
            event TEXT
        );
    `,
  unpublished_events: `
        CREATE TABLE IF NOT EXISTS unpublished_events (
            id TEXT PRIMARY KEY,
            event TEXT,
            relays TEXT,
            lastTryAt INTEGER
        );
    `,
  event_tags: `
        CREATE TABLE IF NOT EXISTS event_tags (
            event_id TEXT NOT NULL,
            tag TEXT NOT NULL,
            value TEXT,
            PRIMARY KEY (event_id, tag, value)
        )
    `,
  event_tags_indexes: [
    "CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON event_tags(event_id)",
    "CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags(tag)",
    "CREATE INDEX IF NOT EXISTS idx_event_tags_tag_value ON event_tags(tag, value)"
  ],
  cache_data: `
        CREATE TABLE IF NOT EXISTS cache_data (
            namespace TEXT NOT NULL,
            key TEXT NOT NULL,
            data TEXT NOT NULL,
            cached_at INTEGER NOT NULL,
            PRIMARY KEY (namespace, key)
        )
    `,
  cache_data_indexes: [
    "CREATE INDEX IF NOT EXISTS idx_cache_data_namespace ON cache_data(namespace)"
  ],
  nip05: `
        CREATE TABLE IF NOT EXISTS nip05 (
            nip05 TEXT PRIMARY KEY,
            profile TEXT,
            fetched_at INTEGER NOT NULL
        );
    `
};

// src/db/migrations.ts
var CURRENT_VERSION = 5;
async function getCurrentVersion(db) {
  try {
    const result = await db.exec("SELECT version FROM schema_version LIMIT 1");
    if (result && result.length > 0 && result[0].values && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
  } catch {}
  return 0;
}
async function setVersion(db, version) {
  await db.run("CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)");
  await db.run("DELETE FROM schema_version");
  await db.run("INSERT INTO schema_version (version) VALUES (?)", [version]);
}
async function runMigrations(db) {
  const currentVersion = await getCurrentVersion(db);
  console.log("[Migrations] Current schema version:", currentVersion);
  try {
    console.log("[Migrations] Creating events table...");
    await db.exec(SCHEMA.events);
    const eventsCheck = await db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='events'");
    if (!eventsCheck[0]?.values?.length) {
      throw new Error("Failed to create events table!");
    }
    console.log("[Migrations] Events table verified");
    for (const idx of SCHEMA.events_indexes) {
      await db.exec(idx);
    }
    console.log("[Migrations] Events indexes created");
    console.log("[Migrations] Creating profiles table...");
    await db.exec(SCHEMA.profiles);
    console.log("[Migrations] Creating decrypted_events table...");
    await db.exec(SCHEMA.decrypted_events);
    console.log("[Migrations] Creating unpublished_events table...");
    await db.exec(SCHEMA.unpublished_events);
    console.log("[Migrations] Creating event_tags table...");
    await db.exec(SCHEMA.event_tags);
    for (const idx of SCHEMA.event_tags_indexes) {
      await db.exec(idx);
    }
    console.log("[Migrations] Creating cache_data table...");
    await db.exec(SCHEMA.cache_data);
    for (const idx of SCHEMA.cache_data_indexes) {
      await db.exec(idx);
    }
    console.log("[Migrations] Base tables created successfully");
    if (currentVersion < 1) {
      await db.exec(SCHEMA.nip05);
    }
    if (currentVersion < 2) {
      await db.exec(SCHEMA.nip05);
    }
    if (currentVersion < 3) {
      const tableInfo = await db.exec("PRAGMA table_info(events)");
      const columns = tableInfo[0]?.values?.map((row) => row[1]) || [];
      if (!columns.includes("relay_url")) {
        await db.exec("ALTER TABLE events ADD COLUMN relay_url TEXT");
      }
      await db.exec("DROP TABLE IF EXISTS event_relays");
      await db.exec("DROP INDEX IF EXISTS idx_event_relays_event_id");
    }
    if (currentVersion < 4) {
      try {
        await db.exec("CREATE INDEX IF NOT EXISTS idx_events_kind_created_at ON events(kind, created_at)");
      } catch {}
      try {
        await db.exec("CREATE INDEX IF NOT EXISTS idx_events_pubkey_created_at ON events(pubkey, created_at)");
      } catch {}
      try {
        await db.exec("CREATE INDEX IF NOT EXISTS idx_event_tags_tag_value ON event_tags(tag, value)");
      } catch {}
    }
    if (currentVersion < 5) {
      try {
        const tableInfo = await db.exec("PRAGMA table_info(events)");
        const columns = tableInfo[0]?.values?.map((row) => row[1]) || [];
        if (!columns.includes("raw")) {
          await db.exec("ALTER TABLE events ADD COLUMN raw TEXT");
        }
      } catch (e) {
        console.error("[NDK Cache] Failed to add raw column:", e);
      }
    }
    await setVersion(db, CURRENT_VERSION);
    try {
      const tables = await db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='nip05'");
      if (!tables || tables.length === 0 || !tables[0].values || tables[0].values.length === 0) {
        console.error("[NDK Cache] ERROR: nip05 table was not created!");
      }
    } catch (verifyError) {
      console.error("[NDK Cache] Failed to verify nip05 table:", verifyError);
    }
  } catch (error) {
    console.error("[NDK Cache] Migration failed:", error);
    throw error;
  }
}

// src/binary/encoder.ts
var MAGIC_NUMBER = 1313821524;
var VERSION = 1;
var textEncoder = new TextEncoder;
function hexToBytes(hex) {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0;i < hex.length; i += 2) {
    const hi = hex.charCodeAt(i);
    const lo = hex.charCodeAt(i + 1);
    const hiVal = hi > 96 ? hi - 87 : hi > 64 ? hi - 55 : hi - 48;
    const loVal = lo > 96 ? lo - 87 : lo > 64 ? lo - 55 : lo - 48;
    bytes[i / 2] = hiVal << 4 | loVal;
  }
  return bytes;
}
function encodeString(str) {
  return textEncoder.encode(str);
}
function preEncodeEvent(event) {
  const idBytes = hexToBytes(event.id);
  const pubkeyBytes = hexToBytes(event.pubkey);
  const sigBytes = hexToBytes(event.sig);
  const contentBytes = encodeString(event.content);
  const tagBytes = [];
  for (const tag of event.tags) {
    const encodedTag = [];
    for (const item of tag) {
      encodedTag.push(encodeString(item));
    }
    tagBytes.push(encodedTag);
  }
  const relayBytes = event.relay_url ? encodeString(event.relay_url) : null;
  let size = 4;
  size += 32;
  size += 32;
  size += 4;
  size += 2;
  size += 64;
  size += 4;
  size += contentBytes.length;
  size += 2;
  for (const tag of tagBytes) {
    size += 1;
    for (const item of tag) {
      size += 2;
      size += item.length;
    }
  }
  size += 1;
  if (relayBytes) {
    size += 2;
    size += relayBytes.length;
  }
  return {
    idBytes,
    pubkeyBytes,
    sigBytes,
    contentBytes,
    tagBytes,
    relayBytes,
    totalSize: size
  };
}
function writeEncodedEvent(event, encoded, buffer, offset) {
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  let pos = offset;
  view.setUint32(pos, encoded.totalSize, true);
  pos += 4;
  uint8.set(encoded.idBytes, pos);
  pos += 32;
  uint8.set(encoded.pubkeyBytes, pos);
  pos += 32;
  view.setUint32(pos, event.created_at, true);
  pos += 4;
  view.setUint16(pos, event.kind, true);
  pos += 2;
  uint8.set(encoded.sigBytes, pos);
  pos += 64;
  view.setUint32(pos, encoded.contentBytes.length, true);
  pos += 4;
  uint8.set(encoded.contentBytes, pos);
  pos += encoded.contentBytes.length;
  view.setUint16(pos, encoded.tagBytes.length, true);
  pos += 2;
  for (const tag of encoded.tagBytes) {
    view.setUint8(pos, tag.length);
    pos += 1;
    for (const item of tag) {
      view.setUint16(pos, item.length, true);
      pos += 2;
      uint8.set(item, pos);
      pos += item.length;
    }
  }
  if (encoded.relayBytes) {
    view.setUint8(pos, 1);
    pos += 1;
    view.setUint16(pos, encoded.relayBytes.length, true);
    pos += 2;
    uint8.set(encoded.relayBytes, pos);
    pos += encoded.relayBytes.length;
  } else {
    view.setUint8(pos, 0);
    pos += 1;
  }
  return pos;
}
function encodeEvents(events) {
  const encodedEvents = [];
  let totalSize = 4 + 1 + 4;
  for (const event of events) {
    const encoded = preEncodeEvent(event);
    encodedEvents.push(encoded);
    totalSize += encoded.totalSize;
  }
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let offset = 0;
  view.setUint32(offset, MAGIC_NUMBER, true);
  offset += 4;
  view.setUint8(offset, VERSION);
  offset += 1;
  view.setUint32(offset, events.length, true);
  offset += 4;
  for (let i = 0;i < events.length; i++) {
    offset = writeEncodedEvent(events[i], encodedEvents[i], buffer, offset);
  }
  return buffer;
}

// src/version.ts
var PACKAGE_VERSION = "0.8.2";
var PROTOCOL_NAME = "ndk-cache-sqlite";

// ../core/dist/index.mjs
var import_tseep = __toESM(require_lib(), 1);
var import_debug = __toESM(require_browser(), 1);
var import_debug2 = __toESM(require_browser(), 1);
var import_tseep2 = __toESM(require_lib(), 1);
var import_debug3 = __toESM(require_browser(), 1);

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/node_modules/@noble/hashes/esm/_assert.js
function number(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`Wrong positive integer: ${n}`);
}
function bytes(b, ...lengths) {
  if (!(b instanceof Uint8Array))
    throw new Error("Expected Uint8Array");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
}
function hash(hash2) {
  if (typeof hash2 !== "function" || typeof hash2.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  number(hash2.outputLen);
  number(hash2.blockLen);
}
function exists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function output(out, instance) {
  bytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/node_modules/@noble/hashes/esm/crypto.js
var crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : undefined;

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/node_modules/@noble/hashes/esm/utils.js
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var u8a = (a) => a instanceof Uint8Array;
var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
var rotr = (word, shift) => word << 32 - shift | word >>> shift;
var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!isLE)
  throw new Error("Non little-endian hardware is not supported");
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  if (!u8a(data))
    throw new Error(`expected Uint8Array, got ${typeof data}`);
  return data;
}
function concatBytes(...arrays) {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
  let pad = 0;
  arrays.forEach((a) => {
    if (!u8a(a))
      throw new Error("Uint8Array expected");
    r.set(a, pad);
    pad += a.length;
  });
  return r;
}

class Hash {
  clone() {
    return this._cloneInto();
  }
}
var toStr = {}.toString;
function wrapConstructor(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto2 && typeof crypto2.getRandomValues === "function") {
    return crypto2.getRandomValues(new Uint8Array(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/node_modules/@noble/hashes/esm/_sha2.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}

class SHA2 extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE2) {
    super();
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE2;
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    exists(this);
    const { view, buffer, blockLen } = this;
    data = toBytes(data);
    const len = data.length;
    for (let pos = 0;pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (;blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    exists(this);
    output(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    this.buffer.subarray(pos).fill(0);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos;i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0;i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE2);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor);
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.length = length;
    to.pos = pos;
    to.finished = finished;
    to.destroyed = destroyed;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
}

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/node_modules/@noble/hashes/esm/sha256.js
var Chi = (a, b, c) => a & b ^ ~a & c;
var Maj = (a, b, c) => a & b ^ a & c ^ b & c;
var SHA256_K = /* @__PURE__ */ new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var IV = /* @__PURE__ */ new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);

class SHA256 extends SHA2 {
  constructor() {
    super(64, 32, 8, false);
    this.A = IV[0] | 0;
    this.B = IV[1] | 0;
    this.C = IV[2] | 0;
    this.D = IV[3] | 0;
    this.E = IV[4] | 0;
    this.F = IV[5] | 0;
    this.G = IV[6] | 0;
    this.H = IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0;i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16;i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0;i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    SHA256_W.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    this.buffer.fill(0);
  }
}
var sha256 = /* @__PURE__ */ wrapConstructor(() => new SHA256);

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/esm/abstract/utils.js
var exports_utils = {};
__export(exports_utils, {
  validateObject: () => validateObject,
  utf8ToBytes: () => utf8ToBytes2,
  numberToVarBytesBE: () => numberToVarBytesBE,
  numberToHexUnpadded: () => numberToHexUnpadded,
  numberToBytesLE: () => numberToBytesLE,
  numberToBytesBE: () => numberToBytesBE,
  hexToNumber: () => hexToNumber,
  hexToBytes: () => hexToBytes2,
  equalBytes: () => equalBytes,
  ensureBytes: () => ensureBytes,
  createHmacDrbg: () => createHmacDrbg,
  concatBytes: () => concatBytes2,
  bytesToNumberLE: () => bytesToNumberLE,
  bytesToNumberBE: () => bytesToNumberBE,
  bytesToHex: () => bytesToHex,
  bitSet: () => bitSet,
  bitMask: () => bitMask,
  bitLen: () => bitLen,
  bitGet: () => bitGet
});
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n = BigInt(0);
var _1n = BigInt(1);
var _2n = BigInt(2);
var u8a2 = (a) => a instanceof Uint8Array;
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes2) {
  if (!u8a2(bytes2))
    throw new Error("Uint8Array expected");
  let hex = "";
  for (let i = 0;i < bytes2.length; i++) {
    hex += hexes[bytes2[i]];
  }
  return hex;
}
function numberToHexUnpadded(num) {
  const hex = num.toString(16);
  return hex.length & 1 ? `0${hex}` : hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return BigInt(hex === "" ? "0" : `0x${hex}`);
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  const len = hex.length;
  if (len % 2)
    throw new Error("padded hex string expected, got unpadded hex of length " + len);
  const array = new Uint8Array(len / 2);
  for (let i = 0;i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0)
      throw new Error("Invalid byte sequence");
    array[i] = byte;
  }
  return array;
}
function bytesToNumberBE(bytes2) {
  return hexToNumber(bytesToHex(bytes2));
}
function bytesToNumberLE(bytes2) {
  if (!u8a2(bytes2))
    throw new Error("Uint8Array expected");
  return hexToNumber(bytesToHex(Uint8Array.from(bytes2).reverse()));
}
function numberToBytesBE(n, len) {
  return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function numberToVarBytesBE(n) {
  return hexToBytes2(numberToHexUnpadded(n));
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e) {
      throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e}`);
    }
  } else if (u8a2(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(`${title} must be hex string or Uint8Array`);
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
  return res;
}
function concatBytes2(...arrays) {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
  let pad = 0;
  arrays.forEach((a) => {
    if (!u8a2(a))
      throw new Error("Uint8Array expected");
    r.set(a, pad);
    pad += a.length;
  });
  return r;
}
function equalBytes(b1, b2) {
  if (b1.length !== b2.length)
    return false;
  for (let i = 0;i < b1.length; i++)
    if (b1[i] !== b2[i])
      return false;
  return true;
}
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function bitLen(n) {
  let len;
  for (len = 0;n > _0n; n >>= _1n, len += 1)
    ;
  return len;
}
function bitGet(n, pos) {
  return n >> BigInt(pos) & _1n;
}
var bitSet = (n, pos, value) => {
  return n | (value ? _1n : _0n) << BigInt(pos);
};
var bitMask = (n) => (_2n << BigInt(n - 1)) - _1n;
var u8n = (data) => new Uint8Array(data);
var u8fr = (arr) => Uint8Array.from(arr);
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...b) => hmacFn(k, v, ...b);
  const reseed = (seed = u8n()) => {
    k = h(u8fr([0]), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8fr([1]), seed);
    v = h();
  };
  const gen = () => {
    if (i++ >= 1000)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes2(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = undefined;
    while (!(res = pred(gen())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
var validatorFns = {
  bigint: (val) => typeof val === "bigint",
  function: (val) => typeof val === "function",
  boolean: (val) => typeof val === "boolean",
  string: (val) => typeof val === "string",
  stringOrUint8Array: (val) => typeof val === "string" || val instanceof Uint8Array,
  isSafeInteger: (val) => Number.isSafeInteger(val),
  array: (val) => Array.isArray(val),
  field: (val, object) => object.Fp.isValid(val),
  hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
};
function validateObject(object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error(`Invalid validator "${type}", expected function`);
    const val = object[fieldName];
    if (isOptional && val === undefined)
      return;
    if (!checkVal(val, object)) {
      throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
    }
  };
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/esm/abstract/modular.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n2 = BigInt(0);
var _1n2 = BigInt(1);
var _2n2 = BigInt(2);
var _3n = BigInt(3);
var _4n = BigInt(4);
var _5n = BigInt(5);
var _8n = BigInt(8);
var _9n = BigInt(9);
var _16n = BigInt(16);
function mod(a, b) {
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow(num, power, modulo) {
  if (modulo <= _0n2 || power < _0n2)
    throw new Error("Expected power/modulo > 0");
  if (modulo === _1n2)
    return _0n2;
  let res = _1n2;
  while (power > _0n2) {
    if (power & _1n2)
      res = res * num % modulo;
    num = num * num % modulo;
    power >>= _1n2;
  }
  return res;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number2, modulo) {
  if (number2 === _0n2 || modulo <= _0n2) {
    throw new Error(`invert: expected positive integers, got n=${number2} mod=${modulo}`);
  }
  let a = mod(number2, modulo);
  let b = modulo;
  let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function tonelliShanks(P) {
  const legendreC = (P - _1n2) / _2n2;
  let Q, S, Z;
  for (Q = P - _1n2, S = 0;Q % _2n2 === _0n2; Q /= _2n2, S++)
    ;
  for (Z = _2n2;Z < P && pow(Z, legendreC, P) !== P - _1n2; Z++)
    ;
  if (S === 1) {
    const p1div4 = (P + _1n2) / _4n;
    return function tonelliFast(Fp, n) {
      const root = Fp.pow(n, p1div4);
      if (!Fp.eql(Fp.sqr(root), n))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  const Q1div2 = (Q + _1n2) / _2n2;
  return function tonelliSlow(Fp, n) {
    if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE))
      throw new Error("Cannot find square root");
    let r = S;
    let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q);
    let x = Fp.pow(n, Q1div2);
    let b = Fp.pow(n, Q);
    while (!Fp.eql(b, Fp.ONE)) {
      if (Fp.eql(b, Fp.ZERO))
        return Fp.ZERO;
      let m = 1;
      for (let t2 = Fp.sqr(b);m < r; m++) {
        if (Fp.eql(t2, Fp.ONE))
          break;
        t2 = Fp.sqr(t2);
      }
      const ge = Fp.pow(g, _1n2 << BigInt(r - m - 1));
      g = Fp.sqr(ge);
      x = Fp.mul(x, ge);
      b = Fp.mul(b, g);
      r = m;
    }
    return x;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n) {
    const p1div4 = (P + _1n2) / _4n;
    return function sqrt3mod4(Fp, n) {
      const root = Fp.pow(n, p1div4);
      if (!Fp.eql(Fp.sqr(root), n))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  if (P % _8n === _5n) {
    const c1 = (P - _5n) / _8n;
    return function sqrt5mod8(Fp, n) {
      const n2 = Fp.mul(n, _2n2);
      const v = Fp.pow(n2, c1);
      const nv = Fp.mul(n, v);
      const i = Fp.mul(Fp.mul(nv, _2n2), v);
      const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
      if (!Fp.eql(Fp.sqr(root), n))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  if (P % _16n === _9n) {}
  return tonelliShanks(P);
}
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject(field, opts);
}
function FpPow(f, num, power) {
  if (power < _0n2)
    throw new Error("Expected power > 0");
  if (power === _0n2)
    return f.ONE;
  if (power === _1n2)
    return num;
  let p = f.ONE;
  let d = num;
  while (power > _0n2) {
    if (power & _1n2)
      p = f.mul(p, d);
    d = f.sqr(d);
    power >>= _1n2;
  }
  return p;
}
function FpInvertBatch(f, nums) {
  const tmp = new Array(nums.length);
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (f.is0(num))
      return acc;
    tmp[i] = acc;
    return f.mul(acc, num);
  }, f.ONE);
  const inverted = f.inv(lastMultiplied);
  nums.reduceRight((acc, num, i) => {
    if (f.is0(num))
      return acc;
    tmp[i] = f.mul(acc, tmp[i]);
    return f.mul(acc, num);
  }, inverted);
  return tmp;
}
function nLength(n, nBitLength) {
  const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLen2, isLE2 = false, redef = {}) {
  if (ORDER <= _0n2)
    throw new Error(`Expected Field ORDER > 0, got ${ORDER}`);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
  if (BYTES > 2048)
    throw new Error("Field lengths over 2048 bytes are not supported");
  const sqrtP = FpSqrt(ORDER);
  const f = Object.freeze({
    ORDER,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n2,
    ONE: _1n2,
    create: (num) => mod(num, ORDER),
    isValid: (num) => {
      if (typeof num !== "bigint")
        throw new Error(`Invalid field element: expected bigint, got ${typeof num}`);
      return _0n2 <= num && num < ORDER;
    },
    is0: (num) => num === _0n2,
    isOdd: (num) => (num & _1n2) === _1n2,
    neg: (num) => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert(num, ORDER),
    sqrt: redef.sqrt || ((n) => sqrtP(f, n)),
    invertBatch: (lst) => FpInvertBatch(f, lst),
    cmov: (a, b, c) => c ? b : a,
    toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
    fromBytes: (bytes2) => {
      if (bytes2.length !== BYTES)
        throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes2.length}`);
      return isLE2 ? bytesToNumberLE(bytes2) : bytesToNumberBE(bytes2);
    }
  });
  return Object.freeze(f);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error(`expected ${minLen}-1024 bytes of input, got ${len}`);
  const num = isLE2 ? bytesToNumberBE(key) : bytesToNumberLE(key);
  const reduced = mod(num, fieldOrder - _1n2) + _1n2;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/esm/abstract/curve.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n3 = BigInt(0);
var _1n3 = BigInt(1);
function wNAF(c, bits) {
  const constTimeNegate = (condition, item) => {
    const neg = item.negate();
    return condition ? neg : item;
  };
  const opts = (W) => {
    const windows = Math.ceil(bits / W) + 1;
    const windowSize = 2 ** (W - 1);
    return { windows, windowSize };
  };
  return {
    constTimeNegate,
    unsafeLadder(elm, n) {
      let p = c.ZERO;
      let d = elm;
      while (n > _0n3) {
        if (n & _1n3)
          p = p.add(d);
        d = d.double();
        n >>= _1n3;
      }
      return p;
    },
    precomputeWindow(elm, W) {
      const { windows, windowSize } = opts(W);
      const points = [];
      let p = elm;
      let base = p;
      for (let window2 = 0;window2 < windows; window2++) {
        base = p;
        points.push(base);
        for (let i = 1;i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    },
    wNAF(W, precomputes, n) {
      const { windows, windowSize } = opts(W);
      let p = c.ZERO;
      let f = c.BASE;
      const mask = BigInt(2 ** W - 1);
      const maxNumber = 2 ** W;
      const shiftBy = BigInt(W);
      for (let window2 = 0;window2 < windows; window2++) {
        const offset = window2 * windowSize;
        let wbits = Number(n & mask);
        n >>= shiftBy;
        if (wbits > windowSize) {
          wbits -= maxNumber;
          n += _1n3;
        }
        const offset1 = offset;
        const offset2 = offset + Math.abs(wbits) - 1;
        const cond1 = window2 % 2 !== 0;
        const cond2 = wbits < 0;
        if (wbits === 0) {
          f = f.add(constTimeNegate(cond1, precomputes[offset1]));
        } else {
          p = p.add(constTimeNegate(cond2, precomputes[offset2]));
        }
      }
      return { p, f };
    },
    wNAFCached(P, precomputesMap, n, transform) {
      const W = P._WINDOW_SIZE || 1;
      let comp = precomputesMap.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W);
        if (W !== 1) {
          precomputesMap.set(P, transform(comp));
        }
      }
      return this.wNAF(W, comp, n);
    }
  };
}
function validateBasic(curve) {
  validateField(curve.Fp);
  validateObject(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/esm/abstract/weierstrass.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function validatePointOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    a: "field",
    b: "field"
  }, {
    allowedPrivateKeyLengths: "array",
    wrapPrivateKey: "boolean",
    isTorsionFree: "function",
    clearCofactor: "function",
    allowInfinityPoint: "boolean",
    fromBytes: "function",
    toBytes: "function"
  });
  const { endo, Fp, a } = opts;
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error("Endomorphism can only be defined for Koblitz curves that have a=0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error("Expected endomorphism with beta: bigint and splitScalar: function");
    }
  }
  return Object.freeze({ ...opts });
}
var { bytesToNumberBE: b2n, hexToBytes: h2b } = exports_utils;
var DER = {
  Err: class DERErr extends Error {
    constructor(m = "") {
      super(m);
    }
  },
  _parseInt(data) {
    const { Err: E } = DER;
    if (data.length < 2 || data[0] !== 2)
      throw new E("Invalid signature integer tag");
    const len = data[1];
    const res = data.subarray(2, len + 2);
    if (!len || res.length !== len)
      throw new E("Invalid signature integer: wrong length");
    if (res[0] & 128)
      throw new E("Invalid signature integer: negative");
    if (res[0] === 0 && !(res[1] & 128))
      throw new E("Invalid signature integer: unnecessary leading zero");
    return { d: b2n(res), l: data.subarray(len + 2) };
  },
  toSig(hex) {
    const { Err: E } = DER;
    const data = typeof hex === "string" ? h2b(hex) : hex;
    if (!(data instanceof Uint8Array))
      throw new Error("ui8a expected");
    let l = data.length;
    if (l < 2 || data[0] != 48)
      throw new E("Invalid signature tag");
    if (data[1] !== l - 2)
      throw new E("Invalid signature: incorrect length");
    const { d: r, l: sBytes } = DER._parseInt(data.subarray(2));
    const { d: s, l: rBytesLeft } = DER._parseInt(sBytes);
    if (rBytesLeft.length)
      throw new E("Invalid signature: left bytes after parsing");
    return { r, s };
  },
  hexFromSig(sig) {
    const slice = (s2) => Number.parseInt(s2[0], 16) & 8 ? "00" + s2 : s2;
    const h = (num) => {
      const hex = num.toString(16);
      return hex.length & 1 ? `0${hex}` : hex;
    };
    const s = slice(h(sig.s));
    const r = slice(h(sig.r));
    const shl = s.length / 2;
    const rhl = r.length / 2;
    const sl = h(shl);
    const rl = h(rhl);
    return `30${h(rhl + shl + 4)}02${rl}${r}02${sl}${s}`;
  }
};
var _0n4 = BigInt(0);
var _1n4 = BigInt(1);
var _2n3 = BigInt(2);
var _3n2 = BigInt(3);
var _4n2 = BigInt(4);
function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts);
  const { Fp } = CURVE;
  const toBytes2 = CURVE.toBytes || ((_c, point, _isCompressed) => {
    const a = point.toAffine();
    return concatBytes2(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
  });
  const fromBytes = CURVE.fromBytes || ((bytes2) => {
    const tail = bytes2.subarray(1);
    const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
    const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
    return { x, y };
  });
  function weierstrassEquation(x) {
    const { a, b } = CURVE;
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
  }
  if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx)))
    throw new Error("bad generator point: equation left != right");
  function isWithinCurveOrder(num) {
    return typeof num === "bigint" && _0n4 < num && num < CURVE.n;
  }
  function assertGE(num) {
    if (!isWithinCurveOrder(num))
      throw new Error("Expected valid bigint: 0 < bigint < curve.n");
  }
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (key instanceof Uint8Array)
        key = bytesToHex(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("Invalid key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num;
    try {
      num = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
    } catch (error) {
      throw new Error(`private key must be ${nByteLength} bytes, hex or bigint, not ${typeof key}`);
    }
    if (wrapPrivateKey)
      num = mod(num, n);
    assertGE(num);
    return num;
  }
  const pointPrecomputes = new Map;
  function assertPrjPoint(other) {
    if (!(other instanceof Point))
      throw new Error("ProjectivePoint expected");
  }

  class Point {
    constructor(px, py, pz) {
      this.px = px;
      this.py = py;
      this.pz = pz;
      if (px == null || !Fp.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp.isValid(py))
        throw new Error("y required");
      if (pz == null || !Fp.isValid(pz))
        throw new Error("z required");
    }
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      const is0 = (i) => Fp.eql(i, Fp.ZERO);
      if (is0(x) && is0(y))
        return Point.ZERO;
      return new Point(x, y, Fp.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static normalizeZ(points) {
      const toInv = Fp.invertBatch(points.map((p) => p.pz));
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
    }
    static fromHex(hex) {
      const P = Point.fromAffine(fromBytes(ensureBytes("pointHex", hex)));
      P.assertValidity();
      return P;
    }
    static fromPrivateKey(privateKey) {
      return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    _setWindowSize(windowSize) {
      this._WINDOW_SIZE = windowSize;
      pointPrecomputes.delete(this);
    }
    assertValidity() {
      if (this.is0()) {
        if (CURVE.allowInfinityPoint && !Fp.is0(this.py))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = this.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not FE");
      const left = Fp.sqr(y);
      const right = weierstrassEquation(x);
      if (!Fp.eql(left, right))
        throw new Error("bad point: equation left != right");
      if (!this.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (Fp.isOdd)
        return !Fp.isOdd(y);
      throw new Error("Field doesn't support isOdd");
    }
    equals(other) {
      assertPrjPoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    negate() {
      return new Point(this.px, Fp.neg(this.py), this.pz);
    }
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    add(other) {
      assertPrjPoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, pointPrecomputes, n, (comp) => {
        const toInv = Fp.invertBatch(comp.map((p) => p.pz));
        return comp.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
      });
    }
    multiplyUnsafe(n) {
      const I = Point.ZERO;
      if (n === _0n4)
        return I;
      assertGE(n);
      if (n === _1n4)
        return this;
      const { endo } = CURVE;
      if (!endo)
        return wnaf.unsafeLadder(this, n);
      let { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
      let k1p = I;
      let k2p = I;
      let d = this;
      while (k1 > _0n4 || k2 > _0n4) {
        if (k1 & _1n4)
          k1p = k1p.add(d);
        if (k2 & _1n4)
          k2p = k2p.add(d);
        d = d.double();
        k1 >>= _1n4;
        k2 >>= _1n4;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    multiply(scalar) {
      assertGE(scalar);
      let n = scalar;
      let point, fake;
      const { endo } = CURVE;
      if (endo) {
        const { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k2);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p, f } = this.wNAF(n);
        point = p;
        fake = f;
      }
      return Point.normalizeZ([point, fake])[0];
    }
    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point.BASE;
      const mul = (P, a2) => a2 === _0n4 || a2 === _1n4 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
      const sum = mul(this, a).add(mul(Q, b));
      return sum.is0() ? undefined : sum;
    }
    toAffine(iz) {
      const { px: x, py: y, pz: z } = this;
      const is0 = this.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(z);
      const ax = Fp.mul(x, iz);
      const ay = Fp.mul(y, iz);
      const zz = Fp.mul(z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x: ax, y: ay };
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n4)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      this.assertValidity();
      return toBytes2(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex(this.toRawBytes(isCompressed));
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
  const _bits = CURVE.nBitLength;
  const wnaf = wNAF(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits);
  return {
    CURVE,
    ProjectivePoint: Point,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
function validateOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { Fp, n: CURVE_ORDER } = CURVE;
  const compressedLen = Fp.BYTES + 1;
  const uncompressedLen = 2 * Fp.BYTES + 1;
  function isValidFieldElement(num) {
    return _0n4 < num && num < Fp.ORDER;
  }
  function modN(a) {
    return mod(a, CURVE_ORDER);
  }
  function invN(a) {
    return invert(a, CURVE_ORDER);
  }
  const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine();
      const x = Fp.toBytes(a.x);
      const cat = concatBytes2;
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
      } else {
        return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
      }
    },
    fromBytes(bytes2) {
      const len = bytes2.length;
      const head = bytes2[0];
      const tail = bytes2.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x = bytesToNumberBE(tail);
        if (!isValidFieldElement(x))
          throw new Error("Point is not on curve");
        const y2 = weierstrassEquation(x);
        let y = Fp.sqrt(y2);
        const isYOdd = (y & _1n4) === _1n4;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (len === uncompressedLen && head === 4) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
        return { x, y };
      } else {
        throw new Error(`Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`);
      }
    }
  });
  const numToNByteStr = (num) => bytesToHex(numberToBytesBE(num, CURVE.nByteLength));
  function isBiggerThanHalfOrder(number2) {
    const HALF = CURVE_ORDER >> _1n4;
    return number2 > HALF;
  }
  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN(-s) : s;
  }
  const slcNum = (b, from, to) => bytesToNumberBE(b.slice(from, to));

  class Signature {
    constructor(r, s, recovery) {
      this.r = r;
      this.s = s;
      this.recovery = recovery;
      this.assertValidity();
    }
    static fromCompact(hex) {
      const l = CURVE.nByteLength;
      hex = ensureBytes("compactSignature", hex, l * 2);
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
    }
    static fromDER(hex) {
      const { r, s } = DER.toSig(ensureBytes("DER", hex));
      return new Signature(r, s);
    }
    assertValidity() {
      if (!isWithinCurveOrder(this.r))
        throw new Error("r must be 0 < r < CURVE.n");
      if (!isWithinCurveOrder(this.s))
        throw new Error("s must be 0 < s < CURVE.n");
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r, s, recovery: rec } = this;
      const h = bits2int_modN(ensureBytes("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
      if (radj >= Fp.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R = Point.fromHex(prefix + numToNByteStr(radj));
      const ir = invN(radj);
      const u1 = modN(-h * ir);
      const u2 = modN(s * ir);
      const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
      if (!Q)
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return hexToBytes2(this.toDERHex());
    }
    toDERHex() {
      return DER.hexFromSig({ r: this.r, s: this.s });
    }
    toCompactRawBytes() {
      return hexToBytes2(this.toCompactHex());
    }
    toCompactHex() {
      return numToNByteStr(this.r) + numToNByteStr(this.s);
    }
  }
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    randomPrivateKey: () => {
      const length = getMinHashLength(CURVE.n);
      return mapHashToField(CURVE.randomBytes(length), CURVE.n);
    },
    precompute(windowSize = 8, point = Point.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  function isProbPub(item) {
    const arr = item instanceof Uint8Array;
    const str = typeof item === "string";
    const len = (arr || str) && item.length;
    if (arr)
      return len === compressedLen || len === uncompressedLen;
    if (str)
      return len === 2 * compressedLen || len === 2 * uncompressedLen;
    if (item instanceof Point)
      return true;
    return false;
  }
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA))
      throw new Error("first arg must be private key");
    if (!isProbPub(publicB))
      throw new Error("second arg must be public key");
    const b = Point.fromHex(publicB);
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  const bits2int = CURVE.bits2int || function(bytes2) {
    const num = bytesToNumberBE(bytes2);
    const delta = bytes2.length * 8 - CURVE.nBitLength;
    return delta > 0 ? num >> BigInt(delta) : num;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes2) {
    return modN(bits2int(bytes2));
  };
  const ORDER_MASK = bitMask(CURVE.nBitLength);
  function int2octets(num) {
    if (typeof num !== "bigint")
      throw new Error("bigint expected");
    if (!(_0n4 <= num && num < ORDER_MASK))
      throw new Error(`bigint expected < 2^${CURVE.nBitLength}`);
    return numberToBytesBE(num, CURVE.nByteLength);
  }
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k) => (k in opts)))
      throw new Error("sign() legacy options not supported");
    const { hash: hash2, randomBytes: randomBytes2 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes("msgHash", msgHash);
    if (prehash)
      msgHash = ensureBytes("prehashed msgHash", hash2(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (ent != null) {
      const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
      seedArgs.push(ensureBytes("extraEntropy", e));
    }
    const seed = concatBytes2(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!isWithinCurveOrder(k))
        return;
      const ik = invN(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = modN(q.x);
      if (r === _0n4)
        return;
      const s = modN(ik * modN(m + r * d));
      if (s === _0n4)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    return { seed, k2sig };
  }
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C = CURVE;
    const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
    return drbg(seed, k2sig);
  }
  Point.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes("msgHash", msgHash);
    publicKey = ensureBytes("publicKey", publicKey);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    const { lowS, prehash } = opts;
    let _sig = undefined;
    let P;
    try {
      if (typeof sg === "string" || sg instanceof Uint8Array) {
        try {
          _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
          _sig = Signature.fromCompact(sg);
        }
      } else if (typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint") {
        const { r: r2, s: s2 } = sg;
        _sig = new Signature(r2, s2);
      } else {
        throw new Error("PARSE");
      }
      P = Point.fromHex(publicKey);
    } catch (error) {
      if (error.message === "PARSE")
        throw new Error(`signature must be Signature instance, Uint8Array or hex string`);
      return false;
    }
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r, s } = _sig;
    const h = bits2int_modN(msgHash);
    const is = invN(s);
    const u1 = modN(h * is);
    const u2 = modN(r * is);
    const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
    if (!R)
      return false;
    const v = modN(R.x);
    return v === r;
  }
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign,
    verify,
    ProjectivePoint: Point,
    Signature,
    utils
  };
}

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/node_modules/@noble/hashes/esm/hmac.js
class HMAC extends Hash {
  constructor(hash2, _key) {
    super();
    this.finished = false;
    this.destroyed = false;
    hash(hash2);
    const key = toBytes(_key);
    this.iHash = hash2.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
    for (let i = 0;i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash2.create();
    for (let i = 0;i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    pad.fill(0);
  }
  update(buf) {
    exists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    exists(this);
    bytes(out, this.outputLen);
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
}
var hmac = (hash2, key, message) => new HMAC(hash2, key).update(message).digest();
hmac.create = (hash2, key) => new HMAC(hash2, key);

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/esm/_shortw_utils.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function getHash(hash2) {
  return {
    hash: hash2,
    hmac: (key, ...msgs) => hmac(hash2, key, concatBytes(...msgs)),
    randomBytes
  };
}
function createCurve(curveDef, defHash) {
  const create = (hash2) => weierstrass({ ...curveDef, ...getHash(hash2) });
  return Object.freeze({ ...create(defHash), create });
}

// ../core/node_modules/nostr-tools/node_modules/@noble/curves/esm/secp256k1.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
var secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
var _1n5 = BigInt(1);
var _2n4 = BigInt(2);
var divNearest = (a, b) => (a + b / _2n4) / b;
function sqrtMod(y) {
  const P = secp256k1P;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n4, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n4, P);
  if (!Fp.eql(Fp.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var Fp = Field(secp256k1P, undefined, undefined, { sqrt: sqrtMod });
var secp256k1 = createCurve({
  a: BigInt(0),
  b: BigInt(7),
  Fp,
  n: secp256k1N,
  Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
  Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
  h: BigInt(1),
  lowS: true,
  endo: {
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    splitScalar: (k) => {
      const n = secp256k1N;
      const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
      const b1 = -_1n5 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
      const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
      const b2 = a1;
      const POW_2_128 = BigInt("0x100000000000000000000000000000000");
      const c1 = divNearest(b2 * k, n);
      const c2 = divNearest(-b1 * k, n);
      let k1 = mod(k - c1 * a1 - c2 * a2, n);
      let k2 = mod(-c1 * b1 - c2 * b2, n);
      const k1neg = k1 > POW_2_128;
      const k2neg = k2 > POW_2_128;
      if (k1neg)
        k1 = n - k1;
      if (k2neg)
        k2 = n - k2;
      if (k1 > POW_2_128 || k2 > POW_2_128) {
        throw new Error("splitScalar: Endomorphism failed, k=" + k);
      }
      return { k1neg, k1, k2neg, k2 };
    }
  }
}, sha256);
var _0n5 = BigInt(0);
var fe = (x) => typeof x === "bigint" && _0n5 < x && x < secp256k1P;
var ge = (x) => typeof x === "bigint" && _0n5 < x && x < secp256k1N;
var TAGGED_HASH_PREFIXES = {};
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === undefined) {
    const tagH = sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
    tagP = concatBytes2(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes2(tagP, ...messages));
}
var pointToBytes = (point) => point.toRawBytes(true).slice(1);
var numTo32b = (n) => numberToBytesBE(n, 32);
var modP = (x) => mod(x, secp256k1P);
var modN = (x) => mod(x, secp256k1N);
var Point = secp256k1.ProjectivePoint;
var GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b);
function schnorrGetExtPubKey(priv) {
  let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
  let p = Point.fromPrivateKey(d_);
  const scalar = p.hasEvenY() ? d_ : modN(-d_);
  return { scalar, bytes: pointToBytes(p) };
}
function lift_x(x) {
  if (!fe(x))
    throw new Error("bad x: need 0 < x < p");
  const xx = modP(x * x);
  const c = modP(xx * x + BigInt(7));
  let y = sqrtMod(c);
  if (y % _2n4 !== _0n5)
    y = modP(-y);
  const p = new Point(x, y, _1n5);
  p.assertValidity();
  return p;
}
function challenge(...args) {
  return modN(bytesToNumberBE(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(privateKey) {
  return schnorrGetExtPubKey(privateKey).bytes;
}
function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
  const m = ensureBytes("message", message);
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
  const a = ensureBytes("auxRand", auxRand, 32);
  const t = numTo32b(d ^ bytesToNumberBE(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const k_ = modN(bytesToNumberBE(rand));
  if (k_ === _0n5)
    throw new Error("sign failed: k is zero");
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(numTo32b(modN(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const sig = ensureBytes("signature", signature, 64);
  const m = ensureBytes("message", message);
  const pub = ensureBytes("publicKey", publicKey, 32);
  try {
    const P = lift_x(bytesToNumberBE(pub));
    const r = bytesToNumberBE(sig.subarray(0, 32));
    if (!fe(r))
      return false;
    const s = bytesToNumberBE(sig.subarray(32, 64));
    if (!ge(s))
      return false;
    const e = challenge(numTo32b(r), pointToBytes(P), m);
    const R = GmulAdd(P, s, modN(-e));
    if (!R || !R.hasEvenY() || R.toAffine().x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var schnorr = /* @__PURE__ */ (() => ({
  getPublicKey: schnorrGetPublicKey,
  sign: schnorrSign,
  verify: schnorrVerify,
  utils: {
    randomPrivateKey: secp256k1.utils.randomPrivateKey,
    lift_x,
    pointToBytes,
    numberToBytesBE,
    bytesToNumberBE,
    taggedHash,
    mod
  }
}))();

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/crypto.js
var crypto3 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : undefined;

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/utils.js
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var u8a3 = (a) => a instanceof Uint8Array;
var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
var createView2 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
var rotr2 = (word, shift) => word << 32 - shift | word >>> shift;
var isLE2 = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!isLE2)
  throw new Error("Non little-endian hardware is not supported");
var hexes2 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, "0"));
function bytesToHex2(bytes2) {
  if (!u8a3(bytes2))
    throw new Error("Uint8Array expected");
  let hex = "";
  for (let i = 0;i < bytes2.length; i++) {
    hex += hexes2[bytes2[i]];
  }
  return hex;
}
function hexToBytes3(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  const len = hex.length;
  if (len % 2)
    throw new Error("padded hex string expected, got unpadded hex of length " + len);
  const array = new Uint8Array(len / 2);
  for (let i = 0;i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0)
      throw new Error("Invalid byte sequence");
    array[i] = byte;
  }
  return array;
}
function utf8ToBytes3(str) {
  if (typeof str !== "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes3(data);
  if (!u8a3(data))
    throw new Error(`expected Uint8Array, got ${typeof data}`);
  return data;
}
function concatBytes3(...arrays) {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
  let pad = 0;
  arrays.forEach((a) => {
    if (!u8a3(a))
      throw new Error("Uint8Array expected");
    r.set(a, pad);
    pad += a.length;
  });
  return r;
}

class Hash2 {
  clone() {
    return this._cloneInto();
  }
}
var isPlainObject = (obj) => Object.prototype.toString.call(obj) === "[object Object]" && obj.constructor === Object;
function checkOpts(defaults, opts) {
  if (opts !== undefined && (typeof opts !== "object" || !isPlainObject(opts)))
    throw new Error("Options should be object or undefined");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function wrapConstructor2(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes2(bytesLength = 32) {
  if (crypto3 && typeof crypto3.getRandomValues === "function") {
    return crypto3.getRandomValues(new Uint8Array(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/_assert.js
function number2(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`Wrong positive integer: ${n}`);
}
function bool(b) {
  if (typeof b !== "boolean")
    throw new Error(`Expected boolean, not ${b}`);
}
function bytes2(b, ...lengths) {
  if (!(b instanceof Uint8Array))
    throw new Error("Expected Uint8Array");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
}
function hash2(hash3) {
  if (typeof hash3 !== "function" || typeof hash3.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  number2(hash3.outputLen);
  number2(hash3.blockLen);
}
function exists2(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function output2(out, instance) {
  bytes2(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}
var assert = {
  number: number2,
  bool,
  bytes: bytes2,
  hash: hash2,
  exists: exists2,
  output: output2
};
var _assert_default = assert;

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/_sha2.js
function setBigUint642(view, byteOffset, value, isLE3) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE3);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE3 ? 4 : 0;
  const l = isLE3 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE3);
  view.setUint32(byteOffset + l, wl, isLE3);
}

class SHA22 extends Hash2 {
  constructor(blockLen, outputLen, padOffset, isLE3) {
    super();
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE3;
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView2(this.buffer);
  }
  update(data) {
    _assert_default.exists(this);
    const { view, buffer, blockLen } = this;
    data = toBytes2(data);
    const len = data.length;
    for (let pos = 0;pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView2(data);
        for (;blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    _assert_default.exists(this);
    _assert_default.output(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE3 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    this.buffer.subarray(pos).fill(0);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos;i < blockLen; i++)
      buffer[i] = 0;
    setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE3);
    this.process(view, 0);
    const oview = createView2(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0;i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE3);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor);
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.length = length;
    to.pos = pos;
    to.finished = finished;
    to.destroyed = destroyed;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
}

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/sha256.js
var Chi2 = (a, b, c) => a & b ^ ~a & c;
var Maj2 = (a, b, c) => a & b ^ a & c ^ b & c;
var SHA256_K2 = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var IV2 = new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA256_W2 = new Uint32Array(64);

class SHA2562 extends SHA22 {
  constructor() {
    super(64, 32, 8, false);
    this.A = IV2[0] | 0;
    this.B = IV2[1] | 0;
    this.C = IV2[2] | 0;
    this.D = IV2[3] | 0;
    this.E = IV2[4] | 0;
    this.F = IV2[5] | 0;
    this.G = IV2[6] | 0;
    this.H = IV2[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0;i < 16; i++, offset += 4)
      SHA256_W2[i] = view.getUint32(offset, false);
    for (let i = 16;i < 64; i++) {
      const W15 = SHA256_W2[i - 15];
      const W2 = SHA256_W2[i - 2];
      const s0 = rotr2(W15, 7) ^ rotr2(W15, 18) ^ W15 >>> 3;
      const s1 = rotr2(W2, 17) ^ rotr2(W2, 19) ^ W2 >>> 10;
      SHA256_W2[i] = s1 + SHA256_W2[i - 7] + s0 + SHA256_W2[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0;i < 64; i++) {
      const sigma1 = rotr2(E, 6) ^ rotr2(E, 11) ^ rotr2(E, 25);
      const T1 = H + sigma1 + Chi2(E, F, G) + SHA256_K2[i] + SHA256_W2[i] | 0;
      const sigma0 = rotr2(A, 2) ^ rotr2(A, 13) ^ rotr2(A, 22);
      const T2 = sigma0 + Maj2(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    SHA256_W2.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    this.buffer.fill(0);
  }
}

class SHA224 extends SHA2562 {
  constructor() {
    super();
    this.A = 3238371032 | 0;
    this.B = 914150663 | 0;
    this.C = 812702999 | 0;
    this.D = 4144912697 | 0;
    this.E = 4290775857 | 0;
    this.F = 1750603025 | 0;
    this.G = 1694076839 | 0;
    this.H = 3204075428 | 0;
    this.outputLen = 28;
  }
}
var sha2562 = wrapConstructor2(() => new SHA2562);
var sha224 = wrapConstructor2(() => new SHA224);

// ../core/node_modules/nostr-tools/node_modules/@scure/base/lib/esm/index.js
/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function assertNumber(n) {
  if (!Number.isSafeInteger(n))
    throw new Error(`Wrong integer: ${n}`);
}
function chain(...args) {
  const wrap = (a, b) => (c) => a(b(c));
  const encode = Array.from(args).reverse().reduce((acc, i) => acc ? wrap(acc, i.encode) : i.encode, undefined);
  const decode = args.reduce((acc, i) => acc ? wrap(acc, i.decode) : i.decode, undefined);
  return { encode, decode };
}
function alphabet(alphabet2) {
  return {
    encode: (digits) => {
      if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
        throw new Error("alphabet.encode input should be an array of numbers");
      return digits.map((i) => {
        assertNumber(i);
        if (i < 0 || i >= alphabet2.length)
          throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet2.length})`);
        return alphabet2[i];
      });
    },
    decode: (input) => {
      if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
        throw new Error("alphabet.decode input should be array of strings");
      return input.map((letter) => {
        if (typeof letter !== "string")
          throw new Error(`alphabet.decode: not string element=${letter}`);
        const index = alphabet2.indexOf(letter);
        if (index === -1)
          throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet2}`);
        return index;
      });
    }
  };
}
function join(separator = "") {
  if (typeof separator !== "string")
    throw new Error("join separator should be string");
  return {
    encode: (from) => {
      if (!Array.isArray(from) || from.length && typeof from[0] !== "string")
        throw new Error("join.encode input should be array of strings");
      for (let i of from)
        if (typeof i !== "string")
          throw new Error(`join.encode: non-string input=${i}`);
      return from.join(separator);
    },
    decode: (to) => {
      if (typeof to !== "string")
        throw new Error("join.decode input should be string");
      return to.split(separator);
    }
  };
}
function padding(bits, chr = "=") {
  assertNumber(bits);
  if (typeof chr !== "string")
    throw new Error("padding chr should be string");
  return {
    encode(data) {
      if (!Array.isArray(data) || data.length && typeof data[0] !== "string")
        throw new Error("padding.encode input should be array of strings");
      for (let i of data)
        if (typeof i !== "string")
          throw new Error(`padding.encode: non-string input=${i}`);
      while (data.length * bits % 8)
        data.push(chr);
      return data;
    },
    decode(input) {
      if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
        throw new Error("padding.encode input should be array of strings");
      for (let i of input)
        if (typeof i !== "string")
          throw new Error(`padding.decode: non-string input=${i}`);
      let end = input.length;
      if (end * bits % 8)
        throw new Error("Invalid padding: string should have whole number of bytes");
      for (;end > 0 && input[end - 1] === chr; end--) {
        if (!((end - 1) * bits % 8))
          throw new Error("Invalid padding: string has too much padding");
      }
      return input.slice(0, end);
    }
  };
}
function normalize(fn) {
  if (typeof fn !== "function")
    throw new Error("normalize fn should be function");
  return { encode: (from) => from, decode: (to) => fn(to) };
}
function convertRadix(data, from, to) {
  if (from < 2)
    throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
  if (to < 2)
    throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
  if (!Array.isArray(data))
    throw new Error("convertRadix: data should be array");
  if (!data.length)
    return [];
  let pos = 0;
  const res = [];
  const digits = Array.from(data);
  digits.forEach((d) => {
    assertNumber(d);
    if (d < 0 || d >= from)
      throw new Error(`Wrong integer: ${d}`);
  });
  while (true) {
    let carry = 0;
    let done = true;
    for (let i = pos;i < digits.length; i++) {
      const digit = digits[i];
      const digitBase = from * carry + digit;
      if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
        throw new Error("convertRadix: carry overflow");
      }
      carry = digitBase % to;
      digits[i] = Math.floor(digitBase / to);
      if (!Number.isSafeInteger(digits[i]) || digits[i] * to + carry !== digitBase)
        throw new Error("convertRadix: carry overflow");
      if (!done)
        continue;
      else if (!digits[i])
        pos = i;
      else
        done = false;
    }
    res.push(carry);
    if (done)
      break;
  }
  for (let i = 0;i < data.length - 1 && data[i] === 0; i++)
    res.push(0);
  return res.reverse();
}
var gcd = (a, b) => !b ? a : gcd(b, a % b);
var radix2carry = (from, to) => from + (to - gcd(from, to));
function convertRadix2(data, from, to, padding2) {
  if (!Array.isArray(data))
    throw new Error("convertRadix2: data should be array");
  if (from <= 0 || from > 32)
    throw new Error(`convertRadix2: wrong from=${from}`);
  if (to <= 0 || to > 32)
    throw new Error(`convertRadix2: wrong to=${to}`);
  if (radix2carry(from, to) > 32) {
    throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`);
  }
  let carry = 0;
  let pos = 0;
  const mask = 2 ** to - 1;
  const res = [];
  for (const n of data) {
    assertNumber(n);
    if (n >= 2 ** from)
      throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
    carry = carry << from | n;
    if (pos + from > 32)
      throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
    pos += from;
    for (;pos >= to; pos -= to)
      res.push((carry >> pos - to & mask) >>> 0);
    carry &= 2 ** pos - 1;
  }
  carry = carry << to - pos & mask;
  if (!padding2 && pos >= from)
    throw new Error("Excess padding");
  if (!padding2 && carry)
    throw new Error(`Non-zero padding: ${carry}`);
  if (padding2 && pos > 0)
    res.push(carry >>> 0);
  return res;
}
function radix(num) {
  assertNumber(num);
  return {
    encode: (bytes3) => {
      if (!(bytes3 instanceof Uint8Array))
        throw new Error("radix.encode input should be Uint8Array");
      return convertRadix(Array.from(bytes3), 2 ** 8, num);
    },
    decode: (digits) => {
      if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
        throw new Error("radix.decode input should be array of strings");
      return Uint8Array.from(convertRadix(digits, num, 2 ** 8));
    }
  };
}
function radix2(bits, revPadding = false) {
  assertNumber(bits);
  if (bits <= 0 || bits > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (bytes3) => {
      if (!(bytes3 instanceof Uint8Array))
        throw new Error("radix2.encode input should be Uint8Array");
      return convertRadix2(Array.from(bytes3), 8, bits, !revPadding);
    },
    decode: (digits) => {
      if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
        throw new Error("radix2.decode input should be array of strings");
      return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
    }
  };
}
function unsafeWrapper(fn) {
  if (typeof fn !== "function")
    throw new Error("unsafeWrapper fn should be function");
  return function(...args) {
    try {
      return fn.apply(null, args);
    } catch (e) {}
  };
}
var base16 = chain(radix2(4), alphabet("0123456789ABCDEF"), join(""));
var base32 = chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding(5), join(""));
var base32hex = chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding(5), join(""));
var base32crockford = chain(radix2(5), alphabet("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), join(""), normalize((s) => s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1")));
var base64 = chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding(6), join(""));
var base64url = chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding(6), join(""));
var genBase58 = (abc) => chain(radix(58), alphabet(abc), join(""));
var base58 = genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
var base58flickr = genBase58("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ");
var base58xrp = genBase58("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
var XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
var base58xmr = {
  encode(data) {
    let res = "";
    for (let i = 0;i < data.length; i += 8) {
      const block = data.subarray(i, i + 8);
      res += base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], "1");
    }
    return res;
  },
  decode(str) {
    let res = [];
    for (let i = 0;i < str.length; i += 11) {
      const slice = str.slice(i, i + 11);
      const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
      const block = base58.decode(slice);
      for (let j = 0;j < block.length - blockLen; j++) {
        if (block[j] !== 0)
          throw new Error("base58xmr: wrong padding");
      }
      res = res.concat(Array.from(block.slice(block.length - blockLen)));
    }
    return Uint8Array.from(res);
  }
};
var BECH_ALPHABET = chain(alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), join(""));
var POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
function bech32Polymod(pre) {
  const b = pre >> 25;
  let chk = (pre & 33554431) << 5;
  for (let i = 0;i < POLYMOD_GENERATORS.length; i++) {
    if ((b >> i & 1) === 1)
      chk ^= POLYMOD_GENERATORS[i];
  }
  return chk;
}
function bechChecksum(prefix, words, encodingConst = 1) {
  const len = prefix.length;
  let chk = 1;
  for (let i = 0;i < len; i++) {
    const c = prefix.charCodeAt(i);
    if (c < 33 || c > 126)
      throw new Error(`Invalid prefix (${prefix})`);
    chk = bech32Polymod(chk) ^ c >> 5;
  }
  chk = bech32Polymod(chk);
  for (let i = 0;i < len; i++)
    chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 31;
  for (let v of words)
    chk = bech32Polymod(chk) ^ v;
  for (let i = 0;i < 6; i++)
    chk = bech32Polymod(chk);
  chk ^= encodingConst;
  return BECH_ALPHABET.encode(convertRadix2([chk % 2 ** 30], 30, 5, false));
}
function genBech32(encoding) {
  const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
  const _words = radix2(5);
  const fromWords = _words.decode;
  const toWords = _words.encode;
  const fromWordsUnsafe = unsafeWrapper(fromWords);
  function encode(prefix, words, limit = 90) {
    if (typeof prefix !== "string")
      throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
    if (!Array.isArray(words) || words.length && typeof words[0] !== "number")
      throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
    const actualLength = prefix.length + 7 + words.length;
    if (limit !== false && actualLength > limit)
      throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
    prefix = prefix.toLowerCase();
    return `${prefix}1${BECH_ALPHABET.encode(words)}${bechChecksum(prefix, words, ENCODING_CONST)}`;
  }
  function decode(str, limit = 90) {
    if (typeof str !== "string")
      throw new Error(`bech32.decode input should be string, not ${typeof str}`);
    if (str.length < 8 || limit !== false && str.length > limit)
      throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
    const lowered = str.toLowerCase();
    if (str !== lowered && str !== str.toUpperCase())
      throw new Error(`String must be lowercase or uppercase`);
    str = lowered;
    const sepIndex = str.lastIndexOf("1");
    if (sepIndex === 0 || sepIndex === -1)
      throw new Error(`Letter "1" must be present between prefix and data only`);
    const prefix = str.slice(0, sepIndex);
    const _words2 = str.slice(sepIndex + 1);
    if (_words2.length < 6)
      throw new Error("Data must be at least 6 characters long");
    const words = BECH_ALPHABET.decode(_words2).slice(0, -6);
    const sum = bechChecksum(prefix, words, ENCODING_CONST);
    if (!_words2.endsWith(sum))
      throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
    return { prefix, words };
  }
  const decodeUnsafe = unsafeWrapper(decode);
  function decodeToBytes(str) {
    const { prefix, words } = decode(str, false);
    return { prefix, words, bytes: fromWords(words) };
  }
  return { encode, decode, decodeToBytes, decodeUnsafe, fromWords, fromWordsUnsafe, toWords };
}
var bech32 = genBech32("bech32");
var bech32m = genBech32("bech32m");
var utf8 = {
  encode: (data) => new TextDecoder().decode(data),
  decode: (str) => new TextEncoder().encode(str)
};
var hex = chain(radix2(4), alphabet("0123456789abcdef"), join(""), normalize((s) => {
  if (typeof s !== "string" || s.length % 2)
    throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
  return s.toLowerCase();
}));
var CODERS = {
  utf8,
  hex,
  base16,
  base32,
  base64,
  base64url,
  base58,
  base58xmr
};
var coderTypeError = `Invalid encoding type. Available types: ${Object.keys(CODERS).join(", ")}`;

// ../node_modules/@noble/ciphers/esm/_assert.js
function number3(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`positive integer expected, not ${n}`);
}
function bool2(b) {
  if (typeof b !== "boolean")
    throw new Error(`boolean expected, not ${b}`);
}
function isBytes(a) {
  return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
}
function bytes3(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
}
function exists3(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function output3(out, instance) {
  bytes3(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}

// ../node_modules/@noble/ciphers/esm/utils.js
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
var u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
var u322 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
var createView3 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
var isLE3 = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!isLE3)
  throw new Error("Non little-endian hardware is not supported");
var hexes3 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex3(bytes4) {
  bytes3(bytes4);
  let hex2 = "";
  for (let i = 0;i < bytes4.length; i++) {
    hex2 += hexes3[bytes4[i]];
  }
  return hex2;
}
var asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
function asciiToBase16(char) {
  if (char >= asciis._0 && char <= asciis._9)
    return char - asciis._0;
  if (char >= asciis._A && char <= asciis._F)
    return char - (asciis._A - 10);
  if (char >= asciis._a && char <= asciis._f)
    return char - (asciis._a - 10);
  return;
}
function hexToBytes4(hex2) {
  if (typeof hex2 !== "string")
    throw new Error("hex string expected, got " + typeof hex2);
  const hl = hex2.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("padded hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex2.charCodeAt(hi));
    const n2 = asciiToBase16(hex2.charCodeAt(hi + 1));
    if (n1 === undefined || n2 === undefined) {
      const char = hex2[hi] + hex2[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function utf8ToBytes4(str) {
  if (typeof str !== "string")
    throw new Error(`string expected, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes3(data) {
  if (typeof data === "string")
    data = utf8ToBytes4(data);
  else if (isBytes(data))
    data = data.slice();
  else
    throw new Error(`Uint8Array expected, got ${typeof data}`);
  return data;
}
function checkOpts2(defaults, opts) {
  if (opts == null || typeof opts !== "object")
    throw new Error("options must be defined");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function equalBytes2(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0;i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
var wrapCipher = (params, c) => {
  Object.assign(c, params);
  return c;
};
function setBigUint643(view, byteOffset, value, isLE4) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE4);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE4 ? 4 : 0;
  const l = isLE4 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE4);
  view.setUint32(byteOffset + l, wl, isLE4);
}

// ../node_modules/@noble/ciphers/esm/_polyval.js
var BLOCK_SIZE = 16;
var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
var ZEROS32 = u322(ZEROS16);
var POLY = 225;
var mul2 = (s0, s1, s2, s3) => {
  const hiBit = s3 & 1;
  return {
    s3: s2 << 31 | s3 >>> 1,
    s2: s1 << 31 | s2 >>> 1,
    s1: s0 << 31 | s1 >>> 1,
    s0: s0 >>> 1 ^ POLY << 24 & -(hiBit & 1)
  };
};
var swapLE = (n) => (n >>> 0 & 255) << 24 | (n >>> 8 & 255) << 16 | (n >>> 16 & 255) << 8 | n >>> 24 & 255 | 0;
function _toGHASHKey(k) {
  k.reverse();
  const hiBit = k[15] & 1;
  let carry = 0;
  for (let i = 0;i < k.length; i++) {
    const t = k[i];
    k[i] = t >>> 1 | carry;
    carry = (t & 1) << 7;
  }
  k[0] ^= -hiBit & 225;
  return k;
}
var estimateWindow = (bytes4) => {
  if (bytes4 > 64 * 1024)
    return 8;
  if (bytes4 > 1024)
    return 4;
  return 2;
};

class GHASH {
  constructor(key, expectedLength) {
    this.blockLen = BLOCK_SIZE;
    this.outputLen = BLOCK_SIZE;
    this.s0 = 0;
    this.s1 = 0;
    this.s2 = 0;
    this.s3 = 0;
    this.finished = false;
    key = toBytes3(key);
    bytes3(key, 16);
    const kView = createView3(key);
    let k0 = kView.getUint32(0, false);
    let k1 = kView.getUint32(4, false);
    let k2 = kView.getUint32(8, false);
    let k3 = kView.getUint32(12, false);
    const doubles = [];
    for (let i = 0;i < 128; i++) {
      doubles.push({ s0: swapLE(k0), s1: swapLE(k1), s2: swapLE(k2), s3: swapLE(k3) });
      ({ s0: k0, s1: k1, s2: k2, s3: k3 } = mul2(k0, k1, k2, k3));
    }
    const W = estimateWindow(expectedLength || 1024);
    if (![1, 2, 4, 8].includes(W))
      throw new Error(`ghash: wrong window size=${W}, should be 2, 4 or 8`);
    this.W = W;
    const bits = 128;
    const windows = bits / W;
    const windowSize = this.windowSize = 2 ** W;
    const items = [];
    for (let w = 0;w < windows; w++) {
      for (let byte = 0;byte < windowSize; byte++) {
        let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
        for (let j = 0;j < W; j++) {
          const bit = byte >>> W - j - 1 & 1;
          if (!bit)
            continue;
          const { s0: d0, s1: d1, s2: d2, s3: d3 } = doubles[W * w + j];
          s0 ^= d0, s1 ^= d1, s2 ^= d2, s3 ^= d3;
        }
        items.push({ s0, s1, s2, s3 });
      }
    }
    this.t = items;
  }
  _updateBlock(s0, s1, s2, s3) {
    s0 ^= this.s0, s1 ^= this.s1, s2 ^= this.s2, s3 ^= this.s3;
    const { W, t, windowSize } = this;
    let o0 = 0, o1 = 0, o2 = 0, o3 = 0;
    const mask = (1 << W) - 1;
    let w = 0;
    for (const num of [s0, s1, s2, s3]) {
      for (let bytePos = 0;bytePos < 4; bytePos++) {
        const byte = num >>> 8 * bytePos & 255;
        for (let bitPos = 8 / W - 1;bitPos >= 0; bitPos--) {
          const bit = byte >>> W * bitPos & mask;
          const { s0: e0, s1: e1, s2: e2, s3: e3 } = t[w * windowSize + bit];
          o0 ^= e0, o1 ^= e1, o2 ^= e2, o3 ^= e3;
          w += 1;
        }
      }
    }
    this.s0 = o0;
    this.s1 = o1;
    this.s2 = o2;
    this.s3 = o3;
  }
  update(data) {
    data = toBytes3(data);
    exists3(this);
    const b32 = u322(data);
    const blocks = Math.floor(data.length / BLOCK_SIZE);
    const left = data.length % BLOCK_SIZE;
    for (let i = 0;i < blocks; i++) {
      this._updateBlock(b32[i * 4 + 0], b32[i * 4 + 1], b32[i * 4 + 2], b32[i * 4 + 3]);
    }
    if (left) {
      ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
      this._updateBlock(ZEROS32[0], ZEROS32[1], ZEROS32[2], ZEROS32[3]);
      ZEROS32.fill(0);
    }
    return this;
  }
  destroy() {
    const { t } = this;
    for (const elm of t) {
      elm.s0 = 0, elm.s1 = 0, elm.s2 = 0, elm.s3 = 0;
    }
  }
  digestInto(out) {
    exists3(this);
    output3(out, this);
    this.finished = true;
    const { s0, s1, s2, s3 } = this;
    const o32 = u322(out);
    o32[0] = s0;
    o32[1] = s1;
    o32[2] = s2;
    o32[3] = s3;
    return out;
  }
  digest() {
    const res = new Uint8Array(BLOCK_SIZE);
    this.digestInto(res);
    this.destroy();
    return res;
  }
}

class Polyval extends GHASH {
  constructor(key, expectedLength) {
    key = toBytes3(key);
    const ghKey = _toGHASHKey(key.slice());
    super(ghKey, expectedLength);
    ghKey.fill(0);
  }
  update(data) {
    data = toBytes3(data);
    exists3(this);
    const b32 = u322(data);
    const left = data.length % BLOCK_SIZE;
    const blocks = Math.floor(data.length / BLOCK_SIZE);
    for (let i = 0;i < blocks; i++) {
      this._updateBlock(swapLE(b32[i * 4 + 3]), swapLE(b32[i * 4 + 2]), swapLE(b32[i * 4 + 1]), swapLE(b32[i * 4 + 0]));
    }
    if (left) {
      ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
      this._updateBlock(swapLE(ZEROS32[3]), swapLE(ZEROS32[2]), swapLE(ZEROS32[1]), swapLE(ZEROS32[0]));
      ZEROS32.fill(0);
    }
    return this;
  }
  digestInto(out) {
    exists3(this);
    output3(out, this);
    this.finished = true;
    const { s0, s1, s2, s3 } = this;
    const o32 = u322(out);
    o32[0] = s0;
    o32[1] = s1;
    o32[2] = s2;
    o32[3] = s3;
    return out.reverse();
  }
}
function wrapConstructorWithKey(hashCons) {
  const hashC = (msg, key) => hashCons(key, msg.length).update(toBytes3(msg)).digest();
  const tmp = hashCons(new Uint8Array(16), 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (key, expectedLength) => hashCons(key, expectedLength);
  return hashC;
}
var ghash = wrapConstructorWithKey((key, expectedLength) => new GHASH(key, expectedLength));
var polyval = wrapConstructorWithKey((key, expectedLength) => new Polyval(key, expectedLength));

// ../node_modules/@noble/ciphers/esm/aes.js
var BLOCK_SIZE2 = 16;
var BLOCK_SIZE32 = 4;
var EMPTY_BLOCK = new Uint8Array(BLOCK_SIZE2);
var POLY2 = 283;
function mul22(n) {
  return n << 1 ^ POLY2 & -(n >> 7);
}
function mul(a, b) {
  let res = 0;
  for (;b > 0; b >>= 1) {
    res ^= a & -(b & 1);
    a = mul22(a);
  }
  return res;
}
var sbox = /* @__PURE__ */ (() => {
  let t = new Uint8Array(256);
  for (let i = 0, x = 1;i < 256; i++, x ^= mul22(x))
    t[i] = x;
  const box = new Uint8Array(256);
  box[0] = 99;
  for (let i = 0;i < 255; i++) {
    let x = t[255 - i];
    x |= x << 8;
    box[t[i]] = (x ^ x >> 4 ^ x >> 5 ^ x >> 6 ^ x >> 7 ^ 99) & 255;
  }
  return box;
})();
var invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j));
var rotr32_8 = (n) => n << 24 | n >>> 8;
var rotl32_8 = (n) => n << 8 | n >>> 24;
function genTtable(sbox2, fn) {
  if (sbox2.length !== 256)
    throw new Error("Wrong sbox length");
  const T0 = new Uint32Array(256).map((_, j) => fn(sbox2[j]));
  const T1 = T0.map(rotl32_8);
  const T2 = T1.map(rotl32_8);
  const T3 = T2.map(rotl32_8);
  const T01 = new Uint32Array(256 * 256);
  const T23 = new Uint32Array(256 * 256);
  const sbox22 = new Uint16Array(256 * 256);
  for (let i = 0;i < 256; i++) {
    for (let j = 0;j < 256; j++) {
      const idx = i * 256 + j;
      T01[idx] = T0[i] ^ T1[j];
      T23[idx] = T2[i] ^ T3[j];
      sbox22[idx] = sbox2[i] << 8 | sbox2[j];
    }
  }
  return { sbox: sbox2, sbox2: sbox22, T0, T1, T2, T3, T01, T23 };
}
var tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => mul(s, 3) << 24 | s << 16 | s << 8 | mul(s, 2));
var tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => mul(s, 11) << 24 | mul(s, 13) << 16 | mul(s, 9) << 8 | mul(s, 14));
var xPowers = /* @__PURE__ */ (() => {
  const p = new Uint8Array(16);
  for (let i = 0, x = 1;i < 16; i++, x = mul22(x))
    p[i] = x;
  return p;
})();
function expandKeyLE(key) {
  bytes3(key);
  const len = key.length;
  if (![16, 24, 32].includes(len))
    throw new Error(`aes: wrong key size: should be 16, 24 or 32, got: ${len}`);
  const { sbox2 } = tableEncoding;
  const k32 = u322(key);
  const Nk = k32.length;
  const subByte = (n) => applySbox(sbox2, n, n, n, n);
  const xk = new Uint32Array(len + 28);
  xk.set(k32);
  for (let i = Nk;i < xk.length; i++) {
    let t = xk[i - 1];
    if (i % Nk === 0)
      t = subByte(rotr32_8(t)) ^ xPowers[i / Nk - 1];
    else if (Nk > 6 && i % Nk === 4)
      t = subByte(t);
    xk[i] = xk[i - Nk] ^ t;
  }
  return xk;
}
function expandKeyDecLE(key) {
  const encKey = expandKeyLE(key);
  const xk = encKey.slice();
  const Nk = encKey.length;
  const { sbox2 } = tableEncoding;
  const { T0, T1, T2, T3 } = tableDecoding;
  for (let i = 0;i < Nk; i += 4) {
    for (let j = 0;j < 4; j++)
      xk[i + j] = encKey[Nk - i - 4 + j];
  }
  encKey.fill(0);
  for (let i = 4;i < Nk - 4; i++) {
    const x = xk[i];
    const w = applySbox(sbox2, x, x, x, x);
    xk[i] = T0[w & 255] ^ T1[w >>> 8 & 255] ^ T2[w >>> 16 & 255] ^ T3[w >>> 24];
  }
  return xk;
}
function apply0123(T01, T23, s0, s1, s2, s3) {
  return T01[s0 << 8 & 65280 | s1 >>> 8 & 255] ^ T23[s2 >>> 8 & 65280 | s3 >>> 24 & 255];
}
function applySbox(sbox2, s0, s1, s2, s3) {
  return sbox2[s0 & 255 | s1 & 65280] | sbox2[s2 >>> 16 & 255 | s3 >>> 16 & 65280] << 16;
}
function encrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableEncoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i = 0;i < rounds; i++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function decrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableDecoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i = 0;i < rounds; i++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function getDst(len, dst) {
  if (!dst)
    return new Uint8Array(len);
  bytes3(dst);
  if (dst.length < len)
    throw new Error(`aes: wrong destination length, expected at least ${len}, got: ${dst.length}`);
  return dst;
}
function ctrCounter(xk, nonce, src, dst) {
  bytes3(nonce, BLOCK_SIZE2);
  bytes3(src);
  const srcLen = src.length;
  dst = getDst(srcLen, dst);
  const ctr = nonce;
  const c32 = u322(ctr);
  let { s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]);
  const src32 = u322(src);
  const dst32 = u322(dst);
  for (let i = 0;i + 4 <= src32.length; i += 4) {
    dst32[i + 0] = src32[i + 0] ^ s0;
    dst32[i + 1] = src32[i + 1] ^ s1;
    dst32[i + 2] = src32[i + 2] ^ s2;
    dst32[i + 3] = src32[i + 3] ^ s3;
    let carry = 1;
    for (let i2 = ctr.length - 1;i2 >= 0; i2--) {
      carry = carry + (ctr[i2] & 255) | 0;
      ctr[i2] = carry & 255;
      carry >>>= 8;
    }
    ({ s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]));
  }
  const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
  if (start < srcLen) {
    const b32 = new Uint32Array([s0, s1, s2, s3]);
    const buf = u8(b32);
    for (let i = start, pos = 0;i < srcLen; i++, pos++)
      dst[i] = src[i] ^ buf[pos];
  }
  return dst;
}
function ctr32(xk, isLE4, nonce, src, dst) {
  bytes3(nonce, BLOCK_SIZE2);
  bytes3(src);
  dst = getDst(src.length, dst);
  const ctr = nonce;
  const c32 = u322(ctr);
  const view = createView3(ctr);
  const src32 = u322(src);
  const dst32 = u322(dst);
  const ctrPos = isLE4 ? 0 : 12;
  const srcLen = src.length;
  let ctrNum = view.getUint32(ctrPos, isLE4);
  let { s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]);
  for (let i = 0;i + 4 <= src32.length; i += 4) {
    dst32[i + 0] = src32[i + 0] ^ s0;
    dst32[i + 1] = src32[i + 1] ^ s1;
    dst32[i + 2] = src32[i + 2] ^ s2;
    dst32[i + 3] = src32[i + 3] ^ s3;
    ctrNum = ctrNum + 1 >>> 0;
    view.setUint32(ctrPos, ctrNum, isLE4);
    ({ s0, s1, s2, s3 } = encrypt(xk, c32[0], c32[1], c32[2], c32[3]));
  }
  const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
  if (start < srcLen) {
    const b32 = new Uint32Array([s0, s1, s2, s3]);
    const buf = u8(b32);
    for (let i = start, pos = 0;i < srcLen; i++, pos++)
      dst[i] = src[i] ^ buf[pos];
  }
  return dst;
}
var ctr = wrapCipher({ blockSize: 16, nonceLength: 16 }, function ctr2(key, nonce) {
  bytes3(key);
  bytes3(nonce, BLOCK_SIZE2);
  function processCtr(buf, dst) {
    const xk = expandKeyLE(key);
    const n = nonce.slice();
    const out = ctrCounter(xk, n, buf, dst);
    xk.fill(0);
    n.fill(0);
    return out;
  }
  return {
    encrypt: (plaintext, dst) => processCtr(plaintext, dst),
    decrypt: (ciphertext, dst) => processCtr(ciphertext, dst)
  };
});
function validateBlockDecrypt(data) {
  bytes3(data);
  if (data.length % BLOCK_SIZE2 !== 0) {
    throw new Error(`aes/(cbc-ecb).decrypt ciphertext should consist of blocks with size ${BLOCK_SIZE2}`);
  }
}
function validateBlockEncrypt(plaintext, pcks5, dst) {
  let outLen = plaintext.length;
  const remaining = outLen % BLOCK_SIZE2;
  if (!pcks5 && remaining !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  const b = u322(plaintext);
  if (pcks5) {
    let left = BLOCK_SIZE2 - remaining;
    if (!left)
      left = BLOCK_SIZE2;
    outLen = outLen + left;
  }
  const out = getDst(outLen, dst);
  const o = u322(out);
  return { b, o, out };
}
function validatePCKS(data, pcks5) {
  if (!pcks5)
    return data;
  const len = data.length;
  if (!len)
    throw new Error(`aes/pcks5: empty ciphertext not allowed`);
  const lastByte = data[len - 1];
  if (lastByte <= 0 || lastByte > 16)
    throw new Error(`aes/pcks5: wrong padding byte: ${lastByte}`);
  const out = data.subarray(0, -lastByte);
  for (let i = 0;i < lastByte; i++)
    if (data[len - i - 1] !== lastByte)
      throw new Error(`aes/pcks5: wrong padding`);
  return out;
}
function padPCKS(left) {
  const tmp = new Uint8Array(16);
  const tmp32 = u322(tmp);
  tmp.set(left);
  const paddingByte = BLOCK_SIZE2 - left.length;
  for (let i = BLOCK_SIZE2 - paddingByte;i < BLOCK_SIZE2; i++)
    tmp[i] = paddingByte;
  return tmp32;
}
var ecb = wrapCipher({ blockSize: 16 }, function ecb2(key, opts = {}) {
  bytes3(key);
  const pcks5 = !opts.disablePadding;
  return {
    encrypt: (plaintext, dst) => {
      bytes3(plaintext);
      const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
      const xk = expandKeyLE(key);
      let i = 0;
      for (;i + 4 <= b.length; ) {
        const { s0, s1, s2, s3 } = encrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
        o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
      }
      if (pcks5) {
        const tmp32 = padPCKS(plaintext.subarray(i * 4));
        const { s0, s1, s2, s3 } = encrypt(xk, tmp32[0], tmp32[1], tmp32[2], tmp32[3]);
        o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
      }
      xk.fill(0);
      return _out;
    },
    decrypt: (ciphertext, dst) => {
      validateBlockDecrypt(ciphertext);
      const xk = expandKeyDecLE(key);
      const out = getDst(ciphertext.length, dst);
      const b = u322(ciphertext);
      const o = u322(out);
      for (let i = 0;i + 4 <= b.length; ) {
        const { s0, s1, s2, s3 } = decrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
        o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
      }
      xk.fill(0);
      return validatePCKS(out, pcks5);
    }
  };
});
var cbc = wrapCipher({ blockSize: 16, nonceLength: 16 }, function cbc2(key, iv, opts = {}) {
  bytes3(key);
  bytes3(iv, 16);
  const pcks5 = !opts.disablePadding;
  return {
    encrypt: (plaintext, dst) => {
      const xk = expandKeyLE(key);
      const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
      const n32 = u322(iv);
      let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
      let i = 0;
      for (;i + 4 <= b.length; ) {
        s0 ^= b[i + 0], s1 ^= b[i + 1], s2 ^= b[i + 2], s3 ^= b[i + 3];
        ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
        o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
      }
      if (pcks5) {
        const tmp32 = padPCKS(plaintext.subarray(i * 4));
        s0 ^= tmp32[0], s1 ^= tmp32[1], s2 ^= tmp32[2], s3 ^= tmp32[3];
        ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
        o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
      }
      xk.fill(0);
      return _out;
    },
    decrypt: (ciphertext, dst) => {
      validateBlockDecrypt(ciphertext);
      const xk = expandKeyDecLE(key);
      const n32 = u322(iv);
      const out = getDst(ciphertext.length, dst);
      const b = u322(ciphertext);
      const o = u322(out);
      let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
      for (let i = 0;i + 4 <= b.length; ) {
        const ps0 = s0, ps1 = s1, ps2 = s2, ps3 = s3;
        s0 = b[i + 0], s1 = b[i + 1], s2 = b[i + 2], s3 = b[i + 3];
        const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt(xk, s0, s1, s2, s3);
        o[i++] = o0 ^ ps0, o[i++] = o1 ^ ps1, o[i++] = o2 ^ ps2, o[i++] = o3 ^ ps3;
      }
      xk.fill(0);
      return validatePCKS(out, pcks5);
    }
  };
});
var cfb = wrapCipher({ blockSize: 16, nonceLength: 16 }, function cfb2(key, iv) {
  bytes3(key);
  bytes3(iv, 16);
  function processCfb(src, isEncrypt, dst) {
    const xk = expandKeyLE(key);
    const srcLen = src.length;
    dst = getDst(srcLen, dst);
    const src32 = u322(src);
    const dst32 = u322(dst);
    const next32 = isEncrypt ? dst32 : src32;
    const n32 = u322(iv);
    let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
    for (let i = 0;i + 4 <= src32.length; ) {
      const { s0: e0, s1: e1, s2: e2, s3: e3 } = encrypt(xk, s0, s1, s2, s3);
      dst32[i + 0] = src32[i + 0] ^ e0;
      dst32[i + 1] = src32[i + 1] ^ e1;
      dst32[i + 2] = src32[i + 2] ^ e2;
      dst32[i + 3] = src32[i + 3] ^ e3;
      s0 = next32[i++], s1 = next32[i++], s2 = next32[i++], s3 = next32[i++];
    }
    const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
    if (start < srcLen) {
      ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
      const buf = u8(new Uint32Array([s0, s1, s2, s3]));
      for (let i = start, pos = 0;i < srcLen; i++, pos++)
        dst[i] = src[i] ^ buf[pos];
      buf.fill(0);
    }
    xk.fill(0);
    return dst;
  }
  return {
    encrypt: (plaintext, dst) => processCfb(plaintext, true, dst),
    decrypt: (ciphertext, dst) => processCfb(ciphertext, false, dst)
  };
});
function computeTag(fn, isLE4, key, data, AAD) {
  const h = fn.create(key, data.length + (AAD?.length || 0));
  if (AAD)
    h.update(AAD);
  h.update(data);
  const num = new Uint8Array(16);
  const view = createView3(num);
  if (AAD)
    setBigUint643(view, 0, BigInt(AAD.length * 8), isLE4);
  setBigUint643(view, 8, BigInt(data.length * 8), isLE4);
  h.update(num);
  return h.digest();
}
var gcm = wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16 }, function gcm2(key, nonce, AAD) {
  bytes3(nonce);
  if (nonce.length === 0)
    throw new Error("aes/gcm: empty nonce");
  const tagLength = 16;
  function _computeTag(authKey, tagMask, data) {
    const tag = computeTag(ghash, false, authKey, data, AAD);
    for (let i = 0;i < tagMask.length; i++)
      tag[i] ^= tagMask[i];
    return tag;
  }
  function deriveKeys() {
    const xk = expandKeyLE(key);
    const authKey = EMPTY_BLOCK.slice();
    const counter = EMPTY_BLOCK.slice();
    ctr32(xk, false, counter, counter, authKey);
    if (nonce.length === 12) {
      counter.set(nonce);
    } else {
      const nonceLen = EMPTY_BLOCK.slice();
      const view = createView3(nonceLen);
      setBigUint643(view, 8, BigInt(nonce.length * 8), false);
      ghash.create(authKey).update(nonce).update(nonceLen).digestInto(counter);
    }
    const tagMask = ctr32(xk, false, counter, EMPTY_BLOCK);
    return { xk, authKey, counter, tagMask };
  }
  return {
    encrypt: (plaintext) => {
      bytes3(plaintext);
      const { xk, authKey, counter, tagMask } = deriveKeys();
      const out = new Uint8Array(plaintext.length + tagLength);
      ctr32(xk, false, counter, plaintext, out);
      const tag = _computeTag(authKey, tagMask, out.subarray(0, out.length - tagLength));
      out.set(tag, plaintext.length);
      xk.fill(0);
      return out;
    },
    decrypt: (ciphertext) => {
      bytes3(ciphertext);
      if (ciphertext.length < tagLength)
        throw new Error(`aes/gcm: ciphertext less than tagLen (${tagLength})`);
      const { xk, authKey, counter, tagMask } = deriveKeys();
      const data = ciphertext.subarray(0, -tagLength);
      const passedTag = ciphertext.subarray(-tagLength);
      const tag = _computeTag(authKey, tagMask, data);
      if (!equalBytes2(tag, passedTag))
        throw new Error("aes/gcm: invalid ghash tag");
      const out = ctr32(xk, false, counter, data);
      authKey.fill(0);
      tagMask.fill(0);
      xk.fill(0);
      return out;
    }
  };
});
var limit = (name, min, max) => (value) => {
  if (!Number.isSafeInteger(value) || min > value || value > max)
    throw new Error(`${name}: invalid value=${value}, must be [${min}..${max}]`);
};
var siv = wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16 }, function siv2(key, nonce, AAD) {
  const tagLength = 16;
  const AAD_LIMIT = limit("AAD", 0, 2 ** 36);
  const PLAIN_LIMIT = limit("plaintext", 0, 2 ** 36);
  const NONCE_LIMIT = limit("nonce", 12, 12);
  const CIPHER_LIMIT = limit("ciphertext", 16, 2 ** 36 + 16);
  bytes3(nonce);
  NONCE_LIMIT(nonce.length);
  if (AAD) {
    bytes3(AAD);
    AAD_LIMIT(AAD.length);
  }
  function deriveKeys() {
    const len = key.length;
    if (len !== 16 && len !== 24 && len !== 32)
      throw new Error(`key length must be 16, 24 or 32 bytes, got: ${len} bytes`);
    const xk = expandKeyLE(key);
    const encKey = new Uint8Array(len);
    const authKey = new Uint8Array(16);
    const n32 = u322(nonce);
    let s0 = 0, s1 = n32[0], s2 = n32[1], s3 = n32[2];
    let counter = 0;
    for (const derivedKey of [authKey, encKey].map(u322)) {
      const d32 = u322(derivedKey);
      for (let i = 0;i < d32.length; i += 2) {
        const { s0: o0, s1: o1 } = encrypt(xk, s0, s1, s2, s3);
        d32[i + 0] = o0;
        d32[i + 1] = o1;
        s0 = ++counter;
      }
    }
    xk.fill(0);
    return { authKey, encKey: expandKeyLE(encKey) };
  }
  function _computeTag(encKey, authKey, data) {
    const tag = computeTag(polyval, true, authKey, data, AAD);
    for (let i = 0;i < 12; i++)
      tag[i] ^= nonce[i];
    tag[15] &= 127;
    const t32 = u322(tag);
    let s0 = t32[0], s1 = t32[1], s2 = t32[2], s3 = t32[3];
    ({ s0, s1, s2, s3 } = encrypt(encKey, s0, s1, s2, s3));
    t32[0] = s0, t32[1] = s1, t32[2] = s2, t32[3] = s3;
    return tag;
  }
  function processSiv(encKey, tag, input) {
    let block = tag.slice();
    block[15] |= 128;
    return ctr32(encKey, true, block, input);
  }
  return {
    encrypt: (plaintext) => {
      bytes3(plaintext);
      PLAIN_LIMIT(plaintext.length);
      const { encKey, authKey } = deriveKeys();
      const tag = _computeTag(encKey, authKey, plaintext);
      const out = new Uint8Array(plaintext.length + tagLength);
      out.set(tag, plaintext.length);
      out.set(processSiv(encKey, tag, plaintext));
      encKey.fill(0);
      authKey.fill(0);
      return out;
    },
    decrypt: (ciphertext) => {
      bytes3(ciphertext);
      CIPHER_LIMIT(ciphertext.length);
      const tag = ciphertext.subarray(-tagLength);
      const { encKey, authKey } = deriveKeys();
      const plaintext = processSiv(encKey, tag, ciphertext.subarray(0, -tagLength));
      const expectedTag = _computeTag(encKey, authKey, plaintext);
      encKey.fill(0);
      authKey.fill(0);
      if (!equalBytes2(tag, expectedTag))
        throw new Error("invalid polyval tag");
      return plaintext;
    }
  };
});

// ../node_modules/@noble/ciphers/esm/_poly1305.js
var u8to16 = (a, i) => a[i++] & 255 | (a[i++] & 255) << 8;

class Poly1305 {
  constructor(key) {
    this.blockLen = 16;
    this.outputLen = 16;
    this.buffer = new Uint8Array(16);
    this.r = new Uint16Array(10);
    this.h = new Uint16Array(10);
    this.pad = new Uint16Array(8);
    this.pos = 0;
    this.finished = false;
    key = toBytes3(key);
    bytes3(key, 32);
    const t0 = u8to16(key, 0);
    const t1 = u8to16(key, 2);
    const t2 = u8to16(key, 4);
    const t3 = u8to16(key, 6);
    const t4 = u8to16(key, 8);
    const t5 = u8to16(key, 10);
    const t6 = u8to16(key, 12);
    const t7 = u8to16(key, 14);
    this.r[0] = t0 & 8191;
    this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
    this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
    this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
    this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
    this.r[5] = t4 >>> 1 & 8190;
    this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
    this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
    this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
    this.r[9] = t7 >>> 5 & 127;
    for (let i = 0;i < 8; i++)
      this.pad[i] = u8to16(key, 16 + 2 * i);
  }
  process(data, offset, isLast = false) {
    const hibit = isLast ? 0 : 1 << 11;
    const { h, r } = this;
    const r0 = r[0];
    const r1 = r[1];
    const r2 = r[2];
    const r3 = r[3];
    const r4 = r[4];
    const r5 = r[5];
    const r6 = r[6];
    const r7 = r[7];
    const r8 = r[8];
    const r9 = r[9];
    const t0 = u8to16(data, offset + 0);
    const t1 = u8to16(data, offset + 2);
    const t2 = u8to16(data, offset + 4);
    const t3 = u8to16(data, offset + 6);
    const t4 = u8to16(data, offset + 8);
    const t5 = u8to16(data, offset + 10);
    const t6 = u8to16(data, offset + 12);
    const t7 = u8to16(data, offset + 14);
    let h0 = h[0] + (t0 & 8191);
    let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
    let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
    let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
    let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
    let h5 = h[5] + (t4 >>> 1 & 8191);
    let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
    let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
    let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
    let h9 = h[9] + (t7 >>> 5 | hibit);
    let c = 0;
    let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
    c = d0 >>> 13;
    d0 &= 8191;
    d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
    c += d0 >>> 13;
    d0 &= 8191;
    let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
    c = d1 >>> 13;
    d1 &= 8191;
    d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
    c += d1 >>> 13;
    d1 &= 8191;
    let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
    c = d2 >>> 13;
    d2 &= 8191;
    d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
    c += d2 >>> 13;
    d2 &= 8191;
    let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
    c = d3 >>> 13;
    d3 &= 8191;
    d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
    c += d3 >>> 13;
    d3 &= 8191;
    let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
    c = d4 >>> 13;
    d4 &= 8191;
    d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
    c += d4 >>> 13;
    d4 &= 8191;
    let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
    c = d5 >>> 13;
    d5 &= 8191;
    d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
    c += d5 >>> 13;
    d5 &= 8191;
    let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
    c = d6 >>> 13;
    d6 &= 8191;
    d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
    c += d6 >>> 13;
    d6 &= 8191;
    let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
    c = d7 >>> 13;
    d7 &= 8191;
    d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
    c += d7 >>> 13;
    d7 &= 8191;
    let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
    c = d8 >>> 13;
    d8 &= 8191;
    d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
    c += d8 >>> 13;
    d8 &= 8191;
    let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
    c = d9 >>> 13;
    d9 &= 8191;
    d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
    c += d9 >>> 13;
    d9 &= 8191;
    c = (c << 2) + c | 0;
    c = c + d0 | 0;
    d0 = c & 8191;
    c = c >>> 13;
    d1 += c;
    h[0] = d0;
    h[1] = d1;
    h[2] = d2;
    h[3] = d3;
    h[4] = d4;
    h[5] = d5;
    h[6] = d6;
    h[7] = d7;
    h[8] = d8;
    h[9] = d9;
  }
  finalize() {
    const { h, pad } = this;
    const g = new Uint16Array(10);
    let c = h[1] >>> 13;
    h[1] &= 8191;
    for (let i = 2;i < 10; i++) {
      h[i] += c;
      c = h[i] >>> 13;
      h[i] &= 8191;
    }
    h[0] += c * 5;
    c = h[0] >>> 13;
    h[0] &= 8191;
    h[1] += c;
    c = h[1] >>> 13;
    h[1] &= 8191;
    h[2] += c;
    g[0] = h[0] + 5;
    c = g[0] >>> 13;
    g[0] &= 8191;
    for (let i = 1;i < 10; i++) {
      g[i] = h[i] + c;
      c = g[i] >>> 13;
      g[i] &= 8191;
    }
    g[9] -= 1 << 13;
    let mask = (c ^ 1) - 1;
    for (let i = 0;i < 10; i++)
      g[i] &= mask;
    mask = ~mask;
    for (let i = 0;i < 10; i++)
      h[i] = h[i] & mask | g[i];
    h[0] = (h[0] | h[1] << 13) & 65535;
    h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
    h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
    h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
    h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
    h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
    h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
    h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
    let f = h[0] + pad[0];
    h[0] = f & 65535;
    for (let i = 1;i < 8; i++) {
      f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
      h[i] = f & 65535;
    }
  }
  update(data) {
    exists3(this);
    const { buffer, blockLen } = this;
    data = toBytes3(data);
    const len = data.length;
    for (let pos = 0;pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        for (;blockLen <= len - pos; pos += blockLen)
          this.process(data, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(buffer, 0, false);
        this.pos = 0;
      }
    }
    return this;
  }
  destroy() {
    this.h.fill(0);
    this.r.fill(0);
    this.buffer.fill(0);
    this.pad.fill(0);
  }
  digestInto(out) {
    exists3(this);
    output3(out, this);
    this.finished = true;
    const { buffer, h } = this;
    let { pos } = this;
    if (pos) {
      buffer[pos++] = 1;
      for (;pos < 16; pos++)
        buffer[pos] = 0;
      this.process(buffer, 0, true);
    }
    this.finalize();
    let opos = 0;
    for (let i = 0;i < 8; i++) {
      out[opos++] = h[i] >>> 0;
      out[opos++] = h[i] >>> 8;
    }
    return out;
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
}
function wrapConstructorWithKey2(hashCons) {
  const hashC = (msg, key) => hashCons(key).update(toBytes3(msg)).digest();
  const tmp = hashCons(new Uint8Array(32));
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (key) => hashCons(key);
  return hashC;
}
var poly1305 = wrapConstructorWithKey2((key) => new Poly1305(key));

// ../node_modules/@noble/ciphers/esm/_arx.js
var _utf8ToBytes = (str) => Uint8Array.from(str.split("").map((c) => c.charCodeAt(0)));
var sigma16 = _utf8ToBytes("expand 16-byte k");
var sigma32 = _utf8ToBytes("expand 32-byte k");
var sigma16_32 = u322(sigma16);
var sigma32_32 = u322(sigma32);
var sigma = sigma32_32.slice();
function rotl(a, b) {
  return a << b | a >>> 32 - b;
}
function isAligned32(b) {
  return b.byteOffset % 4 === 0;
}
var BLOCK_LEN = 64;
var BLOCK_LEN32 = 16;
var MAX_COUNTER = 2 ** 32 - 1;
var U32_EMPTY = new Uint32Array;
function runCipher(core, sigma2, key, nonce, data, output4, counter, rounds) {
  const len = data.length;
  const block = new Uint8Array(BLOCK_LEN);
  const b32 = u322(block);
  const isAligned = isAligned32(data) && isAligned32(output4);
  const d32 = isAligned ? u322(data) : U32_EMPTY;
  const o32 = isAligned ? u322(output4) : U32_EMPTY;
  for (let pos = 0;pos < len; counter++) {
    core(sigma2, key, nonce, b32, counter, rounds);
    if (counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    const take = Math.min(BLOCK_LEN, len - pos);
    if (isAligned && take === BLOCK_LEN) {
      const pos32 = pos / 4;
      if (pos % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let j = 0, posj;j < BLOCK_LEN32; j++) {
        posj = pos32 + j;
        o32[posj] = d32[posj] ^ b32[j];
      }
      pos += BLOCK_LEN;
      continue;
    }
    for (let j = 0, posj;j < take; j++) {
      posj = pos + j;
      output4[posj] = data[posj] ^ block[j];
    }
    pos += take;
  }
}
function createCipher(core, opts) {
  const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts2({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts);
  if (typeof core !== "function")
    throw new Error("core must be a function");
  number3(counterLength);
  number3(rounds);
  bool2(counterRight);
  bool2(allowShortKeys);
  return (key, nonce, data, output4, counter = 0) => {
    bytes3(key);
    bytes3(nonce);
    bytes3(data);
    const len = data.length;
    if (!output4)
      output4 = new Uint8Array(len);
    bytes3(output4);
    number3(counter);
    if (counter < 0 || counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    if (output4.length < len)
      throw new Error(`arx: output (${output4.length}) is shorter than data (${len})`);
    const toClean = [];
    let l = key.length, k, sigma2;
    if (l === 32) {
      k = key.slice();
      toClean.push(k);
      sigma2 = sigma32_32;
    } else if (l === 16 && allowShortKeys) {
      k = new Uint8Array(32);
      k.set(key);
      k.set(key, 16);
      sigma2 = sigma16_32;
      toClean.push(k);
    } else {
      throw new Error(`arx: invalid 32-byte key, got length=${l}`);
    }
    if (!isAligned32(nonce)) {
      nonce = nonce.slice();
      toClean.push(nonce);
    }
    const k32 = u322(k);
    if (extendNonceFn) {
      if (nonce.length !== 24)
        throw new Error(`arx: extended nonce must be 24 bytes`);
      extendNonceFn(sigma2, k32, u322(nonce.subarray(0, 16)), k32);
      nonce = nonce.subarray(16);
    }
    const nonceNcLen = 16 - counterLength;
    if (nonceNcLen !== nonce.length)
      throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
    if (nonceNcLen !== 12) {
      const nc = new Uint8Array(12);
      nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
      nonce = nc;
      toClean.push(nonce);
    }
    const n32 = u322(nonce);
    runCipher(core, sigma2, k32, n32, data, output4, counter, rounds);
    while (toClean.length > 0)
      toClean.pop().fill(0);
    return output4;
  };
}

// ../node_modules/@noble/ciphers/esm/chacha.js
function chachaCore(s, k, n, out, cnt, rounds = 20) {
  let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
  let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
  for (let r = 0;r < rounds; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 7);
  }
  let oi = 0;
  out[oi++] = y00 + x00 | 0;
  out[oi++] = y01 + x01 | 0;
  out[oi++] = y02 + x02 | 0;
  out[oi++] = y03 + x03 | 0;
  out[oi++] = y04 + x04 | 0;
  out[oi++] = y05 + x05 | 0;
  out[oi++] = y06 + x06 | 0;
  out[oi++] = y07 + x07 | 0;
  out[oi++] = y08 + x08 | 0;
  out[oi++] = y09 + x09 | 0;
  out[oi++] = y10 + x10 | 0;
  out[oi++] = y11 + x11 | 0;
  out[oi++] = y12 + x12 | 0;
  out[oi++] = y13 + x13 | 0;
  out[oi++] = y14 + x14 | 0;
  out[oi++] = y15 + x15 | 0;
}
function hchacha(s, k, i, o32) {
  let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i[0], x13 = i[1], x14 = i[2], x15 = i[3];
  for (let r = 0;r < 20; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 7);
  }
  let oi = 0;
  o32[oi++] = x00;
  o32[oi++] = x01;
  o32[oi++] = x02;
  o32[oi++] = x03;
  o32[oi++] = x12;
  o32[oi++] = x13;
  o32[oi++] = x14;
  o32[oi++] = x15;
}
var chacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 4,
  allowShortKeys: false
});
var xchacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 8,
  extendNonceFn: hchacha,
  allowShortKeys: false
});
var ZEROS162 = /* @__PURE__ */ new Uint8Array(16);
var updatePadded = (h, msg) => {
  h.update(msg);
  const left = msg.length % 16;
  if (left)
    h.update(ZEROS162.subarray(left));
};
var ZEROS322 = /* @__PURE__ */ new Uint8Array(32);
function computeTag2(fn, key, nonce, data, AAD) {
  const authKey = fn(key, nonce, ZEROS322);
  const h = poly1305.create(authKey);
  if (AAD)
    updatePadded(h, AAD);
  updatePadded(h, data);
  const num = new Uint8Array(16);
  const view = createView3(num);
  setBigUint643(view, 0, BigInt(AAD ? AAD.length : 0), true);
  setBigUint643(view, 8, BigInt(data.length), true);
  h.update(num);
  const res = h.digest();
  authKey.fill(0);
  return res;
}
var _poly1305_aead = (xorStream) => (key, nonce, AAD) => {
  const tagLength = 16;
  bytes3(key, 32);
  bytes3(nonce);
  return {
    encrypt: (plaintext, output4) => {
      const plength = plaintext.length;
      const clength = plength + tagLength;
      if (output4) {
        bytes3(output4, clength);
      } else {
        output4 = new Uint8Array(clength);
      }
      xorStream(key, nonce, plaintext, output4, 1);
      const tag = computeTag2(xorStream, key, nonce, output4.subarray(0, -tagLength), AAD);
      output4.set(tag, plength);
      return output4;
    },
    decrypt: (ciphertext, output4) => {
      const clength = ciphertext.length;
      const plength = clength - tagLength;
      if (clength < tagLength)
        throw new Error(`encrypted data must be at least ${tagLength} bytes`);
      if (output4) {
        bytes3(output4, plength);
      } else {
        output4 = new Uint8Array(plength);
      }
      const data = ciphertext.subarray(0, -tagLength);
      const passedTag = ciphertext.subarray(-tagLength);
      const tag = computeTag2(xorStream, key, nonce, data, AAD);
      if (!equalBytes2(passedTag, tag))
        throw new Error("invalid tag");
      xorStream(key, nonce, data, output4, 1);
      return output4;
    }
  };
};
var chacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 12, tagLength: 16 }, _poly1305_aead(chacha20));
var xchacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 24, tagLength: 16 }, _poly1305_aead(xchacha20));

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/hmac.js
class HMAC2 extends Hash2 {
  constructor(hash3, _key) {
    super();
    this.finished = false;
    this.destroyed = false;
    _assert_default.hash(hash3);
    const key = toBytes2(_key);
    this.iHash = hash3.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash3.create().update(key).digest() : key);
    for (let i = 0;i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash3.create();
    for (let i = 0;i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    pad.fill(0);
  }
  update(buf) {
    _assert_default.exists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    _assert_default.exists(this);
    _assert_default.bytes(out, this.outputLen);
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
}
var hmac2 = (hash3, key, message) => new HMAC2(hash3, key).update(message).digest();
hmac2.create = (hash3, key) => new HMAC2(hash3, key);

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/hkdf.js
function extract(hash3, ikm, salt) {
  _assert_default.hash(hash3);
  if (salt === undefined)
    salt = new Uint8Array(hash3.outputLen);
  return hmac2(hash3, toBytes2(salt), toBytes2(ikm));
}
var HKDF_COUNTER = new Uint8Array([0]);
var EMPTY_BUFFER = new Uint8Array;
function expand(hash3, prk, info, length = 32) {
  _assert_default.hash(hash3);
  _assert_default.number(length);
  if (length > 255 * hash3.outputLen)
    throw new Error("Length should be <= 255*HashLen");
  const blocks = Math.ceil(length / hash3.outputLen);
  if (info === undefined)
    info = EMPTY_BUFFER;
  const okm = new Uint8Array(blocks * hash3.outputLen);
  const HMAC3 = hmac2.create(hash3, prk);
  const HMACTmp = HMAC3._cloneInto();
  const T = new Uint8Array(HMAC3.outputLen);
  for (let counter = 0;counter < blocks; counter++) {
    HKDF_COUNTER[0] = counter + 1;
    HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T).update(info).update(HKDF_COUNTER).digestInto(T);
    okm.set(T, hash3.outputLen * counter);
    HMAC3._cloneInto(HMACTmp);
  }
  HMAC3.destroy();
  HMACTmp.destroy();
  T.fill(0);
  HKDF_COUNTER.fill(0);
  return okm.slice(0, length);
}

// ../core/node_modules/nostr-tools/lib/esm/index.js
var __defProp2 = Object.defineProperty;
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};
var verifiedSymbol = Symbol("verified");
var isRecord = (obj) => obj instanceof Object;
function validateEvent(event) {
  if (!isRecord(event))
    return false;
  if (typeof event.kind !== "number")
    return false;
  if (typeof event.content !== "string")
    return false;
  if (typeof event.created_at !== "number")
    return false;
  if (typeof event.pubkey !== "string")
    return false;
  if (!event.pubkey.match(/^[a-f0-9]{64}$/))
    return false;
  if (!Array.isArray(event.tags))
    return false;
  for (let i2 = 0;i2 < event.tags.length; i2++) {
    let tag = event.tags[i2];
    if (!Array.isArray(tag))
      return false;
    for (let j = 0;j < tag.length; j++) {
      if (typeof tag[j] !== "string")
        return false;
    }
  }
  return true;
}
var utils_exports = {};
__export2(utils_exports, {
  Queue: () => Queue,
  QueueNode: () => QueueNode,
  binarySearch: () => binarySearch,
  bytesToHex: () => bytesToHex2,
  hexToBytes: () => hexToBytes3,
  insertEventIntoAscendingList: () => insertEventIntoAscendingList,
  insertEventIntoDescendingList: () => insertEventIntoDescendingList,
  normalizeURL: () => normalizeURL,
  utf8Decoder: () => utf8Decoder,
  utf8Encoder: () => utf8Encoder
});
var utf8Decoder = new TextDecoder("utf-8");
var utf8Encoder = new TextEncoder;
function normalizeURL(url) {
  try {
    if (url.indexOf("://") === -1)
      url = "wss://" + url;
    let p = new URL(url);
    if (p.protocol === "http:")
      p.protocol = "ws:";
    else if (p.protocol === "https:")
      p.protocol = "wss:";
    p.pathname = p.pathname.replace(/\/+/g, "/");
    if (p.pathname.endsWith("/"))
      p.pathname = p.pathname.slice(0, -1);
    if (p.port === "80" && p.protocol === "ws:" || p.port === "443" && p.protocol === "wss:")
      p.port = "";
    p.searchParams.sort();
    p.hash = "";
    return p.toString();
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`);
  }
}
function insertEventIntoDescendingList(sortedArray, event) {
  const [idx, found] = binarySearch(sortedArray, (b) => {
    if (event.id === b.id)
      return 0;
    if (event.created_at === b.created_at)
      return -1;
    return b.created_at - event.created_at;
  });
  if (!found) {
    sortedArray.splice(idx, 0, event);
  }
  return sortedArray;
}
function insertEventIntoAscendingList(sortedArray, event) {
  const [idx, found] = binarySearch(sortedArray, (b) => {
    if (event.id === b.id)
      return 0;
    if (event.created_at === b.created_at)
      return -1;
    return event.created_at - b.created_at;
  });
  if (!found) {
    sortedArray.splice(idx, 0, event);
  }
  return sortedArray;
}
function binarySearch(arr, compare) {
  let start = 0;
  let end = arr.length - 1;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const cmp = compare(arr[mid]);
    if (cmp === 0) {
      return [mid, true];
    }
    if (cmp < 0) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  return [start, false];
}
var QueueNode = class {
  value;
  next = null;
  prev = null;
  constructor(message) {
    this.value = message;
  }
};
var Queue = class {
  first;
  last;
  constructor() {
    this.first = null;
    this.last = null;
  }
  enqueue(value) {
    const newNode = new QueueNode(value);
    if (!this.last) {
      this.first = newNode;
      this.last = newNode;
    } else if (this.last === this.first) {
      this.last = newNode;
      this.last.prev = this.first;
      this.first.next = newNode;
    } else {
      newNode.prev = this.last;
      this.last.next = newNode;
      this.last = newNode;
    }
    return true;
  }
  dequeue() {
    if (!this.first)
      return null;
    if (this.first === this.last) {
      const target2 = this.first;
      this.first = null;
      this.last = null;
      return target2.value;
    }
    const target = this.first;
    this.first = target.next;
    if (this.first) {
      this.first.prev = null;
    }
    return target.value;
  }
};
var JS = class {
  generateSecretKey() {
    return schnorr.utils.randomPrivateKey();
  }
  getPublicKey(secretKey) {
    return bytesToHex2(schnorr.getPublicKey(secretKey));
  }
  finalizeEvent(t, secretKey) {
    const event = t;
    event.pubkey = bytesToHex2(schnorr.getPublicKey(secretKey));
    event.id = getEventHash(event);
    event.sig = bytesToHex2(schnorr.sign(getEventHash(event), secretKey));
    event[verifiedSymbol] = true;
    return event;
  }
  verifyEvent(event) {
    if (typeof event[verifiedSymbol] === "boolean")
      return event[verifiedSymbol];
    const hash3 = getEventHash(event);
    if (hash3 !== event.id) {
      event[verifiedSymbol] = false;
      return false;
    }
    try {
      const valid = schnorr.verify(event.sig, hash3, event.pubkey);
      event[verifiedSymbol] = valid;
      return valid;
    } catch (err) {
      event[verifiedSymbol] = false;
      return false;
    }
  }
};
function serializeEvent(evt) {
  if (!validateEvent(evt))
    throw new Error("can't serialize event with wrong or missing properties");
  return JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]);
}
function getEventHash(event) {
  let eventHash = sha2562(utf8Encoder.encode(serializeEvent(event)));
  return bytesToHex2(eventHash);
}
var i = new JS;
var generateSecretKey = i.generateSecretKey;
var getPublicKey = i.getPublicKey;
var finalizeEvent = i.finalizeEvent;
var verifyEvent = i.verifyEvent;
var kinds_exports = {};
__export2(kinds_exports, {
  Application: () => Application,
  BadgeAward: () => BadgeAward,
  BadgeDefinition: () => BadgeDefinition,
  BlockedRelaysList: () => BlockedRelaysList,
  BlossomServerList: () => BlossomServerList,
  BookmarkList: () => BookmarkList,
  Bookmarksets: () => Bookmarksets,
  Calendar: () => Calendar,
  CalendarEventRSVP: () => CalendarEventRSVP,
  ChannelCreation: () => ChannelCreation,
  ChannelHideMessage: () => ChannelHideMessage,
  ChannelMessage: () => ChannelMessage,
  ChannelMetadata: () => ChannelMetadata,
  ChannelMuteUser: () => ChannelMuteUser,
  ChatMessage: () => ChatMessage,
  ClassifiedListing: () => ClassifiedListing,
  ClientAuth: () => ClientAuth,
  Comment: () => Comment,
  CommunitiesList: () => CommunitiesList,
  CommunityDefinition: () => CommunityDefinition,
  CommunityPostApproval: () => CommunityPostApproval,
  Contacts: () => Contacts,
  CreateOrUpdateProduct: () => CreateOrUpdateProduct,
  CreateOrUpdateStall: () => CreateOrUpdateStall,
  Curationsets: () => Curationsets,
  Date: () => Date2,
  DirectMessageRelaysList: () => DirectMessageRelaysList,
  DraftClassifiedListing: () => DraftClassifiedListing,
  DraftLong: () => DraftLong,
  Emojisets: () => Emojisets,
  EncryptedDirectMessage: () => EncryptedDirectMessage,
  EventDeletion: () => EventDeletion,
  FavoriteRelays: () => FavoriteRelays,
  FileMessage: () => FileMessage,
  FileMetadata: () => FileMetadata,
  FileServerPreference: () => FileServerPreference,
  Followsets: () => Followsets,
  ForumThread: () => ForumThread,
  GenericRepost: () => GenericRepost,
  Genericlists: () => Genericlists,
  GiftWrap: () => GiftWrap,
  GroupMetadata: () => GroupMetadata,
  HTTPAuth: () => HTTPAuth,
  Handlerinformation: () => Handlerinformation,
  Handlerrecommendation: () => Handlerrecommendation,
  Highlights: () => Highlights,
  InterestsList: () => InterestsList,
  Interestsets: () => Interestsets,
  JobFeedback: () => JobFeedback,
  JobRequest: () => JobRequest,
  JobResult: () => JobResult,
  Label: () => Label,
  LightningPubRPC: () => LightningPubRPC,
  LiveChatMessage: () => LiveChatMessage,
  LiveEvent: () => LiveEvent,
  LongFormArticle: () => LongFormArticle,
  Metadata: () => Metadata,
  Mutelist: () => Mutelist,
  NWCWalletInfo: () => NWCWalletInfo,
  NWCWalletRequest: () => NWCWalletRequest,
  NWCWalletResponse: () => NWCWalletResponse,
  NormalVideo: () => NormalVideo,
  NostrConnect: () => NostrConnect,
  OpenTimestamps: () => OpenTimestamps,
  Photo: () => Photo,
  Pinlist: () => Pinlist,
  Poll: () => Poll,
  PollResponse: () => PollResponse,
  PrivateDirectMessage: () => PrivateDirectMessage,
  ProblemTracker: () => ProblemTracker,
  ProfileBadges: () => ProfileBadges,
  PublicChatsList: () => PublicChatsList,
  Reaction: () => Reaction,
  RecommendRelay: () => RecommendRelay,
  RelayList: () => RelayList,
  RelayReview: () => RelayReview,
  Relaysets: () => Relaysets,
  Report: () => Report,
  Reporting: () => Reporting,
  Repost: () => Repost,
  Seal: () => Seal,
  SearchRelaysList: () => SearchRelaysList,
  ShortTextNote: () => ShortTextNote,
  ShortVideo: () => ShortVideo,
  Time: () => Time,
  UserEmojiList: () => UserEmojiList,
  UserStatuses: () => UserStatuses,
  Voice: () => Voice,
  VoiceComment: () => VoiceComment,
  Zap: () => Zap,
  ZapGoal: () => ZapGoal,
  ZapRequest: () => ZapRequest,
  classifyKind: () => classifyKind,
  isAddressableKind: () => isAddressableKind,
  isEphemeralKind: () => isEphemeralKind,
  isKind: () => isKind,
  isRegularKind: () => isRegularKind,
  isReplaceableKind: () => isReplaceableKind
});
function isRegularKind(kind) {
  return kind < 1e4 && kind !== 0 && kind !== 3;
}
function isReplaceableKind(kind) {
  return kind === 0 || kind === 3 || 1e4 <= kind && kind < 20000;
}
function isEphemeralKind(kind) {
  return 20000 <= kind && kind < 30000;
}
function isAddressableKind(kind) {
  return 30000 <= kind && kind < 40000;
}
function classifyKind(kind) {
  if (isRegularKind(kind))
    return "regular";
  if (isReplaceableKind(kind))
    return "replaceable";
  if (isEphemeralKind(kind))
    return "ephemeral";
  if (isAddressableKind(kind))
    return "parameterized";
  return "unknown";
}
function isKind(event, kind) {
  const kindAsArray = kind instanceof Array ? kind : [kind];
  return validateEvent(event) && kindAsArray.includes(event.kind) || false;
}
var Metadata = 0;
var ShortTextNote = 1;
var RecommendRelay = 2;
var Contacts = 3;
var EncryptedDirectMessage = 4;
var EventDeletion = 5;
var Repost = 6;
var Reaction = 7;
var BadgeAward = 8;
var ChatMessage = 9;
var ForumThread = 11;
var Seal = 13;
var PrivateDirectMessage = 14;
var FileMessage = 15;
var GenericRepost = 16;
var Photo = 20;
var NormalVideo = 21;
var ShortVideo = 22;
var ChannelCreation = 40;
var ChannelMetadata = 41;
var ChannelMessage = 42;
var ChannelHideMessage = 43;
var ChannelMuteUser = 44;
var OpenTimestamps = 1040;
var GiftWrap = 1059;
var Poll = 1068;
var FileMetadata = 1063;
var Comment = 1111;
var LiveChatMessage = 1311;
var Voice = 1222;
var VoiceComment = 1244;
var ProblemTracker = 1971;
var Report = 1984;
var Reporting = 1984;
var Label = 1985;
var CommunityPostApproval = 4550;
var JobRequest = 5999;
var JobResult = 6999;
var JobFeedback = 7000;
var ZapGoal = 9041;
var ZapRequest = 9734;
var Zap = 9735;
var Highlights = 9802;
var PollResponse = 1018;
var Mutelist = 1e4;
var Pinlist = 10001;
var RelayList = 10002;
var BookmarkList = 10003;
var CommunitiesList = 10004;
var PublicChatsList = 10005;
var BlockedRelaysList = 10006;
var SearchRelaysList = 10007;
var FavoriteRelays = 10012;
var InterestsList = 10015;
var UserEmojiList = 10030;
var DirectMessageRelaysList = 10050;
var FileServerPreference = 10096;
var BlossomServerList = 10063;
var NWCWalletInfo = 13194;
var LightningPubRPC = 21000;
var ClientAuth = 22242;
var NWCWalletRequest = 23194;
var NWCWalletResponse = 23195;
var NostrConnect = 24133;
var HTTPAuth = 27235;
var Followsets = 30000;
var Genericlists = 30001;
var Relaysets = 30002;
var Bookmarksets = 30003;
var Curationsets = 30004;
var ProfileBadges = 30008;
var BadgeDefinition = 30009;
var Interestsets = 30015;
var CreateOrUpdateStall = 30017;
var CreateOrUpdateProduct = 30018;
var LongFormArticle = 30023;
var DraftLong = 30024;
var Emojisets = 30030;
var Application = 30078;
var LiveEvent = 30311;
var UserStatuses = 30315;
var ClassifiedListing = 30402;
var DraftClassifiedListing = 30403;
var Date2 = 31922;
var Time = 31923;
var Calendar = 31924;
var CalendarEventRSVP = 31925;
var RelayReview = 31987;
var Handlerrecommendation = 31989;
var Handlerinformation = 31990;
var CommunityDefinition = 34550;
var GroupMetadata = 39000;
function matchFilter(filter, event) {
  if (filter.ids && filter.ids.indexOf(event.id) === -1) {
    return false;
  }
  if (filter.kinds && filter.kinds.indexOf(event.kind) === -1) {
    return false;
  }
  if (filter.authors && filter.authors.indexOf(event.pubkey) === -1) {
    return false;
  }
  for (let f in filter) {
    if (f[0] === "#") {
      let tagName = f.slice(1);
      let values = filter[`#${tagName}`];
      if (values && !event.tags.find(([t, v]) => t === f.slice(1) && values.indexOf(v) !== -1))
        return false;
    }
  }
  if (filter.since && event.created_at < filter.since)
    return false;
  if (filter.until && event.created_at > filter.until)
    return false;
  return true;
}
function matchFilters(filters, event) {
  for (let i2 = 0;i2 < filters.length; i2++) {
    if (matchFilter(filters[i2], event)) {
      return true;
    }
  }
  return false;
}
var fakejson_exports = {};
__export2(fakejson_exports, {
  getHex64: () => getHex64,
  getInt: () => getInt,
  getSubscriptionId: () => getSubscriptionId,
  matchEventId: () => matchEventId,
  matchEventKind: () => matchEventKind,
  matchEventPubkey: () => matchEventPubkey
});
function getHex64(json, field) {
  let len = field.length + 3;
  let idx = json.indexOf(`"${field}":`) + len;
  let s = json.slice(idx).indexOf(`"`) + idx + 1;
  return json.slice(s, s + 64);
}
function getInt(json, field) {
  let len = field.length;
  let idx = json.indexOf(`"${field}":`) + len + 3;
  let sliced = json.slice(idx);
  let end = Math.min(sliced.indexOf(","), sliced.indexOf("}"));
  return parseInt(sliced.slice(0, end), 10);
}
function getSubscriptionId(json) {
  let idx = json.slice(0, 22).indexOf(`"EVENT"`);
  if (idx === -1)
    return null;
  let pstart = json.slice(idx + 7 + 1).indexOf(`"`);
  if (pstart === -1)
    return null;
  let start = idx + 7 + 1 + pstart;
  let pend = json.slice(start + 1, 80).indexOf(`"`);
  if (pend === -1)
    return null;
  let end = start + 1 + pend;
  return json.slice(start + 1, end);
}
function matchEventId(json, id) {
  return id === getHex64(json, "id");
}
function matchEventPubkey(json, pubkey) {
  return pubkey === getHex64(json, "pubkey");
}
function matchEventKind(json, kind) {
  return kind === getInt(json, "kind");
}
var nip42_exports = {};
__export2(nip42_exports, {
  makeAuthEvent: () => makeAuthEvent
});
function makeAuthEvent(relayURL, challenge2) {
  return {
    kind: ClientAuth,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["relay", relayURL],
      ["challenge", challenge2]
    ],
    content: ""
  };
}
async function yieldThread() {
  return new Promise((resolve, reject) => {
    try {
      if (typeof MessageChannel !== "undefined") {
        const ch = new MessageChannel;
        const handler = () => {
          ch.port1.removeEventListener("message", handler);
          resolve();
        };
        ch.port1.addEventListener("message", handler);
        ch.port2.postMessage(0);
        ch.port1.start();
      } else {
        if (typeof setImmediate !== "undefined") {
          setImmediate(resolve);
        } else if (typeof setTimeout !== "undefined") {
          setTimeout(resolve, 0);
        } else {
          resolve();
        }
      }
    } catch (e) {
      console.error("during yield: ", e);
      reject(e);
    }
  });
}
var SendingOnClosedConnection = class extends Error {
  constructor(message, relay) {
    super(`Tried to send message '${message} on a closed connection to ${relay}.`);
    this.name = "SendingOnClosedConnection";
  }
};
var AbstractRelay = class {
  url;
  _connected = false;
  onclose = null;
  onnotice = (msg) => console.debug(`NOTICE from ${this.url}: ${msg}`);
  onauth;
  baseEoseTimeout = 4400;
  connectionTimeout = 4400;
  publishTimeout = 4400;
  pingFrequency = 29000;
  pingTimeout = 20000;
  resubscribeBackoff = [1e4, 1e4, 1e4, 20000, 20000, 30000, 60000];
  openSubs = /* @__PURE__ */ new Map;
  enablePing;
  enableReconnect;
  connectionTimeoutHandle;
  reconnectTimeoutHandle;
  pingIntervalHandle;
  reconnectAttempts = 0;
  closedIntentionally = false;
  connectionPromise;
  openCountRequests = /* @__PURE__ */ new Map;
  openEventPublishes = /* @__PURE__ */ new Map;
  ws;
  incomingMessageQueue = new Queue;
  queueRunning = false;
  challenge;
  authPromise;
  serial = 0;
  verifyEvent;
  _WebSocket;
  constructor(url, opts) {
    this.url = normalizeURL(url);
    this.verifyEvent = opts.verifyEvent;
    this._WebSocket = opts.websocketImplementation || WebSocket;
    this.enablePing = opts.enablePing;
    this.enableReconnect = opts.enableReconnect || false;
  }
  static async connect(url, opts) {
    const relay = new AbstractRelay(url, opts);
    await relay.connect();
    return relay;
  }
  closeAllSubscriptions(reason) {
    for (let [_, sub] of this.openSubs) {
      sub.close(reason);
    }
    this.openSubs.clear();
    for (let [_, ep] of this.openEventPublishes) {
      ep.reject(new Error(reason));
    }
    this.openEventPublishes.clear();
    for (let [_, cr] of this.openCountRequests) {
      cr.reject(new Error(reason));
    }
    this.openCountRequests.clear();
  }
  get connected() {
    return this._connected;
  }
  async reconnect() {
    const backoff = this.resubscribeBackoff[Math.min(this.reconnectAttempts, this.resubscribeBackoff.length - 1)];
    this.reconnectAttempts++;
    this.reconnectTimeoutHandle = setTimeout(async () => {
      try {
        await this.connect();
      } catch (err) {}
    }, backoff);
  }
  handleHardClose(reason) {
    if (this.pingIntervalHandle) {
      clearInterval(this.pingIntervalHandle);
      this.pingIntervalHandle = undefined;
    }
    this._connected = false;
    this.connectionPromise = undefined;
    const wasIntentional = this.closedIntentionally;
    this.closedIntentionally = false;
    this.onclose?.();
    if (this.enableReconnect && !wasIntentional) {
      this.reconnect();
    } else {
      this.closeAllSubscriptions(reason);
    }
  }
  async connect() {
    if (this.connectionPromise)
      return this.connectionPromise;
    this.challenge = undefined;
    this.authPromise = undefined;
    this.connectionPromise = new Promise((resolve, reject) => {
      this.connectionTimeoutHandle = setTimeout(() => {
        reject("connection timed out");
        this.connectionPromise = undefined;
        this.onclose?.();
        this.closeAllSubscriptions("relay connection timed out");
      }, this.connectionTimeout);
      try {
        this.ws = new this._WebSocket(this.url);
      } catch (err) {
        clearTimeout(this.connectionTimeoutHandle);
        reject(err);
        return;
      }
      this.ws.onopen = () => {
        if (this.reconnectTimeoutHandle) {
          clearTimeout(this.reconnectTimeoutHandle);
          this.reconnectTimeoutHandle = undefined;
        }
        clearTimeout(this.connectionTimeoutHandle);
        this._connected = true;
        const isReconnection = this.reconnectAttempts > 0;
        this.reconnectAttempts = 0;
        for (const sub of this.openSubs.values()) {
          sub.eosed = false;
          if (isReconnection) {
            for (let f = 0;f < sub.filters.length; f++) {
              if (sub.lastEmitted) {
                sub.filters[f].since = sub.lastEmitted + 1;
              }
            }
          }
          sub.fire();
        }
        if (this.enablePing) {
          this.pingIntervalHandle = setInterval(() => this.pingpong(), this.pingFrequency);
        }
        resolve();
      };
      this.ws.onerror = (ev) => {
        clearTimeout(this.connectionTimeoutHandle);
        reject(ev.message || "websocket error");
        this.handleHardClose("relay connection errored");
      };
      this.ws.onclose = (ev) => {
        clearTimeout(this.connectionTimeoutHandle);
        reject(ev.message || "websocket closed");
        this.handleHardClose("relay connection closed");
      };
      this.ws.onmessage = this._onmessage.bind(this);
    });
    return this.connectionPromise;
  }
  waitForPingPong() {
    return new Promise((resolve) => {
      this.ws.once("pong", () => resolve(true));
      this.ws.ping();
    });
  }
  waitForDummyReq() {
    return new Promise((resolve, reject) => {
      if (!this.connectionPromise)
        return reject(new Error(`no connection to ${this.url}, can't ping`));
      try {
        const sub = this.subscribe([{ ids: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"], limit: 0 }], {
          oneose: () => {
            resolve(true);
            sub.close();
          },
          onclose() {
            resolve(true);
          },
          eoseTimeout: this.pingTimeout + 1000
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  async pingpong() {
    if (this.ws?.readyState === 1) {
      const result = await Promise.any([
        this.ws && this.ws.ping && this.ws.once ? this.waitForPingPong() : this.waitForDummyReq(),
        new Promise((res) => setTimeout(() => res(false), this.pingTimeout))
      ]);
      if (!result) {
        if (this.ws?.readyState === this._WebSocket.OPEN) {
          this.ws?.close();
        }
      }
    }
  }
  async runQueue() {
    this.queueRunning = true;
    while (true) {
      if (this.handleNext() === false) {
        break;
      }
      await yieldThread();
    }
    this.queueRunning = false;
  }
  handleNext() {
    const json = this.incomingMessageQueue.dequeue();
    if (!json) {
      return false;
    }
    const subid = getSubscriptionId(json);
    if (subid) {
      const so = this.openSubs.get(subid);
      if (!so) {
        return;
      }
      const id = getHex64(json, "id");
      const alreadyHave = so.alreadyHaveEvent?.(id);
      so.receivedEvent?.(this, id);
      if (alreadyHave) {
        return;
      }
    }
    try {
      let data = JSON.parse(json);
      switch (data[0]) {
        case "EVENT": {
          const so = this.openSubs.get(data[1]);
          const event = data[2];
          if (this.verifyEvent(event) && matchFilters(so.filters, event)) {
            so.onevent(event);
          }
          if (!so.lastEmitted || so.lastEmitted < event.created_at)
            so.lastEmitted = event.created_at;
          return;
        }
        case "COUNT": {
          const id = data[1];
          const payload = data[2];
          const cr = this.openCountRequests.get(id);
          if (cr) {
            cr.resolve(payload.count);
            this.openCountRequests.delete(id);
          }
          return;
        }
        case "EOSE": {
          const so = this.openSubs.get(data[1]);
          if (!so)
            return;
          so.receivedEose();
          return;
        }
        case "OK": {
          const id = data[1];
          const ok = data[2];
          const reason = data[3];
          const ep = this.openEventPublishes.get(id);
          if (ep) {
            clearTimeout(ep.timeout);
            if (ok)
              ep.resolve(reason);
            else
              ep.reject(new Error(reason));
            this.openEventPublishes.delete(id);
          }
          return;
        }
        case "CLOSED": {
          const id = data[1];
          const so = this.openSubs.get(id);
          if (!so)
            return;
          so.closed = true;
          so.close(data[2]);
          return;
        }
        case "NOTICE": {
          this.onnotice(data[1]);
          return;
        }
        case "AUTH": {
          this.challenge = data[1];
          if (this.onauth) {
            this.auth(this.onauth);
          }
          return;
        }
        default: {
          const so = this.openSubs.get(data[1]);
          so?.oncustom?.(data);
          return;
        }
      }
    } catch (err) {
      return;
    }
  }
  async send(message) {
    if (!this.connectionPromise)
      throw new SendingOnClosedConnection(message, this.url);
    this.connectionPromise.then(() => {
      this.ws?.send(message);
    });
  }
  async auth(signAuthEvent) {
    const challenge2 = this.challenge;
    if (!challenge2)
      throw new Error("can't perform auth, no challenge was received");
    if (this.authPromise)
      return this.authPromise;
    this.authPromise = new Promise(async (resolve, reject) => {
      try {
        let evt = await signAuthEvent(makeAuthEvent(this.url, challenge2));
        let timeout = setTimeout(() => {
          let ep = this.openEventPublishes.get(evt.id);
          if (ep) {
            ep.reject(new Error("auth timed out"));
            this.openEventPublishes.delete(evt.id);
          }
        }, this.publishTimeout);
        this.openEventPublishes.set(evt.id, { resolve, reject, timeout });
        this.send('["AUTH",' + JSON.stringify(evt) + "]");
      } catch (err) {
        console.warn("subscribe auth function failed:", err);
      }
    });
    return this.authPromise;
  }
  async publish(event) {
    const ret = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const ep = this.openEventPublishes.get(event.id);
        if (ep) {
          ep.reject(new Error("publish timed out"));
          this.openEventPublishes.delete(event.id);
        }
      }, this.publishTimeout);
      this.openEventPublishes.set(event.id, { resolve, reject, timeout });
    });
    this.send('["EVENT",' + JSON.stringify(event) + "]");
    return ret;
  }
  async count(filters, params) {
    this.serial++;
    const id = params?.id || "count:" + this.serial;
    const ret = new Promise((resolve, reject) => {
      this.openCountRequests.set(id, { resolve, reject });
    });
    this.send('["COUNT","' + id + '",' + JSON.stringify(filters).substring(1));
    return ret;
  }
  subscribe(filters, params) {
    const sub = this.prepareSubscription(filters, params);
    sub.fire();
    return sub;
  }
  prepareSubscription(filters, params) {
    this.serial++;
    const id = params.id || (params.label ? params.label + ":" : "sub:") + this.serial;
    const subscription = new Subscription(this, id, filters, params);
    this.openSubs.set(id, subscription);
    return subscription;
  }
  close() {
    this.closedIntentionally = true;
    if (this.reconnectTimeoutHandle) {
      clearTimeout(this.reconnectTimeoutHandle);
      this.reconnectTimeoutHandle = undefined;
    }
    if (this.pingIntervalHandle) {
      clearInterval(this.pingIntervalHandle);
      this.pingIntervalHandle = undefined;
    }
    this.closeAllSubscriptions("relay connection closed by us");
    this._connected = false;
    this.onclose?.();
    if (this.ws?.readyState === this._WebSocket.OPEN) {
      this.ws?.close();
    }
  }
  _onmessage(ev) {
    this.incomingMessageQueue.enqueue(ev.data);
    if (!this.queueRunning) {
      this.runQueue();
    }
  }
};
var Subscription = class {
  relay;
  id;
  lastEmitted;
  closed = false;
  eosed = false;
  filters;
  alreadyHaveEvent;
  receivedEvent;
  onevent;
  oneose;
  onclose;
  oncustom;
  eoseTimeout;
  eoseTimeoutHandle;
  constructor(relay, id, filters, params) {
    if (filters.length === 0)
      throw new Error("subscription can't be created with zero filters");
    this.relay = relay;
    this.filters = filters;
    this.id = id;
    this.alreadyHaveEvent = params.alreadyHaveEvent;
    this.receivedEvent = params.receivedEvent;
    this.eoseTimeout = params.eoseTimeout || relay.baseEoseTimeout;
    this.oneose = params.oneose;
    this.onclose = params.onclose;
    this.onevent = params.onevent || ((event) => {
      console.warn(`onevent() callback not defined for subscription '${this.id}' in relay ${this.relay.url}. event received:`, event);
    });
  }
  fire() {
    this.relay.send('["REQ","' + this.id + '",' + JSON.stringify(this.filters).substring(1));
    this.eoseTimeoutHandle = setTimeout(this.receivedEose.bind(this), this.eoseTimeout);
  }
  receivedEose() {
    if (this.eosed)
      return;
    clearTimeout(this.eoseTimeoutHandle);
    this.eosed = true;
    this.oneose?.();
  }
  close(reason = "closed by caller") {
    if (!this.closed && this.relay.connected) {
      try {
        this.relay.send('["CLOSE",' + JSON.stringify(this.id) + "]");
      } catch (err) {
        if (err instanceof SendingOnClosedConnection) {} else {
          throw err;
        }
      }
      this.closed = true;
    }
    this.relay.openSubs.delete(this.id);
    this.onclose?.(reason);
  }
};
var _WebSocket;
try {
  _WebSocket = WebSocket;
} catch {}
var _WebSocket2;
try {
  _WebSocket2 = WebSocket;
} catch {}
var nip19_exports = {};
__export2(nip19_exports, {
  BECH32_REGEX: () => BECH32_REGEX,
  Bech32MaxSize: () => Bech32MaxSize,
  NostrTypeGuard: () => NostrTypeGuard,
  decode: () => decode,
  decodeNostrURI: () => decodeNostrURI,
  encodeBytes: () => encodeBytes,
  naddrEncode: () => naddrEncode,
  neventEncode: () => neventEncode,
  noteEncode: () => noteEncode,
  nprofileEncode: () => nprofileEncode,
  npubEncode: () => npubEncode,
  nsecEncode: () => nsecEncode
});
var NostrTypeGuard = {
  isNProfile: (value) => /^nprofile1[a-z\d]+$/.test(value || ""),
  isNEvent: (value) => /^nevent1[a-z\d]+$/.test(value || ""),
  isNAddr: (value) => /^naddr1[a-z\d]+$/.test(value || ""),
  isNSec: (value) => /^nsec1[a-z\d]{58}$/.test(value || ""),
  isNPub: (value) => /^npub1[a-z\d]{58}$/.test(value || ""),
  isNote: (value) => /^note1[a-z\d]+$/.test(value || ""),
  isNcryptsec: (value) => /^ncryptsec1[a-z\d]+$/.test(value || "")
};
var Bech32MaxSize = 5000;
var BECH32_REGEX = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;
function integerToUint8Array(number4) {
  const uint8Array = new Uint8Array(4);
  uint8Array[0] = number4 >> 24 & 255;
  uint8Array[1] = number4 >> 16 & 255;
  uint8Array[2] = number4 >> 8 & 255;
  uint8Array[3] = number4 & 255;
  return uint8Array;
}
function decodeNostrURI(nip19code) {
  try {
    if (nip19code.startsWith("nostr:"))
      nip19code = nip19code.substring(6);
    return decode(nip19code);
  } catch (_err) {
    return { type: "invalid", data: null };
  }
}
function decode(code) {
  let { prefix, words } = bech32.decode(code, Bech32MaxSize);
  let data = new Uint8Array(bech32.fromWords(words));
  switch (prefix) {
    case "nprofile": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nprofile");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      return {
        type: "nprofile",
        data: {
          pubkey: bytesToHex2(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
        }
      };
    }
    case "nevent": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nevent");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      if (tlv[2] && tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (tlv[3] && tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "nevent",
        data: {
          id: bytesToHex2(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : [],
          author: tlv[2]?.[0] ? bytesToHex2(tlv[2][0]) : undefined,
          kind: tlv[3]?.[0] ? parseInt(bytesToHex2(tlv[3][0]), 16) : undefined
        }
      };
    }
    case "naddr": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for naddr");
      if (!tlv[2]?.[0])
        throw new Error("missing TLV 2 for naddr");
      if (tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (!tlv[3]?.[0])
        throw new Error("missing TLV 3 for naddr");
      if (tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "naddr",
        data: {
          identifier: utf8Decoder.decode(tlv[0][0]),
          pubkey: bytesToHex2(tlv[2][0]),
          kind: parseInt(bytesToHex2(tlv[3][0]), 16),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
        }
      };
    }
    case "nsec":
      return { type: prefix, data };
    case "npub":
    case "note":
      return { type: prefix, data: bytesToHex2(data) };
    default:
      throw new Error(`unknown prefix ${prefix}`);
  }
}
function parseTLV(data) {
  let result = {};
  let rest = data;
  while (rest.length > 0) {
    let t = rest[0];
    let l = rest[1];
    let v = rest.slice(2, 2 + l);
    rest = rest.slice(2 + l);
    if (v.length < l)
      throw new Error(`not enough data to read on TLV ${t}`);
    result[t] = result[t] || [];
    result[t].push(v);
  }
  return result;
}
function nsecEncode(key) {
  return encodeBytes("nsec", key);
}
function npubEncode(hex2) {
  return encodeBytes("npub", hexToBytes3(hex2));
}
function noteEncode(hex2) {
  return encodeBytes("note", hexToBytes3(hex2));
}
function encodeBech32(prefix, data) {
  let words = bech32.toWords(data);
  return bech32.encode(prefix, words, Bech32MaxSize);
}
function encodeBytes(prefix, bytes4) {
  return encodeBech32(prefix, bytes4);
}
function nprofileEncode(profile) {
  let data = encodeTLV({
    0: [hexToBytes3(profile.pubkey)],
    1: (profile.relays || []).map((url) => utf8Encoder.encode(url))
  });
  return encodeBech32("nprofile", data);
}
function neventEncode(event) {
  let kindArray;
  if (event.kind !== undefined) {
    kindArray = integerToUint8Array(event.kind);
  }
  let data = encodeTLV({
    0: [hexToBytes3(event.id)],
    1: (event.relays || []).map((url) => utf8Encoder.encode(url)),
    2: event.author ? [hexToBytes3(event.author)] : [],
    3: kindArray ? [new Uint8Array(kindArray)] : []
  });
  return encodeBech32("nevent", data);
}
function naddrEncode(addr) {
  let kind = new ArrayBuffer(4);
  new DataView(kind).setUint32(0, addr.kind, false);
  let data = encodeTLV({
    0: [utf8Encoder.encode(addr.identifier)],
    1: (addr.relays || []).map((url) => utf8Encoder.encode(url)),
    2: [hexToBytes3(addr.pubkey)],
    3: [new Uint8Array(kind)]
  });
  return encodeBech32("naddr", data);
}
function encodeTLV(tlv) {
  let entries = [];
  Object.entries(tlv).reverse().forEach(([t, vs]) => {
    vs.forEach((v) => {
      let entry = new Uint8Array(v.length + 2);
      entry.set([parseInt(t)], 0);
      entry.set([v.length], 1);
      entry.set(v, 2);
      entries.push(entry);
    });
  });
  return concatBytes3(...entries);
}
var nip04_exports = {};
__export2(nip04_exports, {
  decrypt: () => decrypt2,
  encrypt: () => encrypt2
});
function encrypt2(secretKey, pubkey, text) {
  const privkey = secretKey instanceof Uint8Array ? bytesToHex2(secretKey) : secretKey;
  const key = secp256k1.getSharedSecret(privkey, "02" + pubkey);
  const normalizedKey = getNormalizedX(key);
  let iv = Uint8Array.from(randomBytes2(16));
  let plaintext = utf8Encoder.encode(text);
  let ciphertext = cbc(normalizedKey, iv).encrypt(plaintext);
  let ctb64 = base64.encode(new Uint8Array(ciphertext));
  let ivb64 = base64.encode(new Uint8Array(iv.buffer));
  return `${ctb64}?iv=${ivb64}`;
}
function decrypt2(secretKey, pubkey, data) {
  const privkey = secretKey instanceof Uint8Array ? bytesToHex2(secretKey) : secretKey;
  let [ctb64, ivb64] = data.split("?iv=");
  let key = secp256k1.getSharedSecret(privkey, "02" + pubkey);
  let normalizedKey = getNormalizedX(key);
  let iv = base64.decode(ivb64);
  let ciphertext = base64.decode(ctb64);
  let plaintext = cbc(normalizedKey, iv).decrypt(ciphertext);
  return utf8Decoder.decode(plaintext);
}
function getNormalizedX(key) {
  return key.slice(1, 33);
}
var nip05_exports = {};
__export2(nip05_exports, {
  NIP05_REGEX: () => NIP05_REGEX,
  isNip05: () => isNip05,
  isValid: () => isValid,
  queryProfile: () => queryProfile,
  searchDomain: () => searchDomain,
  useFetchImplementation: () => useFetchImplementation
});
var NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w_-]+(\.[\w_-]+)+)$/;
var isNip05 = (value) => NIP05_REGEX.test(value || "");
var _fetch;
try {
  _fetch = fetch;
} catch (_) {}
function useFetchImplementation(fetchImplementation) {
  _fetch = fetchImplementation;
}
async function searchDomain(domain, query = "") {
  try {
    const url = `https://${domain}/.well-known/nostr.json?name=${query}`;
    const res = await _fetch(url, { redirect: "manual" });
    if (res.status !== 200) {
      throw Error("Wrong response code");
    }
    const json = await res.json();
    return json.names;
  } catch (_) {
    return {};
  }
}
async function queryProfile(fullname) {
  const match = fullname.match(NIP05_REGEX);
  if (!match)
    return null;
  const [, name = "_", domain] = match;
  try {
    const url = `https://${domain}/.well-known/nostr.json?name=${name}`;
    const res = await _fetch(url, { redirect: "manual" });
    if (res.status !== 200) {
      throw Error("Wrong response code");
    }
    const json = await res.json();
    const pubkey = json.names[name];
    return pubkey ? { pubkey, relays: json.relays?.[pubkey] } : null;
  } catch (_e) {
    return null;
  }
}
async function isValid(pubkey, nip05) {
  const res = await queryProfile(nip05);
  return res ? res.pubkey === pubkey : false;
}
var nip10_exports = {};
__export2(nip10_exports, {
  parse: () => parse
});
function parse(event) {
  const result = {
    reply: undefined,
    root: undefined,
    mentions: [],
    profiles: [],
    quotes: []
  };
  let maybeParent;
  let maybeRoot;
  for (let i2 = event.tags.length - 1;i2 >= 0; i2--) {
    const tag = event.tags[i2];
    if (tag[0] === "e" && tag[1]) {
      const [_, eTagEventId, eTagRelayUrl, eTagMarker, eTagAuthor] = tag;
      const eventPointer = {
        id: eTagEventId,
        relays: eTagRelayUrl ? [eTagRelayUrl] : [],
        author: eTagAuthor
      };
      if (eTagMarker === "root") {
        result.root = eventPointer;
        continue;
      }
      if (eTagMarker === "reply") {
        result.reply = eventPointer;
        continue;
      }
      if (eTagMarker === "mention") {
        result.mentions.push(eventPointer);
        continue;
      }
      if (!maybeParent) {
        maybeParent = eventPointer;
      } else {
        maybeRoot = eventPointer;
      }
      result.mentions.push(eventPointer);
      continue;
    }
    if (tag[0] === "q" && tag[1]) {
      const [_, eTagEventId, eTagRelayUrl] = tag;
      result.quotes.push({
        id: eTagEventId,
        relays: eTagRelayUrl ? [eTagRelayUrl] : []
      });
    }
    if (tag[0] === "p" && tag[1]) {
      result.profiles.push({
        pubkey: tag[1],
        relays: tag[2] ? [tag[2]] : []
      });
      continue;
    }
  }
  if (!result.root) {
    result.root = maybeRoot || maybeParent || result.reply;
  }
  if (!result.reply) {
    result.reply = maybeParent || result.root;
  }
  [result.reply, result.root].forEach((ref) => {
    if (!ref)
      return;
    let idx = result.mentions.indexOf(ref);
    if (idx !== -1) {
      result.mentions.splice(idx, 1);
    }
    if (ref.author) {
      let author = result.profiles.find((p) => p.pubkey === ref.author);
      if (author && author.relays) {
        if (!ref.relays) {
          ref.relays = [];
        }
        author.relays.forEach((url) => {
          if (ref.relays?.indexOf(url) === -1)
            ref.relays.push(url);
        });
        author.relays = ref.relays;
      }
    }
  });
  result.mentions.forEach((ref) => {
    if (ref.author) {
      let author = result.profiles.find((p) => p.pubkey === ref.author);
      if (author && author.relays) {
        if (!ref.relays) {
          ref.relays = [];
        }
        author.relays.forEach((url) => {
          if (ref.relays.indexOf(url) === -1)
            ref.relays.push(url);
        });
        author.relays = ref.relays;
      }
    }
  });
  return result;
}
var nip11_exports = {};
__export2(nip11_exports, {
  fetchRelayInformation: () => fetchRelayInformation,
  useFetchImplementation: () => useFetchImplementation2
});
var _fetch2;
try {
  _fetch2 = fetch;
} catch {}
function useFetchImplementation2(fetchImplementation) {
  _fetch2 = fetchImplementation;
}
async function fetchRelayInformation(url) {
  return await (await fetch(url.replace("ws://", "http://").replace("wss://", "https://"), {
    headers: { Accept: "application/nostr+json" }
  })).json();
}
var nip13_exports = {};
__export2(nip13_exports, {
  fastEventHash: () => fastEventHash,
  getPow: () => getPow,
  minePow: () => minePow
});
function getPow(hex2) {
  let count = 0;
  for (let i2 = 0;i2 < 64; i2 += 8) {
    const nibble = parseInt(hex2.substring(i2, i2 + 8), 16);
    if (nibble === 0) {
      count += 32;
    } else {
      count += Math.clz32(nibble);
      break;
    }
  }
  return count;
}
function minePow(unsigned, difficulty) {
  let count = 0;
  const event = unsigned;
  const tag = ["nonce", count.toString(), difficulty.toString()];
  event.tags.push(tag);
  while (true) {
    const now2 = Math.floor(new Date().getTime() / 1000);
    if (now2 !== event.created_at) {
      count = 0;
      event.created_at = now2;
    }
    tag[1] = (++count).toString();
    event.id = fastEventHash(event);
    if (getPow(event.id) >= difficulty) {
      break;
    }
  }
  return event;
}
function fastEventHash(evt) {
  return bytesToHex2(sha2562(utf8Encoder.encode(JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]))));
}
var nip17_exports = {};
__export2(nip17_exports, {
  unwrapEvent: () => unwrapEvent2,
  unwrapManyEvents: () => unwrapManyEvents2,
  wrapEvent: () => wrapEvent2,
  wrapManyEvents: () => wrapManyEvents2
});
var nip59_exports = {};
__export2(nip59_exports, {
  createRumor: () => createRumor,
  createSeal: () => createSeal,
  createWrap: () => createWrap,
  unwrapEvent: () => unwrapEvent,
  unwrapManyEvents: () => unwrapManyEvents,
  wrapEvent: () => wrapEvent,
  wrapManyEvents: () => wrapManyEvents
});
var nip44_exports = {};
__export2(nip44_exports, {
  decrypt: () => decrypt22,
  encrypt: () => encrypt22,
  getConversationKey: () => getConversationKey,
  v2: () => v2
});
var minPlaintextSize = 1;
var maxPlaintextSize = 65535;
function getConversationKey(privkeyA, pubkeyB) {
  const sharedX = secp256k1.getSharedSecret(privkeyA, "02" + pubkeyB).subarray(1, 33);
  return extract(sha2562, sharedX, "nip44-v2");
}
function getMessageKeys(conversationKey, nonce) {
  const keys = expand(sha2562, conversationKey, nonce, 76);
  return {
    chacha_key: keys.subarray(0, 32),
    chacha_nonce: keys.subarray(32, 44),
    hmac_key: keys.subarray(44, 76)
  };
}
function calcPaddedLen(len) {
  if (!Number.isSafeInteger(len) || len < 1)
    throw new Error("expected positive integer");
  if (len <= 32)
    return 32;
  const nextPower = 1 << Math.floor(Math.log2(len - 1)) + 1;
  const chunk = nextPower <= 256 ? 32 : nextPower / 8;
  return chunk * (Math.floor((len - 1) / chunk) + 1);
}
function writeU16BE(num) {
  if (!Number.isSafeInteger(num) || num < minPlaintextSize || num > maxPlaintextSize)
    throw new Error("invalid plaintext size: must be between 1 and 65535 bytes");
  const arr = new Uint8Array(2);
  new DataView(arr.buffer).setUint16(0, num, false);
  return arr;
}
function pad(plaintext) {
  const unpadded = utf8Encoder.encode(plaintext);
  const unpaddedLen = unpadded.length;
  const prefix = writeU16BE(unpaddedLen);
  const suffix = new Uint8Array(calcPaddedLen(unpaddedLen) - unpaddedLen);
  return concatBytes3(prefix, unpadded, suffix);
}
function unpad(padded) {
  const unpaddedLen = new DataView(padded.buffer).getUint16(0);
  const unpadded = padded.subarray(2, 2 + unpaddedLen);
  if (unpaddedLen < minPlaintextSize || unpaddedLen > maxPlaintextSize || unpadded.length !== unpaddedLen || padded.length !== 2 + calcPaddedLen(unpaddedLen))
    throw new Error("invalid padding");
  return utf8Decoder.decode(unpadded);
}
function hmacAad(key, message, aad) {
  if (aad.length !== 32)
    throw new Error("AAD associated data must be 32 bytes");
  const combined = concatBytes3(aad, message);
  return hmac2(sha2562, key, combined);
}
function decodePayload(payload) {
  if (typeof payload !== "string")
    throw new Error("payload must be a valid string");
  const plen = payload.length;
  if (plen < 132 || plen > 87472)
    throw new Error("invalid payload length: " + plen);
  if (payload[0] === "#")
    throw new Error("unknown encryption version");
  let data;
  try {
    data = base64.decode(payload);
  } catch (error) {
    throw new Error("invalid base64: " + error.message);
  }
  const dlen = data.length;
  if (dlen < 99 || dlen > 65603)
    throw new Error("invalid data length: " + dlen);
  const vers = data[0];
  if (vers !== 2)
    throw new Error("unknown encryption version " + vers);
  return {
    nonce: data.subarray(1, 33),
    ciphertext: data.subarray(33, -32),
    mac: data.subarray(-32)
  };
}
function encrypt22(plaintext, conversationKey, nonce = randomBytes2(32)) {
  const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce);
  const padded = pad(plaintext);
  const ciphertext = chacha20(chacha_key, chacha_nonce, padded);
  const mac = hmacAad(hmac_key, ciphertext, nonce);
  return base64.encode(concatBytes3(new Uint8Array([2]), nonce, ciphertext, mac));
}
function decrypt22(payload, conversationKey) {
  const { nonce, ciphertext, mac } = decodePayload(payload);
  const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce);
  const calculatedMac = hmacAad(hmac_key, ciphertext, nonce);
  if (!equalBytes2(calculatedMac, mac))
    throw new Error("invalid MAC");
  const padded = chacha20(chacha_key, chacha_nonce, ciphertext);
  return unpad(padded);
}
var v2 = {
  utils: {
    getConversationKey,
    calcPaddedLen
  },
  encrypt: encrypt22,
  decrypt: decrypt22
};
var TWO_DAYS = 2 * 24 * 60 * 60;
var now = () => Math.round(Date.now() / 1000);
var randomNow = () => Math.round(now() - Math.random() * TWO_DAYS);
var nip44ConversationKey = (privateKey, publicKey) => getConversationKey(privateKey, publicKey);
var nip44Encrypt = (data, privateKey, publicKey) => encrypt22(JSON.stringify(data), nip44ConversationKey(privateKey, publicKey));
var nip44Decrypt = (data, privateKey) => JSON.parse(decrypt22(data.content, nip44ConversationKey(privateKey, data.pubkey)));
function createRumor(event, privateKey) {
  const rumor = {
    created_at: now(),
    content: "",
    tags: [],
    ...event,
    pubkey: getPublicKey(privateKey)
  };
  rumor.id = getEventHash(rumor);
  return rumor;
}
function createSeal(rumor, privateKey, recipientPublicKey) {
  return finalizeEvent({
    kind: Seal,
    content: nip44Encrypt(rumor, privateKey, recipientPublicKey),
    created_at: randomNow(),
    tags: []
  }, privateKey);
}
function createWrap(seal, recipientPublicKey) {
  const randomKey = generateSecretKey();
  return finalizeEvent({
    kind: GiftWrap,
    content: nip44Encrypt(seal, randomKey, recipientPublicKey),
    created_at: randomNow(),
    tags: [["p", recipientPublicKey]]
  }, randomKey);
}
function wrapEvent(event, senderPrivateKey, recipientPublicKey) {
  const rumor = createRumor(event, senderPrivateKey);
  const seal = createSeal(rumor, senderPrivateKey, recipientPublicKey);
  return createWrap(seal, recipientPublicKey);
}
function wrapManyEvents(event, senderPrivateKey, recipientsPublicKeys) {
  if (!recipientsPublicKeys || recipientsPublicKeys.length === 0) {
    throw new Error("At least one recipient is required.");
  }
  const senderPublicKey = getPublicKey(senderPrivateKey);
  const wrappeds = [wrapEvent(event, senderPrivateKey, senderPublicKey)];
  recipientsPublicKeys.forEach((recipientPublicKey) => {
    wrappeds.push(wrapEvent(event, senderPrivateKey, recipientPublicKey));
  });
  return wrappeds;
}
function unwrapEvent(wrap, recipientPrivateKey) {
  const unwrappedSeal = nip44Decrypt(wrap, recipientPrivateKey);
  return nip44Decrypt(unwrappedSeal, recipientPrivateKey);
}
function unwrapManyEvents(wrappedEvents, recipientPrivateKey) {
  let unwrappedEvents = [];
  wrappedEvents.forEach((e) => {
    unwrappedEvents.push(unwrapEvent(e, recipientPrivateKey));
  });
  unwrappedEvents.sort((a, b) => a.created_at - b.created_at);
  return unwrappedEvents;
}
function createEvent(recipients, message, conversationTitle, replyTo) {
  const baseEvent = {
    created_at: Math.ceil(Date.now() / 1000),
    kind: PrivateDirectMessage,
    tags: [],
    content: message
  };
  const recipientsArray = Array.isArray(recipients) ? recipients : [recipients];
  recipientsArray.forEach(({ publicKey, relayUrl }) => {
    baseEvent.tags.push(relayUrl ? ["p", publicKey, relayUrl] : ["p", publicKey]);
  });
  if (replyTo) {
    baseEvent.tags.push(["e", replyTo.eventId, replyTo.relayUrl || "", "reply"]);
  }
  if (conversationTitle) {
    baseEvent.tags.push(["subject", conversationTitle]);
  }
  return baseEvent;
}
function wrapEvent2(senderPrivateKey, recipient, message, conversationTitle, replyTo) {
  const event = createEvent(recipient, message, conversationTitle, replyTo);
  return wrapEvent(event, senderPrivateKey, recipient.publicKey);
}
function wrapManyEvents2(senderPrivateKey, recipients, message, conversationTitle, replyTo) {
  if (!recipients || recipients.length === 0) {
    throw new Error("At least one recipient is required.");
  }
  const senderPublicKey = getPublicKey(senderPrivateKey);
  return [{ publicKey: senderPublicKey }, ...recipients].map((recipient) => wrapEvent2(senderPrivateKey, recipient, message, conversationTitle, replyTo));
}
var unwrapEvent2 = unwrapEvent;
var unwrapManyEvents2 = unwrapManyEvents;
var nip18_exports = {};
__export2(nip18_exports, {
  finishRepostEvent: () => finishRepostEvent,
  getRepostedEvent: () => getRepostedEvent,
  getRepostedEventPointer: () => getRepostedEventPointer
});
function finishRepostEvent(t, reposted, relayUrl, privateKey) {
  let kind;
  const tags = [...t.tags ?? [], ["e", reposted.id, relayUrl], ["p", reposted.pubkey]];
  if (reposted.kind === ShortTextNote) {
    kind = Repost;
  } else {
    kind = GenericRepost;
    tags.push(["k", String(reposted.kind)]);
  }
  return finalizeEvent({
    kind,
    tags,
    content: t.content === "" || reposted.tags?.find((tag) => tag[0] === "-") ? "" : JSON.stringify(reposted),
    created_at: t.created_at
  }, privateKey);
}
function getRepostedEventPointer(event) {
  if (![Repost, GenericRepost].includes(event.kind)) {
    return;
  }
  let lastETag;
  let lastPTag;
  for (let i2 = event.tags.length - 1;i2 >= 0 && (lastETag === undefined || lastPTag === undefined); i2--) {
    const tag = event.tags[i2];
    if (tag.length >= 2) {
      if (tag[0] === "e" && lastETag === undefined) {
        lastETag = tag;
      } else if (tag[0] === "p" && lastPTag === undefined) {
        lastPTag = tag;
      }
    }
  }
  if (lastETag === undefined) {
    return;
  }
  return {
    id: lastETag[1],
    relays: [lastETag[2], lastPTag?.[2]].filter((x) => typeof x === "string"),
    author: lastPTag?.[1]
  };
}
function getRepostedEvent(event, { skipVerification } = {}) {
  const pointer = getRepostedEventPointer(event);
  if (pointer === undefined || event.content === "") {
    return;
  }
  let repostedEvent;
  try {
    repostedEvent = JSON.parse(event.content);
  } catch (error) {
    return;
  }
  if (repostedEvent.id !== pointer.id) {
    return;
  }
  if (!skipVerification && !verifyEvent(repostedEvent)) {
    return;
  }
  return repostedEvent;
}
var nip21_exports = {};
__export2(nip21_exports, {
  NOSTR_URI_REGEX: () => NOSTR_URI_REGEX,
  parse: () => parse2,
  test: () => test
});
var NOSTR_URI_REGEX = new RegExp(`nostr:(${BECH32_REGEX.source})`);
function test(value) {
  return typeof value === "string" && new RegExp(`^${NOSTR_URI_REGEX.source}$`).test(value);
}
function parse2(uri) {
  const match = uri.match(new RegExp(`^${NOSTR_URI_REGEX.source}$`));
  if (!match)
    throw new Error(`Invalid Nostr URI: ${uri}`);
  return {
    uri: match[0],
    value: match[1],
    decoded: decode(match[1])
  };
}
var nip25_exports = {};
__export2(nip25_exports, {
  finishReactionEvent: () => finishReactionEvent,
  getReactedEventPointer: () => getReactedEventPointer
});
function finishReactionEvent(t, reacted, privateKey) {
  const inheritedTags = reacted.tags.filter((tag) => tag.length >= 2 && (tag[0] === "e" || tag[0] === "p"));
  return finalizeEvent({
    ...t,
    kind: Reaction,
    tags: [...t.tags ?? [], ...inheritedTags, ["e", reacted.id], ["p", reacted.pubkey]],
    content: t.content ?? "+"
  }, privateKey);
}
function getReactedEventPointer(event) {
  if (event.kind !== Reaction) {
    return;
  }
  let lastETag;
  let lastPTag;
  for (let i2 = event.tags.length - 1;i2 >= 0 && (lastETag === undefined || lastPTag === undefined); i2--) {
    const tag = event.tags[i2];
    if (tag.length >= 2) {
      if (tag[0] === "e" && lastETag === undefined) {
        lastETag = tag;
      } else if (tag[0] === "p" && lastPTag === undefined) {
        lastPTag = tag;
      }
    }
  }
  if (lastETag === undefined || lastPTag === undefined) {
    return;
  }
  return {
    id: lastETag[1],
    relays: [lastETag[2], lastPTag[2]].filter((x) => x !== undefined),
    author: lastPTag[1]
  };
}
var nip27_exports = {};
__export2(nip27_exports, {
  parse: () => parse3
});
var noCharacter = /\W/m;
var noURLCharacter = /\W |\W$|$|,| /m;
var MAX_HASHTAG_LENGTH = 42;
function* parse3(content) {
  let emojis = [];
  if (typeof content !== "string") {
    for (let i2 = 0;i2 < content.tags.length; i2++) {
      const tag = content.tags[i2];
      if (tag[0] === "emoji" && tag.length >= 3) {
        emojis.push({ type: "emoji", shortcode: tag[1], url: tag[2] });
      }
    }
    content = content.content;
  }
  const max = content.length;
  let prevIndex = 0;
  let index = 0;
  mainloop:
    while (index < max) {
      const u = content.indexOf(":", index);
      const h = content.indexOf("#", index);
      if (u === -1 && h === -1) {
        break mainloop;
      }
      if (u === -1 || h >= 0 && h < u) {
        if (h === 0 || content[h - 1] === " ") {
          const m = content.slice(h + 1, h + MAX_HASHTAG_LENGTH).match(noCharacter);
          const end = m ? h + 1 + m.index : max;
          yield { type: "text", text: content.slice(prevIndex, h) };
          yield { type: "hashtag", value: content.slice(h + 1, end) };
          index = end;
          prevIndex = index;
          continue mainloop;
        }
        index = h + 1;
        continue mainloop;
      }
      if (content.slice(u - 5, u) === "nostr") {
        const m = content.slice(u + 60).match(noCharacter);
        const end = m ? u + 60 + m.index : max;
        try {
          let pointer;
          let { data, type } = decode(content.slice(u + 1, end));
          switch (type) {
            case "npub":
              pointer = { pubkey: data };
              break;
            case "nsec":
            case "note":
              index = end + 1;
              continue;
            default:
              pointer = data;
          }
          if (prevIndex !== u - 5) {
            yield { type: "text", text: content.slice(prevIndex, u - 5) };
          }
          yield { type: "reference", pointer };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = u + 1;
          continue mainloop;
        }
      } else if (content.slice(u - 5, u) === "https" || content.slice(u - 4, u) === "http") {
        const m = content.slice(u + 4).match(noURLCharacter);
        const end = m ? u + 4 + m.index : max;
        const prefixLen = content[u - 1] === "s" ? 5 : 4;
        try {
          let url = new URL(content.slice(u - prefixLen, end));
          if (url.hostname.indexOf(".") === -1) {
            throw new Error("invalid url");
          }
          if (prevIndex !== u - prefixLen) {
            yield { type: "text", text: content.slice(prevIndex, u - prefixLen) };
          }
          if (/\.(png|jpe?g|gif|webp|heic|svg)$/i.test(url.pathname)) {
            yield { type: "image", url: url.toString() };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          if (/\.(mp4|avi|webm|mkv|mov)$/i.test(url.pathname)) {
            yield { type: "video", url: url.toString() };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          if (/\.(mp3|aac|ogg|opus|wav|flac)$/i.test(url.pathname)) {
            yield { type: "audio", url: url.toString() };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          yield { type: "url", url: url.toString() };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = end + 1;
          continue mainloop;
        }
      } else if (content.slice(u - 3, u) === "wss" || content.slice(u - 2, u) === "ws") {
        const m = content.slice(u + 4).match(noURLCharacter);
        const end = m ? u + 4 + m.index : max;
        const prefixLen = content[u - 1] === "s" ? 3 : 2;
        try {
          let url = new URL(content.slice(u - prefixLen, end));
          if (url.hostname.indexOf(".") === -1) {
            throw new Error("invalid ws url");
          }
          if (prevIndex !== u - prefixLen) {
            yield { type: "text", text: content.slice(prevIndex, u - prefixLen) };
          }
          yield { type: "relay", url: url.toString() };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = end + 1;
          continue mainloop;
        }
      } else {
        for (let e = 0;e < emojis.length; e++) {
          const emoji = emojis[e];
          if (content[u + emoji.shortcode.length + 1] === ":" && content.slice(u + 1, u + emoji.shortcode.length + 1) === emoji.shortcode) {
            if (prevIndex !== u) {
              yield { type: "text", text: content.slice(prevIndex, u) };
            }
            yield emoji;
            index = u + emoji.shortcode.length + 2;
            prevIndex = index;
            continue mainloop;
          }
        }
        index = u + 1;
        continue mainloop;
      }
    }
  if (prevIndex !== max) {
    yield { type: "text", text: content.slice(prevIndex) };
  }
}
var nip28_exports = {};
__export2(nip28_exports, {
  channelCreateEvent: () => channelCreateEvent,
  channelHideMessageEvent: () => channelHideMessageEvent,
  channelMessageEvent: () => channelMessageEvent,
  channelMetadataEvent: () => channelMetadataEvent,
  channelMuteUserEvent: () => channelMuteUserEvent
});
var channelCreateEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return;
  }
  return finalizeEvent({
    kind: ChannelCreation,
    tags: [...t.tags ?? []],
    content,
    created_at: t.created_at
  }, privateKey);
};
var channelMetadataEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return;
  }
  return finalizeEvent({
    kind: ChannelMetadata,
    tags: [["e", t.channel_create_event_id], ...t.tags ?? []],
    content,
    created_at: t.created_at
  }, privateKey);
};
var channelMessageEvent = (t, privateKey) => {
  const tags = [["e", t.channel_create_event_id, t.relay_url, "root"]];
  if (t.reply_to_channel_message_event_id) {
    tags.push(["e", t.reply_to_channel_message_event_id, t.relay_url, "reply"]);
  }
  return finalizeEvent({
    kind: ChannelMessage,
    tags: [...tags, ...t.tags ?? []],
    content: t.content,
    created_at: t.created_at
  }, privateKey);
};
var channelHideMessageEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return;
  }
  return finalizeEvent({
    kind: ChannelHideMessage,
    tags: [["e", t.channel_message_event_id], ...t.tags ?? []],
    content,
    created_at: t.created_at
  }, privateKey);
};
var channelMuteUserEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return;
  }
  return finalizeEvent({
    kind: ChannelMuteUser,
    tags: [["p", t.pubkey_to_mute], ...t.tags ?? []],
    content,
    created_at: t.created_at
  }, privateKey);
};
var nip30_exports = {};
__export2(nip30_exports, {
  EMOJI_SHORTCODE_REGEX: () => EMOJI_SHORTCODE_REGEX,
  matchAll: () => matchAll,
  regex: () => regex,
  replaceAll: () => replaceAll
});
var EMOJI_SHORTCODE_REGEX = /:(\w+):/;
var regex = () => new RegExp(`\\B${EMOJI_SHORTCODE_REGEX.source}\\B`, "g");
function* matchAll(content) {
  const matches = content.matchAll(regex());
  for (const match of matches) {
    try {
      const [shortcode, name] = match;
      yield {
        shortcode,
        name,
        start: match.index,
        end: match.index + shortcode.length
      };
    } catch (_e) {}
  }
}
function replaceAll(content, replacer) {
  return content.replaceAll(regex(), (shortcode, name) => {
    return replacer({
      shortcode,
      name
    });
  });
}
var nip39_exports = {};
__export2(nip39_exports, {
  useFetchImplementation: () => useFetchImplementation3,
  validateGithub: () => validateGithub
});
var _fetch3;
try {
  _fetch3 = fetch;
} catch {}
function useFetchImplementation3(fetchImplementation) {
  _fetch3 = fetchImplementation;
}
async function validateGithub(pubkey, username, proof) {
  try {
    let res = await (await _fetch3(`https://gist.github.com/${username}/${proof}/raw`)).text();
    return res === `Verifying that I control the following Nostr public key: ${pubkey}`;
  } catch (_) {
    return false;
  }
}
var nip47_exports = {};
__export2(nip47_exports, {
  makeNwcRequestEvent: () => makeNwcRequestEvent,
  parseConnectionString: () => parseConnectionString
});
function parseConnectionString(connectionString) {
  const { host, pathname, searchParams } = new URL(connectionString);
  const pubkey = pathname || host;
  const relay = searchParams.get("relay");
  const secret = searchParams.get("secret");
  if (!pubkey || !relay || !secret) {
    throw new Error("invalid connection string");
  }
  return { pubkey, relay, secret };
}
async function makeNwcRequestEvent(pubkey, secretKey, invoice) {
  const content = {
    method: "pay_invoice",
    params: {
      invoice
    }
  };
  const encryptedContent = encrypt2(secretKey, pubkey, JSON.stringify(content));
  const eventTemplate = {
    kind: NWCWalletRequest,
    created_at: Math.round(Date.now() / 1000),
    content: encryptedContent,
    tags: [["p", pubkey]]
  };
  return finalizeEvent(eventTemplate, secretKey);
}
var nip54_exports = {};
__export2(nip54_exports, {
  normalizeIdentifier: () => normalizeIdentifier
});
function normalizeIdentifier(name) {
  name = name.trim().toLowerCase();
  name = name.normalize("NFKC");
  return Array.from(name).map((char) => {
    if (/\p{Letter}/u.test(char) || /\p{Number}/u.test(char)) {
      return char;
    }
    return "-";
  }).join("");
}
var nip57_exports = {};
__export2(nip57_exports, {
  getSatoshisAmountFromBolt11: () => getSatoshisAmountFromBolt11,
  getZapEndpoint: () => getZapEndpoint,
  makeZapReceipt: () => makeZapReceipt,
  makeZapRequest: () => makeZapRequest,
  useFetchImplementation: () => useFetchImplementation4,
  validateZapRequest: () => validateZapRequest
});
var _fetch4;
try {
  _fetch4 = fetch;
} catch {}
function useFetchImplementation4(fetchImplementation) {
  _fetch4 = fetchImplementation;
}
async function getZapEndpoint(metadata) {
  try {
    let lnurl = "";
    let { lud06, lud16 } = JSON.parse(metadata.content);
    if (lud16) {
      let [name, domain] = lud16.split("@");
      lnurl = new URL(`/.well-known/lnurlp/${name}`, `https://${domain}`).toString();
    } else if (lud06) {
      let { words } = bech32.decode(lud06, 1000);
      let data = bech32.fromWords(words);
      lnurl = utf8Decoder.decode(data);
    } else {
      return null;
    }
    let res = await _fetch4(lnurl);
    let body = await res.json();
    if (body.allowsNostr && body.nostrPubkey) {
      return body.callback;
    }
  } catch (err) {}
  return null;
}
function makeZapRequest(params) {
  let zr = {
    kind: 9734,
    created_at: Math.round(Date.now() / 1000),
    content: params.comment || "",
    tags: [
      ["p", "pubkey" in params ? params.pubkey : params.event.pubkey],
      ["amount", params.amount.toString()],
      ["relays", ...params.relays]
    ]
  };
  if ("event" in params) {
    zr.tags.push(["e", params.event.id]);
    if (isReplaceableKind(params.event.kind)) {
      const a = ["a", `${params.event.kind}:${params.event.pubkey}:`];
      zr.tags.push(a);
    } else if (isAddressableKind(params.event.kind)) {
      let d = params.event.tags.find(([t, v]) => t === "d" && v);
      if (!d)
        throw new Error("d tag not found or is empty");
      const a = ["a", `${params.event.kind}:${params.event.pubkey}:${d[1]}`];
      zr.tags.push(a);
    }
    zr.tags.push(["k", params.event.kind.toString()]);
  }
  return zr;
}
function validateZapRequest(zapRequestString) {
  let zapRequest;
  try {
    zapRequest = JSON.parse(zapRequestString);
  } catch (err) {
    return "Invalid zap request JSON.";
  }
  if (!validateEvent(zapRequest))
    return "Zap request is not a valid Nostr event.";
  if (!verifyEvent(zapRequest))
    return "Invalid signature on zap request.";
  let p = zapRequest.tags.find(([t, v]) => t === "p" && v);
  if (!p)
    return "Zap request doesn't have a 'p' tag.";
  if (!p[1].match(/^[a-f0-9]{64}$/))
    return "Zap request 'p' tag is not valid hex.";
  let e = zapRequest.tags.find(([t, v]) => t === "e" && v);
  if (e && !e[1].match(/^[a-f0-9]{64}$/))
    return "Zap request 'e' tag is not valid hex.";
  let relays = zapRequest.tags.find(([t, v]) => t === "relays" && v);
  if (!relays)
    return "Zap request doesn't have a 'relays' tag.";
  return null;
}
function makeZapReceipt({
  zapRequest,
  preimage,
  bolt11,
  paidAt
}) {
  let zr = JSON.parse(zapRequest);
  let tagsFromZapRequest = zr.tags.filter(([t]) => t === "e" || t === "p" || t === "a");
  let zap = {
    kind: 9735,
    created_at: Math.round(paidAt.getTime() / 1000),
    content: "",
    tags: [...tagsFromZapRequest, ["P", zr.pubkey], ["bolt11", bolt11], ["description", zapRequest]]
  };
  if (preimage) {
    zap.tags.push(["preimage", preimage]);
  }
  return zap;
}
function getSatoshisAmountFromBolt11(bolt11) {
  if (bolt11.length < 50) {
    return 0;
  }
  bolt11 = bolt11.substring(0, 50);
  const idx = bolt11.lastIndexOf("1");
  if (idx === -1) {
    return 0;
  }
  const hrp = bolt11.substring(0, idx);
  if (!hrp.startsWith("lnbc")) {
    return 0;
  }
  const amount = hrp.substring(4);
  if (amount.length < 1) {
    return 0;
  }
  const char = amount[amount.length - 1];
  const digit = char.charCodeAt(0) - 48;
  const isDigit = digit >= 0 && digit <= 9;
  let cutPoint = amount.length - 1;
  if (isDigit) {
    cutPoint++;
  }
  if (cutPoint < 1) {
    return 0;
  }
  const num = parseInt(amount.substring(0, cutPoint));
  switch (char) {
    case "m":
      return num * 1e5;
    case "u":
      return num * 100;
    case "n":
      return num / 10;
    case "p":
      return num / 1e4;
    default:
      return num * 1e8;
  }
}
var nip77_exports = {};
__export2(nip77_exports, {
  Negentropy: () => Negentropy,
  NegentropyStorageVector: () => NegentropyStorageVector,
  NegentropySync: () => NegentropySync
});
var PROTOCOL_VERSION = 97;
var ID_SIZE = 32;
var FINGERPRINT_SIZE = 16;
var Mode = {
  Skip: 0,
  Fingerprint: 1,
  IdList: 2
};
var WrappedBuffer = class {
  _raw;
  length;
  constructor(buffer) {
    if (typeof buffer === "number") {
      this._raw = new Uint8Array(buffer);
      this.length = 0;
    } else if (buffer instanceof Uint8Array) {
      this._raw = new Uint8Array(buffer);
      this.length = buffer.length;
    } else {
      this._raw = new Uint8Array(512);
      this.length = 0;
    }
  }
  unwrap() {
    return this._raw.subarray(0, this.length);
  }
  get capacity() {
    return this._raw.byteLength;
  }
  extend(buf) {
    if (buf instanceof WrappedBuffer)
      buf = buf.unwrap();
    if (typeof buf.length !== "number")
      throw Error("bad length");
    const targetSize = buf.length + this.length;
    if (this.capacity < targetSize) {
      const oldRaw = this._raw;
      const newCapacity = Math.max(this.capacity * 2, targetSize);
      this._raw = new Uint8Array(newCapacity);
      this._raw.set(oldRaw);
    }
    this._raw.set(buf, this.length);
    this.length += buf.length;
  }
  shift() {
    const first = this._raw[0];
    this._raw = this._raw.subarray(1);
    this.length--;
    return first;
  }
  shiftN(n = 1) {
    const firstSubarray = this._raw.subarray(0, n);
    this._raw = this._raw.subarray(n);
    this.length -= n;
    return firstSubarray;
  }
};
function decodeVarInt(buf) {
  let res = 0;
  while (true) {
    if (buf.length === 0)
      throw Error("parse ends prematurely");
    let byte = buf.shift();
    res = res << 7 | byte & 127;
    if ((byte & 128) === 0)
      break;
  }
  return res;
}
function encodeVarInt(n) {
  if (n === 0)
    return new WrappedBuffer(new Uint8Array([0]));
  let o = [];
  while (n !== 0) {
    o.push(n & 127);
    n >>>= 7;
  }
  o.reverse();
  for (let i2 = 0;i2 < o.length - 1; i2++)
    o[i2] |= 128;
  return new WrappedBuffer(new Uint8Array(o));
}
function getByte(buf) {
  return getBytes(buf, 1)[0];
}
function getBytes(buf, n) {
  if (buf.length < n)
    throw Error("parse ends prematurely");
  return buf.shiftN(n);
}
var Accumulator = class {
  buf;
  constructor() {
    this.setToZero();
  }
  setToZero() {
    this.buf = new Uint8Array(ID_SIZE);
  }
  add(otherBuf) {
    let currCarry = 0, nextCarry = 0;
    let p = new DataView(this.buf.buffer);
    let po = new DataView(otherBuf.buffer);
    for (let i2 = 0;i2 < 8; i2++) {
      let offset = i2 * 4;
      let orig = p.getUint32(offset, true);
      let otherV = po.getUint32(offset, true);
      let next = orig;
      next += currCarry;
      next += otherV;
      if (next > 4294967295)
        nextCarry = 1;
      p.setUint32(offset, next & 4294967295, true);
      currCarry = nextCarry;
      nextCarry = 0;
    }
  }
  negate() {
    let p = new DataView(this.buf.buffer);
    for (let i2 = 0;i2 < 8; i2++) {
      let offset = i2 * 4;
      p.setUint32(offset, ~p.getUint32(offset, true));
    }
    let one = new Uint8Array(ID_SIZE);
    one[0] = 1;
    this.add(one);
  }
  getFingerprint(n) {
    let input = new WrappedBuffer;
    input.extend(this.buf);
    input.extend(encodeVarInt(n));
    let hash3 = sha2562(input.unwrap());
    return hash3.subarray(0, FINGERPRINT_SIZE);
  }
};
var NegentropyStorageVector = class {
  items;
  sealed;
  constructor() {
    this.items = [];
    this.sealed = false;
  }
  insert(timestamp, id) {
    if (this.sealed)
      throw Error("already sealed");
    const idb = hexToBytes4(id);
    if (idb.byteLength !== ID_SIZE)
      throw Error("bad id size for added item");
    this.items.push({ timestamp, id: idb });
  }
  seal() {
    if (this.sealed)
      throw Error("already sealed");
    this.sealed = true;
    this.items.sort(itemCompare);
    for (let i2 = 1;i2 < this.items.length; i2++) {
      if (itemCompare(this.items[i2 - 1], this.items[i2]) === 0)
        throw Error("duplicate item inserted");
    }
  }
  unseal() {
    this.sealed = false;
  }
  size() {
    this._checkSealed();
    return this.items.length;
  }
  getItem(i2) {
    this._checkSealed();
    if (i2 >= this.items.length)
      throw Error("out of range");
    return this.items[i2];
  }
  iterate(begin, end, cb) {
    this._checkSealed();
    this._checkBounds(begin, end);
    for (let i2 = begin;i2 < end; ++i2) {
      if (!cb(this.items[i2], i2))
        break;
    }
  }
  findLowerBound(begin, end, bound) {
    this._checkSealed();
    this._checkBounds(begin, end);
    return this._binarySearch(this.items, begin, end, (a) => itemCompare(a, bound) < 0);
  }
  fingerprint(begin, end) {
    let out = new Accumulator;
    out.setToZero();
    this.iterate(begin, end, (item) => {
      out.add(item.id);
      return true;
    });
    return out.getFingerprint(end - begin);
  }
  _checkSealed() {
    if (!this.sealed)
      throw Error("not sealed");
  }
  _checkBounds(begin, end) {
    if (begin > end || end > this.items.length)
      throw Error("bad range");
  }
  _binarySearch(arr, first, last, cmp) {
    let count = last - first;
    while (count > 0) {
      let it = first;
      let step = Math.floor(count / 2);
      it += step;
      if (cmp(arr[it])) {
        first = ++it;
        count -= step + 1;
      } else {
        count = step;
      }
    }
    return first;
  }
};
var Negentropy = class {
  storage;
  frameSizeLimit;
  lastTimestampIn;
  lastTimestampOut;
  constructor(storage, frameSizeLimit = 60000) {
    if (frameSizeLimit < 4096)
      throw Error("frameSizeLimit too small");
    this.storage = storage;
    this.frameSizeLimit = frameSizeLimit;
    this.lastTimestampIn = 0;
    this.lastTimestampOut = 0;
  }
  _bound(timestamp, id) {
    return { timestamp, id: id || new Uint8Array(0) };
  }
  initiate() {
    let output4 = new WrappedBuffer;
    output4.extend(new Uint8Array([PROTOCOL_VERSION]));
    this.splitRange(0, this.storage.size(), this._bound(Number.MAX_VALUE), output4);
    return bytesToHex3(output4.unwrap());
  }
  reconcile(queryMsg, onhave, onneed) {
    const query = new WrappedBuffer(hexToBytes4(queryMsg));
    this.lastTimestampIn = this.lastTimestampOut = 0;
    let fullOutput = new WrappedBuffer;
    fullOutput.extend(new Uint8Array([PROTOCOL_VERSION]));
    let protocolVersion = getByte(query);
    if (protocolVersion < 96 || protocolVersion > 111)
      throw Error("invalid negentropy protocol version byte");
    if (protocolVersion !== PROTOCOL_VERSION) {
      throw Error("unsupported negentropy protocol version requested: " + (protocolVersion - 96));
    }
    let storageSize = this.storage.size();
    let prevBound = this._bound(0);
    let prevIndex = 0;
    let skip = false;
    while (query.length !== 0) {
      let o = new WrappedBuffer;
      let doSkip = () => {
        if (skip) {
          skip = false;
          o.extend(this.encodeBound(prevBound));
          o.extend(encodeVarInt(Mode.Skip));
        }
      };
      let currBound = this.decodeBound(query);
      let mode = decodeVarInt(query);
      let lower = prevIndex;
      let upper = this.storage.findLowerBound(prevIndex, storageSize, currBound);
      if (mode === Mode.Skip) {
        skip = true;
      } else if (mode === Mode.Fingerprint) {
        let theirFingerprint = getBytes(query, FINGERPRINT_SIZE);
        let ourFingerprint = this.storage.fingerprint(lower, upper);
        if (compareUint8Array(theirFingerprint, ourFingerprint) !== 0) {
          doSkip();
          this.splitRange(lower, upper, currBound, o);
        } else {
          skip = true;
        }
      } else if (mode === Mode.IdList) {
        let numIds = decodeVarInt(query);
        let theirElems = {};
        for (let i2 = 0;i2 < numIds; i2++) {
          let e = getBytes(query, ID_SIZE);
          theirElems[bytesToHex3(e)] = e;
        }
        skip = true;
        this.storage.iterate(lower, upper, (item) => {
          let k = item.id;
          const id = bytesToHex3(k);
          if (!theirElems[id]) {
            onhave?.(id);
          } else {
            delete theirElems[bytesToHex3(k)];
          }
          return true;
        });
        if (onneed) {
          for (let v of Object.values(theirElems)) {
            onneed(bytesToHex3(v));
          }
        }
      } else {
        throw Error("unexpected mode");
      }
      if (this.exceededFrameSizeLimit(fullOutput.length + o.length)) {
        let remainingFingerprint = this.storage.fingerprint(upper, storageSize);
        fullOutput.extend(this.encodeBound(this._bound(Number.MAX_VALUE)));
        fullOutput.extend(encodeVarInt(Mode.Fingerprint));
        fullOutput.extend(remainingFingerprint);
        break;
      } else {
        fullOutput.extend(o);
      }
      prevIndex = upper;
      prevBound = currBound;
    }
    return fullOutput.length === 1 ? null : bytesToHex3(fullOutput.unwrap());
  }
  splitRange(lower, upper, upperBound, o) {
    let numElems = upper - lower;
    let buckets = 16;
    if (numElems < buckets * 2) {
      o.extend(this.encodeBound(upperBound));
      o.extend(encodeVarInt(Mode.IdList));
      o.extend(encodeVarInt(numElems));
      this.storage.iterate(lower, upper, (item) => {
        o.extend(item.id);
        return true;
      });
    } else {
      let itemsPerBucket = Math.floor(numElems / buckets);
      let bucketsWithExtra = numElems % buckets;
      let curr = lower;
      for (let i2 = 0;i2 < buckets; i2++) {
        let bucketSize = itemsPerBucket + (i2 < bucketsWithExtra ? 1 : 0);
        let ourFingerprint = this.storage.fingerprint(curr, curr + bucketSize);
        curr += bucketSize;
        let nextBound;
        if (curr === upper) {
          nextBound = upperBound;
        } else {
          let prevItem;
          let currItem;
          this.storage.iterate(curr - 1, curr + 1, (item, index) => {
            if (index === curr - 1)
              prevItem = item;
            else
              currItem = item;
            return true;
          });
          nextBound = this.getMinimalBound(prevItem, currItem);
        }
        o.extend(this.encodeBound(nextBound));
        o.extend(encodeVarInt(Mode.Fingerprint));
        o.extend(ourFingerprint);
      }
    }
  }
  exceededFrameSizeLimit(n) {
    return n > this.frameSizeLimit - 200;
  }
  decodeTimestampIn(encoded) {
    let timestamp = decodeVarInt(encoded);
    timestamp = timestamp === 0 ? Number.MAX_VALUE : timestamp - 1;
    if (this.lastTimestampIn === Number.MAX_VALUE || timestamp === Number.MAX_VALUE) {
      this.lastTimestampIn = Number.MAX_VALUE;
      return Number.MAX_VALUE;
    }
    timestamp += this.lastTimestampIn;
    this.lastTimestampIn = timestamp;
    return timestamp;
  }
  decodeBound(encoded) {
    let timestamp = this.decodeTimestampIn(encoded);
    let len = decodeVarInt(encoded);
    if (len > ID_SIZE)
      throw Error("bound key too long");
    let id = getBytes(encoded, len);
    return { timestamp, id };
  }
  encodeTimestampOut(timestamp) {
    if (timestamp === Number.MAX_VALUE) {
      this.lastTimestampOut = Number.MAX_VALUE;
      return encodeVarInt(0);
    }
    let temp = timestamp;
    timestamp -= this.lastTimestampOut;
    this.lastTimestampOut = temp;
    return encodeVarInt(timestamp + 1);
  }
  encodeBound(key) {
    let output4 = new WrappedBuffer;
    output4.extend(this.encodeTimestampOut(key.timestamp));
    output4.extend(encodeVarInt(key.id.length));
    output4.extend(key.id);
    return output4;
  }
  getMinimalBound(prev, curr) {
    if (curr.timestamp !== prev.timestamp) {
      return this._bound(curr.timestamp);
    } else {
      let sharedPrefixBytes = 0;
      let currKey = curr.id;
      let prevKey = prev.id;
      for (let i2 = 0;i2 < ID_SIZE; i2++) {
        if (currKey[i2] !== prevKey[i2])
          break;
        sharedPrefixBytes++;
      }
      return this._bound(curr.timestamp, curr.id.subarray(0, sharedPrefixBytes + 1));
    }
  }
};
function compareUint8Array(a, b) {
  for (let i2 = 0;i2 < a.byteLength; i2++) {
    if (a[i2] < b[i2])
      return -1;
    if (a[i2] > b[i2])
      return 1;
  }
  if (a.byteLength > b.byteLength)
    return 1;
  if (a.byteLength < b.byteLength)
    return -1;
  return 0;
}
function itemCompare(a, b) {
  if (a.timestamp === b.timestamp) {
    return compareUint8Array(a.id, b.id);
  }
  return a.timestamp - b.timestamp;
}
var NegentropySync = class {
  relay;
  storage;
  neg;
  filter;
  subscription;
  onhave;
  onneed;
  constructor(relay, storage, filter, params = {}) {
    this.relay = relay;
    this.storage = storage;
    this.neg = new Negentropy(storage);
    this.onhave = params.onhave;
    this.onneed = params.onneed;
    this.filter = filter;
    this.subscription = this.relay.prepareSubscription([{}], { label: params.label || "negentropy" });
    this.subscription.oncustom = (data) => {
      switch (data[0]) {
        case "NEG-MSG": {
          if (data.length < 3) {
            console.warn(`got invalid NEG-MSG from ${this.relay.url}: ${data}`);
          }
          try {
            const response = this.neg.reconcile(data[2], this.onhave, this.onneed);
            if (response) {
              this.relay.send(`["NEG-MSG", "${this.subscription.id}", "${response}"]`);
            } else {
              this.close();
              params.onclose?.();
            }
          } catch (error) {
            console.error("negentropy reconcile error:", error);
            params?.onclose?.(`reconcile error: ${error}`);
          }
          break;
        }
        case "NEG-CLOSE": {
          const reason = data[2];
          console.warn("negentropy error:", reason);
          params.onclose?.(reason);
          break;
        }
        case "NEG-ERR": {
          params.onclose?.();
        }
      }
    };
  }
  async start() {
    const initMsg = this.neg.initiate();
    this.relay.send(`["NEG-OPEN","${this.subscription.id}",${JSON.stringify(this.filter)},"${initMsg}"]`);
  }
  close() {
    this.relay.send(`["NEG-CLOSE","${this.subscription.id}"]`);
    this.subscription.close();
  }
};
var nip98_exports = {};
__export2(nip98_exports, {
  getToken: () => getToken,
  hashPayload: () => hashPayload,
  unpackEventFromToken: () => unpackEventFromToken,
  validateEvent: () => validateEvent2,
  validateEventKind: () => validateEventKind,
  validateEventMethodTag: () => validateEventMethodTag,
  validateEventPayloadTag: () => validateEventPayloadTag,
  validateEventTimestamp: () => validateEventTimestamp,
  validateEventUrlTag: () => validateEventUrlTag,
  validateToken: () => validateToken
});
var _authorizationScheme = "Nostr ";
async function getToken(loginUrl, httpMethod, sign, includeAuthorizationScheme = false, payload) {
  const event = {
    kind: HTTPAuth,
    tags: [
      ["u", loginUrl],
      ["method", httpMethod]
    ],
    created_at: Math.round(new Date().getTime() / 1000),
    content: ""
  };
  if (payload) {
    event.tags.push(["payload", hashPayload(payload)]);
  }
  const signedEvent = await sign(event);
  const authorizationScheme = includeAuthorizationScheme ? _authorizationScheme : "";
  return authorizationScheme + base64.encode(utf8Encoder.encode(JSON.stringify(signedEvent)));
}
async function validateToken(token, url, method) {
  const event = await unpackEventFromToken(token).catch((error) => {
    throw error;
  });
  const valid = await validateEvent2(event, url, method).catch((error) => {
    throw error;
  });
  return valid;
}
async function unpackEventFromToken(token) {
  if (!token) {
    throw new Error("Missing token");
  }
  token = token.replace(_authorizationScheme, "");
  const eventB64 = utf8Decoder.decode(base64.decode(token));
  if (!eventB64 || eventB64.length === 0 || !eventB64.startsWith("{")) {
    throw new Error("Invalid token");
  }
  const event = JSON.parse(eventB64);
  return event;
}
function validateEventTimestamp(event) {
  if (!event.created_at) {
    return false;
  }
  return Math.round(new Date().getTime() / 1000) - event.created_at < 60;
}
function validateEventKind(event) {
  return event.kind === HTTPAuth;
}
function validateEventUrlTag(event, url) {
  const urlTag = event.tags.find((t) => t[0] === "u");
  if (!urlTag) {
    return false;
  }
  return urlTag.length > 0 && urlTag[1] === url;
}
function validateEventMethodTag(event, method) {
  const methodTag = event.tags.find((t) => t[0] === "method");
  if (!methodTag) {
    return false;
  }
  return methodTag.length > 0 && methodTag[1].toLowerCase() === method.toLowerCase();
}
function hashPayload(payload) {
  const hash3 = sha2562(utf8Encoder.encode(JSON.stringify(payload)));
  return bytesToHex2(hash3);
}
function validateEventPayloadTag(event, payload) {
  const payloadTag = event.tags.find((t) => t[0] === "payload");
  if (!payloadTag) {
    return false;
  }
  const payloadHash = hashPayload(payload);
  return payloadTag.length > 0 && payloadTag[1] === payloadHash;
}
async function validateEvent2(event, url, method, body) {
  if (!verifyEvent(event)) {
    throw new Error("Invalid nostr event, signature invalid");
  }
  if (!validateEventKind(event)) {
    throw new Error("Invalid nostr event, kind invalid");
  }
  if (!validateEventTimestamp(event)) {
    throw new Error("Invalid nostr event, created_at timestamp invalid");
  }
  if (!validateEventUrlTag(event, url)) {
    throw new Error("Invalid nostr event, url tag invalid");
  }
  if (!validateEventMethodTag(event, method)) {
    throw new Error("Invalid nostr event, method tag invalid");
  }
  if (Boolean(body) && typeof body === "object" && Object.keys(body).length > 0) {
    if (!validateEventPayloadTag(event, body)) {
      throw new Error("Invalid nostr event, payload tag does not match request body hash");
    }
  }
  return true;
}

// ../node_modules/@noble/hashes/esm/crypto.js
var crypto4 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : undefined;

// ../node_modules/@noble/hashes/esm/utils.js
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes(b, ...lengths) {
  if (!isBytes2(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean(...arrays) {
  for (let i2 = 0;i2 < arrays.length; i2++) {
    arrays[i2].fill(0);
  }
}
function createView4(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr3(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
var hexes4 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i2) => i2.toString(16).padStart(2, "0"));
function bytesToHex4(bytes4) {
  abytes(bytes4);
  if (hasHexBuiltin)
    return bytes4.toHex();
  let hex2 = "";
  for (let i2 = 0;i2 < bytes4.length; i2++) {
    hex2 += hexes4[bytes4[i2]];
  }
  return hex2;
}
var asciis2 = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase162(ch) {
  if (ch >= asciis2._0 && ch <= asciis2._9)
    return ch - asciis2._0;
  if (ch >= asciis2.A && ch <= asciis2.F)
    return ch - (asciis2.A - 10);
  if (ch >= asciis2.a && ch <= asciis2.f)
    return ch - (asciis2.a - 10);
  return;
}
function hexToBytes5(hex2) {
  if (typeof hex2 !== "string")
    throw new Error("hex string expected, got " + typeof hex2);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex2);
  const hl = hex2.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
    const n1 = asciiToBase162(hex2.charCodeAt(hi));
    const n2 = asciiToBase162(hex2.charCodeAt(hi + 1));
    if (n1 === undefined || n2 === undefined) {
      const char = hex2[hi] + hex2[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function utf8ToBytes5(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes4(data) {
  if (typeof data === "string")
    data = utf8ToBytes5(data);
  abytes(data);
  return data;
}
function concatBytes4(...arrays) {
  let sum = 0;
  for (let i2 = 0;i2 < arrays.length; i2++) {
    const a = arrays[i2];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i2 = 0, pad2 = 0;i2 < arrays.length; i2++) {
    const a = arrays[i2];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
class Hash3 {
}
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes4(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes3(bytesLength = 32) {
  if (crypto4 && typeof crypto4.getRandomValues === "function") {
    return crypto4.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto4 && typeof crypto4.randomBytes === "function") {
    return Uint8Array.from(crypto4.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}

// ../node_modules/@noble/hashes/esm/_md.js
function setBigUint644(view, byteOffset, value, isLE4) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE4);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE4 ? 4 : 0;
  const l = isLE4 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE4);
  view.setUint32(byteOffset + l, wl, isLE4);
}
function Chi3(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj3(a, b, c) {
  return a & b ^ a & c ^ b & c;
}

class HashMD extends Hash3 {
  constructor(blockLen, outputLen, padOffset, isLE4) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE4;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView4(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes4(data);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0;pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView4(data);
        for (;blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE4 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i2 = pos;i2 < blockLen; i2++)
      buffer[i2] = 0;
    setBigUint644(view, blockLen - 8, BigInt(this.length * 8), isLE4);
    this.process(view, 0);
    const oview = createView4(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i2 = 0;i2 < outLen; i2++)
      oview.setUint32(4 * i2, state[i2], isLE4);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor);
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
}
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// ../node_modules/@noble/hashes/esm/sha2.js
var SHA256_K3 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W3 = /* @__PURE__ */ new Uint32Array(64);

class SHA2563 extends HashMD {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i2 = 0;i2 < 16; i2++, offset += 4)
      SHA256_W3[i2] = view.getUint32(offset, false);
    for (let i2 = 16;i2 < 64; i2++) {
      const W15 = SHA256_W3[i2 - 15];
      const W2 = SHA256_W3[i2 - 2];
      const s0 = rotr3(W15, 7) ^ rotr3(W15, 18) ^ W15 >>> 3;
      const s1 = rotr3(W2, 17) ^ rotr3(W2, 19) ^ W2 >>> 10;
      SHA256_W3[i2] = s1 + SHA256_W3[i2 - 7] + s0 + SHA256_W3[i2 - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i2 = 0;i2 < 64; i2++) {
      const sigma1 = rotr3(E, 6) ^ rotr3(E, 11) ^ rotr3(E, 25);
      const T1 = H + sigma1 + Chi3(E, F, G) + SHA256_K3[i2] + SHA256_W3[i2] | 0;
      const sigma0 = rotr3(A, 2) ^ rotr3(A, 13) ^ rotr3(A, 22);
      const T2 = sigma0 + Maj3(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W3);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
}
var sha2563 = /* @__PURE__ */ createHasher(() => new SHA2563);

// ../node_modules/@noble/hashes/esm/hmac.js
class HMAC3 extends Hash3 {
  constructor(hash3, _key) {
    super();
    this.finished = false;
    this.destroyed = false;
    ahash(hash3);
    const key = toBytes4(_key);
    this.iHash = hash3.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad2 = new Uint8Array(blockLen);
    pad2.set(key.length > blockLen ? hash3.create().update(key).digest() : key);
    for (let i2 = 0;i2 < pad2.length; i2++)
      pad2[i2] ^= 54;
    this.iHash.update(pad2);
    this.oHash = hash3.create();
    for (let i2 = 0;i2 < pad2.length; i2++)
      pad2[i2] ^= 54 ^ 92;
    this.oHash.update(pad2);
    clean(pad2);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    abytes(out, this.outputLen);
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
}
var hmac3 = (hash3, key, message) => new HMAC3(hash3, key).update(message).digest();
hmac3.create = (hash3, key) => new HMAC3(hash3, key);

// ../node_modules/@noble/curves/esm/utils.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n6 = /* @__PURE__ */ BigInt(0);
var _1n6 = /* @__PURE__ */ BigInt(1);
function _abool2(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}"`;
    throw new Error(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function _abytes2(value, length, title = "") {
  const bytes4 = isBytes2(value);
  const len = value?.length;
  const needsLen = length !== undefined;
  if (!bytes4 || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes4 ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function numberToHexUnpadded2(num) {
  const hex2 = num.toString(16);
  return hex2.length & 1 ? "0" + hex2 : hex2;
}
function hexToNumber2(hex2) {
  if (typeof hex2 !== "string")
    throw new Error("hex string expected, got " + typeof hex2);
  return hex2 === "" ? _0n6 : BigInt("0x" + hex2);
}
function bytesToNumberBE2(bytes4) {
  return hexToNumber2(bytesToHex4(bytes4));
}
function bytesToNumberLE2(bytes4) {
  abytes(bytes4);
  return hexToNumber2(bytesToHex4(Uint8Array.from(bytes4).reverse()));
}
function numberToBytesBE2(n, len) {
  return hexToBytes5(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE2(n, len) {
  return numberToBytesBE2(n, len).reverse();
}
function ensureBytes2(title, hex2, expectedLength) {
  let res;
  if (typeof hex2 === "string") {
    try {
      res = hexToBytes5(hex2);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes2(hex2)) {
    res = Uint8Array.from(hex2);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
var isPosBig = (n) => typeof n === "bigint" && _0n6 <= n;
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen2(n) {
  let len;
  for (len = 0;n > _0n6; n >>= _1n6, len += 1)
    ;
  return len;
}
var bitMask2 = (n) => (_1n6 << BigInt(n)) - _1n6;
function createHmacDrbg2(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  const u8n2 = (len) => new Uint8Array(len);
  const u8of = (byte) => Uint8Array.of(byte);
  let v = u8n2(hashLen);
  let k = u8n2(hashLen);
  let i2 = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i2 = 0;
  };
  const h = (...b) => hmacFn(k, v, ...b);
  const reseed = (seed = u8n2(0)) => {
    k = h(u8of(0), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8of(1), seed);
    v = h();
  };
  const gen = () => {
    if (i2++ >= 1000)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes4(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = undefined;
    while (!(res = pred(gen())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function _validateObject(object, fields, optFields = {}) {
  if (!object || typeof object !== "object")
    throw new Error("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    const val = object[fieldName];
    if (isOpt && val === undefined)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
  Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
}
function memoized(fn) {
  const map = new WeakMap;
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== undefined)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}

// ../node_modules/@noble/curves/esm/abstract/modular.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n7 = BigInt(0);
var _1n7 = BigInt(1);
var _2n5 = /* @__PURE__ */ BigInt(2);
var _3n3 = /* @__PURE__ */ BigInt(3);
var _4n3 = /* @__PURE__ */ BigInt(4);
var _5n2 = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n2 = /* @__PURE__ */ BigInt(8);
var _9n2 = /* @__PURE__ */ BigInt(9);
var _16n2 = /* @__PURE__ */ BigInt(16);
function mod2(a, b) {
  const result = a % b;
  return result >= _0n7 ? result : b + result;
}
function pow22(x, power, modulo) {
  let res = x;
  while (power-- > _0n7) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert2(number4, modulo) {
  if (number4 === _0n7)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n7)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod2(number4, modulo);
  let b = modulo;
  let x = _0n7, y = _1n7, u = _1n7, v = _0n7;
  while (a !== _0n7) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd2 = b;
  if (gcd2 !== _1n7)
    throw new Error("invert: does not exist");
  return mod2(x, modulo);
}
function assertIsSquare(Fp2, root, n) {
  if (!Fp2.eql(Fp2.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp2, n) {
  const p1div4 = (Fp2.ORDER + _1n7) / _4n3;
  const root = Fp2.pow(n, p1div4);
  assertIsSquare(Fp2, root, n);
  return root;
}
function sqrt5mod8(Fp2, n) {
  const p5div8 = (Fp2.ORDER - _5n2) / _8n2;
  const n2 = Fp2.mul(n, _2n5);
  const v = Fp2.pow(n2, p5div8);
  const nv = Fp2.mul(n, v);
  const i2 = Fp2.mul(Fp2.mul(nv, _2n5), v);
  const root = Fp2.mul(nv, Fp2.sub(i2, Fp2.ONE));
  assertIsSquare(Fp2, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field2(P);
  const tn = tonelliShanks2(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n2;
  return (Fp2, n) => {
    let tv1 = Fp2.pow(n, c4);
    let tv2 = Fp2.mul(tv1, c1);
    const tv3 = Fp2.mul(tv1, c2);
    const tv4 = Fp2.mul(tv1, c3);
    const e1 = Fp2.eql(Fp2.sqr(tv2), n);
    const e2 = Fp2.eql(Fp2.sqr(tv3), n);
    tv1 = Fp2.cmov(tv1, tv2, e1);
    tv2 = Fp2.cmov(tv4, tv3, e2);
    const e3 = Fp2.eql(Fp2.sqr(tv2), n);
    const root = Fp2.cmov(tv1, tv2, e3);
    assertIsSquare(Fp2, root, n);
    return root;
  };
}
function tonelliShanks2(P) {
  if (P < _3n3)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n7;
  let S = 0;
  while (Q % _2n5 === _0n7) {
    Q /= _2n5;
    S++;
  }
  let Z = _2n5;
  const _Fp = Field2(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1000)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n7) / _2n5;
  return function tonelliSlow(Fp2, n) {
    if (Fp2.is0(n))
      return n;
    if (FpLegendre(Fp2, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp2.mul(Fp2.ONE, cc);
    let t = Fp2.pow(n, Q);
    let R = Fp2.pow(n, Q1div2);
    while (!Fp2.eql(t, Fp2.ONE)) {
      if (Fp2.is0(t))
        return Fp2.ZERO;
      let i2 = 1;
      let t_tmp = Fp2.sqr(t);
      while (!Fp2.eql(t_tmp, Fp2.ONE)) {
        i2++;
        t_tmp = Fp2.sqr(t_tmp);
        if (i2 === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n7 << BigInt(M - i2 - 1);
      const b = Fp2.pow(c, exponent);
      M = i2;
      c = Fp2.sqr(b);
      t = Fp2.mul(t, c);
      R = Fp2.mul(R, b);
    }
    return R;
  };
}
function FpSqrt2(P) {
  if (P % _4n3 === _3n3)
    return sqrt3mod4;
  if (P % _8n2 === _5n2)
    return sqrt5mod8;
  if (P % _16n2 === _9n2)
    return sqrt9mod16(P);
  return tonelliShanks2(P);
}
var FIELD_FIELDS2 = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField2(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS2.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  _validateObject(field, opts);
  return field;
}
function FpPow2(Fp2, num, power) {
  if (power < _0n7)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n7)
    return Fp2.ONE;
  if (power === _1n7)
    return num;
  let p = Fp2.ONE;
  let d = num;
  while (power > _0n7) {
    if (power & _1n7)
      p = Fp2.mul(p, d);
    d = Fp2.sqr(d);
    power >>= _1n7;
  }
  return p;
}
function FpInvertBatch2(Fp2, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp2.ZERO : undefined);
  const multipliedAcc = nums.reduce((acc, num, i2) => {
    if (Fp2.is0(num))
      return acc;
    inverted[i2] = acc;
    return Fp2.mul(acc, num);
  }, Fp2.ONE);
  const invertedAcc = Fp2.inv(multipliedAcc);
  nums.reduceRight((acc, num, i2) => {
    if (Fp2.is0(num))
      return acc;
    inverted[i2] = Fp2.mul(acc, inverted[i2]);
    return Fp2.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp2, n) {
  const p1mod2 = (Fp2.ORDER - _1n7) / _2n5;
  const powered = Fp2.pow(n, p1mod2);
  const yes = Fp2.eql(powered, Fp2.ONE);
  const zero = Fp2.eql(powered, Fp2.ZERO);
  const no = Fp2.eql(powered, Fp2.neg(Fp2.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength2(n, nBitLength) {
  if (nBitLength !== undefined)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field2(ORDER, bitLenOrOpts, isLE4 = false, opts = {}) {
  if (ORDER <= _0n7)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  let _nbitLength = undefined;
  let _sqrt = undefined;
  let modFromBytes = false;
  let allowedLengths = undefined;
  if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
    if (opts.sqrt || isLE4)
      throw new Error("cannot specify opts in two arguments");
    const _opts = bitLenOrOpts;
    if (_opts.BITS)
      _nbitLength = _opts.BITS;
    if (_opts.sqrt)
      _sqrt = _opts.sqrt;
    if (typeof _opts.isLE === "boolean")
      isLE4 = _opts.isLE;
    if (typeof _opts.modFromBytes === "boolean")
      modFromBytes = _opts.modFromBytes;
    allowedLengths = _opts.allowedLengths;
  } else {
    if (typeof bitLenOrOpts === "number")
      _nbitLength = bitLenOrOpts;
    if (opts.sqrt)
      _sqrt = opts.sqrt;
  }
  const { nBitLength: BITS, nByteLength: BYTES } = nLength2(ORDER, _nbitLength);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE4,
    BITS,
    BYTES,
    MASK: bitMask2(BITS),
    ZERO: _0n7,
    ONE: _1n7,
    allowedLengths,
    create: (num) => mod2(num, ORDER),
    isValid: (num) => {
      if (typeof num !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num);
      return _0n7 <= num && num < ORDER;
    },
    is0: (num) => num === _0n7,
    isValidNot0: (num) => !f.is0(num) && f.isValid(num),
    isOdd: (num) => (num & _1n7) === _1n7,
    neg: (num) => mod2(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod2(num * num, ORDER),
    add: (lhs, rhs) => mod2(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod2(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod2(lhs * rhs, ORDER),
    pow: (num, power) => FpPow2(f, num, power),
    div: (lhs, rhs) => mod2(lhs * invert2(rhs, ORDER), ORDER),
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert2(num, ORDER),
    sqrt: _sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt2(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: (num) => isLE4 ? numberToBytesLE2(num, BYTES) : numberToBytesBE2(num, BYTES),
    fromBytes: (bytes4, skipValidation = true) => {
      if (allowedLengths) {
        if (!allowedLengths.includes(bytes4.length) || bytes4.length > BYTES) {
          throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes4.length);
        }
        const padded = new Uint8Array(BYTES);
        padded.set(bytes4, isLE4 ? 0 : padded.length - bytes4.length);
        bytes4 = padded;
      }
      if (bytes4.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes4.length);
      let scalar = isLE4 ? bytesToNumberLE2(bytes4) : bytesToNumberBE2(bytes4);
      if (modFromBytes)
        scalar = mod2(scalar, ORDER);
      if (!skipValidation) {
        if (!f.isValid(scalar))
          throw new Error("invalid field element: outside of range 0..ORDER");
      }
      return scalar;
    },
    invertBatch: (lst) => FpInvertBatch2(f, lst),
    cmov: (a, b, c) => c ? b : a
  });
  return Object.freeze(f);
}
function getFieldBytesLength2(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength2(fieldOrder) {
  const length = getFieldBytesLength2(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField2(key, fieldOrder, isLE4 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength2(fieldOrder);
  const minLen = getMinHashLength2(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE4 ? bytesToNumberLE2(key) : bytesToNumberBE2(key);
  const reduced = mod2(num, fieldOrder - _1n7) + _1n7;
  return isLE4 ? numberToBytesLE2(reduced, fieldLen) : numberToBytesBE2(reduced, fieldLen);
}

// ../node_modules/@noble/curves/esm/abstract/curve.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n8 = BigInt(0);
var _1n8 = BigInt(1);
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch2(c.Fp, points.map((p) => p.Z));
  return points.map((p, i2) => c.fromAffine(p.toAffine(invertedZs[i2])));
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask2(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window2, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n8;
  }
  const offsetStart = window2 * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window2 % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i2) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i2);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i2) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i2);
  });
}
var pointPrecomputes = new WeakMap;
var pointWindowSizes = new WeakMap;
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
  if (n !== _0n8)
    throw new Error("invalid wNAF");
}

class wNAF2 {
  constructor(Point2, bits) {
    this.BASE = Point2.BASE;
    this.ZERO = Point2.ZERO;
    this.Fn = Point2.Fn;
    this.bits = bits;
  }
  _unsafeLadder(elm, n, p = this.ZERO) {
    let d = elm;
    while (n > _0n8) {
      if (n & _1n8)
        p = p.add(d);
      d = d.double();
      n >>= _1n8;
    }
    return p;
  }
  precomputeWindow(point, W) {
    const { windows, windowSize } = calcWOpts(W, this.bits);
    const points = [];
    let p = point;
    let base = p;
    for (let window2 = 0;window2 < windows; window2++) {
      base = p;
      points.push(base);
      for (let i2 = 1;i2 < windowSize; i2++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  wNAF(W, precomputes, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let p = this.ZERO;
    let f = this.BASE;
    const wo = calcWOpts(W, this.bits);
    for (let window2 = 0;window2 < wo.windows; window2++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
      n = nextN;
      if (isZero) {
        f = f.add(negateCt(isNegF, precomputes[offsetF]));
      } else {
        p = p.add(negateCt(isNeg, precomputes[offset]));
      }
    }
    assert0(n);
    return { p, f };
  }
  wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
    const wo = calcWOpts(W, this.bits);
    for (let window2 = 0;window2 < wo.windows; window2++) {
      if (n === _0n8)
        break;
      const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
      n = nextN;
      if (isZero) {
        continue;
      } else {
        const item = precomputes[offset];
        acc = acc.add(isNeg ? item.negate() : item);
      }
    }
    assert0(n);
    return acc;
  }
  getPrecomputes(W, point, transform) {
    let comp = pointPrecomputes.get(point);
    if (!comp) {
      comp = this.precomputeWindow(point, W);
      if (W !== 1) {
        if (typeof transform === "function")
          comp = transform(comp);
        pointPrecomputes.set(point, comp);
      }
    }
    return comp;
  }
  cached(point, scalar, transform) {
    const W = getW(point);
    return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
  }
  unsafe(point, scalar, transform, prev) {
    const W = getW(point);
    if (W === 1)
      return this._unsafeLadder(point, scalar, prev);
    return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
  }
  createCache(P, W) {
    validateW(W, this.bits);
    pointWindowSizes.set(P, W);
    pointPrecomputes.delete(P);
  }
  hasCache(elm) {
    return getW(elm) !== 1;
  }
}
function mulEndoUnsafe(Point2, point, k1, k2) {
  let acc = point;
  let p1 = Point2.ZERO;
  let p2 = Point2.ZERO;
  while (k1 > _0n8 || k2 > _0n8) {
    if (k1 & _1n8)
      p1 = p1.add(acc);
    if (k2 & _1n8)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n8;
    k2 >>= _1n8;
  }
  return { p1, p2 };
}
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen2(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask2(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i2 = lastBits;i2 >= 0; i2 -= windowSize) {
    buckets.fill(zero);
    for (let j = 0;j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i2) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero;j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i2 !== 0)
      for (let j = 0;j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function createField(order, field, isLE4) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField2(field);
    return field;
  } else {
    return Field2(order, { isLE: isLE4 });
  }
}
function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === undefined)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n8))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp2 = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp2.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp: Fp2, Fn };
}

// ../node_modules/@noble/curves/esm/abstract/weierstrass.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var divNearest2 = (num, den) => (num + (num >= 0 ? den : -den) / _2n6) / den;
function _splitEndoScalar(k, basis, n) {
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest2(b2 * k, n);
  const c2 = divNearest2(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n9;
  const k2neg = k2 < _0n9;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask2(Math.ceil(bitLen2(n) / 2)) + _1n9;
  if (k1 < _0n9 || k1 >= MAX_NUM || k2 < _0n9 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed, k=" + k);
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format) {
  if (!["compact", "recovered", "der"].includes(format))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format;
}
function validateSigOpts(opts, def) {
  const optsn = {};
  for (let optName of Object.keys(def)) {
    optsn[optName] = opts[optName] === undefined ? def[optName] : opts[optName];
  }
  _abool2(optsn.lowS, "lowS");
  _abool2(optsn.prehash, "prehash");
  if (optsn.format !== undefined)
    validateSigFormat(optsn.format);
  return optsn;
}

class DERErr2 extends Error {
  constructor(m = "") {
    super(m);
  }
}
var DER2 = {
  Err: DERErr2,
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = DER2;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length & 1)
        throw new E("tlv.encode: unpadded data");
      const dataLen = data.length / 2;
      const len = numberToHexUnpadded2(dataLen);
      if (len.length / 2 & 128)
        throw new E("tlv.encode: long form length too big");
      const lenLen = dataLen > 127 ? numberToHexUnpadded2(len.length / 2 | 128) : "";
      const t = numberToHexUnpadded2(tag);
      return t + lenLen + len + data;
    },
    decode(tag, data) {
      const { Err: E } = DER2;
      let pos = 0;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length < 2 || data[pos++] !== tag)
        throw new E("tlv.decode: wrong tlv");
      const first = data[pos++];
      const isLong = !!(first & 128);
      let length = 0;
      if (!isLong)
        length = first;
      else {
        const lenLen = first & 127;
        if (!lenLen)
          throw new E("tlv.decode(long): indefinite length not supported");
        if (lenLen > 4)
          throw new E("tlv.decode(long): byte length is too big");
        const lengthBytes = data.subarray(pos, pos + lenLen);
        if (lengthBytes.length !== lenLen)
          throw new E("tlv.decode: length bytes not complete");
        if (lengthBytes[0] === 0)
          throw new E("tlv.decode(long): zero leftmost byte");
        for (const b of lengthBytes)
          length = length << 8 | b;
        pos += lenLen;
        if (length < 128)
          throw new E("tlv.decode(long): not minimal encoding");
      }
      const v = data.subarray(pos, pos + length);
      if (v.length !== length)
        throw new E("tlv.decode: wrong value length");
      return { v, l: data.subarray(pos + length) };
    }
  },
  _int: {
    encode(num) {
      const { Err: E } = DER2;
      if (num < _0n9)
        throw new E("integer: negative integers are not allowed");
      let hex2 = numberToHexUnpadded2(num);
      if (Number.parseInt(hex2[0], 16) & 8)
        hex2 = "00" + hex2;
      if (hex2.length & 1)
        throw new E("unexpected DER parsing assertion: unpadded hex");
      return hex2;
    },
    decode(data) {
      const { Err: E } = DER2;
      if (data[0] & 128)
        throw new E("invalid signature integer: negative");
      if (data[0] === 0 && !(data[1] & 128))
        throw new E("invalid signature integer: unnecessary leading zero");
      return bytesToNumberBE2(data);
    }
  },
  toSig(hex2) {
    const { Err: E, _int: int, _tlv: tlv } = DER2;
    const data = ensureBytes2("signature", hex2);
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
    if (seqLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
    const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
    if (sLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    return { r: int.decode(rBytes), s: int.decode(sBytes) };
  },
  hexFromSig(sig) {
    const { _tlv: tlv, _int: int } = DER2;
    const rs = tlv.encode(2, int.encode(sig.r));
    const ss = tlv.encode(2, int.encode(sig.s));
    const seq = rs + ss;
    return tlv.encode(48, seq);
  }
};
var _0n9 = BigInt(0);
var _1n9 = BigInt(1);
var _2n6 = BigInt(2);
var _3n4 = BigInt(3);
var _4n4 = BigInt(4);
function _normFnElement(Fn, key) {
  const { BYTES: expected } = Fn;
  let num;
  if (typeof key === "bigint") {
    num = key;
  } else {
    let bytes4 = ensureBytes2("private key", key);
    try {
      num = Fn.fromBytes(bytes4);
    } catch (error) {
      throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
    }
  }
  if (!Fn.isValidNot0(num))
    throw new Error("invalid private key: out of range [1..N-1]");
  return num;
}
function weierstrassN(params, extraOpts = {}) {
  const validated = _createCurveFields("weierstrass", params, extraOpts);
  const { Fp: Fp2, Fn } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  _validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    wrapPrivateKey: "boolean"
  });
  const { endo } = extraOpts;
  if (endo) {
    if (!Fp2.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths(Fp2, Fn);
  function assertCompressionIsSupported() {
    if (!Fp2.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes2(_c, point, isCompressed) {
    const { x, y } = point.toAffine();
    const bx = Fp2.toBytes(x);
    _abool2(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp2.isOdd(y);
      return concatBytes4(pprefix(hasEvenY), bx);
    } else {
      return concatBytes4(Uint8Array.of(4), bx, Fp2.toBytes(y));
    }
  }
  function pointFromBytes(bytes4) {
    _abytes2(bytes4, undefined, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes4.length;
    const head = bytes4[0];
    const tail = bytes4.subarray(1);
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp2.fromBytes(tail);
      if (!Fp2.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp2.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const isYOdd = Fp2.isOdd(y);
      const isHeadOdd = (head & 1) === 1;
      if (isHeadOdd !== isYOdd)
        y = Fp2.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp2.BYTES;
      const x = Fp2.fromBytes(tail.subarray(0, L));
      const y = Fp2.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes || pointToBytes2;
  const decodePoint = extraOpts.fromBytes || pointFromBytes;
  function weierstrassEquation(x) {
    const x2 = Fp2.sqr(x);
    const x3 = Fp2.mul(x2, x);
    return Fp2.add(Fp2.add(x3, Fp2.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp2.sqr(y);
    const right = weierstrassEquation(x);
    return Fp2.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp2.mul(Fp2.pow(CURVE.a, _3n4), _4n4);
  const _27b2 = Fp2.mul(Fp2.sqr(CURVE.b), BigInt(27));
  if (Fp2.is0(Fp2.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp2.isValid(n) || banZero && Fp2.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("ProjectivePoint expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn.ORDER);
  }
  const toAffineMemo = memoized((p, iz) => {
    const { X, Y, Z } = p;
    if (Fp2.eql(Z, Fp2.ONE))
      return { x: X, y: Y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp2.ONE : Fp2.inv(Z);
    const x = Fp2.mul(X, iz);
    const y = Fp2.mul(Y, iz);
    const zz = Fp2.mul(Z, iz);
    if (is0)
      return { x: Fp2.ZERO, y: Fp2.ZERO };
    if (!Fp2.eql(zz, Fp2.ONE))
      throw new Error("invZ was invalid");
    return { x, y };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (extraOpts.allowInfinityPoint && !Fp2.is0(p.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp2.isValid(x) || !Fp2.isValid(y))
      throw new Error("bad point: x or y not field elements");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point2(Fp2.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt(k1neg, k1p);
    k2p = negateCt(k2neg, k2p);
    return k1p.add(k2p);
  }

  class Point2 {
    constructor(X, Y, Z) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp2.isValid(x) || !Fp2.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point2)
        throw new Error("projective point not allowed");
      if (Fp2.is0(x) && Fp2.is0(y))
        return Point2.ZERO;
      return new Point2(x, y, Fp2.ONE);
    }
    static fromBytes(bytes4) {
      const P = Point2.fromAffine(decodePoint(_abytes2(bytes4, undefined, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex2) {
      return Point2.fromBytes(ensureBytes2("pointHex", hex2));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n4);
      return this;
    }
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp2.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp2.isOdd(y);
    }
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp2.eql(Fp2.mul(X1, Z2), Fp2.mul(X2, Z1));
      const U2 = Fp2.eql(Fp2.mul(Y1, Z2), Fp2.mul(Y2, Z1));
      return U1 && U2;
    }
    negate() {
      return new Point2(this.X, Fp2.neg(this.Y), this.Z);
    }
    double() {
      const { a, b } = CURVE;
      const b3 = Fp2.mul(b, _3n4);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp2;
      let t0 = Fp2.mul(X1, X1);
      let t1 = Fp2.mul(Y1, Y1);
      let t2 = Fp2.mul(Z1, Z1);
      let t3 = Fp2.mul(X1, Y1);
      t3 = Fp2.add(t3, t3);
      Z3 = Fp2.mul(X1, Z1);
      Z3 = Fp2.add(Z3, Z3);
      X3 = Fp2.mul(a, Z3);
      Y3 = Fp2.mul(b3, t2);
      Y3 = Fp2.add(X3, Y3);
      X3 = Fp2.sub(t1, Y3);
      Y3 = Fp2.add(t1, Y3);
      Y3 = Fp2.mul(X3, Y3);
      X3 = Fp2.mul(t3, X3);
      Z3 = Fp2.mul(b3, Z3);
      t2 = Fp2.mul(a, t2);
      t3 = Fp2.sub(t0, t2);
      t3 = Fp2.mul(a, t3);
      t3 = Fp2.add(t3, Z3);
      Z3 = Fp2.add(t0, t0);
      t0 = Fp2.add(Z3, t0);
      t0 = Fp2.add(t0, t2);
      t0 = Fp2.mul(t0, t3);
      Y3 = Fp2.add(Y3, t0);
      t2 = Fp2.mul(Y1, Z1);
      t2 = Fp2.add(t2, t2);
      t0 = Fp2.mul(t2, t3);
      X3 = Fp2.sub(X3, t0);
      Z3 = Fp2.mul(t2, t1);
      Z3 = Fp2.add(Z3, Z3);
      Z3 = Fp2.add(Z3, Z3);
      return new Point2(X3, Y3, Z3);
    }
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp2;
      const a = CURVE.a;
      const b3 = Fp2.mul(CURVE.b, _3n4);
      let t0 = Fp2.mul(X1, X2);
      let t1 = Fp2.mul(Y1, Y2);
      let t2 = Fp2.mul(Z1, Z2);
      let t3 = Fp2.add(X1, Y1);
      let t4 = Fp2.add(X2, Y2);
      t3 = Fp2.mul(t3, t4);
      t4 = Fp2.add(t0, t1);
      t3 = Fp2.sub(t3, t4);
      t4 = Fp2.add(X1, Z1);
      let t5 = Fp2.add(X2, Z2);
      t4 = Fp2.mul(t4, t5);
      t5 = Fp2.add(t0, t2);
      t4 = Fp2.sub(t4, t5);
      t5 = Fp2.add(Y1, Z1);
      X3 = Fp2.add(Y2, Z2);
      t5 = Fp2.mul(t5, X3);
      X3 = Fp2.add(t1, t2);
      t5 = Fp2.sub(t5, X3);
      Z3 = Fp2.mul(a, t4);
      X3 = Fp2.mul(b3, t2);
      Z3 = Fp2.add(X3, Z3);
      X3 = Fp2.sub(t1, Z3);
      Z3 = Fp2.add(t1, Z3);
      Y3 = Fp2.mul(X3, Z3);
      t1 = Fp2.add(t0, t0);
      t1 = Fp2.add(t1, t0);
      t2 = Fp2.mul(a, t2);
      t4 = Fp2.mul(b3, t4);
      t1 = Fp2.add(t1, t2);
      t2 = Fp2.sub(t0, t2);
      t2 = Fp2.mul(a, t2);
      t4 = Fp2.add(t4, t2);
      t0 = Fp2.mul(t1, t4);
      Y3 = Fp2.add(Y3, t0);
      t0 = Fp2.mul(t5, t4);
      X3 = Fp2.mul(t3, X3);
      X3 = Fp2.sub(X3, t0);
      t0 = Fp2.mul(t3, t1);
      Z3 = Fp2.mul(t5, Z3);
      Z3 = Fp2.add(Z3, t0);
      return new Point2(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point2.ZERO);
    }
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn.isValidNot0(scalar))
        throw new Error("invalid scalar: out of range");
      let point, fake;
      const mul3 = (n) => wnaf.cached(this, n, (p) => normalizeZ(Point2, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul3(k1);
        const { p: k2p, f: k2f } = mul3(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f } = mul3(scalar);
        point = p;
        fake = f;
      }
      return normalizeZ(Point2, [point, fake])[0];
    }
    multiplyUnsafe(sc) {
      const { endo: endo2 } = extraOpts;
      const p = this;
      if (!Fn.isValid(sc))
        throw new Error("invalid scalar: out of range");
      if (sc === _0n9 || p.is0())
        return Point2.ZERO;
      if (sc === _1n9)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe(Point2, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    multiplyAndAddUnsafe(Q, a, b) {
      const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
      return sum.is0() ? undefined : sum;
    }
    toAffine(invertedZ) {
      return toAffineMemo(this, invertedZ);
    }
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n9)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point2, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n9)
        return this;
      if (clearCofactor)
        return clearCofactor(Point2, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(cofactor).is0();
    }
    toBytes(isCompressed = true) {
      _abool2(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(Point2, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex4(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    get px() {
      return this.X;
    }
    get py() {
      return this.X;
    }
    get pz() {
      return this.Z;
    }
    toRawBytes(isCompressed = true) {
      return this.toBytes(isCompressed);
    }
    _setWindowSize(windowSize) {
      this.precompute(windowSize);
    }
    static normalizeZ(points) {
      return normalizeZ(Point2, points);
    }
    static msm(points, scalars) {
      return pippenger(Point2, Fn, points, scalars);
    }
    static fromPrivateKey(privateKey) {
      return Point2.BASE.multiply(_normFnElement(Fn, privateKey));
    }
  }
  Point2.BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp2.ONE);
  Point2.ZERO = new Point2(Fp2.ZERO, Fp2.ONE, Fp2.ZERO);
  Point2.Fp = Fp2;
  Point2.Fn = Fn;
  const bits = Fn.BITS;
  const wnaf = new wNAF2(Point2, extraOpts.endo ? Math.ceil(bits / 2) : bits);
  Point2.BASE.precompute(8);
  return Point2;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths(Fp2, Fn) {
  return {
    secretKey: Fn.BYTES,
    publicKey: 1 + Fp2.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp2.BYTES,
    publicKeyHasPrefix: true,
    signature: 2 * Fn.BYTES
  };
}
function ecdh(Point2, ecdhOpts = {}) {
  const { Fn } = Point2;
  const randomBytes_ = ecdhOpts.randomBytes || randomBytes3;
  const lengths = Object.assign(getWLengths(Point2.Fp, Fn), { seed: getMinHashLength2(Fn.ORDER) });
  function isValidSecretKey(secretKey) {
    try {
      return !!_normFnElement(Fn, secretKey);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !!Point2.fromBytes(publicKey);
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed = randomBytes_(lengths.seed)) {
    return mapHashToField2(_abytes2(seed, lengths.seed, "seed"), Fn.ORDER);
  }
  function getPublicKey2(secretKey, isCompressed = true) {
    return Point2.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
  }
  function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey2(secretKey) };
  }
  function isProbPub(item) {
    if (typeof item === "bigint")
      return false;
    if (item instanceof Point2)
      return true;
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    if (Fn.allowedLengths || secretKey === publicKey)
      return;
    const l = ensureBytes2("key", item).length;
    return l === publicKey || l === publicKeyUncompressed;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = _normFnElement(Fn, secretKeyA);
    const b = Point2.fromHex(publicKeyB);
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey,
    isValidPrivateKey: isValidSecretKey,
    randomPrivateKey: randomSecretKey,
    normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
    precompute(windowSize = 8, point = Point2.BASE) {
      return point.precompute(windowSize, false);
    }
  };
  return Object.freeze({ getPublicKey: getPublicKey2, getSharedSecret, keygen, Point: Point2, utils, lengths });
}
function ecdsa(Point2, hash3, ecdsaOpts = {}) {
  ahash(hash3);
  _validateObject(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  const randomBytes4 = ecdsaOpts.randomBytes || randomBytes3;
  const hmac4 = ecdsaOpts.hmac || ((key, ...msgs) => hmac3(hash3, key, concatBytes4(...msgs)));
  const { Fp: Fp2, Fn } = Point2;
  const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
  const { keygen, getPublicKey: getPublicKey2, getSharedSecret, utils, lengths } = ecdh(Point2, ecdsaOpts);
  const defaultSigOpts = {
    prehash: false,
    lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : false,
    format: undefined,
    extraEntropy: false
  };
  const defaultSigOpts_format = "compact";
  function isBiggerThanHalfOrder(number4) {
    const HALF = CURVE_ORDER >> _1n9;
    return number4 > HALF;
  }
  function validateRS(title, num) {
    if (!Fn.isValidNot0(num))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num;
  }
  function validateSigLength(bytes4, format) {
    validateSigFormat(format);
    const size = lengths.signature;
    const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : undefined;
    return _abytes2(bytes4, sizer, `${format} signature`);
  }

  class Signature {
    constructor(r, s, recovery) {
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null)
        this.recovery = recovery;
      Object.freeze(this);
    }
    static fromBytes(bytes4, format = defaultSigOpts_format) {
      validateSigLength(bytes4, format);
      let recid;
      if (format === "der") {
        const { r: r2, s: s2 } = DER2.toSig(_abytes2(bytes4));
        return new Signature(r2, s2);
      }
      if (format === "recovered") {
        recid = bytes4[0];
        format = "compact";
        bytes4 = bytes4.subarray(1);
      }
      const L = Fn.BYTES;
      const r = bytes4.subarray(0, L);
      const s = bytes4.subarray(L, L * 2);
      return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
    }
    static fromHex(hex2, format) {
      return this.fromBytes(hexToBytes5(hex2), format);
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(messageHash) {
      const FIELD_ORDER = Fp2.ORDER;
      const { r, s, recovery: rec } = this;
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const hasCofactor = CURVE_ORDER * _2n6 < FIELD_ORDER;
      if (hasCofactor && rec > 1)
        throw new Error("recovery id is ambiguous for h>1 curve");
      const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
      if (!Fp2.isValid(radj))
        throw new Error("recovery id 2 or 3 invalid");
      const x = Fp2.toBytes(radj);
      const R = Point2.fromBytes(concatBytes4(pprefix((rec & 1) === 0), x));
      const ir = Fn.inv(radj);
      const h = bits2int_modN(ensureBytes2("msgHash", messageHash));
      const u1 = Fn.create(-h * ir);
      const u2 = Fn.create(s * ir);
      const Q = Point2.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
      if (Q.is0())
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format = defaultSigOpts_format) {
      validateSigFormat(format);
      if (format === "der")
        return hexToBytes5(DER2.hexFromSig(this));
      const r = Fn.toBytes(this.r);
      const s = Fn.toBytes(this.s);
      if (format === "recovered") {
        if (this.recovery == null)
          throw new Error("recovery bit must be present");
        return concatBytes4(Uint8Array.of(this.recovery), r, s);
      }
      return concatBytes4(r, s);
    }
    toHex(format) {
      return bytesToHex4(this.toBytes(format));
    }
    assertValidity() {}
    static fromCompact(hex2) {
      return Signature.fromBytes(ensureBytes2("sig", hex2), "compact");
    }
    static fromDER(hex2) {
      return Signature.fromBytes(ensureBytes2("sig", hex2), "der");
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return this.toBytes("der");
    }
    toDERHex() {
      return bytesToHex4(this.toBytes("der"));
    }
    toCompactRawBytes() {
      return this.toBytes("compact");
    }
    toCompactHex() {
      return bytesToHex4(this.toBytes("compact"));
    }
  }
  const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes4) {
    if (bytes4.length > 8192)
      throw new Error("input is too large");
    const num = bytesToNumberBE2(bytes4);
    const delta = bytes4.length * 8 - fnBits;
    return delta > 0 ? num >> BigInt(delta) : num;
  };
  const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes4) {
    return Fn.create(bits2int(bytes4));
  };
  const ORDER_MASK = bitMask2(fnBits);
  function int2octets(num) {
    aInRange("num < 2^" + fnBits, num, _0n9, ORDER_MASK);
    return Fn.toBytes(num);
  }
  function validateMsgAndHash(message, prehash) {
    _abytes2(message, undefined, "message");
    return prehash ? _abytes2(hash3(message), undefined, "prehashed message") : message;
  }
  function prepSig(message, privateKey, opts) {
    if (["recovered", "canonical"].some((k) => (k in opts)))
      throw new Error("sign() legacy options not supported");
    const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d = _normFnElement(Fn, privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes4(lengths.secretKey) : extraEntropy;
      seedArgs.push(ensureBytes2("extraEntropy", e));
    }
    const seed = concatBytes4(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn.isValidNot0(k))
        return;
      const ik = Fn.inv(k);
      const q = Point2.BASE.multiply(k).toAffine();
      const r = Fn.create(q.x);
      if (r === _0n9)
        return;
      const s = Fn.create(ik * Fn.create(m + r * d));
      if (s === _0n9)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n9);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts = {}) {
    message = ensureBytes2("message", message);
    const { seed, k2sig } = prepSig(message, secretKey, opts);
    const drbg = createHmacDrbg2(hash3.outputLen, Fn.BYTES, hmac4);
    const sig = drbg(seed, k2sig);
    return sig;
  }
  function tryParsingSig(sg) {
    let sig = undefined;
    const isHex = typeof sg === "string" || isBytes2(sg);
    const isObj = !isHex && sg !== null && typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    if (isObj) {
      sig = new Signature(sg.r, sg.s);
    } else if (isHex) {
      try {
        sig = Signature.fromBytes(ensureBytes2("sig", sg), "der");
      } catch (derError) {
        if (!(derError instanceof DER2.Err))
          throw derError;
      }
      if (!sig) {
        try {
          sig = Signature.fromBytes(ensureBytes2("sig", sg), "compact");
        } catch (error) {
          return false;
        }
      }
    }
    if (!sig)
      return false;
    return sig;
  }
  function verify(signature, message, publicKey, opts = {}) {
    const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
    publicKey = ensureBytes2("publicKey", publicKey);
    message = validateMsgAndHash(ensureBytes2("message", message), prehash);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    const sig = format === undefined ? tryParsingSig(signature) : Signature.fromBytes(ensureBytes2("sig", signature), format);
    if (sig === false)
      return false;
    try {
      const P = Point2.fromBytes(publicKey);
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn.inv(s);
      const u1 = Fn.create(h * is);
      const u2 = Fn.create(r * is);
      const R = Point2.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
      if (R.is0())
        return false;
      const v = Fn.create(R.x);
      return v === r;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts = {}) {
    const { prehash } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey: getPublicKey2,
    getSharedSecret,
    utils,
    lengths,
    Point: Point2,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash: hash3
  });
}
function _weierstrass_legacy_opts_to_new(c) {
  const CURVE = {
    a: c.a,
    b: c.b,
    p: c.Fp.ORDER,
    n: c.n,
    h: c.h,
    Gx: c.Gx,
    Gy: c.Gy
  };
  const Fp2 = c.Fp;
  let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : undefined;
  const Fn = Field2(CURVE.n, {
    BITS: c.nBitLength,
    allowedLengths,
    modFromBytes: c.wrapPrivateKey
  });
  const curveOpts = {
    Fp: Fp2,
    Fn,
    allowInfinityPoint: c.allowInfinityPoint,
    endo: c.endo,
    isTorsionFree: c.isTorsionFree,
    clearCofactor: c.clearCofactor,
    fromBytes: c.fromBytes,
    toBytes: c.toBytes
  };
  return { CURVE, curveOpts };
}
function _ecdsa_legacy_opts_to_new(c) {
  const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
  const ecdsaOpts = {
    hmac: c.hmac,
    randomBytes: c.randomBytes,
    lowS: c.lowS,
    bits2int: c.bits2int,
    bits2int_modN: c.bits2int_modN
  };
  return { CURVE, curveOpts, hash: c.hash, ecdsaOpts };
}
function _ecdsa_new_output_to_legacy(c, _ecdsa) {
  const Point2 = _ecdsa.Point;
  return Object.assign({}, _ecdsa, {
    ProjectivePoint: Point2,
    CURVE: Object.assign({}, c, nLength2(Point2.Fn.ORDER, Point2.Fn.BITS))
  });
}
function weierstrass2(c) {
  const { CURVE, curveOpts, hash: hash3, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
  const Point2 = weierstrassN(CURVE, curveOpts);
  const signs = ecdsa(Point2, hash3, ecdsaOpts);
  return _ecdsa_new_output_to_legacy(c, signs);
}

// ../node_modules/@noble/curves/esm/_shortw_utils.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function createCurve2(curveDef, defHash) {
  const create = (hash3) => weierstrass2({ ...curveDef, hash: hash3 });
  return { ...create(defHash), create };
}

// ../node_modules/@noble/curves/esm/secp256k1.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var secp256k1_CURVE = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
var secp256k1_ENDO = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
var _0n10 = /* @__PURE__ */ BigInt(0);
var _1n10 = /* @__PURE__ */ BigInt(1);
var _2n7 = /* @__PURE__ */ BigInt(2);
function sqrtMod2(y) {
  const P = secp256k1_CURVE.p;
  const _3n5 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow22(b3, _3n5, P) * b3 % P;
  const b9 = pow22(b6, _3n5, P) * b3 % P;
  const b11 = pow22(b9, _2n7, P) * b2 % P;
  const b22 = pow22(b11, _11n, P) * b11 % P;
  const b44 = pow22(b22, _22n, P) * b22 % P;
  const b88 = pow22(b44, _44n, P) * b44 % P;
  const b176 = pow22(b88, _88n, P) * b88 % P;
  const b220 = pow22(b176, _44n, P) * b44 % P;
  const b223 = pow22(b220, _3n5, P) * b3 % P;
  const t1 = pow22(b223, _23n, P) * b22 % P;
  const t2 = pow22(t1, _6n, P) * b2 % P;
  const root = pow22(t2, _2n7, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var Fpk1 = Field2(secp256k1_CURVE.p, { sqrt: sqrtMod2 });
var secp256k12 = createCurve2({ ...secp256k1_CURVE, Fp: Fpk1, lowS: true, endo: secp256k1_ENDO }, sha2563);
var TAGGED_HASH_PREFIXES2 = {};
function taggedHash2(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES2[tag];
  if (tagP === undefined) {
    const tagH = sha2563(utf8ToBytes5(tag));
    tagP = concatBytes4(tagH, tagH);
    TAGGED_HASH_PREFIXES2[tag] = tagP;
  }
  return sha2563(concatBytes4(tagP, ...messages));
}
var pointToBytes2 = (point) => point.toBytes(true).slice(1);
var Pointk1 = /* @__PURE__ */ (() => secp256k12.Point)();
var hasEven = (y) => y % _2n7 === _0n10;
function schnorrGetExtPubKey2(priv) {
  const { Fn, BASE } = Pointk1;
  const d_ = _normFnElement(Fn, priv);
  const p = BASE.multiply(d_);
  const scalar = hasEven(p.y) ? d_ : Fn.neg(d_);
  return { scalar, bytes: pointToBytes2(p) };
}
function lift_x2(x) {
  const Fp2 = Fpk1;
  if (!Fp2.isValidNot0(x))
    throw new Error("invalid x: Fail if x ≥ p");
  const xx = Fp2.create(x * x);
  const c = Fp2.create(xx * x + BigInt(7));
  let y = Fp2.sqrt(c);
  if (!hasEven(y))
    y = Fp2.neg(y);
  const p = Pointk1.fromAffine({ x, y });
  p.assertValidity();
  return p;
}
var num = bytesToNumberBE2;
function challenge2(...args) {
  return Pointk1.Fn.create(num(taggedHash2("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey2(secretKey) {
  return schnorrGetExtPubKey2(secretKey).bytes;
}
function schnorrSign2(message, secretKey, auxRand = randomBytes3(32)) {
  const { Fn } = Pointk1;
  const m = ensureBytes2("message", message);
  const { bytes: px, scalar: d } = schnorrGetExtPubKey2(secretKey);
  const a = ensureBytes2("auxRand", auxRand, 32);
  const t = Fn.toBytes(d ^ num(taggedHash2("BIP0340/aux", a)));
  const rand = taggedHash2("BIP0340/nonce", t, px, m);
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey2(rand);
  const e = challenge2(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(Fn.toBytes(Fn.create(k + e * d)), 32);
  if (!schnorrVerify2(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify2(signature, message, publicKey) {
  const { Fn, BASE } = Pointk1;
  const sig = ensureBytes2("signature", signature, 64);
  const m = ensureBytes2("message", message);
  const pub = ensureBytes2("publicKey", publicKey, 32);
  try {
    const P = lift_x2(num(pub));
    const r = num(sig.subarray(0, 32));
    if (!inRange(r, _1n10, secp256k1_CURVE.p))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!inRange(s, _1n10, secp256k1_CURVE.n))
      return false;
    const e = challenge2(Fn.toBytes(r), pointToBytes2(P), m);
    const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
    const { x, y } = R.toAffine();
    if (R.is0() || !hasEven(y) || x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var schnorr2 = /* @__PURE__ */ (() => {
  const size = 32;
  const seedLength = 48;
  const randomSecretKey = (seed = randomBytes3(seedLength)) => {
    return mapHashToField2(seed, secp256k1_CURVE.n);
  };
  secp256k12.utils.randomSecretKey;
  function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: schnorrGetPublicKey2(secretKey) };
  }
  return {
    keygen,
    getPublicKey: schnorrGetPublicKey2,
    sign: schnorrSign2,
    verify: schnorrVerify2,
    Point: Pointk1,
    utils: {
      randomSecretKey,
      randomPrivateKey: randomSecretKey,
      taggedHash: taggedHash2,
      lift_x: lift_x2,
      pointToBytes: pointToBytes2,
      numberToBytesBE: numberToBytesBE2,
      bytesToNumberBE: bytesToNumberBE2,
      mod: mod2
    },
    lengths: {
      secretKey: size,
      publicKey: size,
      publicKeyHasPrefix: false,
      signature: size * 2,
      seed: seedLength
    }
  };
})();

// ../node_modules/@noble/hashes/esm/sha256.js
var sha2564 = sha2563;

// ../core/dist/index.mjs
var import_typescript_lru_cache = __toESM(require_dist(), 1);
var import_tseep3 = __toESM(require_lib(), 1);

// ../core/node_modules/nostr-tools/lib/esm/nip49.js
var exports_nip49 = {};
__export(exports_nip49, {
  encrypt: () => encrypt3,
  decrypt: () => decrypt3
});

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/pbkdf2.js
function pbkdf2Init(hash3, _password, _salt, _opts) {
  _assert_default.hash(hash3);
  const opts = checkOpts({ dkLen: 32, asyncTick: 10 }, _opts);
  const { c, dkLen, asyncTick } = opts;
  _assert_default.number(c);
  _assert_default.number(dkLen);
  _assert_default.number(asyncTick);
  if (c < 1)
    throw new Error("PBKDF2: iterations (c) should be >= 1");
  const password = toBytes2(_password);
  const salt = toBytes2(_salt);
  const DK = new Uint8Array(dkLen);
  const PRF = hmac2.create(hash3, password);
  const PRFSalt = PRF._cloneInto().update(salt);
  return { c, dkLen, asyncTick, DK, PRF, PRFSalt };
}
function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
  PRF.destroy();
  PRFSalt.destroy();
  if (prfW)
    prfW.destroy();
  u.fill(0);
  return DK;
}
function pbkdf2(hash3, password, salt, opts) {
  const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash3, password, salt, opts);
  let prfW;
  const arr = new Uint8Array(4);
  const view = createView2(arr);
  const u = new Uint8Array(PRF.outputLen);
  for (let ti = 1, pos = 0;pos < dkLen; ti++, pos += PRF.outputLen) {
    const Ti = DK.subarray(pos, pos + PRF.outputLen);
    view.setInt32(0, ti, false);
    (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
    Ti.set(u.subarray(0, Ti.length));
    for (let ui = 1;ui < c; ui++) {
      PRF._cloneInto(prfW).update(u).digestInto(u);
      for (let i2 = 0;i2 < Ti.length; i2++)
        Ti[i2] ^= u[i2];
    }
  }
  return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
}

// ../core/node_modules/nostr-tools/node_modules/@noble/hashes/esm/scrypt.js
var rotl2 = (a, b) => a << b | a >>> 32 - b;
function XorAndSalsa(prev, pi, input, ii, out, oi) {
  let y00 = prev[pi++] ^ input[ii++], y01 = prev[pi++] ^ input[ii++];
  let y02 = prev[pi++] ^ input[ii++], y03 = prev[pi++] ^ input[ii++];
  let y04 = prev[pi++] ^ input[ii++], y05 = prev[pi++] ^ input[ii++];
  let y06 = prev[pi++] ^ input[ii++], y07 = prev[pi++] ^ input[ii++];
  let y08 = prev[pi++] ^ input[ii++], y09 = prev[pi++] ^ input[ii++];
  let y10 = prev[pi++] ^ input[ii++], y11 = prev[pi++] ^ input[ii++];
  let y12 = prev[pi++] ^ input[ii++], y13 = prev[pi++] ^ input[ii++];
  let y14 = prev[pi++] ^ input[ii++], y15 = prev[pi++] ^ input[ii++];
  let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
  for (let i2 = 0;i2 < 8; i2 += 2) {
    x04 ^= rotl2(x00 + x12 | 0, 7);
    x08 ^= rotl2(x04 + x00 | 0, 9);
    x12 ^= rotl2(x08 + x04 | 0, 13);
    x00 ^= rotl2(x12 + x08 | 0, 18);
    x09 ^= rotl2(x05 + x01 | 0, 7);
    x13 ^= rotl2(x09 + x05 | 0, 9);
    x01 ^= rotl2(x13 + x09 | 0, 13);
    x05 ^= rotl2(x01 + x13 | 0, 18);
    x14 ^= rotl2(x10 + x06 | 0, 7);
    x02 ^= rotl2(x14 + x10 | 0, 9);
    x06 ^= rotl2(x02 + x14 | 0, 13);
    x10 ^= rotl2(x06 + x02 | 0, 18);
    x03 ^= rotl2(x15 + x11 | 0, 7);
    x07 ^= rotl2(x03 + x15 | 0, 9);
    x11 ^= rotl2(x07 + x03 | 0, 13);
    x15 ^= rotl2(x11 + x07 | 0, 18);
    x01 ^= rotl2(x00 + x03 | 0, 7);
    x02 ^= rotl2(x01 + x00 | 0, 9);
    x03 ^= rotl2(x02 + x01 | 0, 13);
    x00 ^= rotl2(x03 + x02 | 0, 18);
    x06 ^= rotl2(x05 + x04 | 0, 7);
    x07 ^= rotl2(x06 + x05 | 0, 9);
    x04 ^= rotl2(x07 + x06 | 0, 13);
    x05 ^= rotl2(x04 + x07 | 0, 18);
    x11 ^= rotl2(x10 + x09 | 0, 7);
    x08 ^= rotl2(x11 + x10 | 0, 9);
    x09 ^= rotl2(x08 + x11 | 0, 13);
    x10 ^= rotl2(x09 + x08 | 0, 18);
    x12 ^= rotl2(x15 + x14 | 0, 7);
    x13 ^= rotl2(x12 + x15 | 0, 9);
    x14 ^= rotl2(x13 + x12 | 0, 13);
    x15 ^= rotl2(x14 + x13 | 0, 18);
  }
  out[oi++] = y00 + x00 | 0;
  out[oi++] = y01 + x01 | 0;
  out[oi++] = y02 + x02 | 0;
  out[oi++] = y03 + x03 | 0;
  out[oi++] = y04 + x04 | 0;
  out[oi++] = y05 + x05 | 0;
  out[oi++] = y06 + x06 | 0;
  out[oi++] = y07 + x07 | 0;
  out[oi++] = y08 + x08 | 0;
  out[oi++] = y09 + x09 | 0;
  out[oi++] = y10 + x10 | 0;
  out[oi++] = y11 + x11 | 0;
  out[oi++] = y12 + x12 | 0;
  out[oi++] = y13 + x13 | 0;
  out[oi++] = y14 + x14 | 0;
  out[oi++] = y15 + x15 | 0;
}
function BlockMix(input, ii, out, oi, r) {
  let head = oi + 0;
  let tail = oi + 16 * r;
  for (let i2 = 0;i2 < 16; i2++)
    out[tail + i2] = input[ii + (2 * r - 1) * 16 + i2];
  for (let i2 = 0;i2 < r; i2++, head += 16, ii += 16) {
    XorAndSalsa(out, tail, input, ii, out, head);
    if (i2 > 0)
      tail += 16;
    XorAndSalsa(out, head, input, ii += 16, out, tail);
  }
}
function scryptInit(password, salt, _opts) {
  const opts = checkOpts({
    dkLen: 32,
    asyncTick: 10,
    maxmem: 1024 ** 3 + 1024
  }, _opts);
  const { N, r, p, dkLen, asyncTick, maxmem, onProgress } = opts;
  _assert_default.number(N);
  _assert_default.number(r);
  _assert_default.number(p);
  _assert_default.number(dkLen);
  _assert_default.number(asyncTick);
  _assert_default.number(maxmem);
  if (onProgress !== undefined && typeof onProgress !== "function")
    throw new Error("progressCb should be function");
  const blockSize = 128 * r;
  const blockSize32 = blockSize / 4;
  if (N <= 1 || (N & N - 1) !== 0 || N >= 2 ** (blockSize / 8) || N > 2 ** 32) {
    throw new Error("Scrypt: N must be larger than 1, a power of 2, less than 2^(128 * r / 8) and less than 2^32");
  }
  if (p < 0 || p > (2 ** 32 - 1) * 32 / blockSize) {
    throw new Error("Scrypt: p must be a positive integer less than or equal to ((2^32 - 1) * 32) / (128 * r)");
  }
  if (dkLen < 0 || dkLen > (2 ** 32 - 1) * 32) {
    throw new Error("Scrypt: dkLen should be positive integer less than or equal to (2^32 - 1) * 32");
  }
  const memUsed = blockSize * (N + p);
  if (memUsed > maxmem) {
    throw new Error(`Scrypt: parameters too large, ${memUsed} (128 * r * (N + p)) > ${maxmem} (maxmem)`);
  }
  const B = pbkdf2(sha2562, password, salt, { c: 1, dkLen: blockSize * p });
  const B32 = u32(B);
  const V = u32(new Uint8Array(blockSize * N));
  const tmp = u32(new Uint8Array(blockSize));
  let blockMixCb = () => {};
  if (onProgress) {
    const totalBlockMix = 2 * N * p;
    const callbackPer = Math.max(Math.floor(totalBlockMix / 1e4), 1);
    let blockMixCnt = 0;
    blockMixCb = () => {
      blockMixCnt++;
      if (onProgress && (!(blockMixCnt % callbackPer) || blockMixCnt === totalBlockMix))
        onProgress(blockMixCnt / totalBlockMix);
    };
  }
  return { N, r, p, dkLen, blockSize32, V, B32, B, tmp, blockMixCb, asyncTick };
}
function scryptOutput(password, dkLen, B, V, tmp) {
  const res = pbkdf2(sha2562, password, B, { c: 1, dkLen });
  B.fill(0);
  V.fill(0);
  tmp.fill(0);
  return res;
}
function scrypt(password, salt, opts) {
  const { N, r, p, dkLen, blockSize32, V, B32, B, tmp, blockMixCb } = scryptInit(password, salt, opts);
  for (let pi = 0;pi < p; pi++) {
    const Pi = blockSize32 * pi;
    for (let i2 = 0;i2 < blockSize32; i2++)
      V[i2] = B32[Pi + i2];
    for (let i2 = 0, pos = 0;i2 < N - 1; i2++) {
      BlockMix(V, pos, V, pos += blockSize32, r);
      blockMixCb();
    }
    BlockMix(V, (N - 1) * blockSize32, B32, Pi, r);
    blockMixCb();
    for (let i2 = 0;i2 < N; i2++) {
      const j = B32[Pi + blockSize32 - 16] % N;
      for (let k = 0;k < blockSize32; k++)
        tmp[k] = B32[Pi + k] ^ V[j * blockSize32 + k];
      BlockMix(tmp, 0, B32, Pi, r);
      blockMixCb();
    }
  }
  return scryptOutput(password, dkLen, B, V, tmp);
}

// ../core/node_modules/nostr-tools/lib/esm/nip49.js
var Bech32MaxSize2 = 5000;
function encodeBech322(prefix, data) {
  let words = bech32.toWords(data);
  return bech32.encode(prefix, words, Bech32MaxSize2);
}
function encodeBytes2(prefix, bytes4) {
  return encodeBech322(prefix, bytes4);
}
function encrypt3(sec, password, logn = 16, ksb = 2) {
  let salt = randomBytes2(16);
  let n = 2 ** logn;
  let key = scrypt(password.normalize("NFKC"), salt, { N: n, r: 8, p: 1, dkLen: 32 });
  let nonce = randomBytes2(24);
  let aad = Uint8Array.from([ksb]);
  let xc2p1 = xchacha20poly1305(key, nonce, aad);
  let ciphertext = xc2p1.encrypt(sec);
  let b = concatBytes3(Uint8Array.from([2]), Uint8Array.from([logn]), salt, nonce, aad, ciphertext);
  return encodeBytes2("ncryptsec", b);
}
function decrypt3(ncryptsec, password) {
  let { prefix, words } = bech32.decode(ncryptsec, Bech32MaxSize2);
  if (prefix !== "ncryptsec") {
    throw new Error(`invalid prefix ${prefix}, expected 'ncryptsec'`);
  }
  let b = new Uint8Array(bech32.fromWords(words));
  let version = b[0];
  if (version !== 2) {
    throw new Error(`invalid version ${version}, expected 0x02`);
  }
  let logn = b[1];
  let n = 2 ** logn;
  let salt = b.slice(2, 2 + 16);
  let nonce = b.slice(2 + 16, 2 + 16 + 24);
  let ksb = b[2 + 16 + 24];
  let aad = Uint8Array.from([ksb]);
  let ciphertext = b.slice(2 + 16 + 24 + 1);
  let key = scrypt(password.normalize("NFKC"), salt, { N: n, r: 8, p: 1, dkLen: 32 });
  let xc2p1 = xchacha20poly1305(key, nonce, aad);
  let sec = xc2p1.decrypt(ciphertext);
  return sec;
}

// ../core/dist/index.mjs
var import_tseep4 = __toESM(require_lib(), 1);
var import_debug4 = __toESM(require_browser(), 1);
var import_debug5 = __toESM(require_browser(), 1);
var import_debug6 = __toESM(require_browser(), 1);
var import_light_bolt11_decoder = __toESM(require_bolt11(), 1);
var import_debug7 = __toESM(require_browser(), 1);
var import_tseep5 = __toESM(require_lib(), 1);
var import_tseep6 = __toESM(require_lib(), 1);
var import_typescript_lru_cache2 = __toESM(require_dist(), 1);
var import_typescript_lru_cache3 = __toESM(require_dist(), 1);
var import_debug8 = __toESM(require_browser(), 1);

// ../core/node_modules/nostr-tools/lib/esm/nip19.js
var exports_nip19 = {};
__export(exports_nip19, {
  nsecEncode: () => nsecEncode2,
  npubEncode: () => npubEncode2,
  nprofileEncode: () => nprofileEncode2,
  noteEncode: () => noteEncode2,
  neventEncode: () => neventEncode2,
  naddrEncode: () => naddrEncode2,
  encodeBytes: () => encodeBytes3,
  decodeNostrURI: () => decodeNostrURI2,
  decode: () => decode2,
  NostrTypeGuard: () => NostrTypeGuard2,
  Bech32MaxSize: () => Bech32MaxSize3,
  BECH32_REGEX: () => BECH32_REGEX2
});
var utf8Decoder2 = new TextDecoder("utf-8");
var utf8Encoder2 = new TextEncoder;
var NostrTypeGuard2 = {
  isNProfile: (value) => /^nprofile1[a-z\d]+$/.test(value || ""),
  isNEvent: (value) => /^nevent1[a-z\d]+$/.test(value || ""),
  isNAddr: (value) => /^naddr1[a-z\d]+$/.test(value || ""),
  isNSec: (value) => /^nsec1[a-z\d]{58}$/.test(value || ""),
  isNPub: (value) => /^npub1[a-z\d]{58}$/.test(value || ""),
  isNote: (value) => /^note1[a-z\d]+$/.test(value || ""),
  isNcryptsec: (value) => /^ncryptsec1[a-z\d]+$/.test(value || "")
};
var Bech32MaxSize3 = 5000;
var BECH32_REGEX2 = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;
function integerToUint8Array2(number4) {
  const uint8Array = new Uint8Array(4);
  uint8Array[0] = number4 >> 24 & 255;
  uint8Array[1] = number4 >> 16 & 255;
  uint8Array[2] = number4 >> 8 & 255;
  uint8Array[3] = number4 & 255;
  return uint8Array;
}
function decodeNostrURI2(nip19code) {
  try {
    if (nip19code.startsWith("nostr:"))
      nip19code = nip19code.substring(6);
    return decode2(nip19code);
  } catch (_err) {
    return { type: "invalid", data: null };
  }
}
function decode2(code) {
  let { prefix, words } = bech32.decode(code, Bech32MaxSize3);
  let data = new Uint8Array(bech32.fromWords(words));
  switch (prefix) {
    case "nprofile": {
      let tlv = parseTLV2(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nprofile");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      return {
        type: "nprofile",
        data: {
          pubkey: bytesToHex2(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder2.decode(d)) : []
        }
      };
    }
    case "nevent": {
      let tlv = parseTLV2(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nevent");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      if (tlv[2] && tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (tlv[3] && tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "nevent",
        data: {
          id: bytesToHex2(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder2.decode(d)) : [],
          author: tlv[2]?.[0] ? bytesToHex2(tlv[2][0]) : undefined,
          kind: tlv[3]?.[0] ? parseInt(bytesToHex2(tlv[3][0]), 16) : undefined
        }
      };
    }
    case "naddr": {
      let tlv = parseTLV2(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for naddr");
      if (!tlv[2]?.[0])
        throw new Error("missing TLV 2 for naddr");
      if (tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (!tlv[3]?.[0])
        throw new Error("missing TLV 3 for naddr");
      if (tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "naddr",
        data: {
          identifier: utf8Decoder2.decode(tlv[0][0]),
          pubkey: bytesToHex2(tlv[2][0]),
          kind: parseInt(bytesToHex2(tlv[3][0]), 16),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder2.decode(d)) : []
        }
      };
    }
    case "nsec":
      return { type: prefix, data };
    case "npub":
    case "note":
      return { type: prefix, data: bytesToHex2(data) };
    default:
      throw new Error(`unknown prefix ${prefix}`);
  }
}
function parseTLV2(data) {
  let result = {};
  let rest = data;
  while (rest.length > 0) {
    let t = rest[0];
    let l = rest[1];
    let v = rest.slice(2, 2 + l);
    rest = rest.slice(2 + l);
    if (v.length < l)
      throw new Error(`not enough data to read on TLV ${t}`);
    result[t] = result[t] || [];
    result[t].push(v);
  }
  return result;
}
function nsecEncode2(key) {
  return encodeBytes3("nsec", key);
}
function npubEncode2(hex2) {
  return encodeBytes3("npub", hexToBytes3(hex2));
}
function noteEncode2(hex2) {
  return encodeBytes3("note", hexToBytes3(hex2));
}
function encodeBech323(prefix, data) {
  let words = bech32.toWords(data);
  return bech32.encode(prefix, words, Bech32MaxSize3);
}
function encodeBytes3(prefix, bytes4) {
  return encodeBech323(prefix, bytes4);
}
function nprofileEncode2(profile) {
  let data = encodeTLV2({
    0: [hexToBytes3(profile.pubkey)],
    1: (profile.relays || []).map((url) => utf8Encoder2.encode(url))
  });
  return encodeBech323("nprofile", data);
}
function neventEncode2(event) {
  let kindArray;
  if (event.kind !== undefined) {
    kindArray = integerToUint8Array2(event.kind);
  }
  let data = encodeTLV2({
    0: [hexToBytes3(event.id)],
    1: (event.relays || []).map((url) => utf8Encoder2.encode(url)),
    2: event.author ? [hexToBytes3(event.author)] : [],
    3: kindArray ? [new Uint8Array(kindArray)] : []
  });
  return encodeBech323("nevent", data);
}
function naddrEncode2(addr) {
  let kind = new ArrayBuffer(4);
  new DataView(kind).setUint32(0, addr.kind, false);
  let data = encodeTLV2({
    0: [utf8Encoder2.encode(addr.identifier)],
    1: (addr.relays || []).map((url) => utf8Encoder2.encode(url)),
    2: [hexToBytes3(addr.pubkey)],
    3: [new Uint8Array(kind)]
  });
  return encodeBech323("naddr", data);
}
function encodeTLV2(tlv) {
  let entries = [];
  Object.entries(tlv).reverse().forEach(([t, vs]) => {
    vs.forEach((v) => {
      let entry = new Uint8Array(v.length + 2);
      entry.set([parseInt(t)], 0);
      entry.set([v.length], 1);
      entry.set(v, 2);
      entries.push(entry);
    });
  });
  return concatBytes3(...entries);
}

// ../core/dist/index.mjs
var import_debug9 = __toESM(require_browser(), 1);
var import_debug10 = __toESM(require_browser(), 1);
var import_tseep7 = __toESM(require_lib(), 1);
var import_tseep8 = __toESM(require_lib(), 1);
var import_debug11 = __toESM(require_browser(), 1);
var import_tseep9 = __toESM(require_lib(), 1);
var import_debug12 = __toESM(require_browser(), 1);
var __defProp3 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp2.call(to, key) && key !== except)
        __defProp3(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod3, secondTarget) => (__copyProps(target, mod3, "default"), secondTarget && __copyProps(secondTarget, mod3, "default"));
var NDKKind = /* @__PURE__ */ ((NDKKind2) => {
  NDKKind2[NDKKind2["Metadata"] = 0] = "Metadata";
  NDKKind2[NDKKind2["Text"] = 1] = "Text";
  NDKKind2[NDKKind2["RecommendRelay"] = 2] = "RecommendRelay";
  NDKKind2[NDKKind2["Contacts"] = 3] = "Contacts";
  NDKKind2[NDKKind2["EncryptedDirectMessage"] = 4] = "EncryptedDirectMessage";
  NDKKind2[NDKKind2["EventDeletion"] = 5] = "EventDeletion";
  NDKKind2[NDKKind2["Repost"] = 6] = "Repost";
  NDKKind2[NDKKind2["Reaction"] = 7] = "Reaction";
  NDKKind2[NDKKind2["BadgeAward"] = 8] = "BadgeAward";
  NDKKind2[NDKKind2["GroupChat"] = 9] = "GroupChat";
  NDKKind2[NDKKind2["Thread"] = 11] = "Thread";
  NDKKind2[NDKKind2["GroupReply"] = 12] = "GroupReply";
  NDKKind2[NDKKind2["GiftWrapSeal"] = 13] = "GiftWrapSeal";
  NDKKind2[NDKKind2["PrivateDirectMessage"] = 14] = "PrivateDirectMessage";
  NDKKind2[NDKKind2["Image"] = 20] = "Image";
  NDKKind2[NDKKind2["Video"] = 21] = "Video";
  NDKKind2[NDKKind2["ShortVideo"] = 22] = "ShortVideo";
  NDKKind2[NDKKind2["Story"] = 23] = "Story";
  NDKKind2[NDKKind2["Vanish"] = 62] = "Vanish";
  NDKKind2[NDKKind2["CashuWalletBackup"] = 375] = "CashuWalletBackup";
  NDKKind2[NDKKind2["GiftWrap"] = 1059] = "GiftWrap";
  NDKKind2[NDKKind2["GenericRepost"] = 16] = "GenericRepost";
  NDKKind2[NDKKind2["ChannelCreation"] = 40] = "ChannelCreation";
  NDKKind2[NDKKind2["ChannelMetadata"] = 41] = "ChannelMetadata";
  NDKKind2[NDKKind2["ChannelMessage"] = 42] = "ChannelMessage";
  NDKKind2[NDKKind2["ChannelHideMessage"] = 43] = "ChannelHideMessage";
  NDKKind2[NDKKind2["ChannelMuteUser"] = 44] = "ChannelMuteUser";
  NDKKind2[NDKKind2["WikiMergeRequest"] = 818] = "WikiMergeRequest";
  NDKKind2[NDKKind2["GenericReply"] = 1111] = "GenericReply";
  NDKKind2[NDKKind2["Media"] = 1063] = "Media";
  NDKKind2[NDKKind2["VoiceMessage"] = 1222] = "VoiceMessage";
  NDKKind2[NDKKind2["VoiceReply"] = 1244] = "VoiceReply";
  NDKKind2[NDKKind2["DraftCheckpoint"] = 1234] = "DraftCheckpoint";
  NDKKind2[NDKKind2["Task"] = 1934] = "Task";
  NDKKind2[NDKKind2["Report"] = 1984] = "Report";
  NDKKind2[NDKKind2["Label"] = 1985] = "Label";
  NDKKind2[NDKKind2["DVMReqTextExtraction"] = 5000] = "DVMReqTextExtraction";
  NDKKind2[NDKKind2["DVMReqTextSummarization"] = 5001] = "DVMReqTextSummarization";
  NDKKind2[NDKKind2["DVMReqTextTranslation"] = 5002] = "DVMReqTextTranslation";
  NDKKind2[NDKKind2["DVMReqTextGeneration"] = 5050] = "DVMReqTextGeneration";
  NDKKind2[NDKKind2["DVMReqImageGeneration"] = 5100] = "DVMReqImageGeneration";
  NDKKind2[NDKKind2["DVMReqTextToSpeech"] = 5250] = "DVMReqTextToSpeech";
  NDKKind2[NDKKind2["DVMReqDiscoveryNostrContent"] = 5300] = "DVMReqDiscoveryNostrContent";
  NDKKind2[NDKKind2["DVMReqDiscoveryNostrPeople"] = 5301] = "DVMReqDiscoveryNostrPeople";
  NDKKind2[NDKKind2["DVMReqTimestamping"] = 5900] = "DVMReqTimestamping";
  NDKKind2[NDKKind2["DVMEventSchedule"] = 5905] = "DVMEventSchedule";
  NDKKind2[NDKKind2["DVMJobFeedback"] = 7000] = "DVMJobFeedback";
  NDKKind2[NDKKind2["Subscribe"] = 7001] = "Subscribe";
  NDKKind2[NDKKind2["Unsubscribe"] = 7002] = "Unsubscribe";
  NDKKind2[NDKKind2["SubscriptionReceipt"] = 7003] = "SubscriptionReceipt";
  NDKKind2[NDKKind2["CashuReserve"] = 7373] = "CashuReserve";
  NDKKind2[NDKKind2["CashuQuote"] = 7374] = "CashuQuote";
  NDKKind2[NDKKind2["CashuToken"] = 7375] = "CashuToken";
  NDKKind2[NDKKind2["CashuWalletTx"] = 7376] = "CashuWalletTx";
  NDKKind2[NDKKind2["GroupAdminAddUser"] = 9000] = "GroupAdminAddUser";
  NDKKind2[NDKKind2["GroupAdminRemoveUser"] = 9001] = "GroupAdminRemoveUser";
  NDKKind2[NDKKind2["GroupAdminEditMetadata"] = 9002] = "GroupAdminEditMetadata";
  NDKKind2[NDKKind2["GroupAdminEditStatus"] = 9006] = "GroupAdminEditStatus";
  NDKKind2[NDKKind2["GroupAdminCreateGroup"] = 9007] = "GroupAdminCreateGroup";
  NDKKind2[NDKKind2["GroupAdminRequestJoin"] = 9021] = "GroupAdminRequestJoin";
  NDKKind2[NDKKind2["MuteList"] = 1e4] = "MuteList";
  NDKKind2[NDKKind2["PinList"] = 10001] = "PinList";
  NDKKind2[NDKKind2["RelayList"] = 10002] = "RelayList";
  NDKKind2[NDKKind2["BookmarkList"] = 10003] = "BookmarkList";
  NDKKind2[NDKKind2["CommunityList"] = 10004] = "CommunityList";
  NDKKind2[NDKKind2["PublicChatList"] = 10005] = "PublicChatList";
  NDKKind2[NDKKind2["BlockRelayList"] = 10006] = "BlockRelayList";
  NDKKind2[NDKKind2["SearchRelayList"] = 10007] = "SearchRelayList";
  NDKKind2[NDKKind2["SimpleGroupList"] = 10009] = "SimpleGroupList";
  NDKKind2[NDKKind2["RelayFeedList"] = 10012] = "RelayFeedList";
  NDKKind2[NDKKind2["InterestList"] = 10015] = "InterestList";
  NDKKind2[NDKKind2["CashuMintList"] = 10019] = "CashuMintList";
  NDKKind2[NDKKind2["EmojiList"] = 10030] = "EmojiList";
  NDKKind2[NDKKind2["DirectMessageReceiveRelayList"] = 10050] = "DirectMessageReceiveRelayList";
  NDKKind2[NDKKind2["BlossomList"] = 10063] = "BlossomList";
  NDKKind2[NDKKind2["NostrWaletConnectInfo"] = 13194] = "NostrWaletConnectInfo";
  NDKKind2[NDKKind2["TierList"] = 17000] = "TierList";
  NDKKind2[NDKKind2["CashuWallet"] = 17375] = "CashuWallet";
  NDKKind2[NDKKind2["FollowSet"] = 30000] = "FollowSet";
  NDKKind2[NDKKind2["CategorizedPeopleList"] = 30000] = "CategorizedPeopleList";
  NDKKind2[NDKKind2["CategorizedBookmarkList"] = 30001] = "CategorizedBookmarkList";
  NDKKind2[NDKKind2["RelaySet"] = 30002] = "RelaySet";
  NDKKind2[NDKKind2["CategorizedRelayList"] = 30002] = "CategorizedRelayList";
  NDKKind2[NDKKind2["BookmarkSet"] = 30003] = "BookmarkSet";
  NDKKind2[NDKKind2["CurationSet"] = 30004] = "CurationSet";
  NDKKind2[NDKKind2["ArticleCurationSet"] = 30004] = "ArticleCurationSet";
  NDKKind2[NDKKind2["VideoCurationSet"] = 30005] = "VideoCurationSet";
  NDKKind2[NDKKind2["ImageCurationSet"] = 30006] = "ImageCurationSet";
  NDKKind2[NDKKind2["InterestSet"] = 30015] = "InterestSet";
  NDKKind2[NDKKind2["InterestsList"] = 30015] = "InterestsList";
  NDKKind2[NDKKind2["ProjectTemplate"] = 30717] = "ProjectTemplate";
  NDKKind2[NDKKind2["EmojiSet"] = 30030] = "EmojiSet";
  NDKKind2[NDKKind2["ModularArticle"] = 30040] = "ModularArticle";
  NDKKind2[NDKKind2["ModularArticleItem"] = 30041] = "ModularArticleItem";
  NDKKind2[NDKKind2["Wiki"] = 30818] = "Wiki";
  NDKKind2[NDKKind2["Draft"] = 31234] = "Draft";
  NDKKind2[NDKKind2["Project"] = 31933] = "Project";
  NDKKind2[NDKKind2["SubscriptionTier"] = 37001] = "SubscriptionTier";
  NDKKind2[NDKKind2["EcashMintRecommendation"] = 38000] = "EcashMintRecommendation";
  NDKKind2[NDKKind2["CashuMintAnnouncement"] = 38172] = "CashuMintAnnouncement";
  NDKKind2[NDKKind2["FedimintMintAnnouncement"] = 38173] = "FedimintMintAnnouncement";
  NDKKind2[NDKKind2["P2POrder"] = 38383] = "P2POrder";
  NDKKind2[NDKKind2["HighlightSet"] = 39802] = "HighlightSet";
  NDKKind2[NDKKind2["CategorizedHighlightList"] = 39802] = "CategorizedHighlightList";
  NDKKind2[NDKKind2["Nutzap"] = 9321] = "Nutzap";
  NDKKind2[NDKKind2["ZapRequest"] = 9734] = "ZapRequest";
  NDKKind2[NDKKind2["Zap"] = 9735] = "Zap";
  NDKKind2[NDKKind2["Highlight"] = 9802] = "Highlight";
  NDKKind2[NDKKind2["ClientAuth"] = 22242] = "ClientAuth";
  NDKKind2[NDKKind2["NostrWalletConnectReq"] = 23194] = "NostrWalletConnectReq";
  NDKKind2[NDKKind2["NostrWalletConnectRes"] = 23195] = "NostrWalletConnectRes";
  NDKKind2[NDKKind2["NostrConnect"] = 24133] = "NostrConnect";
  NDKKind2[NDKKind2["BlossomUpload"] = 24242] = "BlossomUpload";
  NDKKind2[NDKKind2["HttpAuth"] = 27235] = "HttpAuth";
  NDKKind2[NDKKind2["ProfileBadge"] = 30008] = "ProfileBadge";
  NDKKind2[NDKKind2["BadgeDefinition"] = 30009] = "BadgeDefinition";
  NDKKind2[NDKKind2["MarketStall"] = 30017] = "MarketStall";
  NDKKind2[NDKKind2["MarketProduct"] = 30018] = "MarketProduct";
  NDKKind2[NDKKind2["Article"] = 30023] = "Article";
  NDKKind2[NDKKind2["AppSpecificData"] = 30078] = "AppSpecificData";
  NDKKind2[NDKKind2["Classified"] = 30402] = "Classified";
  NDKKind2[NDKKind2["HorizontalVideo"] = 34235] = "HorizontalVideo";
  NDKKind2[NDKKind2["VerticalVideo"] = 34236] = "VerticalVideo";
  NDKKind2[NDKKind2["GroupMetadata"] = 39000] = "GroupMetadata";
  NDKKind2[NDKKind2["GroupAdmins"] = 39001] = "GroupAdmins";
  NDKKind2[NDKKind2["GroupMembers"] = 39002] = "GroupMembers";
  NDKKind2[NDKKind2["FollowPack"] = 39089] = "FollowPack";
  NDKKind2[NDKKind2["MediaFollowPack"] = 39092] = "MediaFollowPack";
  NDKKind2[NDKKind2["AppRecommendation"] = 31989] = "AppRecommendation";
  NDKKind2[NDKKind2["AppHandler"] = 31990] = "AppHandler";
  return NDKKind2;
})(NDKKind || {});
function getRelaysForSync(ndk, author, type = "write") {
  if (!ndk.outboxTracker)
    return;
  const item = ndk.outboxTracker.data.get(author);
  if (!item)
    return;
  if (type === "write") {
    return item.writeRelays;
  }
  return item.readRelays;
}
async function getWriteRelaysFor(ndk, author, type = "write") {
  if (!ndk.outboxTracker)
    return;
  if (!ndk.outboxTracker.data.has(author)) {
    await ndk.outboxTracker.trackUsers([author]);
  }
  return getRelaysForSync(ndk, author, type);
}
function getTopRelaysForAuthors(ndk, authors) {
  const relaysWithCount = /* @__PURE__ */ new Map;
  authors.forEach((author) => {
    const writeRelays = getRelaysForSync(ndk, author);
    if (writeRelays) {
      writeRelays.forEach((relay) => {
        const count = relaysWithCount.get(relay) || 0;
        relaysWithCount.set(relay, count + 1);
      });
    }
  });
  const sortedRelays = Array.from(relaysWithCount.entries()).sort((a, b) => b[1] - a[1]);
  return sortedRelays.map((entry) => entry[0]);
}
function getAllRelaysForAllPubkeys(ndk, pubkeys, type = "read") {
  const pubkeysToRelays = /* @__PURE__ */ new Map;
  const authorsMissingRelays = /* @__PURE__ */ new Set;
  pubkeys.forEach((pubkey) => {
    const relays = getRelaysForSync(ndk, pubkey, type);
    if (relays && relays.size > 0) {
      relays.forEach((relay) => {
        const pubkeysInRelay = pubkeysToRelays.get(relay) || /* @__PURE__ */ new Set;
        pubkeysInRelay.add(pubkey);
      });
      pubkeysToRelays.set(pubkey, relays);
    } else {
      authorsMissingRelays.add(pubkey);
    }
  });
  return { pubkeysToRelays, authorsMissingRelays };
}
function chooseRelayCombinationForPubkeys(ndk, pubkeys, type, { count, preferredRelays } = {}) {
  count ??= 2;
  preferredRelays ??= /* @__PURE__ */ new Set;
  const pool = ndk.pool;
  const connectedRelays = pool.connectedRelays();
  connectedRelays.forEach((relay) => {
    preferredRelays?.add(relay.url);
  });
  const relayToAuthorsMap = /* @__PURE__ */ new Map;
  const { pubkeysToRelays, authorsMissingRelays } = getAllRelaysForAllPubkeys(ndk, pubkeys, type);
  const sortedRelays = getTopRelaysForAuthors(ndk, pubkeys);
  const addAuthorToRelay = (author, relay) => {
    const authorsInRelay = relayToAuthorsMap.get(relay) || [];
    authorsInRelay.push(author);
    relayToAuthorsMap.set(relay, authorsInRelay);
  };
  for (const [author, authorRelays] of pubkeysToRelays.entries()) {
    let missingRelayCount = count;
    const addedRelaysForAuthor = /* @__PURE__ */ new Set;
    for (const relay of connectedRelays) {
      if (authorRelays.has(relay.url)) {
        addAuthorToRelay(author, relay.url);
        addedRelaysForAuthor.add(relay.url);
        missingRelayCount--;
      }
    }
    for (const authorRelay of authorRelays) {
      if (addedRelaysForAuthor.has(authorRelay))
        continue;
      if (relayToAuthorsMap.has(authorRelay)) {
        addAuthorToRelay(author, authorRelay);
        addedRelaysForAuthor.add(authorRelay);
        missingRelayCount--;
      }
    }
    if (missingRelayCount <= 0)
      continue;
    for (const relay of sortedRelays) {
      if (missingRelayCount <= 0)
        break;
      if (addedRelaysForAuthor.has(relay))
        continue;
      if (authorRelays.has(relay)) {
        addAuthorToRelay(author, relay);
        addedRelaysForAuthor.add(relay);
        missingRelayCount--;
      }
    }
  }
  for (const author of authorsMissingRelays) {
    pool.permanentAndConnectedRelays().forEach((relay) => {
      const authorsInRelay = relayToAuthorsMap.get(relay.url) || [];
      authorsInRelay.push(author);
      relayToAuthorsMap.set(relay.url, authorsInRelay);
    });
  }
  return relayToAuthorsMap;
}
function getRelaysForFilterWithAuthors(ndk, authors, relayGoalPerAuthor = 2) {
  return chooseRelayCombinationForPubkeys(ndk, authors, "write", { count: relayGoalPerAuthor });
}
function tryNormalizeRelayUrl(url) {
  try {
    return normalizeRelayUrl(url);
  } catch {
    return;
  }
}
function normalizeRelayUrl(url) {
  let r = normalizeUrl(url, {
    stripAuthentication: false,
    stripWWW: false,
    stripHash: true
  });
  if (!r.endsWith("/")) {
    r += "/";
  }
  return r;
}
function normalize2(urls) {
  const normalized = /* @__PURE__ */ new Set;
  for (const url of urls) {
    try {
      normalized.add(normalizeRelayUrl(url));
    } catch {}
  }
  return Array.from(normalized);
}
var DATA_URL_DEFAULT_MIME_TYPE = "text/plain";
var DATA_URL_DEFAULT_CHARSET = "us-ascii";
var testParameter = (name, filters) => filters.some((filter) => filter instanceof RegExp ? filter.test(name) : filter === name);
var supportedProtocols = /* @__PURE__ */ new Set(["https:", "http:", "file:"]);
var hasCustomProtocol = (urlString) => {
  try {
    const { protocol } = new URL(urlString);
    return protocol.endsWith(":") && !protocol.includes(".") && !supportedProtocols.has(protocol);
  } catch {
    return false;
  }
};
var normalizeDataURL = (urlString, { stripHash }) => {
  const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString);
  if (!match) {
    throw new Error(`Invalid URL: ${urlString}`);
  }
  const type = match.groups?.type ?? "";
  const data = match.groups?.data ?? "";
  let hash3 = match.groups?.hash ?? "";
  const mediaType = type.split(";");
  hash3 = stripHash ? "" : hash3;
  let isBase64 = false;
  if (mediaType[mediaType.length - 1] === "base64") {
    mediaType.pop();
    isBase64 = true;
  }
  const mimeType = mediaType.shift()?.toLowerCase() ?? "";
  const attributes = mediaType.map((attribute) => {
    let [key, value = ""] = attribute.split("=").map((string) => string.trim());
    if (key === "charset") {
      value = value.toLowerCase();
      if (value === DATA_URL_DEFAULT_CHARSET) {
        return "";
      }
    }
    return `${key}${value ? `=${value}` : ""}`;
  }).filter(Boolean);
  const normalizedMediaType = [...attributes];
  if (isBase64) {
    normalizedMediaType.push("base64");
  }
  if (normalizedMediaType.length > 0 || mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE) {
    normalizedMediaType.unshift(mimeType);
  }
  return `data:${normalizedMediaType.join(";")},${isBase64 ? data.trim() : data}${hash3 ? `#${hash3}` : ""}`;
};
function normalizeUrl(urlString, options = {}) {
  options = {
    defaultProtocol: "http",
    normalizeProtocol: true,
    forceHttp: false,
    forceHttps: false,
    stripAuthentication: true,
    stripHash: false,
    stripTextFragment: true,
    stripWWW: true,
    removeQueryParameters: [/^utm_\w+/i],
    removeTrailingSlash: true,
    removeSingleSlash: true,
    removeDirectoryIndex: false,
    removeExplicitPort: false,
    sortQueryParameters: true,
    ...options
  };
  if (typeof options.defaultProtocol === "string" && !options.defaultProtocol.endsWith(":")) {
    options.defaultProtocol = `${options.defaultProtocol}:`;
  }
  urlString = urlString.trim();
  if (/^data:/i.test(urlString)) {
    return normalizeDataURL(urlString, options);
  }
  if (hasCustomProtocol(urlString)) {
    return urlString;
  }
  const hasRelativeProtocol = urlString.startsWith("//");
  const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);
  if (!isRelativeUrl) {
    urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
  }
  const urlObject = new URL(urlString);
  urlObject.hostname = urlObject.hostname.toLowerCase();
  if (options.forceHttp && options.forceHttps) {
    throw new Error("The `forceHttp` and `forceHttps` options cannot be used together");
  }
  if (options.forceHttp && urlObject.protocol === "https:") {
    urlObject.protocol = "http:";
  }
  if (options.forceHttps && urlObject.protocol === "http:") {
    urlObject.protocol = "https:";
  }
  if (options.stripAuthentication) {
    urlObject.username = "";
    urlObject.password = "";
  }
  if (options.stripHash) {
    urlObject.hash = "";
  } else if (options.stripTextFragment) {
    urlObject.hash = urlObject.hash.replace(/#?:~:text.*?$/i, "");
  }
  if (urlObject.pathname) {
    const protocolRegex = /\b[a-z][a-z\d+\-.]{1,50}:\/\//g;
    let lastIndex = 0;
    let result = "";
    for (;; ) {
      const match = protocolRegex.exec(urlObject.pathname);
      if (!match) {
        break;
      }
      const protocol = match[0];
      const protocolAtIndex = match.index;
      const intermediate = urlObject.pathname.slice(lastIndex, protocolAtIndex);
      result += intermediate.replace(/\/{2,}/g, "/");
      result += protocol;
      lastIndex = protocolAtIndex + protocol.length;
    }
    const remnant = urlObject.pathname.slice(lastIndex, urlObject.pathname.length);
    result += remnant.replace(/\/{2,}/g, "/");
    urlObject.pathname = result;
  }
  if (urlObject.pathname) {
    try {
      urlObject.pathname = decodeURI(urlObject.pathname);
    } catch {}
  }
  if (options.removeDirectoryIndex === true) {
    options.removeDirectoryIndex = [/^index\.[a-z]+$/];
  }
  if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
    let pathComponents = urlObject.pathname.split("/");
    const lastComponent = pathComponents[pathComponents.length - 1];
    if (testParameter(lastComponent, options.removeDirectoryIndex)) {
      pathComponents = pathComponents.slice(0, -1);
      urlObject.pathname = `${pathComponents.slice(1).join("/")}/`;
    }
  }
  if (urlObject.hostname) {
    urlObject.hostname = urlObject.hostname.replace(/\.$/, "");
    if (options.stripWWW && /^www\.(?!www\.)[a-z\-\d]{1,63}\.[a-z.\-\d]{2,63}$/.test(urlObject.hostname)) {
      urlObject.hostname = urlObject.hostname.replace(/^www\./, "");
    }
  }
  if (Array.isArray(options.removeQueryParameters)) {
    for (const key of [...urlObject.searchParams.keys()]) {
      if (testParameter(key, options.removeQueryParameters)) {
        urlObject.searchParams.delete(key);
      }
    }
  }
  if (!Array.isArray(options.keepQueryParameters) && options.removeQueryParameters === true) {
    urlObject.search = "";
  }
  if (Array.isArray(options.keepQueryParameters) && options.keepQueryParameters.length > 0) {
    for (const key of [...urlObject.searchParams.keys()]) {
      if (!testParameter(key, options.keepQueryParameters)) {
        urlObject.searchParams.delete(key);
      }
    }
  }
  if (options.sortQueryParameters) {
    urlObject.searchParams.sort();
    try {
      urlObject.search = decodeURIComponent(urlObject.search);
    } catch {}
  }
  if (options.removeTrailingSlash) {
    urlObject.pathname = urlObject.pathname.replace(/\/$/, "");
  }
  if (options.removeExplicitPort && urlObject.port) {
    urlObject.port = "";
  }
  const oldUrlString = urlString;
  urlString = urlObject.toString();
  if (!options.removeSingleSlash && urlObject.pathname === "/" && !oldUrlString.endsWith("/") && urlObject.hash === "") {
    urlString = urlString.replace(/\/$/, "");
  }
  if ((options.removeTrailingSlash || urlObject.pathname === "/") && urlObject.hash === "" && options.removeSingleSlash) {
    urlString = urlString.replace(/\/$/, "");
  }
  if (hasRelativeProtocol && !options.normalizeProtocol) {
    urlString = urlString.replace(/^http:\/\//, "//");
  }
  if (options.stripProtocol) {
    urlString = urlString.replace(/^(?:https?:)?\/\//, "");
  }
  return urlString;
}
var HLL_REGISTER_COUNT = 256;
var NDKCountHll = class _NDKCountHll {
  registers;
  constructor(registers) {
    if (registers) {
      if (registers.length !== HLL_REGISTER_COUNT) {
        throw new Error(`HLL must have exactly ${HLL_REGISTER_COUNT} registers, got ${registers.length}`);
      }
      this.registers = registers;
    } else {
      this.registers = new Uint8Array(HLL_REGISTER_COUNT);
    }
  }
  static fromHex(hex2) {
    if (hex2.length !== HLL_REGISTER_COUNT * 2) {
      throw new Error(`HLL hex string must be ${HLL_REGISTER_COUNT * 2} characters, got ${hex2.length}`);
    }
    const registers = new Uint8Array(HLL_REGISTER_COUNT);
    for (let i2 = 0;i2 < HLL_REGISTER_COUNT; i2++) {
      registers[i2] = parseInt(hex2.substring(i2 * 2, i2 * 2 + 2), 16);
    }
    return new _NDKCountHll(registers);
  }
  toHex() {
    return Array.from(this.registers).map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  merge(other) {
    const merged = new Uint8Array(HLL_REGISTER_COUNT);
    for (let i2 = 0;i2 < HLL_REGISTER_COUNT; i2++) {
      merged[i2] = Math.max(this.registers[i2], other.registers[i2]);
    }
    return new _NDKCountHll(merged);
  }
  static merge(hlls) {
    if (hlls.length === 0) {
      return new _NDKCountHll;
    }
    const merged = new Uint8Array(HLL_REGISTER_COUNT);
    for (let i2 = 0;i2 < HLL_REGISTER_COUNT; i2++) {
      merged[i2] = Math.max(...hlls.map((hll) => hll.registers[i2]));
    }
    return new _NDKCountHll(merged);
  }
  estimate() {
    const m = HLL_REGISTER_COUNT;
    const alpha = 0.7213 / (1 + 1.079 / m);
    let sum = 0;
    let zeros = 0;
    for (let i2 = 0;i2 < m; i2++) {
      sum += Math.pow(2, -this.registers[i2]);
      if (this.registers[i2] === 0) {
        zeros++;
      }
    }
    let estimate = alpha * m * m / sum;
    if (estimate <= 2.5 * m && zeros > 0) {
      estimate = m * Math.log(m / zeros);
    }
    return Math.round(estimate);
  }
  isEmpty() {
    return this.registers.every((v) => v === 0);
  }
  clone() {
    return new _NDKCountHll(new Uint8Array(this.registers));
  }
};
var NDKRelayKeepalive = class {
  constructor(timeout = 30000, onSilenceDetected) {
    this.onSilenceDetected = onSilenceDetected;
    this.timeout = timeout;
  }
  lastActivity = Date.now();
  timer;
  timeout;
  isRunning = false;
  recordActivity() {
    this.lastActivity = Date.now();
    if (this.isRunning) {
      this.resetTimer();
    }
  }
  start() {
    if (this.isRunning)
      return;
    this.isRunning = true;
    this.lastActivity = Date.now();
    this.resetTimer();
  }
  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }
  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      const silenceTime = Date.now() - this.lastActivity;
      if (silenceTime >= this.timeout) {
        this.onSilenceDetected();
      } else {
        const remainingTime = this.timeout - silenceTime;
        this.timer = setTimeout(() => {
          this.onSilenceDetected();
        }, remainingTime);
      }
    }, this.timeout);
  }
};
async function probeRelayConnection(relay) {
  const probeId = `probe-${Math.random().toString(36).substring(7)}`;
  return new Promise((resolve) => {
    let responded = false;
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        relay.send(["CLOSE", probeId]);
        resolve(false);
      }
    }, 5000);
    const handler = () => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        relay.send(["CLOSE", probeId]);
        resolve(true);
      }
    };
    relay.once("message", handler);
    relay.send([
      "REQ",
      probeId,
      {
        kinds: [99999],
        limit: 0
      }
    ]);
  });
}
var FLAPPING_THRESHOLD_MS = 1000;
var NDKRelayConnectivity = class {
  ndkRelay;
  ws;
  _status;
  timeoutMs;
  connectedAt;
  _connectionStats = {
    attempts: 0,
    success: 0,
    durations: []
  };
  debug;
  netDebug;
  connectTimeout;
  reconnectTimeout;
  ndk;
  openSubs = /* @__PURE__ */ new Map;
  openCountRequests = /* @__PURE__ */ new Map;
  openEventPublishes = /* @__PURE__ */ new Map;
  pendingAuthPublishes = /* @__PURE__ */ new Map;
  serial = 0;
  baseEoseTimeout = 4400;
  keepalive;
  wsStateMonitor;
  sleepDetector;
  lastSleepCheck = Date.now();
  lastMessageSent = Date.now();
  wasIdle = false;
  constructor(ndkRelay, ndk) {
    this.ndkRelay = ndkRelay;
    this._status = 1;
    const rand = Math.floor(Math.random() * 1000);
    this.debug = this.ndkRelay.debug.extend(`connectivity${rand}`);
    this.ndk = ndk;
    this.setupMonitoring();
  }
  setupMonitoring() {
    this.keepalive = new NDKRelayKeepalive(120000, async () => {
      this.debug("Relay silence detected, probing connection");
      const isAlive = await probeRelayConnection({
        send: (msg) => this.send(JSON.stringify(msg)),
        once: (event, handler) => {
          const messageHandler = (e) => {
            try {
              const data = JSON.parse(e.data);
              if (data[0] === "EOSE" || data[0] === "EVENT" || data[0] === "NOTICE") {
                handler();
                this.ws?.removeEventListener("message", messageHandler);
              }
            } catch {}
          };
          this.ws?.addEventListener("message", messageHandler);
        }
      });
      if (!isAlive) {
        this.debug("Probe failed, connection is stale");
        this.handleStaleConnection();
      }
    });
    this.wsStateMonitor = setInterval(() => {
      if (this._status === 5) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          this.debug("WebSocket died silently, reconnecting");
          this.handleStaleConnection();
        }
      }
    }, 5000);
    this.sleepDetector = setInterval(() => {
      const now2 = Date.now();
      const elapsed = now2 - this.lastSleepCheck;
      if (elapsed > 15000) {
        this.debug(`Detected possible sleep/wake (${elapsed}ms gap)`);
        this.handlePossibleWake();
      }
      this.lastSleepCheck = now2;
    }, 1e4);
  }
  handleStaleConnection() {
    this.wasIdle = true;
    this.keepalive?.stop();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = undefined;
    }
    this._status = 1;
    this.ndkRelay.emit("disconnect");
    this.handleReconnection();
  }
  handlePossibleWake() {
    this.debug("System wake detected, checking all connections");
    this.wasIdle = true;
    if (this._status >= 5) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.handleStaleConnection();
      } else {
        probeRelayConnection({
          send: (msg) => this.send(JSON.stringify(msg)),
          once: (event, handler) => {
            const messageHandler = (e) => {
              try {
                const data = JSON.parse(e.data);
                if (data[0] === "EOSE" || data[0] === "EVENT" || data[0] === "NOTICE") {
                  handler();
                  this.ws?.removeEventListener("message", messageHandler);
                }
              } catch {}
            };
            this.ws?.addEventListener("message", messageHandler);
          }
        }).then((isAlive) => {
          if (!isAlive) {
            this.handleStaleConnection();
          }
        });
      }
    }
  }
  resetReconnectionState() {
    this.wasIdle = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
  }
  async connect(timeoutMs, reconnect = true) {
    if (this.ws && this.ws.readyState !== WebSocket.OPEN && this.ws.readyState !== WebSocket.CONNECTING) {
      this.debug("Cleaning up stale WebSocket connection");
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = undefined;
      this._status = 1;
    }
    if (this._status !== 2 && this._status !== 1 || this.reconnectTimeout) {
      this.debug("Relay requested to be connected but was in state %s or it had a reconnect timeout", this._status);
      return;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = undefined;
    }
    timeoutMs ??= this.timeoutMs;
    if (!this.timeoutMs && timeoutMs)
      this.timeoutMs = timeoutMs;
    if (this.timeoutMs)
      this.connectTimeout = setTimeout(() => this.onConnectionError(reconnect), this.timeoutMs);
    try {
      this.updateConnectionStats.attempt();
      if (this._status === 1)
        this._status = 4;
      else
        this._status = 2;
      this.ws = new WebSocket(this.ndkRelay.url);
      this.ws.onopen = this.onConnect.bind(this);
      this.ws.onclose = this.onDisconnect.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch (e) {
      this.debug(`Failed to connect to ${this.ndkRelay.url}`, e);
      this._status = 1;
      if (reconnect)
        this.handleReconnection();
      else
        this.ndkRelay.emit("delayed-connect", 2 * 24 * 60 * 60 * 1000);
      throw e;
    }
  }
  disconnect() {
    this._status = 0;
    this.keepalive?.stop();
    if (this.wsStateMonitor) {
      clearInterval(this.wsStateMonitor);
      this.wsStateMonitor = undefined;
    }
    if (this.sleepDetector) {
      clearInterval(this.sleepDetector);
      this.sleepDetector = undefined;
    }
    try {
      this.ws?.close();
    } catch (e) {
      this.debug("Failed to disconnect", e);
      this._status = 1;
    }
  }
  onConnectionError(reconnect) {
    this.debug(`Error connecting to ${this.ndkRelay.url}`, this.timeoutMs);
    if (reconnect && !this.reconnectTimeout) {
      this.handleReconnection();
    }
  }
  onConnect() {
    this.netDebug?.("connected", this.ndkRelay);
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = undefined;
    }
    this.updateConnectionStats.connected();
    this._status = 5;
    this.keepalive?.start();
    this.wasIdle = false;
    this.ndkRelay.emit("connect");
    this.ndkRelay.emit("ready");
  }
  onDisconnect() {
    this.netDebug?.("disconnected", this.ndkRelay);
    this.updateConnectionStats.disconnected();
    this.keepalive?.stop();
    this.clearPendingPublishes(new Error(`Relay ${this.ndkRelay.url} disconnected`));
    if (this._status === 5) {
      this.handleReconnection();
    }
    this._status = 1;
    this.ndkRelay.emit("disconnect");
  }
  onMessage(event) {
    this.netDebug?.(event.data, this.ndkRelay, "recv");
    this.keepalive?.recordActivity();
    try {
      const data = JSON.parse(event.data);
      const [cmd, id, ..._rest] = data;
      const handler = this.ndkRelay.getProtocolHandler(cmd);
      if (handler) {
        handler(this.ndkRelay, data);
        return;
      }
      switch (cmd) {
        case "EVENT": {
          const so = this.openSubs.get(id);
          const event2 = data[2];
          if (!so) {
            this.debug(`Received event for unknown subscription ${id}`);
            return;
          }
          so.onevent(event2);
          return;
        }
        case "COUNT": {
          const payload = data[2];
          const cr = this.openCountRequests.get(id);
          if (cr) {
            const result = { count: payload.count };
            if (payload.hll) {
              try {
                result.hll = NDKCountHll.fromHex(payload.hll);
              } catch (e) {
                this.debug("Failed to parse HLL from COUNT response:", e);
              }
            }
            cr.resolve(result);
            this.openCountRequests.delete(id);
          }
          return;
        }
        case "EOSE": {
          const so = this.openSubs.get(id);
          if (!so)
            return;
          so.oneose(id);
          return;
        }
        case "OK": {
          const ok = data[2];
          const reason = data[3];
          const ep = this.openEventPublishes.get(id);
          const firstEp = ep?.pop();
          if (!ep || !firstEp) {
            this.debug("Received OK for unknown event publish", id);
            return;
          }
          if (ok) {
            firstEp.resolve(reason);
            this.pendingAuthPublishes.delete(id);
          } else {
            const isAuthRequired = reason && (reason.toLowerCase().includes("auth-required") || reason.toLowerCase().includes("not authorized") || reason.toLowerCase().includes("blocked: not authorized"));
            if (isAuthRequired) {
              const event2 = this.pendingAuthPublishes.get(id);
              if (event2) {
                this.debug("Publish failed due to auth-required, will retry after auth", id);
                ep.push(firstEp);
                this.openEventPublishes.set(id, ep);
              } else {
                firstEp.reject(new Error(reason));
              }
            } else {
              firstEp.reject(new Error(reason));
              this.pendingAuthPublishes.delete(id);
            }
          }
          if (ep.length === 0) {
            this.openEventPublishes.delete(id);
          } else if (!ok && !(reason?.toLowerCase().includes("auth-required") || reason?.toLowerCase().includes("not authorized") || reason?.toLowerCase().includes("blocked: not authorized"))) {
            this.openEventPublishes.set(id, ep);
          }
          return;
        }
        case "CLOSED": {
          const so = this.openSubs.get(id);
          if (!so)
            return;
          so.onclosed(data[2]);
          return;
        }
        case "NOTICE":
          this.onNotice(data[1]);
          return;
        case "AUTH": {
          this.onAuthRequested(data[1]);
          return;
        }
      }
    } catch (error) {
      this.debug(`Error parsing message from ${this.ndkRelay.url}: ${error.message}`, error?.stack);
      return;
    }
  }
  async onAuthRequested(challenge3) {
    const authPolicy = this.ndkRelay.authPolicy ?? this.ndk?.relayAuthDefaultPolicy;
    this.debug("Relay requested authentication", {
      havePolicy: !!authPolicy
    });
    if (this._status === 7) {
      this.debug("Already authenticating, ignoring");
      return;
    }
    this._status = 6;
    if (authPolicy) {
      if (this._status >= 5) {
        this._status = 7;
        let res;
        try {
          res = await authPolicy(this.ndkRelay, challenge3);
        } catch (e) {
          this.debug("Authentication policy threw an error", e);
          res = false;
        }
        this.debug("Authentication policy returned", !!res);
        if (res instanceof NDKEvent || res === true) {
          if (res instanceof NDKEvent) {
            await this.auth(res);
          }
          const authenticate = async () => {
            if (this._status >= 5 && this._status < 8) {
              const event = new NDKEvent(this.ndk);
              event.kind = 22242;
              event.tags = [
                ["relay", this.ndkRelay.url],
                ["challenge", challenge3]
              ];
              await event.sign();
              this.auth(event).then(() => {
                this._status = 8;
                this.ndkRelay.emit("authed");
                this.debug("Authentication successful");
                this.retryPendingAuthPublishes();
              }).catch((e) => {
                this._status = 6;
                this.ndkRelay.emit("auth:failed", e);
                this.debug("Authentication failed", e);
                this.rejectPendingAuthPublishes(e);
              });
            } else {
              this.debug("Authentication failed, it changed status, status is %d", this._status);
            }
          };
          if (res === true) {
            if (!this.ndk?.signer) {
              this.debug("No signer available for authentication localhost");
              this.ndk?.once("signer:ready", authenticate);
            } else {
              authenticate().catch((e) => {
                console.error("Error authenticating", e);
              });
            }
          }
          this._status = 5;
          this.ndkRelay.emit("authed");
        }
      }
    } else {
      this.ndkRelay.emit("auth", challenge3);
    }
  }
  onError(error) {
    this.debug(`WebSocket error on ${this.ndkRelay.url}:`, error);
  }
  get status() {
    return this._status;
  }
  isAvailable() {
    return this._status === 5;
  }
  isFlapping() {
    const durations = this._connectionStats.durations;
    if (durations.length % 3 !== 0)
      return false;
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const variance = durations.map((x) => (x - avg) ** 2).reduce((a, b) => a + b, 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    const isFlapping = stdDev < FLAPPING_THRESHOLD_MS;
    return isFlapping;
  }
  async onNotice(notice) {
    this.ndkRelay.emit("notice", notice);
  }
  handleReconnection(attempt = 0) {
    if (this.reconnectTimeout)
      return;
    if (this.isFlapping()) {
      this.ndkRelay.emit("flapping", this._connectionStats);
      this._status = 3;
      return;
    }
    let reconnectDelay;
    if (this.wasIdle) {
      const aggressiveDelays = [0, 1000, 2000, 5000, 1e4, 30000];
      reconnectDelay = aggressiveDelays[Math.min(attempt, aggressiveDelays.length - 1)];
      this.debug(`Using aggressive reconnect after idle, attempt ${attempt}, delay ${reconnectDelay}ms`);
    } else if (this.connectedAt) {
      reconnectDelay = Math.max(0, 60000 - (Date.now() - this.connectedAt));
    } else {
      reconnectDelay = Math.min(1000 * 2 ** attempt, 30000);
      this.debug(`Using standard backoff, attempt ${attempt}, delay ${reconnectDelay}ms`);
    }
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = undefined;
      this._status = 2;
      this.connect().catch(() => {
        this.handleReconnection(attempt + 1);
      });
    }, reconnectDelay);
    this.ndkRelay.emit("delayed-connect", reconnectDelay);
    this.debug("Reconnecting in", reconnectDelay);
    this._connectionStats.nextReconnectAt = Date.now() + reconnectDelay;
  }
  async send(message) {
    const idleTime = Date.now() - this.lastMessageSent;
    if (idleTime > 120000) {
      this.wasIdle = true;
    }
    if (this._status >= 5 && this.ws?.readyState === WebSocket.OPEN) {
      this.ws?.send(message);
      this.netDebug?.(message, this.ndkRelay, "send");
      this.lastMessageSent = Date.now();
    } else {
      this.debug(`Not connected to ${this.ndkRelay.url} (%d), not sending message ${message}`, this._status);
      if (this._status >= 5 && this.ws?.readyState !== WebSocket.OPEN) {
        this.debug(`Stale connection detected, WebSocket state: ${this.ws?.readyState}`);
        this.handleStaleConnection();
      }
    }
  }
  async auth(event) {
    const ret = new Promise((resolve, reject) => {
      const val = this.openEventPublishes.get(event.id) ?? [];
      val.push({ resolve, reject });
      this.openEventPublishes.set(event.id, val);
    });
    this.send(`["AUTH",${JSON.stringify(event.rawEvent())}]`);
    return ret;
  }
  clearPendingPublishes(error) {
    this.rejectPendingAuthPublishes(error);
    for (const [eventId, resolvers] of this.openEventPublishes.entries()) {
      while (resolvers.length > 0) {
        const resolver = resolvers.shift();
        if (resolver) {
          resolver.reject(error);
        }
      }
      this.openEventPublishes.delete(eventId);
    }
  }
  retryPendingAuthPublishes() {
    if (this.pendingAuthPublishes.size === 0)
      return;
    this.debug(`Retrying ${this.pendingAuthPublishes.size} pending publishes after auth`);
    for (const [eventId, event] of this.pendingAuthPublishes.entries()) {
      this.debug(`Retrying publish for event ${eventId}`);
      this.send(`["EVENT",${JSON.stringify(event)}]`);
    }
    this.pendingAuthPublishes.clear();
  }
  rejectPendingAuthPublishes(error) {
    if (this.pendingAuthPublishes.size === 0)
      return;
    this.debug(`Rejecting ${this.pendingAuthPublishes.size} pending publishes due to auth failure`);
    for (const [eventId] of this.pendingAuthPublishes.entries()) {
      const ep = this.openEventPublishes.get(eventId);
      if (ep && ep.length > 0) {
        const resolver = ep.pop();
        if (resolver) {
          resolver.reject(new Error(`Authentication failed: ${error.message}`));
        }
        if (ep.length === 0) {
          this.openEventPublishes.delete(eventId);
        }
      }
    }
    this.pendingAuthPublishes.clear();
  }
  async publish(event) {
    const ret = new Promise((resolve, reject) => {
      const val = this.openEventPublishes.get(event.id) ?? [];
      if (val.length > 0) {
        console.warn(`Duplicate event publishing detected, you are publishing event ${event.id} twice`);
      }
      val.push({ resolve, reject });
      this.openEventPublishes.set(event.id, val);
    });
    this.pendingAuthPublishes.set(event.id, event);
    this.send(`["EVENT",${JSON.stringify(event)}]`);
    return ret;
  }
  async count(filters, params) {
    this.serial++;
    const id = params?.id || `count:${this.serial}`;
    const ret = new Promise((resolve, reject) => {
      this.openCountRequests.set(id, { resolve, reject });
    });
    this.send(`["COUNT","${id}",${JSON.stringify(filters).substring(1)}`);
    return ret;
  }
  close(subId, reason) {
    this.send(`["CLOSE","${subId}"]`);
    const sub = this.openSubs.get(subId);
    this.openSubs.delete(subId);
    if (sub)
      sub.onclose(reason);
  }
  req(relaySub) {
    `${this.send(`["REQ","${relaySub.subId}",${JSON.stringify(relaySub.executeFilters).substring(1)}`)}]`;
    this.openSubs.set(relaySub.subId, relaySub);
  }
  updateConnectionStats = {
    connected: () => {
      this._connectionStats.success++;
      this._connectionStats.connectedAt = Date.now();
    },
    disconnected: () => {
      if (this._connectionStats.connectedAt) {
        this._connectionStats.durations.push(Date.now() - this._connectionStats.connectedAt);
        if (this._connectionStats.durations.length > 100) {
          this._connectionStats.durations.shift();
        }
      }
      this._connectionStats.connectedAt = undefined;
    },
    attempt: () => {
      this._connectionStats.attempts++;
      this._connectionStats.connectedAt = Date.now();
    }
  };
  get connectionStats() {
    return this._connectionStats;
  }
  get url() {
    return this.ndkRelay.url;
  }
  get connected() {
    return this._status >= 5 && this.ws?.readyState === WebSocket.OPEN;
  }
};
async function fetchRelayInformation2(relayUrl) {
  const httpUrl = relayUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
  const response = await fetch(httpUrl, {
    headers: {
      Accept: "application/nostr+json"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch relay information: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
var NDKRelayPublisher = class {
  ndkRelay;
  debug;
  constructor(ndkRelay) {
    this.ndkRelay = ndkRelay;
    this.debug = ndkRelay.debug.extend("publisher");
  }
  async publish(event, timeoutMs = 2500) {
    let timeout;
    const publishConnected = () => {
      return new Promise((resolve, reject) => {
        try {
          this.publishEvent(event).then((_result) => {
            this.ndkRelay.emit("published", event);
            event.emit("relay:published", this.ndkRelay);
            resolve(true);
          }).catch(reject);
        } catch (err) {
          reject(err);
        }
      });
    };
    const timeoutPromise = new Promise((_, reject) => {
      timeout = setTimeout(() => {
        timeout = undefined;
        reject(new Error(`Timeout: ${timeoutMs}ms`));
      }, timeoutMs);
    });
    const onConnectHandler = () => {
      publishConnected().then((result) => connectResolve(result)).catch((err) => connectReject(err));
    };
    let connectResolve;
    let connectReject;
    const onError = (err) => {
      this.ndkRelay.debug("Publish failed", err, event.id);
      this.ndkRelay.emit("publish:failed", event, err);
      event.emit("relay:publish:failed", this.ndkRelay, err);
      throw err;
    };
    const onFinally = () => {
      if (timeout)
        clearTimeout(timeout);
      this.ndkRelay.removeListener("connect", onConnectHandler);
    };
    if (this.ndkRelay.status >= 5) {
      return Promise.race([publishConnected(), timeoutPromise]).catch(onError).finally(onFinally);
    }
    if (this.ndkRelay.status <= 1) {
      console.warn("Relay is disconnected, trying to connect to publish an event", this.ndkRelay.url);
      this.ndkRelay.connect();
    } else {
      console.warn("Relay not connected, waiting for connection to publish an event", this.ndkRelay.url);
    }
    return Promise.race([
      new Promise((resolve, reject) => {
        connectResolve = resolve;
        connectReject = reject;
        this.ndkRelay.on("connect", onConnectHandler);
      }),
      timeoutPromise
    ]).catch(onError).finally(onFinally);
  }
  async publishEvent(event) {
    return this.ndkRelay.connectivity.publish(event.rawEvent());
  }
};
function filterFingerprint(filters, closeOnEose) {
  const elements = [];
  for (const filter of filters) {
    const keys = Object.entries(filter || {}).map(([key, values]) => {
      if (["since", "until"].includes(key)) {
        return `${key}:${values}`;
      }
      return key;
    }).sort().join("-");
    elements.push(keys);
  }
  let id = closeOnEose ? "+" : "";
  id += elements.join("|");
  return id;
}
function mergeFilters(filters) {
  const result = [];
  const lastResult = {};
  filters.filter((f) => !!f.limit).forEach((filterWithLimit) => result.push(filterWithLimit));
  filters = filters.filter((f) => !f.limit);
  if (filters.length === 0)
    return result;
  filters.forEach((filter) => {
    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (lastResult[key] === undefined) {
          lastResult[key] = [...value];
        } else {
          lastResult[key] = Array.from(/* @__PURE__ */ new Set([...lastResult[key], ...value]));
        }
      } else {
        lastResult[key] = value;
      }
    });
  });
  return [...result, lastResult];
}
var MAX_ITEMS = 3;
function formatArray(items, formatter) {
  const formatted = formatter ? items.slice(0, MAX_ITEMS).map(formatter) : items.slice(0, MAX_ITEMS);
  const display = formatted.join(",");
  return items.length > MAX_ITEMS ? `${display}+${items.length - MAX_ITEMS}` : display;
}
function formatFilters(filters) {
  return filters.map((f) => {
    const parts = [];
    if (f.ids?.length) {
      parts.push(`ids:[${formatArray(f.ids, (id) => String(id).slice(0, 8))}]`);
    }
    if (f.kinds?.length) {
      parts.push(`kinds:[${formatArray(f.kinds)}]`);
    }
    if (f.authors?.length) {
      parts.push(`authors:[${formatArray(f.authors, (a) => String(a).slice(0, 8))}]`);
    }
    if (f.since) {
      parts.push(`since:${f.since}`);
    }
    if (f.until) {
      parts.push(`until:${f.until}`);
    }
    if (f.limit) {
      parts.push(`limit:${f.limit}`);
    }
    if (f.search) {
      parts.push(`search:"${String(f.search).slice(0, 20)}"`);
    }
    for (const [key, value] of Object.entries(f)) {
      if (key.startsWith("#") && Array.isArray(value) && value.length > 0) {
        parts.push(`${key}:[${formatArray(value, (v) => String(v).slice(0, 8))}]`);
      }
    }
    return `{${parts.join(" ")}}`;
  }).join(", ");
}
var NDKRelaySubscription = class {
  fingerprint;
  items = /* @__PURE__ */ new Map;
  topSubManager;
  debug;
  status = 0;
  onClose;
  relay;
  eosed = false;
  executionTimer;
  fireTime;
  delayType;
  executeFilters;
  id = Math.random().toString(36).substring(7);
  constructor(relay, fingerprint, topSubManager) {
    this.relay = relay;
    this.topSubManager = topSubManager;
    this.debug = relay.debug.extend(`sub[${this.id}]`);
    this.fingerprint = fingerprint || Math.random().toString(36).substring(7);
  }
  _subId;
  get subId() {
    if (this._subId)
      return this._subId;
    this._subId = this.fingerprint.slice(0, 15);
    return this._subId;
  }
  subIdParts = /* @__PURE__ */ new Set;
  addSubIdPart(part) {
    this.subIdParts.add(part);
  }
  addItem(subscription, filters) {
    if (this.items.has(subscription.internalId)) {
      return;
    }
    subscription.on("close", this.removeItem.bind(this, subscription));
    this.items.set(subscription.internalId, { subscription, filters });
    if (this.status !== 3) {
      if (subscription.subId && (!this._subId || this._subId.length < 25)) {
        if (this.status === 0 || this.status === 1) {
          this.addSubIdPart(subscription.subId);
        }
      }
    }
    switch (this.status) {
      case 0:
        this.evaluateExecutionPlan(subscription);
        break;
      case 3:
        break;
      case 1:
        this.evaluateExecutionPlan(subscription);
        break;
      case 4:
        this.debug("Subscription is closed, cannot add new items", {
          filters: formatFilters(filters),
          subId: subscription.subId,
          internalId: subscription.internalId
        });
        throw new Error("Cannot add new items to a closed subscription");
    }
  }
  removeItem(subscription) {
    this.items.delete(subscription.internalId);
    if (this.items.size === 0) {
      if (this.status === 0 || this.status === 1) {
        this.status = 4;
        this.cleanup();
        return;
      }
      if (!this.eosed)
        return;
      this.close();
      this.cleanup();
    }
  }
  close() {
    if (this.status === 4)
      return;
    const prevStatus = this.status;
    this.status = 4;
    if (prevStatus === 3) {
      try {
        this.relay.close(this.subId);
      } catch (e) {
        this.debug("Error closing subscription", e, this);
      }
    } else {
      this.debug("Subscription wanted to close but it wasn't running, this is probably ok", {
        subId: this.subId,
        prevStatus,
        sub: this
      });
    }
    this.cleanup();
  }
  cleanup() {
    if (this.executionTimer)
      clearTimeout(this.executionTimer);
    this.relay.off("ready", this.executeOnRelayReady);
    this.relay.off("authed", this.reExecuteAfterAuth);
    if (this.onClose)
      this.onClose(this);
  }
  evaluateExecutionPlan(subscription) {
    if (!subscription.isGroupable()) {
      this.status = 1;
      this.execute();
      return;
    }
    if (subscription.filters.find((filter) => !!filter.limit)) {
      this.executeFilters = this.compileFilters();
      if (this.executeFilters.length >= 10) {
        this.status = 1;
        this.execute();
        return;
      }
    }
    const delay = subscription.groupableDelay;
    const delayType = subscription.groupableDelayType;
    if (!delay)
      throw new Error("Cannot group a subscription without a delay");
    if (this.status === 0) {
      this.schedule(delay, delayType);
    } else {
      const existingDelayType = this.delayType;
      const timeUntilFire = this.fireTime - Date.now();
      if (existingDelayType === "at-least" && delayType === "at-least") {
        if (timeUntilFire < delay) {
          if (this.executionTimer)
            clearTimeout(this.executionTimer);
          this.schedule(delay, delayType);
        }
      } else if (existingDelayType === "at-least" && delayType === "at-most") {
        if (timeUntilFire > delay) {
          if (this.executionTimer)
            clearTimeout(this.executionTimer);
          this.schedule(delay, delayType);
        }
      } else if (existingDelayType === "at-most" && delayType === "at-most") {
        if (timeUntilFire > delay) {
          if (this.executionTimer)
            clearTimeout(this.executionTimer);
          this.schedule(delay, delayType);
        }
      } else if (existingDelayType === "at-most" && delayType === "at-least") {
        if (timeUntilFire > delay) {
          if (this.executionTimer)
            clearTimeout(this.executionTimer);
          this.schedule(delay, delayType);
        }
      } else {
        throw new Error(`Unknown delay type combination ${existingDelayType} ${delayType}`);
      }
    }
  }
  schedule(delay, delayType) {
    this.status = 1;
    const currentTime = Date.now();
    this.fireTime = currentTime + delay;
    this.delayType = delayType;
    const timer = setTimeout(() => {
      this.execute();
    }, delay);
    if (delayType === "at-least") {
      this.executionTimer = timer;
    }
  }
  executeOnRelayReady = () => {
    if (this.status !== 2)
      return;
    if (this.items.size === 0) {
      this.debug("No items to execute; this relay was probably too slow to respond and the caller gave up", {
        status: this.status,
        fingerprint: this.fingerprint,
        id: this.id,
        subId: this.subId
      });
      this.cleanup();
      return;
    }
    this.debug("Executing on relay ready", {
      status: this.status,
      fingerprint: this.fingerprint,
      itemsSize: this.items.size,
      filters: formatFilters(this.compileFilters())
    });
    this.status = 1;
    this.execute();
  };
  finalizeSubId() {
    if (this.subIdParts.size > 0) {
      const parts = Array.from(this.subIdParts).map((part) => part.substring(0, 10));
      let joined = parts.join("-");
      if (joined.length > 20) {
        joined = joined.substring(0, 20);
      }
      this._subId = joined;
    } else {
      this._subId = this.fingerprint.slice(0, 15);
    }
    this._subId += `-${Math.random().toString(36).substring(2, 7)}`;
  }
  reExecuteAfterAuth = (() => {
    const oldSubId = this.subId;
    this.debug("Re-executing after auth", this.items.size);
    if (this.eosed) {
      this.relay.close(this.subId);
    } else {
      this.debug("We are abandoning an opened subscription, once it EOSE's, the handler will close it", {
        oldSubId
      });
    }
    this._subId = undefined;
    this.status = 1;
    this.execute();
    this.debug("Re-executed after auth %s \uD83D\uDC49 %s", oldSubId, this.subId);
  }).bind(this);
  execute() {
    if (this.status !== 1) {
      return;
    }
    if (!this.relay.connected) {
      this.status = 2;
      this.debug("Waiting for relay to be ready", {
        status: this.status,
        id: this.subId,
        fingerprint: this.fingerprint,
        itemsSize: this.items.size
      });
      this.relay.once("ready", this.executeOnRelayReady);
      return;
    }
    if (this.relay.status < 8) {
      this.relay.once("authed", this.reExecuteAfterAuth);
    }
    this.status = 3;
    this.finalizeSubId();
    this.executeFilters = this.compileFilters();
    this.relay.req(this);
  }
  onstart() {}
  onevent(event) {
    this.topSubManager.dispatchEvent(event, this.relay);
  }
  oneose(subId) {
    this.eosed = true;
    if (subId !== this.subId) {
      this.debug("Received EOSE for an abandoned subscription", subId, this.subId);
      this.relay.close(subId);
      return;
    }
    if (this.items.size === 0) {
      this.close();
    }
    for (const { subscription } of this.items.values()) {
      subscription.eoseReceived(this.relay);
      if (subscription.closeOnEose) {
        this.removeItem(subscription);
      }
    }
  }
  onclose(_reason) {
    this.status = 4;
  }
  onclosed(reason) {
    if (!reason)
      return;
    for (const { subscription } of this.items.values()) {
      subscription.closedReceived(this.relay, reason);
    }
  }
  compileFilters() {
    const mergedFilters = [];
    const filters = Array.from(this.items.values()).map((item) => item.filters);
    if (!filters[0]) {
      this.debug("\uD83D\uDC40 No filters to merge", { itemsSize: this.items.size });
      return [];
    }
    const filterCount = filters[0].length;
    for (let i2 = 0;i2 < filterCount; i2++) {
      const allFiltersAtIndex = filters.map((filter) => filter[i2]);
      const merged = mergeFilters(allFiltersAtIndex);
      mergedFilters.push(...merged);
    }
    return mergedFilters;
  }
};
var NDKRelaySubscriptionManager = class {
  relay;
  subscriptions;
  generalSubManager;
  constructor(relay, generalSubManager) {
    this.relay = relay;
    this.subscriptions = /* @__PURE__ */ new Map;
    this.generalSubManager = generalSubManager;
  }
  addSubscription(sub, filters) {
    let relaySub;
    if (!sub.isGroupable()) {
      relaySub = this.createSubscription(sub, filters);
    } else {
      const filterFp = filterFingerprint(filters, sub.closeOnEose);
      if (filterFp) {
        const existingSubs = this.subscriptions.get(filterFp);
        relaySub = (existingSubs || []).find((sub2) => sub2.status < 3);
      }
      relaySub ??= this.createSubscription(sub, filters, filterFp);
    }
    relaySub.addItem(sub, filters);
  }
  createSubscription(_sub, _filters, fingerprint) {
    const relaySub = new NDKRelaySubscription(this.relay, fingerprint || null, this.generalSubManager);
    relaySub.onClose = this.onRelaySubscriptionClose.bind(this);
    const currentVal = this.subscriptions.get(relaySub.fingerprint) ?? [];
    this.subscriptions.set(relaySub.fingerprint, [...currentVal, relaySub]);
    return relaySub;
  }
  onRelaySubscriptionClose(sub) {
    let currentVal = this.subscriptions.get(sub.fingerprint) ?? [];
    if (!currentVal) {
      console.warn("Unexpectedly did not find a subscription with fingerprint", sub.fingerprint);
    } else if (currentVal.length === 1) {
      this.subscriptions.delete(sub.fingerprint);
    } else {
      currentVal = currentVal.filter((s) => s.id !== sub.id);
      this.subscriptions.set(sub.fingerprint, currentVal);
    }
  }
};
var NDKRelay = class _NDKRelay extends import_tseep2.EventEmitter {
  url;
  scores;
  connectivity;
  subs;
  publisher;
  authPolicy;
  protocolHandlers = /* @__PURE__ */ new Map;
  _relayInfo;
  lowestValidationRatio;
  targetValidationRatio;
  validationRatioFn;
  validatedEventCount = 0;
  nonValidatedEventCount = 0;
  trusted = false;
  complaining = false;
  debug;
  static defaultValidationRatioUpdateFn = (relay, validatedCount, _nonValidatedCount) => {
    if (relay.lowestValidationRatio === undefined || relay.targetValidationRatio === undefined)
      return 1;
    let newRatio = relay.validationRatio;
    if (relay.validationRatio > relay.targetValidationRatio) {
      const factor = validatedCount / 100;
      newRatio = Math.max(relay.lowestValidationRatio, relay.validationRatio - factor);
    }
    if (newRatio < relay.validationRatio) {
      return newRatio;
    }
    return relay.validationRatio;
  };
  constructor(url, authPolicy, ndk) {
    super();
    this.url = normalizeRelayUrl(url);
    this.scores = /* @__PURE__ */ new Map;
    this.debug = import_debug2.default(`ndk:relay:${url}`);
    this.connectivity = new NDKRelayConnectivity(this, ndk);
    this.connectivity.netDebug = ndk?.netDebug;
    this.req = this.connectivity.req.bind(this.connectivity);
    this.close = this.connectivity.close.bind(this.connectivity);
    this.subs = new NDKRelaySubscriptionManager(this, ndk.subManager);
    this.publisher = new NDKRelayPublisher(this);
    this.authPolicy = authPolicy;
    this.targetValidationRatio = ndk?.initialValidationRatio;
    this.lowestValidationRatio = ndk?.lowestValidationRatio;
    this.validationRatioFn = (ndk?.validationRatioFn ?? _NDKRelay.defaultValidationRatioUpdateFn).bind(this);
    this.updateValidationRatio();
    if (!ndk) {
      console.trace("relay created without ndk");
    }
  }
  updateValidationRatio() {
    if (this.validationRatioFn && this.validatedEventCount > 0) {
      const newRatio = this.validationRatioFn(this, this.validatedEventCount, this.nonValidatedEventCount);
      this.targetValidationRatio = newRatio;
    }
    setTimeout(() => {
      this.updateValidationRatio();
    }, 30000);
  }
  get status() {
    return this.connectivity.status;
  }
  get connectionStats() {
    return this.connectivity.connectionStats;
  }
  async connect(timeoutMs, reconnect = true) {
    return this.connectivity.connect(timeoutMs, reconnect);
  }
  disconnect() {
    if (this.status === 1) {
      return;
    }
    this.connectivity.disconnect();
  }
  subscribe(subscription, filters) {
    this.subs.addSubscription(subscription, filters);
  }
  async publish(event, timeoutMs = 2500) {
    return this.publisher.publish(event, timeoutMs);
  }
  referenceTags() {
    return [["r", this.url]];
  }
  addValidatedEvent() {
    this.validatedEventCount++;
  }
  addNonValidatedEvent() {
    this.nonValidatedEventCount++;
  }
  get validationRatio() {
    if (this.nonValidatedEventCount === 0) {
      return 1;
    }
    return this.validatedEventCount / (this.validatedEventCount + this.nonValidatedEventCount);
  }
  shouldValidateEvent() {
    if (this.trusted) {
      return false;
    }
    if (this.targetValidationRatio === undefined) {
      return true;
    }
    if (this.targetValidationRatio >= 1)
      return true;
    return Math.random() < this.targetValidationRatio;
  }
  get connected() {
    return this.connectivity.connected;
  }
  req;
  close;
  registerProtocolHandler(messageType, handler) {
    this.protocolHandlers.set(messageType, handler);
  }
  unregisterProtocolHandler(messageType) {
    this.protocolHandlers.delete(messageType);
  }
  getProtocolHandler(messageType) {
    return this.protocolHandlers.get(messageType);
  }
  async fetchInfo(force = false) {
    const MAX_AGE = 86400000;
    const ndk = this.connectivity.ndk;
    if (!force && ndk?.cacheAdapter?.getRelayStatus) {
      const cached = await ndk.cacheAdapter.getRelayStatus(this.url);
      if (cached?.nip11 && Date.now() - cached.nip11.fetchedAt < MAX_AGE) {
        this._relayInfo = cached.nip11.data;
        return cached.nip11.data;
      }
    }
    if (!force && this._relayInfo) {
      return this._relayInfo;
    }
    this._relayInfo = await fetchRelayInformation2(this.url);
    if (ndk?.cacheAdapter?.updateRelayStatus) {
      await ndk.cacheAdapter.updateRelayStatus(this.url, {
        nip11: {
          data: this._relayInfo,
          fetchedAt: Date.now()
        }
      });
    }
    return this._relayInfo;
  }
  get info() {
    return this._relayInfo;
  }
};
var NDKPublishError = class extends Error {
  errors;
  publishedToRelays;
  intendedRelaySet;
  constructor(message, errors, publishedToRelays, intendedRelaySet) {
    super(message);
    this.errors = errors;
    this.publishedToRelays = publishedToRelays;
    this.intendedRelaySet = intendedRelaySet;
  }
  get relayErrors() {
    const errors = [];
    for (const [relay, err] of this.errors) {
      errors.push(`${relay.url}: ${err}`);
    }
    return errors.join(`
`);
  }
};
var NDKRelaySet = class _NDKRelaySet {
  relays;
  debug;
  ndk;
  pool;
  constructor(relays, ndk, pool) {
    this.relays = relays;
    this.ndk = ndk;
    this.pool = pool ?? ndk.pool;
    this.debug = ndk.debug.extend("relayset");
  }
  addRelay(relay) {
    this.relays.add(relay);
  }
  get relayUrls() {
    return Array.from(this.relays).map((r) => r.url);
  }
  static fromRelayUrls(relayUrls, ndk, connect = true, pool) {
    pool = pool ?? ndk.pool;
    if (!pool)
      throw new Error("No pool provided");
    const relays = /* @__PURE__ */ new Set;
    for (const url of relayUrls) {
      const relay = pool.relays.get(normalizeRelayUrl(url));
      if (relay) {
        if (relay.status < 5 && connect) {
          relay.connect();
        }
        relays.add(relay);
      } else {
        const temporaryRelay = new NDKRelay(normalizeRelayUrl(url), ndk?.relayAuthDefaultPolicy, ndk);
        pool.useTemporaryRelay(temporaryRelay, undefined, `requested from fromRelayUrls ${relayUrls}`);
        relays.add(temporaryRelay);
      }
    }
    return new _NDKRelaySet(new Set(relays), ndk, pool);
  }
  async publish(event, timeoutMs, requiredRelayCount = 1) {
    const publishedToRelays = /* @__PURE__ */ new Set;
    const errors = /* @__PURE__ */ new Map;
    const isEphemeral2 = event.isEphemeral();
    event.publishStatus = "pending";
    const relayPublishedHandler = (relay) => {
      publishedToRelays.add(relay);
    };
    event.on("relay:published", relayPublishedHandler);
    try {
      const promises = Array.from(this.relays).map((relay) => {
        return new Promise((resolve) => {
          const timeoutId = timeoutMs ? setTimeout(() => {
            if (!publishedToRelays.has(relay)) {
              errors.set(relay, new Error(`Publish timeout after ${timeoutMs}ms`));
              resolve(false);
            }
          }, timeoutMs) : null;
          relay.publish(event, timeoutMs).then((success) => {
            if (timeoutId)
              clearTimeout(timeoutId);
            if (success) {
              publishedToRelays.add(relay);
              resolve(true);
            } else {
              resolve(false);
            }
          }).catch((err) => {
            if (timeoutId)
              clearTimeout(timeoutId);
            if (!isEphemeral2) {
              errors.set(relay, err);
            }
            resolve(false);
          });
        });
      });
      await Promise.all(promises);
      if (publishedToRelays.size < requiredRelayCount) {
        if (!isEphemeral2) {
          const error = new NDKPublishError("Not enough relays received the event (" + publishedToRelays.size + " published, " + requiredRelayCount + " required)", errors, publishedToRelays, this);
          event.publishStatus = "error";
          event.publishError = error;
          this.ndk?.emit("event:publish-failed", event, error, this.relayUrls);
          throw error;
        }
      } else {
        event.publishStatus = "success";
        event.emit("published", { relaySet: this, publishedToRelays });
      }
      return publishedToRelays;
    } finally {
      event.off("relay:published", relayPublishedHandler);
    }
  }
  get size() {
    return this.relays.size;
  }
  async count(filters, opts = {}) {
    const timeout = opts.timeout ?? 5000;
    const filtersArray = Array.isArray(filters) ? filters : [filters];
    const relayResults = /* @__PURE__ */ new Map;
    const hlls = [];
    const promises = Array.from(this.relays).map(async (relay) => {
      if (relay.status < 5) {
        return;
      }
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Count timeout after ${timeout}ms`)), timeout);
        });
        const result = await Promise.race([
          relay.connectivity.count(filtersArray, { id: opts.id }),
          timeoutPromise
        ]);
        relayResults.set(relay.url, result);
        if (result.hll) {
          hlls.push(result.hll);
        }
      } catch (error) {
        this.debug(`Count failed for relay ${relay.url}:`, error);
      }
    });
    await Promise.allSettled(promises);
    let count;
    let mergedHll;
    if (hlls.length > 0) {
      mergedHll = NDKCountHll.merge(hlls);
      count = mergedHll.estimate();
    } else {
      count = 0;
      for (const result of relayResults.values()) {
        count = Math.max(count, result.count);
      }
    }
    return {
      count,
      mergedHll,
      relayResults
    };
  }
};
var d = import_debug.default("ndk:outbox:calculate");
async function calculateRelaySetFromEvent(ndk, event, requiredRelayCount) {
  const relays = /* @__PURE__ */ new Set;
  const authorWriteRelays = await getWriteRelaysFor(ndk, event.pubkey);
  if (authorWriteRelays) {
    authorWriteRelays.forEach((relayUrl) => {
      const relay = ndk.pool?.getRelay(relayUrl);
      if (relay)
        relays.add(relay);
    });
  }
  let relayHints = event.tags.filter((tag) => ["a", "e"].includes(tag[0])).map((tag) => tag[2]).filter((url) => url?.startsWith("wss://")).filter((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }).map((url) => normalizeRelayUrl(url));
  relayHints = Array.from(new Set(relayHints)).slice(0, 5);
  relayHints.forEach((relayUrl) => {
    const relay = ndk.pool?.getRelay(relayUrl, true, true);
    if (relay) {
      d("Adding relay hint %s", relayUrl);
      relays.add(relay);
    }
  });
  const pTags = event.getMatchingTags("p").map((tag) => tag[1]);
  if (pTags.length < 5) {
    const pTaggedRelays = Array.from(chooseRelayCombinationForPubkeys(ndk, pTags, "read", {
      preferredRelays: new Set(authorWriteRelays)
    }).keys());
    pTaggedRelays.forEach((relayUrl) => {
      const relay = ndk.pool?.getRelay(relayUrl, false, true);
      if (relay) {
        d("Adding p-tagged relay %s", relayUrl);
        relays.add(relay);
      }
    });
  } else {
    d("Too many p-tags to consider %d", pTags.length);
  }
  ndk.pool?.permanentAndConnectedRelays().forEach((relay) => relays.add(relay));
  if (requiredRelayCount && relays.size < requiredRelayCount) {
    const explicitRelays = ndk.explicitRelayUrls?.filter((url) => !Array.from(relays).some((r) => r.url === url)).slice(0, requiredRelayCount - relays.size);
    explicitRelays?.forEach((url) => {
      const relay = ndk.pool?.getRelay(url, false, true);
      if (relay) {
        d("Adding explicit relay %s", url);
        relays.add(relay);
      }
    });
  }
  return new NDKRelaySet(relays, ndk);
}
function calculateRelaySetsFromFilter(ndk, filters, pool, relayGoalPerAuthor) {
  const result = /* @__PURE__ */ new Map;
  const authors = /* @__PURE__ */ new Set;
  filters.forEach((filter) => {
    if (filter.authors) {
      filter.authors.forEach((author) => authors.add(author));
    }
  });
  if (authors.size > 0) {
    const authorToRelaysMap = getRelaysForFilterWithAuthors(ndk, Array.from(authors), relayGoalPerAuthor);
    for (const relayUrl of authorToRelaysMap.keys()) {
      result.set(relayUrl, []);
    }
    for (const filter of filters) {
      if (filter.authors) {
        for (const [relayUrl, authors2] of authorToRelaysMap.entries()) {
          const authorFilterAndRelayPubkeyIntersection = filter.authors.filter((author) => authors2.includes(author));
          result.set(relayUrl, [
            ...result.get(relayUrl),
            {
              ...filter,
              authors: authorFilterAndRelayPubkeyIntersection
            }
          ]);
        }
      } else {
        for (const relayUrl of authorToRelaysMap.keys()) {
          result.set(relayUrl, [...result.get(relayUrl), filter]);
        }
      }
    }
  } else {
    if (ndk.explicitRelayUrls) {
      ndk.explicitRelayUrls.forEach((relayUrl) => {
        result.set(relayUrl, filters);
      });
    }
  }
  if (result.size === 0) {
    pool.permanentAndConnectedRelays().slice(0, 5).forEach((relay) => {
      result.set(relay.url, filters);
    });
  }
  return result;
}
function calculateRelaySetsFromFilters(ndk, filters, pool, relayGoalPerAuthor) {
  const a = calculateRelaySetsFromFilter(ndk, filters, pool, relayGoalPerAuthor);
  return a;
}
function isValidHex64(value) {
  if (typeof value !== "string" || value.length !== 64) {
    return false;
  }
  for (let i2 = 0;i2 < 64; i2++) {
    const c = value.charCodeAt(i2);
    if (!(c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70)) {
      return false;
    }
  }
  return true;
}
function isValidPubkey(pubkey) {
  return isValidHex64(pubkey);
}
function isValidNip05(input) {
  if (typeof input !== "string") {
    return false;
  }
  for (let i2 = 0;i2 < input.length; i2++) {
    if (input.charCodeAt(i2) === 46) {
      return true;
    }
  }
  return false;
}
function mergeTags(tags1, tags2) {
  const tagMap = /* @__PURE__ */ new Map;
  const generateKey = (tag) => tag.join(",");
  const isContained = (smaller, larger) => {
    return smaller.every((value, index) => value === larger[index]);
  };
  const processTag = (tag) => {
    for (const [key, existingTag] of tagMap) {
      if (isContained(existingTag, tag) || isContained(tag, existingTag)) {
        if (tag.length >= existingTag.length) {
          tagMap.set(key, tag);
        }
        return;
      }
    }
    tagMap.set(generateKey(tag), tag);
  };
  tags1.concat(tags2).forEach(processTag);
  return Array.from(tagMap.values());
}
var hashtagRegex = /(?<=\s|^)(#[^\s!@#$%^&*()=+./,[{\]};:'"?><]+)/g;
function generateHashtags(content) {
  const hashtags = content.match(hashtagRegex);
  const tagIds = /* @__PURE__ */ new Set;
  const tag = /* @__PURE__ */ new Set;
  if (hashtags) {
    for (const hashtag of hashtags) {
      if (tagIds.has(hashtag.slice(1)))
        continue;
      tag.add(hashtag.slice(1));
      tagIds.add(hashtag.slice(1));
    }
  }
  return Array.from(tag);
}
async function generateContentTags(content, tags = [], opts, ctx) {
  if (opts?.skipContentTagging) {
    return { content, tags };
  }
  const tagRegex = /(@|nostr:)(npub|nprofile|note|nevent|naddr)[a-zA-Z0-9]+/g;
  const promises = [];
  const addTagIfNew = (t) => {
    if (!tags.find((t2) => ["q", t[0]].includes(t2[0]) && t2[1] === t[1])) {
      tags.push(t);
    }
  };
  content = content.replace(tagRegex, (tag) => {
    try {
      const entity = tag.split(/(@|nostr:)/)[2];
      const { type, data } = nip19_exports.decode(entity);
      let t;
      if (opts?.filters) {
        const shouldInclude = !opts.filters.includeTypes || opts.filters.includeTypes.includes(type);
        const shouldExclude = opts.filters.excludeTypes?.includes(type);
        if (!shouldInclude || shouldExclude) {
          return tag;
        }
      }
      switch (type) {
        case "npub":
          if (opts?.pTags !== false) {
            t = ["p", data];
          }
          break;
        case "nprofile":
          if (opts?.pTags !== false) {
            t = ["p", data.pubkey];
          }
          break;
        case "note":
          promises.push(new Promise(async (resolve) => {
            const relay = await maybeGetEventRelayUrl(entity);
            addTagIfNew(["q", data, relay]);
            resolve();
          }));
          break;
        case "nevent":
          promises.push(new Promise(async (resolve) => {
            const { id, author } = data;
            let { relays } = data;
            if (!relays || relays.length === 0) {
              relays = [await maybeGetEventRelayUrl(entity)];
            }
            addTagIfNew(["q", id, relays[0]]);
            if (author && opts?.pTags !== false && opts?.pTagOnQTags !== false)
              addTagIfNew(["p", author]);
            resolve();
          }));
          break;
        case "naddr":
          promises.push(new Promise(async (resolve) => {
            const id = [data.kind, data.pubkey, data.identifier].join(":");
            let relays = data.relays ?? [];
            if (relays.length === 0) {
              relays = [await maybeGetEventRelayUrl(entity)];
            }
            addTagIfNew(["q", id, relays[0]]);
            if (opts?.pTags !== false && opts?.pTagOnQTags !== false && opts?.pTagOnATags !== false)
              addTagIfNew(["p", data.pubkey]);
            resolve();
          }));
          break;
        default:
          return tag;
      }
      if (t)
        addTagIfNew(t);
      return `nostr:${entity}`;
    } catch (_error) {
      return tag;
    }
  });
  await Promise.all(promises);
  if (!opts?.filters?.excludeTypes?.includes("hashtag")) {
    const newTags = generateHashtags(content).map((hashtag) => ["t", hashtag]);
    tags = mergeTags(tags, newTags);
  }
  if (opts?.pTags !== false && opts?.copyPTagsFromTarget && ctx) {
    const pTags = ctx.getMatchingTags("p");
    for (const pTag of pTags) {
      if (!pTag[1] || !isValidPubkey(pTag[1]))
        continue;
      if (!tags.find((t) => t[0] === "p" && t[1] === pTag[1])) {
        tags.push(pTag);
      }
    }
  }
  return { content, tags };
}
async function maybeGetEventRelayUrl(_nip19Id) {
  return "";
}
async function encrypt4(recipient, signer, scheme = "nip44") {
  let encrypted;
  if (!this.ndk)
    throw new Error("No NDK instance found!");
  let currentSigner = signer;
  if (!currentSigner) {
    this.ndk.assertSigner();
    currentSigner = this.ndk.signer;
  }
  if (!currentSigner)
    throw new Error("no NDK signer");
  const currentRecipient = recipient || (() => {
    const pTags = this.getMatchingTags("p");
    if (pTags.length !== 1) {
      throw new Error("No recipient could be determined and no explicit recipient was provided");
    }
    return this.ndk.getUser({ pubkey: pTags[0][1] });
  })();
  if (scheme === "nip44" && await isEncryptionEnabled(currentSigner, "nip44")) {
    encrypted = await currentSigner.encrypt(currentRecipient, this.content, "nip44");
  }
  if ((!encrypted || scheme === "nip04") && await isEncryptionEnabled(currentSigner, "nip04")) {
    encrypted = await currentSigner.encrypt(currentRecipient, this.content, "nip04");
  }
  if (!encrypted)
    throw new Error("Failed to encrypt event.");
  this.content = encrypted;
}
async function decrypt4(sender, signer, scheme) {
  if (this.ndk?.cacheAdapter?.getDecryptedEvent) {
    const cachedEvent = await this.ndk.cacheAdapter.getDecryptedEvent(this.id);
    if (cachedEvent) {
      this.content = cachedEvent.content;
      return;
    }
  }
  let decrypted;
  if (!this.ndk)
    throw new Error("No NDK instance found!");
  let currentSigner = signer;
  if (!currentSigner) {
    this.ndk.assertSigner();
    currentSigner = this.ndk.signer;
  }
  if (!currentSigner)
    throw new Error("no NDK signer");
  const currentSender = sender || this.author;
  if (!currentSender)
    throw new Error("No sender provided and no author available");
  const currentScheme = scheme || (this.content.match(/\\?iv=/) ? "nip04" : "nip44");
  if ((currentScheme === "nip04" || this.kind === 4) && await isEncryptionEnabled(currentSigner, "nip04") && this.content.search("\\?iv=")) {
    decrypted = await currentSigner.decrypt(currentSender, this.content, "nip04");
  }
  if (!decrypted && currentScheme === "nip44" && await isEncryptionEnabled(currentSigner, "nip44")) {
    decrypted = await currentSigner.decrypt(currentSender, this.content, "nip44");
  }
  if (!decrypted)
    throw new Error("Failed to decrypt event.");
  this.content = decrypted;
  if (this.ndk?.cacheAdapter?.addDecryptedEvent) {
    this.ndk.cacheAdapter.addDecryptedEvent(this.id, this);
  }
}
async function isEncryptionEnabled(signer, scheme) {
  if (!signer.encryptionEnabled)
    return false;
  if (!scheme)
    return true;
  return Boolean(await signer.encryptionEnabled(scheme));
}
function eventHasETagMarkers(event) {
  for (const tag of event.tags) {
    if (tag[0] === "e" && (tag[3] ?? "").length > 0)
      return true;
  }
  return false;
}
function getRootTag(event, searchTag) {
  searchTag ??= event.tagType();
  const rootEventTag = event.tags.find(isTagRootTag);
  if (!rootEventTag) {
    if (eventHasETagMarkers(event))
      return;
    const matchingTags = event.getMatchingTags(searchTag);
    if (matchingTags.length < 3)
      return matchingTags[0];
  }
  return rootEventTag;
}
var nip22RootTags = /* @__PURE__ */ new Set(["A", "E", "I"]);
var nip22ReplyTags = /* @__PURE__ */ new Set(["a", "e", "i"]);
function getReplyTag(event, searchTag) {
  if (event.kind === 1111) {
    let replyTag2;
    for (const tag of event.tags) {
      if (nip22RootTags.has(tag[0]))
        replyTag2 = tag;
      else if (nip22ReplyTags.has(tag[0])) {
        replyTag2 = tag;
        break;
      }
    }
    return replyTag2;
  }
  searchTag ??= event.tagType();
  let hasMarkers2 = false;
  let replyTag;
  for (const tag of event.tags) {
    if (tag[0] !== searchTag)
      continue;
    if ((tag[3] ?? "").length > 0)
      hasMarkers2 = true;
    if (hasMarkers2 && tag[3] === "reply")
      return tag;
    if (hasMarkers2 && tag[3] === "root")
      replyTag = tag;
    if (!hasMarkers2)
      replyTag = tag;
  }
  return replyTag;
}
function isTagRootTag(tag) {
  return tag[0] === "E" || tag[3] === "root";
}
async function fetchTaggedEvent(tag, marker) {
  if (!this.ndk)
    throw new Error("NDK instance not found");
  const t = this.getMatchingTags(tag, marker);
  if (t.length === 0)
    return;
  const [_, id, hint] = t[0];
  const relay = hint !== "" ? this.ndk.pool.getRelay(hint) : undefined;
  const event = await this.ndk.fetchEvent(id, {}, relay);
  return event;
}
async function fetchRootEvent(subOpts) {
  if (!this.ndk)
    throw new Error("NDK instance not found");
  const rootTag = getRootTag(this);
  if (!rootTag)
    return;
  return this.ndk.fetchEventFromTag(rootTag, this, subOpts);
}
async function fetchReplyEvent(subOpts) {
  if (!this.ndk)
    throw new Error("NDK instance not found");
  const replyTag = getReplyTag(this);
  if (!replyTag)
    return;
  return this.ndk.fetchEventFromTag(replyTag, this, subOpts);
}
function isReplaceable() {
  if (this.kind === undefined)
    throw new Error("Kind not set");
  return [0, 3].includes(this.kind) || this.kind >= 1e4 && this.kind < 20000 || this.kind >= 30000 && this.kind < 40000;
}
function isEphemeral() {
  if (this.kind === undefined)
    throw new Error("Kind not set");
  return this.kind >= 20000 && this.kind < 30000;
}
function isParamReplaceable() {
  if (this.kind === undefined)
    throw new Error("Kind not set");
  return this.kind >= 30000 && this.kind < 40000;
}
var DEFAULT_RELAY_COUNT = 2;
function encode(maxRelayCount = DEFAULT_RELAY_COUNT) {
  let relays = [];
  if (this.onRelays.length > 0) {
    relays = this.onRelays.map((relay) => relay.url);
  } else if (this.relay) {
    relays = [this.relay.url];
  }
  if (relays.length > maxRelayCount) {
    relays = relays.slice(0, maxRelayCount);
  }
  if (this.isParamReplaceable()) {
    return nip19_exports.naddrEncode({
      kind: this.kind,
      pubkey: this.pubkey,
      identifier: this.replaceableDTag(),
      relays
    });
  }
  if (relays.length > 0) {
    return nip19_exports.neventEncode({
      id: this.tagId(),
      relays,
      author: this.pubkey
    });
  }
  return nip19_exports.noteEncode(this.tagId());
}
async function repost(publish = true, signer) {
  if (!signer && publish) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    signer = this.ndk.signer;
  }
  const e = new NDKEvent(this.ndk, {
    kind: getKind(this)
  });
  if (!this.isProtected)
    e.content = JSON.stringify(this.rawEvent());
  e.tag(this);
  if (this.kind !== 1) {
    e.tags.push(["k", `${this.kind}`]);
  }
  if (signer)
    await e.sign(signer);
  if (publish)
    await e.publish();
  return e;
}
function getKind(event) {
  if (event.kind === 1) {
    return 6;
  }
  return 16;
}
function getEventDetails(event) {
  if ("inspect" in event && typeof event.inspect === "string") {
    return event.inspect;
  }
  return JSON.stringify(event);
}
function validateForSerialization(event) {
  if (typeof event.kind !== "number") {
    throw new Error(`Can't serialize event with invalid properties: kind (must be number, got ${typeof event.kind}). Event: ${getEventDetails(event)}`);
  }
  if (typeof event.content !== "string") {
    throw new Error(`Can't serialize event with invalid properties: content (must be string, got ${typeof event.content}). Event: ${getEventDetails(event)}`);
  }
  if (typeof event.created_at !== "number") {
    throw new Error(`Can't serialize event with invalid properties: created_at (must be number, got ${typeof event.created_at}). Event: ${getEventDetails(event)}`);
  }
  if (typeof event.pubkey !== "string") {
    throw new Error(`Can't serialize event with invalid properties: pubkey (must be string, got ${typeof event.pubkey}). Event: ${getEventDetails(event)}`);
  }
  if (!Array.isArray(event.tags)) {
    throw new Error(`Can't serialize event with invalid properties: tags (must be array, got ${typeof event.tags}). Event: ${getEventDetails(event)}`);
  }
  for (let i2 = 0;i2 < event.tags.length; i2++) {
    const tag = event.tags[i2];
    if (!Array.isArray(tag)) {
      throw new Error(`Can't serialize event with invalid properties: tags[${i2}] (must be array, got ${typeof tag}). Event: ${getEventDetails(event)}`);
    }
    for (let j = 0;j < tag.length; j++) {
      if (typeof tag[j] !== "string") {
        throw new Error(`Can't serialize event with invalid properties: tags[${i2}][${j}] (must be string, got ${typeof tag[j]}). Event: ${getEventDetails(event)}`);
      }
    }
  }
}
function serialize(includeSig = false, includeId = false) {
  validateForSerialization(this);
  const payload = [0, this.pubkey, this.created_at, this.kind, this.tags, this.content];
  if (includeSig)
    payload.push(this.sig);
  if (includeId)
    payload.push(this.id);
  return JSON.stringify(payload);
}
function deserialize(serializedEvent) {
  const eventArray = JSON.parse(serializedEvent);
  const ret = {
    pubkey: eventArray[1],
    created_at: eventArray[2],
    kind: eventArray[3],
    tags: eventArray[4],
    content: eventArray[5]
  };
  if (eventArray.length >= 7) {
    const first = eventArray[6];
    const second = eventArray[7];
    if (first && first.length === 128) {
      ret.sig = first;
      if (second && second.length === 64) {
        ret.id = second;
      }
    } else if (first && first.length === 64) {
      ret.id = first;
      if (second && second.length === 128) {
        ret.sig = second;
      }
    }
  }
  return ret;
}
var worker;
var processingQueue = {};
function signatureVerificationInit(w) {
  worker = w;
  worker.onmessage = (msg) => {
    if (!Array.isArray(msg.data) || msg.data.length !== 2) {
      console.error("[NDK] ❌ Signature verification worker received incompatible message format.", `

\uD83D\uDCCB Expected format: [eventId, boolean]`, `
\uD83D\uDCE6 Received:`, msg.data, `

\uD83D\uDD0D This likely means:`, `
  1. You have a STALE worker.js file that needs updating`, `
  2. Version mismatch between @nostr-dev-kit/ndk and deployed worker`, `
  3. Wrong worker is being used for signature verification`, `

✅ Solution: Update your worker files:`, `
  cp node_modules/@nostr-dev-kit/ndk/dist/workers/sig-verification.js public/`, `
  cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js public/`, `

\uD83D\uDCA1 Or use Vite/bundler imports instead of static files:`, `
  import SigWorker from "@nostr-dev-kit/ndk/workers/sig-verification?worker"`);
      return;
    }
    const [eventId, result] = msg.data;
    const record = processingQueue[eventId];
    if (!record) {
      console.error("No record found for event", eventId);
      return;
    }
    delete processingQueue[eventId];
    for (const resolve of record.resolves) {
      resolve(result);
    }
  };
}
async function verifySignatureAsync(event, _persist, relay) {
  const ndkInstance = event.ndk;
  const start = Date.now();
  let result;
  if (ndkInstance.signatureVerificationFunction) {
    result = await ndkInstance.signatureVerificationFunction(event);
  } else {
    result = await new Promise((resolve) => {
      const serialized = event.serialize();
      let enqueue = false;
      if (!processingQueue[event.id]) {
        processingQueue[event.id] = { event, resolves: [], relay };
        enqueue = true;
      }
      processingQueue[event.id].resolves.push(resolve);
      if (!enqueue)
        return;
      worker?.postMessage({
        serialized,
        id: event.id,
        sig: event.sig,
        pubkey: event.pubkey
      });
    });
  }
  ndkInstance.signatureVerificationTimeMs += Date.now() - start;
  return result;
}
var PUBKEY_REGEX = /^[a-f0-9]{64}$/;
function validate() {
  if (typeof this.kind !== "number")
    return false;
  if (typeof this.content !== "string")
    return false;
  if (typeof this.created_at !== "number")
    return false;
  if (typeof this.pubkey !== "string")
    return false;
  if (!this.pubkey.match(PUBKEY_REGEX))
    return false;
  if (!Array.isArray(this.tags))
    return false;
  for (let i2 = 0;i2 < this.tags.length; i2++) {
    const tag = this.tags[i2];
    if (!Array.isArray(tag))
      return false;
    for (let j = 0;j < tag.length; j++) {
      if (typeof tag[j] === "object")
        return false;
    }
  }
  return true;
}
var verifiedSignatures = new import_typescript_lru_cache.LRUCache({
  maxSize: 1000,
  entryExpirationTimeInMS: 60000
});
function verifySignature(persist) {
  if (typeof this.signatureVerified === "boolean")
    return this.signatureVerified;
  const prevVerification = verifiedSignatures.get(this.id);
  if (prevVerification !== null) {
    this.signatureVerified = !!prevVerification;
    return this.signatureVerified;
  }
  try {
    if (this.ndk?.asyncSigVerification) {
      const relayForVerification = this.relay;
      verifySignatureAsync(this, persist, relayForVerification).then((result) => {
        if (persist) {
          this.signatureVerified = result;
          if (result)
            verifiedSignatures.set(this.id, this.sig);
        }
        if (!result) {
          if (relayForVerification) {
            this.ndk?.reportInvalidSignature(this, relayForVerification);
          } else {
            this.ndk?.reportInvalidSignature(this);
          }
          verifiedSignatures.set(this.id, false);
        } else {
          if (relayForVerification) {
            relayForVerification.addValidatedEvent();
          }
        }
      }).catch((err) => {
        console.error("signature verification error", this.id, err);
      });
    } else {
      const hash3 = sha2564(new TextEncoder().encode(this.serialize()));
      const res = schnorr2.verify(this.sig, hash3, this.pubkey);
      if (res)
        verifiedSignatures.set(this.id, this.sig);
      else
        verifiedSignatures.set(this.id, false);
      this.signatureVerified = res;
      return res;
    }
  } catch (_err) {
    this.signatureVerified = false;
    return false;
  }
}
function getEventHash2() {
  return getEventHashFromSerializedEvent(this.serialize());
}
function getEventHashFromSerializedEvent(serializedEvent) {
  const eventHash = sha2564(new TextEncoder().encode(serializedEvent));
  return bytesToHex4(eventHash);
}
var skipClientTagOnKinds = /* @__PURE__ */ new Set([
  0,
  4,
  1059,
  13,
  3,
  9734,
  5
]);
var NDKEvent = class _NDKEvent extends import_tseep.EventEmitter {
  ndk;
  created_at;
  content = "";
  tags = [];
  kind;
  id = "";
  sig;
  pubkey = "";
  signatureVerified;
  _author = undefined;
  relay;
  get onRelays() {
    let res = [];
    if (!this.ndk) {
      if (this.relay)
        res.push(this.relay);
    } else {
      res = this.ndk.subManager.seenEvents.get(this.id) || [];
    }
    return res;
  }
  publishStatus = "success";
  publishError;
  constructor(ndk, event) {
    super();
    this.ndk = ndk;
    this.created_at = event?.created_at;
    this.content = event?.content || "";
    this.tags = event?.tags || [];
    this.id = event?.id || "";
    this.sig = event?.sig;
    this.pubkey = event?.pubkey || "";
    this.kind = event?.kind;
    if (event instanceof _NDKEvent) {
      if (this.relay) {
        this.relay = event.relay;
        this.ndk?.subManager.seenEvent(event.id, this.relay);
      }
      this.publishStatus = event.publishStatus;
      this.publishError = event.publishError;
    }
  }
  static deserialize(ndk, event) {
    return new _NDKEvent(ndk, deserialize(event));
  }
  rawEvent() {
    return {
      created_at: this.created_at,
      content: this.content,
      tags: this.tags,
      kind: this.kind,
      pubkey: this.pubkey,
      id: this.id,
      sig: this.sig
    };
  }
  set author(user) {
    this.pubkey = user.pubkey;
    this._author = user;
    this._author.ndk ??= this.ndk;
  }
  get author() {
    if (this._author)
      return this._author;
    if (!this.ndk)
      throw new Error("No NDK instance found");
    const user = this.ndk.getUser({ pubkey: this.pubkey });
    this._author = user;
    return user;
  }
  tagExternal(entity, type, markerUrl) {
    const iTag = ["i"];
    const kTag = ["k"];
    switch (type) {
      case "url": {
        const url = new URL(entity);
        url.hash = "";
        iTag.push(url.toString());
        kTag.push(`${url.protocol}//${url.host}`);
        break;
      }
      case "hashtag":
        iTag.push(`#${entity.toLowerCase()}`);
        kTag.push("#");
        break;
      case "geohash":
        iTag.push(`geo:${entity.toLowerCase()}`);
        kTag.push("geo");
        break;
      case "isbn":
        iTag.push(`isbn:${entity.replace(/-/g, "")}`);
        kTag.push("isbn");
        break;
      case "podcast:guid":
        iTag.push(`podcast:guid:${entity}`);
        kTag.push("podcast:guid");
        break;
      case "podcast:item:guid":
        iTag.push(`podcast:item:guid:${entity}`);
        kTag.push("podcast:item:guid");
        break;
      case "podcast:publisher:guid":
        iTag.push(`podcast:publisher:guid:${entity}`);
        kTag.push("podcast:publisher:guid");
        break;
      case "isan":
        iTag.push(`isan:${entity.split("-").slice(0, 4).join("-")}`);
        kTag.push("isan");
        break;
      case "doi":
        iTag.push(`doi:${entity.toLowerCase()}`);
        kTag.push("doi");
        break;
      default:
        throw new Error(`Unsupported NIP-73 entity type: ${type}`);
    }
    if (markerUrl) {
      iTag.push(markerUrl);
    }
    this.tags.push(iTag);
    this.tags.push(kTag);
  }
  tag(target, marker, skipAuthorTag, forceTag, opts) {
    let tags = [];
    const isNDKUser = target.fetchProfile !== undefined;
    if (isNDKUser) {
      forceTag ??= "p";
      if (forceTag === "p" && opts?.pTags === false) {
        return;
      }
      const tag = [forceTag, target.pubkey];
      if (marker)
        tag.push(...["", marker]);
      tags.push(tag);
    } else if (target instanceof _NDKEvent) {
      const event = target;
      skipAuthorTag ??= event?.pubkey === this.pubkey;
      tags = event.referenceTags(marker, skipAuthorTag, forceTag, opts);
      if (opts?.pTags !== false) {
        for (const pTag of event.getMatchingTags("p")) {
          if (!pTag[1] || !isValidPubkey(pTag[1]))
            continue;
          if (pTag[1] === this.pubkey)
            continue;
          if (this.tags.find((t) => t[0] === "p" && t[1] === pTag[1]))
            continue;
          this.tags.push(["p", pTag[1]]);
        }
      }
    } else if (Array.isArray(target)) {
      tags = [target];
    } else {
      throw new Error("Invalid argument", target);
    }
    this.tags = mergeTags(this.tags, tags);
  }
  async toNostrEvent(pubkey, opts) {
    if (!pubkey && this.pubkey === "") {
      const user = await this.ndk?.signer?.user();
      this.pubkey = user?.pubkey || "";
    }
    if (!this.created_at) {
      this.created_at = Math.floor(Date.now() / 1000);
    }
    const { content, tags } = await this.generateTags(opts);
    this.content = content || "";
    this.tags = tags;
    try {
      this.id = this.getEventHash();
    } catch (_e) {}
    return this.rawEvent();
  }
  serialize = serialize.bind(this);
  getEventHash = getEventHash2.bind(this);
  validate = validate.bind(this);
  verifySignature = verifySignature.bind(this);
  isReplaceable = isReplaceable.bind(this);
  isEphemeral = isEphemeral.bind(this);
  isDvm = () => this.kind && this.kind >= 5000 && this.kind <= 7000;
  isParamReplaceable = isParamReplaceable.bind(this);
  encode = encode.bind(this);
  encrypt = encrypt4.bind(this);
  decrypt = decrypt4.bind(this);
  getMatchingTags(tagName, marker) {
    const t = this.tags.filter((tag) => tag[0] === tagName);
    if (marker === undefined)
      return t;
    return t.filter((tag) => tag[3] === marker);
  }
  hasTag(tagName, marker) {
    return this.tags.some((tag) => tag[0] === tagName && (!marker || tag[3] === marker));
  }
  tagValue(tagName, marker) {
    const tags = this.getMatchingTags(tagName, marker);
    if (tags.length === 0)
      return;
    return tags[0][1];
  }
  get alt() {
    return this.tagValue("alt");
  }
  set alt(alt) {
    this.removeTag("alt");
    if (alt)
      this.tags.push(["alt", alt]);
  }
  get dTag() {
    return this.tagValue("d");
  }
  set dTag(value) {
    this.removeTag("d");
    if (value)
      this.tags.push(["d", value]);
  }
  removeTag(tagName, marker) {
    const tagNames = Array.isArray(tagName) ? tagName : [tagName];
    this.tags = this.tags.filter((tag) => {
      const include = tagNames.includes(tag[0]);
      const hasMarker = marker ? tag[3] === marker : true;
      return !(include && hasMarker);
    });
  }
  replaceTag(tag) {
    this.removeTag(tag[0]);
    this.tags.push(tag);
  }
  async sign(signer, opts) {
    this.ndk?.aiGuardrails?.event?.signing(this);
    if (!signer) {
      this.ndk?.assertSigner();
      signer = this.ndk?.signer;
    } else {
      this.author = await signer.user();
    }
    const nostrEvent = await this.toNostrEvent(undefined, opts);
    this.sig = await signer.sign(nostrEvent);
    return this.sig;
  }
  async publishReplaceable(relaySet, timeoutMs, requiredRelayCount) {
    this.id = "";
    this.created_at = Math.floor(Date.now() / 1000);
    this.sig = "";
    return this.publish(relaySet, timeoutMs, requiredRelayCount);
  }
  async publish(relaySet, timeoutMs, requiredRelayCount, opts) {
    if (!requiredRelayCount)
      requiredRelayCount = 1;
    if (!this.sig)
      await this.sign(undefined, opts);
    if (!this.ndk)
      throw new Error("NDKEvent must be associated with an NDK instance to publish");
    this.ndk.aiGuardrails?.event?.publishing(this);
    if (!relaySet || relaySet.size === 0) {
      relaySet = this.ndk.devWriteRelaySet || await calculateRelaySetFromEvent(this.ndk, this, requiredRelayCount);
    }
    if (this.kind === 5 && this.ndk.cacheAdapter?.deleteEventIds) {
      const eTags = this.getMatchingTags("e").map((tag) => tag[1]);
      this.ndk.cacheAdapter.deleteEventIds(eTags);
    }
    const rawEvent = this.rawEvent();
    if (this.ndk.cacheAdapter?.addUnpublishedEvent && shouldTrackUnpublishedEvent(this)) {
      try {
        this.ndk.cacheAdapter.addUnpublishedEvent(this, relaySet.relayUrls);
      } catch (e) {
        console.error("Error adding unpublished event to cache", e);
      }
    }
    if (this.kind === 5 && this.ndk.cacheAdapter?.deleteEventIds) {
      this.ndk.cacheAdapter.deleteEventIds(this.getMatchingTags("e").map((tag) => tag[1]));
    }
    this.ndk.subManager.dispatchEvent(rawEvent, undefined, true);
    const relays = await relaySet.publish(this, timeoutMs, requiredRelayCount);
    relays.forEach((relay) => this.ndk?.subManager.seenEvent(this.id, relay));
    return relays;
  }
  async generateTags(opts) {
    let tags = [];
    const g = await generateContentTags(this.content, this.tags, opts, this);
    const content = g.content;
    tags = g.tags;
    if (this.kind && this.isParamReplaceable()) {
      const dTag = this.getMatchingTags("d")[0];
      if (!dTag) {
        const title = this.tagValue("title");
        const randLength = title ? 6 : 16;
        let str = [...Array(randLength)].map(() => Math.random().toString(36)[2]).join("");
        if (title && title.length > 0) {
          str = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-${str}`;
        }
        tags.push(["d", str]);
      }
    }
    if (this.shouldAddClientTag) {
      const clientTag = ["client", this.ndk?.clientName ?? ""];
      if (this.ndk?.clientNip89)
        clientTag.push(this.ndk?.clientNip89);
      tags.push(clientTag);
    } else if (this.shouldStripClientTag) {
      tags = tags.filter((tag) => tag[0] !== "client");
    }
    return { content: content || "", tags };
  }
  get shouldAddClientTag() {
    if (!this.ndk?.clientName && !this.ndk?.clientNip89)
      return false;
    if (skipClientTagOnKinds.has(this.kind))
      return false;
    if (this.isEphemeral())
      return false;
    if (this.isReplaceable() && !this.isParamReplaceable())
      return false;
    if (this.isDvm())
      return false;
    if (this.hasTag("client"))
      return false;
    return true;
  }
  get shouldStripClientTag() {
    return skipClientTagOnKinds.has(this.kind);
  }
  muted() {
    if (this.ndk?.muteFilter && this.ndk.muteFilter(this)) {
      return "muted";
    }
    return null;
  }
  replaceableDTag() {
    if (this.kind && this.kind >= 30000 && this.kind <= 40000) {
      const dTag = this.getMatchingTags("d")[0];
      const dTagId = dTag ? dTag[1] : "";
      return dTagId;
    }
    throw new Error("Event is not a parameterized replaceable event");
  }
  deduplicationKey() {
    if (this.kind === 0 || this.kind === 3 || this.kind && this.kind >= 1e4 && this.kind < 20000) {
      return `${this.kind}:${this.pubkey}`;
    }
    return this.tagId();
  }
  tagId() {
    if (this.isParamReplaceable()) {
      return this.tagAddress();
    }
    return this.id;
  }
  tagAddress() {
    if (this.isParamReplaceable()) {
      const dTagId = this.dTag ?? "";
      return `${this.kind}:${this.pubkey}:${dTagId}`;
    }
    if (this.isReplaceable()) {
      return `${this.kind}:${this.pubkey}:`;
    }
    throw new Error("Event is not a replaceable event");
  }
  tagType() {
    return this.isParamReplaceable() ? "a" : "e";
  }
  tagReference(marker) {
    let tag;
    if (this.isParamReplaceable()) {
      tag = ["a", this.tagAddress()];
    } else {
      tag = ["e", this.tagId()];
    }
    if (this.relay) {
      tag.push(this.relay.url);
    } else {
      tag.push("");
    }
    tag.push(marker ?? "");
    if (!this.isParamReplaceable()) {
      tag.push(this.pubkey);
    }
    return tag;
  }
  referenceTags(marker, skipAuthorTag, forceTag, opts) {
    let tags = [];
    if (this.isParamReplaceable()) {
      tags = [
        [forceTag ?? "a", this.tagAddress()],
        [forceTag ?? "e", this.id]
      ];
    } else {
      tags = [[forceTag ?? "e", this.id]];
    }
    tags = tags.map((tag) => {
      if (tag[0] === "e" || marker) {
        tag.push(this.relay?.url ?? "");
      } else if (this.relay?.url) {
        tag.push(this.relay?.url);
      }
      return tag;
    });
    tags.forEach((tag) => {
      if (tag[0] === "e") {
        tag.push(marker ?? "");
        tag.push(this.pubkey);
      } else if (marker) {
        tag.push(marker);
      }
    });
    tags = [...tags, ...this.getMatchingTags("h")];
    if (!skipAuthorTag && opts?.pTags !== false)
      tags.push(...this.author.referenceTags());
    return tags;
  }
  filter() {
    if (this.isParamReplaceable()) {
      return { "#a": [this.tagId()] };
    }
    return { "#e": [this.tagId()] };
  }
  nip22Filter() {
    if (this.isParamReplaceable()) {
      return { "#A": [this.tagId()] };
    }
    return { "#E": [this.tagId()] };
  }
  async delete(reason, publish = true) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    const e = new _NDKEvent(this.ndk, {
      kind: 5,
      content: reason || ""
    });
    e.tag(this, undefined, true);
    e.tags.push(["k", this.kind?.toString()]);
    if (publish) {
      this.emit("deleted");
      await e.publish();
    }
    return e;
  }
  set isProtected(val) {
    this.removeTag("-");
    if (val)
      this.tags.push(["-"]);
  }
  get isProtected() {
    return this.hasTag("-");
  }
  fetchTaggedEvent = fetchTaggedEvent.bind(this);
  fetchRootEvent = fetchRootEvent.bind(this);
  fetchReplyEvent = fetchReplyEvent.bind(this);
  repost = repost.bind(this);
  async react(content, publish = true) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    const e = new _NDKEvent(this.ndk, {
      kind: 7,
      content
    });
    e.tag(this);
    if (this.kind !== 1) {
      e.tags.push(["k", `${this.kind}`]);
    }
    if (publish)
      await e.publish();
    return e;
  }
  get isValid() {
    return this.validate();
  }
  get inspect() {
    return JSON.stringify(this.rawEvent(), null, 4);
  }
  dump() {
    console.debug(JSON.stringify(this.rawEvent(), null, 4));
    console.debug("Event on relays:", this.onRelays.map((relay) => relay.url).join(", "));
  }
  reply(forceNip22, opts) {
    const reply = new _NDKEvent(this.ndk);
    this.ndk?.aiGuardrails?.event?.creatingReply(reply);
    if (this.kind === 1 && !forceNip22) {
      reply.kind = 1;
      const opHasETag = this.hasTag("e");
      if (opHasETag) {
        reply.tags = [
          ...reply.tags,
          ...this.getMatchingTags("e"),
          ...this.getMatchingTags("p"),
          ...this.getMatchingTags("a"),
          ...this.referenceTags("reply", false, undefined, opts)
        ];
      } else {
        reply.tag(this, "root", false, undefined, opts);
      }
    } else {
      reply.kind = 1111;
      const carryOverTags = ["A", "E", "I", "P"];
      const rootTags = this.tags.filter((tag) => carryOverTags.includes(tag[0]));
      if (rootTags.length > 0) {
        const rootKind = this.tagValue("K");
        reply.tags.push(...rootTags);
        if (rootKind)
          reply.tags.push(["K", rootKind]);
        let tag;
        if (this.isParamReplaceable()) {
          tag = ["a", this.tagAddress()];
          const relayHint = this.relay?.url ?? "";
          if (relayHint)
            tag.push(relayHint);
        } else {
          tag = ["e", this.tagId()];
          const relayHint = this.relay?.url ?? "";
          tag.push(relayHint);
          tag.push(this.pubkey);
        }
        reply.tags.push(tag);
      } else {
        let lowerTag;
        let upperTag;
        const relayHint = this.relay?.url ?? "";
        if (this.isParamReplaceable()) {
          lowerTag = ["a", this.tagAddress(), relayHint];
          upperTag = ["A", this.tagAddress(), relayHint];
        } else {
          lowerTag = ["e", this.tagId(), relayHint, this.pubkey];
          upperTag = ["E", this.tagId(), relayHint, this.pubkey];
        }
        reply.tags.push(lowerTag);
        reply.tags.push(upperTag);
        reply.tags.push(["K", this.kind?.toString()]);
        if (opts?.pTags !== false && opts?.pTagOnATags !== false) {
          reply.tags.push(["P", this.pubkey]);
        }
      }
      reply.tags.push(["k", this.kind?.toString()]);
      if (opts?.pTags !== false) {
        reply.tags.push(...this.getMatchingTags("p"));
        reply.tags.push(["p", this.pubkey]);
      }
    }
    return reply;
  }
};
var untrackedUnpublishedEvents = /* @__PURE__ */ new Set([
  24133,
  13194,
  23194,
  23195
]);
function shouldTrackUnpublishedEvent(event) {
  return !untrackedUnpublishedEvents.has(event.kind);
}
var NDKPool = class extends import_tseep3.EventEmitter {
  _relays = /* @__PURE__ */ new Map;
  status = "idle";
  autoConnectRelays = /* @__PURE__ */ new Set;
  debug;
  temporaryRelayTimers = /* @__PURE__ */ new Map;
  flappingRelays = /* @__PURE__ */ new Set;
  backoffTimes = /* @__PURE__ */ new Map;
  ndk;
  disconnectionTimes = /* @__PURE__ */ new Map;
  systemEventDetector;
  constructor(relayUrls, ndk, {
    debug: debug9,
    name
  } = {}) {
    super();
    this.debug = debug9 ?? ndk.debug.extend("pool");
    if (name)
      this._name = name;
    this.ndk = ndk;
    this.relayUrls = relayUrls;
    if (this.ndk.pools) {
      this.ndk.pools.push(this);
    }
  }
  get relays() {
    return this._relays;
  }
  set relayUrls(urls) {
    this._relays.clear();
    for (const relayUrl of urls) {
      const relay = new NDKRelay(relayUrl, undefined, this.ndk);
      relay.connectivity.netDebug = this.ndk.netDebug;
      this.addRelay(relay);
    }
  }
  _name = "unnamed";
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
    this.debug = this.debug.extend(name);
  }
  useTemporaryRelay(relay, removeIfUnusedAfter = 30000, filters) {
    const relayAlreadyInPool = this.relays.has(relay.url);
    if (!relayAlreadyInPool) {
      this.addRelay(relay);
      this.debug("Adding temporary relay %s for filters %o", relay.url, filters);
    }
    const existingTimer = this.temporaryRelayTimers.get(relay.url);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    if (!relayAlreadyInPool || existingTimer) {
      const timer = setTimeout(() => {
        if (this.ndk.explicitRelayUrls?.includes(relay.url))
          return;
        this.removeRelay(relay.url);
      }, removeIfUnusedAfter);
      this.temporaryRelayTimers.set(relay.url, timer);
    }
  }
  addRelay(relay, connect = true) {
    const isAlreadyInPool = this.relays.has(relay.url);
    const isCustomRelayUrl = relay.url.includes("/npub1");
    let reconnect = true;
    const relayUrl = relay.url;
    if (isAlreadyInPool)
      return;
    if (this.ndk.relayConnectionFilter && !this.ndk.relayConnectionFilter(relayUrl)) {
      this.debug(`Refusing to add relay ${relayUrl}: blocked by relayConnectionFilter`);
      return;
    }
    if (isCustomRelayUrl) {
      this.debug(`Refusing to add relay ${relayUrl}: is a filter relay`);
      return;
    }
    if (this.ndk.cacheAdapter?.getRelayStatus) {
      const infoOrPromise = this.ndk.cacheAdapter.getRelayStatus(relayUrl);
      const info = infoOrPromise instanceof Promise ? undefined : infoOrPromise;
      if (info?.dontConnectBefore) {
        if (info.dontConnectBefore > Date.now()) {
          const delay = info.dontConnectBefore - Date.now();
          this.debug(`Refusing to add relay ${relayUrl}: delayed connect for ${delay}ms`);
          setTimeout(() => {
            this.addRelay(relay, connect);
          }, delay);
          return;
        }
        reconnect = false;
      }
    }
    const noticeHandler = (notice) => this.emit("notice", relay, notice);
    const connectHandler = () => this.handleRelayConnect(relayUrl);
    const readyHandler = () => this.handleRelayReady(relay);
    const disconnectHandler = () => {
      this.recordDisconnection(relay);
      this.emit("relay:disconnect", relay);
    };
    const flappingHandler = () => this.handleFlapping(relay);
    const authHandler = (challenge3) => this.emit("relay:auth", relay, challenge3);
    const authedHandler = () => this.emit("relay:authed", relay);
    relay.off("notice", noticeHandler);
    relay.off("connect", connectHandler);
    relay.off("ready", readyHandler);
    relay.off("disconnect", disconnectHandler);
    relay.off("flapping", flappingHandler);
    relay.off("auth", authHandler);
    relay.off("authed", authedHandler);
    relay.on("notice", noticeHandler);
    relay.on("connect", connectHandler);
    relay.on("ready", readyHandler);
    relay.on("disconnect", disconnectHandler);
    relay.on("flapping", flappingHandler);
    relay.on("auth", authHandler);
    relay.on("authed", authedHandler);
    relay.on("delayed-connect", (delay) => {
      if (this.ndk.cacheAdapter?.updateRelayStatus) {
        this.ndk.cacheAdapter.updateRelayStatus(relay.url, {
          dontConnectBefore: Date.now() + delay
        });
      }
    });
    this._relays.set(relayUrl, relay);
    if (connect)
      this.autoConnectRelays.add(relayUrl);
    if (connect && this.status === "active") {
      this.emit("relay:connecting", relay);
      relay.connect(undefined, reconnect).catch((e) => {
        this.debug(`Failed to connect to relay ${relayUrl}`, e);
      });
    }
  }
  removeRelay(relayUrl) {
    const relay = this.relays.get(relayUrl);
    if (relay) {
      relay.disconnect();
      this.relays.delete(relayUrl);
      this.autoConnectRelays.delete(relayUrl);
      this.emit("relay:disconnect", relay);
      return true;
    }
    const existingTimer = this.temporaryRelayTimers.get(relayUrl);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.temporaryRelayTimers.delete(relayUrl);
    }
    return false;
  }
  isRelayConnected(url) {
    const normalizedUrl = normalizeRelayUrl(url);
    const relay = this.relays.get(normalizedUrl);
    if (!relay)
      return false;
    return relay.status === 5;
  }
  getRelay(url, connect = true, temporary = false, filters) {
    let relay = this.relays.get(normalizeRelayUrl(url));
    if (!relay) {
      relay = new NDKRelay(url, undefined, this.ndk);
      relay.connectivity.netDebug = this.ndk.netDebug;
      if (temporary) {
        this.useTemporaryRelay(relay, 30000, filters);
      } else {
        this.addRelay(relay, connect);
      }
    }
    return relay;
  }
  handleRelayConnect(relayUrl) {
    const relay = this.relays.get(relayUrl);
    if (!relay) {
      console.error("NDK BUG: relay not found in pool", { relayUrl });
      return;
    }
    this.emit("relay:connect", relay);
    if (this.stats().connected === this.relays.size) {
      this.emit("connect");
    }
  }
  handleRelayReady(relay) {
    this.emit("relay:ready", relay);
  }
  async connect(timeoutMs) {
    this.status = "active";
    this.debug(`Connecting to ${this.relays.size} relays${timeoutMs ? `, timeout ${timeoutMs}ms` : ""}...`);
    const relaysToConnect = Array.from(this.autoConnectRelays.keys()).map((url) => this.relays.get(url)).filter((relay) => !!relay);
    for (const relay of relaysToConnect) {
      if (relay.status !== 5 && relay.status !== 4) {
        this.emit("relay:connecting", relay);
        relay.connect().catch((e) => {
          this.debug(`Failed to connect to relay ${relay.url}: ${e ?? "No reason specified"}`);
        });
      }
    }
    const allConnected = () => relaysToConnect.every((r) => r.status === 5);
    const allConnectedPromise = new Promise((resolve) => {
      if (allConnected()) {
        resolve();
        return;
      }
      const listeners = [];
      for (const relay of relaysToConnect) {
        const handler = () => {
          if (allConnected()) {
            for (let i2 = 0;i2 < relaysToConnect.length; i2++) {
              relaysToConnect[i2].off("connect", listeners[i2]);
            }
            resolve();
          }
        };
        listeners.push(handler);
        relay.on("connect", handler);
      }
    });
    const timeoutPromise = typeof timeoutMs === "number" ? new Promise((resolve) => setTimeout(resolve, timeoutMs)) : new Promise(() => {});
    await Promise.race([allConnectedPromise, timeoutPromise]);
  }
  checkOnFlappingRelays() {
    const flappingRelaysCount = this.flappingRelays.size;
    const totalRelays = this.relays.size;
    if (flappingRelaysCount / totalRelays >= 0.8) {
      for (const relayUrl of this.flappingRelays) {
        this.backoffTimes.set(relayUrl, 0);
      }
    }
  }
  recordDisconnection(relay) {
    const now2 = Date.now();
    this.disconnectionTimes.set(relay.url, now2);
    for (const [url, time] of this.disconnectionTimes.entries()) {
      if (now2 - time > 1e4) {
        this.disconnectionTimes.delete(url);
      }
    }
    this.checkForSystemWideDisconnection();
  }
  checkForSystemWideDisconnection() {
    const now2 = Date.now();
    const recentDisconnections = [];
    for (const time of this.disconnectionTimes.values()) {
      if (now2 - time < 5000) {
        recentDisconnections.push(time);
      }
    }
    if (recentDisconnections.length > this.relays.size / 2 && this.relays.size > 1) {
      this.debug(`System-wide disconnection detected: ${recentDisconnections.length}/${this.relays.size} relays disconnected`);
      this.handleSystemWideReconnection();
    }
  }
  handleSystemWideReconnection() {
    if (this.systemEventDetector) {
      this.debug("System-wide reconnection already in progress, skipping");
      return;
    }
    this.debug("Initiating system-wide reconnection with reset backoff");
    this.systemEventDetector = setTimeout(() => {
      this.systemEventDetector = undefined;
    }, 1e4);
    for (const relay of this.relays.values()) {
      if (relay.connectivity) {
        relay.connectivity.resetReconnectionState();
        if (relay.status !== 5 && relay.status !== 4) {
          relay.connect().catch((e) => {
            this.debug(`Failed to reconnect relay ${relay.url} after system event: ${e}`);
          });
        }
      }
    }
    this.disconnectionTimes.clear();
  }
  handleFlapping(relay) {
    this.debug(`Relay ${relay.url} is flapping`);
    let currentBackoff = this.backoffTimes.get(relay.url) || 5000;
    currentBackoff = currentBackoff * 2;
    this.backoffTimes.set(relay.url, currentBackoff);
    this.debug(`Backoff time for ${relay.url} is ${currentBackoff}ms`);
    setTimeout(() => {
      this.debug(`Attempting to reconnect to ${relay.url}`);
      this.emit("relay:connecting", relay);
      relay.connect();
      this.checkOnFlappingRelays();
    }, currentBackoff);
    relay.disconnect();
    this.emit("flapping", relay);
  }
  size() {
    return this.relays.size;
  }
  stats() {
    const stats = {
      total: 0,
      connected: 0,
      disconnected: 0,
      connecting: 0
    };
    for (const relay of this.relays.values()) {
      stats.total++;
      if (relay.status === 5) {
        stats.connected++;
      } else if (relay.status === 1) {
        stats.disconnected++;
      } else if (relay.status === 4) {
        stats.connecting++;
      }
    }
    return stats;
  }
  connectedRelays() {
    return Array.from(this.relays.values()).filter((relay) => relay.status >= 5);
  }
  permanentAndConnectedRelays() {
    return Array.from(this.relays.values()).filter((relay) => relay.status >= 5 && !this.temporaryRelayTimers.has(relay.url));
  }
  urls() {
    return Array.from(this.relays.keys());
  }
};
var NDKDVMJobFeedback = class _NDKDVMJobFeedback extends NDKEvent {
  static kind = 7000;
  static kinds = [7000];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 7000;
  }
  static async from(event) {
    const e = new _NDKDVMJobFeedback(event.ndk, event.rawEvent());
    if (e.encrypted)
      await e.dvmDecrypt();
    return e;
  }
  get status() {
    return this.tagValue("status");
  }
  set status(status) {
    this.removeTag("status");
    if (status !== undefined) {
      this.tags.push(["status", status]);
    }
  }
  get encrypted() {
    return !!this.getMatchingTags("encrypted")[0];
  }
  async dvmDecrypt() {
    await this.decrypt();
    const decryptedContent = JSON.parse(this.content);
    this.tags.push(...decryptedContent);
  }
};
var NDKCashuMintList = class _NDKCashuMintList extends NDKEvent {
  static kind = 10019;
  static kinds = [10019];
  _p2pk;
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 10019;
  }
  static from(event) {
    return new _NDKCashuMintList(event.ndk, event);
  }
  set relays(urls) {
    this.tags = this.tags.filter((t) => t[0] !== "relay");
    for (const url of urls) {
      this.tags.push(["relay", url]);
    }
  }
  get relays() {
    const r = [];
    for (const tag of this.tags) {
      if (tag[0] === "relay") {
        r.push(tag[1]);
      }
    }
    return r;
  }
  set mints(urls) {
    this.tags = this.tags.filter((t) => t[0] !== "mint");
    for (const url of urls) {
      this.tags.push(["mint", url]);
    }
  }
  get mints() {
    const r = [];
    for (const tag of this.tags) {
      if (tag[0] === "mint") {
        r.push(tag[1]);
      }
    }
    return Array.from(new Set(r));
  }
  get p2pk() {
    if (this._p2pk) {
      return this._p2pk;
    }
    this._p2pk = this.tagValue("pubkey") ?? this.pubkey;
    return this._p2pk;
  }
  set p2pk(pubkey) {
    this._p2pk = pubkey;
    this.removeTag("pubkey");
    if (pubkey) {
      this.tags.push(["pubkey", pubkey]);
    }
  }
  get relaySet() {
    return NDKRelaySet.fromRelayUrls(this.relays, this.ndk);
  }
};
var NDKArticle = class _NDKArticle extends NDKEvent {
  static kind = 30023;
  static kinds = [30023];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30023;
  }
  static from(event) {
    return new _NDKArticle(event.ndk, event);
  }
  get title() {
    return this.tagValue("title");
  }
  set title(title) {
    this.removeTag("title");
    if (title)
      this.tags.push(["title", title]);
  }
  get image() {
    return this.tagValue("image");
  }
  set image(image) {
    this.removeTag("image");
    if (image)
      this.tags.push(["image", image]);
  }
  get summary() {
    return this.tagValue("summary");
  }
  set summary(summary) {
    this.removeTag("summary");
    if (summary)
      this.tags.push(["summary", summary]);
  }
  get published_at() {
    const tag = this.tagValue("published_at");
    if (tag) {
      let val = Number.parseInt(tag);
      if (val > 1000000000000) {
        val = Math.floor(val / 1000);
      }
      return val;
    }
    return;
  }
  set published_at(timestamp) {
    this.removeTag("published_at");
    if (timestamp !== undefined) {
      this.tags.push(["published_at", timestamp.toString()]);
    }
  }
  async generateTags() {
    super.generateTags();
    if (!this.published_at) {
      this.published_at = this.created_at;
    }
    return super.generateTags();
  }
  get url() {
    return this.tagValue("url");
  }
  set url(url) {
    if (url) {
      this.tags.push(["url", url]);
    } else {
      this.removeTag("url");
    }
  }
};
var NDKBlossomList = class _NDKBlossomList extends NDKEvent {
  static kind = 10063;
  static kinds = [10063];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 10063;
  }
  static from(ndkEvent) {
    return new _NDKBlossomList(ndkEvent.ndk, ndkEvent.rawEvent());
  }
  get servers() {
    return this.tags.filter((tag) => tag[0] === "server").map((tag) => tag[1]);
  }
  set servers(servers) {
    this.tags = this.tags.filter((tag) => tag[0] !== "server");
    for (const server of servers) {
      this.tags.push(["server", server]);
    }
  }
  get default() {
    const servers = this.servers;
    return servers.length > 0 ? servers[0] : undefined;
  }
  set default(server) {
    if (!server)
      return;
    const currentServers = this.servers;
    const filteredServers = currentServers.filter((s) => s !== server);
    this.servers = [server, ...filteredServers];
  }
  addServer(server) {
    if (!server)
      return;
    const currentServers = this.servers;
    if (!currentServers.includes(server)) {
      this.servers = [...currentServers, server];
    }
  }
  removeServer(server) {
    if (!server)
      return;
    const currentServers = this.servers;
    this.servers = currentServers.filter((s) => s !== server);
  }
};
var NDKFedimintMint = class _NDKFedimintMint extends NDKEvent {
  static kind = 38173;
  static kinds = [38173];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 38173;
  }
  static async from(event) {
    const mint = new _NDKFedimintMint(event.ndk, event);
    return mint;
  }
  get identifier() {
    return this.tagValue("d");
  }
  set identifier(value) {
    this.removeTag("d");
    if (value)
      this.tags.push(["d", value]);
  }
  get inviteCodes() {
    return this.getMatchingTags("u").map((t) => t[1]);
  }
  set inviteCodes(values) {
    this.removeTag("u");
    for (const value of values) {
      this.tags.push(["u", value]);
    }
  }
  get modules() {
    return this.getMatchingTags("modules").map((t) => t[1]);
  }
  set modules(values) {
    this.removeTag("modules");
    for (const value of values) {
      this.tags.push(["modules", value]);
    }
  }
  get network() {
    return this.tagValue("n");
  }
  set network(value) {
    this.removeTag("n");
    if (value)
      this.tags.push(["n", value]);
  }
  get metadata() {
    if (!this.content)
      return;
    try {
      return JSON.parse(this.content);
    } catch {
      return;
    }
  }
  set metadata(value) {
    if (value) {
      this.content = JSON.stringify(value);
    } else {
      this.content = "";
    }
  }
};
var NDKCashuMintAnnouncement = class _NDKCashuMintAnnouncement extends NDKEvent {
  static kind = 38172;
  static kinds = [38172];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 38172;
  }
  static async from(event) {
    const mint = new _NDKCashuMintAnnouncement(event.ndk, event);
    return mint;
  }
  get identifier() {
    return this.tagValue("d");
  }
  set identifier(value) {
    this.removeTag("d");
    if (value)
      this.tags.push(["d", value]);
  }
  get url() {
    return this.tagValue("u");
  }
  set url(value) {
    this.removeTag("u");
    if (value)
      this.tags.push(["u", value]);
  }
  get nuts() {
    return this.getMatchingTags("nuts").map((t) => t[1]);
  }
  set nuts(values) {
    this.removeTag("nuts");
    for (const value of values) {
      this.tags.push(["nuts", value]);
    }
  }
  get network() {
    return this.tagValue("n");
  }
  set network(value) {
    this.removeTag("n");
    if (value)
      this.tags.push(["n", value]);
  }
  get metadata() {
    if (!this.content)
      return;
    try {
      return JSON.parse(this.content);
    } catch {
      return;
    }
  }
  set metadata(value) {
    if (value) {
      this.content = JSON.stringify(value);
    } else {
      this.content = "";
    }
  }
};
var NDKMintRecommendation = class _NDKMintRecommendation extends NDKEvent {
  static kind = 38000;
  static kinds = [38000];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 38000;
  }
  static async from(event) {
    const recommendation = new _NDKMintRecommendation(event.ndk, event);
    return recommendation;
  }
  get recommendedKind() {
    const value = this.tagValue("k");
    return value ? Number(value) : undefined;
  }
  set recommendedKind(value) {
    this.removeTag("k");
    if (value)
      this.tags.push(["k", value.toString()]);
  }
  get identifier() {
    return this.tagValue("d");
  }
  set identifier(value) {
    this.removeTag("d");
    if (value)
      this.tags.push(["d", value]);
  }
  get urls() {
    return this.getMatchingTags("u").map((t) => t[1]);
  }
  set urls(values) {
    this.removeTag("u");
    for (const value of values) {
      this.tags.push(["u", value]);
    }
  }
  get mintEventPointers() {
    return this.getMatchingTags("a").map((t) => ({
      kind: Number(t[1].split(":")[0]),
      identifier: t[1].split(":")[2],
      relay: t[2]
    }));
  }
  addMintEventPointer(kind, pubkey, identifier, relay) {
    const aTag = [`a`, `${kind}:${pubkey}:${identifier}`];
    if (relay)
      aTag.push(relay);
    this.tags.push(aTag);
  }
  get review() {
    return this.content;
  }
  set review(value) {
    this.content = value;
  }
};
var NDKClassified = class _NDKClassified extends NDKEvent {
  static kind = 30402;
  static kinds = [30402];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30402;
  }
  static from(event) {
    return new _NDKClassified(event.ndk, event);
  }
  get title() {
    return this.tagValue("title");
  }
  set title(title) {
    this.removeTag("title");
    if (title)
      this.tags.push(["title", title]);
  }
  get summary() {
    return this.tagValue("summary");
  }
  set summary(summary) {
    this.removeTag("summary");
    if (summary)
      this.tags.push(["summary", summary]);
  }
  get published_at() {
    const tag = this.tagValue("published_at");
    if (tag) {
      return Number.parseInt(tag);
    }
    return;
  }
  set published_at(timestamp) {
    this.removeTag("published_at");
    if (timestamp !== undefined) {
      this.tags.push(["published_at", timestamp.toString()]);
    }
  }
  get location() {
    return this.tagValue("location");
  }
  set location(location) {
    this.removeTag("location");
    if (location)
      this.tags.push(["location", location]);
  }
  get price() {
    const priceTag = this.tags.find((tag) => tag[0] === "price");
    if (priceTag) {
      return {
        amount: Number.parseFloat(priceTag[1]),
        currency: priceTag[2],
        frequency: priceTag[3]
      };
    }
    return;
  }
  set price(priceTag) {
    if (typeof priceTag === "string") {
      priceTag = {
        amount: Number.parseFloat(priceTag)
      };
    }
    if (priceTag?.amount) {
      const tag = ["price", priceTag.amount.toString()];
      if (priceTag.currency)
        tag.push(priceTag.currency);
      if (priceTag.frequency)
        tag.push(priceTag.frequency);
      this.tags.push(tag);
    } else {
      this.removeTag("price");
    }
  }
  async generateTags() {
    super.generateTags();
    if (!this.published_at) {
      this.published_at = this.created_at;
    }
    return super.generateTags();
  }
};
var NDKDraft = class _NDKDraft extends NDKEvent {
  _event;
  static kind = 31234;
  static kinds = [31234, 1234];
  counterparty;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 31234;
  }
  static from(event) {
    return new _NDKDraft(event.ndk, event);
  }
  set identifier(id) {
    this.removeTag("d");
    this.tags.push(["d", id]);
  }
  get identifier() {
    return this.dTag;
  }
  set event(e) {
    if (!(e instanceof NDKEvent))
      this._event = new NDKEvent(undefined, e);
    else
      this._event = e;
    this.prepareEvent();
  }
  set checkpoint(parent) {
    if (parent) {
      this.tags.push(parent.tagReference());
      this.kind = 1234;
    } else {
      this.removeTag("a");
      this.kind = 31234;
    }
  }
  get isCheckpoint() {
    return this.kind === 1234;
  }
  get isProposal() {
    const pTag = this.tagValue("p");
    return !!pTag && pTag !== this.pubkey;
  }
  async getEvent(signer) {
    if (this._event)
      return this._event;
    signer ??= this.ndk?.signer;
    if (!signer)
      throw new Error("No signer available");
    if (this.content && this.content.length > 0) {
      try {
        const ownPubkey = signer.pubkey;
        const pubkeys = [this.tagValue("p"), this.pubkey].filter(Boolean);
        const counterpartyPubkey = pubkeys.find((pubkey) => pubkey !== ownPubkey);
        let user;
        user = new NDKUser({ pubkey: counterpartyPubkey ?? ownPubkey });
        await this.decrypt(user, signer);
        const payload = JSON.parse(this.content);
        this._event = await wrapEvent3(new NDKEvent(this.ndk, payload));
        return this._event;
      } catch (e) {
        console.error(e);
        return;
      }
    } else {
      return null;
    }
  }
  prepareEvent() {
    if (!this._event)
      throw new Error("No event has been provided");
    this.removeTag("k");
    if (this._event.kind)
      this.tags.push(["k", this._event.kind.toString()]);
    this.content = JSON.stringify(this._event.rawEvent());
  }
  async save({ signer, publish, relaySet }) {
    signer ??= this.ndk?.signer;
    if (!signer)
      throw new Error("No signer available");
    const user = this.counterparty || await signer.user();
    await this.encrypt(user, signer);
    if (this.counterparty) {
      const pubkey = this.counterparty.pubkey;
      this.removeTag("p");
      this.tags.push(["p", pubkey]);
    }
    if (publish === false)
      return;
    return this.publishReplaceable(relaySet);
  }
};
function mapImetaTag(tag) {
  const data = {};
  if (tag.length === 2) {
    const parts = tag[1].split(" ");
    for (let i2 = 0;i2 < parts.length; i2 += 2) {
      const key = parts[i2];
      const value = parts[i2 + 1];
      if (key === "fallback") {
        if (!data.fallback)
          data.fallback = [];
        data.fallback.push(value);
      } else {
        data[key] = value;
      }
    }
    return data;
  }
  const tags = tag.slice(1);
  for (const val of tags) {
    const parts = val.split(" ");
    const key = parts[0];
    const value = parts.slice(1).join(" ");
    if (key === "fallback") {
      if (!data.fallback)
        data.fallback = [];
      data.fallback.push(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}
function imetaTagToTag(imeta) {
  const tag = ["imeta"];
  for (const [key, value] of Object.entries(imeta)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        tag.push(`${key} ${v}`);
      }
    } else if (value) {
      tag.push(`${key} ${value}`);
    }
  }
  return tag;
}
var NDKFollowPack = class _NDKFollowPack extends NDKEvent {
  static kind = 39089;
  static kinds = [39089, 39092];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 39089;
  }
  static from(ndkEvent) {
    return new _NDKFollowPack(ndkEvent.ndk, ndkEvent);
  }
  get title() {
    return this.tagValue("title");
  }
  set title(value) {
    this.removeTag("title");
    if (value)
      this.tags.push(["title", value]);
  }
  get image() {
    const imetaTag = this.tags.find((tag) => tag[0] === "imeta");
    if (imetaTag) {
      const imeta = mapImetaTag(imetaTag);
      if (imeta.url)
        return imeta.url;
    }
    return this.tagValue("image");
  }
  set image(value) {
    this.tags = this.tags.filter((tag) => tag[0] !== "imeta" && tag[0] !== "image");
    if (typeof value === "string") {
      if (value !== undefined) {
        this.tags.push(["image", value]);
      }
    } else if (value && typeof value === "object") {
      this.tags.push(imetaTagToTag(value));
      if (value.url) {
        this.tags.push(["image", value.url]);
      }
    }
  }
  get pubkeys() {
    return Array.from(new Set(this.tags.filter((tag) => tag[0] === "p" && tag[1] && isValidPubkey(tag[1])).map((tag) => tag[1])));
  }
  set pubkeys(pubkeys) {
    this.tags = this.tags.filter((tag) => tag[0] !== "p");
    for (const pubkey of pubkeys) {
      this.tags.push(["p", pubkey]);
    }
  }
  get description() {
    return this.tagValue("description");
  }
  set description(value) {
    this.removeTag("description");
    if (value)
      this.tags.push(["description", value]);
  }
};
var NDKHighlight = class _NDKHighlight extends NDKEvent {
  _article;
  static kind = 9802;
  static kinds = [9802];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 9802;
  }
  static from(event) {
    return new _NDKHighlight(event.ndk, event);
  }
  get url() {
    return this.tagValue("r");
  }
  set context(context) {
    if (context === undefined) {
      this.tags = this.tags.filter(([tag, _value]) => tag !== "context");
    } else {
      this.tags = this.tags.filter(([tag, _value]) => tag !== "context");
      this.tags.push(["context", context]);
    }
  }
  get context() {
    return this.tags.find(([tag, _value]) => tag === "context")?.[1] ?? undefined;
  }
  get article() {
    return this._article;
  }
  set article(article) {
    this._article = article;
    if (typeof article === "string") {
      this.tags.push(["r", article]);
    } else {
      this.tag(article);
    }
  }
  getArticleTag() {
    return this.getMatchingTags("a")[0] || this.getMatchingTags("e")[0] || this.getMatchingTags("r")[0];
  }
  async getArticle() {
    if (this._article !== undefined)
      return this._article;
    let taggedBech32;
    const articleTag = this.getArticleTag();
    if (!articleTag)
      return;
    switch (articleTag[0]) {
      case "a": {
        const [kind, pubkey, identifier] = articleTag[1].split(":");
        taggedBech32 = nip19_exports.naddrEncode({
          kind: Number.parseInt(kind),
          pubkey,
          identifier
        });
        break;
      }
      case "e":
        taggedBech32 = nip19_exports.noteEncode(articleTag[1]);
        break;
      case "r":
        this._article = articleTag[1];
        break;
    }
    if (taggedBech32) {
      let a = await this.ndk?.fetchEvent(taggedBech32);
      if (a) {
        if (a.kind === 30023) {
          a = NDKArticle.from(a);
        }
        this._article = a;
      }
    }
    return this._article;
  }
};
var NDKImage = class _NDKImage extends NDKEvent {
  static kind = 20;
  static kinds = [20];
  _imetas;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 20;
  }
  static from(event) {
    return new _NDKImage(event.ndk, event.rawEvent());
  }
  get isValid() {
    return this.imetas.length > 0;
  }
  get imetas() {
    if (this._imetas)
      return this._imetas;
    this._imetas = this.tags.filter((tag) => tag[0] === "imeta").map(mapImetaTag).filter((imeta) => !!imeta.url);
    return this._imetas;
  }
  set imetas(tags) {
    this._imetas = tags;
    this.tags = this.tags.filter((tag) => tag[0] !== "imeta");
    this.tags.push(...tags.map(imetaTagToTag));
  }
};
var NDKList = class _NDKList extends NDKEvent {
  _encryptedTags;
  static kind = 30001;
  static kinds = [
    30001,
    10004,
    10050,
    10030,
    10015,
    10001,
    10002,
    10007,
    10006,
    10003,
    10012
  ];
  encryptedTagsLength;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30001;
  }
  static from(ndkEvent) {
    return new _NDKList(ndkEvent.ndk, ndkEvent);
  }
  get title() {
    const titleTag = this.tagValue("title") || this.tagValue("name");
    if (titleTag)
      return titleTag;
    if (this.kind === 3) {
      return "Contacts";
    }
    if (this.kind === 1e4) {
      return "Mute";
    }
    if (this.kind === 10001) {
      return "Pinned Notes";
    }
    if (this.kind === 10002) {
      return "Relay Metadata";
    }
    if (this.kind === 10003) {
      return "Bookmarks";
    }
    if (this.kind === 10004) {
      return "Communities";
    }
    if (this.kind === 10005) {
      return "Public Chats";
    }
    if (this.kind === 10006) {
      return "Blocked Relays";
    }
    if (this.kind === 10007) {
      return "Search Relays";
    }
    if (this.kind === 10050) {
      return "Direct Message Receive Relays";
    }
    if (this.kind === 10012) {
      return "Relay Feeds";
    }
    if (this.kind === 10015) {
      return "Interests";
    }
    if (this.kind === 10030) {
      return "Emojis";
    }
    return this.tagValue("d");
  }
  set title(title) {
    this.removeTag(["title", "name"]);
    if (title)
      this.tags.push(["title", title]);
  }
  get name() {
    return this.title;
  }
  set name(name) {
    this.title = name;
  }
  get description() {
    return this.tagValue("description");
  }
  set description(name) {
    this.removeTag("description");
    if (name)
      this.tags.push(["description", name]);
  }
  get image() {
    return this.tagValue("image");
  }
  set image(name) {
    this.removeTag("image");
    if (name)
      this.tags.push(["image", name]);
  }
  isEncryptedTagsCacheValid() {
    return !!(this._encryptedTags && this.encryptedTagsLength === this.content.length);
  }
  async encryptedTags(useCache = true) {
    if (useCache && this.isEncryptedTagsCacheValid())
      return this._encryptedTags;
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (!this.ndk.signer)
      throw new Error("NDK signer not set");
    const user = await this.ndk.signer.user();
    try {
      if (this.content.length > 0) {
        try {
          const decryptedContent = await this.ndk.signer.decrypt(user, this.content);
          const a = JSON.parse(decryptedContent);
          if (a?.[0]) {
            this.encryptedTagsLength = this.content.length;
            return this._encryptedTags = a;
          }
          this.encryptedTagsLength = this.content.length;
          return this._encryptedTags = [];
        } catch (_e) {}
      }
    } catch (_e) {}
    return [];
  }
  validateTag(_tagValue) {
    return true;
  }
  getItems(type) {
    return this.tags.filter((tag) => tag[0] === type);
  }
  get items() {
    return this.tags.filter((t) => {
      return ![
        "d",
        "L",
        "l",
        "title",
        "name",
        "description",
        "published_at",
        "summary",
        "image",
        "thumb",
        "alt",
        "expiration",
        "subject",
        "client"
      ].includes(t[0]);
    });
  }
  async addItem(item, mark = undefined, encrypted = false, position = "bottom") {
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (!this.ndk.signer)
      throw new Error("NDK signer not set");
    let tags;
    if (item instanceof NDKEvent) {
      tags = [item.tagReference(mark)];
    } else if (item instanceof NDKUser) {
      tags = item.referenceTags();
    } else if (item instanceof NDKRelay) {
      tags = item.referenceTags();
    } else if (Array.isArray(item)) {
      tags = [item];
    } else {
      throw new Error("Invalid object type");
    }
    if (mark)
      tags[0].push(mark);
    if (encrypted) {
      const user = await this.ndk.signer.user();
      const currentList = await this.encryptedTags();
      if (position === "top")
        currentList.unshift(...tags);
      else
        currentList.push(...tags);
      this._encryptedTags = currentList;
      this.encryptedTagsLength = this.content.length;
      this.content = JSON.stringify(currentList);
      await this.encrypt(user);
    } else {
      if (position === "top")
        this.tags.unshift(...tags);
      else
        this.tags.push(...tags);
    }
    this.created_at = Math.floor(Date.now() / 1000);
    this.emit("change");
  }
  async removeItemByValue(value, publish = true) {
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (!this.ndk.signer)
      throw new Error("NDK signer not set");
    const index = this.tags.findIndex((tag) => tag[1] === value);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    const user = await this.ndk.signer.user();
    const encryptedTags = await this.encryptedTags();
    const encryptedIndex = encryptedTags.findIndex((tag) => tag[1] === value);
    if (encryptedIndex >= 0) {
      encryptedTags.splice(encryptedIndex, 1);
      this._encryptedTags = encryptedTags;
      this.encryptedTagsLength = this.content.length;
      this.content = JSON.stringify(encryptedTags);
      await this.encrypt(user);
    }
    if (publish) {
      return this.publishReplaceable();
    }
    this.created_at = Math.floor(Date.now() / 1000);
    this.emit("change");
  }
  async removeItem(index, encrypted) {
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (!this.ndk.signer)
      throw new Error("NDK signer not set");
    if (encrypted) {
      const user = await this.ndk.signer.user();
      const currentList = await this.encryptedTags();
      currentList.splice(index, 1);
      this._encryptedTags = currentList;
      this.encryptedTagsLength = this.content.length;
      this.content = JSON.stringify(currentList);
      await this.encrypt(user);
    } else {
      this.tags.splice(index, 1);
    }
    this.created_at = Math.floor(Date.now() / 1000);
    this.emit("change");
    return this;
  }
  has(item) {
    return this.items.some((tag) => tag[1] === item);
  }
  filterForItems() {
    const ids = /* @__PURE__ */ new Set;
    const nip33Queries = /* @__PURE__ */ new Map;
    const filters = [];
    for (const tag of this.items) {
      if (tag[0] === "e" && tag[1]) {
        ids.add(tag[1]);
      } else if (tag[0] === "a" && tag[1]) {
        const [kind, pubkey, dTag] = tag[1].split(":");
        if (!kind || !pubkey)
          continue;
        const key = `${kind}:${pubkey}`;
        const item = nip33Queries.get(key) || [];
        item.push(dTag || "");
        nip33Queries.set(key, item);
      }
    }
    if (ids.size > 0) {
      filters.push({ ids: Array.from(ids) });
    }
    if (nip33Queries.size > 0) {
      for (const [key, values] of nip33Queries.entries()) {
        const [kind, pubkey] = key.split(":");
        filters.push({
          kinds: [Number.parseInt(kind)],
          authors: [pubkey],
          "#d": values
        });
      }
    }
    return filters;
  }
};
var NDKAppHandlerEvent = class _NDKAppHandlerEvent extends NDKEvent {
  profile;
  static kind = 31990;
  static kinds = [31990];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 31990;
  }
  static from(ndkEvent) {
    const event = new _NDKAppHandlerEvent(ndkEvent.ndk, ndkEvent.rawEvent());
    if (event.isValid) {
      return event;
    }
    return null;
  }
  get isValid() {
    const combinations = /* @__PURE__ */ new Map;
    const combinationFromTag = (tag) => [tag[0], tag[2]].join(":").toLowerCase();
    const tagsToInspect = ["web", "android", "ios"];
    for (const tag of this.tags) {
      if (tagsToInspect.includes(tag[0])) {
        const combination = combinationFromTag(tag);
        if (combinations.has(combination)) {
          if (combinations.get(combination) !== tag[1].toLowerCase()) {
            return false;
          }
        }
        combinations.set(combination, tag[1].toLowerCase());
      }
    }
    return true;
  }
  async fetchProfile() {
    if (this.profile === undefined && this.content.length > 0) {
      try {
        const profile = JSON.parse(this.content);
        if (profile?.name) {
          return profile;
        }
        this.profile = null;
      } catch (_e) {
        this.profile = null;
      }
    }
    return new Promise((resolve, reject) => {
      const author = this.author;
      author.fetchProfile().then(() => {
        resolve(author.profile);
      }).catch(reject);
    });
  }
};
var SEVERITY_MAP = {
  ["NO_PROOFS"]: "ERROR",
  ["INVALID_PROOF_COUNT"]: "ERROR",
  ["MULTIPLE_RECIPIENTS"]: "ERROR",
  ["NO_RECIPIENT"]: "ERROR",
  ["MULTIPLE_MINTS"]: "ERROR",
  ["NO_MINT"]: "ERROR",
  ["MULTIPLE_EVENT_TAGS"]: "ERROR",
  ["MALFORMED_PROOF_SECRET"]: "ERROR",
  ["MISSING_EVENT_TAG_IN_PROOF"]: "WARNING",
  ["MISMATCHED_EVENT_TAG_IN_PROOF"]: "WARNING",
  ["MISSING_SENDER_TAG_IN_PROOF"]: "WARNING",
  ["MISMATCHED_SENDER_TAG_IN_PROOF"]: "WARNING",
  ["NO_EVENT_TAG_IN_EVENT"]: "WARNING"
};
var ERROR_MESSAGES = {
  ["NO_PROOFS"]: "Nutzap must contain at least one proof",
  ["INVALID_PROOF_COUNT"]: "Invalid proof count",
  ["MULTIPLE_RECIPIENTS"]: "Nutzap must have exactly one recipient (p tag)",
  ["NO_RECIPIENT"]: "Nutzap must have a recipient (p tag)",
  ["MULTIPLE_MINTS"]: "Nutzap must specify exactly one mint (u tag)",
  ["NO_MINT"]: "Nutzap must specify a mint (u tag)",
  ["MULTIPLE_EVENT_TAGS"]: "Nutzap must have at most one event tag (e tag)",
  ["MALFORMED_PROOF_SECRET"]: "Proof secret is malformed and cannot be parsed",
  ["MISSING_EVENT_TAG_IN_PROOF"]: "Proof secret missing 'e' tag for replay protection",
  ["MISMATCHED_EVENT_TAG_IN_PROOF"]: "Proof secret 'e' tag does not match event being zapped",
  ["MISSING_SENDER_TAG_IN_PROOF"]: "Proof secret missing 'P' tag for sender verification",
  ["MISMATCHED_SENDER_TAG_IN_PROOF"]: "Proof secret 'P' tag does not match sender pubkey",
  ["NO_EVENT_TAG_IN_EVENT"]: "Nutzap event missing 'e' tag (recommended for replay protection)"
};
function createValidationIssue(code, proofIndex) {
  return {
    code,
    severity: SEVERITY_MAP[code],
    message: ERROR_MESSAGES[code],
    proofIndex
  };
}
var NDKNutzap = class _NDKNutzap extends NDKEvent {
  debug;
  _proofs = [];
  static kind = 9321;
  static kinds = [_NDKNutzap.kind];
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 9321;
    this.debug = ndk?.debug.extend("nutzap") ?? import_debug4.default("ndk:nutzap");
    if (!this.alt)
      this.alt = "This is a nutzap";
    try {
      const proofTags = this.getMatchingTags("proof");
      if (proofTags.length) {
        this._proofs = proofTags.map((tag) => JSON.parse(tag[1]));
      } else {
        this._proofs = JSON.parse(this.content);
      }
    } catch {
      return;
    }
  }
  static from(event) {
    const e = new _NDKNutzap(event.ndk, event);
    if (!e._proofs || !e._proofs.length)
      return;
    return e;
  }
  set comment(comment) {
    this.content = comment ?? "";
  }
  get comment() {
    const c = this.tagValue("comment");
    if (c)
      return c;
    return this.content;
  }
  set proofs(proofs) {
    this._proofs = proofs;
    this.tags = this.tags.filter((tag) => tag[0] !== "proof");
    for (const proof of proofs) {
      this.tags.push(["proof", JSON.stringify(proof)]);
    }
  }
  get proofs() {
    return this._proofs;
  }
  get rawP2pk() {
    const firstProof = this.proofs[0];
    try {
      const secret = JSON.parse(firstProof.secret);
      let payload;
      if (typeof secret === "string") {
        payload = JSON.parse(secret);
        this.debug("stringified payload", firstProof.secret);
      } else if (typeof secret === "object") {
        payload = secret;
      }
      if (Array.isArray(payload) && payload[0] === "P2PK" && payload.length > 1 && typeof payload[1] === "object" && payload[1] !== null) {
        return payload[1].data;
      }
      if (typeof payload === "object" && payload !== null && typeof payload[1]?.data === "string") {
        return payload[1].data;
      }
    } catch (e) {
      this.debug("error parsing p2pk pubkey", e, this.proofs[0]);
    }
    return;
  }
  get p2pk() {
    const rawP2pk = this.rawP2pk;
    if (!rawP2pk)
      return;
    return rawP2pk.startsWith("02") ? rawP2pk.slice(2) : rawP2pk;
  }
  get mint() {
    return this.tagValue("u");
  }
  set mint(value) {
    this.replaceTag(["u", value]);
  }
  get unit() {
    let _unit = this.tagValue("unit") ?? "sat";
    if (_unit?.startsWith("msat"))
      _unit = "sat";
    return _unit;
  }
  set unit(value) {
    this.removeTag("unit");
    if (value?.startsWith("msat"))
      throw new Error("msat is not allowed, use sat denomination instead");
    if (value)
      this.tag(["unit", value]);
  }
  get amount() {
    const amount = this.proofs.reduce((total, proof) => total + proof.amount, 0);
    return amount;
  }
  sender = this.author;
  set target(target) {
    this.tags = this.tags.filter((t) => t[0] !== "p");
    if (target instanceof NDKEvent) {
      this.tags.push(target.tagReference());
    }
  }
  set recipientPubkey(pubkey) {
    this.removeTag("p");
    this.tag(["p", pubkey]);
  }
  get recipientPubkey() {
    return this.tagValue("p");
  }
  get recipient() {
    const pubkey = this.recipientPubkey;
    if (this.ndk)
      return this.ndk.getUser({ pubkey });
    return new NDKUser({ pubkey });
  }
  async toNostrEvent() {
    if (this.unit === "msat") {
      this.unit = "sat";
    }
    this.removeTag("amount");
    this.tags.push(["amount", this.amount.toString()]);
    const event = await super.toNostrEvent();
    event.content = this.comment;
    return event;
  }
  get isValid() {
    const result = this.validateNIP61();
    return result.valid;
  }
  validateNIP61() {
    const issues = [];
    let eTagCount = 0;
    let pTagCount = 0;
    let mintTagCount = 0;
    for (const tag of this.tags) {
      if (tag[0] === "e")
        eTagCount++;
      if (tag[0] === "p")
        pTagCount++;
      if (tag[0] === "u")
        mintTagCount++;
    }
    if (this.proofs.length === 0) {
      issues.push(createValidationIssue("NO_PROOFS"));
    }
    if (pTagCount === 0) {
      issues.push(createValidationIssue("NO_RECIPIENT"));
    } else if (pTagCount > 1) {
      issues.push(createValidationIssue("MULTIPLE_RECIPIENTS"));
    }
    if (mintTagCount === 0) {
      issues.push(createValidationIssue("NO_MINT"));
    } else if (mintTagCount > 1) {
      issues.push(createValidationIssue("MULTIPLE_MINTS"));
    }
    if (eTagCount > 1) {
      issues.push(createValidationIssue("MULTIPLE_EVENT_TAGS"));
    }
    const eventId = this.tagValue("e");
    const senderPubkey = this.pubkey;
    for (let i2 = 0;i2 < this.proofs.length; i2++) {
      const proof = this.proofs[i2];
      try {
        const secret = JSON.parse(proof.secret);
        const payload = typeof secret === "string" ? JSON.parse(secret) : secret;
        if (Array.isArray(payload) && payload[0] === "P2PK" && payload[1]) {
          const tags = payload[1].tags;
          if (eventId) {
            if (!tags) {
              issues.push(createValidationIssue("MISSING_EVENT_TAG_IN_PROOF", i2));
            } else {
              const eTag = tags.find((t) => t[0] === "e");
              if (!eTag) {
                issues.push(createValidationIssue("MISSING_EVENT_TAG_IN_PROOF", i2));
              } else if (eTag[1] !== eventId) {
                issues.push(createValidationIssue("MISMATCHED_EVENT_TAG_IN_PROOF", i2));
              }
            }
          }
          if (!tags) {
            issues.push(createValidationIssue("MISSING_SENDER_TAG_IN_PROOF", i2));
          } else {
            const PTag = tags.find((t) => t[0] === "P");
            if (!PTag) {
              issues.push(createValidationIssue("MISSING_SENDER_TAG_IN_PROOF", i2));
            } else if (PTag[1] !== senderPubkey) {
              issues.push(createValidationIssue("MISMATCHED_SENDER_TAG_IN_PROOF", i2));
            }
          }
        }
      } catch {
        issues.push(createValidationIssue("MALFORMED_PROOF_SECRET", i2));
      }
    }
    if (!eventId && this.proofs.length > 0) {
      issues.push(createValidationIssue("NO_EVENT_TAG_IN_EVENT"));
    }
    const hasErrors = issues.some((issue) => issue.severity === "ERROR");
    return {
      valid: !hasErrors,
      issues
    };
  }
};
var NDKProject = class _NDKProject extends NDKEvent {
  static kind = 31933;
  static kinds = [31933];
  _signer;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind = 31933;
  }
  static from(event) {
    return new _NDKProject(event.ndk, event.rawEvent());
  }
  set repo(value) {
    this.removeTag("repo");
    if (value)
      this.tags.push(["repo", value]);
  }
  set hashtags(values) {
    this.removeTag("hashtags");
    if (values.filter((t) => t.length > 0).length)
      this.tags.push(["hashtags", ...values]);
  }
  get hashtags() {
    const tag = this.tags.find((tag2) => tag2[0] === "hashtags");
    return tag ? tag.slice(1) : [];
  }
  get repo() {
    return this.tagValue("repo");
  }
  get title() {
    return this.tagValue("title");
  }
  set title(value) {
    this.removeTag("title");
    if (value)
      this.tags.push(["title", value]);
  }
  get picture() {
    return this.tagValue("picture");
  }
  set picture(value) {
    this.removeTag("picture");
    if (value)
      this.tags.push(["picture", value]);
  }
  set description(value) {
    this.content = value;
  }
  get description() {
    return this.content;
  }
  get slug() {
    return this.dTag ?? "empty-dtag";
  }
  async getSigner() {
    if (this._signer)
      return this._signer;
    const encryptedKey = this.tagValue("key");
    if (!encryptedKey) {
      this._signer = NDKPrivateKeySigner.generate();
      await this.encryptAndSaveNsec();
    } else {
      const decryptedKey = await this.ndk?.signer?.decrypt(this.ndk.activeUser, encryptedKey);
      if (!decryptedKey) {
        throw new Error("Failed to decrypt project key or missing signer context.");
      }
      this._signer = new NDKPrivateKeySigner(decryptedKey);
    }
    return this._signer;
  }
  async getNsec() {
    const signer = await this.getSigner();
    return signer.privateKey;
  }
  async setNsec(value) {
    this._signer = new NDKPrivateKeySigner(value);
    await this.encryptAndSaveNsec();
  }
  async encryptAndSaveNsec() {
    if (!this._signer)
      throw new Error("Signer is not set.");
    const key = this._signer.privateKey;
    const encryptedKey = await this.ndk?.signer?.encrypt(this.ndk.activeUser, key);
    if (encryptedKey) {
      this.removeTag("key");
      this.tags.push(["key", encryptedKey]);
    }
  }
};
var NDKProjectTemplate = class _NDKProjectTemplate extends NDKEvent {
  static kind = 30717;
  static kinds = [30717];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind = 30717;
  }
  static from(event) {
    return new _NDKProjectTemplate(event.ndk, event.rawEvent());
  }
  get templateId() {
    return this.dTag ?? "";
  }
  set templateId(value) {
    this.dTag = value;
  }
  get name() {
    return this.tagValue("title") ?? "";
  }
  set name(value) {
    this.removeTag("title");
    if (value)
      this.tags.push(["title", value]);
  }
  get description() {
    return this.tagValue("description") ?? "";
  }
  set description(value) {
    this.removeTag("description");
    if (value)
      this.tags.push(["description", value]);
  }
  get repoUrl() {
    return this.tagValue("uri") ?? "";
  }
  set repoUrl(value) {
    this.removeTag("uri");
    if (value)
      this.tags.push(["uri", value]);
  }
  get image() {
    return this.tagValue("image");
  }
  set image(value) {
    this.removeTag("image");
    if (value)
      this.tags.push(["image", value]);
  }
  get command() {
    return this.tagValue("command");
  }
  set command(value) {
    this.removeTag("command");
    if (value)
      this.tags.push(["command", value]);
  }
  get agentConfig() {
    const agentTag = this.tagValue("agent");
    if (!agentTag)
      return;
    try {
      return JSON.parse(agentTag);
    } catch {
      return;
    }
  }
  set agentConfig(value) {
    this.removeTag("agent");
    if (value) {
      this.tags.push(["agent", JSON.stringify(value)]);
    }
  }
  get templateTags() {
    return this.getMatchingTags("t").map((tag) => tag[1]).filter(Boolean);
  }
  set templateTags(values) {
    this.tags = this.tags.filter((tag) => tag[0] !== "t");
    values.forEach((value) => {
      if (value)
        this.tags.push(["t", value]);
    });
  }
};
var READ_MARKER = "read";
var WRITE_MARKER = "write";
var NDKRelayList = class _NDKRelayList extends NDKEvent {
  static kind = 10002;
  static kinds = [10002];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 10002;
  }
  static from(ndkEvent) {
    return new _NDKRelayList(ndkEvent.ndk, ndkEvent.rawEvent());
  }
  get readRelayUrls() {
    return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").filter((tag) => !tag[2] || tag[2] && tag[2] === READ_MARKER).map((tag) => tryNormalizeRelayUrl(tag[1])).filter((url) => !!url);
  }
  set readRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay, READ_MARKER]);
    }
  }
  get writeRelayUrls() {
    return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").filter((tag) => !tag[2] || tag[2] && tag[2] === WRITE_MARKER).map((tag) => tryNormalizeRelayUrl(tag[1])).filter((url) => !!url);
  }
  set writeRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay, WRITE_MARKER]);
    }
  }
  get bothRelayUrls() {
    return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").filter((tag) => !tag[2]).map((tag) => tag[1]);
  }
  set bothRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay]);
    }
  }
  get relays() {
    return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").map((tag) => tag[1]);
  }
  get relaySet() {
    if (!this.ndk)
      throw new Error("NDKRelayList has no NDK instance");
    return new NDKRelaySet(new Set(this.relays.map((u) => this.ndk?.pool.getRelay(u)).filter((r) => !!r)), this.ndk);
  }
};
function relayListFromKind3(ndk, contactList) {
  try {
    const content = JSON.parse(contactList.content);
    const relayList = new NDKRelayList(ndk);
    const readRelays = /* @__PURE__ */ new Set;
    const writeRelays = /* @__PURE__ */ new Set;
    for (let [key, config] of Object.entries(content)) {
      try {
        key = normalizeRelayUrl(key);
      } catch {
        continue;
      }
      if (!config) {
        readRelays.add(key);
        writeRelays.add(key);
      } else {
        const relayConfig = config;
        if (relayConfig.write)
          writeRelays.add(key);
        if (relayConfig.read)
          readRelays.add(key);
      }
    }
    relayList.readRelayUrls = Array.from(readRelays);
    relayList.writeRelayUrls = Array.from(writeRelays);
    return relayList;
  } catch {}
  return;
}
var NDKRelayFeedList = class _NDKRelayFeedList extends NDKList {
  static kind = 10012;
  static kinds = [10012];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    if (!rawEvent?.kind) {
      this.kind = 10012;
    }
  }
  static from(ndkEvent) {
    return new _NDKRelayFeedList(ndkEvent.ndk, ndkEvent);
  }
  get relayUrls() {
    return this.getMatchingTags("relay").map((tag) => tag[1]);
  }
  get relaySets() {
    return this.getMatchingTags("a").map((tag) => tag[1]);
  }
  async addRelay(relayUrl, mark, encrypted = false, position = "bottom") {
    const tag = ["relay", relayUrl];
    if (mark)
      tag.push(mark);
    await this.addItem(tag, undefined, encrypted, position);
  }
  async addRelaySet(relaySetNaddr, mark, encrypted = false, position = "bottom") {
    const tag = ["a", relaySetNaddr];
    if (mark)
      tag.push(mark);
    await this.addItem(tag, undefined, encrypted, position);
  }
  async removeRelay(relayUrl, publish = true) {
    await this.removeItemByValue(relayUrl, publish);
  }
  async removeRelaySet(relaySetNaddr, publish = true) {
    await this.removeItemByValue(relaySetNaddr, publish);
  }
};
var NDKRepost = class _NDKRepost extends NDKEvent {
  _repostedEvents;
  static kind = 6;
  static kinds = [6, 16];
  static from(event) {
    return new _NDKRepost(event.ndk, event.rawEvent());
  }
  async repostedEvents(klass, opts) {
    const items = [];
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (this._repostedEvents !== undefined)
      return this._repostedEvents;
    for (const eventId of this.repostedEventIds()) {
      const filter = filterForId(eventId);
      const event = await this.ndk.fetchEvent(filter, opts);
      if (event) {
        items.push(klass ? klass.from(event) : event);
      }
    }
    return items;
  }
  repostedEventIds() {
    return this.tags.filter((t) => t[0] === "e" || t[0] === "a").map((t) => t[1]);
  }
};
function filterForId(id) {
  if (id.match(/:/)) {
    const [kind, pubkey, identifier] = id.split(":");
    return {
      kinds: [Number.parseInt(kind)],
      authors: [pubkey],
      "#d": [identifier]
    };
  }
  return { ids: [id] };
}
var NDKSimpleGroupMemberList = class _NDKSimpleGroupMemberList extends NDKEvent {
  relaySet;
  memberSet = /* @__PURE__ */ new Set;
  static kind = 39002;
  static kinds = [39002];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 39002;
    this.memberSet = new Set(this.members);
  }
  static from(event) {
    return new _NDKSimpleGroupMemberList(event.ndk, event);
  }
  get members() {
    return this.getMatchingTags("p").map((tag) => tag[1]);
  }
  hasMember(member) {
    return this.memberSet.has(member);
  }
  async publish(relaySet, timeoutMs, requiredRelayCount) {
    relaySet ??= this.relaySet;
    return super.publishReplaceable(relaySet, timeoutMs, requiredRelayCount);
  }
};
var NDKSimpleGroupMetadata = class _NDKSimpleGroupMetadata extends NDKEvent {
  static kind = 39000;
  static kinds = [39000];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 39000;
  }
  static from(event) {
    return new _NDKSimpleGroupMetadata(event.ndk, event);
  }
  get name() {
    return this.tagValue("name");
  }
  get picture() {
    return this.tagValue("picture");
  }
  get about() {
    return this.tagValue("about");
  }
  get scope() {
    if (this.getMatchingTags("public").length > 0)
      return "public";
    if (this.getMatchingTags("public").length > 0)
      return "private";
    return;
  }
  set scope(scope) {
    this.removeTag("public");
    this.removeTag("private");
    if (scope === "public") {
      this.tags.push(["public", ""]);
    } else if (scope === "private") {
      this.tags.push(["private", ""]);
    }
  }
  get access() {
    if (this.getMatchingTags("open").length > 0)
      return "open";
    if (this.getMatchingTags("closed").length > 0)
      return "closed";
    return;
  }
  set access(access) {
    this.removeTag("open");
    this.removeTag("closed");
    if (access === "open") {
      this.tags.push(["open", ""]);
    } else if (access === "closed") {
      this.tags.push(["closed", ""]);
    }
  }
};
function strToPosition(positionStr) {
  const [x, y] = positionStr.split(",").map(Number);
  return { x, y };
}
function strToDimension(dimensionStr) {
  const [width, height] = dimensionStr.split("x").map(Number);
  return { width, height };
}
var NDKStorySticker = class _NDKStorySticker {
  static Text = "text";
  static Pubkey = "pubkey";
  static Event = "event";
  static Prompt = "prompt";
  static Countdown = "countdown";
  type;
  value;
  position;
  dimension;
  properties;
  constructor(arg) {
    if (Array.isArray(arg)) {
      const tag = arg;
      if (tag[0] !== "sticker" || tag.length < 5) {
        throw new Error("Invalid sticker tag");
      }
      this.type = tag[1];
      this.value = tag[2];
      this.position = strToPosition(tag[3]);
      this.dimension = strToDimension(tag[4]);
      const props = {};
      for (let i2 = 5;i2 < tag.length; i2++) {
        const [key, ...rest] = tag[i2].split(" ");
        props[key] = rest.join(" ");
      }
      if (Object.keys(props).length > 0) {
        this.properties = props;
      }
    } else {
      this.type = arg;
      this.value = undefined;
      this.position = { x: 0, y: 0 };
      this.dimension = { width: 0, height: 0 };
    }
  }
  static fromTag(tag) {
    try {
      return new _NDKStorySticker(tag);
    } catch {
      return null;
    }
  }
  get style() {
    return this.properties?.style;
  }
  set style(style) {
    if (style)
      this.properties = { ...this.properties, style };
    else
      delete this.properties?.style;
  }
  get rotation() {
    return this.properties?.rot ? Number.parseFloat(this.properties.rot) : undefined;
  }
  set rotation(rotation) {
    if (rotation !== undefined) {
      this.properties = { ...this.properties, rot: rotation.toString() };
    } else {
      delete this.properties?.rot;
    }
  }
  get isValid() {
    return this.hasValidDimensions() && this.hasValidPosition();
  }
  hasValidDimensions = () => {
    return typeof this.dimension.width === "number" && typeof this.dimension.height === "number" && !Number.isNaN(this.dimension.width) && !Number.isNaN(this.dimension.height);
  };
  hasValidPosition = () => {
    return typeof this.position.x === "number" && typeof this.position.y === "number" && !Number.isNaN(this.position.x) && !Number.isNaN(this.position.y);
  };
  toTag() {
    if (!this.isValid) {
      const errors = [
        !this.hasValidDimensions() ? "dimensions is invalid" : undefined,
        !this.hasValidPosition() ? "position is invalid" : undefined
      ].filter(Boolean);
      throw new Error(`Invalid sticker: ${errors.join(", ")}`);
    }
    let value;
    switch (this.type) {
      case "event":
        value = this.value.tagId();
        break;
      case "pubkey":
        value = this.value.pubkey;
        break;
      default:
        value = this.value;
    }
    const tag = ["sticker", this.type, value, coordinates(this.position), dimension(this.dimension)];
    if (this.properties) {
      for (const [key, propValue] of Object.entries(this.properties)) {
        tag.push(`${key} ${propValue}`);
      }
    }
    return tag;
  }
};
var NDKStory = class _NDKStory extends NDKEvent {
  static kind = 23;
  static kinds = [23];
  _imeta;
  _dimensions;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 23;
    if (rawEvent) {
      for (const tag of rawEvent.tags) {
        switch (tag[0]) {
          case "imeta":
            this._imeta = mapImetaTag(tag);
            break;
          case "dim":
            this.dimensions = strToDimension(tag[1]);
            break;
        }
      }
    }
  }
  static from(event) {
    return new _NDKStory(event.ndk, event);
  }
  get isValid() {
    return !!this.imeta;
  }
  get imeta() {
    return this._imeta;
  }
  set imeta(tag) {
    this._imeta = tag;
    this.tags = this.tags.filter((t) => t[0] !== "imeta");
    if (tag) {
      this.tags.push(imetaTagToTag(tag));
    }
  }
  get dimensions() {
    const dimTag = this.tagValue("dim");
    if (!dimTag)
      return;
    return strToDimension(dimTag);
  }
  set dimensions(dimensions) {
    this.removeTag("dim");
    if (dimensions) {
      this.tags.push(["dim", `${dimensions.width}x${dimensions.height}`]);
    }
  }
  get duration() {
    const durTag = this.tagValue("dur");
    if (!durTag)
      return;
    return Number.parseInt(durTag);
  }
  set duration(duration) {
    this.removeTag("dur");
    if (duration !== undefined) {
      this.tags.push(["dur", duration.toString()]);
    }
  }
  get stickers() {
    const stickers = [];
    for (const tag of this.tags) {
      if (tag[0] !== "sticker" || tag.length < 5)
        continue;
      const sticker = NDKStorySticker.fromTag(tag);
      if (sticker)
        stickers.push(sticker);
    }
    return stickers;
  }
  addSticker(sticker) {
    let stickerToAdd;
    if (sticker instanceof NDKStorySticker) {
      stickerToAdd = sticker;
    } else {
      const tag = [
        "sticker",
        sticker.type,
        typeof sticker.value === "string" ? sticker.value : "",
        coordinates(sticker.position),
        dimension(sticker.dimension)
      ];
      if (sticker.properties) {
        for (const [key, value] of Object.entries(sticker.properties)) {
          tag.push(`${key} ${value}`);
        }
      }
      stickerToAdd = new NDKStorySticker(tag);
      stickerToAdd.value = sticker.value;
    }
    if (stickerToAdd.type === "pubkey") {
      this.tag(stickerToAdd.value);
    } else if (stickerToAdd.type === "event") {
      this.tag(stickerToAdd.value);
    }
    this.tags.push(stickerToAdd.toTag());
  }
  removeSticker(index) {
    const stickers = this.stickers;
    if (index < 0 || index >= stickers.length)
      return;
    let stickerCount = 0;
    for (let i2 = 0;i2 < this.tags.length; i2++) {
      if (this.tags[i2][0] === "sticker") {
        if (stickerCount === index) {
          this.tags.splice(i2, 1);
          break;
        }
        stickerCount++;
      }
    }
  }
};
var coordinates = (position) => `${position.x},${position.y}`;
var dimension = (dimension2) => `${dimension2.width}x${dimension2.height}`;
var NDKSubscriptionReceipt = class _NDKSubscriptionReceipt extends NDKEvent {
  debug;
  static kind = 7003;
  static kinds = [7003];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 7003;
    this.debug = ndk?.debug.extend("subscription-start") ?? import_debug5.default("ndk:subscription-start");
  }
  static from(event) {
    return new _NDKSubscriptionReceipt(event.ndk, event.rawEvent());
  }
  get recipient() {
    const pTag = this.getMatchingTags("p")?.[0];
    if (!pTag)
      return;
    const user = new NDKUser({ pubkey: pTag[1] });
    return user;
  }
  set recipient(user) {
    this.removeTag("p");
    if (!user)
      return;
    this.tags.push(["p", user.pubkey]);
  }
  get subscriber() {
    const PTag = this.getMatchingTags("P")?.[0];
    if (!PTag)
      return;
    const user = new NDKUser({ pubkey: PTag[1] });
    return user;
  }
  set subscriber(user) {
    this.removeTag("P");
    if (!user)
      return;
    this.tags.push(["P", user.pubkey]);
  }
  set subscriptionStart(event) {
    this.debug(`before setting subscription start: ${this.rawEvent}`);
    this.removeTag("e");
    this.tag(event, "subscription", true);
    this.debug(`after setting subscription start: ${this.rawEvent}`);
  }
  get tierName() {
    const tag = this.getMatchingTags("tier")?.[0];
    return tag?.[1];
  }
  get isValid() {
    const period = this.validPeriod;
    if (!period) {
      return false;
    }
    if (period.start > period.end) {
      return false;
    }
    const pTags = this.getMatchingTags("p");
    const PTags = this.getMatchingTags("P");
    if (pTags.length !== 1 || PTags.length !== 1) {
      return false;
    }
    return true;
  }
  get validPeriod() {
    const tag = this.getMatchingTags("valid")?.[0];
    if (!tag)
      return;
    try {
      return {
        start: new Date(Number.parseInt(tag[1]) * 1000),
        end: new Date(Number.parseInt(tag[2]) * 1000)
      };
    } catch {
      return;
    }
  }
  set validPeriod(period) {
    this.removeTag("valid");
    if (!period)
      return;
    this.tags.push([
      "valid",
      Math.floor(period.start.getTime() / 1000).toString(),
      Math.floor(period.end.getTime() / 1000).toString()
    ]);
  }
  get startPeriod() {
    return this.validPeriod?.start;
  }
  get endPeriod() {
    return this.validPeriod?.end;
  }
  isActive(time) {
    time ??= /* @__PURE__ */ new Date;
    const period = this.validPeriod;
    if (!period)
      return false;
    if (time < period.start)
      return false;
    if (time > period.end)
      return false;
    return true;
  }
};
var possibleIntervalFrequencies = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly"
];
function newAmount(amount, currency, term) {
  return ["amount", amount.toString(), currency, term];
}
function parseTagToSubscriptionAmount(tag) {
  const amount = Number.parseInt(tag[1]);
  if (Number.isNaN(amount) || amount === undefined || amount === null || amount <= 0)
    return;
  const currency = tag[2];
  if (currency === undefined || currency === "")
    return;
  const term = tag[3];
  if (term === undefined)
    return;
  if (!possibleIntervalFrequencies.includes(term))
    return;
  return {
    amount,
    currency,
    term
  };
}
var NDKSubscriptionTier = class _NDKSubscriptionTier extends NDKArticle {
  static kind = 37001;
  static kinds = [37001];
  constructor(ndk, rawEvent) {
    const k = rawEvent?.kind ?? 37001;
    super(ndk, rawEvent);
    this.kind = k;
  }
  static from(event) {
    return new _NDKSubscriptionTier(event.ndk, event);
  }
  get perks() {
    return this.getMatchingTags("perk").map((tag) => tag[1]).filter((perk) => perk !== undefined);
  }
  addPerk(perk) {
    this.tags.push(["perk", perk]);
  }
  get amounts() {
    return this.getMatchingTags("amount").map((tag) => parseTagToSubscriptionAmount(tag)).filter((a) => a !== undefined);
  }
  addAmount(amount, currency, term) {
    this.tags.push(newAmount(amount, currency, term));
  }
  set relayUrl(relayUrl) {
    this.tags.push(["r", relayUrl]);
  }
  get relayUrls() {
    return this.getMatchingTags("r").map((tag) => tag[1]).filter((relay) => relay !== undefined);
  }
  get verifierPubkey() {
    return this.tagValue("p");
  }
  set verifierPubkey(pubkey) {
    this.removeTag("p");
    if (pubkey)
      this.tags.push(["p", pubkey]);
  }
  get isValid() {
    return this.title !== undefined && this.amounts.length > 0;
  }
};
var NDKSubscriptionStart = class _NDKSubscriptionStart extends NDKEvent {
  debug;
  static kind = 7001;
  static kinds = [7001];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 7001;
    this.debug = ndk?.debug.extend("subscription-start") ?? import_debug6.default("ndk:subscription-start");
  }
  static from(event) {
    return new _NDKSubscriptionStart(event.ndk, event.rawEvent());
  }
  get recipient() {
    const pTag = this.getMatchingTags("p")?.[0];
    if (!pTag)
      return;
    const user = new NDKUser({ pubkey: pTag[1] });
    return user;
  }
  set recipient(user) {
    this.removeTag("p");
    if (!user)
      return;
    this.tags.push(["p", user.pubkey]);
  }
  get amount() {
    const amountTag = this.getMatchingTags("amount")?.[0];
    if (!amountTag)
      return;
    return parseTagToSubscriptionAmount(amountTag);
  }
  set amount(amount) {
    this.removeTag("amount");
    if (!amount)
      return;
    this.tags.push(newAmount(amount.amount, amount.currency, amount.term));
  }
  get tierId() {
    const eTag = this.getMatchingTags("e")?.[0];
    const aTag = this.getMatchingTags("a")?.[0];
    if (!eTag || !aTag)
      return;
    return eTag[1] ?? aTag[1];
  }
  set tier(tier) {
    this.removeTag("e");
    this.removeTag("a");
    this.removeTag("event");
    if (!tier)
      return;
    this.tag(tier);
    this.removeTag("p");
    this.tags.push(["p", tier.pubkey]);
    this.tags.push(["event", JSON.stringify(tier.rawEvent())]);
  }
  async fetchTier() {
    const eventTag = this.tagValue("event");
    if (eventTag) {
      try {
        const parsedEvent = JSON.parse(eventTag);
        return new NDKSubscriptionTier(this.ndk, parsedEvent);
      } catch {
        this.debug("Failed to parse event tag");
      }
    }
    const tierId = this.tierId;
    if (!tierId)
      return;
    const e = await this.ndk?.fetchEvent(tierId);
    if (!e)
      return;
    return NDKSubscriptionTier.from(e);
  }
  get isValid() {
    if (this.getMatchingTags("amount").length !== 1) {
      this.debug("Invalid # of amount tag");
      return false;
    }
    if (!this.amount) {
      this.debug("Invalid amount tag");
      return false;
    }
    if (this.getMatchingTags("p").length !== 1) {
      this.debug("Invalid # of p tag");
      return false;
    }
    if (!this.recipient) {
      this.debug("Invalid p tag");
      return false;
    }
    return true;
  }
};
var NDKTask = class _NDKTask extends NDKEvent {
  static kind = 1934;
  static kinds = [1934];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind = 1934;
  }
  static from(event) {
    return new _NDKTask(event.ndk, event.rawEvent());
  }
  set title(value) {
    this.removeTag("title");
    if (value)
      this.tags.push(["title", value]);
  }
  get title() {
    return this.tagValue("title");
  }
  set project(project) {
    this.removeTag("a");
    this.tags.push(project.tagReference());
  }
  get projectSlug() {
    const tag = this.getMatchingTags("a")[0];
    return tag ? tag[1].split(/:/)?.[2] : undefined;
  }
};
var NDKThread = class _NDKThread extends NDKEvent {
  static kind = 11;
  static kinds = [11];
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 11;
  }
  static from(event) {
    return new _NDKThread(event.ndk, event);
  }
  get title() {
    return this.tagValue("title");
  }
  set title(title) {
    this.removeTag("title");
    if (title) {
      this.tags.push(["title", title]);
    }
  }
};
var NDKVideo = class _NDKVideo extends NDKEvent {
  static kind = 21;
  static kinds = [34235, 34236, 22, 21];
  _imetas;
  static from(event) {
    return new _NDKVideo(event.ndk, event.rawEvent());
  }
  get title() {
    return this.tagValue("title");
  }
  set title(title) {
    this.removeTag("title");
    if (title)
      this.tags.push(["title", title]);
  }
  get thumbnail() {
    let thumbnail;
    if (this.imetas && this.imetas.length > 0) {
      thumbnail = this.imetas[0].image?.[0];
    }
    return thumbnail ?? this.tagValue("thumb");
  }
  get imetas() {
    if (this._imetas)
      return this._imetas;
    this._imetas = this.tags.filter((tag) => tag[0] === "imeta").map(mapImetaTag);
    return this._imetas;
  }
  set imetas(tags) {
    this._imetas = tags;
    this.tags = this.tags.filter((tag) => tag[0] !== "imeta");
    this.tags.push(...tags.map(imetaTagToTag));
  }
  get url() {
    if (this.imetas && this.imetas.length > 0) {
      return this.imetas[0].url;
    }
    return this.tagValue("url");
  }
  get published_at() {
    const tag = this.tagValue("published_at");
    if (tag) {
      return Number.parseInt(tag);
    }
    return;
  }
  async generateTags() {
    super.generateTags();
    if (!this.kind) {
      if (this.imetas?.[0]?.dim) {
        const [width, height] = this.imetas[0].dim.split("x");
        const isPortrait = width && height && Number.parseInt(width) < Number.parseInt(height);
        const isShort = this.duration && this.duration < 120;
        if (isShort && isPortrait)
          this.kind = 22;
        else
          this.kind = 21;
      }
    }
    return super.generateTags();
  }
  get duration() {
    const tag = this.tagValue("duration");
    if (tag) {
      return Number.parseInt(tag);
    }
    return;
  }
  set duration(dur) {
    this.removeTag("duration");
    if (dur !== undefined) {
      this.tags.push(["duration", Math.floor(dur).toString()]);
    }
  }
};
var NDKWiki = class _NDKWiki extends NDKArticle {
  static kind = 30818;
  static kinds = [30818];
  static from(event) {
    return new _NDKWiki(event.ndk, event.rawEvent());
  }
  get isDefered() {
    return this.hasTag("a", "defer");
  }
  get deferedId() {
    return this.tagValue("a", "defer");
  }
  set defer(deferedTo) {
    this.removeTag("a", "defer");
    this.tag(deferedTo, "defer");
  }
};
var NDKWikiMergeRequest = class _NDKWikiMergeRequest extends NDKEvent {
  static kind = 818;
  static kinds = [818];
  static from(event) {
    return new _NDKWikiMergeRequest(event.ndk, event.rawEvent());
  }
  get targetId() {
    return this.tagValue("a");
  }
  set target(targetEvent) {
    this.tags = this.tags.filter((tag) => {
      if (tag[0] === "a")
        return true;
      if (tag[0] === "e" && tag[3] !== "source")
        return true;
    });
    this.tag(targetEvent);
  }
  get sourceId() {
    return this.tagValue("e", "source");
  }
  set source(sourceEvent) {
    this.removeTag("e", "source");
    this.tag(sourceEvent, "source", false, "e");
  }
};
var registeredEventClasses = /* @__PURE__ */ new Set;
function wrapEvent3(event) {
  const eventWrappingMap = /* @__PURE__ */ new Map;
  const builtInClasses = [
    NDKImage,
    NDKVideo,
    NDKCashuMintList,
    NDKArticle,
    NDKHighlight,
    NDKDraft,
    NDKWiki,
    NDKWikiMergeRequest,
    NDKNutzap,
    NDKProject,
    NDKTask,
    NDKProjectTemplate,
    NDKSimpleGroupMemberList,
    NDKSimpleGroupMetadata,
    NDKSubscriptionTier,
    NDKSubscriptionStart,
    NDKSubscriptionReceipt,
    NDKList,
    NDKRelayList,
    NDKRelayFeedList,
    NDKStory,
    NDKBlossomList,
    NDKFollowPack,
    NDKThread,
    NDKRepost,
    NDKClassified,
    NDKAppHandlerEvent,
    NDKDVMJobFeedback,
    NDKCashuMintAnnouncement,
    NDKFedimintMint,
    NDKMintRecommendation
  ];
  const allClasses = [...builtInClasses, ...registeredEventClasses];
  for (const klass2 of allClasses) {
    for (const kind of klass2.kinds) {
      eventWrappingMap.set(kind, klass2);
    }
  }
  const klass = eventWrappingMap.get(event.kind);
  if (klass)
    return klass.from(event);
  return event;
}
function checkMissingKind(event, error) {
  if (event.kind === undefined || event.kind === null) {
    error("event-missing-kind", `Cannot sign event without 'kind'.

\uD83D\uDCE6 Event data:
   • content: ${event.content ? `"${event.content.substring(0, 50)}${event.content.length > 50 ? "..." : ""}"` : "(empty)"}
   • tags: ${event.tags.length} tag${event.tags.length !== 1 ? "s" : ""}
   • kind: ${event.kind} ❌

Set event.kind before signing.`, "Example: event.kind = 1; // for text note", false);
  }
}
function checkContentIsObject(event, error) {
  if (typeof event.content === "object") {
    const contentPreview = JSON.stringify(event.content, null, 2).substring(0, 200);
    error("event-content-is-object", `Event content is an object. Content must be a string.

\uD83D\uDCE6 Your content (${typeof event.content}):
${contentPreview}${JSON.stringify(event.content).length > 200 ? "..." : ""}

❌ event.content = { ... }  // WRONG
✅ event.content = JSON.stringify({ ... })  // CORRECT`, "Use JSON.stringify() for structured data: event.content = JSON.stringify(data)", false);
  }
}
function checkCreatedAtMilliseconds(event, error) {
  if (event.created_at && event.created_at > 10000000000) {
    const correctValue = Math.floor(event.created_at / 1000);
    const dateString = new Date(event.created_at).toISOString();
    error("event-created-at-milliseconds", `Event created_at is in milliseconds, not seconds.

\uD83D\uDCE6 Your value:
   • created_at: ${event.created_at} ❌
   • Interpreted as: ${dateString}
   • Should be: ${correctValue} ✅

Nostr timestamps MUST be in seconds since Unix epoch.`, "Use Math.floor(Date.now() / 1000) instead of Date.now()", false);
  }
}
function checkInvalidPTags(event, error) {
  const pTags = event.getMatchingTags("p");
  pTags.forEach((tag, idx) => {
    if (tag[1] && !/^[0-9a-f]{64}$/i.test(tag[1])) {
      const tagPreview = JSON.stringify(tag);
      error("tag-invalid-p-tag", `p-tag[${idx}] has invalid pubkey.

\uD83D\uDCE6 Your tag:
   ${tagPreview}

❌ Invalid value: "${tag[1]}"
   • Length: ${tag[1].length} (expected 64)
   • Format: ${tag[1].startsWith("npub") ? "bech32 (npub)" : "unknown"}

p-tags MUST contain 64-character hex pubkeys.`, tag[1].startsWith("npub") ? `Use ndkUser.pubkey instead of npub:
   ✅ event.tags.push(['p', ndkUser.pubkey])
   ❌ event.tags.push(['p', 'npub1...'])` : "p-tags must contain valid hex pubkeys (64 characters, 0-9a-f)", false);
    }
  });
}
function checkInvalidETags(event, error) {
  const eTags = event.getMatchingTags("e");
  eTags.forEach((tag, idx) => {
    if (tag[1] && !/^[0-9a-f]{64}$/i.test(tag[1])) {
      const tagPreview = JSON.stringify(tag);
      const isBech32 = tag[1].startsWith("note") || tag[1].startsWith("nevent");
      error("tag-invalid-e-tag", `e-tag[${idx}] has invalid event ID.

\uD83D\uDCE6 Your tag:
   ${tagPreview}

❌ Invalid value: "${tag[1]}"
   • Length: ${tag[1].length} (expected 64)
   • Format: ${isBech32 ? "bech32 (note/nevent)" : "unknown"}

e-tags MUST contain 64-character hex event IDs.`, isBech32 ? `Use event.id instead of bech32:
   ✅ event.tags.push(['e', referencedEvent.id])
   ❌ event.tags.push(['e', 'note1...'])` : "e-tags must contain valid hex event IDs (64 characters, 0-9a-f)", false);
    }
  });
}
function checkManualReplyMarkers(event, warn, replyEvents) {
  if (event.kind !== 1)
    return;
  if (replyEvents.has(event))
    return;
  const eTagsWithMarkers = event.tags.filter((tag) => tag[0] === "e" && (tag[3] === "reply" || tag[3] === "root"));
  if (eTagsWithMarkers.length > 0) {
    const tagList = eTagsWithMarkers.map((tag, idx) => `   ${idx + 1}. ${JSON.stringify(tag)}`).join(`
`);
    warn("event-manual-reply-markers", `Event has ${eTagsWithMarkers.length} e-tag(s) with manual reply/root markers.

\uD83D\uDCE6 Your tags with markers:
${tagList}

⚠️  Manual reply markers detected! This will cause incorrect threading.`, `Reply events MUST be created using .reply():

   ✅ CORRECT:
   const replyEvent = originalEvent.reply();
   replyEvent.content = 'good point!';
   await replyEvent.publish();

   ❌ WRONG:
   event.tags.push(['e', eventId, '', 'reply']);

NDK handles all reply threading automatically - never add reply/root markers manually.`);
  }
}
function checkHashtagsWithPrefix(event, error) {
  const tTags = event.getMatchingTags("t");
  tTags.forEach((tag, idx) => {
    if (tag[1] && tag[1].startsWith("#")) {
      const tagPreview = JSON.stringify(tag);
      error("tag-hashtag-with-prefix", `t-tag[${idx}] contains hashtag with # prefix.

\uD83D\uDCE6 Your tag:
   ${tagPreview}

❌ Invalid value: "${tag[1]}"

Hashtag tags should NOT include the # symbol.`, `Remove the # prefix from hashtag tags:
   ✅ event.tags.push(['t', 'nostr'])
   ❌ event.tags.push(['t', '#nostr'])`, false);
    }
  });
}
function checkReplaceableWithOldTimestamp(event, warn) {
  if (event.kind === undefined || event.kind === null || !event.created_at)
    return;
  if (!event.isReplaceable())
    return;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const ageSeconds = nowSeconds - event.created_at;
  const TEN_SECONDS = 10;
  if (ageSeconds > TEN_SECONDS) {
    const ageMinutes = Math.floor(ageSeconds / 60);
    const ageDescription = ageMinutes > 0 ? `${ageMinutes} minute${ageMinutes !== 1 ? "s" : ""}` : `${ageSeconds} seconds`;
    warn("event-replaceable-old-timestamp", `Publishing a replaceable event with an old created_at timestamp.

\uD83D\uDCE6 Event details:
   • kind: ${event.kind} (replaceable)
   • created_at: ${event.created_at}
   • age: ${ageDescription} old
   • current time: ${nowSeconds}

⚠️  This is wrong and will be rejected by relays.`, `For replaceable events, use publishReplaceable():

   ✅ CORRECT:
   await event.publishReplaceable();
   // Automatically updates created_at to now

   ❌ WRONG:
   await event.publish();
   // Uses old created_at`);
  }
}
function signing(event, error, warn, replyEvents) {
  checkMissingKind(event, error);
  checkContentIsObject(event, error);
  checkCreatedAtMilliseconds(event, error);
  checkInvalidPTags(event, error);
  checkInvalidETags(event, error);
  checkHashtagsWithPrefix(event, error);
  checkManualReplyMarkers(event, warn, replyEvents);
}
function publishing(event, warn) {
  checkReplaceableWithOldTimestamp(event, warn);
}
function isNip33Pattern(filters) {
  const filterArray = Array.isArray(filters) ? filters : [filters];
  if (filterArray.length !== 1)
    return false;
  const filter = filterArray[0];
  return filter.kinds && Array.isArray(filter.kinds) && filter.kinds.length === 1 && filter.authors && Array.isArray(filter.authors) && filter.authors.length === 1 && filter["#d"] && Array.isArray(filter["#d"]) && filter["#d"].length === 1;
}
function isReplaceableEventFilter(filters) {
  const filterArray = Array.isArray(filters) ? filters : [filters];
  if (filterArray.length === 0) {
    return false;
  }
  return filterArray.every((filter) => {
    if (!filter.kinds || !Array.isArray(filter.kinds) || filter.kinds.length === 0) {
      return false;
    }
    if (!filter.authors || !Array.isArray(filter.authors) || filter.authors.length === 0) {
      return false;
    }
    const allKindsReplaceable = filter.kinds.every((kind) => {
      return kind === 0 || kind === 3 || kind >= 1e4 && kind <= 19999;
    });
    return allKindsReplaceable;
  });
}
function formatFilter(filter) {
  const formatted = JSON.stringify(filter, null, 2);
  return formatted.split(`
`).map((line, idx) => idx === 0 ? line : `   ${line}`).join(`
`);
}
function fetchingEvents(filters, opts, warn, shouldWarnRatio, incrementCount) {
  incrementCount();
  if (opts?.cacheUsage === "ONLY_CACHE") {
    return;
  }
  const filterArray = Array.isArray(filters) ? filters : [filters];
  const formattedFilters = filterArray.map(formatFilter).join(`

   ---

   `);
  if (isNip33Pattern(filters)) {
    const filter = filterArray[0];
    warn("fetch-events-usage", `For fetching a NIP-33 addressable event, use fetchEvent() with the naddr directly.

\uD83D\uDCE6 Your filter:
   ` + formattedFilters + `

  ❌ BAD:  const decoded = nip19.decode(naddr);
           const events = await ndk.fetchEvents({
             kinds: [decoded.data.kind],
             authors: [decoded.data.pubkey],
             "#d": [decoded.data.identifier]
           });
           const event = Array.from(events)[0];

  ✅ GOOD: const event = await ndk.fetchEvent(naddr);
  ✅ GOOD: const event = await ndk.fetchEvent('naddr1...');

fetchEvent() handles naddr decoding automatically and returns the event directly.`);
  } else if (isReplaceableEventFilter(filters)) {
    return;
  } else {
    if (!shouldWarnRatio()) {
      return;
    }
    let filterAnalysis = "";
    const hasLimit = filterArray.some((f) => f.limit !== undefined);
    const totalKinds = new Set(filterArray.flatMap((f) => f.kinds || [])).size;
    const totalAuthors = new Set(filterArray.flatMap((f) => f.authors || [])).size;
    if (hasLimit) {
      const maxLimit = Math.max(...filterArray.map((f) => f.limit || 0));
      filterAnalysis += `
   • Limit: ${maxLimit} event${maxLimit !== 1 ? "s" : ""}`;
    }
    if (totalKinds > 0) {
      filterAnalysis += `
   • Kinds: ${totalKinds} type${totalKinds !== 1 ? "s" : ""}`;
    }
    if (totalAuthors > 0) {
      filterAnalysis += `
   • Authors: ${totalAuthors} author${totalAuthors !== 1 ? "s" : ""}`;
    }
    warn("fetch-events-usage", `fetchEvents() is a BLOCKING operation that waits for EOSE.
In most cases, you should use subscribe() instead.

\uD83D\uDCE6 Your filter` + (filterArray.length > 1 ? "s" : "") + `:
   ` + formattedFilters + (filterAnalysis ? `

\uD83D\uDCCA Filter analysis:` + filterAnalysis : "") + `

  ❌ BAD:  const events = await ndk.fetchEvents(filter);
  ✅ GOOD: ndk.subscribe(filter, { onEvent: (e) => ... });

Only use fetchEvents() when you MUST block until data arrives.`, "For one-time queries, use fetchEvent() instead of fetchEvents() when expecting a single result.");
  }
}
var GuardrailCheckId = {
  NDK_NO_CACHE: "ndk-no-cache",
  FILTER_BECH32_IN_ARRAY: "filter-bech32-in-array",
  FILTER_INVALID_HEX: "filter-invalid-hex",
  FILTER_ONLY_LIMIT: "filter-only-limit",
  FILTER_LARGE_LIMIT: "filter-large-limit",
  FILTER_EMPTY: "filter-empty",
  FILTER_SINCE_AFTER_UNTIL: "filter-since-after-until",
  FILTER_INVALID_A_TAG: "filter-invalid-a-tag",
  FILTER_HASHTAG_WITH_PREFIX: "filter-hashtag-with-prefix",
  FETCH_EVENTS_USAGE: "fetch-events-usage",
  EVENT_MISSING_KIND: "event-missing-kind",
  EVENT_PARAM_REPLACEABLE_NO_DTAG: "event-param-replaceable-no-dtag",
  EVENT_CREATED_AT_MILLISECONDS: "event-created-at-milliseconds",
  EVENT_NO_NDK_INSTANCE: "event-no-ndk-instance",
  EVENT_CONTENT_IS_OBJECT: "event-content-is-object",
  EVENT_MODIFIED_AFTER_SIGNING: "event-modified-after-signing",
  EVENT_MANUAL_REPLY_MARKERS: "event-manual-reply-markers",
  TAG_E_FOR_PARAM_REPLACEABLE: "tag-e-for-param-replaceable",
  TAG_BECH32_VALUE: "tag-bech32-value",
  TAG_DUPLICATE: "tag-duplicate",
  TAG_INVALID_P_TAG: "tag-invalid-p-tag",
  TAG_INVALID_E_TAG: "tag-invalid-e-tag",
  TAG_HASHTAG_WITH_PREFIX: "tag-hashtag-with-prefix",
  SUBSCRIBE_NOT_STARTED: "subscribe-not-started",
  SUBSCRIBE_CLOSE_ON_EOSE_NO_HANDLER: "subscribe-close-on-eose-no-handler",
  SUBSCRIBE_PASSED_EVENT_NOT_FILTER: "subscribe-passed-event-not-filter",
  SUBSCRIBE_AWAITED: "subscribe-awaited",
  RELAY_INVALID_URL: "relay-invalid-url",
  RELAY_HTTP_INSTEAD_OF_WS: "relay-http-instead-of-ws",
  RELAY_NO_ERROR_HANDLERS: "relay-no-error-handlers",
  VALIDATION_PUBKEY_IS_NPUB: "validation-pubkey-is-npub",
  VALIDATION_PUBKEY_WRONG_LENGTH: "validation-pubkey-wrong-length",
  VALIDATION_EVENT_ID_IS_BECH32: "validation-event-id-is-bech32",
  VALIDATION_EVENT_ID_WRONG_LENGTH: "validation-event-id-wrong-length"
};
function checkCachePresence(ndk, shouldCheck) {
  if (!shouldCheck(GuardrailCheckId.NDK_NO_CACHE))
    return;
  setTimeout(() => {
    if (!ndk.cacheAdapter) {
      const isBrowser = typeof window !== "undefined";
      const suggestion = isBrowser ? "Consider using @nostr-dev-kit/ndk-cache-dexie or @nostr-dev-kit/ndk-cache-sqlite-wasm" : "Consider using @nostr-dev-kit/ndk-cache-redis or @nostr-dev-kit/ndk-cache-sqlite";
      const message = `
\uD83E\uDD16 AI_GUARDRAILS WARNING: NDK initialized without a cache adapter. Apps perform significantly better with caching.

\uD83D\uDCA1 ${suggestion}

\uD83D\uDD07 To disable this check:
   ndk.aiGuardrails.skip('${GuardrailCheckId.NDK_NO_CACHE}')
   or set: ndk.aiGuardrails = { skip: new Set(['${GuardrailCheckId.NDK_NO_CACHE}']) }`;
      console.warn(message);
    }
  }, 2500);
}
var AIGuardrails = class {
  enabled = false;
  skipSet = /* @__PURE__ */ new Set;
  extensions = /* @__PURE__ */ new Map;
  _nextCallDisabled = null;
  _replyEvents = /* @__PURE__ */ new WeakSet;
  _fetchEventsCount = 0;
  _subscribeCount = 0;
  constructor(mode = false) {
    this.setMode(mode);
  }
  register(namespace, hooks) {
    if (this.extensions.has(namespace)) {
      console.warn(`AIGuardrails: Extension '${namespace}' already registered, overwriting`);
    }
    const wrappedHooks = {};
    for (const [key, fn] of Object.entries(hooks)) {
      if (typeof fn === "function") {
        wrappedHooks[key] = (...args) => {
          if (!this.enabled)
            return;
          fn(...args, this.shouldCheck.bind(this), this.error.bind(this), this.warn.bind(this));
        };
      }
    }
    this.extensions.set(namespace, wrappedHooks);
    this[namespace] = wrappedHooks;
  }
  setMode(mode) {
    if (typeof mode === "boolean") {
      this.enabled = mode;
      this.skipSet.clear();
    } else if (mode && typeof mode === "object") {
      this.enabled = true;
      this.skipSet = mode.skip || /* @__PURE__ */ new Set;
    }
  }
  isEnabled() {
    return this.enabled;
  }
  shouldCheck(id) {
    if (!this.enabled)
      return false;
    if (this.skipSet.has(id))
      return false;
    if (this._nextCallDisabled === "all")
      return false;
    if (this._nextCallDisabled && this._nextCallDisabled.has(id))
      return false;
    return true;
  }
  skip(id) {
    this.skipSet.add(id);
  }
  enable(id) {
    this.skipSet.delete(id);
  }
  getSkipped() {
    return Array.from(this.skipSet);
  }
  captureAndClearNextCallDisabled() {
    const captured = this._nextCallDisabled;
    this._nextCallDisabled = null;
    return captured;
  }
  incrementFetchEventsCount() {
    this._fetchEventsCount++;
  }
  incrementSubscribeCount() {
    this._subscribeCount++;
  }
  shouldWarnAboutFetchEventsRatio() {
    const totalCalls = this._fetchEventsCount + this._subscribeCount;
    if (totalCalls <= 6) {
      return false;
    }
    const ratio = this._fetchEventsCount / totalCalls;
    return ratio > 0.5;
  }
  error(id, message, hint, canDisable = true) {
    if (!this.shouldCheck(id))
      return;
    const fullMessage = this.formatMessage(id, "ERROR", message, hint, canDisable);
    console.error(fullMessage);
    throw new Error(fullMessage);
  }
  warn(id, message, hint) {
    if (!this.shouldCheck(id))
      return;
    const fullMessage = this.formatMessage(id, "WARNING", message, hint, true);
    console.error(fullMessage);
    throw new Error(fullMessage);
  }
  formatMessage(id, level, message, hint, canDisable = true) {
    let output4 = `
\uD83E\uDD16 AI_GUARDRAILS ${level}: ${message}`;
    if (hint) {
      output4 += `

\uD83D\uDCA1 ${hint}`;
    }
    if (canDisable) {
      output4 += `

\uD83D\uDD07 To disable this check:
   ndk.guardrailOff('${id}').yourMethod()  // For one call`;
      output4 += `
   ndk.aiGuardrails.skip('${id}')  // Permanently`;
      output4 += `
   or set: ndk.aiGuardrails = { skip: new Set(['${id}']) }`;
    }
    return output4;
  }
  ndkInstantiated(ndk) {
    if (!this.enabled)
      return;
    checkCachePresence(ndk, this.shouldCheck.bind(this));
  }
  ndk = {
    fetchingEvents: (filters, opts) => {
      if (!this.enabled)
        return;
      fetchingEvents(filters, opts, this.warn.bind(this), this.shouldWarnAboutFetchEventsRatio.bind(this), this.incrementFetchEventsCount.bind(this));
    }
  };
  event = {
    signing: (event) => {
      if (!this.enabled)
        return;
      signing(event, this.error.bind(this), this.warn.bind(this), this._replyEvents);
    },
    publishing: (event) => {
      if (!this.enabled)
        return;
      publishing(event, this.warn.bind(this));
    },
    received: (_event, _relay) => {
      if (!this.enabled)
        return;
    },
    creatingReply: (event) => {
      if (!this.enabled)
        return;
      this._replyEvents.add(event);
    }
  };
  subscription = {
    created: (_filters, _opts) => {
      if (!this.enabled)
        return;
      this.incrementSubscribeCount();
    }
  };
  relay = {
    connected: (_relay) => {
      if (!this.enabled)
        return;
    }
  };
};
function processFilters(filters, mode = "validate", debug9, ndk) {
  if (mode === "ignore") {
    return filters;
  }
  const issues = [];
  const processedFilters = filters.map((filter, index) => {
    if (ndk?.aiGuardrails.isEnabled()) {
      runAIGuardrailsForFilter(filter, index, ndk);
    }
    const result = processFilter(filter, mode, index, issues, debug9);
    return result;
  });
  if (mode === "validate" && issues.length > 0) {
    throw new Error(`Invalid filter(s) detected:
${issues.join(`
`)}`);
  }
  return processedFilters;
}
function processFilter(filter, mode, filterIndex, issues, debug9) {
  const isValidating = mode === "validate";
  const cleanedFilter = isValidating ? filter : { ...filter };
  if (filter.ids) {
    const validIds = [];
    filter.ids.forEach((id, idx) => {
      if (id === undefined) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].ids[${idx}] is undefined`);
        } else {
          debug9?.(`Fixed: Removed undefined value at ids[${idx}]`);
        }
      } else if (typeof id !== "string") {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].ids[${idx}] is not a string (got ${typeof id})`);
        } else {
          debug9?.(`Fixed: Removed non-string value at ids[${idx}] (was ${typeof id})`);
        }
      } else if (!isValidHex64(id)) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].ids[${idx}] is not a valid 64-char hex string: "${id}"`);
        } else {
          debug9?.(`Fixed: Removed invalid hex string at ids[${idx}]`);
        }
      } else {
        validIds.push(id);
      }
    });
    if (!isValidating) {
      cleanedFilter.ids = validIds.length > 0 ? validIds : undefined;
    }
  }
  if (filter.authors) {
    const validAuthors = [];
    filter.authors.forEach((author, idx) => {
      if (author === undefined) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].authors[${idx}] is undefined`);
        } else {
          debug9?.(`Fixed: Removed undefined value at authors[${idx}]`);
        }
      } else if (typeof author !== "string") {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].authors[${idx}] is not a string (got ${typeof author})`);
        } else {
          debug9?.(`Fixed: Removed non-string value at authors[${idx}] (was ${typeof author})`);
        }
      } else if (!isValidHex64(author)) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].authors[${idx}] is not a valid 64-char hex pubkey: "${author}"`);
        } else {
          debug9?.(`Fixed: Removed invalid hex pubkey at authors[${idx}]`);
        }
      } else {
        validAuthors.push(author);
      }
    });
    if (!isValidating) {
      cleanedFilter.authors = validAuthors.length > 0 ? validAuthors : undefined;
    }
  }
  if (filter.kinds) {
    const validKinds = [];
    filter.kinds.forEach((kind, idx) => {
      if (kind === undefined) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].kinds[${idx}] is undefined`);
        } else {
          debug9?.(`Fixed: Removed undefined value at kinds[${idx}]`);
        }
      } else if (typeof kind !== "number") {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].kinds[${idx}] is not a number (got ${typeof kind})`);
        } else {
          debug9?.(`Fixed: Removed non-number value at kinds[${idx}] (was ${typeof kind})`);
        }
      } else if (!Number.isInteger(kind)) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].kinds[${idx}] is not an integer: ${kind}`);
        } else {
          debug9?.(`Fixed: Removed non-integer value at kinds[${idx}]: ${kind}`);
        }
      } else if (kind < 0 || kind > 65535) {
        if (isValidating) {
          issues.push(`Filter[${filterIndex}].kinds[${idx}] is out of valid range (0-65535): ${kind}`);
        } else {
          debug9?.(`Fixed: Removed out-of-range kind at kinds[${idx}]: ${kind}`);
        }
      } else {
        validKinds.push(kind);
      }
    });
    if (!isValidating) {
      cleanedFilter.kinds = validKinds.length > 0 ? validKinds : undefined;
    }
  }
  for (const key in filter) {
    if (key.startsWith("#") && key.length === 2) {
      const tagValues = filter[key];
      if (Array.isArray(tagValues)) {
        const validValues = [];
        tagValues.forEach((value, idx) => {
          if (value === undefined) {
            if (isValidating) {
              issues.push(`Filter[${filterIndex}].${key}[${idx}] is undefined`);
            } else {
              debug9?.(`Fixed: Removed undefined value at ${key}[${idx}]`);
            }
          } else if (typeof value !== "string") {
            if (isValidating) {
              issues.push(`Filter[${filterIndex}].${key}[${idx}] is not a string (got ${typeof value})`);
            } else {
              debug9?.(`Fixed: Removed non-string value at ${key}[${idx}] (was ${typeof value})`);
            }
          } else {
            if ((key === "#e" || key === "#p") && !isValidHex64(value)) {
              if (isValidating) {
                issues.push(`Filter[${filterIndex}].${key}[${idx}] is not a valid 64-char hex string: "${value}"`);
              } else {
                debug9?.(`Fixed: Removed invalid hex string at ${key}[${idx}]`);
              }
            } else {
              validValues.push(value);
            }
          }
        });
        if (!isValidating) {
          cleanedFilter[key] = validValues.length > 0 ? validValues : undefined;
        }
      }
    }
  }
  if (!isValidating) {
    Object.keys(cleanedFilter).forEach((key) => {
      if (cleanedFilter[key] === undefined) {
        delete cleanedFilter[key];
      }
    });
  }
  return cleanedFilter;
}
function runAIGuardrailsForFilter(filter, filterIndex, ndk) {
  const guards = ndk.aiGuardrails;
  const filterPreview = JSON.stringify(filter, null, 2);
  if (Object.keys(filter).length === 1 && filter.limit !== undefined) {
    guards.error(GuardrailCheckId.FILTER_ONLY_LIMIT, `Filter[${filterIndex}] contains only 'limit' without any filtering criteria.

\uD83D\uDCE6 Your filter:
${filterPreview}

⚠️  This will fetch random events from relays without any criteria.`, `Add filtering criteria:
   ✅ { kinds: [1], limit: 10 }
   ✅ { authors: [pubkey], limit: 10 }
   ❌ { limit: 10 }`);
  }
  if (Object.keys(filter).length === 0) {
    guards.error(GuardrailCheckId.FILTER_EMPTY, `Filter[${filterIndex}] is empty.

\uD83D\uDCE6 Your filter:
${filterPreview}

⚠️  This will request ALL events from relays, which is never what you want.`, `Add filtering criteria like 'kinds', 'authors', or tags.`, false);
  }
  if (filter.since !== undefined && filter.until !== undefined && filter.since > filter.until) {
    const sinceDate = new Date(filter.since * 1000).toISOString();
    const untilDate = new Date(filter.until * 1000).toISOString();
    guards.error(GuardrailCheckId.FILTER_SINCE_AFTER_UNTIL, `Filter[${filterIndex}] has 'since' AFTER 'until'.

\uD83D\uDCE6 Your filter:
${filterPreview}

❌ since: ${filter.since} (${sinceDate})
❌ until: ${filter.until} (${untilDate})

No events can match this time range!`, `'since' must be BEFORE 'until'. Both are Unix timestamps in seconds.`, false);
  }
  const bech32Regex = /^n(addr|event|ote|pub|profile)1/;
  if (filter.ids) {
    filter.ids.forEach((id, idx) => {
      if (typeof id === "string") {
        if (bech32Regex.test(id)) {
          guards.error(GuardrailCheckId.FILTER_BECH32_IN_ARRAY, `Filter[${filterIndex}].ids[${idx}] contains bech32: "${id}". IDs must be hex, not bech32.`, `Use filterFromId() to decode bech32 first: import { filterFromId } from "@nostr-dev-kit/ndk"`, false);
        } else if (!isValidHex64(id)) {
          guards.error(GuardrailCheckId.FILTER_INVALID_HEX, `Filter[${filterIndex}].ids[${idx}] is not a valid 64-char hex string: "${id}"`, `Event IDs must be 64-character hexadecimal strings. Invalid IDs often come from corrupted data in user-generated lists. Always validate hex strings before using them in filters:

   const validIds = ids.filter(id => /^[0-9a-f]{64}$/i.test(id));`, false);
        }
      }
    });
  }
  if (filter.authors) {
    filter.authors.forEach((author, idx) => {
      if (typeof author === "string") {
        if (bech32Regex.test(author)) {
          guards.error(GuardrailCheckId.FILTER_BECH32_IN_ARRAY, `Filter[${filterIndex}].authors[${idx}] contains bech32: "${author}". Authors must be hex pubkeys, not npub.`, `Use ndkUser.pubkey instead. Example: { authors: [ndkUser.pubkey] }`, false);
        } else if (!isValidHex64(author)) {
          guards.error(GuardrailCheckId.FILTER_INVALID_HEX, `Filter[${filterIndex}].authors[${idx}] is not a valid 64-char hex pubkey: "${author}"`, `Kind:3 follow lists can contain invalid entries like labels ("Follow List"), partial strings ("highlig"), or other corrupted data. You MUST validate all pubkeys before using them in filters.

   Example:
   const validPubkeys = pubkeys.filter(p => /^[0-9a-f]{64}$/i.test(p));
   ndk.subscribe({ authors: validPubkeys, kinds: [1] });`, false);
        }
      }
    });
  }
  for (const key in filter) {
    if (key.startsWith("#") && key.length === 2) {
      const tagValues = filter[key];
      if (Array.isArray(tagValues)) {
        tagValues.forEach((value, idx) => {
          if (typeof value === "string") {
            if (key === "#e" || key === "#p") {
              if (bech32Regex.test(value)) {
                guards.error(GuardrailCheckId.FILTER_BECH32_IN_ARRAY, `Filter[${filterIndex}].${key}[${idx}] contains bech32: "${value}". Tag values must be decoded.`, `Use filterFromId() or nip19.decode() to get the hex value first.`, false);
              } else if (!isValidHex64(value)) {
                guards.error(GuardrailCheckId.FILTER_INVALID_HEX, `Filter[${filterIndex}].${key}[${idx}] is not a valid 64-char hex string: "${value}"`, `${key === "#e" ? "Event IDs" : "Public keys"} in tag filters must be 64-character hexadecimal strings. Kind:3 follow lists and other user-generated content can contain invalid data. Always filter before using:

   const validValues = values.filter(v => /^[0-9a-f]{64}$/i.test(v));`, false);
              }
            }
          }
        });
      }
    }
  }
  if (filter["#a"]) {
    const aTags = filter["#a"];
    aTags?.forEach((aTag, idx) => {
      if (typeof aTag === "string") {
        if (!/^\d+:[0-9a-f]{64}:.*$/.test(aTag)) {
          guards.error(GuardrailCheckId.FILTER_INVALID_A_TAG, `Filter[${filterIndex}].#a[${idx}] has invalid format: "${aTag}". Must be "kind:pubkey:d-tag".`, `Example: "30023:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:my-article"`, false);
        } else {
          const kind = Number.parseInt(aTag.split(":")[0], 10);
          if (kind < 30000 || kind > 39999) {
            guards.error(GuardrailCheckId.FILTER_INVALID_A_TAG, `Filter[${filterIndex}].#a[${idx}] uses non-addressable kind ${kind}: "${aTag}". #a filters are only for addressable events (kinds 30000-39999).`, `Addressable events include:
   • 30000-30039: Parameterized Replaceable Events (profiles, settings, etc.)
   • 30040-39999: Other addressable events

For regular events (kind ${kind}), use:
   • #e filter for specific event IDs
   • kinds + authors filters for event queries`, false);
          }
        }
      }
    });
  }
  if (filter["#t"]) {
    const tTags = filter["#t"];
    tTags?.forEach((tag, idx) => {
      if (typeof tag === "string" && tag.startsWith("#")) {
        guards.error(GuardrailCheckId.FILTER_HASHTAG_WITH_PREFIX, `Filter[${filterIndex}].#t[${idx}] contains hashtag with # prefix: "${tag}". Hashtag values should NOT include the # symbol.`, `Remove the # prefix from hashtag filters:
   ✅ { "#t": ["nostr"] }
   ❌ { "#t": ["#nostr"] }`, false);
      }
    });
  }
}
function queryFullyFilled(subscription) {
  if (filterIncludesIds(subscription.filter)) {
    if (resultHasAllRequestedIds(subscription)) {
      return true;
    }
  }
  return false;
}
function filterIncludesIds(filter) {
  return !!filter.ids;
}
function resultHasAllRequestedIds(subscription) {
  const ids = subscription.filter.ids;
  return !!ids && ids.length === subscription.eventFirstSeen.size;
}
function filterFromId(id) {
  let decoded;
  if (id.match(NIP33_A_REGEX)) {
    const [kind, pubkey, identifier] = id.split(":");
    const filter = {
      authors: [pubkey],
      kinds: [Number.parseInt(kind)]
    };
    if (identifier) {
      filter["#d"] = [identifier];
    }
    return filter;
  }
  if (id.match(BECH32_REGEX3)) {
    try {
      decoded = nip19_exports.decode(id);
      switch (decoded.type) {
        case "nevent": {
          const filter = { ids: [decoded.data.id] };
          if (decoded.data.author)
            filter.authors = [decoded.data.author];
          if (decoded.data.kind)
            filter.kinds = [decoded.data.kind];
          return filter;
        }
        case "note":
          return { ids: [decoded.data] };
        case "naddr": {
          const filter = {
            authors: [decoded.data.pubkey],
            kinds: [decoded.data.kind]
          };
          if (decoded.data.identifier)
            filter["#d"] = [decoded.data.identifier];
          return filter;
        }
      }
    } catch (e) {
      console.error("Error decoding", id, e);
    }
  }
  return { ids: [id] };
}
function isNip33AValue(value) {
  return value.match(NIP33_A_REGEX) !== null;
}
var NIP33_A_REGEX = /^(\d+):([0-9A-Fa-f]+)(?::(.*))?$/;
var BECH32_REGEX3 = /^n(event|ote|profile|pub|addr)1[\d\w]+$/;
function relaysFromBech32(bech322, ndk) {
  try {
    const decoded = nip19_exports.decode(bech322);
    if (["naddr", "nevent"].includes(decoded?.type)) {
      const data = decoded.data;
      if (data?.relays) {
        return data.relays.map((r) => new NDKRelay(r, ndk.relayAuthDefaultPolicy, ndk));
      }
    }
  } catch (_e) {}
  return [];
}
var defaultOpts = {
  closeOnEose: false,
  cacheUsage: "CACHE_FIRST",
  dontSaveToCache: false,
  groupable: true,
  groupableDelay: 10,
  groupableDelayType: "at-most",
  cacheUnconstrainFilter: ["limit", "since", "until"],
  includeMuted: false
};
var NDKSubscription = class extends import_tseep4.EventEmitter {
  subId;
  filters;
  opts;
  pool;
  skipVerification = false;
  skipValidation = false;
  exclusiveRelay = false;
  relayFilters;
  relaySet;
  ndk;
  debug;
  eventFirstSeen = /* @__PURE__ */ new Map;
  eosesSeen = /* @__PURE__ */ new Set;
  lastEventReceivedAt;
  mostRecentCacheEventTimestamp;
  internalId;
  closeOnEose;
  poolMonitor;
  skipOptimisticPublishEvent = false;
  cacheUnconstrainFilter;
  constructor(ndk, filters, opts, subId) {
    super();
    this.ndk = ndk;
    this.opts = { ...defaultOpts, ...opts || {} };
    this.pool = this.opts.pool || ndk.pool;
    const rawFilters = Array.isArray(filters) ? filters : [filters];
    const validationMode = ndk.filterValidationMode === "validate" ? "validate" : ndk.filterValidationMode === "fix" ? "fix" : "ignore";
    this.filters = processFilters(rawFilters, validationMode, ndk.debug, ndk);
    if (this.filters.length === 0) {
      throw new Error("Subscription must have at least one filter");
    }
    this.subId = subId || this.opts.subId;
    this.internalId = Math.random().toString(36).substring(7);
    this.debug = ndk.debug.extend(`subscription[${this.opts.subId ?? this.internalId}]`);
    if (this.opts.relaySet) {
      this.relaySet = this.opts.relaySet;
    } else if (this.opts.relayUrls) {
      this.relaySet = NDKRelaySet.fromRelayUrls(this.opts.relayUrls, this.ndk);
    }
    this.skipVerification = this.opts.skipVerification || false;
    this.skipValidation = this.opts.skipValidation || false;
    this.closeOnEose = this.opts.closeOnEose || false;
    this.skipOptimisticPublishEvent = this.opts.skipOptimisticPublishEvent || false;
    this.cacheUnconstrainFilter = this.opts.cacheUnconstrainFilter;
    this.exclusiveRelay = this.opts.exclusiveRelay || false;
    if (this.opts.onEvent) {
      this.on("event", this.opts.onEvent);
    }
    if (this.opts.onEose) {
      this.on("eose", this.opts.onEose);
    }
    if (this.opts.onClose) {
      this.on("close", this.opts.onClose);
    }
  }
  relaysMissingEose() {
    if (!this.relayFilters)
      return [];
    const relaysMissingEose = Array.from(this.relayFilters?.keys()).filter((url) => !this.eosesSeen.has(this.pool.getRelay(url, false, false)));
    return relaysMissingEose;
  }
  get filter() {
    return this.filters[0];
  }
  get groupableDelay() {
    if (!this.isGroupable())
      return;
    return this.opts?.groupableDelay;
  }
  get groupableDelayType() {
    return this.opts?.groupableDelayType || "at-most";
  }
  isGroupable() {
    return this.opts?.groupable || false;
  }
  shouldQueryCache() {
    if (this.opts?.cacheUsage === "ONLY_RELAY")
      return false;
    const allFiltersEphemeralOnly = this.filters.every((f) => f.kinds && f.kinds.length > 0 && f.kinds.every((k) => kindIsEphemeral(k)));
    if (allFiltersEphemeralOnly)
      return false;
    return true;
  }
  shouldQueryRelays() {
    return this.opts?.cacheUsage !== "ONLY_CACHE";
  }
  shouldWaitForCache() {
    if (this.opts.addSinceFromCache)
      return true;
    return !!this.opts.closeOnEose && !!this.ndk.cacheAdapter?.locking && this.opts.cacheUsage !== "PARALLEL";
  }
  start(emitCachedEvents = true) {
    let cacheResult;
    const updateStateFromCacheResults = (events) => {
      if (events.length === 0) {
        if (!emitCachedEvents)
          cacheResult = events;
        return;
      }
      if (!emitCachedEvents) {
        let maxTimestamp2 = this.mostRecentCacheEventTimestamp || 0;
        for (const event of events) {
          event.ndk = this.ndk;
          if (event.created_at && event.created_at > maxTimestamp2) {
            maxTimestamp2 = event.created_at;
          }
        }
        this.mostRecentCacheEventTimestamp = maxTimestamp2;
        cacheResult = events;
        return;
      }
      let maxTimestamp = this.mostRecentCacheEventTimestamp || 0;
      for (const event of events) {
        if (event.created_at && event.created_at > maxTimestamp) {
          maxTimestamp = event.created_at;
        }
      }
      this.mostRecentCacheEventTimestamp = maxTimestamp;
      for (const event of events) {
        this.eventReceived(event, undefined, true, false);
      }
    };
    const loadFromRelays = () => {
      if (this.shouldQueryRelays()) {
        this.startWithRelays();
        this.startPoolMonitor();
      } else {
        this.emit("eose", this);
      }
    };
    if (this.shouldQueryCache()) {
      cacheResult = this.startWithCache();
      if (cacheResult instanceof Promise) {
        if (this.shouldWaitForCache()) {
          cacheResult.then((events) => {
            if (this.opts.onEvents) {
              let maxTimestamp = this.mostRecentCacheEventTimestamp || 0;
              for (const event of events) {
                event.ndk = this.ndk;
                if (event.created_at && event.created_at > maxTimestamp) {
                  maxTimestamp = event.created_at;
                }
              }
              this.mostRecentCacheEventTimestamp = maxTimestamp;
              this.opts.onEvents(events);
            } else {
              updateStateFromCacheResults(events);
            }
            if (queryFullyFilled(this)) {
              this.emit("eose", this);
              return;
            }
            loadFromRelays();
          });
          return null;
        }
        cacheResult.then((events) => {
          if (this.opts.onEvents) {
            let maxTimestamp = this.mostRecentCacheEventTimestamp || 0;
            for (const event of events) {
              event.ndk = this.ndk;
              if (event.created_at && event.created_at > maxTimestamp) {
                maxTimestamp = event.created_at;
              }
            }
            this.mostRecentCacheEventTimestamp = maxTimestamp;
            this.opts.onEvents(events);
          } else {
            updateStateFromCacheResults(events);
          }
          if (!this.shouldQueryRelays()) {
            this.emit("eose", this);
          }
        });
        if (this.shouldQueryRelays()) {
          loadFromRelays();
        }
        return null;
      }
      updateStateFromCacheResults(cacheResult);
      if (queryFullyFilled(this)) {
        this.emit("eose", this);
      } else {
        loadFromRelays();
      }
      return cacheResult;
    }
    loadFromRelays();
    return null;
  }
  startPoolMonitor() {
    const _d = this.debug.extend("pool-monitor");
    this.poolMonitor = (relay) => {
      if (this.relayFilters?.has(relay.url))
        return;
      const calc = calculateRelaySetsFromFilters(this.ndk, this.filters, this.pool, this.opts.relayGoalPerAuthor);
      if (calc.get(relay.url)) {
        this.relayFilters?.set(relay.url, this.filters);
        relay.subscribe(this, this.filters);
      }
    };
    this.pool.on("relay:connect", this.poolMonitor);
  }
  onStopped;
  stop() {
    this.emit("close", this);
    this.poolMonitor && this.pool.off("relay:connect", this.poolMonitor);
    this.onStopped?.();
  }
  hasAuthorsFilter() {
    return this.filters.some((f) => f.authors?.length);
  }
  startWithCache() {
    if (this.ndk.cacheAdapter?.query) {
      return this.ndk.cacheAdapter.query(this);
    }
    return [];
  }
  startWithRelays() {
    let filters = this.filters;
    if (this.opts.addSinceFromCache && this.mostRecentCacheEventTimestamp) {
      const sinceTimestamp = this.mostRecentCacheEventTimestamp + 1;
      filters = filters.map((filter) => ({
        ...filter,
        since: Math.max(filter.since || 0, sinceTimestamp)
      }));
    }
    if (!this.relaySet || this.relaySet.relays.size === 0) {
      this.relayFilters = calculateRelaySetsFromFilters(this.ndk, filters, this.pool, this.opts.relayGoalPerAuthor);
    } else {
      this.relayFilters = /* @__PURE__ */ new Map;
      for (const relay of this.relaySet.relays) {
        this.relayFilters.set(relay.url, filters);
      }
    }
    for (const [relayUrl, filters2] of this.relayFilters) {
      const relay = this.pool.getRelay(relayUrl, true, true, filters2);
      relay.subscribe(this, filters2);
    }
  }
  refreshRelayConnections() {
    if (this.relaySet && this.relaySet.relays.size > 0) {
      return;
    }
    const updatedRelaySets = calculateRelaySetsFromFilters(this.ndk, this.filters, this.pool, this.opts.relayGoalPerAuthor);
    for (const [relayUrl, filters] of updatedRelaySets) {
      if (!this.relayFilters?.has(relayUrl)) {
        this.relayFilters?.set(relayUrl, filters);
        const relay = this.pool.getRelay(relayUrl, true, true, filters);
        relay.subscribe(this, filters);
      }
    }
  }
  eventReceived(event, relay, fromCache = false, optimisticPublish = false) {
    const eventId = event.id;
    const eventAlreadySeen = this.eventFirstSeen.has(eventId);
    let ndkEvent;
    if (event instanceof NDKEvent)
      ndkEvent = event;
    if (!eventAlreadySeen) {
      if (this.ndk.futureTimestampGrace !== undefined && event.created_at) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeDifference = event.created_at - currentTime;
        if (timeDifference > this.ndk.futureTimestampGrace) {
          this.debug("Event discarded: timestamp %d is %d seconds in the future (grace: %d seconds)", event.created_at, timeDifference, this.ndk.futureTimestampGrace);
          return;
        }
      }
      ndkEvent ??= new NDKEvent(this.ndk, event);
      ndkEvent.ndk = this.ndk;
      ndkEvent.relay = relay;
      if (!fromCache && !optimisticPublish) {
        if (!this.skipValidation) {
          if (!ndkEvent.isValid) {
            this.debug("Event failed validation %s from relay %s", eventId, relay?.url);
            return;
          }
        }
        if (relay) {
          const shouldVerify = relay.shouldValidateEvent();
          if (shouldVerify && !this.skipVerification) {
            ndkEvent.relay = relay;
            if (this.ndk.asyncSigVerification) {
              ndkEvent.verifySignature(true);
            } else {
              if (!ndkEvent.verifySignature(true)) {
                this.debug("Event failed signature validation", event);
                this.ndk.reportInvalidSignature(ndkEvent, relay);
                return;
              }
              relay.addValidatedEvent();
            }
          } else {
            relay.addNonValidatedEvent();
          }
        }
        if (this.ndk.cacheAdapter && !this.opts.dontSaveToCache && !kindIsEphemeral(ndkEvent.kind) && !fromCache) {
          this.ndk.cacheAdapter.setEvent(ndkEvent, this.filters, relay);
        }
      }
      if (!this.opts.includeMuted && this.ndk.muteFilter && this.ndk.muteFilter(ndkEvent)) {
        this.debug("Event muted, skipping");
        return;
      }
      if (!optimisticPublish || this.skipOptimisticPublishEvent !== true) {
        this.emitEvent(this.opts?.wrap ?? false, ndkEvent, relay, fromCache, optimisticPublish);
        this.eventFirstSeen.set(eventId, Date.now());
      }
    } else {
      const timeSinceFirstSeen = Date.now() - (this.eventFirstSeen.get(eventId) || 0);
      this.emit("event:dup", event, relay, timeSinceFirstSeen, this, fromCache, optimisticPublish);
      if (this.opts?.onEventDup) {
        this.opts.onEventDup(event, relay, timeSinceFirstSeen, this, fromCache, optimisticPublish);
      }
      if (!fromCache && !optimisticPublish && relay && this.ndk.cacheAdapter?.setEventDup && !this.opts.dontSaveToCache) {
        ndkEvent ??= event instanceof NDKEvent ? event : new NDKEvent(this.ndk, event);
        this.ndk.cacheAdapter.setEventDup(ndkEvent, relay);
      }
      if (relay) {
        const signature = verifiedSignatures.get(eventId);
        if (signature && typeof signature === "string") {
          if (event.sig === signature) {
            relay.addValidatedEvent();
          } else {
            const eventToReport = event instanceof NDKEvent ? event : new NDKEvent(this.ndk, event);
            this.ndk.reportInvalidSignature(eventToReport, relay);
          }
        }
      }
    }
    this.lastEventReceivedAt = Date.now();
  }
  emitEvent(wrap, evt, relay, fromCache, optimisticPublish) {
    const wrapped = wrap ? wrapEvent3(evt) : evt;
    if (wrapped instanceof Promise) {
      wrapped.then((e) => this.emitEvent(false, e, relay, fromCache, optimisticPublish));
    } else if (wrapped) {
      this.emit("event", wrapped, relay, this, fromCache, optimisticPublish);
    }
  }
  closedReceived(relay, reason) {
    this.emit("closed", relay, reason);
  }
  eoseTimeout;
  eosed = false;
  eoseReceived(relay) {
    this.eosesSeen.add(relay);
    let lastEventSeen = this.lastEventReceivedAt ? Date.now() - this.lastEventReceivedAt : undefined;
    const hasSeenAllEoses = this.eosesSeen.size === this.relayFilters?.size;
    const queryFilled = queryFullyFilled(this);
    const performEose = (reason) => {
      if (this.eosed)
        return;
      if (this.eoseTimeout)
        clearTimeout(this.eoseTimeout);
      this.emit("eose", this);
      this.eosed = true;
      if (this.opts?.closeOnEose)
        this.stop();
    };
    if (queryFilled || hasSeenAllEoses) {
      performEose("query filled or seen all");
    } else if (this.relayFilters) {
      let timeToWaitForNextEose = 1000;
      const connectedRelays = new Set(this.pool.connectedRelays().map((r) => r.url));
      const connectedRelaysWithFilters = Array.from(this.relayFilters.keys()).filter((url) => connectedRelays.has(url));
      if (connectedRelaysWithFilters.length === 0) {
        this.debug("No connected relays, waiting for all relays to connect", Array.from(this.relayFilters.keys()).join(", "));
        return;
      }
      const percentageOfRelaysThatHaveSentEose = this.eosesSeen.size / connectedRelaysWithFilters.length;
      if (this.eosesSeen.size >= 2 && percentageOfRelaysThatHaveSentEose >= 0.5) {
        timeToWaitForNextEose = timeToWaitForNextEose * (1 - percentageOfRelaysThatHaveSentEose);
        if (timeToWaitForNextEose === 0) {
          performEose("time to wait was 0");
          return;
        }
        if (this.eoseTimeout)
          clearTimeout(this.eoseTimeout);
        const sendEoseTimeout = () => {
          lastEventSeen = this.lastEventReceivedAt ? Date.now() - this.lastEventReceivedAt : undefined;
          if (lastEventSeen !== undefined && lastEventSeen < 20) {
            this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
          } else {
            performEose(`send eose timeout: ${timeToWaitForNextEose}`);
          }
        };
        this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
      }
    }
  }
};
var kindIsEphemeral = (kind) => kind >= 20000 && kind < 30000;
async function follows(opts, outbox, kind = 3) {
  if (!this.ndk)
    throw new Error("NDK not set");
  const contactListEvent = await this.ndk.fetchEvent({ kinds: [kind], authors: [this.pubkey] }, opts || { groupable: false });
  if (contactListEvent) {
    const pubkeys = /* @__PURE__ */ new Set;
    contactListEvent.tags.forEach((tag) => {
      if (tag[0] === "p" && tag[1] && isValidPubkey(tag[1])) {
        pubkeys.add(tag[1]);
      }
    });
    if (outbox) {
      this.ndk?.outboxTracker?.trackUsers(Array.from(pubkeys));
    }
    return [...pubkeys].reduce((acc, pubkey) => {
      const user = new NDKUser({ pubkey });
      user.ndk = this.ndk;
      acc.add(user);
      return acc;
    }, /* @__PURE__ */ new Set);
  }
  return /* @__PURE__ */ new Set;
}
var NIP05_REGEX2 = /^(?:([\w.+-]+)@)?([\w.-]+)$/;
async function getNip05For(ndk, fullname, _fetch5 = fetch, fetchOpts = {}) {
  return await ndk.queuesNip05.add({
    id: fullname,
    func: async () => {
      if (ndk.cacheAdapter?.loadNip05) {
        const profile = await ndk.cacheAdapter.loadNip05(fullname);
        if (profile !== "missing") {
          if (profile) {
            const user = new NDKUser({
              pubkey: profile.pubkey,
              relayUrls: profile.relays,
              nip46Urls: profile.nip46
            });
            user.ndk = ndk;
            return user;
          }
          if (fetchOpts.cache !== "no-cache") {
            return null;
          }
        }
      }
      const match = fullname.match(NIP05_REGEX2);
      if (!match)
        return null;
      const [_, name = "_", domain] = match;
      try {
        const res = await _fetch5(`https://${domain}/.well-known/nostr.json?name=${name}`, fetchOpts);
        const { names, relays, nip46 } = parseNIP05Result(await res.json());
        const pubkey = names[name.toLowerCase()];
        let profile = null;
        if (pubkey) {
          profile = { pubkey, relays: relays?.[pubkey], nip46: nip46?.[pubkey] };
        }
        if (ndk?.cacheAdapter?.saveNip05) {
          ndk.cacheAdapter.saveNip05(fullname, profile);
        }
        return profile;
      } catch (_e) {
        if (ndk?.cacheAdapter?.saveNip05) {
          ndk?.cacheAdapter.saveNip05(fullname, null);
        }
        console.error("Failed to fetch NIP05 for", fullname, _e);
        return null;
      }
    }
  });
}
function parseNIP05Result(json) {
  const result = {
    names: {}
  };
  for (const [name, pubkey] of Object.entries(json.names)) {
    if (typeof name === "string" && typeof pubkey === "string") {
      result.names[name.toLowerCase()] = pubkey;
    }
  }
  if (json.relays) {
    result.relays = {};
    for (const [pubkey, relays] of Object.entries(json.relays)) {
      if (typeof pubkey === "string" && Array.isArray(relays)) {
        result.relays[pubkey] = relays.filter((relay) => typeof relay === "string");
      }
    }
  }
  if (json.nip46) {
    result.nip46 = {};
    for (const [pubkey, nip46] of Object.entries(json.nip46)) {
      if (typeof pubkey === "string" && Array.isArray(nip46)) {
        result.nip46[pubkey] = nip46.filter((relay) => typeof relay === "string");
      }
    }
  }
  return result;
}
function profileFromEvent(event) {
  const profile = {};
  let payload;
  try {
    payload = JSON.parse(event.content);
  } catch (error) {
    throw new Error(`Failed to parse profile event: ${error}`);
  }
  profile.profileEvent = JSON.stringify(event.rawEvent());
  for (const key of Object.keys(payload)) {
    switch (key) {
      case "name":
        profile.name = payload.name;
        break;
      case "display_name":
        profile.displayName = payload.display_name;
        break;
      case "image":
      case "picture":
        profile.picture = payload.picture || payload.image;
        profile.image = profile.picture;
        break;
      case "banner":
        profile.banner = payload.banner;
        break;
      case "bio":
        profile.bio = payload.bio;
        break;
      case "nip05":
        profile.nip05 = payload.nip05;
        break;
      case "lud06":
        profile.lud06 = payload.lud06;
        break;
      case "lud16":
        profile.lud16 = payload.lud16;
        break;
      case "about":
        profile.about = payload.about;
        break;
      case "website":
        profile.website = payload.website;
        break;
      default:
        profile[key] = payload[key];
        break;
    }
  }
  profile.created_at = event.created_at;
  return profile;
}
function serializeProfile(profile) {
  const payload = {};
  for (const [key, val] of Object.entries(profile)) {
    switch (key) {
      case "username":
      case "name":
        payload.name = val;
        break;
      case "displayName":
        payload.display_name = val;
        break;
      case "image":
      case "picture":
        payload.picture = val;
        break;
      case "bio":
      case "about":
        payload.about = val;
        break;
      default:
        payload[key] = val;
        break;
    }
  }
  return JSON.stringify(payload);
}
var NDKUser = class _NDKUser {
  ndk;
  profile;
  profileEvent;
  _npub;
  _pubkey;
  relayUrls = [];
  nip46Urls = [];
  constructor(opts) {
    if (opts.npub)
      this._npub = opts.npub;
    if (opts.hexpubkey)
      this._pubkey = opts.hexpubkey;
    if (opts.pubkey)
      this._pubkey = opts.pubkey;
    if (opts.relayUrls)
      this.relayUrls = opts.relayUrls;
    if (opts.nip46Urls)
      this.nip46Urls = opts.nip46Urls;
    if (opts.nprofile) {
      try {
        const decoded = nip19_exports.decode(opts.nprofile);
        if (decoded.type === "nprofile") {
          this._pubkey = decoded.data.pubkey;
          if (decoded.data.relays && decoded.data.relays.length > 0) {
            this.relayUrls.push(...decoded.data.relays);
          }
        }
      } catch (e) {
        console.error("Failed to decode nprofile", e);
      }
    }
  }
  get npub() {
    if (!this._npub) {
      if (!this._pubkey)
        throw new Error("pubkey not set");
      this._npub = nip19_exports.npubEncode(this.pubkey);
    }
    return this._npub;
  }
  get nprofile() {
    const relays = this.profileEvent?.onRelays?.map((r) => r.url);
    return nip19_exports.nprofileEncode({
      pubkey: this.pubkey,
      relays
    });
  }
  set npub(npub2) {
    this._npub = npub2;
  }
  get pubkey() {
    if (!this._pubkey) {
      if (!this._npub)
        throw new Error("npub not set");
      this._pubkey = nip19_exports.decode(this.npub).data;
    }
    return this._pubkey;
  }
  set pubkey(pubkey) {
    this._pubkey = pubkey;
  }
  filter() {
    return { "#p": [this.pubkey] };
  }
  async getZapInfo(timeoutMs) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    const promiseWithTimeout = async (promise) => {
      if (!timeoutMs)
        return promise;
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
      });
      try {
        const result = await Promise.race([promise, timeoutPromise]);
        if (timeoutId)
          clearTimeout(timeoutId);
        return result;
      } catch (e) {
        if (e instanceof Error && e.message === "Timeout") {
          try {
            const result = await promise;
            return result;
          } catch (_originalError) {
            return;
          }
        }
        return;
      }
    };
    const [userProfile, mintListEvent] = await Promise.all([
      promiseWithTimeout(this.fetchProfile()),
      promiseWithTimeout(this.ndk.fetchEvent({ kinds: [10019], authors: [this.pubkey] }))
    ]);
    const res = /* @__PURE__ */ new Map;
    if (mintListEvent) {
      const mintList = NDKCashuMintList.from(mintListEvent);
      if (mintList.mints.length > 0) {
        res.set("nip61", {
          mints: mintList.mints,
          relays: mintList.relays,
          p2pk: mintList.p2pk
        });
      }
    }
    if (userProfile) {
      const { lud06, lud16 } = userProfile;
      res.set("nip57", { lud06, lud16 });
    }
    return res;
  }
  static async fromNip05(nip05Id, ndk, skipCache = false) {
    if (!ndk)
      throw new Error("No NDK instance found");
    const opts = {};
    if (skipCache)
      opts.cache = "no-cache";
    const profile = await getNip05For(ndk, nip05Id, ndk?.httpFetch, opts);
    if (profile) {
      const user = new _NDKUser({
        pubkey: profile.pubkey,
        relayUrls: profile.relays,
        nip46Urls: profile.nip46
      });
      user.ndk = ndk;
      return user;
    }
  }
  async fetchProfile(opts, storeProfileEvent = false) {
    if (!this.ndk)
      throw new Error("NDK not set");
    let setMetadataEvent = null;
    if (this.ndk.cacheAdapter && (this.ndk.cacheAdapter.fetchProfile || this.ndk.cacheAdapter.fetchProfileSync) && opts?.cacheUsage !== "ONLY_RELAY") {
      let profile = null;
      if (this.ndk.cacheAdapter.fetchProfileSync) {
        profile = this.ndk.cacheAdapter.fetchProfileSync(this.pubkey);
      } else if (this.ndk.cacheAdapter.fetchProfile) {
        profile = await this.ndk.cacheAdapter.fetchProfile(this.pubkey);
      }
      if (profile) {
        this.profile = profile;
        return profile;
      }
    }
    opts ??= {};
    opts.cacheUsage ??= "ONLY_RELAY";
    opts.closeOnEose ??= true;
    opts.groupable ??= true;
    opts.groupableDelay ??= 25;
    if (!setMetadataEvent) {
      setMetadataEvent = await this.ndk.fetchEvent({ kinds: [0], authors: [this.pubkey] }, opts);
    }
    if (!setMetadataEvent)
      return null;
    this.profile = profileFromEvent(setMetadataEvent);
    if (storeProfileEvent && this.profile && this.ndk.cacheAdapter && this.ndk.cacheAdapter.saveProfile) {
      this.ndk.cacheAdapter.saveProfile(this.pubkey, this.profile);
    }
    return this.profile;
  }
  follows = follows.bind(this);
  async followSet(opts, outbox, kind = 3) {
    const follows2 = await this.follows(opts, outbox, kind);
    return new Set(Array.from(follows2).map((f) => f.pubkey));
  }
  tagReference() {
    return ["p", this.pubkey];
  }
  referenceTags(marker) {
    const tag = [["p", this.pubkey]];
    if (!marker)
      return tag;
    tag[0].push("", marker);
    return tag;
  }
  async publish() {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    if (!this.profile)
      throw new Error("No profile available");
    this.ndk.assertSigner();
    const event = new NDKEvent(this.ndk, {
      kind: 0,
      content: serializeProfile(this.profile)
    });
    await event.publish();
  }
  async follow(newFollow, currentFollowList, kind = 3) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    if (!currentFollowList) {
      currentFollowList = await this.follows(undefined, undefined, kind);
    }
    const followsToAdd = Array.isArray(newFollow) ? newFollow : [newFollow];
    let anyAdded = false;
    for (const follow of followsToAdd) {
      const followPubkey = typeof follow === "string" ? follow : follow.pubkey;
      const isAlreadyFollowing = Array.from(currentFollowList).some((item) => typeof item === "string" ? item === followPubkey : item.pubkey === followPubkey);
      if (!isAlreadyFollowing) {
        currentFollowList.add(follow);
        anyAdded = true;
      }
    }
    if (!anyAdded) {
      return false;
    }
    const event = new NDKEvent(this.ndk, { kind });
    for (const follow of currentFollowList) {
      if (typeof follow === "string") {
        event.tags.push(["p", follow]);
      } else {
        event.tag(follow);
      }
    }
    await event.publish();
    return true;
  }
  async unfollow(user, currentFollowList, kind = 3) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    if (!currentFollowList) {
      currentFollowList = await this.follows(undefined, undefined, kind);
    }
    const usersToUnfollow = Array.isArray(user) ? user : [user];
    const unfollowPubkeys = new Set(usersToUnfollow.map((u) => typeof u === "string" ? u : u.pubkey));
    const newUserFollowList = /* @__PURE__ */ new Set;
    let foundAny = false;
    for (const follow of currentFollowList) {
      const followPubkey = typeof follow === "string" ? follow : follow.pubkey;
      if (!unfollowPubkeys.has(followPubkey)) {
        newUserFollowList.add(follow);
      } else {
        foundAny = true;
      }
    }
    if (!foundAny)
      return false;
    const event = new NDKEvent(this.ndk, { kind });
    for (const follow of newUserFollowList) {
      if (typeof follow === "string") {
        event.tags.push(["p", follow]);
      } else {
        event.tag(follow);
      }
    }
    return await event.publish();
  }
  async validateNip05(nip05Id) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    const profilePointer = await getNip05For(this.ndk, nip05Id);
    if (profilePointer === null)
      return null;
    return profilePointer.pubkey === this.pubkey;
  }
};
var signerRegistry = /* @__PURE__ */ new Map;
function registerSigner(type, signerClass) {
  signerRegistry.set(type, signerClass);
}
var NDKPrivateKeySigner = class _NDKPrivateKeySigner {
  _user;
  _privateKey;
  _pubkey;
  constructor(privateKeyOrNsec, ndk) {
    if (typeof privateKeyOrNsec === "string") {
      if (privateKeyOrNsec.startsWith("nsec1")) {
        const { type, data } = nip19_exports.decode(privateKeyOrNsec);
        if (type === "nsec")
          this._privateKey = data;
        else
          throw new Error("Invalid private key provided.");
      } else if (privateKeyOrNsec.length === 64) {
        this._privateKey = hexToBytes5(privateKeyOrNsec);
      } else {
        throw new Error("Invalid private key provided.");
      }
    } else {
      this._privateKey = privateKeyOrNsec;
    }
    this._pubkey = getPublicKey(this._privateKey);
    if (ndk)
      this._user = ndk.getUser({ pubkey: this._pubkey });
    this._user ??= new NDKUser({ pubkey: this._pubkey });
  }
  get privateKey() {
    if (!this._privateKey)
      throw new Error("Not ready");
    return bytesToHex4(this._privateKey);
  }
  get pubkey() {
    if (!this._pubkey)
      throw new Error("Not ready");
    return this._pubkey;
  }
  get nsec() {
    if (!this._privateKey)
      throw new Error("Not ready");
    return nip19_exports.nsecEncode(this._privateKey);
  }
  get npub() {
    if (!this._pubkey)
      throw new Error("Not ready");
    return nip19_exports.npubEncode(this._pubkey);
  }
  encryptToNcryptsec(password, logn = 16, ksb = 2) {
    if (!this._privateKey)
      throw new Error("Private key not available");
    return encrypt3(this._privateKey, password, logn, ksb);
  }
  static generate() {
    const privateKey = generateSecretKey();
    return new _NDKPrivateKeySigner(privateKey);
  }
  static fromNcryptsec(ncryptsec, password, ndk) {
    const privateKeyBytes = decrypt3(ncryptsec, password);
    return new _NDKPrivateKeySigner(privateKeyBytes, ndk);
  }
  async blockUntilReady() {
    return this._user;
  }
  async user() {
    return this._user;
  }
  get userSync() {
    return this._user;
  }
  async sign(event) {
    if (!this._privateKey) {
      throw Error("Attempted to sign without a private key");
    }
    return finalizeEvent(event, this._privateKey).sig;
  }
  async encryptionEnabled(scheme) {
    const enabled = [];
    if (!scheme || scheme === "nip04")
      enabled.push("nip04");
    if (!scheme || scheme === "nip44")
      enabled.push("nip44");
    return enabled;
  }
  async encrypt(recipient, value, scheme) {
    if (!this._privateKey || !this.privateKey) {
      throw Error("Attempted to encrypt without a private key");
    }
    const recipientHexPubKey = recipient.pubkey;
    if (scheme === "nip44") {
      const conversationKey = nip44_exports.v2.utils.getConversationKey(this._privateKey, recipientHexPubKey);
      return await nip44_exports.v2.encrypt(value, conversationKey);
    }
    return await nip04_exports.encrypt(this._privateKey, recipientHexPubKey, value);
  }
  async decrypt(sender, value, scheme) {
    if (!this._privateKey || !this.privateKey) {
      throw Error("Attempted to decrypt without a private key");
    }
    const senderHexPubKey = sender.pubkey;
    if (scheme === "nip44") {
      const conversationKey = nip44_exports.v2.utils.getConversationKey(this._privateKey, senderHexPubKey);
      return await nip44_exports.v2.decrypt(value, conversationKey);
    }
    return await nip04_exports.decrypt(this._privateKey, senderHexPubKey, value);
  }
  toPayload() {
    if (!this._privateKey)
      throw new Error("Private key not available");
    const payload = {
      type: "private-key",
      payload: this.privateKey
    };
    return JSON.stringify(payload);
  }
  static async fromPayload(payloadString, ndk) {
    const payload = JSON.parse(payloadString);
    if (payload.type !== "private-key") {
      throw new Error(`Invalid payload type: expected 'private-key', got ${payload.type}`);
    }
    if (!payload.payload || typeof payload.payload !== "string") {
      throw new Error("Invalid payload content for private-key signer");
    }
    return new _NDKPrivateKeySigner(payload.payload, ndk);
  }
};
registerSigner("private-key", NDKPrivateKeySigner);
function dedup(event1, event2) {
  if (event1.created_at > event2.created_at) {
    return event1;
  }
  return event2;
}
async function getRelayListForUser(pubkey, ndk) {
  const list = await getRelayListForUsers([pubkey], ndk);
  return list.get(pubkey);
}
async function getRelayListForUsers(pubkeys, ndk, skipCache = false, timeout = 1000, relayHints) {
  const pool = ndk.outboxPool || ndk.pool;
  const set = /* @__PURE__ */ new Set;
  for (const relay of pool.relays.values())
    set.add(relay);
  if (relayHints) {
    for (const hints of relayHints.values()) {
      for (const url of hints) {
        const relay = pool.getRelay(url, true, true);
        if (relay)
          set.add(relay);
      }
    }
  }
  const relayLists = /* @__PURE__ */ new Map;
  const fromContactList = /* @__PURE__ */ new Map;
  const relaySet = new NDKRelaySet(set, ndk);
  if (ndk.cacheAdapter?.locking && !skipCache) {
    const cachedList = await ndk.fetchEvents({ kinds: [3, 10002], authors: Array.from(new Set(pubkeys)) }, { cacheUsage: "ONLY_CACHE", subId: "ndk-relay-list-fetch" });
    for (const relayList of cachedList) {
      if (relayList.kind === 10002)
        relayLists.set(relayList.pubkey, NDKRelayList.from(relayList));
    }
    for (const relayList of cachedList) {
      if (relayList.kind === 3) {
        if (relayLists.has(relayList.pubkey))
          continue;
        const list = relayListFromKind3(ndk, relayList);
        if (list)
          fromContactList.set(relayList.pubkey, list);
      }
    }
    pubkeys = pubkeys.filter((pubkey) => !relayLists.has(pubkey) && !fromContactList.has(pubkey));
  }
  if (pubkeys.length === 0)
    return relayLists;
  const relayListEvents = /* @__PURE__ */ new Map;
  const contactListEvents = /* @__PURE__ */ new Map;
  return new Promise((resolve) => {
    let resolved = false;
    const handleSubscription = async () => {
      const subscribeOpts = {
        closeOnEose: true,
        pool,
        groupable: true,
        subId: "ndk-relay-list-fetch",
        addSinceFromCache: true,
        relaySet
      };
      if (relaySet)
        subscribeOpts.relaySet = relaySet;
      const sub = ndk.subscribe({ kinds: [3, 10002], authors: pubkeys }, subscribeOpts, {
        onEvent: (event) => {
          if (event.kind === 10002) {
            const existingEvent = relayListEvents.get(event.pubkey);
            if (existingEvent && existingEvent.created_at > event.created_at)
              return;
            relayListEvents.set(event.pubkey, event);
          } else if (event.kind === 3) {
            const existingEvent = contactListEvents.get(event.pubkey);
            if (existingEvent && existingEvent.created_at > event.created_at)
              return;
            contactListEvents.set(event.pubkey, event);
          }
        },
        onEose: () => {
          if (resolved)
            return;
          resolved = true;
          ndk.debug(`[getRelayListForUsers] EOSE - relayListEvents: ${relayListEvents.size}, contactListEvents: ${contactListEvents.size}`);
          for (const event of relayListEvents.values()) {
            relayLists.set(event.pubkey, NDKRelayList.from(event));
          }
          for (const pubkey of pubkeys) {
            if (relayLists.has(pubkey))
              continue;
            const contactList = contactListEvents.get(pubkey);
            if (!contactList)
              continue;
            const list = relayListFromKind3(ndk, contactList);
            if (list)
              relayLists.set(pubkey, list);
          }
          ndk.debug(`[getRelayListForUsers] Returning ${relayLists.size} relay lists for ${pubkeys.length} pubkeys`);
          resolve(relayLists);
        }
      });
      const hasDisconnectedRelays = Array.from(set).some((relay) => relay.status <= 2);
      const hasConnectingRelays = Array.from(set).some((relay) => relay.status === 4);
      let effectiveTimeout = timeout;
      if (hasDisconnectedRelays || hasConnectingRelays) {
        effectiveTimeout = timeout + 3000;
      }
      ndk.debug(`[getRelayListForUsers] Setting fallback timeout to ${effectiveTimeout}ms (disconnected: ${hasDisconnectedRelays}, connecting: ${hasConnectingRelays})`, { pubkeys });
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ndk.debug(`[getRelayListForUsers] Timeout reached, returning ${relayLists.size} relay lists`);
          resolve(relayLists);
        }
      }, effectiveTimeout);
    };
    handleSubscription();
  });
}
var OutboxItem = class {
  type;
  relayUrlScores;
  readRelays;
  writeRelays;
  constructor(type) {
    this.type = type;
    this.relayUrlScores = /* @__PURE__ */ new Map;
    this.readRelays = /* @__PURE__ */ new Set;
    this.writeRelays = /* @__PURE__ */ new Set;
  }
};
var OutboxTracker = class extends import_tseep6.EventEmitter {
  data;
  ndk;
  debug;
  constructor(ndk) {
    super();
    this.ndk = ndk;
    this.debug = ndk.debug.extend("outbox-tracker");
    this.data = new import_typescript_lru_cache2.LRUCache({
      maxSize: 1e5,
      entryExpirationTimeInMS: 2 * 60 * 1000
    });
  }
  async trackUsers(items, skipCache = false) {
    const promises = [];
    for (let i2 = 0;i2 < items.length; i2 += 400) {
      const slice = items.slice(i2, i2 + 400);
      const pubkeys = slice.map((item) => getKeyFromItem(item)).filter((pubkey) => !this.data.has(pubkey));
      if (pubkeys.length === 0)
        continue;
      for (const pubkey of pubkeys) {
        this.data.set(pubkey, new OutboxItem("user"));
      }
      const relayHints = /* @__PURE__ */ new Map;
      for (const item of slice) {
        if (item instanceof NDKUser && item.relayUrls.length > 0) {
          relayHints.set(item.pubkey, item.relayUrls);
        }
      }
      promises.push(new Promise((resolve) => {
        getRelayListForUsers(pubkeys, this.ndk, skipCache, 1000, relayHints).then((relayLists) => {
          this.debug(`Received relay lists for ${relayLists.size} pubkeys out of ${pubkeys.length} requested`);
          for (const [pubkey, relayList] of relayLists) {
            let outboxItem = this.data.get(pubkey);
            outboxItem ??= new OutboxItem("user");
            if (relayList) {
              outboxItem.readRelays = new Set(normalize2(relayList.readRelayUrls));
              outboxItem.writeRelays = new Set(normalize2(relayList.writeRelayUrls));
              if (this.ndk.relayConnectionFilter) {
                for (const relayUrl of outboxItem.readRelays) {
                  if (!this.ndk.relayConnectionFilter(relayUrl)) {
                    outboxItem.readRelays.delete(relayUrl);
                  }
                }
                for (const relayUrl of outboxItem.writeRelays) {
                  if (!this.ndk.relayConnectionFilter(relayUrl)) {
                    outboxItem.writeRelays.delete(relayUrl);
                  }
                }
              }
              this.data.set(pubkey, outboxItem);
              this.emit("user:relay-list-updated", pubkey, outboxItem);
              this.debug(`Adding ${outboxItem.readRelays.size} read relays and ${outboxItem.writeRelays.size} write relays for ${pubkey}`, relayList?.rawEvent());
            }
          }
        }).finally(resolve);
      }));
    }
    return Promise.all(promises);
  }
  track(item, type, _skipCache = true) {
    const key = getKeyFromItem(item);
    type ??= getTypeFromItem(item);
    let outboxItem = this.data.get(key);
    if (!outboxItem) {
      outboxItem = new OutboxItem(type);
      if (item instanceof NDKUser) {
        this.trackUsers([item]);
      }
    }
    return outboxItem;
  }
};
function getKeyFromItem(item) {
  if (item instanceof NDKUser) {
    return item.pubkey;
  }
  return item;
}
function getTypeFromItem(item) {
  if (item instanceof NDKUser) {
    return "user";
  }
  return "kind";
}
function correctRelaySet(relaySet, pool) {
  const connectedRelays = pool.connectedRelays();
  const includesConnectedRelay = Array.from(relaySet.relays).some((relay) => {
    return connectedRelays.map((r) => r.url).includes(relay.url);
  });
  if (!includesConnectedRelay) {
    for (const relay of connectedRelays) {
      relaySet.addRelay(relay);
    }
  }
  if (connectedRelays.length === 0) {
    for (const relay of pool.relays.values()) {
      relaySet.addRelay(relay);
    }
  }
  return relaySet;
}
var NDKSubscriptionManager = class {
  subscriptions;
  seenEvents = new import_typescript_lru_cache3.LRUCache({
    maxSize: 1e4,
    entryExpirationTimeInMS: 5 * 60 * 1000
  });
  constructor() {
    this.subscriptions = /* @__PURE__ */ new Map;
  }
  add(sub) {
    this.subscriptions.set(sub.internalId, sub);
    if (sub.onStopped) {}
    sub.onStopped = () => {
      this.subscriptions.delete(sub.internalId);
    };
    sub.on("close", () => {
      this.subscriptions.delete(sub.internalId);
    });
  }
  seenEvent(eventId, relay) {
    const current = this.seenEvents.get(eventId) || [];
    if (!current.some((r) => r.url === relay.url)) {
      current.push(relay);
    }
    this.seenEvents.set(eventId, current);
  }
  dispatchEvent(event, relay, optimisticPublish = false) {
    if (relay)
      this.seenEvent(event.id, relay);
    const subscriptions = this.subscriptions.values();
    const matchingSubs = [];
    for (const sub of subscriptions) {
      if (matchFilters(sub.filters, event)) {
        matchingSubs.push(sub);
      }
    }
    for (const sub of matchingSubs) {
      if (sub.exclusiveRelay && sub.relaySet) {
        let shouldAccept = false;
        if (optimisticPublish) {
          shouldAccept = !sub.skipOptimisticPublishEvent;
        } else if (!relay) {
          const eventOnRelays = this.seenEvents.get(event.id) || [];
          shouldAccept = eventOnRelays.some((r) => sub.relaySet.relays.has(r));
        } else {
          shouldAccept = sub.relaySet.relays.has(relay);
        }
        if (!shouldAccept) {
          sub.debug.extend("exclusive-relay")("Rejected event %s from %s (relay not in exclusive set)", event.id, relay?.url || (optimisticPublish ? "optimistic" : "cache"));
          continue;
        }
      }
      sub.eventReceived(event, relay, false, optimisticPublish);
    }
  }
};
var debug6 = import_debug8.default("ndk:active-user");
async function getUserRelayList(user) {
  if (!this.autoConnectUserRelays)
    return;
  const userRelays = await getRelayListForUser(user.pubkey, this);
  if (!userRelays)
    return;
  for (const url of userRelays.relays) {
    let relay = this.pool.relays.get(url);
    if (!relay) {
      relay = new NDKRelay(url, this.relayAuthDefaultPolicy, this);
      this.pool.addRelay(relay);
    }
  }
  debug6("Connected to %d user relays", userRelays.relays.length);
  return userRelays;
}
async function setActiveUser(user) {
  if (!this.autoConnectUserRelays)
    return;
  const pool = this.outboxPool || this.pool;
  if (pool.connectedRelays.length > 0) {
    await getUserRelayList.call(this, user);
  } else {
    pool.once("connect", async () => {
      await getUserRelayList.call(this, user);
    });
  }
}
function getEntity(entity) {
  try {
    const decoded = nip19_exports.decode(entity);
    if (decoded.type === "npub")
      return npub(this, decoded.data);
    if (decoded.type === "nprofile")
      return nprofile(this, decoded.data);
    return decoded;
  } catch (_e) {
    return null;
  }
}
function npub(ndk, pubkey) {
  return ndk.getUser({ pubkey });
}
function nprofile(ndk, profile) {
  const user = ndk.getUser({ pubkey: profile.pubkey });
  if (profile.relays)
    user.relayUrls = profile.relays;
  return user;
}
function isValidHint(hint) {
  if (!hint || hint === "")
    return false;
  try {
    new URL(hint);
    return true;
  } catch (_e) {
    return false;
  }
}
async function fetchEventFromTag(tag, originalEvent, subOpts, fallback = {
  type: "timeout"
}) {
  const d4 = this.debug.extend("fetch-event-from-tag");
  const [_, id, hint] = tag;
  subOpts = {};
  d4("fetching event from tag", tag, subOpts, fallback);
  const authorRelays = getRelaysForSync(this, originalEvent.pubkey);
  if (authorRelays && authorRelays.size > 0) {
    d4("fetching event from author relays %o", Array.from(authorRelays));
    const relaySet2 = NDKRelaySet.fromRelayUrls(Array.from(authorRelays), this);
    const event2 = await this.fetchEvent(id, subOpts, relaySet2);
    if (event2)
      return event2;
  } else {
    d4("no author relays found for %s", originalEvent.pubkey, originalEvent);
  }
  const relaySet = calculateRelaySetsFromFilters(this, [{ ids: [id] }], this.pool);
  d4("fetching event without relay hint", relaySet);
  const event = await this.fetchEvent(id, subOpts);
  if (event)
    return event;
  if (hint && hint !== "") {
    const event2 = await this.fetchEvent(id, subOpts, this.pool.getRelay(hint, true, true, [{ ids: [id] }]));
    if (event2)
      return event2;
  }
  let result;
  const relay = isValidHint(hint) ? this.pool.getRelay(hint, false, true, [{ ids: [id] }]) : undefined;
  const fetchMaybeWithRelayHint = new Promise((resolve) => {
    this.fetchEvent(id, subOpts, relay).then(resolve);
  });
  if (!isValidHint(hint) || fallback.type === "none") {
    return fetchMaybeWithRelayHint;
  }
  const fallbackFetchPromise = new Promise(async (resolve) => {
    const fallbackRelaySet = fallback.relaySet;
    const timeout = fallback.timeout ?? 1500;
    const timeoutPromise = new Promise((resolve2) => setTimeout(resolve2, timeout));
    if (fallback.type === "timeout")
      await timeoutPromise;
    if (result) {
      resolve(result);
    } else {
      d4("fallback fetch triggered");
      const fallbackEvent = await this.fetchEvent(id, subOpts, fallbackRelaySet);
      resolve(fallbackEvent);
    }
  });
  switch (fallback.type) {
    case "timeout":
      return Promise.race([fetchMaybeWithRelayHint, fallbackFetchPromise]);
    case "eose":
      result = await fetchMaybeWithRelayHint;
      if (result)
        return result;
      return fallbackFetchPromise;
  }
}
var Queue2 = class {
  queue = [];
  maxConcurrency;
  processing = /* @__PURE__ */ new Set;
  promises = /* @__PURE__ */ new Map;
  constructor(_name, maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
  }
  add(item) {
    if (this.promises.has(item.id)) {
      return this.promises.get(item.id);
    }
    const promise = new Promise((resolve, reject) => {
      this.queue.push({
        ...item,
        func: () => item.func().then((result) => {
          resolve(result);
          return result;
        }, (error) => {
          reject(error);
          throw error;
        })
      });
      this.process();
    });
    this.promises.set(item.id, promise);
    promise.finally(() => {
      this.promises.delete(item.id);
      this.processing.delete(item.id);
      this.process();
    });
    return promise;
  }
  process() {
    if (this.processing.size >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    const item = this.queue.shift();
    if (!item || this.processing.has(item.id)) {
      return;
    }
    this.processing.add(item.id);
    item.func();
  }
  clear() {
    this.queue = [];
  }
  clearProcessing() {
    this.processing.clear();
  }
  clearAll() {
    this.clear();
    this.clearProcessing();
  }
  length() {
    return this.queue.length;
  }
};
var DEFAULT_OUTBOX_RELAYS = ["wss://purplepag.es/", "wss://nos.lol/"];
var NDK = class extends import_tseep5.EventEmitter {
  _explicitRelayUrls;
  pool;
  outboxPool;
  _signer;
  _activeUser;
  cacheAdapter;
  debug;
  devWriteRelaySet;
  outboxTracker;
  muteFilter;
  relayConnectionFilter;
  clientName;
  clientNip89;
  queuesZapConfig;
  queuesNip05;
  asyncSigVerification = false;
  initialValidationRatio = 1;
  lowestValidationRatio = 0.1;
  validationRatioFn;
  filterValidationMode = "validate";
  subManager;
  aiGuardrails;
  futureTimestampGrace;
  _signatureVerificationFunction;
  _signatureVerificationWorker;
  signatureVerificationTimeMs = 0;
  publishingFailureHandled = false;
  pools = [];
  relayAuthDefaultPolicy;
  httpFetch;
  netDebug;
  autoConnectUserRelays = true;
  _wallet;
  walletConfig;
  constructor(opts = {}) {
    super();
    this.debug = opts.debug || import_debug7.default("ndk");
    this.netDebug = opts.netDebug;
    this._explicitRelayUrls = opts.explicitRelayUrls || [];
    this.subManager = new NDKSubscriptionManager;
    this.pool = new NDKPool(opts.explicitRelayUrls || [], this);
    this.pool.name = "Main";
    this.pool.on("relay:auth", async (relay, challenge3) => {
      if (this.relayAuthDefaultPolicy) {
        await this.relayAuthDefaultPolicy(relay, challenge3);
      }
    });
    this.autoConnectUserRelays = opts.autoConnectUserRelays ?? true;
    this.clientName = opts.clientName;
    this.clientNip89 = opts.clientNip89;
    this.relayAuthDefaultPolicy = opts.relayAuthDefaultPolicy;
    if (!(opts.enableOutboxModel === false)) {
      this.outboxPool = new NDKPool(opts.outboxRelayUrls || DEFAULT_OUTBOX_RELAYS, this, {
        debug: this.debug.extend("outbox-pool"),
        name: "Outbox Pool"
      });
      this.outboxTracker = new OutboxTracker(this);
      this.outboxTracker.on("user:relay-list-updated", (pubkey, _outboxItem) => {
        this.debug(`Outbox relay list updated for ${pubkey}`);
        for (const subscription of this.subManager.subscriptions.values()) {
          const isRelevant = subscription.filters.some((filter) => filter.authors?.includes(pubkey));
          if (isRelevant && typeof subscription.refreshRelayConnections === "function") {
            this.debug(`Refreshing relay connections for subscription ${subscription.internalId}`);
            subscription.refreshRelayConnections();
          }
        }
      });
    }
    this.signer = opts.signer;
    this.cacheAdapter = opts.cacheAdapter;
    this.muteFilter = opts.muteFilter;
    this.relayConnectionFilter = opts.relayConnectionFilter;
    if (opts.devWriteRelayUrls) {
      this.devWriteRelaySet = NDKRelaySet.fromRelayUrls(opts.devWriteRelayUrls, this);
    }
    this.queuesZapConfig = new Queue2("zaps", 3);
    this.queuesNip05 = new Queue2("nip05", 10);
    if (opts.signatureVerificationWorker) {
      this.signatureVerificationWorker = opts.signatureVerificationWorker;
    }
    if (opts.signatureVerificationFunction) {
      this.signatureVerificationFunction = opts.signatureVerificationFunction;
    }
    this.initialValidationRatio = opts.initialValidationRatio || 1;
    this.lowestValidationRatio = opts.lowestValidationRatio || 0.1;
    this.validationRatioFn = opts.validationRatioFn || this.defaultValidationRatioFn;
    this.filterValidationMode = opts.filterValidationMode || "validate";
    this.aiGuardrails = new AIGuardrails(opts.aiGuardrails || false);
    this.futureTimestampGrace = opts.futureTimestampGrace;
    this.aiGuardrails.ndkInstantiated(this);
    try {
      this.httpFetch = fetch;
    } catch {}
  }
  set explicitRelayUrls(urls) {
    this._explicitRelayUrls = urls.map(normalizeRelayUrl);
    this.pool.relayUrls = urls;
  }
  get explicitRelayUrls() {
    return this._explicitRelayUrls || [];
  }
  set signatureVerificationWorker(worker2) {
    this._signatureVerificationWorker = worker2;
    if (worker2) {
      signatureVerificationInit(worker2);
      this.asyncSigVerification = true;
    } else {
      this.asyncSigVerification = false;
    }
  }
  set signatureVerificationFunction(fn) {
    this._signatureVerificationFunction = fn;
    this.asyncSigVerification = !!fn;
  }
  get signatureVerificationFunction() {
    return this._signatureVerificationFunction;
  }
  addExplicitRelay(urlOrRelay, relayAuthPolicy, connect = true) {
    let relay;
    if (typeof urlOrRelay === "string") {
      relay = new NDKRelay(urlOrRelay, relayAuthPolicy, this);
    } else {
      relay = urlOrRelay;
    }
    this.pool.addRelay(relay, connect);
    this.explicitRelayUrls?.push(relay.url);
    return relay;
  }
  toJSON() {
    return { relayCount: this.pool.relays.size }.toString();
  }
  get activeUser() {
    return this._activeUser;
  }
  set activeUser(user) {
    const differentUser = this._activeUser?.pubkey !== user?.pubkey;
    this._activeUser = user;
    if (differentUser) {
      this.emit("activeUser:change", user);
    }
    if (user && differentUser) {
      setActiveUser.call(this, user);
    }
  }
  get signer() {
    return this._signer;
  }
  set signer(newSigner) {
    this._signer = newSigner;
    if (newSigner)
      this.emit("signer:ready", newSigner);
    newSigner?.user().then((user) => {
      user.ndk = this;
      this.activeUser = user;
    });
  }
  async connect(timeoutMs) {
    if (this._signer && this.autoConnectUserRelays) {
      this.debug("Attempting to connect to user relays specified by signer %o", await this._signer.relays?.(this));
      if (this._signer.relays) {
        const relays = await this._signer.relays(this);
        relays.forEach((relay) => this.pool.addRelay(relay));
      }
    }
    const connections = [this.pool.connect(timeoutMs)];
    if (this.outboxPool) {
      connections.push(this.outboxPool.connect(timeoutMs));
    }
    if (this.cacheAdapter?.initializeAsync) {
      connections.push(this.cacheAdapter.initializeAsync(this));
    }
    return Promise.allSettled(connections).then(() => {});
  }
  reportInvalidSignature(event, relay) {
    this.debug(`Invalid signature detected for event ${event.id}${relay ? ` from relay ${relay.url}` : ""}`);
    this.emit("event:invalid-sig", event, relay);
  }
  defaultValidationRatioFn(_relay, validatedCount, _nonValidatedCount) {
    if (validatedCount < 10)
      return this.initialValidationRatio;
    const trustFactor = Math.min(validatedCount / 100, 1);
    const calculatedRatio = this.initialValidationRatio * (1 - trustFactor) + this.lowestValidationRatio * trustFactor;
    return Math.max(calculatedRatio, this.lowestValidationRatio);
  }
  getUser(opts) {
    if (typeof opts === "string") {
      if (opts.startsWith("npub1")) {
        const { type, data } = nip19_exports.decode(opts);
        if (type !== "npub")
          throw new Error(`Invalid npub: ${opts}`);
        return this.getUser({ pubkey: data });
      } else if (opts.startsWith("nprofile1")) {
        const { type, data } = nip19_exports.decode(opts);
        if (type !== "nprofile")
          throw new Error(`Invalid nprofile: ${opts}`);
        return this.getUser({
          pubkey: data.pubkey,
          relayUrls: data.relays
        });
      } else {
        return this.getUser({ pubkey: opts });
      }
    }
    const user = new NDKUser(opts);
    user.ndk = this;
    return user;
  }
  async getUserFromNip05(nip05, skipCache = false) {
    return NDKUser.fromNip05(nip05, this, skipCache);
  }
  async fetchUser(input, skipCache = false) {
    if (isValidNip05(input)) {
      return NDKUser.fromNip05(input, this, skipCache);
    } else if (input.startsWith("npub1")) {
      const { type, data } = nip19_exports.decode(input);
      if (type !== "npub")
        throw new Error(`Invalid npub: ${input}`);
      const user = new NDKUser({ pubkey: data });
      user.ndk = this;
      return user;
    } else if (input.startsWith("nprofile1")) {
      const { type, data } = nip19_exports.decode(input);
      if (type !== "nprofile")
        throw new Error(`Invalid nprofile: ${input}`);
      const user = new NDKUser({
        pubkey: data.pubkey,
        relayUrls: data.relays
      });
      user.ndk = this;
      return user;
    } else {
      const user = new NDKUser({ pubkey: input });
      user.ndk = this;
      return user;
    }
  }
  subscribe(filters, opts, autoStartOrRelaySet = true, _autoStart = true) {
    let _relaySet = opts?.relaySet;
    let autoStart = _autoStart;
    if (autoStartOrRelaySet instanceof NDKRelaySet) {
      console.warn("relaySet is deprecated, use opts.relaySet instead. This will be removed in version v2.14.0");
      _relaySet = autoStartOrRelaySet;
      autoStart = _autoStart;
    } else if (typeof autoStartOrRelaySet === "boolean" || typeof autoStartOrRelaySet === "object") {
      autoStart = autoStartOrRelaySet;
    }
    const finalOpts = { relaySet: _relaySet, ...opts };
    if (autoStart && typeof autoStart === "object") {
      if (autoStart.onEvent)
        finalOpts.onEvent = autoStart.onEvent;
      if (autoStart.onEose)
        finalOpts.onEose = autoStart.onEose;
      if (autoStart.onClose)
        finalOpts.onClose = autoStart.onClose;
      if (autoStart.onEvents)
        finalOpts.onEvents = autoStart.onEvents;
    }
    const subscription = new NDKSubscription(this, filters, finalOpts);
    this.subManager.add(subscription);
    this.aiGuardrails?.subscription?.created(Array.isArray(filters) ? filters : [filters], finalOpts);
    const pool = subscription.pool;
    if (subscription.relaySet) {
      for (const relay of subscription.relaySet.relays) {
        pool.useTemporaryRelay(relay, undefined, subscription.filters);
      }
    }
    if (this.outboxPool && subscription.hasAuthorsFilter()) {
      const authors = subscription.filters.filter((filter) => filter.authors && filter.authors?.length > 0).flatMap((filter) => filter.authors);
      this.outboxTracker?.trackUsers(authors);
    }
    if (autoStart) {
      setTimeout(async () => {
        if (this.cacheAdapter?.initializeAsync && !this.cacheAdapter.ready) {
          await this.cacheAdapter.initializeAsync(this);
        }
        subscription.start();
      }, 0);
    }
    return subscription;
  }
  fetchEventFromTag = fetchEventFromTag.bind(this);
  fetchEventSync(idOrFilter) {
    if (!this.cacheAdapter)
      throw new Error("Cache adapter not set");
    let filters;
    if (typeof idOrFilter === "string")
      filters = [filterFromId(idOrFilter)];
    else
      filters = idOrFilter;
    const sub = new NDKSubscription(this, filters);
    const events = this.cacheAdapter.query(sub);
    if (events instanceof Promise)
      throw new Error("Cache adapter is async");
    return events.map((e) => {
      e.ndk = this;
      return e;
    });
  }
  async fetchEvent(idOrFilter, opts, relaySetOrRelay) {
    let filters;
    let relaySet;
    if (relaySetOrRelay instanceof NDKRelay) {
      relaySet = new NDKRelaySet(/* @__PURE__ */ new Set([relaySetOrRelay]), this);
    } else if (relaySetOrRelay instanceof NDKRelaySet) {
      relaySet = relaySetOrRelay;
    }
    if (!relaySetOrRelay && typeof idOrFilter === "string") {
      if (!isNip33AValue(idOrFilter)) {
        const relays = relaysFromBech32(idOrFilter, this);
        if (relays.length > 0) {
          relaySet = new NDKRelaySet(new Set(relays), this);
          relaySet = correctRelaySet(relaySet, this.pool);
        }
      }
    }
    if (typeof idOrFilter === "string") {
      filters = [filterFromId(idOrFilter)];
    } else if (Array.isArray(idOrFilter)) {
      filters = idOrFilter;
    } else {
      filters = [idOrFilter];
    }
    if (typeof idOrFilter !== "string") {
      this.aiGuardrails?.ndk?.fetchingEvents(filters);
    }
    if (filters.length === 0) {
      throw new Error(`Invalid filter: ${JSON.stringify(idOrFilter)}`);
    }
    return new Promise((resolve, reject) => {
      let fetchedEvent = null;
      const processEvent = (event) => {
        event.ndk = this;
        if (!event.isReplaceable()) {
          clearTimeout(t2);
          s?.stop();
          this.aiGuardrails["_nextCallDisabled"] = null;
          resolve(event);
        } else if (!fetchedEvent || fetchedEvent.created_at < event.created_at) {
          fetchedEvent = event;
        }
      };
      const subscribeOpts = {
        ...opts || {},
        closeOnEose: true,
        onEvents: (cachedEvents) => {
          for (const event of cachedEvents) {
            processEvent(event);
          }
        },
        onEvent: (event) => {
          processEvent(event);
        },
        onEose: () => {
          clearTimeout(t2);
          this.aiGuardrails["_nextCallDisabled"] = null;
          resolve(fetchedEvent);
        }
      };
      if (relaySet)
        subscribeOpts.relaySet = relaySet;
      let s;
      const t2 = setTimeout(() => {
        s?.stop();
        this.aiGuardrails["_nextCallDisabled"] = null;
        resolve(fetchedEvent);
      }, 1e4);
      s = this.subscribe(filters, subscribeOpts);
    });
  }
  async fetchEvents(filters, opts, relaySet) {
    this.aiGuardrails?.ndk?.fetchingEvents(filters, opts);
    return new Promise((resolve) => {
      const events = /* @__PURE__ */ new Map;
      const processEvent = (event) => {
        let _event;
        if (!(event instanceof NDKEvent))
          _event = new NDKEvent(undefined, event);
        else
          _event = event;
        const dedupKey = _event.deduplicationKey();
        const existingEvent = events.get(dedupKey);
        if (existingEvent) {
          _event = dedup(existingEvent, _event);
        }
        _event.ndk = this;
        events.set(dedupKey, _event);
      };
      const subscribeOpts = {
        ...opts || {},
        closeOnEose: true,
        onEvents: (cachedEvents) => {
          for (const event of cachedEvents) {
            processEvent(event);
          }
        },
        onEvent: processEvent,
        onEose: () => {
          this.aiGuardrails["_nextCallDisabled"] = null;
          resolve(new Set(events.values()));
        }
      };
      if (relaySet)
        subscribeOpts.relaySet = relaySet;
      const _relaySetSubscription = this.subscribe(filters, subscribeOpts);
    });
  }
  async count(filters, opts = {}, relaySet) {
    const effectiveRelaySet = relaySet ?? NDKRelaySet.fromRelayUrls(Array.from(this.pool.relays.keys()), this, false);
    return effectiveRelaySet.count(filters, opts);
  }
  assertSigner() {
    if (!this.signer) {
      this.emit("signer:required");
      throw new Error("Signer required");
    }
  }
  getEntity = getEntity.bind(this);
  guardrailOff(ids) {
    if (!ids) {
      this.aiGuardrails["_nextCallDisabled"] = "all";
    } else if (typeof ids === "string") {
      this.aiGuardrails["_nextCallDisabled"] = /* @__PURE__ */ new Set([ids]);
    } else {
      this.aiGuardrails["_nextCallDisabled"] = new Set(ids);
    }
    return this;
  }
  set wallet(wallet) {
    if (!wallet) {
      this._wallet = undefined;
      this.walletConfig = undefined;
      return;
    }
    this._wallet = wallet;
    this.walletConfig ??= {};
    this.walletConfig.lnPay = wallet?.lnPay?.bind(wallet);
    this.walletConfig.cashuPay = wallet?.cashuPay?.bind(wallet);
  }
  get wallet() {
    return this._wallet;
  }
};
var nip19_exports2 = {};
__reExport(nip19_exports2, exports_nip19);
var nip49_exports = {};
__reExport(nip49_exports, exports_nip49);
function disconnect(pool, debug9) {
  debug9 ??= import_debug9.default("ndk:relay:auth-policies:disconnect");
  return async (relay) => {
    debug9?.(`Relay ${relay.url} requested authentication, disconnecting`);
    pool.removeRelay(relay.url);
  };
}
async function signAndAuth(event, relay, signer, debug9, resolve, reject) {
  try {
    await event.sign(signer);
    resolve(event);
  } catch (e) {
    debug9?.(`Failed to publish auth event to relay ${relay.url}`, e);
    reject(event);
  }
}
function signIn({ ndk, signer, debug: debug9 } = {}) {
  debug9 ??= import_debug9.default("ndk:auth-policies:signIn");
  return async (relay, challenge3) => {
    debug9?.(`Relay ${relay.url} requested authentication, signing in`);
    const event = new NDKEvent(ndk);
    event.kind = 22242;
    event.tags = [
      ["relay", relay.url],
      ["challenge", challenge3]
    ];
    signer ??= ndk?.signer;
    return new Promise(async (resolve, reject) => {
      if (signer) {
        await signAndAuth(event, relay, signer, debug9, resolve, reject);
      } else {
        ndk?.once("signer:ready", async (signer2) => {
          await signAndAuth(event, relay, signer2, debug9, resolve, reject);
        });
      }
    });
  };
}
var NDKRelayAuthPolicies = {
  disconnect,
  signIn
};
async function ndkSignerFromPayload(payloadString, ndk) {
  let parsed;
  try {
    parsed = JSON.parse(payloadString);
  } catch (e) {
    console.error("Failed to parse signer payload string", payloadString, e);
    return;
  }
  if (!parsed || typeof parsed.type !== "string") {
    console.error("Failed to parse signer payload string", payloadString, new Error("Missing type field"));
    return;
  }
  const SignerClass = signerRegistry.get(parsed.type);
  if (!SignerClass) {
    throw new Error(`Unknown signer type: ${parsed.type}`);
  }
  try {
    return await SignerClass.fromPayload(payloadString, ndk);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to deserialize signer type ${parsed.type}: ${errorMsg}`);
  }
}
var NDKNip07Signer = class _NDKNip07Signer {
  _userPromise;
  encryptionQueue = [];
  encryptionProcessing = false;
  debug;
  waitTimeout;
  _pubkey;
  ndk;
  _user;
  constructor(waitTimeout = 1000, ndk) {
    this.debug = import_debug10.default("ndk:nip07");
    this.waitTimeout = waitTimeout;
    this.ndk = ndk;
  }
  get pubkey() {
    if (!this._pubkey)
      throw new Error("Not ready");
    return this._pubkey;
  }
  async blockUntilReady() {
    await this.waitForExtension();
    const pubkey = await window.nostr?.getPublicKey();
    if (!pubkey) {
      throw new Error("User rejected access");
    }
    this._pubkey = pubkey;
    let user;
    if (this.ndk)
      user = this.ndk.getUser({ pubkey });
    else
      user = new NDKUser({ pubkey });
    this._user = user;
    return user;
  }
  async user() {
    if (!this._userPromise) {
      this._userPromise = this.blockUntilReady();
    }
    return this._userPromise;
  }
  get userSync() {
    if (!this._user)
      throw new Error("User not ready");
    return this._user;
  }
  async sign(event) {
    await this.waitForExtension();
    const signedEvent = await window.nostr?.signEvent(event);
    if (!signedEvent)
      throw new Error("Failed to sign event");
    return signedEvent.sig;
  }
  async relays(ndk) {
    await this.waitForExtension();
    const relays = await window.nostr?.getRelays?.() || {};
    const activeRelays = [];
    for (const url of Object.keys(relays)) {
      if (relays[url].read && relays[url].write) {
        activeRelays.push(url);
      }
    }
    return activeRelays.map((url) => new NDKRelay(url, ndk?.relayAuthDefaultPolicy, ndk));
  }
  async encryptionEnabled(nip) {
    const enabled = [];
    if ((!nip || nip === "nip04") && Boolean(window.nostr?.nip04))
      enabled.push("nip04");
    if ((!nip || nip === "nip44") && Boolean(window.nostr?.nip44))
      enabled.push("nip44");
    return enabled;
  }
  async encrypt(recipient, value, nip = "nip04") {
    if (!await this.encryptionEnabled(nip))
      throw new Error(`${nip}encryption is not available from your browser extension`);
    await this.waitForExtension();
    const recipientHexPubKey = recipient.pubkey;
    return this.queueEncryption(nip, "encrypt", recipientHexPubKey, value);
  }
  async decrypt(sender, value, nip = "nip04") {
    if (!await this.encryptionEnabled(nip))
      throw new Error(`${nip}encryption is not available from your browser extension`);
    await this.waitForExtension();
    const senderHexPubKey = sender.pubkey;
    return this.queueEncryption(nip, "decrypt", senderHexPubKey, value);
  }
  async queueEncryption(scheme, method, counterpartyHexpubkey, value) {
    return new Promise((resolve, reject) => {
      this.encryptionQueue.push({
        scheme,
        method,
        counterpartyHexpubkey,
        value,
        resolve,
        reject
      });
      if (!this.encryptionProcessing) {
        this.processEncryptionQueue();
      }
    });
  }
  async processEncryptionQueue(item, retries = 0) {
    if (!item && this.encryptionQueue.length === 0) {
      this.encryptionProcessing = false;
      return;
    }
    this.encryptionProcessing = true;
    const currentItem = item || this.encryptionQueue.shift();
    if (!currentItem) {
      this.encryptionProcessing = false;
      return;
    }
    const { scheme, method, counterpartyHexpubkey, value, resolve, reject } = currentItem;
    this.debug("Processing encryption queue item", {
      method,
      counterpartyHexpubkey,
      value
    });
    try {
      const result = await window.nostr?.[scheme]?.[method](counterpartyHexpubkey, value);
      if (!result)
        throw new Error("Failed to encrypt/decrypt");
      resolve(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("call already executing") && retries < 5) {
        this.debug("Retrying encryption queue item", {
          method,
          counterpartyHexpubkey,
          value,
          retries
        });
        setTimeout(() => {
          this.processEncryptionQueue(currentItem, retries + 1);
        }, 50 * retries);
        return;
      }
      reject(error instanceof Error ? error : new Error(errorMessage));
    }
    this.processEncryptionQueue();
  }
  waitForExtension() {
    return new Promise((resolve, reject) => {
      if (window.nostr) {
        resolve();
        return;
      }
      let timerId;
      const intervalId = setInterval(() => {
        if (window.nostr) {
          clearTimeout(timerId);
          clearInterval(intervalId);
          resolve();
        }
      }, 100);
      timerId = setTimeout(() => {
        clearInterval(intervalId);
        reject(new Error("NIP-07 extension not available"));
      }, this.waitTimeout);
    });
  }
  toPayload() {
    const payload = {
      type: "nip07",
      payload: ""
    };
    return JSON.stringify(payload);
  }
  static async fromPayload(payloadString, ndk) {
    const payload = JSON.parse(payloadString);
    if (payload.type !== "nip07") {
      throw new Error(`Invalid payload type: expected 'nip07', got ${payload.type}`);
    }
    return new _NDKNip07Signer(undefined, ndk);
  }
};
registerSigner("nip07", NDKNip07Signer);
var NDKNostrRpc = class extends import_tseep7.EventEmitter {
  ndk;
  signer;
  relaySet;
  debug;
  encryptionType = "nip44";
  pool;
  constructor(ndk, signer, debug9, relayUrls) {
    super();
    this.ndk = ndk;
    this.signer = signer;
    if (relayUrls) {
      this.pool = new NDKPool(relayUrls, ndk, {
        debug: debug9.extend("rpc-pool"),
        name: "Nostr RPC"
      });
      this.relaySet = new NDKRelaySet(/* @__PURE__ */ new Set, ndk, this.pool);
      for (const url of relayUrls) {
        const relay = this.pool.getRelay(url, false, false);
        relay.authPolicy = NDKRelayAuthPolicies.signIn({ ndk, signer, debug: debug9 });
        this.relaySet.addRelay(relay);
        relay.connect();
      }
    }
    this.debug = debug9.extend("rpc");
  }
  updateRelays(relayUrls) {
    if (this.pool) {
      for (const relay of this.pool.relays.values()) {
        relay.disconnect();
      }
    }
    this.pool = new NDKPool(relayUrls, this.ndk, {
      debug: this.debug.extend("rpc-pool"),
      name: "Nostr RPC"
    });
    this.relaySet = new NDKRelaySet(/* @__PURE__ */ new Set, this.ndk, this.pool);
    for (const url of relayUrls) {
      const relay = this.pool.getRelay(url, false, false);
      relay.authPolicy = NDKRelayAuthPolicies.signIn({
        ndk: this.ndk,
        signer: this.signer,
        debug: this.debug
      });
      this.relaySet.addRelay(relay);
      relay.connect();
    }
  }
  subscribe(filter) {
    return new Promise((resolve) => {
      const sub = this.ndk.subscribe(filter, {
        closeOnEose: false,
        groupable: false,
        cacheUsage: "ONLY_RELAY",
        pool: this.pool,
        relaySet: this.relaySet,
        onEvent: async (event) => {
          try {
            const parsedEvent = await this.parseEvent(event);
            if (parsedEvent.method) {
              this.emit("request", parsedEvent);
            } else {
              this.emit(`response-${parsedEvent.id}`, parsedEvent);
              this.emit("response", parsedEvent);
            }
          } catch (e) {
            this.debug("error parsing event", e, event.rawEvent());
          }
        },
        onEose: () => {
          this.debug("eosed");
          resolve(sub);
        }
      });
    });
  }
  async parseEvent(event) {
    if (this.encryptionType === "nip44" && event.content.includes("?iv=")) {
      this.encryptionType = "nip04";
    } else if (this.encryptionType === "nip04" && !event.content.includes("?iv=")) {
      this.encryptionType = "nip44";
    }
    const remoteUser = this.ndk.getUser({ pubkey: event.pubkey });
    remoteUser.ndk = this.ndk;
    let decryptedContent;
    try {
      decryptedContent = await this.signer.decrypt(remoteUser, event.content, this.encryptionType);
    } catch (_e) {
      const otherEncryptionType = this.encryptionType === "nip04" ? "nip44" : "nip04";
      decryptedContent = await this.signer.decrypt(remoteUser, event.content, otherEncryptionType);
      this.encryptionType = otherEncryptionType;
    }
    const parsedContent = JSON.parse(decryptedContent);
    const { id, method, params, result, error } = parsedContent;
    if (method) {
      return { id, pubkey: event.pubkey, method, params, event };
    }
    return { id, result, error, event };
  }
  async sendResponse(id, remotePubkey, result, kind = 24133, error) {
    const res = { id, result };
    if (error) {
      res.error = error;
    }
    const localUser = await this.signer.user();
    const remoteUser = this.ndk.getUser({ pubkey: remotePubkey });
    const event = new NDKEvent(this.ndk, {
      kind,
      content: JSON.stringify(res),
      tags: [["p", remotePubkey]],
      pubkey: localUser.pubkey
    });
    event.content = await this.signer.encrypt(remoteUser, event.content, this.encryptionType);
    await event.sign(this.signer);
    await event.publish(this.relaySet);
  }
  async sendRequest(remotePubkey, method, params = [], kind = 24133, cb) {
    const id = Math.random().toString(36).substring(7);
    const localUser = await this.signer.user();
    const remoteUser = this.ndk.getUser({ pubkey: remotePubkey });
    const request = { id, method, params };
    const promise = new Promise(() => {
      const responseHandler = (response) => {
        if (response.result === "auth_url") {
          this.once(`response-${id}`, responseHandler);
          this.emit("authUrl", response.error);
        } else if (cb) {
          cb(response);
        }
      };
      this.once(`response-${id}`, responseHandler);
    });
    const event = new NDKEvent(this.ndk, {
      kind,
      content: JSON.stringify(request),
      tags: [["p", remotePubkey]],
      pubkey: localUser.pubkey
    });
    event.content = await this.signer.encrypt(remoteUser, event.content, this.encryptionType);
    await event.sign(this.signer);
    await event.publish(this.relaySet);
    return promise;
  }
};
var ConnectEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [_, token] = params;
    const debug9 = backend.debug.extend("connect");
    debug9(`connection request from ${remotePubkey}`);
    if (token && backend.applyToken) {
      debug9("applying token");
      await backend.applyToken(remotePubkey, token);
    }
    if (await backend.pubkeyAllowed({
      id,
      pubkey: remotePubkey,
      method: "connect",
      params: token
    })) {
      debug9(`connection request from ${remotePubkey} allowed`);
      return "ack";
    }
    debug9(`connection request from ${remotePubkey} rejected`);
    return;
  }
};
var GetPublicKeyHandlingStrategy = class {
  async handle(backend, _id, _remotePubkey, _params) {
    return backend.localUser?.pubkey;
  }
};
var Nip04DecryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [senderPubkey, payload] = params;
    const senderUser = new NDKUser({ pubkey: senderPubkey });
    const decryptedPayload = await decrypt32(backend, id, remotePubkey, senderUser, payload);
    return decryptedPayload;
  }
};
async function decrypt32(backend, id, remotePubkey, senderUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "nip04_decrypt",
    params: payload
  })) {
    backend.debug(`decrypt request from ${remotePubkey} rejected`);
    return;
  }
  return await backend.signer.decrypt(senderUser, payload, "nip04");
}
var Nip04EncryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [recipientPubkey, payload] = params;
    const recipientUser = new NDKUser({ pubkey: recipientPubkey });
    const encryptedPayload = await encrypt32(backend, id, remotePubkey, recipientUser, payload);
    return encryptedPayload;
  }
};
async function encrypt32(backend, id, remotePubkey, recipientUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "nip04_encrypt",
    params: payload
  })) {
    backend.debug(`encrypt request from ${remotePubkey} rejected`);
    return;
  }
  return await backend.signer.encrypt(recipientUser, payload, "nip04");
}
var Nip44DecryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [senderPubkey, payload] = params;
    const senderUser = new NDKUser({ pubkey: senderPubkey });
    const decryptedPayload = await decrypt42(backend, id, remotePubkey, senderUser, payload);
    return decryptedPayload;
  }
};
async function decrypt42(backend, id, remotePubkey, senderUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "nip44_decrypt",
    params: payload
  })) {
    backend.debug(`decrypt request from ${remotePubkey} rejected`);
    return;
  }
  return await backend.signer.decrypt(senderUser, payload, "nip44");
}
var Nip44EncryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [recipientPubkey, payload] = params;
    const recipientUser = new NDKUser({ pubkey: recipientPubkey });
    const encryptedPayload = await encrypt42(backend, id, remotePubkey, recipientUser, payload);
    return encryptedPayload;
  }
};
async function encrypt42(backend, id, remotePubkey, recipientUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "nip44_encrypt",
    params: payload
  })) {
    backend.debug(`encrypt request from ${remotePubkey} rejected`);
    return;
  }
  return await backend.signer.encrypt(recipientUser, payload, "nip44");
}
var PingEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, _params) {
    const debug9 = backend.debug.extend("ping");
    debug9(`ping request from ${remotePubkey}`);
    if (await backend.pubkeyAllowed({ id, pubkey: remotePubkey, method: "ping" })) {
      debug9(`connection request from ${remotePubkey} allowed`);
      return "pong";
    }
    debug9(`connection request from ${remotePubkey} rejected`);
    return;
  }
};
var SignEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const event = await signEvent(backend, id, remotePubkey, params);
    if (!event)
      return;
    return JSON.stringify(await event.toNostrEvent());
  }
};
async function signEvent(backend, id, remotePubkey, params) {
  const [eventString] = params;
  backend.debug(`sign event request from ${remotePubkey}`);
  const event = new NDKEvent(backend.ndk, JSON.parse(eventString));
  backend.debug("event to sign", event.rawEvent());
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "sign_event",
    params: event
  })) {
    backend.debug(`sign event request from ${remotePubkey} rejected`);
    return;
  }
  backend.debug(`sign event request from ${remotePubkey} allowed`);
  await event.sign(backend.signer);
  return event;
}
var SwitchRelaysEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, _params) {
    const debug9 = backend.debug.extend("switch_relays");
    debug9(`switch_relays request from ${remotePubkey}`);
    if (await backend.pubkeyAllowed({ id, pubkey: remotePubkey, method: "switch_relays" })) {
      debug9(`responding with relays: ${backend.relayUrls.join(", ")}`);
      return JSON.stringify(backend.relayUrls);
    }
    debug9(`switch_relays request from ${remotePubkey} rejected`);
    return;
  }
};
var NDKNip46Backend = class {
  ndk;
  signer;
  localUser;
  debug;
  rpc;
  permitCallback;
  relayUrls;
  constructor(ndk, privateKeyOrSigner, permitCallback, relayUrls) {
    this.ndk = ndk;
    if (privateKeyOrSigner instanceof Uint8Array) {
      this.signer = new NDKPrivateKeySigner(privateKeyOrSigner);
    } else if (privateKeyOrSigner instanceof String) {
      this.signer = new NDKPrivateKeySigner(hexToBytes5(privateKeyOrSigner));
    } else if (privateKeyOrSigner instanceof NDKPrivateKeySigner) {
      this.signer = privateKeyOrSigner;
    } else {
      throw new Error("Invalid signer");
    }
    this.debug = ndk.debug.extend("nip46:backend");
    this.relayUrls = relayUrls ?? Array.from(ndk.pool.relays.keys());
    this.rpc = new NDKNostrRpc(ndk, this.signer, this.debug, this.relayUrls);
    this.permitCallback = permitCallback;
  }
  async start() {
    this.localUser = await this.signer.user();
    this.ndk.subscribe({
      kinds: [24133],
      "#p": [this.localUser.pubkey]
    }, {
      closeOnEose: false,
      onEvent: (e) => this.handleIncomingEvent(e)
    });
  }
  handlers = {
    connect: new ConnectEventHandlingStrategy,
    sign_event: new SignEventHandlingStrategy,
    nip04_encrypt: new Nip04EncryptHandlingStrategy,
    nip04_decrypt: new Nip04DecryptHandlingStrategy,
    nip44_encrypt: new Nip44EncryptHandlingStrategy,
    nip44_decrypt: new Nip44DecryptHandlingStrategy,
    get_public_key: new GetPublicKeyHandlingStrategy,
    ping: new PingEventHandlingStrategy,
    switch_relays: new SwitchRelaysEventHandlingStrategy
  };
  setStrategy(method, strategy) {
    this.handlers[method] = strategy;
  }
  async applyToken(_pubkey, _token) {
    throw new Error("connection token not supported");
  }
  async handleIncomingEvent(event) {
    const { id, method, params } = await this.rpc.parseEvent(event);
    const remotePubkey = event.pubkey;
    let response;
    let errorHandled = false;
    this.debug("incoming event", { id, method, params });
    if (!event.verifySignature(false)) {
      this.debug("invalid signature", event.rawEvent());
      return;
    }
    const strategy = this.handlers[method];
    if (strategy) {
      try {
        response = await strategy.handle(this, id, remotePubkey, params);
      } catch (e) {
        this.debug("error handling event", e, { id, method, params });
        errorHandled = true;
        try {
          await this.rpc.sendResponse(id, remotePubkey, "error", undefined, e.message);
        } catch (sendError) {
          this.debug("failed to send error response", sendError);
        }
      }
    } else {
      this.debug("unsupported method", { method, params });
    }
    if (!errorHandled) {
      try {
        if (response) {
          this.debug(`sending response to ${remotePubkey}`, response);
          await this.rpc.sendResponse(id, remotePubkey, response);
        } else {
          await this.rpc.sendResponse(id, remotePubkey, "error", undefined, "Not authorized");
        }
      } catch (sendError) {
        this.debug("failed to send response", sendError);
      }
    }
    if (method === "switch_relays" && response) {
      this.rpc.updateRelays(this.relayUrls);
    }
  }
  async pubkeyAllowed(params) {
    return this.permitCallback(params);
  }
};
function nostrConnectGenerateSecret() {
  return Math.random().toString(36).substring(2, 15);
}
function generateNostrConnectUri(pubkey, secret, relay, options) {
  const meta = {
    name: options?.name ? encodeURIComponent(options.name) : "",
    url: options?.url ? encodeURIComponent(options.url) : "",
    image: options?.image ? encodeURIComponent(options.image) : "",
    perms: options?.perms ? encodeURIComponent(options.perms) : ""
  };
  let uri = `nostrconnect://${pubkey}?image=${meta.image}&url=${meta.url}&name=${meta.name}&perms=${meta.perms}&secret=${encodeURIComponent(secret)}`;
  if (relay) {
    uri += `&relay=${encodeURIComponent(relay)}`;
  }
  return uri;
}
var NDKNip46Signer = class _NDKNip46Signer extends import_tseep8.EventEmitter {
  ndk;
  _user;
  bunkerPubkey;
  userPubkey;
  get pubkey() {
    if (!this.userPubkey)
      throw new Error("Not ready");
    return this.userPubkey;
  }
  secret;
  localSigner;
  nip05;
  rpc;
  debug;
  relayUrls;
  subscription;
  nostrConnectUri;
  nostrConnectSecret;
  constructor(ndk, userOrConnectionToken, localSigner, relayUrls, nostrConnectOptions) {
    super();
    this.ndk = ndk;
    this.debug = ndk.debug.extend("nip46:signer");
    this.relayUrls = relayUrls;
    if (!localSigner) {
      this.localSigner = NDKPrivateKeySigner.generate();
    } else {
      if (typeof localSigner === "string") {
        this.localSigner = new NDKPrivateKeySigner(localSigner);
      } else {
        this.localSigner = localSigner;
      }
    }
    if (userOrConnectionToken === false) {} else if (!userOrConnectionToken) {
      this.nostrconnectFlowInit(nostrConnectOptions);
    } else if (userOrConnectionToken.startsWith("bunker://")) {
      this.bunkerFlowInit(userOrConnectionToken);
    } else {
      this.nip05Init(userOrConnectionToken);
    }
    this.rpc = new NDKNostrRpc(this.ndk, this.localSigner, this.debug, this.relayUrls);
  }
  static bunker(ndk, userOrConnectionToken, localSigner) {
    return new _NDKNip46Signer(ndk, userOrConnectionToken, localSigner);
  }
  static nostrconnect(ndk, relay, localSigner, nostrConnectOptions) {
    return new _NDKNip46Signer(ndk, undefined, localSigner, [relay], nostrConnectOptions);
  }
  nostrconnectFlowInit(nostrConnectOptions) {
    this.nostrConnectSecret = nostrConnectGenerateSecret();
    const pubkey = this.localSigner.pubkey;
    this.nostrConnectUri = generateNostrConnectUri(pubkey, this.nostrConnectSecret, this.relayUrls?.[0], nostrConnectOptions);
  }
  bunkerFlowInit(connectionToken) {
    const bunkerUrl = new URL(connectionToken);
    const bunkerPubkey = bunkerUrl.hostname || bunkerUrl.pathname.replace(/^\/\//, "");
    const userPubkey = bunkerUrl.searchParams.get("pubkey");
    const relayUrls = bunkerUrl.searchParams.getAll("relay");
    const secret = bunkerUrl.searchParams.get("secret");
    this.bunkerPubkey = bunkerPubkey;
    this.userPubkey = userPubkey;
    this.relayUrls = relayUrls;
    this.secret = secret;
  }
  nip05Init(nip05) {
    this.nip05 = nip05;
  }
  async startListening() {
    if (this.subscription)
      return;
    const localUser = await this.localSigner.user();
    if (!localUser)
      throw new Error("Local signer not ready");
    this.subscription = await this.rpc.subscribe({
      kinds: [24133],
      "#p": [localUser.pubkey]
    });
  }
  async user() {
    if (this._user)
      return this._user;
    return this.blockUntilReady();
  }
  get userSync() {
    if (!this._user)
      throw new Error("Remote user not ready synchronously");
    return this._user;
  }
  async blockUntilReadyNostrConnect() {
    return new Promise((resolve, reject) => {
      const connect = (response) => {
        if (response.result === this.nostrConnectSecret) {
          this.bunkerPubkey = response.event.pubkey;
          this.rpc.off("response", connect);
          this.getPublicKey().then(async (pubkey) => {
            this.userPubkey = pubkey;
            this._user = this.ndk.getUser({ pubkey });
            await this.switchRelays();
            resolve(this._user);
          }).catch(reject);
        }
      };
      this.startListening();
      this.rpc.on("response", connect);
    });
  }
  async blockUntilReady() {
    if (!this.bunkerPubkey && !this.nostrConnectSecret && !this.nip05) {
      throw new Error("Bunker pubkey not set");
    }
    if (this.nostrConnectSecret)
      return this.blockUntilReadyNostrConnect();
    if (this.nip05 && !this.userPubkey) {
      const user = await NDKUser.fromNip05(this.nip05, this.ndk);
      if (user) {
        this._user = user;
        this.userPubkey = user.pubkey;
        this.relayUrls = user.nip46Urls;
        this.rpc = new NDKNostrRpc(this.ndk, this.localSigner, this.debug, this.relayUrls);
      }
    }
    if (!this.bunkerPubkey && this.userPubkey) {
      this.bunkerPubkey = this.userPubkey;
    } else if (!this.bunkerPubkey) {
      throw new Error("Bunker pubkey not set");
    }
    await this.startListening();
    this.rpc.on("authUrl", (...props) => {
      this.emit("authUrl", ...props);
    });
    return new Promise((resolve, reject) => {
      const connectParams = [this.userPubkey ?? ""];
      if (this.secret)
        connectParams.push(this.secret);
      if (!this.bunkerPubkey)
        throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(this.bunkerPubkey, "connect", connectParams, 24133, (response) => {
        if (response.result === "ack") {
          this.getPublicKey().then(async (pubkey) => {
            this.userPubkey = pubkey;
            this._user = this.ndk.getUser({ pubkey });
            await this.switchRelays();
            resolve(this._user);
          });
        } else {
          reject(response.error);
        }
      });
    });
  }
  async switchRelays() {
    if (!this.bunkerPubkey)
      return;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.debug("switch_relays timed out, bunker may not support it");
        resolve();
      }, 5000);
      this.rpc.sendRequest(this.bunkerPubkey, "switch_relays", [], 24133, async (response) => {
        clearTimeout(timeout);
        if (response.error || !response.result || response.result === "null") {
          this.debug("switch_relays: no relay change needed");
          resolve();
          return;
        }
        try {
          const newRelays = JSON.parse(response.result);
          if (Array.isArray(newRelays) && newRelays.length > 0) {
            this.debug("switching relays to %o", newRelays);
            this.relayUrls = newRelays;
            this.rpc.updateRelays(newRelays);
            this.subscription?.stop();
            this.subscription = undefined;
            await this.startListening();
          }
        } catch (e) {
          this.debug("error parsing switch_relays response", e);
        }
        resolve();
      });
    });
  }
  stop() {
    this.subscription?.stop();
    this.subscription = undefined;
  }
  async getPublicKey() {
    if (this.userPubkey)
      return this.userPubkey;
    return new Promise((resolve, _reject) => {
      if (!this.bunkerPubkey)
        throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(this.bunkerPubkey, "get_public_key", [], 24133, (response) => {
        resolve(response.result);
      });
    });
  }
  async encryptionEnabled(scheme) {
    if (scheme)
      return [scheme];
    return Promise.resolve(["nip04", "nip44"]);
  }
  async encrypt(recipient, value, scheme = "nip04") {
    return this.encryption(recipient, value, scheme, "encrypt");
  }
  async decrypt(sender, value, scheme = "nip04") {
    return this.encryption(sender, value, scheme, "decrypt");
  }
  async encryption(peer, value, scheme, method) {
    const promise = new Promise((resolve, reject) => {
      if (!this.bunkerPubkey)
        throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(this.bunkerPubkey, `${scheme}_${method}`, [peer.pubkey, value], 24133, (response) => {
        if (!response.error) {
          resolve(response.result);
        } else {
          reject(response.error);
        }
      });
    });
    return promise;
  }
  async sign(event) {
    const promise = new Promise((resolve, reject) => {
      if (!this.bunkerPubkey)
        throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(this.bunkerPubkey, "sign_event", [JSON.stringify(event)], 24133, (response) => {
        if (!response.error) {
          const json = JSON.parse(response.result);
          resolve(json.sig);
        } else {
          reject(response.error);
        }
      });
    });
    return promise;
  }
  async createAccount(username, domain, email) {
    await this.startListening();
    const req = [];
    if (username)
      req.push(username);
    if (domain)
      req.push(domain);
    if (email)
      req.push(email);
    return new Promise((resolve, reject) => {
      if (!this.bunkerPubkey)
        throw new Error("Bunker pubkey not set");
      this.rpc.sendRequest(this.bunkerPubkey, "create_account", req, 24133, (response) => {
        if (!response.error) {
          const pubkey = response.result;
          resolve(pubkey);
        } else {
          reject(response.error);
        }
      });
    });
  }
  toPayload() {
    if (!this.bunkerPubkey || !this.userPubkey) {
      throw new Error("NIP-46 signer is not fully initialized for serialization");
    }
    const payload = {
      type: "nip46",
      payload: {
        bunkerPubkey: this.bunkerPubkey,
        userPubkey: this.userPubkey,
        relayUrls: this.relayUrls,
        secret: this.secret,
        localSignerPayload: this.localSigner.toPayload(),
        nip05: this.nip05 || null
      }
    };
    return JSON.stringify(payload);
  }
  static async fromPayload(payloadString, ndk) {
    if (!ndk) {
      throw new Error("NDK instance is required to deserialize NIP-46 signer");
    }
    const parsed = JSON.parse(payloadString);
    if (parsed.type !== "nip46") {
      throw new Error(`Invalid payload type: expected 'nip46', got ${parsed.type}`);
    }
    const payload = parsed.payload;
    if (!payload || typeof payload !== "object" || !payload.localSignerPayload) {
      throw new Error("Invalid payload content for nip46 signer");
    }
    const localSigner = await ndkSignerFromPayload(payload.localSignerPayload, ndk);
    if (!localSigner) {
      throw new Error("Failed to deserialize local signer for NIP-46");
    }
    if (!(localSigner instanceof NDKPrivateKeySigner)) {
      throw new Error("Local signer must be an instance of NDKPrivateKeySigner");
    }
    let signer;
    signer = new _NDKNip46Signer(ndk, false, localSigner, payload.relayUrls);
    signer.userPubkey = payload.userPubkey;
    signer.bunkerPubkey = payload.bunkerPubkey;
    signer.relayUrls = payload.relayUrls;
    signer.secret = payload.secret;
    if (payload.userPubkey) {
      signer._user = new NDKUser({ pubkey: payload.userPubkey });
      if (signer._user)
        signer._user.ndk = ndk;
    }
    return signer;
  }
};
registerSigner("nip46", NDKNip46Signer);
function matchFilter2(filter, event) {
  if (filter.ids && filter.ids.indexOf(event.id) === -1) {
    return false;
  }
  if (filter.kinds && filter.kinds.indexOf(event.kind) === -1) {
    return false;
  }
  if (filter.authors && filter.authors.indexOf(event.pubkey) === -1) {
    return false;
  }
  for (const f of Object.keys(filter)) {
    if (f[0] === "#") {
      const tagName = f.slice(1);
      if (tagName === "t") {
        const values = filter[`#${tagName}`]?.map((v) => v.toLowerCase());
        if (values && !event.tags.find(([t, v]) => t === tagName && values?.indexOf(v.toLowerCase()) !== -1))
          return false;
      } else {
        const values = filter[`#${tagName}`];
        if (values && !event.tags.find(([t, v]) => t === tagName && values?.indexOf(v) !== -1))
          return false;
      }
    }
  }
  if (filter.since && event.created_at < filter.since)
    return false;
  if (filter.until && event.created_at > filter.until)
    return false;
  return true;
}
var d2 = import_debug12.default("ndk:zapper:ln");
var d3 = import_debug11.default("ndk:zapper");

// src/worker.ts
async function getCacheStats(db) {
  const eventsByKindResult = await db.exec(`
        SELECT kind, COUNT(*) as count
        FROM events
        WHERE deleted = 0
        GROUP BY kind
        ORDER BY kind
    `);
  const eventsByKind = {};
  if (eventsByKindResult[0]) {
    for (const row of eventsByKindResult[0].values) {
      eventsByKind[row[0]] = row[1];
    }
  }
  const totalEventsResult = await db.exec(`SELECT COUNT(*) FROM events WHERE deleted = 0`);
  const totalProfilesResult = await db.exec(`SELECT COUNT(*) FROM profiles`);
  const totalEventTagsResult = await db.exec(`SELECT COUNT(*) FROM event_tags`);
  const totalDecryptedEventsResult = await db.exec(`SELECT COUNT(*) FROM decrypted_events`);
  const totalUnpublishedEventsResult = await db.exec(`SELECT COUNT(*) FROM unpublished_events`);
  const cacheDataResult = await db.exec(`SELECT COUNT(*) FROM cache_data`);
  return {
    eventsByKind,
    totalEvents: totalEventsResult[0]?.values[0]?.[0] || 0,
    totalProfiles: totalProfilesResult[0]?.values[0]?.[0] || 0,
    totalEventTags: totalEventTagsResult[0]?.values[0]?.[0] || 0,
    totalDecryptedEvents: totalDecryptedEventsResult[0]?.values[0]?.[0] || 0,
    totalUnpublishedEvents: totalUnpublishedEventsResult[0]?.values[0]?.[0] || 0,
    cacheData: cacheDataResult[0]?.values[0]?.[0] || 0
  };
}
async function setEvent(db, event, relay) {
  const stmt = `
        INSERT OR REPLACE INTO events (
            id, pubkey, created_at, kind, tags, content, sig, raw, deleted, relay_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  const tags = JSON.stringify(event.tags ?? []);
  const raw = JSON.stringify([
    event.id,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags ?? [],
    event.content,
    event.sig
  ]);
  const values = [
    event.id ?? "",
    event.pubkey ?? "",
    event.created_at ?? 0,
    event.kind ?? 0,
    tags,
    event.content ?? "",
    event.sig ?? "",
    raw,
    0,
    relay?.url ?? null
  ];
  await db.run(stmt, values);
  const seenKeys = new Set;
  if (event.tags && event.tags.length > 0) {
    for (const tag of event.tags) {
      if (tag.length >= 2 && tag[0].length === 1) {
        const tagName = tag[0];
        const tagValue = tag[1] || null;
        const key = `${event.id}:${tagName}:${tagValue}`;
        if (seenKeys.has(key))
          continue;
        seenKeys.add(key);
        try {
          await db.run("INSERT OR IGNORE INTO event_tags (event_id, tag, value) VALUES (?, ?, ?)", [
            event.id,
            tagName,
            tagValue
          ]);
        } catch (e) {
          console.error("[setEvent] Failed to insert tag:", tag, e);
        }
      }
    }
  }
  if (event.kind === NDKKind.Metadata || event.kind === 0) {
    try {
      const profile = typeof event.content === "string" ? JSON.parse(event.content) : event.content;
      if (profile && event.pubkey) {
        const eventTimestamp = event.created_at ?? 0;
        await db.run(`
                    INSERT INTO profiles (pubkey, profile, updated_at) VALUES (?, ?, ?)
                    ON CONFLICT(pubkey) DO UPDATE SET profile = excluded.profile, updated_at = excluded.updated_at
                    WHERE excluded.updated_at > profiles.updated_at
                `, [
          event.pubkey,
          JSON.stringify(profile),
          eventTimestamp
        ]);
      }
    } catch {}
  }
}
async function queryEvents(db, filters) {
  const allRecords = [];
  function normalizeDbRows(queryResults) {
    if (!queryResults || queryResults.length === 0)
      return [];
    const queryResult = queryResults[0];
    if (!queryResult || !queryResult.columns || !queryResult.values)
      return [];
    const { columns, values } = queryResult;
    return values.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }
  for (const filter of filters) {
    const hasHashtagFilter = Object.keys(filter).some((key) => key.startsWith("#") && key.length === 2);
    if (hasHashtagFilter) {
      for (const key in filter) {
        if (key.startsWith("#") && key.length === 2) {
          const tagValues = Array.isArray(filter[key]) ? filter[key] : [];
          const placeholders = tagValues.map(() => "?").join(",");
          const sql = `
                        SELECT events.*
                        FROM events
                        INNER JOIN event_tags ON events.id = event_tags.event_id
                        WHERE events.deleted = 0 AND event_tags.tag = ? AND event_tags.value IN (${placeholders})
                        ORDER BY events.created_at DESC
                    `;
          const params = [key[1], ...tagValues];
          const events = await db.exec(sql, params);
          const normalizedEvents = normalizeDbRows(events);
          allRecords.push(...normalizedEvents);
          break;
        }
      }
    } else if (filter.authors && filter.kinds) {
      const sql = `
                SELECT events.*
                FROM events
                WHERE events.deleted = 0
                AND events.pubkey IN (${filter.authors.map(() => "?").join(",")})
                AND events.kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY events.created_at DESC
            `;
      const params = [...filter.authors, ...filter.kinds];
      const events = await db.exec(sql, params);
      const normalizedEvents = normalizeDbRows(events);
      allRecords.push(...normalizedEvents);
    } else if (filter.authors) {
      const sql = `
                SELECT events.*
                FROM events
                WHERE events.deleted = 0
                AND events.pubkey IN (${filter.authors.map(() => "?").join(",")})
                ORDER BY events.created_at DESC
            `;
      const events = await db.exec(sql, filter.authors);
      const normalizedEvents = normalizeDbRows(events);
      allRecords.push(...normalizedEvents);
    } else if (filter.kinds) {
      const sql = `
                SELECT events.*
                FROM events
                WHERE events.deleted = 0
                AND events.kind IN (${filter.kinds.map(() => "?").join(",")})
                ORDER BY events.created_at DESC
            `;
      const events = await db.exec(sql, filter.kinds);
      const normalizedEvents = normalizeDbRows(events);
      allRecords.push(...normalizedEvents);
    } else if (filter.ids) {
      const sql = `
                SELECT events.*
                FROM events
                WHERE events.deleted = 0
                AND events.id IN (${filter.ids.map(() => "?").join(",")})
                ORDER BY events.created_at DESC
            `;
      const events = await db.exec(sql, filter.ids);
      const normalizedEvents = normalizeDbRows(events);
      allRecords.push(...normalizedEvents);
    }
  }
  return allRecords;
}
var db = null;
var dbName = "ndk-cache";
var persistenceMode = "memory";
async function initializeDatabase(config) {
  dbName = config.dbName || "ndk-cache";
  const dbPath = `${dbName}.sqlite3`;
  try {
    db = await WaSqliteDatabase.create(dbPath);
    persistenceMode = db.persistenceMode;
    console.log(`[Worker] Using ${db.persistenceMode} persistence at ${dbPath}`);
    await runMigrations(db);
    await db.sync();
    await cleanupOldIndexedDB(dbName);
    await warmupProfileCache(db);
  } catch (error) {
    console.warn("[Worker] OPFS unavailable, falling back to in-memory database:", error);
    db = await WaSqliteDatabase.createInMemory();
    persistenceMode = "memory";
    await runMigrations(db);
  }
  console.log(`[Worker] Database initialized (persistence: ${persistenceMode})`);
}
async function warmupProfileCache(database) {
  try {
    const rows = await database.queryAll(`
            SELECT pubkey, profile, updated_at
            FROM profiles
            ORDER BY updated_at DESC
            LIMIT 500
        `);
    const profiles = [];
    for (const row of rows) {
      try {
        profiles.push({
          pubkey: row.pubkey,
          profile: JSON.parse(row.profile)
        });
      } catch {}
    }
    if (profiles.length > 0) {
      self.postMessage({
        type: "warmupProfiles",
        profiles
      });
    }
  } catch (error) {
    console.error("[Worker] Profile LRU warmup failed:", error);
  }
}
self.onmessage = async (event) => {
  const { id, type, payload } = event.data;
  try {
    if (type === "init") {
      await initializeDatabase(payload);
      const initResponse = {
        id,
        result: { initialized: true, persistenceMode }
      };
      self.postMessage(initResponse);
      return;
    }
    if (!db) {
      throw new Error("Database not initialized yet.");
    }
    let result;
    switch (type) {
      case "saveProfile": {
        const { pubkey, profile, updatedAt } = payload;
        await db.run("INSERT OR REPLACE INTO profiles (pubkey, profile, updated_at) VALUES (?, ?, ?)", [pubkey, profile, updatedAt]);
        result = undefined;
        break;
      }
      case "fetchProfile": {
        const { pubkey } = payload;
        result = await db.queryOne("SELECT profile, updated_at FROM profiles WHERE pubkey = ? LIMIT 1", [pubkey]);
        break;
      }
      case "saveNip05": {
        const { nip05, profile, fetchedAt } = payload;
        await db.run("INSERT OR REPLACE INTO nip05 (nip05, profile, fetched_at) VALUES (?, ?, ?)", [nip05, profile, fetchedAt]);
        result = undefined;
        break;
      }
      case "loadNip05": {
        const { nip05 } = payload;
        result = await db.queryOne("SELECT profile, fetched_at FROM nip05 WHERE nip05 = ? LIMIT 1", [nip05]);
        break;
      }
      case "getEvent": {
        const { id: eventId } = payload;
        result = await db.queryOne("SELECT raw FROM events WHERE id = ? AND deleted = 0 LIMIT 1", [eventId]);
        break;
      }
      case "addDecryptedEvent": {
        const { wrapperId, serialized } = payload;
        await db.run("INSERT OR REPLACE INTO decrypted_events (id, event) VALUES (?, ?)", [wrapperId, serialized]);
        result = undefined;
        break;
      }
      case "getDecryptedEvent": {
        const { wrapperId } = payload;
        result = await db.queryOne("SELECT event FROM decrypted_events WHERE id = ? LIMIT 1", [wrapperId]);
        break;
      }
      case "discardUnpublishedEvent": {
        const { id: eventId } = payload;
        await db.run("DELETE FROM unpublished_events WHERE id = ?", [eventId]);
        result = undefined;
        break;
      }
      case "getUnpublishedEvents": {
        result = await db.queryAll("SELECT event, relays FROM unpublished_events");
        break;
      }
      case "addUnpublishedEvent": {
        const { id: eventId, event: eventJson, relays } = payload;
        await db.run("INSERT OR REPLACE INTO unpublished_events (id, event, relays) VALUES (?, ?, ?)", [eventId, eventJson, relays]);
        try {
          const ndkEvent = new NDKEvent(undefined, JSON.parse(eventJson));
          await setEvent(db, ndkEvent, undefined);
        } catch (e) {
          console.error("[addUnpublishedEvent] Failed to store event in main table:", e);
        }
        result = undefined;
        break;
      }
      case "getRelayStatus": {
        const { relayUrl } = payload;
        await db.run("CREATE TABLE IF NOT EXISTS relay_status (url TEXT PRIMARY KEY, info TEXT)");
        result = await db.queryOne("SELECT info FROM relay_status WHERE url = ? LIMIT 1", [relayUrl]);
        break;
      }
      case "updateRelayStatus": {
        const { relayUrl, info } = payload;
        await db.run("CREATE TABLE IF NOT EXISTS relay_status (url TEXT PRIMARY KEY, info TEXT)");
        await db.run("INSERT OR REPLACE INTO relay_status (url, info) VALUES (?, ?)", [
          relayUrl,
          info
        ]);
        result = undefined;
        break;
      }
      case "getProfiles": {
        const { field, fields, contains } = payload;
        const searchFields = fields || (field ? [field] : []);
        if (searchFields.length === 0) {
          throw new Error("Either 'field' or 'fields' must be provided");
        }
        const conditions = searchFields.map((f) => `json_extract(profile, '$.${f}') LIKE ?`).join(" OR ");
        const sql = `
                    SELECT pubkey, profile
                    FROM profiles
                    WHERE ${conditions}
                `;
        const param = `%${contains}%`;
        const params = searchFields.map(() => param);
        const rows = await db.queryAll(sql, params);
        result = [];
        for (const row of rows) {
          try {
            result.push({
              pubkey: row.pubkey,
              profile: JSON.parse(row.profile)
            });
          } catch {}
        }
        break;
      }
      case "getCacheStats":
        result = await getCacheStats(db);
        break;
      case "getPersistenceMode":
        result = persistenceMode;
        break;
      case "setEvent": {
        const { event: event2, relay } = payload;
        const relayObj = relay ? { url: relay } : undefined;
        await setEvent(db, event2, relayObj);
        result = undefined;
        break;
      }
      case "setEventBatch": {
        const { events } = payload;
        for (const item of events) {
          const relayObj = item.relay ? { url: item.relay } : undefined;
          await setEvent(db, item.event, relayObj);
        }
        await db.sync();
        result = undefined;
        break;
      }
      case "query": {
        const { filters } = payload;
        let queryResult;
        try {
          queryResult = await queryEvents(db, filters);
        } catch (e) {
          console.error(`[Worker] queryEvents failed:`, e.message);
          throw e;
        }
        const eventsForEncoding = [];
        const seenIds = new Set;
        const now2 = Math.floor(Date.now() / 1000);
        const parseRow = (row) => {
          let tags = [];
          if (typeof row.raw === "string") {
            try {
              const parsed = JSON.parse(row.raw);
              if (Array.isArray(parsed[4])) {
                tags = parsed[4];
              } else if (typeof row.tags === "string") {
                tags = JSON.parse(row.tags || "[]");
              }
              return {
                id: parsed[0] || row.id,
                pubkey: parsed[1] || row.pubkey,
                created_at: parsed[2] || row.created_at,
                kind: parsed[3] || row.kind,
                tags,
                content: parsed[5] || row.content,
                sig: parsed[6] || row.sig,
                relay_url: row.relay_url || null
              };
            } catch {}
          }
          if (typeof row.tags === "string") {
            try {
              tags = JSON.parse(row.tags || "[]");
            } catch {
              tags = [];
            }
          } else if (Array.isArray(row.tags)) {
            tags = row.tags;
          }
          return {
            id: row.id,
            pubkey: row.pubkey,
            created_at: row.created_at,
            kind: row.kind,
            tags,
            content: row.content,
            sig: row.sig,
            relay_url: row.relay_url || null
          };
        };
        for (const filter of filters) {
          const limit2 = filter.limit || Infinity;
          let count = 0;
          for (const row of queryResult) {
            if (count >= limit2)
              break;
            let eventData;
            try {
              eventData = parseRow(row);
            } catch (e) {
              console.error(`[Worker] parseRow failed:`, e.message);
              continue;
            }
            if (seenIds.has(eventData.id))
              continue;
            const expirationTag = eventData.tags?.find((t) => t[0] === "expiration");
            if (expirationTag && now2 > parseInt(expirationTag[1]))
              continue;
            try {
              if (!matchFilter2(filter, eventData))
                continue;
            } catch (e) {
              console.error(`[Worker] matchFilter failed for event ${eventData.id}:`, e.message);
              throw e;
            }
            seenIds.add(eventData.id);
            count++;
            eventsForEncoding.push({
              id: eventData.id || "",
              pubkey: eventData.pubkey || "",
              created_at: eventData.created_at || 0,
              kind: eventData.kind || 0,
              sig: eventData.sig || "",
              content: eventData.content || "",
              tags: Array.isArray(eventData.tags) ? eventData.tags : [],
              relay_url: eventData.relay_url
            });
          }
        }
        if (eventsForEncoding.length > 0) {
          if (eventsForEncoding.length < 100) {
            result = {
              type: "json",
              events: eventsForEncoding,
              eventCount: eventsForEncoding.length
            };
          } else {
            const buffer = encodeEvents(eventsForEncoding);
            result = {
              type: "binary",
              buffer,
              eventCount: eventsForEncoding.length
            };
          }
        } else {
          result = {
            type: "json",
            events: [],
            eventCount: 0
          };
        }
        break;
      }
      case "getCacheData": {
        const { namespace, key, maxAgeInSecs } = payload;
        const now2 = Math.floor(Date.now() / 1000);
        const row = await db.queryOne("SELECT data, cached_at FROM cache_data WHERE namespace = ? AND key = ?", [namespace, key]);
        if (row) {
          const cachedAt = row.cached_at;
          if (maxAgeInSecs && now2 - cachedAt > maxAgeInSecs) {
            result = undefined;
            break;
          }
          result = JSON.parse(row.data);
        } else {
          result = undefined;
        }
        break;
      }
      case "setCacheData": {
        const { namespace, key, data } = payload;
        const now2 = Math.floor(Date.now() / 1000);
        const dataJson = JSON.stringify(data);
        await db.run("INSERT OR REPLACE INTO cache_data (namespace, key, data, cached_at) VALUES (?, ?, ?, ?)", [namespace, key, dataJson, now2]);
        result = undefined;
        break;
      }
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
    const response = {
      _protocol: PROTOCOL_NAME,
      _version: PACKAGE_VERSION,
      id,
      result
    };
    const transferables = [];
    if (result && result.type === "binary" && result.buffer) {
      transferables.push(result.buffer);
    }
    if (transferables.length > 0) {
      self.postMessage(response, transferables);
    } else {
      self.postMessage(response);
    }
  } catch (error) {
    console.error(`[Worker] Error processing command ${id} (${type}):`, error);
    const errorResponse = {
      _protocol: PROTOCOL_NAME,
      _version: PACKAGE_VERSION,
      id,
      error: { message: error.message, stack: error.stack }
    };
    self.postMessage(errorResponse);
  }
};
self.addEventListener("error", (event) => {
  console.error("Worker: Uncaught error:", event.message, event.error);
});
