export function getBeatmapIdFromUrl(beatmapUrl: string): number | null {
    let regex = /https:\/\/osu\.ppy\.sh\/beatmapsets\/\d+\#(?:osu|taiko|fruits|mania)\/(\d+)/.exec(beatmapUrl);
    return regex != null ? parseInt(regex[1]) : null;
}

export enum Mods {
    None           = 0,
    NoFail         = 1,
    Easy           = 2,
    TouchDevice    = 4,
    Hidden         = 8,
    HardRock       = 16,
    SuddenDeath    = 32,
    DoubleTime     = 64,
    Relax          = 128,
    HalfTime       = 256,
    Nightcore      = 512, // Only set along with DoubleTime. i.e: NC only gives 576
    Flashlight     = 1024,
    Autoplay       = 2048,
    SpunOut        = 4096,
    Relax2         = 8192,    // Autopilot
    Perfect        = 16384, // Only set along with SuddenDeath. i.e: PF only gives 16416  
    Key4           = 32768,
    Key5           = 65536,
    Key6           = 131072,
    Key7           = 262144,
    Key8           = 524288,
    FadeIn         = 1048576,
    Random         = 2097152,
    Cinema         = 4194304,
    Target         = 8388608,
    Key9           = 16777216,
    KeyCoop        = 33554432,
    Key1           = 67108864,
    Key3           = 134217728,
    Key2           = 268435456,
    ScoreV2        = 536870912,
    Mirror         = 1073741824
    // HR             = HardRock,
    // HD             = Hidden,
    // DT             = DoubleTime,
    // HT             = HalfTime,
    // EZ             = Easy, 
    // Abbreviations  = HR | HD | DT | HT | EZ
    // KeyMod = Key1 | Key2 | Key3 | Key4 | Key5 | Key6 | Key7 | Key8 | Key9 | KeyCoop,
    // FreeModAllowed = NoFail | Easy | Hidden | HardRock | SuddenDeath | Flashlight | FadeIn | Relax | Relax2 | SpunOut | KeyMod,
    // ScoreIncreaseMods = Hidden | HardRock | DoubleTime | Flashlight | FadeIn
}

export function doesModExist(value: any) {
    let validMods = [];
    let invalidMods = [];

    let allMods = value.split(",");
    
    if(!value.includes(",") && Object.keys(allMods).length == 0) {
        allMods = [value];
    }

    allMods = allMods.map((str: string) => str.replace(/\s/g, ''));

    for(let enteredMod in allMods) {
        let validMod = false;

        for(let mod in Mods) {
            if(isNaN(Number(mod))) {
                if(allMods[enteredMod].toLowerCase() == mod.toLowerCase()) {
                    validMods.push(allMods[enteredMod]);
                    validMod = true;
                }
            }
        }

        if(validMod == false) {
            invalidMods.push(allMods[enteredMod]);
        }
    }

    return invalidMods.length == 0 ? true : invalidMods.join(", ");
}

export function getModsFromBit(bit: number) {
    let allMods = [];

    for(let item in Mods) {
        if(((<any>Mods[item]) & bit) > 0) {
            allMods.push(item)
        }
    }

    return allMods;
}

export function getBitFromMods(mods: string) {
    let allMods = mods.split(",");
    
    if(!mods.includes(",") && Object.keys(allMods).length == 0) {
        allMods = [mods];
    }

    allMods = allMods.map((str: string) => str.replace(/\s/g, ''));

    let bit = 0;

    for(let mod in allMods) {
        for(let item in Mods) {
            if(allMods[mod].toLowerCase() == item.toLowerCase()) {
                bit += parseInt(Mods[item]);
            }
        }
    }

    return bit;
}