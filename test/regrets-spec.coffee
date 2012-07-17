require "should"
require "../src/regrettable"
Backbone = require "backbone"

{undo,redo,undoStack} = Backbone.Regrettable

describe "Backbone.Regrettable", ->

  it "should undo changes to model properties", ->
    model = new Backbone.Model()
    model.set('foo', 'bar')
    Backbone.Regrettable.bind(model)
    model.set('foo', 'baz')
    undoStack().should.not.be.empty
    undo()
    model.get('foo').should.equal('bar')
    undoStack().should.be.empty

  it "should undo additions to collections", ->

    collection = new Backbone.Collection()
    Backbone.Regrettable.bind(collection)
    model = new Backbone.Model()
    collection.add(model)
    undoStack().should.not.be.empty
    undo()
    collection.length.should.equal(0)
    undoStack().should.be.empty

  it "should undo removals to collections", ->

    collection = new Backbone.Collection()
    Backbone.Regrettable.bind(collection)
    model = new Backbone.Model()
    collection.add(model)
    collection.remove(model)
    collection.length.should.equal(0)
    undo()
    collection.length.should.equal(1)
    collection.models[0].should.equal(model)





