// Characteristic Names
CONFIG.attributes = {
  "int": "Intelligence",
  "wits": "Wits",
  "res": "Resolve",
  "str": "Strength",
  "dex": "Dexterity",
  "sta": "Stamina",
  "pre": "Presence",
  "man": "Manipulation",
  "com": "Composure"
};

// Skills Names
CONFIG.skills = {
  "academics": "Academics",
  "computer": "Computer",
  "crafts": "Crafts",
  "investigation": "Investigation",
  "medicine": "Medicine",
  "occult": "Occult",
  "politics": "Politics",
  "science": "Science",
  "athletics": "Athletics",
  "brawl": "Brawl",
  "drive": "Drive",
  "firearms": "Firearms",
  "larceny": "Larceny",
  "stealth": "Stealth",
  "survival": "Survival",
  "weaponry": "Weaponry",
  "animalken": "Animal Ken",
  "empathy": "Empathy",
  "expression": "Expression",
  "intimidation": "Intimidation",
  "persuasion": "Persuasion",
  "socialize": "Socialize",
  "streetwise": "Streetwise",
  "subterfuge": "Subterfuge"
};

class ActorCoD extends Actor 
{
}
CONFIG.Actor.entityClass = ActorCoD

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
class ActorSheetCoD extends ActorSheet {

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.classes = options.classes.concat(["cod", "actor-sheet"]);
	  options.template = "systems/cod/templates/actor/actor-sheet.html";
    options.width = 610;
    options.height = 610;
	  return options;
  }

getData() {
      const sheetData = super.getData();
	  this._prepareItems(sheetData.actor);
      return sheetData;
    }
	
_prepareItems(actorData)
{
}

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
	activateListeners(html) {
    super.activateListeners(html);

	html.find(".skill-click").click(event => {
	let int = this.actor.data.data.attributes.int.current
    let academics = this.actor.data.data.skills.academics.current
    let result = int + academics
	console.log(result)
	let roll = new Roll(`${result}d10x10cs>=8`).roll()
	roll.toMessage()
    })

    // Activate tabs
    let tabs = html.find('.tabs');
    let initial = this.actor.data.flags["_sheetTab"];
    new Tabs(tabs, {
      initial: initial,
      callback: clicked => this.actor.data.flags["_sheetTab"] = clicked.attr("data-tab")
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });
  }
}

Actors.unregisterSheet("core", ActorSheet);
Actors.registerSheet("core", ActorSheetCoD, {
  types: [],
  makeDefault: true
});


/* -------------------------------------------- */


/**
 * Extend the basic ItemSheet with some very simple modifications
 */
class CoDItemSheet extends ItemSheet {

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.classes = options.classes.concat(["cod", "item-sheet"]);
	  options.template = "systems/cod/templates/item-sheet.html";
	  options.height = 400;
	  return options;
  }
   /**
     * Use a type-specific template for each different item type
     */
    get template() {
      let type = this.item.type;
      return `systems/cod/templates/items/item-${type}-sheet.html`;
    }
	/**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
    activateListeners(html) {
    super.activateListeners(html);

    // Activate tabs
    let tabs = html.find('.tabs');
    let initial = this._sheetTab;
    new Tabs(tabs, {
      initial: initial,
      callback: clicked => this._sheetTab = clicked.data("tab")
    });
	}
}

Items.unregisterSheet("core", ItemSheet);
Items.registerSheet("core", CoDItemSheet, {
  types: [],
  makeDefault: true
});


/**
 * Set an initiative formula for the system
 * @type {String}
 */
CONFIG.initiative.formula = "1d20";

Hooks.once("init", () => {
    loadTemplates([
    "systems/cod/templates/actor/actor-main.html",
    "systems/cod/templates/actor/actor-merits.html",
    "systems/cod/templates/actor/actor-skills.html"
    ]);
  });