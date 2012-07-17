(function() {
  var $, KeyCombination, KeyEventManager, Keys, Map, ObjectKeyAdapter, OidSupport, PrimitiveKeyAdapter, Set, activeKeys, adapt, equals, get_oid, hash, next_oid, oid, plugin,
    __slice = Array.prototype.slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  next_oid = 0;

  get_oid = function() {
    return next_oid++;
  };

  ObjectKeyAdapter = {
    oid: function(o) {
      if (o.m_oid == null) o.m_oid = get_oid();
      return o.m_oid;
    },
    hash: function(o) {
      return this.oid(o);
    },
    equals: function(o, other) {
      return oid(other) === this.oid(o);
    }
  };

  PrimitiveKeyAdapter = {
    hash: function(o) {
      return o.valueOf();
    },
    oid: function() {
      return o.valueOf();
    },
    equals: function(o, other) {
      return o.valueOf === oid(other);
    }
  };

  adapt = function(o) {
    var type;
    type = typeof o;
    if (type === 'number' || type === 'string' || type === 'boolean') {
      return PrimitiveKeyAdapter;
    } else {
      return ObjectKeyAdapter;
    }
  };

  oid = function(o) {
    if (o.oid != null) {
      return o.oid();
    } else {
      return adapt(o).oid(o);
    }
  };

  hash = function(o) {
    if (o.hash != null) {
      return o.hash();
    } else {
      return adapt(o).hash(o);
    }
  };

  equals = function(o, other) {
    if (o.equals != null) {
      return o.equals(other);
    } else {
      return adapt(o).equals(o, other);
    }
  };

  Set = (function() {

    function Set() {
      this.coll = {};
    }

    Set.prototype.add = function(obj) {
      return this.coll[hash(obj)] = obj;
    };

    Set.prototype.contains = function(obj) {
      return this.coll[hash(obj)] != null;
    };

    Set.prototype.remove = function(obj) {
      return delete this.coll[hash(obj)];
    };

    Set.prototype.values = function() {
      var key, ret;
      ret = new Array();
      for (key in this.coll) {
        if (this.coll.hasOwnProperty(key) && (this.coll[key] != null)) {
          ret.push(this.coll[key]);
        }
      }
      return ret;
    };

    Set.prototype.clear = function() {
      return this.coll = {};
    };

    return Set;

  })();

  Map = (function() {

    function Map() {
      this.coll = {};
    }

    Map.prototype.put = function(key, value) {
      return this.coll[hash(key)] = value;
    };

    Map.prototype.get = function(key) {
      return this.coll[hash(key)];
    };

    return Map;

  })();

  OidSupport = {
    hash: hash,
    oid: oid,
    equals: equals
  };

  Keys = {
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctl: 17,
    alt: 18,
    brk: 19,
    caps: 20,
    esc: 27,
    space: 32,
    pg_up: 33,
    pg_dwn: 34,
    end: 35,
    home: 36,
    arw_left: 37,
    arw_up: 38,
    arw_right: 39,
    arw_down: 40,
    insert: 45,
    dlt: 46,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90
  };

  KeyCombination = (function() {

    function KeyCombination() {
      var arg, args, prime, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args[0] instanceof Array) args = args[0];
      args.sort();
      prime = 31;
      this.mHash = 1;
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        this.mHash = prime * this.mHash + (arg != null ? OidSupport.hash(arg) : 0);
      }
    }

    KeyCombination.prototype.hash = function() {
      return this.mHash;
    };

    return KeyCombination;

  })();

  activeKeys = new Set();

  $(document).ready(function() {
    $(document).keydown(function(e) {
      return activeKeys.add(e.which);
    });
    $(document).keyup(function(e) {
      return activeKeys.add(e.which);
    });
    return $(window).blur(function(e) {
      return activeKeys.clear();
    });
  });

  KeyEventManager = (function() {

    function KeyEventManager(mappings, selector) {
      this.mappings = mappings;
      this.selector = selector;
      this.keyup = __bind(this.keyup, this);
      this.keydown = __bind(this.keydown, this);
      if (!this.mappings) this.mappings = new Map();
      $(document).on({
        keydown: this.keydown,
        keyup: this.keyup
      }, this.selector);
    }

    KeyEventManager.prototype.combo = function() {
      return new KeyCombination(activeKeys.values());
    };

    KeyEventManager.prototype.context = function(key, target, e) {
      return {
        key: key,
        dispatcher: this,
        keys: activeKeys,
        target: target,
        e: e
      };
    };

    KeyEventManager.prototype.keydown = function(e) {
      var mapping;
      activeKeys.add(e.which);
      mapping = this.mappings.get(this.combo());
      if ((mapping != null ? mapping.down : void 0) != null) {
        mapping.down.call(e.target, this.context(e.which, e.target, e));
        return typeof e.preventDefault === "function" ? e.preventDefault() : void 0;
      }
    };

    KeyEventManager.prototype.keyup = function(e) {
      var mapping;
      activeKeys.remove(e.which);
      mapping = this.mappings.get(this.combo());
      if ((mapping != null ? mapping.up : void 0) != null) {
        maping.up.call(e.target, this.context(e.which, e.target, e));
        return typeof e.preventDefault === "function" ? e.preventDefault() : void 0;
      }
    };

    return KeyEventManager;

  })();

  jQuery.fn.keyboard = plugin = function(block) {
    var keyMan, mappings;
    mappings = new Map();
    block.apply(_.extend({
      bind: function() {
        var combo, keys, mapping;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        combo = new KeyCombination(keys);
        mapping = {};
        mappings.put(combo, mapping);
        return {
          down: function(fn) {
            return mapping.down = fn;
          },
          up: function(fn) {
            return mapping.up = fn;
          }
        };
      }
    }, Keys));
    return keyMan = new KeyEventManager(mappings, this.selector);
  };

  plugin.Keys = Keys;

  plugin.KeyCombination = KeyCombination;

  plugin.KeyEventManager = KeyEventManager;

  plugin.commons = {
    Set: Set,
    Map: Map,
    OidSupport: OidSupport
  };

}).call(this);
