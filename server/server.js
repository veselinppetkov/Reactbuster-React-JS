(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory(
        require("http"),
        require("fs"),
        require("crypto")
      ))
    : typeof define === "function" && define.amd
    ? define(["http", "fs", "crypto"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      (global.Server = factory(global.http, global.fs, global.crypto)));
})(this, function (http, fs, crypto) {
  "use strict";

  function _interopDefaultLegacy(e) {
    return e && typeof e === "object" && "default" in e ? e : { default: e };
  }

  var http__default = /*#__PURE__*/ _interopDefaultLegacy(http);
  var fs__default = /*#__PURE__*/ _interopDefaultLegacy(fs);
  var crypto__default = /*#__PURE__*/ _interopDefaultLegacy(crypto);

  class ServiceError extends Error {
    constructor(message = "Service Error") {
      super(message);
      this.name = "ServiceError";
    }
  }

  class NotFoundError extends ServiceError {
    constructor(message = "Resource not found") {
      super(message);
      this.name = "NotFoundError";
      this.status = 404;
    }
  }

  class RequestError extends ServiceError {
    constructor(message = "Request error") {
      super(message);
      this.name = "RequestError";
      this.status = 400;
    }
  }

  class ConflictError extends ServiceError {
    constructor(message = "Resource conflict") {
      super(message);
      this.name = "ConflictError";
      this.status = 409;
    }
  }

  class AuthorizationError extends ServiceError {
    constructor(message = "Unauthorized") {
      super(message);
      this.name = "AuthorizationError";
      this.status = 401;
    }
  }

  class CredentialError extends ServiceError {
    constructor(message = "Forbidden") {
      super(message);
      this.name = "CredentialError";
      this.status = 403;
    }
  }

  var errors = {
    ServiceError,
    NotFoundError,
    RequestError,
    ConflictError,
    AuthorizationError,
    CredentialError,
  };

  const { ServiceError: ServiceError$1 } = errors;

  function createHandler(plugins, services) {
    return async function handler(req, res) {
      const method = req.method;
      console.info(`<< ${req.method} ${req.url}`);

      // Redirect fix for admin panel relative paths
      if (req.url.slice(-6) == "/admin") {
        res.writeHead(302, {
          Location: `http://${req.headers.host}/admin/`,
        });
        return res.end();
      }

      let status = 200;
      let headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      };
      let result = "";
      let context;

      // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
      if (method == "OPTIONS") {
        Object.assign(headers, {
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Credentials": false,
          "Access-Control-Max-Age": "86400",
          "Access-Control-Allow-Headers":
            "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin",
        });
      } else {
        try {
          context = processPlugins();
          await handle(context);
        } catch (err) {
          if (err instanceof ServiceError$1) {
            status = err.status || 400;
            result = composeErrorObject(err.code || status, err.message);
          } else {
            // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
            // If it happens, it must be debugged in a future version of the server
            console.error(err);
            status = 500;
            result = composeErrorObject(500, "Server Error");
          }
        }
      }

      res.writeHead(status, headers);
      if (
        context != undefined &&
        context.util != undefined &&
        context.util.throttle
      ) {
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
      }
      res.end(result);

      function processPlugins() {
        const context = { params: {} };
        plugins.forEach((decorate) => decorate(context, req));
        return context;
      }

      async function handle(context) {
        const { serviceName, tokens, query, body } = await parseRequest(req);
        if (serviceName == "admin") {
          return ({ headers, result } = services["admin"](
            method,
            tokens,
            query,
            body
          ));
        } else if (serviceName == "favicon.ico") {
          return ({ headers, result } = services["favicon"](
            method,
            tokens,
            query,
            body
          ));
        }

        const service = services[serviceName];

        if (service === undefined) {
          status = 400;
          result = composeErrorObject(
            400,
            `Service "${serviceName}" is not supported`
          );
          console.error("Missing service " + serviceName);
        } else {
          result = await service(context, { method, tokens, query, body });
        }

        // NOTE: logout does not return a result
        // in this case the content type header should be omitted, to allow checks on the client
        if (result !== undefined) {
          result = JSON.stringify(result);
        } else {
          status = 204;
          delete headers["Content-Type"];
        }
      }
    };
  }

  function composeErrorObject(code, message) {
    return JSON.stringify({
      code,
      message,
    });
  }

  async function parseRequest(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tokens = url.pathname.split("/").filter((x) => x.length > 0);
    const serviceName = tokens.shift();
    const queryString = url.search.split("?")[1] || "";
    const query = queryString
      .split("&")
      .filter((s) => s != "")
      .map((x) => x.split("="))
      .reduce(
        (p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v) }),
        {}
      );
    const body = await parseBody(req);

    return {
      serviceName,
      tokens,
      query,
      body,
    };
  }

  function parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          resolve(body);
        }
      });
    });
  }

  var requestHandler = createHandler;

  class Service {
    constructor() {
      this._actions = [];
      this.parseRequest = this.parseRequest.bind(this);
    }

    /**
     * Handle service request, after it has been processed by a request handler
     * @param {*} context Execution context, contains result of middleware processing
     * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
     */
    async parseRequest(context, request) {
      for (let { method, name, handler } of this._actions) {
        if (
          method === request.method &&
          matchAndAssignParams(context, request.tokens[0], name)
        ) {
          return await handler(
            context,
            request.tokens.slice(1),
            request.query,
            request.body
          );
        }
      }
    }

    /**
     * Register service action
     * @param {string} method HTTP method
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    registerAction(method, name, handler) {
      this._actions.push({ method, name, handler });
    }

    /**
     * Register GET action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    get(name, handler) {
      this.registerAction("GET", name, handler);
    }

    /**
     * Register POST action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    post(name, handler) {
      this.registerAction("POST", name, handler);
    }

    /**
     * Register PUT action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    put(name, handler) {
      this.registerAction("PUT", name, handler);
    }

    /**
     * Register PATCH action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    patch(name, handler) {
      this.registerAction("PATCH", name, handler);
    }

    /**
     * Register DELETE action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    delete(name, handler) {
      this.registerAction("DELETE", name, handler);
    }
  }

  function matchAndAssignParams(context, name, pattern) {
    if (pattern == "*") {
      return true;
    } else if (pattern[0] == ":") {
      context.params[pattern.slice(1)] = name;
      return true;
    } else if (name == pattern) {
      return true;
    } else {
      return false;
    }
  }

  var Service_1 = Service;

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        let r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  var util = {
    uuid,
  };

  const uuid$1 = util.uuid;

  const data = fs__default["default"].existsSync("./data")
    ? fs__default["default"].readdirSync("./data").reduce((p, c) => {
        const content = JSON.parse(
          fs__default["default"].readFileSync("./data/" + c)
        );
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
          p[collection][endpoint] = content[endpoint];
        }
        return p;
      }, {})
    : {};

  const actions = {
    get: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      let responseData = data;
      for (let token of tokens) {
        if (responseData !== undefined) {
          responseData = responseData[token];
        }
      }
      return responseData;
    },
    post: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      console.log("Request body:\n", body);

      // TODO handle collisions, replacement
      let responseData = data;
      for (let token of tokens) {
        if (responseData.hasOwnProperty(token) == false) {
          responseData[token] = {};
        }
        responseData = responseData[token];
      }

      const newId = uuid$1();
      responseData[newId] = Object.assign({}, body, { _id: newId });
      return responseData[newId];
    },
    put: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      console.log("Request body:\n", body);

      let responseData = data;
      for (let token of tokens.slice(0, -1)) {
        if (responseData !== undefined) {
          responseData = responseData[token];
        }
      }
      if (
        responseData !== undefined &&
        responseData[tokens.slice(-1)] !== undefined
      ) {
        responseData[tokens.slice(-1)] = body;
      }
      return responseData[tokens.slice(-1)];
    },
    patch: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      console.log("Request body:\n", body);

      let responseData = data;
      for (let token of tokens) {
        if (responseData !== undefined) {
          responseData = responseData[token];
        }
      }
      if (responseData !== undefined) {
        Object.assign(responseData, body);
      }
      return responseData;
    },
    delete: (context, tokens, query, body) => {
      tokens = [context.params.collection, ...tokens];
      let responseData = data;

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (responseData.hasOwnProperty(token) == false) {
          return null;
        }
        if (i == tokens.length - 1) {
          const body = responseData[token];
          delete responseData[token];
          return body;
        } else {
          responseData = responseData[token];
        }
      }
    },
  };

  const dataService = new Service_1();
  dataService.get(":collection", actions.get);
  dataService.post(":collection", actions.post);
  dataService.put(":collection", actions.put);
  dataService.patch(":collection", actions.patch);
  dataService.delete(":collection", actions.delete);

  var jsonstore = dataService.parseRequest;

  /*
   * This service requires storage and auth plugins
   */

  const { AuthorizationError: AuthorizationError$1 } = errors;

  const userService = new Service_1();

  userService.get("me", getSelf);
  userService.post("register", onRegister);
  userService.post("login", onLogin);
  userService.get("logout", onLogout);

  function getSelf(context, tokens, query, body) {
    if (context.user) {
      const result = Object.assign({}, context.user);
      delete result.hashedPassword;
      return result;
    } else {
      throw new AuthorizationError$1();
    }
  }

  function onRegister(context, tokens, query, body) {
    return context.auth.register(body);
  }

  function onLogin(context, tokens, query, body) {
    return context.auth.login(body);
  }

  function onLogout(context, tokens, query, body) {
    return context.auth.logout();
  }

  var users = userService.parseRequest;

  const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } =
    errors;

  var crud = {
    get,
    post,
    put,
    patch,
    delete: del,
  };

  function validateRequest(context, tokens, query) {
    /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
    if (tokens.length > 1) {
      throw new RequestError$1();
    }
  }

  function parseWhere(query) {
    const operators = {
      "<=": (prop, value) => (record) => record[prop] <= JSON.parse(value),
      "<": (prop, value) => (record) => record[prop] < JSON.parse(value),
      ">=": (prop, value) => (record) => record[prop] >= JSON.parse(value),
      ">": (prop, value) => (record) => record[prop] > JSON.parse(value),
      "=": (prop, value) => (record) => record[prop] == JSON.parse(value),
      " like ": (prop, value) => (record) =>
        record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
      " in ": (prop, value) => (record) =>
        JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
    };
    const pattern = new RegExp(
      `^(.+?)(${Object.keys(operators).join("|")})(.+?)$`,
      "i"
    );

    try {
      let clauses = [query.trim()];
      let check = (a, b) => b;
      let acc = true;
      if (query.match(/ and /gi)) {
        // inclusive
        clauses = query.split(/ and /gi);
        check = (a, b) => a && b;
        acc = true;
      } else if (query.match(/ or /gi)) {
        // optional
        clauses = query.split(/ or /gi);
        check = (a, b) => a || b;
        acc = false;
      }
      clauses = clauses.map(createChecker);

      return (record) => clauses.map((c) => c(record)).reduce(check, acc);
    } catch (err) {
      throw new Error("Could not parse WHERE clause, check your syntax.");
    }

    function createChecker(clause) {
      let [match, prop, operator, value] = pattern.exec(clause);
      [prop, value] = [prop.trim(), value.trim()];

      return operators[operator.toLowerCase()](prop, value);
    }
  }

  function get(context, tokens, query, body) {
    validateRequest(context, tokens);

    let responseData;

    try {
      if (query.where) {
        responseData = context.storage
          .get(context.params.collection)
          .filter(parseWhere(query.where));
      } else if (context.params.collection) {
        responseData = context.storage.get(
          context.params.collection,
          tokens[0]
        );
      } else {
        // Get list of collections
        return context.storage.get();
      }

      if (query.sortBy) {
        const props = query.sortBy
          .split(",")
          .filter((p) => p != "")
          .map((p) => p.split(" ").filter((p) => p != ""))
          .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

        // Sorting priority is from first to last, therefore we sort from last to first
        for (let i = props.length - 1; i >= 0; i--) {
          let { prop, desc } = props[i];
          responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
            if (typeof propA == "number" && typeof propB == "number") {
              return (propA - propB) * (desc ? -1 : 1);
            } else {
              return propA.localeCompare(propB) * (desc ? -1 : 1);
            }
          });
        }
      }

      if (query.offset) {
        responseData = responseData.slice(Number(query.offset) || 0);
      }
      const pageSize = Number(query.pageSize) || 10;
      if (query.pageSize) {
        responseData = responseData.slice(0, pageSize);
      }

      if (query.distinct) {
        const props = query.distinct.split(",").filter((p) => p != "");
        responseData = Object.values(
          responseData.reduce((distinct, c) => {
            const key = props.map((p) => c[p]).join("::");
            if (distinct.hasOwnProperty(key) == false) {
              distinct[key] = c;
            }
            return distinct;
          }, {})
        );
      }

      if (query.count) {
        return responseData.length;
      }

      if (query.select) {
        const props = query.select.split(",").filter((p) => p != "");
        responseData = Array.isArray(responseData)
          ? responseData.map(transform)
          : transform(responseData);

        function transform(r) {
          const result = {};
          props.forEach((p) => (result[p] = r[p]));
          return result;
        }
      }

      if (query.load) {
        const props = query.load.split(",").filter((p) => p != "");
        props.map((prop) => {
          const [propName, relationTokens] = prop.split("=");
          const [idSource, collection] = relationTokens.split(":");
          console.log(
            `Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`
          );
          const storageSource =
            collection == "users" ? context.protectedStorage : context.storage;
          responseData = Array.isArray(responseData)
            ? responseData.map(transform)
            : transform(responseData);

          function transform(r) {
            const seekId = r[idSource];
            const related = storageSource.get(collection, seekId);
            delete related.hashedPassword;
            r[propName] = related;
            return r;
          }
        });
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes("does not exist")) {
        throw new NotFoundError$1();
      } else {
        throw new RequestError$1(err.message);
      }
    }

    context.canAccess(responseData);

    return responseData;
  }

  function post(context, tokens, query, body) {
    console.log("Request body:\n", body);

    validateRequest(context, tokens);
    if (tokens.length > 0) {
      throw new RequestError$1("Use PUT to update records");
    }
    context.canAccess(undefined, body);

    body._ownerId = context.user._id;
    let responseData;

    try {
      responseData = context.storage.add(context.params.collection, body);
    } catch (err) {
      throw new RequestError$1();
    }

    return responseData;
  }

  function put(context, tokens, query, body) {
    console.log("Request body:\n", body);

    validateRequest(context, tokens);
    if (tokens.length != 1) {
      throw new RequestError$1("Missing entry ID");
    }

    let responseData;
    let existing;

    try {
      existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
      throw new NotFoundError$1();
    }

    context.canAccess(existing, body);

    try {
      responseData = context.storage.set(
        context.params.collection,
        tokens[0],
        body
      );
    } catch (err) {
      throw new RequestError$1();
    }

    return responseData;
  }

  function patch(context, tokens, query, body) {
    console.log("Request body:\n", body);

    validateRequest(context, tokens);
    if (tokens.length != 1) {
      throw new RequestError$1("Missing entry ID");
    }

    let responseData;
    let existing;

    try {
      existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
      throw new NotFoundError$1();
    }

    context.canAccess(existing, body);

    try {
      responseData = context.storage.merge(
        context.params.collection,
        tokens[0],
        body
      );
    } catch (err) {
      throw new RequestError$1();
    }

    return responseData;
  }

  function del(context, tokens, query, body) {
    validateRequest(context, tokens);
    if (tokens.length != 1) {
      throw new RequestError$1("Missing entry ID");
    }

    let responseData;
    let existing;

    try {
      existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
      throw new NotFoundError$1();
    }

    context.canAccess(existing);

    try {
      responseData = context.storage.delete(
        context.params.collection,
        tokens[0]
      );
    } catch (err) {
      throw new RequestError$1();
    }

    return responseData;
  }

  /*
   * This service requires storage and auth plugins
   */

  const dataService$1 = new Service_1();
  dataService$1.get(":collection", crud.get);
  dataService$1.post(":collection", crud.post);
  dataService$1.put(":collection", crud.put);
  dataService$1.patch(":collection", crud.patch);
  dataService$1.delete(":collection", crud.delete);

  var data$1 = dataService$1.parseRequest;

  const imgdata =
    "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Td4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC";
  const img = Buffer.from(imgdata, "base64");

  var favicon = (method, tokens, query, body) => {
    console.log("serving favicon...");
    const headers = {
      "Content-Type": "image/png",
      "Content-Length": img.length,
    };
    let result = img;

    return {
      headers,
      result,
    };
  };

  var require$$0 =
    '<!DOCTYPE html>\r\n<html lang="en">\r\n<head>\r\n    <meta charset="UTF-8">\r\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n    <title>SUPS Admin Panel</title>\r\n    <style>\r\n        * {\r\n            padding: 0;\r\n            margin: 0;\r\n        }\r\n\r\n        body {\r\n            padding: 32px;\r\n            font-size: 16px;\r\n        }\r\n\r\n        .layout::after {\r\n            content: \'\';\r\n            clear: both;\r\n            display: table;\r\n        }\r\n\r\n        .col {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        p {\r\n            padding: 8px 16px;\r\n        }\r\n\r\n        table {\r\n            border-collapse: collapse;\r\n        }\r\n\r\n        caption {\r\n            font-size: 120%;\r\n            text-align: left;\r\n            padding: 4px 8px;\r\n            font-weight: bold;\r\n            background-color: #ddd;\r\n        }\r\n\r\n        table, tr, th, td {\r\n            border: 1px solid #ddd;\r\n        }\r\n\r\n        th, td {\r\n            padding: 4px 8px;\r\n        }\r\n\r\n        ul {\r\n            list-style: none;\r\n        }\r\n\r\n        .collection-list a {\r\n            display: block;\r\n            width: 120px;\r\n            padding: 4px 8px;\r\n            text-decoration: none;\r\n            color: black;\r\n            background-color: #ccc;\r\n        }\r\n        .collection-list a:hover {\r\n            background-color: #ddd;\r\n        }\r\n        .collection-list a:visited {\r\n            color: black;\r\n        }\r\n    </style>\r\n    <script type="module">\nimport { html, render } from \'https://unpkg.com/lit-html?module\';\nimport { until } from \'https://unpkg.com/lit-html/directives/until?module\';\n\nconst api = {\r\n    async get(url) {\r\n        return json(url);\r\n    },\r\n    async post(url, body) {\r\n        return json(url, {\r\n            method: \'POST\',\r\n            headers: { \'Content-Type\': \'application/json\' },\r\n            body: JSON.stringify(body)\r\n        });\r\n    }\r\n};\r\n\r\nasync function json(url, options) {\r\n    return await (await fetch(\'/\' + url, options)).json();\r\n}\r\n\r\nasync function getCollections() {\r\n    return api.get(\'data\');\r\n}\r\n\r\nasync function getRecords(collection) {\r\n    return api.get(\'data/\' + collection);\r\n}\r\n\r\nasync function getThrottling() {\r\n    return api.get(\'util/throttle\');\r\n}\r\n\r\nasync function setThrottling(throttle) {\r\n    return api.post(\'util\', { throttle });\r\n}\n\nasync function collectionList(onSelect) {\r\n    const collections = await getCollections();\r\n\r\n    return html`\r\n    <ul class="collection-list">\r\n        ${collections.map(collectionLi)}\r\n    </ul>`;\r\n\r\n    function collectionLi(name) {\r\n        return html`<li><a href="javascript:void(0)" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\r\n    }\r\n}\n\nasync function recordTable(collectionName) {\r\n    const records = await getRecords(collectionName);\r\n    const layout = getLayout(records);\r\n\r\n    return html`\r\n    <table>\r\n        <caption>${collectionName}</caption>\r\n        <thead>\r\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\r\n        </thead>\r\n        <tbody>\r\n            ${records.map(r => recordRow(r, layout))}\r\n        </tbody>\r\n    </table>`;\r\n}\r\n\r\nfunction getLayout(records) {\r\n    const result = new Set([\'_id\']);\r\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\r\n\r\n    return [...result.keys()];\r\n}\r\n\r\nfunction recordRow(record, layout) {\r\n    return html`\r\n    <tr>\r\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\r\n    </tr>`;\r\n}\n\nasync function throttlePanel(display) {\r\n    const active = await getThrottling();\r\n\r\n    return html`\r\n    <p>\r\n        Request throttling: </span>${active}</span>\r\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\r\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\r\n    </p>`;\r\n\r\n    async function set(ev, state) {\r\n        ev.target.disabled = true;\r\n        await setThrottling(state);\r\n        display();\r\n    }\r\n}\n\n//import page from \'//unpkg.com/page/page.mjs\';\r\n\r\n\r\nfunction start() {\r\n    const main = document.querySelector(\'main\');\r\n    editor(main);\r\n}\r\n\r\nasync function editor(main) {\r\n    let list = html`<div class="col">Loading&hellip;</div>`;\r\n    let viewer = html`<div class="col">\r\n    <p>Select collection to view records</p>\r\n</div>`;\r\n    display();\r\n\r\n    list = html`<div class="col">${await collectionList(onSelect)}</div>`;\r\n    display();\r\n\r\n    async function display() {\r\n        render(html`\r\n        <section class="layout">\r\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\r\n        </section>\r\n        <section class="layout">\r\n            ${list}\r\n            ${viewer}\r\n        </section>`, main);\r\n    }\r\n\r\n    async function onSelect(ev, name) {\r\n        ev.preventDefault();\r\n        viewer = html`<div class="col">${await recordTable(name)}</div>`;\r\n        display();\r\n    }\r\n}\r\n\r\nstart();\n\n</script>\r\n</head>\r\n<body>\r\n    <main>\r\n        Loading&hellip;\r\n    </main>\r\n</body>\r\n</html>';

  const mode = process.argv[2] == "-dev" ? "dev" : "prod";

  const files = {
    index:
      mode == "prod"
        ? require$$0
        : fs__default["default"].readFileSync("./client/index.html", "utf-8"),
  };

  var admin = (method, tokens, query, body) => {
    const headers = {
      "Content-Type": "text/html",
    };
    let result = "";

    const resource = tokens.join("/");
    if (resource && resource.split(".").pop() == "js") {
      headers["Content-Type"] = "application/javascript";

      files[resource] =
        files[resource] ||
        fs__default["default"].readFileSync("./client/" + resource, "utf-8");
      result = files[resource];
    } else {
      result = files.index;
    }

    return {
      headers,
      result,
    };
  };

  /*
   * This service requires util plugin
   */

  const utilService = new Service_1();

  utilService.post("*", onRequest);
  utilService.get(":service", getStatus);

  function getStatus(context, tokens, query, body) {
    return context.util[context.params.service];
  }

  function onRequest(context, tokens, query, body) {
    Object.entries(body).forEach(([k, v]) => {
      console.log(`${k} ${v ? "enabled" : "disabled"}`);
      context.util[k] = v;
    });
    return "";
  }

  var util$1 = utilService.parseRequest;

  var services = {
    jsonstore,
    users,
    data: data$1,
    favicon,
    admin,
    util: util$1,
  };

  const { uuid: uuid$2 } = util;

  function initPlugin(settings) {
    const storage = createInstance(settings.seedData);
    const protectedStorage = createInstance(settings.protectedData);

    return function decoreateContext(context, request) {
      context.storage = storage;
      context.protectedStorage = protectedStorage;
    };
  }

  /**
   * Create storage instance and populate with seed data
   * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
   */
  function createInstance(seedData = {}) {
    const collections = new Map();

    // Initialize seed data from file
    for (let collectionName in seedData) {
      if (seedData.hasOwnProperty(collectionName)) {
        const collection = new Map();
        for (let recordId in seedData[collectionName]) {
          if (seedData.hasOwnProperty(collectionName)) {
            collection.set(recordId, seedData[collectionName][recordId]);
          }
        }
        collections.set(collectionName, collection);
      }
    }

    // Manipulation

    /**
     * Get entry by ID or list of all entries from collection or list of all collections
     * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
     * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
     * @return {Object} Matching entry.
     */
    function get(collection, id) {
      if (!collection) {
        return [...collections.keys()];
      }
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      if (!id) {
        const entries = [...targetCollection.entries()];
        let result = entries.map(([k, v]) => {
          return Object.assign(deepCopy(v), { _id: k });
        });
        return result;
      }
      if (!targetCollection.has(id)) {
        throw new ReferenceError("Entry does not exist: " + id);
      }
      const entry = targetCollection.get(id);
      return Object.assign(deepCopy(entry), { _id: id });
    }

    /**
     * Add new entry to collection. ID will be auto-generated
     * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
     * @param {Object} data Value to store.
     * @return {Object} Original value with resulting ID under _id property.
     */
    function add(collection, data) {
      const record = assignClean({ _ownerId: data._ownerId }, data);

      let targetCollection = collections.get(collection);
      if (!targetCollection) {
        targetCollection = new Map();
        collections.set(collection, targetCollection);
      }
      let id = uuid$2();
      // Make sure new ID does not match existing value
      while (targetCollection.has(id)) {
        id = uuid$2();
      }

      record._createdOn = Date.now();
      targetCollection.set(id, record);
      return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Replace entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @param {Object} data Value to store. Record will be replaced!
     * @return {Object} Updated entry.
     */
    function set(collection, id, data) {
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      if (!targetCollection.has(id)) {
        throw new ReferenceError("Entry does not exist: " + id);
      }

      const existing = targetCollection.get(id);
      const record = assignSystemProps(deepCopy(data), existing);
      record._updatedOn = Date.now();
      targetCollection.set(id, record);
      return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Modify entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @param {Object} data Value to store. Shallow merge will be performed!
     * @return {Object} Updated entry.
     */
    function merge(collection, id, data) {
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      if (!targetCollection.has(id)) {
        throw new ReferenceError("Entry does not exist: " + id);
      }

      const existing = deepCopy(targetCollection.get(id));
      const record = assignClean(existing, data);
      record._updatedOn = Date.now();
      targetCollection.set(id, record);
      return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Delete entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @return {{_deletedOn: number}} Server time of deletion.
     */
    function del(collection, id) {
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      if (!targetCollection.has(id)) {
        throw new ReferenceError("Entry does not exist: " + id);
      }
      targetCollection.delete(id);

      return { _deletedOn: Date.now() };
    }

    /**
     * Search in collection by query object
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {Object} query Query object. Format {prop: value}.
     * @return {Object[]} Array of matching entries.
     */
    function query(collection, query) {
      if (!collections.has(collection)) {
        throw new ReferenceError("Collection does not exist: " + collection);
      }
      const targetCollection = collections.get(collection);
      const result = [];
      // Iterate entries of target collection and compare each property with the given query
      for (let [key, entry] of [...targetCollection.entries()]) {
        let match = true;
        for (let prop in entry) {
          if (query.hasOwnProperty(prop)) {
            const targetValue = query[prop];
            // Perform lowercase search, if value is string
            if (
              typeof targetValue === "string" &&
              typeof entry[prop] === "string"
            ) {
              if (
                targetValue.toLocaleLowerCase() !==
                entry[prop].toLocaleLowerCase()
              ) {
                match = false;
                break;
              }
            } else if (targetValue != entry[prop]) {
              match = false;
              break;
            }
          }
        }

        if (match) {
          result.push(Object.assign(deepCopy(entry), { _id: key }));
        }
      }

      return result;
    }

    return { get, add, set, merge, delete: del, query };
  }

  function assignSystemProps(target, entry, ...rest) {
    const whitelist = ["_id", "_createdOn", "_updatedOn", "_ownerId"];
    for (let prop of whitelist) {
      if (entry.hasOwnProperty(prop)) {
        target[prop] = deepCopy(entry[prop]);
      }
    }
    if (rest.length > 0) {
      Object.assign(target, ...rest);
    }

    return target;
  }

  function assignClean(target, entry, ...rest) {
    const blacklist = ["_id", "_createdOn", "_updatedOn", "_ownerId"];
    for (let key in entry) {
      if (blacklist.includes(key) == false) {
        target[key] = deepCopy(entry[key]);
      }
    }
    if (rest.length > 0) {
      Object.assign(target, ...rest);
    }

    return target;
  }

  function deepCopy(value) {
    if (Array.isArray(value)) {
      return value.map(deepCopy);
    } else if (typeof value == "object") {
      return [...Object.entries(value)].reduce(
        (p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }),
        {}
      );
    } else {
      return value;
    }
  }

  var storage = initPlugin;

  const {
    ConflictError: ConflictError$1,
    CredentialError: CredentialError$1,
    RequestError: RequestError$2,
  } = errors;

  function initPlugin$1(settings) {
    const identity = settings.identity;

    return function decorateContext(context, request) {
      context.auth = {
        register,
        login,
        logout,
      };

      const userToken = request.headers["x-authorization"];
      if (userToken !== undefined) {
        let user;
        const session = findSessionByToken(userToken);
        if (session !== undefined) {
          const userData = context.protectedStorage.get(
            "users",
            session.userId
          );
          if (userData !== undefined) {
            console.log("Authorized as " + userData[identity]);
            user = userData;
          }
        }
        if (user !== undefined) {
          context.user = user;
        } else {
          throw new CredentialError$1("Invalid access token");
        }
      }

      function register(body) {
        if (
          body.hasOwnProperty(identity) === false ||
          body.hasOwnProperty("password") === false ||
          body[identity].length == 0 ||
          body.password.length == 0
        ) {
          throw new RequestError$2("Missing fields");
        } else if (
          context.protectedStorage.query("users", {
            [identity]: body[identity],
          }).length !== 0
        ) {
          throw new ConflictError$1(
            `A user with the same ${identity} already exists`
          );
        } else {
          const newUser = Object.assign({}, body, {
            [identity]: body[identity],
            hashedPassword: hash(body.password),
          });
          const result = context.protectedStorage.add("users", newUser);
          delete result.hashedPassword;

          const session = saveSession(result._id);
          result.accessToken = session.accessToken;

          return result;
        }
      }

      function login(body) {
        const targetUser = context.protectedStorage.query("users", {
          [identity]: body[identity],
        });
        if (targetUser.length == 1) {
          if (hash(body.password) === targetUser[0].hashedPassword) {
            const result = targetUser[0];
            delete result.hashedPassword;

            const session = saveSession(result._id);
            result.accessToken = session.accessToken;

            return result;
          } else {
            throw new CredentialError$1("Login or password don't match");
          }
        } else {
          throw new CredentialError$1("Login or password don't match");
        }
      }

      function logout() {
        if (context.user !== undefined) {
          const session = findSessionByUserId(context.user._id);
          if (session !== undefined) {
            context.protectedStorage.delete("sessions", session._id);
          }
        } else {
          throw new CredentialError$1("User session does not exist");
        }
      }

      function saveSession(userId) {
        let session = context.protectedStorage.add("sessions", { userId });
        const accessToken = hash(session._id);
        session = context.protectedStorage.set(
          "sessions",
          session._id,
          Object.assign({ accessToken }, session)
        );
        return session;
      }

      function findSessionByToken(userToken) {
        return context.protectedStorage.query("sessions", {
          accessToken: userToken,
        })[0];
      }

      function findSessionByUserId(userId) {
        return context.protectedStorage.query("sessions", { userId })[0];
      }
    };
  }

  const secret = "This is not a production server";

  function hash(string) {
    const hash = crypto__default["default"].createHmac("sha256", secret);
    hash.update(string);
    return hash.digest("hex");
  }

  var auth = initPlugin$1;

  function initPlugin$2(settings) {
    const util = {
      throttle: false,
    };

    return function decoreateContext(context, request) {
      context.util = util;
    };
  }

  var util$2 = initPlugin$2;

  /*
   * This plugin requires auth and storage plugins
   */

  const {
    RequestError: RequestError$3,
    ConflictError: ConflictError$2,
    CredentialError: CredentialError$2,
    AuthorizationError: AuthorizationError$2,
  } = errors;

  function initPlugin$3(settings) {
    const actions = {
      GET: ".read",
      POST: ".create",
      PUT: ".update",
      PATCH: ".update",
      DELETE: ".delete",
    };
    const rules = Object.assign(
      {
        "*": {
          ".create": ["User"],
          ".update": ["Owner"],
          ".delete": ["Owner"],
        },
      },
      settings.rules
    );

    return function decorateContext(context, request) {
      // special rules (evaluated at run-time)
      const get = (collectionName, id) => {
        return context.storage.get(collectionName, id);
      };
      const isOwner = (user, object) => {
        return user._id == object._ownerId;
      };
      context.rules = {
        get,
        isOwner,
      };
      const isAdmin = request.headers.hasOwnProperty("x-admin");

      context.canAccess = canAccess;

      function canAccess(data, newData) {
        const user = context.user;
        const action = actions[request.method];
        let { rule, propRules } = getRule(
          action,
          context.params.collection,
          data
        );

        if (Array.isArray(rule)) {
          rule = checkRoles(rule, data);
        } else if (typeof rule == "string") {
          rule = !!eval(rule);
        }
        if (!rule && !isAdmin) {
          throw new CredentialError$2();
        }
        propRules.map((r) => applyPropRule(action, r, user, data, newData));
      }

      function applyPropRule(action, [prop, rule], user, data, newData) {
        // NOTE: user needs to be in scope for eval to work on certain rules
        if (typeof rule == "string") {
          rule = !!eval(rule);
        }

        if (rule == false) {
          if (action == ".create" || action == ".update") {
            delete newData[prop];
          } else if (action == ".read") {
            delete data[prop];
          }
        }
      }

      function checkRoles(roles, data, newData) {
        if (roles.includes("Guest")) {
          return true;
        } else if (!context.user && !isAdmin) {
          throw new AuthorizationError$2();
        } else if (roles.includes("User")) {
          return true;
        } else if (context.user && roles.includes("Owner")) {
          return context.user._id == data._ownerId;
        } else {
          return false;
        }
      }
    };

    function getRule(action, collection, data = {}) {
      let currentRule = ruleOrDefault(true, rules["*"][action]);
      let propRules = [];

      // Top-level rules for the collection
      const collectionRules = rules[collection];
      if (collectionRules !== undefined) {
        // Top-level rule for the specific action for the collection
        currentRule = ruleOrDefault(currentRule, collectionRules[action]);

        // Prop rules
        const allPropRules = collectionRules["*"];
        if (allPropRules !== undefined) {
          propRules = ruleOrDefault(
            propRules,
            getPropRule(allPropRules, action)
          );
        }

        // Rules by record id
        const recordRules = collectionRules[data._id];
        if (recordRules !== undefined) {
          currentRule = ruleOrDefault(currentRule, recordRules[action]);
          propRules = ruleOrDefault(
            propRules,
            getPropRule(recordRules, action)
          );
        }
      }

      return {
        rule: currentRule,
        propRules,
      };
    }

    function ruleOrDefault(current, rule) {
      return rule === undefined || rule.length === 0 ? current : rule;
    }

    function getPropRule(record, action) {
      const props = Object.entries(record)
        .filter(([k]) => k[0] != ".")
        .filter(([k, v]) => v.hasOwnProperty(action))
        .map(([k, v]) => [k, v[action]]);

      return props;
    }
  }

  var rules = initPlugin$3;

  var identity = "email";
  var protectedData = {
    users: {
      "35c62d76-8152-4626-8712-eeb96381bea8": {
        email: "peter@abv.bg",
        username: "Peter",
        hashedPassword:
          "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1",
      },
      "847ec027-f659-4086-8032-5173e2f9c93a": {
        email: "george@abv.bg",
        username: "George",
        hashedPassword:
          "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1",
      },
      "60f0cf0b-34b0-4abd-9769-8c42f830dffc": {
        email: "admin@abv.bg",
        username: "Admin",
        hashedPassword:
          "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa302",
      },
    },
    sessions: {},
  };
  var seedData = {
    movies: {
      "70071043-198b-41c2-b442-f7cea6aa81e5": {
        Title: "The Godfather",
        Year: "1972",
        Rated: "R",
        Released: "24 Mar 1972",
        Runtime: "175 min",
        Genre: "Crime, Drama",
        Director: "Francis Ford Coppola",
        Writer: "Mario Puzo, Francis Ford Coppola",
        Actors: "Marlon Brando, Al Pacino, James Caan",
        Plot: "The Godfather follows Vito Corleone Don of the Corleone family as he passes the mantel to his son Michael",
        Language: "English, Italian, Latin",
        Country: "United States",
        Awards: "Won 3 Oscars. 31 wins & 30 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "9.2/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "97%",
          },
          {
            Source: "Metacritic",
            Value: "100/100",
          },
        ],
        Metascore: "100",
        imdbRating: "9.2",
        imdbVotes: "1,719,632",
        imdbID: "tt0068646",
        Type: "movie",
        DVD: "11 May 2004",
        BoxOffice: "$134,966,411",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "70071043-198b-41c2-b442-f7cea6aa81e5",
      },
      "b188411e-e877-4bb9-9525-8a3820e25873": {
        Title: "Home Alone",
        Year: "1990",
        Rated: "PG",
        Released: "16 Nov 1990",
        Runtime: "103 min",
        Genre: "Comedy, Family",
        Director: "Chris Columbus",
        Writer: "John Hughes",
        Actors: "Macaulay Culkin, Joe Pesci, Daniel Stern",
        Plot: "An eight-year-old troublemaker must protect his house from a pair of burglars when he is accidentally left home alone by his family during Christmas vacation.",
        Language: "English",
        Country: "United States",
        Awards: "Nominated for 2 Oscars. 11 wins & 6 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMzFkM2YwOTQtYzk2Mi00N2VlLWE3NTItN2YwNDg1YmY0ZDNmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.6/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "66%",
          },
          {
            Source: "Metacritic",
            Value: "63/100",
          },
        ],
        Metascore: "63",
        imdbRating: "7.6",
        imdbVotes: "522,761",
        imdbID: "tt0099785",
        Type: "movie",
        DVD: "07 Dec 2004",
        BoxOffice: "$285,761,243",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "b188411e-e877-4bb9-9525-8a3820e25873",
      },
      "af3b5997-f7ad-4768-825b-c30a09086fc9": {
        Title: "Dexter",
        Year: "2006–2013",
        Rated: "TV-MA",
        Released: "01 Oct 2006",
        Runtime: "53 min",
        Genre: "Crime, Drama, Mystery",
        Director: "N/A",
        Writer: "James Manos Jr.",
        Actors: "Michael C. Hall, Jennifer Carpenter, David Zayas",
        Plot: "He's smart. He's lovable. He's Dexter Morgan, America's favorite serial killer, who spends his days solving crimes and nights committing them. Golden Globe winner Michael C. Hall stars in the hit SHOWTIME Original Series.",
        Language: "English, Spanish",
        Country: "United States",
        Awards: "Won 4 Primetime Emmys. 53 wins & 196 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BZjkzMmU5MjMtODllZS00OTA5LTk2ZTEtNjdhYjZhMDA5ZTRhXkEyXkFqcGdeQXVyOTA3MTMyOTk@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "8.6/10",
          },
        ],
        Metascore: "N/A",
        imdbRating: "8.6",
        imdbVotes: "691,077",
        imdbID: "tt0773262",
        Type: "series",
        totalSeasons: "8",
        Response: "True",
        _id: "af3b5997-f7ad-4768-825b-c30a09086fc9",
      },
      "a749b314-234b-4b8d-a867-c783890d03da": {
        Title: "Harry Potter and the Deathly Hallows: Part 2",
        Year: "2011",
        Rated: "PG-13",
        Released: "15 Jul 2011",
        Runtime: "130 min",
        Genre: "Adventure, Fantasy, Mystery",
        Director: "David Yates",
        Writer: "Steve Kloves, J.K. Rowling",
        Actors: "Daniel Radcliffe, Emma Watson, Rupert Grint",
        Plot: "Harry, Ron, and Hermione search for Voldemort's remaining Horcruxes in their effort to destroy the Dark Lord as the final battle rages on at Hogwarts.",
        Language: "English, Latin",
        Country: "United Kingdom, United States",
        Awards: "Nominated for 3 Oscars. 46 wins & 94 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMGVmMWNiMDktYjQ0Mi00MWIxLTk0N2UtN2ZlYTdkN2IzNDNlXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "8.1/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "96%",
          },
          {
            Source: "Metacritic",
            Value: "85/100",
          },
        ],
        Metascore: "85",
        imdbRating: "8.1",
        imdbVotes: "810,964",
        imdbID: "tt1201607",
        Type: "movie",
        DVD: "11 Nov 2011",
        BoxOffice: "$381,409,310",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "a749b314-234b-4b8d-a867-c783890d03da",
      },
      "5f687742-5a46-4c3a-911b-1e9ba066d458": {
        Title: "Hulk",
        Year: "2003",
        Rated: "PG-13",
        Released: "20 Jun 2003",
        Runtime: "138 min",
        Genre: "Action, Sci-Fi",
        Director: "Ang Lee",
        Writer: "Stan Lee, Jack Kirby, James Schamus",
        Actors: "Eric Bana, Jennifer Connelly, Sam Elliott",
        Plot: "Bruce Banner, a genetics researcher with a tragic past, suffers an accident that causes him to transform into a raging green monster when he gets angry.",
        Language: "English, Spanish",
        Country: "United States",
        Awards: "3 wins & 14 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMzQwZDg1MGEtN2E5My00ZDJlLWI4MzItM2U2MjJhYzlkNmEzXkEyXkFqcGdeQXVyNDAxNjkxNjQ@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "5.6/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "62%",
          },
          {
            Source: "Metacritic",
            Value: "54/100",
          },
        ],
        Metascore: "54",
        imdbRating: "5.6",
        imdbVotes: "260,218",
        imdbID: "tt0286716",
        Type: "movie",
        DVD: "28 Oct 2003",
        BoxOffice: "$132,177,234",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "5f687742-5a46-4c3a-911b-1e9ba066d458",
      },
      "654cd821-c8c5-41ca-a460-9a5446ca6268": {
        Title: "Hancock",
        Year: "2008",
        Rated: "PG-13",
        Released: "02 Jul 2008",
        Runtime: "92 min",
        Genre: "Action, Drama, Fantasy",
        Director: "Peter Berg",
        Writer: "Vy Vincent Ngo, Vince Gilligan",
        Actors: "Will Smith, Charlize Theron, Jason Bateman",
        Plot: "Hancock is a superhero whose ill-considered behavior regularly causes damage in the millions. He changes when the person he saves helps him improve his public image.",
        Language: "English, Japanese, Vietnamese",
        Country: "United States",
        Awards: "4 wins & 14 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMTgyMzc4ODU3NV5BMl5BanBnXkFtZTcwNjk5Mzc1MQ@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "6.4/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "41%",
          },
          {
            Source: "Metacritic",
            Value: "49/100",
          },
        ],
        Metascore: "49",
        imdbRating: "6.4",
        imdbVotes: "462,592",
        imdbID: "tt0448157",
        Type: "movie",
        DVD: "25 Nov 2008",
        BoxOffice: "$227,946,274",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "654cd821-c8c5-41ca-a460-9a5446ca6268",
      },
      "a1a6d395-ad16-44df-9bdd-36c2f1d8aa3a": {
        Title: "Forrest Gump",
        Year: "1994",
        Rated: "PG-13",
        Released: "06 Jul 1994",
        Runtime: "142 min",
        Genre: "Drama, Romance",
        Director: "Robert Zemeckis",
        Writer: "Winston Groom, Eric Roth",
        Actors: "Tom Hanks, Robin Wright, Gary Sinise",
        Plot: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweeth",
        Language: "English",
        Country: "United States",
        Awards: "Won 6 Oscars. 50 wins & 75 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "8.8/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "71%",
          },
          {
            Source: "Metacritic",
            Value: "82/100",
          },
        ],
        Metascore: "82",
        imdbRating: "8.8",
        imdbVotes: "1,926,048",
        imdbID: "tt0109830",
        Type: "movie",
        DVD: "28 Aug 2001",
        BoxOffice: "$330,455,270",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "a1a6d395-ad16-44df-9bdd-36c2f1d8aa3a",
      },
      "e3efc0e5-cb49-49d5-8184-b09341fbb7b5": {
        Title: "The Vampire Diaries",
        Year: "2009–2017",
        Rated: "TV-14",
        Released: "10 Sep 2009",
        Runtime: "43 min",
        Genre: "Drama, Fantasy, Horror",
        Director: "N/A",
        Writer: "Julie Plec, Kevin Williamson",
        Actors: "Nina Dobrev, Paul Wesley, Ian Somerhalder",
        Plot: "The lives, loves, dangers and disasters in the town, Mystic Falls, Virginia. Creatures of unspeakable horror lurk beneath this town as a teenage girl is suddenly torn between two vampire brothers.",
        Language: "English",
        Country: "United States",
        Awards: "37 wins & 67 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMDk3YzgxNDQtNTEzOS00NDMyLWFlYmYtYTZlMDk1NDkxNmMyXkEyXkFqcGdeQXVyNzA5NjUyNjM@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.7/10",
          },
        ],
        Metascore: "N/A",
        imdbRating: "7.7",
        imdbVotes: "302,110",
        imdbID: "tt1405406",
        Type: "series",
        totalSeasons: "8",
        Response: "True",
        _id: "e3efc0e5-cb49-49d5-8184-b09341fbb7b5",
      },
      "b2f53d60-5767-4468-aeed-9b1fe0d1a2da": {
        Title: "Spider-Man",
        Year: "2002",
        Rated: "PG-13",
        Released: "03 May 2002",
        Runtime: "121 min",
        Genre: "Action, Adventure, Sci-Fi",
        Director: "Sam Raimi",
        Writer: "Stan Lee, Steve Ditko, David Koepp",
        Actors: "Tobey Maguire, Kirsten Dunst, Willem Dafoe",
        Plot: "When bitten by a genetically modified spider, a nerdy, shy, and awkward high school student gains spider-like abilities that he eventually must use to fight evil as a superhero after tragedy befalls his family.",
        Language: "English",
        Country: "United States",
        Awards: "Nominated for 2 Oscars. 16 wins & 63 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BZDEyN2NhMjgtMjdhNi00MmNlLWE5YTgtZGE4MzNjMTRlMGEwXkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.3/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "90%",
          },
          {
            Source: "Metacritic",
            Value: "73/100",
          },
        ],
        Metascore: "73",
        imdbRating: "7.3",
        imdbVotes: "733,711",
        imdbID: "tt0145487",
        Type: "movie",
        DVD: "01 Nov 2002",
        BoxOffice: "$407,022,860",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "b2f53d60-5767-4468-aeed-9b1fe0d1a2da",
      },
      "6037b5a0-405f-4eeb-9619-7d71389371a7": {
        Title: "Scream",
        Year: "1996",
        Rated: "R",
        Released: "20 Dec 1996",
        Runtime: "111 min",
        Genre: "Horror, Mystery",
        Director: "Wes Craven",
        Writer: "Kevin Williamson",
        Actors: "Neve Campbell, Courteney Cox, David Arquette",
        Plot: "A year after the murder of her mother, a teenage girl is terrorized by a new killer, who targets the girl and her friends by using horror films as part of a deadly game.",
        Language: "English",
        Country: "United States",
        Awards: "11 wins & 11 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMjA2NjU5MTg5OF5BMl5BanBnXkFtZTgwOTkyMzQxMDE@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.3/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "79%",
          },
          {
            Source: "Metacritic",
            Value: "65/100",
          },
        ],
        Metascore: "65",
        imdbRating: "7.3",
        imdbVotes: "312,333",
        imdbID: "tt0117571",
        Type: "movie",
        DVD: "08 Dec 1998",
        BoxOffice: "$103,046,663",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "6037b5a0-405f-4eeb-9619-7d71389371a7",
      },
      "d7a3b475-78a5-4efa-a1f8-d6dc0c7f4d1f": {
        Title: "The Shawshank Redemption",
        Year: "1994",
        Rated: "R",
        Released: "14 Oct 1994",
        Runtime: "142 min",
        Genre: "Drama",
        Director: "Frank Darabont",
        Writer: "Stephen King, Frank Darabont",
        Actors: "Tim Robbins, Morgan Freeman, Bob Gunton",
        Plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        Language: "English",
        Country: "United States",
        Awards: "Nominated for 7 Oscars. 21 wins & 43 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "9.3/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "91%",
          },
          {
            Source: "Metacritic",
            Value: "80/100",
          },
        ],
        Metascore: "80",
        imdbRating: "9.3",
        imdbVotes: "2,503,692",
        imdbID: "tt0111161",
        Type: "movie",
        DVD: "21 Dec 1999",
        BoxOffice: "$28,699,976",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "d7a3b475-78a5-4efa-a1f8-d6dc0c7f4d1f",
      },
      "7a46ddee-4b50-41c8-9c5c-6ec857db956a": {
        Title: "The Dark Knight",
        Year: "2008",
        Rated: "PG-13",
        Released: "18 Jul 2008",
        Runtime: "152 min",
        Genre: "Action, Crime, Drama",
        Director: "Christopher Nolan",
        Writer: "Jonathan Nolan, Christopher Nolan, David S. Goyer",
        Actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
        Plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        Language: "English, Mandarin",
        Country: "United States, United Kingdom",
        Awards: "Won 2 Oscars. 159 wins & 163 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "9.0/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "94%",
          },
          {
            Source: "Metacritic",
            Value: "84/100",
          },
        ],
        Metascore: "84",
        imdbRating: "9.0",
        imdbVotes: "2,443,960",
        imdbID: "tt0468569",
        Type: "movie",
        DVD: "09 Dec 2008",
        BoxOffice: "$534,858,444",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "7a46ddee-4b50-41c8-9c5c-6ec857db956a",
      },
      "586300a9-1fb8-4811-a168-51c627c3b24a": {
        Title: "Pulp Fiction",
        Year: "1994",
        Rated: "R",
        Released: "14 Oct 1994",
        Runtime: "154 min",
        Genre: "Crime, Drama",
        Director: "Quentin Tarantino",
        Writer: "Quentin Tarantino, Roger Avary",
        Actors: "John Travolta, Uma Thurman, Samuel L. Jackson",
        Plot: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        Language: "English, Spanish, French",
        Country: "United States",
        Awards: "Won 1 Oscar. 70 wins & 75 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "8.9/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "92%",
          },
          {
            Source: "Metacritic",
            Value: "94/100",
          },
        ],
        Metascore: "94",
        imdbRating: "8.9",
        imdbVotes: "1,926,015",
        imdbID: "tt0110912",
        Type: "movie",
        DVD: "20 Aug 2002",
        BoxOffice: "$107,928,762",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "586300a9-1fb8-4811-a168-51c627c3b24a",
      },
      "533b31f4-644b-4d20-a28c-036a1e23a829": {
        Title: "Fight Club",
        Year: "1999",
        Rated: "R",
        Released: "15 Oct 1999",
        Runtime: "139 min",
        Genre: "Drama",
        Director: "David Fincher",
        Writer: "Chuck Palahniuk, Jim Uhls",
        Actors: "Brad Pitt, Edward Norton, Meat Loaf",
        Plot: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
        Language: "English",
        Country: "Germany, United States",
        Awards: "Nominated for 1 Oscar. 11 wins & 38 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "8.8/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "79%",
          },
          {
            Source: "Metacritic",
            Value: "66/100",
          },
        ],
        Metascore: "66",
        imdbRating: "8.8",
        imdbVotes: "1,969,614",
        imdbID: "tt0137523",
        Type: "movie",
        DVD: "14 Oct 2003",
        BoxOffice: "$37,030,102",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "533b31f4-644b-4d20-a28c-036a1e23a829",
      },
      "8513ba3c-0155-4e2f-8f2e-8fbda93512a8": {
        Title: "The Crack: Inception",
        Year: "2019",
        Rated: "N/A",
        Released: "04 Oct 2019",
        Runtime: "122 min",
        Genre: "Drama",
        Director: "José Luis Garci",
        Writer: "José Luis Garci, Javier Muñoz",
        Actors: "Carlos Santos, Miguel Ángel Muñoz, Luisa Gavasa",
        Plot: "In this prequel, Germán Areta leaves his position as a policeman to become a private detective in post-Francoist Spain.",
        Language: "Spanish, English",
        Country: "Spain",
        Awards: "4 wins & 7 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BZTU1M2U4OWUtZTQ5OS00OWM1LTljN2EtMWJmZDgxNzUwZGNkXkEyXkFqcGdeQXVyMTA0MjU0Ng@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "6.7/10",
          },
        ],
        Metascore: "N/A",
        imdbRating: "6.7",
        imdbVotes: "712",
        imdbID: "tt6793710",
        Type: "movie",
        DVD: "N/A",
        BoxOffice: "N/A",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "8513ba3c-0155-4e2f-8f2e-8fbda93512a8",
      },
      "942bb3a3-8327-4493-be5a-b89096a7fea9": {
        Title: "Goodfellas",
        Year: "1990",
        Rated: "R",
        Released: "21 Sep 1990",
        Runtime: "146 min",
        Genre: "Biography, Crime, Drama",
        Director: "Martin Scorsese",
        Writer: "Nicholas Pileggi, Martin Scorsese",
        Actors: "Robert De Niro, Ray Liotta, Joe Pesci",
        Plot: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.",
        Language: "English, Italian",
        Country: "United States",
        Awards: "Won 1 Oscar. 44 wins & 38 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "8.7/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "96%",
          },
          {
            Source: "Metacritic",
            Value: "90/100",
          },
        ],
        Metascore: "90",
        imdbRating: "8.7",
        imdbVotes: "1,080,378",
        imdbID: "tt0099685",
        Type: "movie",
        DVD: "22 Aug 1997",
        BoxOffice: "$46,836,214",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "942bb3a3-8327-4493-be5a-b89096a7fea9",
      },
      "28139abb-8d40-4aef-a374-9b4d93b0b939": {
        Title: "Love.net",
        Year: "2011",
        Rated: "N/A",
        Released: "01 Apr 2011",
        Runtime: "109 min",
        Genre: "Drama, Romance",
        Director: "Ilian Djevelekov",
        Writer: "Nelly Dimitrova, Matey Konstantinov, Ilian Djevelekov",
        Actors: "Hristo Shopov, Zachary Baharov, Lilia Marvilya",
        Plot: "Follows the parallel stories of a number of characters who are trying to change their lives via the Internet or are simply having fun online.",
        Language: "Bulgarian, English",
        Country: "Bulgaria",
        Awards: "8 wins & 8 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMTkzNjA2MDU4NV5BMl5BanBnXkFtZTcwOTMyNDg0NQ@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.4/10",
          },
        ],
        Metascore: "N/A",
        imdbRating: "7.4",
        imdbVotes: "3,727",
        imdbID: "tt1705120",
        Type: "movie",
        DVD: "N/A",
        BoxOffice: "N/A",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "28139abb-8d40-4aef-a374-9b4d93b0b939",
      },
      "f3f40492-5ac5-4db8-b8ec-e5ed797c8870": {
        Title: "The Purge",
        Year: "2013",
        Rated: "R",
        Released: "07 Jun 2013",
        Runtime: "85 min",
        Genre: "Horror, Sci-Fi, Thriller",
        Director: "James DeMonaco",
        Writer: "James DeMonaco",
        Actors: "Ethan Hawke, Lena Headey, Max Burkholder",
        Plot: "A wealthy family is held hostage for harboring the target of a murderous syndicate during the Purge, a 12-hour period in which any and all crime is legal.",
        Language: "English",
        Country: "United States, France",
        Awards: "2 wins & 6 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMTQzNTcwODEyM15BMl5BanBnXkFtZTcwMjM1MDI0OQ@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "5.7/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "39%",
          },
          {
            Source: "Metacritic",
            Value: "41/100",
          },
        ],
        Metascore: "41",
        imdbRating: "5.7",
        imdbVotes: "214,777",
        imdbID: "tt2184339",
        Type: "movie",
        DVD: "15 Jan 2013",
        BoxOffice: "$64,473,115",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "f3f40492-5ac5-4db8-b8ec-e5ed797c8870",
      },
      "d9ec190f-206e-4f65-9ecd-141c21ba0530": {
        Title: "The Silence of the Lambs",
        Year: "1991",
        Rated: "R",
        Released: "14 Feb 1991",
        Runtime: "118 min",
        Genre: "Crime, Drama, Thriller",
        Director: "Jonathan Demme",
        Writer: "Thomas Harris, Ted Tally",
        Actors: "Jodie Foster, Anthony Hopkins, Lawrence A. Bonney",
        Plot: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.",
        Language: "English, Latin",
        Country: "United States",
        Awards: "Won 5 Oscars. 69 wins & 51 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "8.6/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "96%",
          },
          {
            Source: "Metacritic",
            Value: "85/100",
          },
        ],
        Metascore: "85",
        imdbRating: "8.6",
        imdbVotes: "1,344,863",
        imdbID: "tt0102926",
        Type: "movie",
        DVD: "21 Aug 2001",
        BoxOffice: "$130,742,922",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "d9ec190f-206e-4f65-9ecd-141c21ba0530",
      },
      "ba2a6282-7d49-41fe-90cb-b23ed8327aa4": {
        Title: "The Power of the Dog",
        Year: "2021",
        Rated: "R",
        Released: "01 Dec 2021",
        Runtime: "126 min",
        Genre: "Drama, Romance, Western",
        Director: "Jane Campion",
        Writer: "Jane Campion, Thomas Savage",
        Actors: "Benedict Cumberbatch, Kirsten Dunst, Jesse Plemons",
        Plot: "Charismatic rancher Phil Burbank inspires fear and awe in those around him. When his brother brings home a new wife and her son, Phil torments them until he finds himself exposed to the possibility of love.",
        Language: "English",
        Country:
          "United Kingdom, Australia, United States, Canada, New Zealand",
        Awards: "5 wins & 6 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BZGRhYjE2NWUtN2FkNy00NGI3LTkxYWMtMDk4Yjg5ZjI3MWI2XkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "6.9/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "96%",
          },
          {
            Source: "Metacritic",
            Value: "90/100",
          },
        ],
        Metascore: "90",
        imdbRating: "6.9",
        imdbVotes: "5,186",
        imdbID: "tt10293406",
        Type: "movie",
        DVD: "01 Dec 2021",
        BoxOffice: "N/A",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "ba2a6282-7d49-41fe-90cb-b23ed8327aa4",
      },
      "25208dad-c189-472b-afee-8a5c2dff54e9": {
        Title: "Spider-Man: No Way Home",
        Year: "2021",
        Rated: "N/A",
        Released: "17 Dec 2021",
        Runtime: "N/A",
        Genre: "Action, Adventure, Sci-Fi",
        Director: "Jon Watts",
        Writer: "Chris McKenna, Erik Sommers, Stan Lee",
        Actors: "Zendaya, Benedict Cumberbatch, Tom Holland",
        Plot: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.",
        Language: "English",
        Country: "United States, Iceland",
        Awards: "N/A",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMDUzNWJhZWQtYzU3Zi00M2NjLThjZjEtMTRmMjRmNzBmMWI2XkEyXkFqcGdeQXVyODIyOTEyMzY@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Rotten Tomatoes",
            Value: "95%",
          },
        ],
        Metascore: "N/A",
        imdbRating: "N/A",
        imdbVotes: "N/A",
        imdbID: "tt10872600",
        Type: "movie",
        DVD: "N/A",
        BoxOffice: "N/A",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "25208dad-c189-472b-afee-8a5c2dff54e9",
      },
      "c1e7f6f0-217a-4cc3-a803-5e1998412cc1": {
        Title: "The Matrix Resurrections",
        Year: "2021",
        Rated: "R",
        Released: "22 Dec 2021",
        Runtime: "148 min",
        Genre: "Action, Sci-Fi",
        Director: "Lana Wachowski",
        Writer: "Lana Wachowski, David Mitchell, Aleksandar Hemon",
        Actors: "Keanu Reeves, Christina Ricci, Carrie-Anne Moss",
        Plot: "The plot is currently unknown.",
        Language: "English",
        Country: "United States",
        Awards: "1 nomination",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMGJkNDJlZWUtOGM1Ny00YjNkLThiM2QtY2ZjMzQxMTIxNWNmXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg",
        Ratings: [],
        Metascore: "N/A",
        imdbRating: "N/A",
        imdbVotes: "N/A",
        imdbID: "tt10838180",
        Type: "movie",
        DVD: "22 Dec 2021",
        BoxOffice: "N/A",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "c1e7f6f0-217a-4cc3-a803-5e1998412cc1",
      },
      "7dc2caab-a81b-46fd-8727-c9dbe9461344": {
        Title: "House of Gucci",
        Year: "2021",
        Rated: "R",
        Released: "24 Nov 2021",
        Runtime: "158 min",
        Genre: "Crime, Drama",
        Director: "Ridley Scott",
        Writer: "Becky Johnston, Roberto Bentivegna, Sara Gay Forden",
        Actors: "Lady Gaga, Adam Driver, Al Pacino",
        Plot: "When Patrizia Reggiani, an outsider from humble beginnings, marries into the Gucci family, her unbridled ambition begins to unravel their legacy and triggers a reckless spiral of betrayal, decadence, revenge, and ultimately...murder.",
        Language: "English, Italian, Arabic, French, Japanese",
        Country: "Canada, United States",
        Awards: "2 wins & 12 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BYzdlMTMyZWQtZWNmMC00MTJiLWIyMWMtM2ZlZDdlYzZhNTc0XkEyXkFqcGdeQXVyMTMzNDE5NDM2._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "6.9/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "60%",
          },
        ],
        Metascore: "N/A",
        imdbRating: "6.9",
        imdbVotes: "32,031",
        imdbID: "tt11214590",
        Type: "movie",
        DVD: "N/A",
        BoxOffice: "$41,083,400",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "7dc2caab-a81b-46fd-8727-c9dbe9461344",
      },
      "4ac8200b-b392-4f0a-8409-337d8a84aa3e": {
        Title: "Dune",
        Year: "2021",
        Rated: "PG-13",
        Released: "22 Oct 2021",
        Runtime: "155 min",
        Genre: "Action, Adventure, Drama",
        Director: "Denis Villeneuve",
        Writer: "Jon Spaihts, Denis Villeneuve, Eric Roth",
        Actors: "Timothée Chalamet, Rebecca Ferguson, Zendaya",
        Plot: "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.",
        Language: "English, Mandarin",
        Country: "United States, Canada",
        Awards: "28 wins & 92 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg5YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "8.2/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "83%",
          },
          {
            Source: "Metacritic",
            Value: "74/100",
          },
        ],
        Metascore: "74",
        imdbRating: "8.2",
        imdbVotes: "388,464",
        imdbID: "tt1160419",
        Type: "movie",
        DVD: "22 Oct 2021",
        BoxOffice: "$106,450,591",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "4ac8200b-b392-4f0a-8409-337d8a84aa3e",
      },
      "cf8dec4b-95fa-476a-af6f-1057507b5f76": {
        Title: "The Unforgivable",
        Year: "2021",
        Rated: "R",
        Released: "10 Dec 2021",
        Runtime: "112 min",
        Genre: "Crime, Drama",
        Director: "Nora Fingscheidt",
        Writer: "Peter Craig, Hillary Seitz, Courtenay Miles",
        Actors: "Sandra Bullock, Viola Davis, Vincent D'Onofrio",
        Plot: "A woman is released from prison after serving a sentence for a violent crime and re-enters a society that refuses to forgive her past.",
        Language: "English",
        Country: "Germany, United States, United Kingdom",
        Awards: "N/A",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BM2M5MTJmOTEtNWU1Yy00NDNmLWI3MjMtNzFkN2FiZjE5Njg3XkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "6.3/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "40%",
          },
        ],
        Metascore: "N/A",
        imdbRating: "6.3",
        imdbVotes: "179",
        imdbID: "tt11233960",
        Type: "movie",
        DVD: "10 Dec 2021",
        BoxOffice: "N/A",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "cf8dec4b-95fa-476a-af6f-1057507b5f76",
      },
      "2bbe84a1-96d1-427b-86ed-507f1b35b851": {
        Title: "Ghostbusters: Afterlife",
        Year: "2021",
        Rated: "PG-13",
        Released: "19 Nov 2021",
        Runtime: "124 min",
        Genre: "Adventure, Comedy, Fantasy",
        Director: "Jason Reitman",
        Writer: "Gil Kenan, Jason Reitman, Dan Aykroyd",
        Actors: "Carrie Coon, Paul Rudd, Finn Wolfhard",
        Plot: "When a single mom and her two kids arrive in a small town, they begin to discover their connection to the original Ghostbusters and the secret legacy their grandfather left behind.",
        Language: "English",
        Country: "United States, Canada",
        Awards: "1 nomination",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMmZiMjdlN2UtYzdiZS00YjgxLTgyZGMtYzE4ZGU5NTlkNjhhXkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.6/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "63%",
          },
          {
            Source: "Metacritic",
            Value: "59/100",
          },
        ],
        Metascore: "59",
        imdbRating: "7.6",
        imdbVotes: "42,333",
        imdbID: "tt4513678",
        Type: "movie",
        DVD: "10 Jan 2022",
        BoxOffice: "$112,004,281",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "2bbe84a1-96d1-427b-86ed-507f1b35b851",
      },
      "98a8bbf2-9072-4c99-9ad5-c61575992a2b": {
        Title: "No Time to Die",
        Year: "2021",
        Rated: "PG-13",
        Released: "08 Oct 2021",
        Runtime: "163 min",
        Genre: "Action, Adventure, Thriller",
        Director: "Cary Joji Fukunaga",
        Writer: "Neal Purvis, Robert Wade, Cary Joji Fukunaga",
        Actors: "Daniel Craig, Ana de Armas, Rami Malek",
        Plot: "James Bond has left active service. His peace is short-lived when Felix Leiter, an old friend from the CIA, turns up asking for help, leading Bond onto the trail of a mysterious villain armed with dangerous new technology.",
        Language: "English, French, Italian, Russian, Spanish, German",
        Country: "United Kingdom, United States",
        Awards: "1 win & 9 nominations",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BYWQ2NzQ1NjktMzNkNS00MGY1LTgwMmMtYTllYTI5YzNmMmE0XkEyXkFqcGdeQXVyMjM4NTM5NDY@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.5/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "84%",
          },
          {
            Source: "Metacritic",
            Value: "68/100",
          },
        ],
        Metascore: "68",
        imdbRating: "7.5",
        imdbVotes: "235,365",
        imdbID: "tt2382320",
        Type: "movie",
        DVD: "09 Nov 2021",
        BoxOffice: "$160,538,078",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "98a8bbf2-9072-4c99-9ad5-c61575992a2b",
      },
      "81bc7463-8bdb-48f0-8426-94a85f6dc506": {
        Title: "Red Notice",
        Year: "2021",
        Rated: "PG-13",
        Released: "12 Nov 2021",
        Runtime: "118 min",
        Genre: "Action, Adventure, Comedy",
        Director: "Rawson Marshall Thurber",
        Writer: "Rawson Marshall Thurber",
        Actors: "Dwayne Johnson, Ryan Reynolds, Gal Gadot",
        Plot: "An Interpol agent tracks the world's most wanted art thief.",
        Language: "English",
        Country: "United States",
        Awards: "N/A",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BZmRjODgyMzEtMzIxYS00OWY2LTk4YjUtMGMzZjMzMTZiN2Q0XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "6.4/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "35%",
          },
          {
            Source: "Metacritic",
            Value: "39/100",
          },
        ],
        Metascore: "39",
        imdbRating: "6.4",
        imdbVotes: "70,263",
        imdbID: "tt7991608",
        Type: "movie",
        DVD: "12 Nov 2021",
        BoxOffice: "N/A",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "81bc7463-8bdb-48f0-8426-94a85f6dc506",
      },
      "98117db0-bcf1-469f-8f5b-07cc6fa89e27": {
        Title: "Eternal",
        Year: "2004",
        Rated: "R",
        Released: "08 Jul 2005",
        Runtime: "107 min",
        Genre: "Horror, Mystery, Thriller",
        Director: "Wilhelm Liebenberg, Federico Sanchez",
        Writer: "Wilhelm Liebenberg, Federico Sanchez",
        Actors: "Caroline Néron, Sarah Manninen, Victoria Sanchez",
        Plot: "Detective Raymond Pope is a detective of questionable morals, searching for his missing wife. His investigation leads him to the wealthy estate of the enigmatic Elizabeth Kane and her young maid Irina.",
        Language: "English",
        Country: "Canada",
        Awards: "N/A",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMzgxNDI0NzQ3NF5BMl5BanBnXkFtZTcwNDI2MDEzMQ@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "4.8/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "21%",
          },
          {
            Source: "Metacritic",
            Value: "43/100",
          },
        ],
        Metascore: "43",
        imdbRating: "4.8",
        imdbVotes: "1,397",
        imdbID: "tt0382019",
        Type: "movie",
        DVD: "18 Oct 2005",
        BoxOffice: "$28,089",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "98117db0-bcf1-469f-8f5b-07cc6fa89e27",
      },
      "92cec336-7a90-4d2e-b06b-b2144d025bca": {
        Title: "Venom: Let There Be Carnage",
        Year: "2021",
        Rated: "PG-13",
        Released: "01 Oct 2021",
        Runtime: "97 min",
        Genre: "Action, Adventure, Sci-Fi",
        Director: "Andy Serkis",
        Writer: "Kelly Marcel, Tom Hardy, Todd McFarlane",
        Actors: "Tom Hardy, Woody Harrelson, Michelle Williams",
        Plot: "Eddie Brock attempts to reignite his career by interviewing serial killer Cletus Kasady, who becomes the host of the symbiote Carnage and escapes prison after a failed execution.",
        Language: "English",
        Country: "United States, United Kingdom, Canada",
        Awards: "N/A",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BYTc3ZTAwYTgtMmM4ZS00MDRiLWI2Y2EtYmRiZmE0YjkzMGY1XkEyXkFqcGdeQXVyMDA4NzMyOA@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "6.3/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "59%",
          },
          {
            Source: "Metacritic",
            Value: "48/100",
          },
        ],
        Metascore: "48",
        imdbRating: "6.3",
        imdbVotes: "69,425",
        imdbID: "tt7097896",
        Type: "movie",
        DVD: "N/A",
        BoxOffice: "$203,700,066",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "92cec336-7a90-4d2e-b06b-b2144d025bca",
      },
      "43516b68-5755-46c5-8aed-45385c14d6ab": {
        Title: "Love Actually",
        Year: "2003",
        Rated: "R",
        Released: "14 Nov 2003",
        Runtime: "135 min",
        Genre: "Comedy, Drama, Romance",
        Director: "Richard Curtis",
        Writer: "Richard Curtis",
        Actors: "Hugh Grant, Martine McCutcheon, Liam Neeson",
        Plot: "Follows the lives of eight very different couples in dealing with their love lives in various loosely interrelated tales all set during a frantic month before Christmas in London, England.",
        Language: "English, Portuguese, French",
        Country: "United Kingdom, France, United States",
        Awards: "10 wins & 29 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMTY4NjQ5NDc0Nl5BMl5BanBnXkFtZTYwNjk5NDM3._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.6/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "64%",
          },
          {
            Source: "Metacritic",
            Value: "55/100",
          },
        ],
        Metascore: "55",
        imdbRating: "7.6",
        imdbVotes: "450,295",
        imdbID: "tt0314331",
        Type: "movie",
        DVD: "27 Apr 2004",
        BoxOffice: "$59,696,144",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "43516b68-5755-46c5-8aed-45385c14d6ab",
      },
      "d7afd676-ad17-497a-bbad-d6bfef1d41b2": {
        Title: "West Side Story",
        Year: "1961",
        Rated: "Approved",
        Released: "18 Oct 1961",
        Runtime: "153 min",
        Genre: "Crime, Drama, Musical",
        Director: "Jerome Robbins, Robert Wise",
        Writer: "Ernest Lehman, Arthur Laurents, Jerome Robbins",
        Actors: "Natalie Wood, George Chakiris, Richard Beymer",
        Plot: "Two youngsters from rival New York City gangs fall in love, but tensions between their respective friends build toward tragedy.",
        Language: "English, Spanish",
        Country: "United States",
        Awards: "Won 10 Oscars. 28 wins & 10 nominations total",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BMTM0NDAxOTI5MF5BMl5BanBnXkFtZTcwNjI4Mjg3NA@@._V1_SX300.jpg",
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: "7.5/10",
          },
          {
            Source: "Rotten Tomatoes",
            Value: "93%",
          },
          {
            Source: "Metacritic",
            Value: "86/100",
          },
        ],
        Metascore: "86",
        imdbRating: "7.5",
        imdbVotes: "102,682",
        imdbID: "tt0055614",
        Type: "movie",
        DVD: "01 Aug 2006",
        BoxOffice: "$44,055,492",
        Production: "N/A",
        Website: "N/A",
        Response: "True",
        _id: "d7afd676-ad17-497a-bbad-d6bfef1d41b2",
      },
      "f8f1a4ee-01dd-4fde-b169-2c644e52e0c6": {
        Title: "Dexter New Blood",
        Genre: "Crime",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BNGQ3MDU2YWEtYzJmZC00YzUxLWExMDYtYjk4MzJkZjMyNTZmXkEyXkFqcGdeQXVyOTA3MTMyOTk@._V1_.jpg",
        Year: "2021",
        Runtime: "60",
        imdbRating: "9",
        Plot: "Set 10 years after Dexter Morgan went \r\nmissing in the eye of Hurricane Laura, he \r\nis now living under an assumed name in \r\nUpstate New York, Iron Lake, far from his \r\noriginal home in Miami.",
        _id: "f8f1a4ee-01dd-4fde-b169-2c644e52e0c6",
      },
      "33d64c49-6f63-4215-9345-f2dadd237633": {
        Title: "Dexter New Blood",
        Genre: "Crime",
        Poster:
          "https://m.media-amazon.com/images/M/MV5BNGQ3MDU2YWEtYzJmZC00YzUxLWExMDYtYjk4MzJkZjMyNTZmXkEyXkFqcGdeQXVyOTA3MTMyOTk@._V1_.jpg",
        Year: "2021",
        Runtime: "60",
        imdbRating: "9",
        Plot: "Set 10 years after Dexter Morgan went \r\nmissing in the eye of Hurricane Laura, he \r\nis now living under an assumed name in \r\nUpstate New York, Iron Lake, far from his \r\noriginal home in Miami.",
        _id: "33d64c49-6f63-4215-9345-f2dadd237633",
      },
    },
  };
  var rules$1 = {
    users: {
      ".create": false,
      ".read": ["Owner"],
      ".update": false,
      ".delete": false,
    },
    members: {
      ".update": "isOwner(user, get('teams', data.teamId))",
      ".delete":
        "isOwner(user, get('teams', data.teamId)) || isOwner(user, data)",
      "*": {
        teamId: {
          ".update": "newData.teamId = data.teamId",
        },
        status: {
          ".create": "newData.status = 'pending'",
        },
      },
    },
  };
  var settings = {
    identity: identity,
    protectedData: protectedData,
    seedData: seedData,
    rules: rules$1,
  };

  const plugins = [
    storage(settings),
    auth(settings),
    util$2(),
    rules(settings),
  ];

  const server = http__default["default"].createServer(
    requestHandler(plugins, services)
  );

  const port = 3030;
  server.listen(port);
  console.log(
    `Server started on port ${port}. You can make requests to http://localhost:${port}/`
  );
  console.log(`Admin panel located at http://localhost:${port}/admin`);

  var softuniPracticeServer = {};

  return softuniPracticeServer;
});
