import { Debug, Form, FormType, Game, printConsole } from "@skyrim-platform/skyrim-platform";
import { solveForm, solveInt, solveIntSetter } from "@skyrim-platform/jcontainers/JDB";
import { equip, unequip, writeObjArrToJCon } from "./utilities";
import * as consts from "./constants";

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
    // Do note that ammo (3) does not work with getEquippedObject(slot).
    // The slot will be used to determine the saved JDB Form to use.
    slot: number;
    constructor(slot: number) {
        super();
        this.slot = slot;
        switch (this.slot) {
            case 0: this.name = "Left Hand"; break;
            case 1: this.name = "Right Hand"; break;
            case 2: this.name = "Voice"; break;
            case 3: this.name = "Ammo"; break;
        }
    }
    getEquippedItem(): Form | null {
        switch (this.slot) {
            case 0:
                return solveForm(consts.LEFTHAND_RECENT) ?? null;
            case 1:
                return solveForm(consts.RIGHTHAND_RECENT) ?? null;
            case 2:
                return solveForm(consts.VOICE_RECENT) ?? null;
            case 3:
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
            unequip(this.getEquippedItem(), this.slot);
            return;
        }
        // Advances index
        this.index++;
        if (this.index > this.arr.length)
            this.index = 0;
        // Player has item count of one and that item is equipped on the other slot
        let item = Game.getFormEx(this.getItemId());
        let player = Game.getPlayer()
        if (player?.getItemCount(item) === 1) {
            if (this.slot === 0) {
                if (player.getEquippedObject(1) === item) {
                    this.advance();
                    return;
                }
            }
            if (this.slot === 1) {
                // Helps with cases where RH is two handed, which results in unexpected behavior
                // (i.e. to-be-equipped RH === LH, but RH somehow equips)
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
        // In the case that the equip fails.
        // Removes the failed item from the cycle.
        this.arr.splice(this.index, 1);
        this.index--;
        switch (this.slot) {
            case 0:
                writeObjArrToJCon(this.arr, consts.LEFTHAND_ARRAY);
                break;
            case 1:
                writeObjArrToJCon(this.arr, consts.RIGHTHAND_ARRAY);
                break;
            case 2:
                writeObjArrToJCon(this.arr, consts.VOICE_ARRAY);
                break;
            case 3:
                writeObjArrToJCon(this.arr, consts.VOICE_ARRAY);
        }
        this.advance();
    }
    add(newItemID: number): void {
        let newItemName = Game.getFormEx(newItemID)?.getName();
        if (this.arr.includes(newItemID)) {
            Debug.notification(`${newItemName} is in the ${this.name} cycle.`);
            return;
        }
        this.arr.splice(this.index + 1, 0, newItemID);
        Debug.notification(`Added ${newItemName} to the ${this.name} cycle.`);
    }
    remove(): void {
        let removedName = "";
        let removedIndex = -1;
        // Removes equipped item if it exists in the array.
        let equippedItem = this.getEquippedItem();
        let equippedItemIndex = this.arr.indexOf(equippedItem?.getFormID() ?? 0);
        if (equippedItemIndex === -1) {
            Debug.notification(`${equippedItem?.getName() ?? ""} does not exist in the ${this.name} cycle`);
            this.use();
            return;
        }
        removedName = equippedItem?.getName() ?? "";
        removedIndex = equippedItemIndex;
        // Removes item at the current index.
        this.arr.splice(removedIndex, 1);
        Debug.notification(`Removed ${removedName} from the ${this.name} cycle.`);
        // Equips/unequips, depending on the current index.
        this.use();
    }
}

export class QuickItemCycle extends Cycle {
    offsetOneCount: number;
    offsetTwoCount: number;
    constructor() {
        super();
        this.name = "Quick Item"
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
    use(): void {
        let player = Game.getPlayer();
        if (!player)
            return;
        let item = Game.getFormEx(this.getItemId());
        if (!item)
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
            Debug.notification(`${item?.getName()} is in the ${this.name} cycle.`);
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
        Debug.notification(`Added ${Game.getFormEx(itemID)?.getName()} to the ${this.name} cycle.`);
    }
    remove(): void {
        let itemID = this.getItemId();
        if (!itemID) {
            Debug.notification(`Cannot remove empty slot from the ${this.name} cycle.`);
            return;
        }
        if (this.arr.length === 0 || this.index >= this.arr.length)
            return;
        this.arr.splice(this.index, 1);
        // In case the last index was deleted
        if (this.index >= this.arr.length)
            this.index = 0;
        Debug.notification(`Removed ${Game.getFormEx(itemID)?.getName()} from the ${this.name} cycle.`);
    }
}
