/*:
 * @plugindesc Overwrites the default Window_TitleCommand to customize the title screen commands' appearance and behavior.
 * @author timelessnesses
 *
 * @help
 * This plugin completely overwrites the Window_TitleCommand class.
 *
 * Features:
 * - Horizontal layout with adjustable spacing.
 * - Window frame and background opacity set to zero.
 * - Custom window size and placement.
 *
 * No plugin commands.
 */

(() => {
    Window_TitleCommand.prototype = Object.create(Window_HorzCommand.prototype);
    Window_TitleCommand.prototype.constructor = Window_TitleCommand;

    Window_TitleCommand.prototype.initialize = function() {
        Window_HorzCommand.prototype.initialize.call(this, 0, 0);
        this.updatePlacement();
        this.openness = 0;
        this.selectLast();
    };

    Window_TitleCommand.prototype.maxCols = function() {
        return 3;
    };

    Window_TitleCommand._lastCommandSymbol = null;

    Window_TitleCommand.initCommandPosition = function() {
        this._lastCommandSymbol = null;
    };

    Window_TitleCommand.prototype.windowWidth = function() {
        return 800;
    };

    Window_TitleCommand.prototype.update = function() {
        Window_HorzCommand.prototype.update.call(this);
        this.opacity = 0;
        this.backOpacity = 0;
        this.contentsOpacity = 255;
    };

    Window_TitleCommand.prototype.itemRect = function(index) {
        const rect = new Rectangle();
        const spacing = 20;
        rect.width = this.itemWidth();
        rect.height = this.itemHeight();
        rect.x = index * (rect.width + spacing);
        rect.y = 0;
        return rect;
    };

    Window_TitleCommand.prototype.updatePlacement = function() {
        this.x = (Graphics.boxWidth - this.width) / 2;
        this.y = Graphics.boxHeight - this.height - 96;
    };

    Window_TitleCommand.prototype.makeCommandList = function() {
        this.addCommand(TextManager.newGame, 'newGame');
        this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
        this.addCommand(TextManager.options, 'options');
    };

    Window_TitleCommand.prototype.isContinueEnabled = function() {
        return DataManager.isAnySavefileExists();
    };

    Window_TitleCommand.prototype.processOk = function() {
        Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
        Window_Command.prototype.processOk.call(this);
    };

    Window_TitleCommand.prototype.selectLast = function() {
        if (Window_TitleCommand._lastCommandSymbol) {
            this.selectSymbol(Window_TitleCommand._lastCommandSymbol);
        } else if (this.isContinueEnabled()) {
            this.selectSymbol('continue');
        }
    };

    Window_TitleCommand.prototype.padding = function() {
        return 40;
    };
})();
