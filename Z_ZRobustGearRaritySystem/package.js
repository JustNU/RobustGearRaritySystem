class Mod
{
    constructor()
    {
		Logger.info("Loading: Robust Gear Rarity System");
		ModLoader.onLoad["RobustGearRaritySystem"] = require("./src/RobustGearRaritySystem.js").onLoadMod;
    }
}

module.exports.Mod = new Mod();