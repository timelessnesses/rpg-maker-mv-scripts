/**
 * @plugindesc AltSaveScreen but saves are in rows instead of tables
*/

/// <reference path="../rmmv.d.ts" />

// const LZString = require("../../lz-string.min");

(function () {

    var _DataManager_makeSaveContents = DataManager.makeSaveContents;

    DataManager.makeSaveContents = function () { 
        var contents = _DataManager_makeSaveContents.call(this);
        contents.screenshot = SceneManager.snapped_image
        return contents;
    };

    var _SceneManager_push = SceneManager.push;
    SceneManager.push = function (sceneClass) {
        if (sceneClass === Scene_Save) {
            SceneManager.snapped_image = SceneManager.snap().canvas.toDataURL("image/png").split(",")[1]; // base64 encoded imagery
        }
        _SceneManager_push.call(this, sceneClass);
    };

    // var _Scene_Save_start = Scene_Save.prototype.start;
    // Scene_Save.prototype.start = function () {
    //     _Scene_Save_start.call(this);
    // };

    const pad_that_shit = 422;

    var _Scene_File_create = Scene_File.prototype.create;
    Scene_File.prototype.create = function () {
        _Scene_File_create.call(this);
        this._listWindow.height = this._listWindow.fittingHeight(8);
        this._listWindow.width -=  pad_that_shit; // left space for image
        var x = 0;
        var y = this._listWindow.y + this._listWindow.height;
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight - y;
        this._statusWindow = new Window_SavefileStatus(x, y, width, height); // we want full size status... not saves
        this._statusWindow.setMode(this.mode());
        this._listWindow.statusWindow = this._statusWindow;
        this._listWindow.callUpdateHelp();
        this.addWindow(this._statusWindow);
    };

    var _Scene_File_start = Scene_File.prototype.start;
    Scene_File.prototype.start = function () {
        _Scene_File_start.call(this);
        this._listWindow.ensureCursorVisible();
        this._listWindow.callUpdateHelp();
    };

    Window_SavefileList.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    };

    Window_SavefileList.prototype.maxCols = function() {
        return 1;
    };

    Window_SavefileList.prototype.numVisibleRows = function() {
        return 5;
    };

    Window_SavefileList.prototype.spacing = function() {
        return 8;
    };

    Window_SavefileList.prototype.itemHeight = function() {
        return this.lineHeight() * 2;
    };

    var _Window_SavefileList_drawItem = Window_SavefileList.prototype.drawItem;
    Window_SavefileList.prototype.drawItem = function (info, rect, valid) { 
        _Window_SavefileList_drawItem.call(this, info, rect, valid);
    }

    Window_SavefileList.prototype.drawContents = function (info, rect, valid) { 
        var bottom = rect.y + rect.height;
        var lineHeight = this.lineHeight();
        var y2 = bottom - lineHeight;
        if (y2 >= lineHeight) {
            this.drawPlaytime(info, rect.x, y2, rect.width);
        }
    }
    
    var _Window_SavefileList_callUpdateHelp =
            Window_SavefileList.prototype.callUpdateHelp;
    Window_SavefileList.prototype.callUpdateHelp = function() {
        _Window_SavefileList_callUpdateHelp.call(this);
        if (this.active && this.statusWindow) {
            this.statusWindow.setId(this.index() + 1);
        }
    };

    function Window_SavefileStatus() {
        this.initialize.apply(this, arguments);
        this._lastScreenshotSprite = null;
        this._lastRectangle = null;
    }

    Window_SavefileStatus.prototype = Object.create(Window_Base.prototype);
    Window_SavefileStatus.prototype.constructor = Window_SavefileStatus;

    Window_SavefileStatus.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._id = 1;
    };

    Window_SavefileStatus.prototype.setMode = function(mode) {
        this._mode = mode;
    };

    Window_SavefileStatus.prototype.setId = function(id) {
        this._id = id;
        this.refresh();
    };

    Window_SavefileStatus.prototype.refresh = function() {
        this.contents.clear();
        if (this._lastScreenshotSprite !== null) {
            SceneManager._scene.removeChild(this._lastScreenshotSprite);
            this._lastScreenshotSprite.destroy();
            this._lastScreenshotSprite = null;
        }
        if (this._lastRectangle !== null) {
            SceneManager._scene.removeChild(this._lastRectangle);
            this._lastRectangle.destroy();
            this._lastRectangle = null;
        }
        var id = this._id;
        var valid = DataManager.isThisGameFile(id);
        var info = DataManager.loadSavefileInfo(id);
        var rect = this.contents.rect;
        this.resetTextColor();
        if (this._mode === 'load') {
            this.changePaintOpacity(valid);
        }
        this.drawFileId(id, rect.x, rect.y);
        if (info) {
            this.changePaintOpacity(valid);
            this.drawContents(info, rect, valid);
            this.changePaintOpacity(true);
        }
        var actual_savefile = StorageManager.load(id);
        if (actual_savefile) {
            var actual_savefile_info = JSON.parse(actual_savefile);
            if (actual_savefile_info.screenshot) {
                this.drawScreenshot(actual_savefile_info.screenshot, Graphics.boxWidth - pad_that_shit + 5, Graphics.boxHeight - 545);
            } else {
                console.log("No screenshot found in actual savefile for ID " + id);
            }
        }
    };

    Window_SavefileStatus.prototype.drawScreenshot = function (base64Image, x, y) {
        const texture = PIXI.Texture.fromImage("data:image/png;base64," + base64Image);
        const sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        const scale = 0.5;
        sprite.scale.x = scale;
        sprite.scale.y = scale;
        sprite.zIndex = 10;
        
        this.drawBorder(x, y, sprite.width, sprite.height, 0xFFFFFF);

        SceneManager._scene.addChild(sprite);
        this._lastScreenshotSprite = sprite; 
    };

    Window_SavefileStatus.prototype.drawBorder = function (x, y, width, height, color) { 
        const rect = new PIXI.Graphics();
        rect.lineStyle(3, color, 1);
        rect.drawRect(x, y, width, height);     
        rect.zIndex = 11;
        SceneManager._scene.addChild(rect);
        this._lastRectangle = rect;
    }

    Window_SavefileStatus.prototype.drawFileId = function(id, x, y) {
        this.drawText(TextManager.file + ' ' + id, x, y, 180);
    };

    Window_SavefileStatus.prototype.drawContents = function(info, rect, valid) {
        var bottom = rect.y + rect.height;
        var playtimeY = bottom - this.lineHeight();
        this.drawText(info.title, rect.x + 192, rect.y, rect.width - 192);
        if (valid) {
            this.drawPartyfaces(info, rect.x, bottom - 144);
        }
        this.drawText(info.playtime, rect.x, playtimeY, rect.width, 'right');
        
    };

    Window_SavefileStatus.prototype.drawPartyfaces = function(info, x, y) {
        if (info && info.faces) {
            for (var i = 0; i < info.faces.length; i++) {
                var data = info.faces[i];
                this.drawFace(data[0], data[1], x + i * 150, y);
            }
        }
    };
    

})();
