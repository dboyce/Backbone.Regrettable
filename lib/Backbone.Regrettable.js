(function() {
  var Action, Backbone, CollectionAddAction, CollectionRemoveAction, ModelPropertyUpdateAction, ModelUpdateAction, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  _ = typeof require !== "undefined" && require !== null ? require("underscore") : window._;

  Backbone = typeof require !== "undefined" && require !== null ? require("backbone") : window.Backbone;

  Action = (function() {

    function Action() {}

    Action.prototype.undo = function() {};

    Action.prototype.redo = function() {};

    return Action;

  })();

  CollectionAddAction = (function(_super) {

    __extends(CollectionAddAction, _super);

    function CollectionAddAction(collection, model) {
      this.collection = collection;
      this.model = model;
    }

    CollectionAddAction.prototype.undo = function() {
      return this.collection.remove(this.model);
    };

    CollectionAddAction.prototype.redo = function() {
      return this.collection.add(this.model);
    };

    return CollectionAddAction;

  })(Action);

  CollectionRemoveAction = (function(_super) {

    __extends(CollectionRemoveAction, _super);

    function CollectionRemoveAction(collection, model) {
      this.collection = collection;
      this.model = model;
    }

    CollectionRemoveAction.prototype.undo = function() {
      return this.collection.add(this.model);
    };

    CollectionRemoveAction.prototype.redo = function() {
      return this.collection.remove(this.model);
    };

    return CollectionRemoveAction;

  })(Action);

  ModelPropertyUpdateAction = (function(_super) {

    __extends(ModelPropertyUpdateAction, _super);

    function ModelPropertyUpdateAction(model, prop, newVal, oldVal) {
      this.model = model;
      this.prop = prop;
      this.newVal = newVal;
      this.oldVal = oldVal;
    }

    ModelPropertyUpdateAction.prototype.undo = function() {
      return this.model.set(this.prop, this.oldVal);
    };

    ModelPropertyUpdateAction.prototype.redo = function() {
      return this.model.set(this.prop, this.newVal);
    };

    return ModelPropertyUpdateAction;

  })(Action);

  ModelUpdateAction = (function(_super) {

    __extends(ModelUpdateAction, _super);

    function ModelUpdateAction(model) {
      var attr, newVal, _ref;
      this.model = model;
      this.actions = [];
      _ref = this.model.changedAttributes();
      for (attr in _ref) {
        newVal = _ref[attr];
        this.actions.push(new ModelPropertyUpdateAction(this.model, attr, newVal, this.model.previous(attr)));
      }
    }

    ModelUpdateAction.prototype.undo = function() {
      return _.invoke(this.actions, 'undo');
    };

    ModelUpdateAction.prototype.redo = function() {
      return _.invoke(this.actions, 'redo');
    };

    return ModelUpdateAction;

  })(Action);

  Backbone.Regrettable = (function() {
    var redoStack, tracking, undoStack;
    undoStack = [];
    redoStack = [];
    tracking = true;
    return {
      undoStack: function() {
        return undoStack;
      },
      redoStack: function() {
        return redoStack;
      },
      tracking: function(t) {
        return tracking = t;
      },
      undo: function() {
        var action;
        if (undoStack.length === 0) return;
        try {
          tracking = false;
          action = undoStack.pop();
          action.undo();
          return redoStack.push(action);
        } finally {
          tracking = true;
        }
      },
      redo: function() {
        var action;
        if (redoStack.length === 0) return;
        try {
          tracking = false;
          action = redoStack.pop();
          action.redo();
          return undoStack.push(action);
        } finally {
          tracking = true;
        }
      },
      reset: function() {
        undoStack = [];
        return redoStack = [];
      },
      bind: function(o) {
        if (o instanceof Backbone.Model) {
          return o.on("change", function(model) {
            if (tracking) return undoStack.push(new ModelUpdateAction(model));
          });
        } else if (o instanceof Backbone.Collection) {
          o.on("add", function(prod) {
            if (tracking) return undoStack.push(new CollectionAddAction(o, prod));
          });
          return o.on("remove", function(prod) {
            if (tracking) {
              return undoStack.push(new CollectionRemoveAction(o, prod));
            }
          });
        }
      }
    };
  })();

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    _.extend(Backbone.Regrettable, {
      CollectionAddAction: CollectionAddAction,
      CollectionRemoveAction: CollectionRemoveAction,
      ModelUpdateAction: ModelUpdateAction
    });
    module.exports = Backbone.Regrettable;
  }

}).call(this);
