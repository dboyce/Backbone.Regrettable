# Backbone.Regrettable

## About

A simple Backbone plugin for transparent undo/redo on models and collections. 

The plugin hooks into change events on models and add/remove events on collections, recording the changes and allowing
them to undone or replayed; in order for the UI to update automatically (as in the sample below) on an undo or redo, you should listen
to change events on models and add/remove events on collections and update the view appropriately.

Example here: http://dboyce.github.com/Backbone.Regrettable/sample/

### API

The API is attached to Backbone.Regrettable and looks like this:

* bind(object) - tell the plugin to track a model or a collection. Can be called from anywhere, I'd suggest in the initialize function.
* reset() - clear all tracking data (for example, call after a model has been loaded)
* undo() - undo the last action
* redo() - revert the last call to undo
* hasUndo() - checks if there is something to undo
* hasRedo() - checks if there is something to redo

## Usage

```javascript
var ItemModel = Backbone.Model.extend({
    initialize: function() {
        Backbone.Regrettable.bind(this);
    }
});
var ItemList = Backbone.Collection.extend({
    model: ItemModel,
    initialize: function() {
        Backbone.Regrettable.bind(this);
    }
});

$('#undo-button').click(function(){
    Backbone.Regrettable.undo();
});

$('#redo-button').click(function(){
    Backbone.Regrettable.redo();
});
```

## Dependencies

Backbone, underscore and jQuery


