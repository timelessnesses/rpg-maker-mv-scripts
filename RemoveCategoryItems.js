/*:
 * @plugindesc Removed category items
 *
 * @author timelessnesses
 *
 * @help
 * This plugin removes category selection for items screen.
*/

(() => {
    
    const _Scene_Item_create = Scene_Item.prototype.create;
    
    Scene_Item.prototype.create = function() {
        Scene_ItemBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createItemWindow();
        this.createActorWindow();
    };
    
    Scene_Item.prototype.createItemWindow = function() {
        var wy = this._helpWindow.height;
        var wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_ItemList(0, wy, Graphics.boxWidth, wh);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._itemWindow);
    
        // Show all items without categorization
        this._itemWindow.setCategory('item');
        this._itemWindow.refresh();
        this._itemWindow.activate();
        this._itemWindow.select(0);
    };
    
    Scene_Item.prototype.user = function() {
        var members = $gameParty.movableMembers();
        var bestActor = members[0];
        var bestPha = 0;
        for (var i = 0; i < members.length; i++) {
            if (members[i].pha > bestPha) {
                bestPha = members[i].pha;
                bestActor = members[i];
            }
        }
        return bestActor;
    };
    
    Scene_Item.prototype.onItemOk = function() {
        $gameParty.setLastItem(this.item());
        this.determineItem();
    };
    
    Scene_Item.prototype.playSeForItem = function() {
        SoundManager.playUseItem();
    };
    
    Scene_Item.prototype.useItem = function() {
        Scene_ItemBase.prototype.useItem.call(this);
        this._itemWindow.redrawCurrentItem();
    };
    

})();
