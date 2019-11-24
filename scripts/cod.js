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

// Group Names
CONFIG.groups = {
    "mental": "Mental",
	"physical": "Physical",
	"social": "Social"
}

// Group Mapping
CONFIG.groupMapping = { 
  "int": "mental",
  "wits": "mental",
  "res": "mental",
  "str": "physical",
  "dex": "physical",
  "sta": "physical",
  "pre": "social",
  "man": "social",
  "com": "social",
  "academics": "mental",
  "computer": "mental",
  "crafts": "mental",
  "investigation": "mental",
  "medicine": "mental",
  "occult": "mental",
  "politics": "mental",
  "science": "mental",
  "athletics": "physical",
  "brawl": "physical",
  "drive": "physical",
  "firearms": "physical",
  "larceny": "physical",
  "stealth": "physical",
  "survival": "physical",
  "weaponry": "physical",
  "animalken": "social",
  "empathy": "social",
  "expression": "social",
  "intimidation": "social",
  "persuasion": "social",
  "socialize": "social",
  "streetwise": "social",
  "subterfuge": "social"
}

class ActorCoD extends Actor 
{
	rollPool(attribute, skill, modifier)
{
	let pool = 0
	if (attribute != "none")
    pool += this.data.data.attributes[attribute].current
	if (skill != "none")
    pool += this.data.data.skills[skill].current
	pool += parseInt(modifier) || 0
	let roll = new Roll(`${pool}d10x10cs>=8`).roll()
    roll.toMessage()
}
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

	html.find(".roll-pool").click(event => {
	let defaultSelection = $(event.currentTarget).attr("data-skill")
	let stats = duplicate(CONFIG.skills) 
	let attributes = duplicate(CONFIG.attributes)
	let skillGroups = duplicate(CONFIG.groups)
	let attrGroups = duplicate(CONFIG.groups)

	for (let g in skillGroups)
	{
		 skillGroups[g] = {}
		 attrGroups[g] = {}
	}

	for (let s in stats)
	{
		let skillGroup = CONFIG.groupMapping[s]
		skillGroups[skillGroup][s] = stats[s]
	}
		for (let a in attributes)
	{
		let attrGroup = CONFIG.groupMapping[a]
		attrGroups[attrGroup][a] = attributes[a]
	}
	
	let displaySkillGroups = Object.keys(skillGroups).map((key) => {
  const newKey = CONFIG.groups[key];
  return { [newKey] : skillGroups[key] };
}).reduce((a, b) => Object.assign({}, a, b));

let displayAttrGroups = Object.keys(attrGroups).map((key) => {
  const newKey = CONFIG.groups[key];
  return { [newKey] : attrGroups[key] };
}).reduce((a, b) => Object.assign({}, a, b));

for (let g in displaySkillGroups)
{
  for (let s in displaySkillGroups[g])
  {
    displaySkillGroups[g][s] += " (" + this.actor.data.data.skills[s].current+")"
  }
}

for (let g in displayAttrGroups)
{
  for (let a in displayAttrGroups[g])
  {
    displayAttrGroups[g][a] += " (" + this.actor.data.data.attributes[a].current+")"
  }
}

		let dialogData = {
			defaultSelection : defaultSelection,
			skills : displaySkillGroups,
			attributes : displayAttrGroups,
			groups : CONFIG.groups
        }
    renderTemplate('systems/cod/templates/pool-dialog.html', dialogData) .then(html => {
            new Dialog({
            title: "Roll Dice Pool",
            content: html,
            buttons: {
              Yes: {
                icon: '<i class="fa fa-check"></i>',
                label: "Yes",
				callback: (html) => {
                    let attributeSelected = html.find('[name="attributeSelector"]').val();
					let poolModifier = html.find('[name="modifier"]').val();
					let skillSelected = html.find('[name="skillSelector"]').val();
                    this.actor.rollPool(attributeSelected, skillSelected, poolModifier)
                  }
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
              },
            },
            default: 'Yes'
          }).render(true)
    })
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