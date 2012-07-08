_ = require "underscore"
Backbone = require "backbone"

class Action
  constructor: ->
  undo: ->
  redo: ->

class CollectionAddAction extends Action
  constructor: (@collection, @model) ->
  undo: -> @collection.remove(@model)
  redo: -> @collection.add(@model)

class CollectionRemoveAction extends Action
  constructor: (@collection, @model) ->
  undo: -> @collection.add(@model)
  redo: -> @collection.remove(@model)

class ModelPropertyUpdateAction extends Action
  constructor: (@model, @prop, @newVal, @oldVal ) ->
  undo: -> @model.set(@prop, @oldVal)
  redo: -> @model.set(@prop, @newVal)

class ModelUpdateAction extends Action
  constructor: (@model) ->
    @actions = []
    for attr, newVal of @model.changedAttributes()
      @actions.push(new ModelPropertyUpdateAction(@model, attr, newVal, @model.previous(attr)))

  undo: -> _.invoke @actions, 'undo'
  redo: -> _.invoke @actions, 'redo'

Backbone.Regrettable = (->

  undoStack = []
  redoStack = []
  tracking = true

  undoStack: -> undoStack
  redoStack: -> redoStack
  tracking: (t)->
    tracking = t
  undo: ->
    try
      tracking = false
      action = undoStack.pop()
      action.undo()
      redoStack.push(action)
    finally
      tracking = true
  redo: ->
    try
      tracking = false
      action = redoStack.pop()
      action.redo()
      undoStack.push(action)
    finally
      tracking = true
  bind: (o) ->
    if o instanceof Backbone.Model
      o.on "change", (model) ->
        undoStack.push(new ModelUpdateAction(model)) if tracking
    else if o instanceof Backbone.Collection
      o.on "add", (prod) ->
        undoStack.push(new CollectionAddAction(o, prod)) if tracking
      o.on "remove", (prod) ->
        undoStack.push(new CollectionRemoveAction(o, prod)) if tracking
)()


if module?.exports?

  _.extend Backbone.Regrettable,
    CollectionAddAction: CollectionAddAction
    CollectionRemoveAction: CollectionRemoveAction
    ModelUpdateAction: ModelUpdateAction

  module.exports = Backbone.Regrettable




