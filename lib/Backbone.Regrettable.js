(function() {
  var Action, ColletionAddAction, ColletionRemoveAction, ModelPropertyUpdateAction, ModelUpdateAction,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (typeof require !== "undefined" && require !== null) require("backbone");

  Action = (function() {

    function Action() {}

    Action.prototype.undo = function() {};

    Action.prototype.redo = function() {};

    return Action;

  })();

  ColletionAddAction = (function(_super) {

    __extends(ColletionAddAction, _super);

    function ColletionAddAction(collection, model) {
      this.collection = collection;
      this.model = model;
    }

    ColletionAddAction.prototype.undo = function() {
      return this.collection.remove(this.model);
    };

    ColletionAddAction.prototype.redo = function() {
      return this.collection.add(this.model);
    };

    return ColletionAddAction;

  })(Action);

  ColletionRemoveAction = (function(_super) {

    __extends(ColletionRemoveAction, _super);

    function ColletionRemoveAction(collection, model) {
      this.collection = collection;
      this.model = model;
    }

    ColletionRemoveAction.prototype.undo = function() {
      return this.collection.add(this.model);
    };

    ColletionRemoveAction.prototype.redo = function() {
      return this.collection.remove(this.model);
    };

    return ColletionRemoveAction;

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
    var redoStack, undoStack;
    undoStack = [];
    redoStack = [];
    return {
      undo: function() {
        var action;
        action = undoStack.pop();
        action.undo();
        return redoStack.push(action);
      },
      redo: function() {
        var action;
        action = redoStack.pop();
        action.redo();
        return undoStack.push(action);
      },
      bind: function(o) {
        if (o instanceof Backbone.Model) {
          return o.on("change", function(model) {
            return undoStack.push(new ModelUpdateAction(model));
          });
        } else if (o instanceof Backbone.Collection) {
          o.on("add", function(prod) {
            return undoStack.push(new CollectionAddAction(o, prod));
          });
          return o.on("remove", function(prod) {
            return undoStack.push(new ColletionRemoveAction(o, prod));
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
