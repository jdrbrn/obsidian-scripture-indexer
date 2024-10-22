import { App, debounce, Debouncer, Editor, MarkdownView, Modal, normalizePath, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile, ToggleComponent } from 'obsidian';
// TODO
// Write to files in folders for Books vs one giant file?
const BibleBooksNameTable = new Map([
	["Genesis", "Genesis"], ["Gen", "Genesis"],	["Gen.", "Genesis"], ["Ge", "Genesis"], ["Exodus", "Exodus"], ["Ex", "Exodus"], ["Ex.", "Exodus"],["Leviticus", "Leviticus"],
	["Lev", "Leviticus"], ["Lev.", "Leviticus"], ["Le", "Leviticus"], ["Numbers", "Numbers"], ["Num", "Numbers"], ["Num.", "Numbers"], ["Nu", "Numbers"],
	["Deuteronomy", "Deuteronomy"], ["Deut", "Deuteronomy"], ["Deut.", "Deuteronomy"], ["De", "Deuteronomy"], ["Joshua", "Joshua"], ["Josh","Joshua"], ["Josh.","Joshua"],
	["Jos", "Joshua"], ["Judges", "Judges"], ["Judg", "Judges"], ["Judg.", "Judges"], ["Jg", "Judges"], ["Ruth", "Ruth"], ["Ru", "Ruth"], ["1 Samuel", "1 Samuel"],
	["1 Sam", "1 Samuel"], ["1 Sam.", "1 Samuel"], ["1Sa", "1 Samuel"], ["2 Samuel","2 Samuel"], ["2 Sam", "2 Samuel"], ["2 Sam.", "2 Samuel"], ["2Sa", "2 Samuel"],
	["1 Kings", "1 Kings"], ["1 Ki", "1 Kings"], ["1 Ki.", "1 Kings"], ["1Ki", "1 Kings"], ["2 Kings", "2 Kings"], ["2 Ki", "2 Kings"], ["2 Ki.", "2 Kings"], ["2Ki", "2 Kings"],
	["1 Chronicles", "1 Chronicles"], ["1 Chron", "1 Chronicles"], ["1 Chron.", "1 Chronicles"], ["1Ch", "1 Chronicles"], ["2 Chronicles", "2 Chronicles"], ["2 Chron", "2 Chronicles"],
	["2 Chron.", "2 Chronicles"], ["2Ch", "2 Chronicles"], ["Ezra", "Ezra"], ["Ezr", "Ezra"], ["Nehemiah", "Nehemiah"], ["Neh", "Nehemiah"], ["Neh.", "Nehemiah"], ["Ne", "Nehemiah"],
	["Esther", "Esther"], ["Es", "Esther"], ["Job", "Job"], ["Psalms", "Psalms"], ["Psalm", "Psalms"], ["Ps", "Psalms"], ["Ps.", "Psalms"], ["Proverbs", "Proverbs"],
	["Prov", "Proverbs"], ["Prov.", "Proverbs"], ["Pr", "Proverbs"], ["Ecclesiastes", "Ecclesiastes"], ["Eccl", "Ecclesiastes"], ["Eccl.", "Ecclesiastes"], ["Ec", "Ecclesiastes"],
	["Song of Solomon", "Song of Solomon"], ["Song of Sol", "Song of Solomon"], ["Song of Sol.", "Song of Solomon"], ["Ca", "Song of Solomon"], ["Isaiah", "Isaiah"], 
	["Isa", "Isaiah"], ["Isa.", "Isaiah"], ["Jeremiah", "Jeremiah"], ["Jer", "Jeremiah"], ["Jer.", "Jeremiah"], ["Lamentations", "Lamentations"], ["Lam", "Lamentations"], 
	["Lam.", "Lamentations"], ["La", "Lamentations"], ["Ezekiel", "Ezekiel"], ["Ezek", "Ezekiel"], ["Ezek.", "Ezekiel"], ["Eze", "Ezekiel"], ["Daniel", "Daniel"], ["Dan", "Daniel"],
	["Dan.", "Daniel"], ["Da", "Daniel"], ["Hosea", "Hosea"], ["Hos", "Hosea"], ["Hos.", "Hosea"], ["Ho", "Hosea"], ["Joel", "Joel"], ["Joe", "Joel"], ["Amos", "Amos"], ["Am", "Amos"],
	["Obadiah", "Obadiah"], ["Obad", "Obadiah"], ["Obad.", "Obadiah"], ["Ob", "Obadiah"], ["Jonah", "Jonah"], ["Jon", "Jonah"], ["Micah", "Micah"], ["Mic", "Micah"], ["Mic.", "Micah"],
	["Nahum", "Nahum"], ["Nah", "Nahum"], ["Nah.", "Nahum"], ["Na", "Nahum"], ["Habakkuk", "Habakkuk"], ["Hab", "Habakkuk"], ["Hab.", "Habakkuk"], ["Zephaniah", "Zephaniah"],
	["Zeph", "Zephaniah"], ["Zeph.", "Zephaniah"], ["Zep", "Zephaniah"], ["Haggai", "Haggai"], ["Hag", "Haggai"], ["Hag.", "Haggai"], ["Zechariah", "Zechariah"], ["Zech", "Zechariah"],
	["Zech.", "Zechariah"], ["Zec", "Zechariah"], ["Malachi", "Malachi"], ["Mal", "Malachi"], ["Mal.", "Malachi"], ["Matthew", "Matthew"], ["Matt", "Matthew"], ["Matt.", "Matthew"],
	["Mt", "Matthew"], ["Mark", "Mark"], ["Mr", "Mark"], ["Luke", "Luke"], ["Lu", "Luke"], ["John", "John"], ["Joh", "John"], ["Acts", "Acts"], ["Ac", "Acts"], ["Romans", "Romans"],
	["Rom", "Romans"], ["Rom.", "Romans"], ["Ro", "Romans"], ["1 Corinthians", "1 Corinthians"], ["1 Cor", "1 Corinthians"], ["1 Cor.", "1 Corinthians"], ["1Co", "1 Corinthians"],
	["2 Corinthians", "2 Corinthians"], ["2 Cor", "2 Corinthians"], ["2 Cor.", "2 Corinthians"], ["2Co", "2 Corinthians"], ["Galatians", "Galatians"], ["Gal", "Galatians"],
	["Gal.", "Galatians"], ["Ga", "Galatians"], ["Ephesians", "Ephesians"], ["Eph", "Ephesians"], ["Eph.", "Ephesians"], ["Philippians", "Philippians"], ["Phil", "Philippians"],
	["Phil.", "Philippians"], ["Php", "Philippians"], ["Colossians", "Colossians"], ["Col", "Colossians"], ["Col.", "Colossians"], ["1 Thessalonians", "1 Thessalonians"],
	["1 Thess", "1 Thessalonians"], ["1 Thess.", "1 Thessalonians"], ["1Th", "1 Thessalonians"], ["2 Thessalonians", "2 Thessalonians"], ["2 Thess", "2 Thessalonians"], 
	["2 Thess.", "2 Thessalonians"], ["2Th", "2 Thessalonians"], ["1 Timothy", "1 Timothy"], ["1 Tim", "1 Timothy"], ["1 Tim.", "1 Timothy"], ["1Ti", "1 Timothy"],
	["2 Timothy", "2 Timothy"], ["2 Tim", "2 Timothy"], ["2 Tim.", "2 Timothy"], ["2Ti", "2 Timothy"], ["Titus", "Titus"], ["Tit", "Titus"], ["Philemon", "Philemon"],
	["Philem", "Philemon"], ["Philem.", "Philemon"], ["Phm", "Philemon"], ["Hebrews", "Hebrews"], ["Heb", "Hebrews"], ["Heb.", "Hebrews"], ["James", "James"], ["Jas", "James"],
	["Jas.", "James"], ["1 Peter", "1 Peter"], ["1 Pet", "1 Peter"], ["1 Pet.", "1 Peter"], ["1Pe", "1 Peter"], ["2 Peter", "2 Peter"], ["2 Pet", "2 Peter"], ["2 Pet.", "2 Peter"],
	["2Pe", "2 Peter"], ["1 John", "1 John"], ["1Jo", "1 John"], ["2 John", "2 John"], ["2Jo", "2 John"], ["3 John", "3 John"], ["3Jo", "3 John"], ["Jude", "Jude"],
	["Revelation", "Revelation"], ["Rev", "Revelation"], ["Rev.", "Revelation"], ["Re", "Revelation"]
]);

const BookOrder = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
	"Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
	"Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
	"Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
	"1 John", "2 John", "3 John", "Jude", "Revelation"];
	
interface ScriptureIndexerSettings {
	indexFilePath: string;
	// Book -> Chapters -> Verses -> Refs (Path to file)
	// index of array is number of Chapter/Verse (0 index for chapter/verse is ref of whole book/chapter)
	indexMap: Array<Array<Array<Array<String>>>>;
	enableAutoIndex: boolean;
}

const DEFAULT_SETTINGS: ScriptureIndexerSettings = {
	indexFilePath: 'Index.md',
	indexMap: [],
	enableAutoIndex: true
}

export default class ScriptureIndexer extends Plugin {
	settings: ScriptureIndexerSettings;

	indexQueue = new Map<string,Debouncer<any,any>>();

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'index-all-scriptures',
			name: 'Index all files',
			callback: () => {
				this.IndexAllFiles();
			}
		});
		
		this.addCommand({
			id: 'index-scriptures',
			name: 'Index this file',
			callback: () => {
				let curFile = this.app.workspace.getActiveFile();
				if (curFile != null){
					this.IndexFile(this.app.workspace.getActiveFile()!.path);
				}
			}
		});
		
		this.addCommand({
			id: 'reset-index',
			name: 'Reset index',
			callback: () => {
				this.settings.indexMap = [];
				// Don't debounce because user wants us to write immediately
				this.WriteIndex();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ScriptureIndexerSettingTab(this.app, this));

		// Update index on file saving if enabled by user
		this.registerEvent(this.app.vault.on('modify', (file) => {
			if (this.settings.enableAutoIndex){
				this.AddToIndexQueue(file.path);
			}
		}));

		// Automatically cleans up index of dead references on deletion
		this.registerEvent(this.app.vault.on('delete', (file) => {
			if (this.settings.enableAutoIndex){
				// Remove from queue since deleted
				if (this.indexQueue.has(file.path)) {
					this.indexQueue.get(file.path)!.cancel();
					this.indexQueue.delete(file.path);
				}
				this.RemoveReferences(file.path);
				this.saveSettingsDebounce();
				this.WriteIndexDebounce();
			}
		}));

		// Automatically cleans up index of dead references and indexes new ones on rename
		this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
			if (this.settings.enableAutoIndex){
				// Remove old file path from queue
				if (this.indexQueue.has(oldPath)) {
					this.indexQueue.get(oldPath)!.cancel();
					this.indexQueue.delete(oldPath);
				}
				this.RemoveReferences(oldPath);
				this.AddToIndexQueue(file.path);
			}
		}));
	}

	onunload() {

	}

	onExternalSettingsChange() {
		// Reload settings to grab the latest saved index
		// Could be different than the previously loaded one if data was synced after plugin was loaded
		// Not doing so could result in the output index file being outdated/desynced
		// Ex: Index loaded from local store
		//     Files are synced including changed notes(foo.md)
		//     Updated index file is synced as well containing references to foo.md
		// 	   Updated index data is synced, but not loaded
		//     A note (bar.md) is saved and indexed
		//     Loaded index data now contains bar.md but not foo.md
		//     Output index file is now missing references to foo.md that should be there
		this.loadSettings();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Have a debounced saveSettings to buffer saving the internal index
	// Has a delay timer of 1 second
	// Keeps delaying until no request to save has been received in the past second
	saveSettingsDebounce = debounce(this.saveSettings, 1000, true);

	async IndexAllFiles() {
		let files = await this.app.vault.getMarkdownFiles();
		for (let file of files) {
			await this.ScrapeFile(file);
		}
		this.saveSettingsDebounce();
		this.WriteIndexDebounce();
	}

	AddToIndexQueue(filePath: string) {
		// Check if already in queue
		if (this.indexQueue.has(filePath)==false) {
			// Add to queue
			// Contains debounced function to delete the file from the queue and then index the file with 1 second queue timer
			this.indexQueue.set(filePath, debounce(() => {
															this.indexQueue.delete(filePath);
															this.IndexFile(filePath);
														}, 1000, true));
		}

		// Call debounced function to (re)queue the indexing
		this.indexQueue.get(filePath)!();
	}

	async IndexFile(filePath: string) {
		if (filePath == this.settings.indexFilePath) {return;}
		let file = this.app.vault.getFileByPath(filePath);
		if (file == null) {return;}
		await this.ScrapeFile(file);
		this.saveSettingsDebounce();
		this.WriteIndexDebounce();
	}

	// Remove references to a file from the index
	// Useful to run when a file is saved in case a references is removed
	// Keeps the index from having dead references
	RemoveReferences(file: string)
	{
		// Get indexMap for quick access
		let indexMap = this.settings.indexMap;

		// Iterate through books to write indexes
		for (let bookNum = 0; bookNum < indexMap.length; bookNum++)
		{
			// Check if book has any data; if not skip
			if (indexMap[bookNum] == undefined) {continue;}

			// Iterate through chapters
			for (let chapNum = 0; chapNum < indexMap[bookNum].length; chapNum++) {
				// Check if chap has any data; if not skip
				if (indexMap[bookNum][chapNum] == undefined) {continue;}

				// Iterate through verses
				for (let verseNum = 0; verseNum < indexMap[bookNum][chapNum].length; verseNum++)
				{
					// Check if verse has any data; if not skip
					if (indexMap[bookNum][chapNum][verseNum] == undefined) {continue;}

					// Iterate through references
					for (let refNum = 0; refNum < indexMap[bookNum][chapNum][verseNum].length; refNum++){
						if (indexMap[bookNum][chapNum][verseNum][refNum] == file) {
							indexMap[bookNum][chapNum][verseNum].remove(file);
						}
					}
				}
			}
		}
	}
	
	async ScrapeFile(file: TFile) {
		if (file.path == this.settings.indexFilePath) {return;}
		this.RemoveReferences(file.path);
		let contents = await this.app.vault.cachedRead(file);
		for (let key of BibleBooksNameTable.keys()) {
			// (?<!(\d )|(\w))(((<BOOK>) )\d+([:,.]\d+[-\d, ;ab]*)*) - RegEx to find references in the form <BOOK> Chapter(:Verses, Verses-Verse; Chapters:Verses) etc
			// Build with escaping the '\' characters and passing the global flag to the constructor
			let search = new RegExp("(?<!(\\d )|(\\w))(((" + key + ") )\\d+([:,.]\\d+[-\\d, ;ab]*)*)", "gi")
			let results = contents.match(search);
			if (results!=null) {
				let book = BibleBooksNameTable.get(key)!;
				results.forEach(result => {
					// Get rid of book (abbreviation) + then split with "; " to get seperate Chapter/Verse references
					// Also gets rid of any trailing "; " if in a list w/ different book references in source text
					let chapterVerseLookups = result.slice(key.length+1).split("; ");
					chapterVerseLookups.forEach (lookup => {
						// If no actual lookup then skip
						if (lookup == '') {return;}

						// Get chapter number
						let chapter = lookup.split(':')[0];

						// Check for only chapter ref or for Jude which has no chapters (and verses will be handled as a chapter)
						if (lookup.split(':').length == 1)
						{
							// Check for the chapter being for an interval of verses and handle if needed
							if (chapter.contains('-')){
								let boundaries = chapter.split('-');
								// Check if actually an interval or just a rogue "-" included in regex
								// By checking if second verse bound is valid or NaN when parsed
								if (Number.isNaN(parseInt(boundaries[1]))) {
									this.AddRef(book, parseInt(chapter), 0, file);
								} else {
									let lowerBound = parseInt(boundaries[0]);
									let upperBound = parseInt(boundaries[1]);
									for (let i = lowerBound; i<=upperBound; i++)
									{
										this.AddRef(book, i, 0, file);
									}
								}
							} else {
								// parseInt will auto strip references to an a/b verse (ex: 25a -> 25)
								this.AddRef(book, parseInt(chapter), 0, file);
							}
							return;
						}

						// Split for multiple verse lookups
						let verseLookups = lookup.split(':')[1].split(',');
						verseLookups.forEach(verseLookup => {
							// Check for the lookup being for an interval of verses and handle if needed
							if (verseLookup.contains('-')){
								let verseBoundaries = verseLookup.split('-');
								// Check if actually an interval or just a rogue "-" included in regex
								// By checking if second verse bound is valid or NaN when parsed
								if (Number.isNaN(parseInt(verseBoundaries[1]))) {
									this.AddRef(book, parseInt(chapter), parseInt(verseBoundaries[0]), file);
								} else {
									let lowerBound = parseInt(verseBoundaries[0]);
									let upperBound = parseInt(verseBoundaries[1]);
									for (let i = lowerBound; i<=upperBound; i++)
									{
										this.AddRef(book, parseInt(chapter), i, file);
									}
								}
							} else {
								// parseInt will auto strip references to an a/b verse (ex: 25a -> 25)
								this.AddRef(book, parseInt(chapter), parseInt(verseLookup), file);
							}
						})
					})
				})
			}
		};
	}

	AddRef(book:string, chapter:number, verse:number, ref:TFile){
		let bookArrayIndex = BookOrder.findIndex((name) => name == book);
		let refPath = ref.path;
		// Chap -> Verse -> Ref
		// 0 index of Chap/Verse is for whole book/chap

		// Check if index for the book exists, if not make it
		if (this.settings.indexMap[bookArrayIndex] == null) {
			this.settings.indexMap[bookArrayIndex] = [];
		}

		// Check if index for the chapter exists, if not make it
		if (this.settings.indexMap[bookArrayIndex][chapter] == null)
		{
			this.settings.indexMap[bookArrayIndex][chapter] = [];
		}

		// Check if index for the chapter exists, if not make it
		if (this.settings.indexMap[bookArrayIndex][chapter][verse] == null)
		{
			this.settings.indexMap[bookArrayIndex][chapter][verse] = [];
		}

		// Check if index for verse already contains the reference, if not add it
		if (!this.settings.indexMap[bookArrayIndex][chapter][verse].contains(refPath))
		{
			this.settings.indexMap[bookArrayIndex][chapter][verse].push(refPath);
		}
	}

	async WriteIndex() {
		// Get vault for quick access
		let vault = this.app.vault;
		// Check if indexFile and any folders on the path exist; If not create them
		if (vault.getFileByPath(this.settings.indexFilePath)==null) {
			let splitPath = this.settings.indexFilePath.split('/');
			let curPath = ""
			for (let i=0; i<splitPath.length-1; i++)
			{
				curPath += splitPath[i];
				if (vault.getFolderByPath(curPath)==null) {
					vault.createFolder(curPath);
				}
				curPath += "/";
			}
			await vault.create(this.settings.indexFilePath, "");
		}

		// Get indexFile for quick access
		let indexFile = vault.getFileByPath(this.settings.indexFilePath)!;

		// Setup var to hold the eventual contents of the indexFile
		let indexFileContents = "File is automatically generated and any changes will be overwriten\n"

		// Get indexMap for quick access
		let indexMap = this.settings.indexMap;

		// Iterate through books to write indexes
		for (let bookNum = 0; bookNum < indexMap.length; bookNum++)
		{
			// Check if book has any data; if not skip
			if (indexMap[bookNum] == undefined) {continue;}

			let bookName = BookOrder[bookNum];
			// Setup output
			let output = "### "+bookName+"\n";
			output += ("| Verse | Ref |\n");
			output += ("| ---- | ---- |\n");
			// Var to count refs; only need to output an index if > 0
			let refCount = 0;
			// Iterate through chapters
			for (let chapNum = 0; chapNum < indexMap[bookNum].length; chapNum++) {
				// Check if chap has any data; if not skip
				if (indexMap[bookNum][chapNum] == undefined) {continue;}

				// Iterate through verses
				for (let verseNum = 0; verseNum < indexMap[bookNum][chapNum].length; verseNum++)
				{
					// Check if verse has any data; if not skip
					if (indexMap[bookNum][chapNum][verseNum] == undefined) {continue;}

					// Iterate through references
					for (let refNum = 0; refNum < indexMap[bookNum][chapNum][verseNum].length; refNum++){
						// For first ref need to add the chap/verse to the table
						// Also only needed if chap > 0 since chap of 0 is a ref to whole book not a specific chapter/verse
						if (refNum == 0 && chapNum > 0) { 
							output += ("| " + chapNum)
							// Check if verse > 0 (0 means ref is for whole chapter or is for a verse in Jude which doesn't have chapters and chapters are handled as verses)
							if (verseNum > 0) {
								output += (":"+verseNum+" | ");
							} else {
								output += (" | ")
							}
						} else {
							output += ("| | ");
						}
						// Get link to ref
						let refPath = indexMap[bookNum][chapNum][verseNum][refNum];
						// Get name of ref (last part of path is file name; subtract ".md" to get title)
						let refName = refPath.split('/').last()!.slice(0,-3)
						// Add link to output in form [[PATH|Name]]
						output += ("[["+refPath+"\\|"+refName+"]] |\n");
						// Inc refCount since we added a reference
						refCount++;
					}
				}
			}
			// If we had a reference then add table to what will be written to the indexFile
			if (refCount > 0){indexFileContents += output;}
		}

		// Overwrite indexFile with new contents
		vault.modify(indexFile, indexFileContents);
	}

	// Debounce the writeIndex function to batch saving the index
	// Buffers for 1 second until no more write calls are made
	WriteIndexDebounce = debounce(this.WriteIndex, 1000, true);
}

class ScriptureIndexerSettingTab extends PluginSettingTab {
	plugin: ScriptureIndexer;

	constructor(app: App, plugin: ScriptureIndexer) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Index file path')
			.setDesc("The where the index file will be located.")
			.addText(text => text
				.setValue(this.plugin.settings.indexFilePath)
				.onChange(async (value) => {
					this.plugin.settings.indexFilePath = normalizePath(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable automatic indexing')
			.setDesc("Update the index when files are saved, renamed, moved, or deleted")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAutoIndex)
				.onChange(async (val) => {
					this.plugin.settings.enableAutoIndex = val;
					await this.plugin.saveSettings();
				})
			)
	}
}