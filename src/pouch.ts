import { Game } from "@skyrim-platform/skyrim-platform";
import { equip, unequip } from "./utilities";

export class Pouch {
    itemID: number;
    count: number;
    slot: number;
    constructor(slot: number) {
        this.itemID = 0;
        this.count = 0;
        this.slot = slot;
    }
    use(): void {
        let player = Game.getPlayer();
        if (!player)
            return;
        let item = Game.getFormEx(this.itemID);
        if (!item)
            return;
        // Voice spells/shouts
        let currentVoice = player.getEquippedObject(2);
        if (currentVoice?.getFormID() === this.itemID) {
            unequip(currentVoice, 2);
            return;
        }
        // Right hand
        let currentRH = player.getEquippedObject(1);
        if (currentRH?.getFormID() === this.itemID) {
            unequip(currentRH, 1);
            return;
        }
        // Left hand
        let currentLH = player.getEquippedObject(0);
        if (currentLH?.getFormID() === this.itemID) {
            unequip(currentLH, 0);
            return;
        }
        if (player.isEquipped(item)) {
            unequip(item);
            return;
        }
        equip(item, 1); // 1: right hand (default)
    }
}
