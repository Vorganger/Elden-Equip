import { Debug, Form, FormType, Game, printConsole, Potion } from "@skyrim-platform/skyrim-platform";
import { solveForm, solveInt, solveIntSetter } from "@skyrim-platform/jcontainers/JDB";
import { equip, unequip, writeObjArrToJCon } from "./utilities";
import { ammoCycleUnequip, cycleEditorMessages, leftHandCycleUnequip, rightHandCycleUnequip, voiceCycleUnequip } from "./settings";
import * as settings from "./settings";
import * as consts from "./constants";

// Messages when adding or removing
export function printCycleEditorMessage(message: string) {
    if (!cycleEditorMessages) {
        return;
    }
    Debug.notification(message);
}

export class Cycle {
    arr: number[];
    index: number;
    count: number;
    name: string;
    constructor() {
        this.arr = [];
        this.index = 0;
        this.count = 0;
        this.name = "";
    }
    autoIndex(): void {
        return;
    }
    getItemId(): number {
        let itemID = this.arr[this.index];
        if (!itemID)
            return 0;
        return itemID;
    }
    // Similar to getItemId() execpt that we can get any index
    // offset: number of entries from current index
    getItemIdOffset(offset: number): number {
        // Offset is a negative number or is too large
        if (offset < 0 || offset >= this.arr.length)
            return 0;
        let offsetIndex = this.index + offset;
        // If out of array bounds
        if (offsetIndex >= this.arr.length)
            offsetIndex = offsetIndex - this.arr.length;
        return this.arr[offsetIndex];
    }
    printCycleNames(): void {
        for (let i = 0; i < this.arr.length; i++ )
            printConsole(`${this.name} ${i}: ${Game.getFormEx(this.arr[i])?.getName()}`);
    }
}

export class EquipmentCycle extends Cycle {
    // slot: left hand (0), right hand (1), voice (2), ammo (3)
    // Do note that ammo (3) does not work with getEquippedObject(slot)
    // The slot will be used to determine the saved JDB Form to use
    slot: number;
    constructor(slot: number) {
        super();
        this.slot = slot;
    }
    getEquippedItem(): Form | null {
        if (this.slot === 0) {
            return solveForm(consts.LEFTHAND_RECENT) ?? null;
        } else if (this.slot === 1) {
            return solveForm(consts.RIGHTHAND_RECENT) ?? null;
        } else if (this.slot === 2) {
            return solveForm(consts.VOICE_RECENT) ?? null;
        } else if (this.slot === 3) {
            return solveForm(consts.AMMO_RECENT) ?? null;
        }
        return null;
    }
    autoIndex(): void {
        if (this.arr.length === 0)
            return;
        // Gets equipped item
        let equippedItem = this.getEquippedItem();
        // Sets index to unequipped index
        if (!equippedItem) {
            this.index = this.arr.length;
            return;
        }
        // Searches for match
        let tempIndex = this.arr.indexOf(equippedItem.getFormID());
        if (tempIndex !== -1) {
            this.index = tempIndex;
            return;
        }
        // No match found
        this.index = this.arr.length -1;
    }
    resetIndex(): boolean {
        if (this.arr.length < 1)
            return false;
        this.index = 0;
        this.use();
        return true;
    }
    use(): boolean {
        // Returns true, since the unequipped index cannot be removed
        if (this.index === this.arr.length) {
            unequip(this.getEquippedItem(), this.slot);
            return true;
        }
        return equip(Game.getFormEx(this.getItemId()), this.slot);
    }
    advance(): void {
        if (this.arr.length === 0) {
            // Prevents unequipped slot from unequipping, based on settings
            if ((!leftHandCycleUnequip && this.slot === 0) ||
                (!rightHandCycleUnequip && this.slot === 1) ||
                (!voiceCycleUnequip && this.slot === 2) ||
                (!ammoCycleUnequip && this.slot === 3))
            {
                return;
            }
            unequip(this.getEquippedItem(), this.slot);
            return;
        }
        // Advances index
        this.index++;
        // Prevents unequipped slot from unequipping, based on settings
        if ((!leftHandCycleUnequip && this.slot === 0) ||
            (!rightHandCycleUnequip && this.slot === 1) ||
            (!voiceCycleUnequip && this.slot === 2) ||
            (!ammoCycleUnequip && this.slot === 3))
        {
            if (this.index === this.arr.length)
                this.index = 0;
        }
        if (this.index > this.arr.length)
            this.index = 0;
        // Player has item count of one and that item is equipped on the other slot
        let item = Game.getFormEx(this.getItemId());
        let player = Game.getPlayer();
        if (item && player?.getItemCount(item) === 1) {
            if (this.slot === 0) {
                if (player.getEquippedObject(1) === item) {
                    this.advance();
                    return;
                }
            }
            if (this.slot === 1) {
                // Helps with cases where RH is two handed, which results in unexpected behavior
                // (i.e., to-be-equipped RH === LH, but RH somehow equips)
                if (solveForm(consts.LEFTHAND_RECENT) === item) {
                    this.advance();
                    return;
                }
            }
        }
        // Equips/unequips item
        let equipSuccess = this.use();
        if (equipSuccess)
            return;
        // In the case that the equip fails
        // Removes the failed item from the cycle
        this.arr.splice(this.index, 1);
        this.index--;
        if (this.slot === 0) {
            writeObjArrToJCon(this.arr, consts.LEFTHAND_ARRAY);
        } else if (this.slot === 1) {
            writeObjArrToJCon(this.arr, consts.RIGHTHAND_ARRAY);
        } else if (this.slot === 2) {
            writeObjArrToJCon(this.arr, consts.VOICE_ARRAY);
        } else if (this.slot === 3) {
            writeObjArrToJCon(this.arr, consts.VOICE_ARRAY);
        }
        this.advance();
    }
    add(newItemID: number): void {
        let newItemName = Game.getFormEx(newItemID)?.getName();
        if (this.arr.includes(newItemID)) {
            printCycleEditorMessage(`${newItemName} ${settings.isInThe} ${this.name}`);
            return;
        }
        this.arr.splice(this.index + 1, 0, newItemID);
        printCycleEditorMessage(`${settings.added} ${newItemName} ${settings.toThe} ${this.name}`);
    }
    remove(): void {
        let removedName = "";
        let removedIndex = -1;
        // Removes equipped item if it exists in the array
        let equippedItem = this.getEquippedItem();
        let equippedItemIndex = this.arr.indexOf(equippedItem?.getFormID() ?? 0);
        if (equippedItemIndex === -1) {
            printCycleEditorMessage(`${equippedItem?.getName() ?? ""} ${settings.doesNotExistInThe} ${this.name}`);
            this.use();
            return;
        }
        removedName = equippedItem?.getName() ?? "";
        removedIndex = equippedItemIndex;
        // Removes item at the current index
        this.arr.splice(removedIndex, 1);
        printCycleEditorMessage(`${settings.removed} ${removedName} ${settings.fromThe} ${this.name}`);
        // Equips/unequips, depending on the current index
        this.use();
    }
}

export class QuickItemCycle extends Cycle {
    offsetOneCount: number;
    offsetTwoCount: number;
    constructor() {
        super();
        this.offsetOneCount = 0;
        this.offsetTwoCount = 0;
    }
    autoIndex(): void {
        this.index = solveInt(consts.QUICKITEM_INDEX, 0);
    }
    resetIndex(): boolean {
        if (this.arr.length <= 1)
            return false;
        this.index = 0;
        solveIntSetter(consts.QUICKITEM_INDEX, this.index, true);
        return true;
    }
    advance(): void {
        if (this.arr.length >= 2)
            this.index++;
        if (this.index >= this.arr.length)
            this.index = 0;
        solveIntSetter(consts.QUICKITEM_INDEX, this.index, true);
    }
    // - Uses the player's current health/magicka/stamina count to determine what restoration to use
    // - Returns true if an optimal potion would be used, but false otherwise
    useOptimalPotion(item: Form | null): boolean {
        // Item is not a potion.
        if (item?.getType() !== FormType.Potion) {
            return false;
        }
        // Uses currently queued quick item to determine what the potion is
        let potion = Potion.from(item);
        let potionType = potion?.getNthEffectMagicEffect(0)?.getFormID();
        let actorValueWord = "";
        if (potionType === consts.RESTORE_HEALTH_ID) {
            actorValueWord = "Health";
        } else if (potionType === consts.RESTORE_MAGICKA_ID) {
            actorValueWord = "Magicka";
        } else if (potionType === consts.RESTORE_STAMINA_ID) {
            actorValueWord = "Stamina";
        } else { // Any other potion type
            return false;
        }
        // Only continues depending on what the potion type is and the settings
        if ((actorValueWord === "Health" && settings.useOptimalHealthPotion) ||
            (actorValueWord === "Magicka" && settings.useOptimalMagickaPotion) ||
            (actorValueWord === "Stamina" && settings.useOptimalStaminaPotion))
        {
            let optimalPotion = null; // Optimal potion to use
            // Smallest value would indicate the most optimal potion
            let optimalDiff = null;
            let player = Game.getPlayer();
            // Player health/magicka/stamina
            let playerAVDiff = (player?.getActorValueMax(actorValueWord) ?? 0) - (player?.getActorValue(actorValueWord) ?? 0);
            // Finds optimal potion to use
            let playerNumItems = player?.getNumItems() ?? 0;
            for (let i = 0; i < playerNumItems; i++) {
                let playerItem = player?.getNthForm(i) ?? null;
                // Item is not a potion
                if (item?.getType() !== FormType.Potion)
                    continue;
                let potion = Potion.from(playerItem);
                let type = potion?.getNthEffectMagicEffect(0)?.getFormID();
                // Potion does not match the specified type
                if (potionType !== type)
                    continue;
                let potionMaginitude = potion?.getNthEffectMagnitude(0) ?? 0;
                let tempDiff = Math.abs(potionMaginitude - playerAVDiff);
                // If this is the first time computing optimalDiff OR
                // tempDiff is a smaller (more optimal) value
                if (!optimalDiff || optimalDiff > tempDiff) {
                    optimalDiff = tempDiff;
                    optimalPotion = potion;
                }
            }
            // Use optimal potion in the end
            equip(optimalPotion);
            return true;
        }
        // Assuming only restoration potions have been used
        return false;
    }
    use(): void {
        let player = Game.getPlayer();
        if (!player)
            return;
        let item = Game.getFormEx(this.getItemId());
        if (!item)
            return;
        // Returning true indicates an optimal potion was used
        if (this.useOptimalPotion(item))
            return;
        if (!player.isEquipped(item))
            equip(item);
        if (player.isEquipped(item))
            unequip(item);
    }
    add(itemID: number): void {
        let item = Game.getFormEx(itemID);
        let itemType = item?.getType() ?? 0;
        if (itemType !== FormType.Potion && itemType !== FormType.Armor)
            return;
        if (this.arr.includes(itemID)) {
            printCycleEditorMessage(`${item?.getName()} ${settings.isInThe} ${this.name}`);
            return;
        }
        if (this.index >= this.arr.length) {
            this.arr.splice(0, 0, itemID);
            return;
        }
        this.arr.splice(this.index + 1, 0, itemID);
        // Advances index
        if (this.arr.length >= 1)
            this.index++;
        printCycleEditorMessage(`${settings.added} ${Game.getFormEx(itemID)?.getName()} ${settings.toThe} ${this.name}`);
    }
    remove(): void {
        let itemID = this.getItemId();
        if (!itemID) {
            printCycleEditorMessage(`${settings.doesNotExistInThe} ${this.name}`);
            return;
        }
        if (this.arr.length === 0 || this.index >= this.arr.length)
            return;
        this.arr.splice(this.index, 1);
        // In case the last index was deleted
        if (this.index >= this.arr.length)
            this.index = 0;
        printCycleEditorMessage(`${settings.removed} ${Game.getFormEx(itemID)?.getName()} ${settings.fromThe} ${this.name}`);
    }
}
