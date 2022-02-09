"use strict";

class RobustGearRaritySystem
{
	static onLoadMod()
	{
		// Constants
		const fs = require('fs');
		const itemPacksPath = `user/mods/Z_ZRobustGearRaritySystem/ItemPacks/`;
		
		DatabaseServer.tables.templates.robustrarity = {};
		
		// read dirrctory
		fs.readdir(itemPacksPath, function (err, files) {
			//handling error
			if (err) {
				return console.log('Unable to scan directory' + err);
			};
			//push data to templates.robustrarity
			for (const fileIndex in files) {
				const file = files[fileIndex]
				
				const robustRarityTemplates = DatabaseServer.tables.templates.robustrarity;
				
				DatabaseServer.tables.templates.robustrarity = {
					...JsonUtil.clone(robustRarityTemplates),
					...JsonUtil.deserialize(VFS.readFile(`${itemPacksPath}${file}`))
				};
			}
			
			//Logger.log(DatabaseServer.tables.templates.robustrarity)
			
			RobustGearRaritySystem.theShmeatOfItAll()
		});
		
	}
	
	static theShmeatOfItAll() {
		// Constants
		const config = JsonUtil.deserialize(VFS.readFile(`user/mods/Z_ZRobustGearRaritySystem/config/config.json`));
		const items = DatabaseServer.tables.templates.items;
		const bots = DatabaseServer.tables.bots.types;
		
		// default rarity
		for (const itemInDb in items) {
			if (!DatabaseServer.tables.templates.robustrarity[itemInDb] && items[itemInDb]._props.Name) {
				if (config.Debug) {
					Logger.log(`${itemInDb} (${DatabaseServer.tables.locales.global.en.templates[itemInDb].Name}) doesn't have rarity defined`);
				}
				
				DatabaseServer.tables.templates.robustrarity[itemInDb] = config.DefaultModdedItemsRarity;
			}
		}
		
		// overwrite rarity according to config
		for (const overwriteItem in config.OverwriteItemRarity) {
			const overwriteItemRarity = config.OverwriteItemRarity[overwriteItem]
			DatabaseServer.tables.templates.robustrarity[overwriteItem] = overwriteItemRarity
		}
		
		if (config.Debug) {
			//Logger.log(DatabaseServer.tables.templates.robustrarity["Item ID Here"])
		}
		
		for (const botListIndex in config.DontAffectFollowingBots) {
			for (const botType in bots) {
				
				// if bot type is in the "Dont Affect" list, drop it
				if (config.DontAffectFollowingBots[botListIndex] === botType)
				{
					continue;
				}
				
				if (config.Debug) {
					Logger.log(botType)
				}
				
				// gear
				for (const slot in bots[botType].inventory.equipment) {
					for (const itemIndex in bots[botType].inventory.equipment[slot]) {
						const item = bots[botType].inventory.equipment[slot][itemIndex]
						
						let n = Math.round(config.HowMuchAdditionalItemsToAdd[DatabaseServer.tables.templates.robustrarity[item]])
						
						for (let i = 0; i < n; i++) {
							
							bots[botType].inventory.equipment[slot].push(item)
						}
					}
					
					if (config.Debug) {
						//Logger.log(bots[botType].inventory.equipment[slot])
					}
				}
			
				
				// weapon mods
				for (const moddableItemIndex in bots[botType].inventory.mods) {
					for (const modSlot in bots[botType].inventory.mods[moddableItemIndex]) {
						for (const modItemIndex in bots[botType].inventory.mods[moddableItemIndex][modSlot]) {
							const modItem = bots[botType].inventory.mods[moddableItemIndex][modSlot][modItemIndex]
							
							let n = Math.round(config.HowMuchAdditionalItemsToAdd[DatabaseServer.tables.templates.robustrarity[modItem]])
							
							for (let i = 0; i < n; i++) {
								
								bots[botType].inventory.mods[moddableItemIndex][modSlot].push(modItem)
							}
						}
					}
					
					if (config.Debug) {
						//Logger.log(bots[botType].inventory.mods)
					}
				}
			}
		}
    }
	
	static testBot(role)
	{
		let bot = JsonUtil.clone(DatabaseServer.tables.bots.base);
		
		var testing = BotController.generateBot(bot, role)
	}
}

module.exports = RobustGearRaritySystem;