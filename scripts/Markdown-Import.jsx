/**
 * Markdown Import
 * 
 * Automatically imports and transforms Markdown-formatted text into an InDesign document,
 * replacing Markdown tags with corresponding paragraph and character styles,
 * and converting Markdown footnotes into real InDesign footnotes.
 * 
 * @version 1.0 beta 10
 * @license MIT
 * @author entremonde / Spectral lab
 * @website http://lab.spectral.art
 */

// Create a namespace to avoid polluting global scope
var MarkdownImport = (function() {
    "use strict";
    var VERSION = "1.0b10";
    
    // Set to true to enable logging in silent mode
    var enableLogging = false;
    
    /**
     * Internationalization module for Markdown-Import
     * @private
     */
    var I18n = (function() {
        // Current language - will be set by detectInDesignLanguage()
        var currentLanguage = 'en';
        
        // Translation dictionaries
        var translations = {
            'en': {
                // Main interface
                'title': 'Markdown Import v%s',
                'noDocument': 'No document open',
                'noStyles': 'Unable to run Markdown Import script because your document doesn\'t contain any styles.\n\nPlease create at least a few paragraph and character styles before running this script.',
                
                // Style panel
                'configuration': 'Configuration',
                'load': 'Load',
                'save': 'Save',
                'configDetected': 'Config detected',
                
                // Tab panel
                'paragraphStyles': 'Paragraph Styles',
                'characterStyles': 'Character Styles',
                'footnotes': 'Footnotes',
                
                // Style selectors (paragraph)
                'heading1': '# Heading 1',
                'heading2': '## Heading 2',
                'heading3': '### Heading 3',
                'heading4': '#### Heading 4',
                'heading5': '##### Heading 5',
                'heading6': '###### Heading 6',
                'blockquote': '> Blockquote',
                'bulletlist': '- Bullet list',
                'bodytext': 'Body text',
                
                // Style selectors (character)
                'italic': '*Italic*',
                'bold': '**Bold**',
                'bolditalic': '***Bold italic***',
                'underline': 'Underline',
                'smallcaps': 'Small Caps',
                'subscript': 'Subscript',
                'superscript': 'Superscript',
                
                // Footnote style
                'footnoteStyle': 'Footnote style',
                
                // Buttons
                'removeBlankPages': 'Remove blank pages',
                'cancel': 'Cancel',
                'apply': 'Apply',
                
                // Progress
                'applyingMarkdownStyles': 'Applying Markdown styles',
                'gettingTargetStory': 'Getting target story...',
                'resettingStyles': 'Resetting styles...',
                'applyingParagraphStyles': 'Applying paragraph styles...',
                'applyingCharacterStyles': 'Applying character styles...',
                'processingFootnotes': 'Processing footnotes...',
                'processingFootnoteStyles': 'Processing footnote styles...',
                'cleaningUpText': 'Cleaning up text...',
                'removingBlankPages': 'Removing blank pages...',
                'done': 'Done!',
                
                // Configuration
                'saveConfiguration': 'Save Configuration',
                'loadConfiguration': 'Load Configuration',
                'configFiles': 'Config files',
                'configSaved': 'Configuration saved successfully.',
                'configLoaded': 'Configuration loaded successfully.',
                
                // Error messages
                'errorSavingConfig': 'Error saving configuration: %s',
                'errorOpeningConfig': 'Could not save configuration file: %s',
                'errorInSaveConfig': 'Error in saveConfiguration: %s',
                'errorParsingConfig': 'Error parsing configuration: %s',
                'errorOpeningConfigFile': 'Could not open configuration file: %s',
                'errorInLoadConfig': 'Error in loadConfiguration: %s',
                'genericError': 'Error: %s\nLine: %s',
                'pagesRemoved': '(%d pages removed)'
            },
            'fr': {
                // Interface principale
                'title': 'Markdown Import v%s',
                'noDocument': 'Aucun document ouvert',
                'noStyles': 'Impossible d\'ex\u00E9cuter le script Markdown Import car votre document ne contient aucun style.\n\nVeuillez cr\u00E9er au moins quelques styles de paragraphe et de caract\u00E8re avant d\'ex\u00E9cuter ce script.',
                
                // Panneau de configuration
                'configuration': 'Configuration',
                'load': 'Charger',
                'save': 'Enregistrer',
                'configDetected': 'Config d\u00E9tect\u00E9e',
                
                // Panneau d'onglets
                'paragraphStyles': 'Styles de paragraphe',
                'characterStyles': 'Styles de caract\u00E8re',
                'footnotes': 'Notes de bas de page',
                
                // Sélecteurs de style (paragraphe)
                'heading1': '# Titre 1',
                'heading2': '## Titre 2',
                'heading3': '### Titre 3',
                'heading4': '#### Titre 4',
                'heading5': '##### Titre 5',
                'heading6': '###### Titre 6',
                'blockquote': '> Citation',
                'bulletlist': '- Liste \u00E0 puces',
                'bodytext': 'Corps de texte',
                
                // Sélecteurs de style (caractère)
                'italic': '*Italique*',
                'bold': '**Gras**',
                'bolditalic': '***Gras italique***',
                'underline': 'Soulign\u00E9',
                'smallcaps': 'Petites capitales',
                'subscript': 'Indice',
                'superscript': 'Exposant',
                
                // Style de note de bas de page
                'footnoteStyle': 'Style de note de bas de page',
                
                // Boutons
                'removeBlankPages': 'Supprimer les pages vides',
                'cancel': 'Annuler',
                'apply': 'Appliquer',
                
                // Progression
                'applyingMarkdownStyles': 'Application des styles Markdown',
                'gettingTargetStory': 'R\u00E9cup\u00E9ration du texte cible...',
                'resettingStyles': 'R\u00E9initialisation des styles...',
                'applyingParagraphStyles': 'Application des styles de paragraphe...',
                'applyingCharacterStyles': 'Application des styles de caract\u00E8re...',
                'processingFootnotes': 'Traitement des notes de bas de page...',
                'processingFootnoteStyles': 'Traitement des styles de notes de bas de page...',
                'cleaningUpText': 'Nettoyage du texte...',
                'removingBlankPages': 'Suppression des pages vides...',
                'done': 'Termin\u00E9 !',
                
                // Configuration
                'saveConfiguration': 'Enregistrer la configuration',
                'loadConfiguration': 'Charger la configuration',
                'configFiles': 'Fichiers de configuration',
                'configSaved': 'Configuration enregistr\u00E9e avec succ\u00E8s.',
                'configLoaded': 'Configuration charg\u00E9e avec succ\u00E8s.',
                
                // Messages d'erreur
                'errorSavingConfig': 'Erreur lors de l\'enregistrement de la configuration : %s',
                'errorOpeningConfig': 'Impossible d\'enregistrer le fichier de configuration : %s',
                'errorInSaveConfig': 'Erreur dans saveConfiguration : %s',
                'errorParsingConfig': 'Erreur d\'analyse de la configuration : %s',
                'errorOpeningConfigFile': 'Impossible d\'ouvrir le fichier de configuration : %s',
                'errorInLoadConfig': 'Erreur dans loadConfiguration : %s',
                'genericError': 'Erreur : %s\nLigne : %s',
                'pagesRemoved': '(%d pages supprimées)' 
            }
        };
        
        /**
         * Gets a translated string with optional substitutions
         * @param {string} key - Translation key
         * @param {...*} args - Arguments for substitutions
         * @return {string} Translated string
         */
        function __(key) {
            var lang = currentLanguage;
            var langDict = translations[lang] || translations['en'];
            var str = langDict[key] || translations['en'][key] || key;
            
            // If additional arguments are provided, use them for formatting
            if (arguments.length > 1) {
                var args = Array.prototype.slice.call(arguments, 1);
                str = str.replace(/%[sdx]/g, function(match) {
                    if (!args.length) return match;
                    var arg = args.shift();
                    switch (match) {
                        case '%s': return String(arg);
                        case '%d': return parseInt(arg, 10);
                        case '%x': return '0x' + parseInt(arg, 10).toString(16);
                        default: return match;
                    }
                });
            }
            
            return str;
        }
        
        /**
         * Changes the current language
         * @param {string} lang - Language code ('fr' or 'en')
         */
        function setLanguage(lang) {
            if (translations[lang]) {
                currentLanguage = lang;
            }
        }
        
        /**
         * Gets the current language
         * @return {string} Current language code
         */
        function getLanguage() {
            return currentLanguage;
        }
        
        /**
         * Detects the language of the InDesign interface
         * @return {string} Language code ('fr' or 'en')
         */
        function detectInDesignLanguage() {
            try {
                // Debug info to trace execution
                $.writeln("Attempting to detect InDesign language...");
                
                // Get localization string using the full app object
                var locale = "";
                
                // Try different methods to access locale
                if (typeof app !== 'undefined' && app.hasOwnProperty('locale')) {
                    locale = String(app.locale);
                    $.writeln("Detected locale: " + locale);
                } else if (typeof app !== 'undefined' && app.hasOwnProperty('languageAndRegion')) {
                    locale = String(app.languageAndRegion);
                    $.writeln("Detected languageAndRegion: " + locale);
                } else {
                    $.writeln("Could not access InDesign locale properties");
                    return 'en'; // Default to English
                }
                
                // Convert locale to lowercase for case-insensitive comparison
                locale = locale.toLowerCase();
                
                // Debug the detected locale
                $.writeln("Normalized locale: " + locale);
                
                // Check for French locales
                if (locale.indexOf('fr') !== -1) {
                    $.writeln("French locale detected, setting language to fr");
                    return 'fr';
                } else {
                    // Default to English for any other locale
                    $.writeln("Non-French locale detected, setting language to en");
                    return 'en';
                }
            } catch (e) {
                // Log detailed error information
                $.writeln("Error detecting language: " + e);
                $.writeln("Error details: " + e.message);
                if (e.line) $.writeln("Error line: " + e.line);
                if (e.stack) $.writeln("Error stack: " + e.stack);
                
                // In case of error, use English by default
                return 'en';
            }
        }
        
        // Set current language based on InDesign locale
        currentLanguage = detectInDesignLanguage();
        
        // Public API
        return {
            __: __,
            setLanguage: setLanguage,
            getLanguage: getLanguage,
            detectLanguage: detectInDesignLanguage
        };
    })();
    
    /**
     * Safe JSON implementation for older InDesign versions
     * @private
     */
    var safeJSON = {
        /**
         * Converts an object to a JSON string
         * @param {Object} obj - The object to stringify
         * @return {String} The JSON string
         */
        stringify: function(obj) {
            var t = typeof obj;
            if (t !== "object" || obj === null) {
                // Handle primitive types
                if (t === "string") return '"' + obj.replace(/"/g, '\\"') + '"';
                if (t === "number" || t === "boolean") return String(obj);
                if (t === "function") return "null"; // Functions become null
                return "null"; // undefined and null become null
            }
            
            // Handle arrays
            if (obj instanceof Array) {
                var items = [];
                for (var i = 0; i < obj.length; i++) {
                    items.push(safeJSON.stringify(obj[i]));
                }
                return "[" + items.join(",") + "]";
            }
            
            // Handle objects
            var pairs = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    pairs.push('"' + key + '":' + safeJSON.stringify(obj[key]));
                }
                
            }
            return "{" + pairs.join(",") + "}";
        },
        
        /**
         * Parses a JSON string into an object - uses a safer method than eval
         * @param {String} str - The JSON string to parse
         * @return {Object} The parsed object
         */
        parse: function(str) {
            // Simple validation to reduce risk
            if (!/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                throw new Error("Invalid JSON");
            }
            
            // Use Function instead of eval for slightly better security
            // Still not perfect but better than direct eval
            try {
                return (new Function('return ' + str))();
            } catch (e) {
                throw new Error("JSON parse error: " + e.message);
            }
        }
    };
    
    // Use built-in JSON if available, otherwise use our implementation
    if (typeof JSON === 'undefined') {
        JSON = safeJSON;
    }
    
    /**
     * Regular expressions for Markdown syntax
     * @private
     */
    var REGEX = {
        h1: /^# (.+)/,
        h2: /^## (.+)/,
        h3: /^### (.+)/,
        h4: /^#### (.+)/,
        h5: /^##### (.+)/,
        h6: /^###### (.+)/,
        quote: /^>[ \t]?(.+)/,
        bulletlist: /^[-*+] (.+)/,
        boldItalic: /\*\*\*([^\*]+)\*\*\*/,
        boldItalicUnderscore: /___([^_]+)___/,
        boldItalicMixed1: /\*\*_([^_\*]+)_\*\*/,
        boldItalicMixed2: /__\*([^\*_]+)\*__/,
        boldItalicMixed3: /\*__([^_\*]+)__\*/,
        boldItalicMixed4: /_\*\*([^\*_]+)\*\*_/,
        bold: /\*\*([^\*]+)\*\*/,
        boldUnderscore: /__([^_]+)__/,
        italic: /\*([^\*]+)\*/,
        italicUnderscore: /_([^_]+)_/,
        underline: /\[([^\]]+)\]\{\.underline\}/,
        smallCapsAttr: /\[([^\]]+)\]\{\.smallcaps\}/,
        superscript: /\^([^^\r\]]+)\^/,
        footnoteRef: /\[\^([^\]]+)\]/,
        footnoteDefinition: /^\[\^([^\]]+)\]:\s*(.+)/,
        lineBreaks: /\r\r+/,
        backslash: /\\/
    };
    
    /**
     * Escaped characters handling - Global variables
     */
    var ESCAPE_SEQUENCES = {
        '\\\\': '§ESC§BACKSLASH§',      // Literal backslash: \\
        '\\*': '§ESC§ASTERISK§',        // Asterisk: \* (for italic/bold)
        '\\#': '§ESC§HASH§',            // Hashtag: \#
        '\\$': '§ESC§DOLLAR§',          // Dollar: \$
        "\\'": '§ESC§APOSTROPHE§',      // Apostrophe: \'
        '\\[': '§ESC§BRACKET§OPEN§',    // Opening bracket: \[
        '\\]': '§ESC§BRACKET§CLOSE§',   // Closing bracket: \]
        '\\^': '§ESC§CIRCUMFLEX§',      // Circumflex: \^
        '\\_': '§ESC§UNDERSCORE§',      // Underscore: \_
        '\\`': '§ESC§BACKTICK§',        // Backtick: \`
        '\\|': '§ESC§PIPE§',            // Pipe: \|
        '\\~': '§ESC§TILDE§'            // Tilde: \~
    };
    
    // Reverse mapping for restoration
    var RESTORE_SEQUENCES = {};
    for (var key in ESCAPE_SEQUENCES) {
        if (ESCAPE_SEQUENCES.hasOwnProperty(key)) {
            RESTORE_SEQUENCES[ESCAPE_SEQUENCES[key]] = key.substring(1); // Remove backslash prefix
        }
    }
    
    /**
     * Protects escaped characters before Markdown processing
     * @param {string} text - The text to process
     * @return {string} Text with escaped characters protected
     * @private
     */
    function protectEscapedCharacters(text) {
        var result = text;
        
        // Process \\ first to avoid conflicts
        if (result.indexOf('\\\\') !== -1) {
            var parts = result.split('\\\\');
            result = parts.join(ESCAPE_SEQUENCES['\\\\']);
        }
        
        // Process other escape sequences
        for (var escaped in ESCAPE_SEQUENCES) {
            if (ESCAPE_SEQUENCES.hasOwnProperty(escaped) && escaped !== '\\\\') {
                if (result.indexOf(escaped) !== -1) {
                    var parts = result.split(escaped);
                    result = parts.join(ESCAPE_SEQUENCES[escaped]);
                }
            }
        }
        
        return result;
    }
    
    /**
     * Restores escaped characters in the main text
     * @param {Story} target - The InDesign story to process
     * @private
     */
    function restoreEscapedCharacters(target) {
        try {
            // Save current options
            var oldIncludeFootnotes = app.findChangeTextOptions.includeFootnotes;
            var oldIncludeMasterPages = app.findChangeTextOptions.includeMasterPages;
            var oldIncludeHiddenLayers = app.findChangeTextOptions.includeHiddenLayers;
            
            // Configure search (exclude footnotes here)
            app.findChangeTextOptions.includeFootnotes = false;
            app.findChangeTextOptions.includeMasterPages = false;
            app.findChangeTextOptions.includeHiddenLayers = false;
            
            // Check which placeholders exist
            var textContent = target.contents;
            var placeholdersToRestore = [];
            
            for (var placeholder in RESTORE_SEQUENCES) {
                if (RESTORE_SEQUENCES.hasOwnProperty(placeholder)) {
                    if (textContent.indexOf(placeholder) !== -1) {
                        placeholdersToRestore.push({
                            find: placeholder,
                            replace: RESTORE_SEQUENCES[placeholder]
                        });
                    }
                }
            }
            
            // Restore only present placeholders
            if (placeholdersToRestore.length > 0) {
                $.writeln("Restoring " + placeholdersToRestore.length + " escape sequences...");
                
                for (var i = 0; i < placeholdersToRestore.length; i++) {
                    var mapping = placeholdersToRestore[i];
                    
                    // Clear preferences
                    app.findTextPreferences = app.changeTextPreferences = null;
                    app.findTextPreferences.findWhat = mapping.find;
                    app.changeTextPreferences.changeTo = mapping.replace;
                    
                    // Execute replacement
                    var foundItems = target.changeText();
                    $.writeln("Replaced " + foundItems.length + " instances of: " + mapping.find);
                }
            }
            
            // Restore options
            app.findChangeTextOptions.includeFootnotes = oldIncludeFootnotes;
            app.findChangeTextOptions.includeMasterPages = oldIncludeMasterPages;
            app.findChangeTextOptions.includeHiddenLayers = oldIncludeHiddenLayers;
            
            // Clear preferences
            app.findTextPreferences = app.changeTextPreferences = null;
            
        } catch (e) {
            $.writeln("Error in restoreEscapedCharacters: " + e.message);
            app.findTextPreferences = app.changeTextPreferences = null;
            throw new Error("Failed to restore escaped characters: " + e.message);
        }
    }
    
    /**
     * Restores escaped characters in footnotes
     * @private
     */
    function restoreEscapedCharactersInFootnotes() {
        try {
            // Check if there are footnotes
            var allStories = app.activeDocument.stories.everyItem().getElements();
            var hasFootnotes = false;
            var allFootnoteContent = "";
            
            for (var i = 0; i < allStories.length; i++) {
                try {
                    var footnotes = allStories[i].footnotes.everyItem().getElements();
                    if (footnotes.length > 0) {
                        hasFootnotes = true;
                        for (var j = 0; j < footnotes.length; j++) {
                            allFootnoteContent += footnotes[j].texts[0].contents;
                        }
                    }
                } catch(e) {
                    // Ignore errors
                }
            }
            
            if (!hasFootnotes) {
                return;
            }
            
            // Save options
            var oldIncludeFootnotes = app.findChangeTextOptions.includeFootnotes;
            var oldIncludeMasterPages = app.findChangeTextOptions.includeMasterPages;
            var oldIncludeHiddenLayers = app.findChangeTextOptions.includeHiddenLayers;
            
            // Search ONLY in footnotes
            app.findChangeTextOptions.includeFootnotes = true;
            app.findChangeTextOptions.includeMasterPages = false;
            app.findChangeTextOptions.includeHiddenLayers = false;
            
            // Check placeholders present in footnotes
            var placeholdersToRestore = [];
            for (var placeholder in RESTORE_SEQUENCES) {
                if (RESTORE_SEQUENCES.hasOwnProperty(placeholder)) {
                    if (allFootnoteContent.indexOf(placeholder) !== -1) {
                        placeholdersToRestore.push({
                            find: placeholder,
                            replace: RESTORE_SEQUENCES[placeholder]
                        });
                    }
                }
            }
            
            if (placeholdersToRestore.length > 0) {
                $.writeln("Restoring " + placeholdersToRestore.length + " escape sequences in footnotes...");
                
                for (var i = 0; i < placeholdersToRestore.length; i++) {
                    var mapping = placeholdersToRestore[i];
                    
                    app.findTextPreferences = app.changeTextPreferences = null;
                    app.findTextPreferences.findWhat = mapping.find;
                    app.changeTextPreferences.changeTo = mapping.replace;
                    
                    app.activeDocument.changeText();
                }
            }
            
            // Restore options
            app.findChangeTextOptions.includeFootnotes = oldIncludeFootnotes;
            app.findChangeTextOptions.includeMasterPages = oldIncludeMasterPages;
            app.findChangeTextOptions.includeHiddenLayers = oldIncludeHiddenLayers;
            
            app.findTextPreferences = app.changeTextPreferences = null;
            
        } catch (e) {
            $.writeln("Error in restoreEscapedCharactersInFootnotes: " + e.message);
            app.findTextPreferences = app.changeTextPreferences = null;
        }
    }
    
    /**
     * Predefined style names in different languages
     * @private
     */
    var STYLE_PRESELECTION = {
        h1:         ["heading 1", "h1", "titre 1"],
        h2:         ["heading 2", "h2", "titre 2"],
        h3:         ["heading 3", "h3", "titre 3"],
        h4:         ["heading 4", "h4", "titre 4"],
        h5:         ["heading 5", "h5", "titre 5"],
        h6:         ["heading 6", "h6", "titre 6"],
        quote:      ["blockquote", "citation"],
        bulletlist: ["bullet", "bulleted list", "liste", "ul", "liste à puce"],
        normal:     ["body", "body text", "normal", "texte", "standard", "texte standard"],
        italic:     ["italic", "em", "italique"],
        bold:       ["bold", "strong", "gras"],
        bolditalic:  ["bold italic", "strong em", "bold-italic", "gras italique", "gras-italique"],
        underline:  ["underline", "souligne"],
        smallcaps:  ["small caps", "smallcaps", "petites capitales", "petite cap"],
        subscript:  ["subscript", "indice"],
        superscript:["superscript", "exposant"],
        note:       ["note", "footnote", "notes de bas de page"]
    };
    
    /**
     * Configuration file extension
     * @private
     */
    var CONFIG_EXT = ".mdconfig";
    
    /**
     * Progress window reference
     * @private
     */
    var progressWin = null;
    
    /**
     * Attempts to match style names with predefined patterns
     * @param {Object} styleLists - Object containing paragraph and character styles
     * @return {Object} An object with default style mappings
     */
    function guessDefaultStyles(styleLists) {
        function findByPreset(list, presets) {
            for (var i = 0; i < presets.length; i++) {
                var preset = presets[i].toLowerCase();
                for (var j = 0; j < list.length; j++) {
                    if (list[j].name.toLowerCase() === preset) return list[j];
                }
            }
            return list[0]; // fallback
        }
    
        return {
            h1:         findByPreset(styleLists.paragraph, STYLE_PRESELECTION.h1),
            h2:         findByPreset(styleLists.paragraph, STYLE_PRESELECTION.h2),
            h3:         findByPreset(styleLists.paragraph, STYLE_PRESELECTION.h3),
            h4:         findByPreset(styleLists.paragraph, STYLE_PRESELECTION.h4),
            h5:         findByPreset(styleLists.paragraph, STYLE_PRESELECTION.h5),
            h6:         findByPreset(styleLists.paragraph, STYLE_PRESELECTION.h6),
            quote:      findByPreset(styleLists.paragraph, STYLE_PRESELECTION.quote),
            bulletlist: findByPreset(styleLists.paragraph, STYLE_PRESELECTION.bulletlist),
            normal:     findByPreset(styleLists.paragraph, STYLE_PRESELECTION.normal),
            italic:     findByPreset(styleLists.character, STYLE_PRESELECTION.italic),
            bold:       findByPreset(styleLists.character, STYLE_PRESELECTION.bold),
            bolditalic:   findByPreset(styleLists.character, STYLE_PRESELECTION.bolditalic),
            underline:  findByPreset(styleLists.character, STYLE_PRESELECTION.underline),
            smallcaps:  findByPreset(styleLists.character, STYLE_PRESELECTION.smallcaps),
            superscript:findByPreset(styleLists.character, STYLE_PRESELECTION.superscript),
            subscript:  findByPreset(styleLists.character, STYLE_PRESELECTION.subscript),
            note:       findByPreset(styleLists.paragraph, STYLE_PRESELECTION.note)
        };
    }
    
    /**
     * Recursively finds configuration files in directories
     * @param {Folder} folder - The folder to search in
     * @param {Number} maxDepth - Maximum directory depth to search
     * @param {Number} currentDepth - Current search depth
     * @return {Array} Array of found configuration files
     */
    function findConfigFilesRecursively(folder, maxDepth, currentDepth) {
        if (currentDepth > maxDepth) return []; // Depth limit to avoid infinite loops
        
        var files = [];
        
        try {
            // Find .mdconfig files in current folder
            var configFiles = folder.getFiles("*.mdconfig");
            if (configFiles && configFiles.length > 0) {
                for (var i = 0; i < configFiles.length; i++) {
                    files.push(configFiles[i]);
                }
            }
            
            // Get all subfolders
            var subfolders = folder.getFiles(function(file) {
                return file instanceof Folder;
            });
            
            // Recursively process subfolders
            if (subfolders && subfolders.length > 0) {
                for (var i = 0; i < subfolders.length; i++) {
                    var subfolder = subfolders[i];
                    var subfiles = findConfigFilesRecursively(subfolder, maxDepth, currentDepth + 1);
                    for (var j = 0; j < subfiles.length; j++) {
                        files.push(subfiles[j]);
                    }
                }
            }
        } catch (e) {
            // Log error but continue
            $.writeln("Error searching in folder: " + e.message);
        }
        
        return files;
    }
    
    /**
     * Automatically searches and loads a configuration file
     * @param {Object} styles - Object containing paragraph and character styles
     * @return {Object|null} The loaded configuration or null if none found
     */
    function autoLoadConfig(styles) {
        try {
            // Check if the document is saved
            if (!app.activeDocument.saved) {
                return null; // Document not saved yet, no folder to query
            }
            
            // Get the path of the active document
            var docPath = app.activeDocument.filePath;
            if (!docPath) return null;
            
            // Create folder object
            var folder = new Folder(docPath);
            
            // Recursive search for .mdconfig files with a maximum depth of 3
            var files = findConfigFilesRecursively(folder, 3, 0);
            
            // No configuration file found
            if (!files || files.length === 0) {
                return null;
            }
            
            // If there are multiple files, take the first one
            var configFile = files[0];
            
            // Load the configuration
            configFile.encoding = "UTF-8";
            
            if (configFile.open("r")) {
                try {
                    var content = configFile.read();
                    configFile.close();
                    
                    var configData = JSON.parse(content);
                    var config = {};
                    
                    // Match style names with actual style objects
                    function findStyleByName(list, name) {
                        // If name is null, return null (improved null handling)
                        if (name === null) return null;
                        
                        for (var i = 0; i < list.length; i++) {
                            if (list[i].name === name) return list[i];
                        }
                        return null;
                    }
                    
                    // Try to find the styles in the current document
                    // Now with proper null handling
                    config.h1 = configData.h1 !== null ? findStyleByName(styles.paragraph, configData.h1) : null;
                    config.h2 = configData.h2 !== null ? findStyleByName(styles.paragraph, configData.h2) : null;
                    config.h3 = configData.h3 !== null ? findStyleByName(styles.paragraph, configData.h3) : null;
                    config.h4 = configData.h4 !== null ? findStyleByName(styles.paragraph, configData.h4) : null;
                    config.h5 = configData.h5 !== null ? findStyleByName(styles.paragraph, configData.h5) : null;
                    config.h6 = configData.h6 !== null ? findStyleByName(styles.paragraph, configData.h6) : null;
                    config.quote = configData.quote !== null ? findStyleByName(styles.paragraph, configData.quote) : null;
                    config.bulletlist = configData.bulletlist !== null ? findStyleByName(styles.paragraph, configData.bulletlist) : null;
                    config.normal = configData.normal !== null ? findStyleByName(styles.paragraph, configData.normal) : null;
                    config.italic = configData.italic !== null ? findStyleByName(styles.character, configData.italic) : null;
                    config.bold = configData.bold !== null ? findStyleByName(styles.character, configData.bold) : null;
                    config.bolditalic = configData.bolditalic !== null ? findStyleByName(styles.character, configData.bolditalic) : null;
                    config.underline = configData.underline !== null ? findStyleByName(styles.character, configData.underline) : null;
                    config.smallcaps = configData.smallcaps !== null ? findStyleByName(styles.character, configData.smallcaps) : null;
                    config.superscript = configData.superscript !== null ? findStyleByName(styles.character, configData.superscript) : null;
                    config.subscript = configData.subscript !== null ? findStyleByName(styles.character, configData.subscript) : null;
                    config.note = configData.note !== null ? findStyleByName(styles.paragraph, configData.note) : null;
                    
                    // Improved boolean handling for removeBlankPages
                    config.removeBlankPages = configData.removeBlankPages === true;
                    
                    // Set fallback values for any null objects
                    if (config.h1 === null && styles.paragraph.length > 0) config.h1 = styles.paragraph[0];
                    if (config.h2 === null && styles.paragraph.length > 0) config.h2 = styles.paragraph[0];
                    if (config.h3 === null && styles.paragraph.length > 0) config.h3 = styles.paragraph[0];
                    if (config.h4 === null && styles.paragraph.length > 0) config.h4 = styles.paragraph[0];
                    if (config.h5 === null && styles.paragraph.length > 0) config.h5 = styles.paragraph[0];
                    if (config.h6 === null && styles.paragraph.length > 0) config.h6 = styles.paragraph[0];
                    if (config.quote === null && styles.paragraph.length > 0) config.quote = styles.paragraph[0];
                    if (config.bulletlist === null && styles.paragraph.length > 0) config.bulletlist = styles.paragraph[0];
                    if (config.normal === null && styles.paragraph.length > 0) config.normal = styles.paragraph[0];
                    
                    return config;
                } catch (e) {
                    $.writeln("Error parsing configuration: " + e.message);
                    return null;
                }
            } else {
                $.writeln("Could not open configuration file: " + configFile.error);
                return null;
            }
        } catch (e) {
            $.writeln("Error in autoLoadConfig: " + e.message);
            return null;
        }
    }
    
    /**
     * Creates a progress bar dialog
     * @param {String} title - The dialog title
     * @param {Number} maxValue - Maximum value for the progress bar
     */
    function createProgressBar(maxValue) {
        try {
            progressWin = new Window("palette", I18n.__("applyingMarkdownStyles"));
            progressWin.progressBar = progressWin.add("progressbar", undefined, 0, maxValue);
            progressWin.progressBar.preferredSize.width = 300;
            progressWin.status = progressWin.add("statictext", undefined, "");
            progressWin.status.preferredSize.width = 300;
            
            // Center the window
            progressWin.center();
            progressWin.show();
        } catch (e) {
            $.writeln("Error creating progress bar: " + e.message);
            // Continue without progress bar
            progressWin = null;
        }
    }
    
    /**
     * Updates the progress bar
     * @param {Number} value - Current progress value
     * @param {String} statusText - Status text to display
     */
    function updateProgressBar(value, statusText) {
        if (!progressWin) return;
        
        try {
            progressWin.progressBar.value = value;
            progressWin.status.text = statusText;
            progressWin.update();
        } catch (e) {
            $.writeln("Error updating progress bar: " + e.message);
        }
    }
    
    /**
     * Closes the progress bar
     */
    function closeProgressBar() {
        if (progressWin) {
            try {
                progressWin.close();
                progressWin = null;
            } catch (e) {
                $.writeln("Error closing progress bar: " + e.message);
            }
        }
    }
    
    /**
     * Saves the configuration to a file
     * @param {Object} config - The configuration to save
     * @return {Boolean} True if successful, false otherwise
     */
    function saveConfiguration(config) {
        try {
            // Show save dialog to choose location and filename
            var saveFile = File.saveDialog("Save Configuration", "Config files:*" + CONFIG_EXT);
            if (!saveFile) return false;
            
            // Add extension if not provided
            if (!saveFile.name.match(new RegExp(CONFIG_EXT + "$", "i"))) {
                saveFile = new File(saveFile.absoluteURI + CONFIG_EXT);
            }
            
            saveFile.encoding = "UTF-8";
            
            if (saveFile.open("w")) {
                try {
                    // Create a data object with style names only
                    var configData = {
                        h1: config.h1 ? config.h1.name : null,
                        h2: config.h2 ? config.h2.name : null,
                        h3: config.h3 ? config.h3.name : null,
                        h4: config.h4 ? config.h4.name : null,
                        h5: config.h5 ? config.h5.name : null,
                        h6: config.h6 ? config.h6.name : null,
                        quote: config.quote ? config.quote.name : null,
                        bulletlist: config.bulletlist ? config.bulletlist.name : null,
                        normal: config.normal ? config.normal.name : null,
                        italic: config.italic ? config.italic.name : null,
                        bold: config.bold ? config.bold.name : null,
                        bolditalic: config.bolditalic ? config.bolditalic.name : null,
                        underline: config.underline ? config.underline.name : null,
                        smallcaps: config.smallcaps ? config.smallcaps.name : null,
                        subscript: config.subscript ? config.subscript.name : null,
                        superscript: config.superscript ? config.superscript.name : null,
                        note: config.note ? config.note.name : null,
                        removeBlankPages: config.removeBlankPages
                    };
                    
                    saveFile.write(JSON.stringify(configData));
                    saveFile.close();
                    return true;
                } catch (e) {
                    alert("Error saving configuration: " + e.message);
                    return false;
                }
            } else {
                alert("Could not save configuration file: " + saveFile.error);
                return false;
            }
        } catch (e) {
            alert("Error in saveConfiguration: " + e.message);
            return false;
        }
    }
    
    /**
     * Loads a configuration from a file
     * @param {Object} styles - Object containing paragraph and character styles
     * @return {Object|null} The loaded configuration or null if loading failed
     */
    function loadConfiguration(styles) {
        try {
            // Show open dialog to select a configuration file
            var openFile = File.openDialog("Load Configuration", "Config files:*" + CONFIG_EXT);
            if (!openFile) return null;
            
            openFile.encoding = "UTF-8";
            
            if (openFile.open("r")) {
                try {
                    var content = openFile.read();
                    openFile.close();
                    
                    var configData = JSON.parse(content);
                    var config = {};
                    
                    // Match style names with actual style objects
                    function findStyleByName(list, name) {
                        for (var i = 0; i < list.length; i++) {
                            if (list[i].name === name) return list[i];
                        }
                        return null;
                    }
                    
                    // Try to find the styles in the current document
                    // Correctly handle null values
                    config.h1 = configData.h1 !== null ? findStyleByName(styles.paragraph, configData.h1) || styles.paragraph[0] : null;
                    config.h2 = configData.h2 !== null ? findStyleByName(styles.paragraph, configData.h2) || styles.paragraph[0] : null;
                    config.h3 = configData.h3 !== null ? findStyleByName(styles.paragraph, configData.h3) || styles.paragraph[0] : null;
                    config.h4 = configData.h4 !== null ? findStyleByName(styles.paragraph, configData.h4) || styles.paragraph[0] : null;
                    config.h5 = configData.h5 !== null ? findStyleByName(styles.paragraph, configData.h5) || styles.paragraph[0] : null;
                    config.h6 = configData.h6 !== null ? findStyleByName(styles.paragraph, configData.h6) || styles.paragraph[0] : null;
                    config.quote = configData.quote !== null ? findStyleByName(styles.paragraph, configData.quote) || styles.paragraph[0] : null;
                    config.bulletlist = configData.bulletlist !== null ? findStyleByName(styles.paragraph, configData.bulletlist) || styles.paragraph[0] : null;
                    config.normal = configData.normal !== null ? findStyleByName(styles.paragraph, configData.normal) || styles.paragraph[0] : null;
                    config.italic = configData.italic !== null ? findStyleByName(styles.character, configData.italic) || styles.character[0] : null;
                    config.bold = configData.bold !== null ? findStyleByName(styles.character, configData.bold) || styles.character[0] : null;
                    config.bolditalic = configData.bolditalic !== null ? findStyleByName(styles.character, configData.bolditalic) || styles.character[0] : null;
                    config.underline = configData.underline !== null ? findStyleByName(styles.character, configData.underline) || styles.character[0] : null;
                    config.smallcaps = configData.smallcaps !== null ? findStyleByName(styles.character, configData.smallcaps) || styles.character[0] : null;
                    config.superscript = configData.superscript !== null ? findStyleByName(styles.character, configData.superscript) || styles.character[0] : null;
                    config.subscript = configData.subscript !== null ? findStyleByName(styles.character, configData.subscript) || styles.character[0] : null;
                    config.note = configData.note !== null ? findStyleByName(styles.paragraph, configData.note) || styles.paragraph[0] : null;
                    config.removeBlankPages = configData.removeBlankPages === true;
                    
                    return config;
                } catch (e) {
                    alert("Error parsing configuration: " + e.message);
                    return null;
                }
            } else {
                alert("Could not open configuration file: " + openFile.error);
                return null;
            }
        } catch (e) {
            alert("Error in loadConfiguration: " + e.message);
            return null;
        }
    }
    
    /**
     * Gets target story for modification
     * @return {Story} The story to be modified
     */
    function getTargetStory() {
        try {
            // Option 1: If a selection exists and is part of a text frame
            if (app.selection.length > 0 && app.selection[0].hasOwnProperty("parentStory")) {
                return app.selection[0].parentStory;
            }
            
            // Option 2: Look for a frame with script label "contenu" or "content"
            var allTextFrames = app.activeDocument.textFrames.everyItem().getElements();
            for (var i = 0; i < allTextFrames.length; i++) {
                var frame = allTextFrames[i];
                if (frame.label === "contenu" || frame.label === "content") {
                    return frame.parentStory;
                }
            }
            
            // Option 3: Default to the first story in the document
            return app.activeDocument.stories[0];
        } catch (e) {
            $.writeln("Error in getTargetStory: " + e.message);
            // Fallback to first story if available
            if (app.activeDocument.stories.length > 0) {
                return app.activeDocument.stories[0];
            }
            throw new Error("Could not find a valid story to modify");
        }
    }
    
    /**
     * Reset all styles to normal and protect escaped characters
     * @param {Story} target - The story to modify
     * @param {Object} styleMapping - Style mapping configuration
     */
    function resetStyles(target, styleMapping) {
        try {
            // CRITICAL: Protect escaped characters BEFORE any other processing
            var protectedText = protectEscapedCharacters(target.contents);
            target.contents = protectedText;
            
            // Reset paragraph styles
            app.findTextPreferences = app.changeTextPreferences = null;
            target.texts[0].appliedParagraphStyle = styleMapping.normal;
        } catch (e) {
            $.writeln("Error in resetStyles: " + e.message);
            throw new Error("Failed to reset styles: " + e.message);
        }
    }
    
    /**
     * Apply paragraph styles to matching patterns
     * @param {Story} target - The story to modify
     * @param {Object} styleMapping - Style mapping configuration
     */
    function applyParagraphStyles(target, styleMapping) {
        try {
            applyParagraphStyle(target, REGEX.h1, styleMapping.h1);
            applyParagraphStyle(target, REGEX.h2, styleMapping.h2);
            applyParagraphStyle(target, REGEX.h3, styleMapping.h3);
            applyParagraphStyle(target, REGEX.h4, styleMapping.h4);
            applyParagraphStyle(target, REGEX.h5, styleMapping.h5);
            applyParagraphStyle(target, REGEX.h6, styleMapping.h6);
            applyParagraphStyle(target, REGEX.quote, styleMapping.quote);
            applyParagraphStyle(target, REGEX.bulletlist, styleMapping.bulletlist);
        } catch (e) {
            $.writeln("Error in applyParagraphStyles: " + e.message);
            throw new Error("Failed to apply paragraph styles: " + e.message);
        }
    }
    
    /**
     * Apply a paragraph style to text matching a pattern
     * @param {Story} target - The story to modify
     * @param {RegExp} regex - The pattern to match
     * @param {ParagraphStyle} style - The style to apply
     */
    function applyParagraphStyle(target, regex, style) {
        try {
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = regex.source;
            var founds = target.findGrep();
            for (var i = 0; i < founds.length; i++) {
                var para = founds[i];
                para.contents = para.contents.replace(regex, "$1");
                // Appliquer le style seulement s'il n'est pas null
                if (style) {
                    para.appliedParagraphStyle = style;
                }
            }
        } catch (e) {
            $.writeln("Error in applyParagraphStyle: " + e.message + " for regex: " + regex.source);
        }
    }
    
    /**
     * Apply character styles to matching patterns
     * @param {Story} target - The story to modify
     * @param {Object} styleMapping - Style mapping configuration
     */
    function applyCharacterStyles(target, styleMapping) {
        try {
            var cMap = [
                { regex: REGEX.boldItalic, style: styleMapping.bolditalic },
                { regex: REGEX.boldItalicUnderscore, style: styleMapping.bolditalic },
                { regex: REGEX.boldItalicMixed1, style: styleMapping.bolditalic },
                { regex: REGEX.boldItalicMixed2, style: styleMapping.bolditalic },
                { regex: REGEX.boldItalicMixed3, style: styleMapping.bolditalic },
                { regex: REGEX.boldItalicMixed4, style: styleMapping.bolditalic },
                { regex: REGEX.bold, style: styleMapping.bold },
                { regex: REGEX.boldUnderscore, style: styleMapping.bold },
                { regex: REGEX.italic, style: styleMapping.italic },
                { regex: REGEX.italicUnderscore, style: styleMapping.italic },
                { regex: REGEX.underline, style: styleMapping.underline },
                { regex: REGEX.smallCapsAttr, style: styleMapping.smallcaps },
                { regex: REGEX.superscript, style: styleMapping.superscript }
            ];
            for (var i = 0; i < cMap.length; i++) {
                applyCharStyle(target, cMap[i].regex, cMap[i].style);
            }
            // Apply special character styles (subscript)
            applySpecialCharacterStyles(target, styleMapping);
        } catch (e) {
            $.writeln("Error in applyCharacterStyles: " + e.message);
            throw new Error("Failed to apply character styles: " + e.message);
        }
    }
    
    /**
     * Apply character styles for special characters incompatible with InDesign GREP
     * @param {Story} target - The story to modify  
     * @param {Object} styleMapping - Style mapping configuration
     * @private
     */
    function applySpecialCharacterStyles(target, styleMapping) {
        // Subscript: ~text~ (tilde is reserved in InDesign GREP engine)
        applySubscriptStyle(target, styleMapping.subscript);
        
        // Future special cases can be added here as needed
    }
    
    /**
     * Apply subscript style using findText (workaround for InDesign GREP limitation)
     * Processes ~text~ patterns and applies subscript character style
     * @param {Story} target - The story to modify
     * @param {CharacterStyle} style - The subscript style to apply
     * @private
     */
    function applySubscriptStyle(target, style) {
        try {
            app.findTextPreferences = app.changeTextPreferences = null;
            app.findTextPreferences.findWhat = "~";
            var tildeMatches = target.findText();
            
            if (tildeMatches.length < 2) return;
            
            var processedPairs = 0;
            var pairsToProcess = Math.floor(tildeMatches.length / 2);
            
            for (var pairIndex = pairsToProcess - 1; pairIndex >= 0; pairIndex--) {
                var startIdx = pairIndex * 2;
                var endIdx = startIdx + 1;
                
                try {
                    var startTilde = tildeMatches[startIdx];
                    var endTilde = tildeMatches[endIdx];
                    
                    if (!startTilde.isValid || !endTilde.isValid) continue;
                    if (startTilde.paragraphs[0] !== endTilde.paragraphs[0]) continue;
                    
                    var story = startTilde.parentStory;
                    var startIndex = startTilde.index;
                    var endIndex = endTilde.index;
                    
                    if (endIndex > startIndex + 1) {
                        var subscriptRange = story.characters.itemByRange(startIndex + 1, endIndex - 1);
                        if (style && subscriptRange.isValid) {
                            subscriptRange.appliedCharacterStyle = style;
                        }
                        endTilde.remove();
                        startTilde.remove();
                        processedPairs++;
                    }
                } catch (e) {
                    $.writeln("Error processing subscript pair: " + e.message);
                }
            }
            
            if (processedPairs > 0) {
                $.writeln("Subscript: " + processedPairs + " pair(s) processed");
            }
            
        } catch (e) {
            $.writeln("Error in applySubscriptStyle: " + e.message);
            throw new Error("Failed to apply subscript style: " + e.message);
        } finally {
            app.findTextPreferences = app.changeTextPreferences = null;
        }
    }
    
    /**
     * Apply a character style to text matching a pattern
     * @param {Story} target - The story to modify
     * @param {RegExp} regex - The pattern to match
     * @param {CharacterStyle} style - The style to apply
     */
    function applyCharStyle(target, regex, style) {
        try {
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = regex.source;
            var founds = target.findGrep();
            
            // Process in reverse order to avoid index issues when modifying text
            for (var i = founds.length - 1; i >= 0; i--) {
                var t = founds[i];
                try {
                    var txt = (t.paragraphs && t.paragraphs.length > 0) ? t.paragraphs[0].contents : t.contents;
                    // Skip footnote definitions
                    if (txt && REGEX.footnoteDefinition.test(txt)) continue;
                } catch(e) {
                    $.writeln("Non-critical error checking paragraph: " + e.message);
                }
                
                // Extract the content between markup
                var match = t.contents.match(regex);
                if (match && match[1]) {
                    // Replace the entire matched text with just the content
                    t.contents = match[1];
                    // Appliquer le style seulement s'il n'est pas null
                    if (style) {
                        t.appliedCharacterStyle = style;
                    }
                }
            }
        } catch (e) {
            $.writeln("Error in applyCharStyle: " + e.message + " for regex: " + regex.source);
        }
    }
    
    /**
     * Process footnotes in the document - Enhanced for multi-paragraph support
     * @param {Story} target - The story to modify
     * @param {Object} styleMapping - Style mapping configuration
     */
    function processFootnotes(target, styleMapping) {
        try {
            // Collect definitions [^id]: text (now with multi-paragraph support)
            var notes = {};
            var paras = target.paragraphs;
            
            // Log at start
            try {
                logToFile("Processing footnotes - examining " + paras.length + " paragraphs", false);
            } catch(e) {}
            
            for (var i = paras.length-1; i >= 0; i--) {
                try {
                    var line = paras[i].contents.replace(/\r$/, "");
                    var m = line.match(REGEX.footnoteDefinition);
                    if (m) {
                        var footnoteId = m[1];
                        var footnoteContent = m[2];
                        
                        logToFile("Found footnote definition: [" + footnoteId + "]", false);
                        
                        // Look ahead for consecutive lines that are part of this footnote
                        var paragraphsToRemove = [i]; // Track which paragraphs to remove
                        var j = i + 1;
                        
                        while (j < paras.length) {
                            try {
                                var nextLine = paras[j].contents.replace(/\r$/, "");
                                
                                // Stop only if we hit another footnote definition
                                if (nextLine.match(REGEX.footnoteDefinition)) {
                                    break;
                                }
                                
                                // Add to current footnote content
                                footnoteContent += "\r" + nextLine;
                                paragraphsToRemove.push(j); // Add to removal list
                                j++;
                                
                            } catch(nextParaError) {
                                logToFile("Error checking next paragraph: " + nextParaError.message, true);
                                break;
                            }
                        }
                        
                        // Trim trailing empty lines
                        footnoteContent = footnoteContent.replace(/(\r\s*)+$/, "");
                        
                        notes[footnoteId] = footnoteContent;
                        
                        // Remove all paragraphs belonging to this footnote (in reverse order)
                        for (var k = paragraphsToRemove.length - 1; k >= 0; k--) {
                            try {
                                paras[paragraphsToRemove[k]].remove();
                            } catch(removeError) {
                                logToFile("Error removing paragraph: " + removeError.message, true);
                            }
                        }
                    }
                } catch(paraError) {
                    logToFile("Error processing paragraph " + i + ": " + paraError.message, true);
                    continue;
                }
            }
    
            // ========= TOUT LE RESTE RESTE IDENTIQUE À L'ORIGINAL =========
            
            // Count collected definitions
            var definitionCount = 0;
            for (var noteId in notes) {
                if (notes.hasOwnProperty(noteId)) definitionCount++;
            }
            
            try {
                logToFile("Collected " + definitionCount + " footnote definitions", false);
            } catch(e) {}
    
            // Search for footnote references
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = REGEX.footnoteRef.source;
            var calls = target.findGrep();
    
            // Count total and update progress info for detailed feedback
            var totalFootnotes = calls.length;
            var notesCreated = 0;
            
            try {
                logToFile("Found " + totalFootnotes + " footnote references", false);
            } catch(e) {}
            
            // Reverse traversal to avoid index shifting
            for (var i = calls.length-1; i >= 0; i--) {
                // Update progress info for footnotes (within the same step)
                if (totalFootnotes > 10) {
                    updateProgressBar(4, "Processing footnotes... (" + (calls.length - i) + "/" + totalFootnotes + ")");
                }
                
                var t = calls[i];
                
                try {
                    var idMatch = t.contents.match(REGEX.footnoteRef);
                    if (!idMatch) continue;
                    var id = idMatch[1];
                    if (!notes.hasOwnProperty(id)) {
                        logToFile("No definition found for footnote: " + id, true);
                        continue;
                    }
    
                    var story = t.parentStory;
                    var idxPos = t.insertionPoints[0].index;
                    t.remove();
    
                    // Find appropriate insertion point for footnote
                    var anchor = idxPos - 1;
                    while (anchor >= 0) {
                        try {
                            var ch = story.characters[anchor].contents;
                            if (String(ch).match(/[A-Za-zÀ-ÿ0-9]/)) break;
                        } catch(charError) {
                            // If character cannot be read, stop here
                            break;
                        }
                        anchor--;
                    }
                    anchor++;
                    
                    // Handle diacritics
                    while (anchor < story.characters.length) {
                        try {
                            var code = String(story.characters[anchor].contents).charCodeAt(0);
                            if (code >= 0x0300 && code <= 0x036F) anchor++;
                            else break;
                        } catch(diacriticError) {
                            // If error, exit loop
                            break;
                        }
                    }
    
                    // Insert footnote with safety checks
                    try {
                        var fn = story.insertionPoints[anchor].footnotes.add();
                        fn.insertionPoints[-1].contents = notes[id];
                        
                        // Apply style if available
                        if (styleMapping.note && fn.paragraphs.length > 0) {
                            try {
                                fn.paragraphs[0].appliedParagraphStyle = styleMapping.note;
                            } catch(styleError) {
                                logToFile("Error applying footnote style: " + styleError.message, true);
                            }
                        }
                        
                        notesCreated++;
                        
                    } catch(insertError) {
                        logToFile("Error inserting footnote " + id + ": " + insertError.message, true);
                    }
                    
                } catch(footnoteError) {
                    logToFile("Error processing footnote reference: " + footnoteError.message, true);
                    continue;
                }
            }
            
            try {
                logToFile("Footnotes created: " + notesCreated + "/" + totalFootnotes, false);
            } catch(e) {}
            
        } catch (e) {
            try {
                logToFile("Critical error in processFootnotes: " + e.message, true);
            } catch(logError) {
                // If logging fails, nothing else can be done
            }
            throw new Error("Failed to process footnotes: " + e.message);
        } finally {
            // Always reset preferences
            try {
                app.findGrepPreferences = app.changeGrepPreferences = null;
            } catch(e) {}
        }
    }
    
    /**
     * Process styles within footnotes
     * @param {Object} styleMapping - Style mapping configuration
     */
    function processFootnoteStyles(styleMapping) {
        try {
            // Get all stories in the document
            var allStories = app.activeDocument.stories.everyItem().getElements();
            
            // Count all footnotes for progress tracking
            var totalFootnotes = 0;
            var processedFootnotes = 0;
            
            for (var i = 0; i < allStories.length; i++) {
                try {
                    var storyFootnotes = allStories[i].footnotes.everyItem().getElements();
                    totalFootnotes += storyFootnotes.length;
                } catch(e) {
                    // Skip if no footnotes
                    $.writeln("Non-critical error counting footnotes: " + e.message);
                }
            }
            
            // Process footnotes with progress tracking
            for (var i = 0; i < allStories.length; i++) {
                var story = allStories[i];
                // Get all footnotes in the story
                try {
                    var footnotes = story.footnotes.everyItem().getElements();
                    
                    for (var j = 0; j < footnotes.length; j++) {
                        processedFootnotes++;
                        
                        // Update progress for many footnotes
                        if (totalFootnotes > 5) {
                            updateProgressBar(6, "Processing footnote styles... (" + processedFootnotes + "/" + totalFootnotes + ")");
                        }
                        
                        var footnoteText = footnotes[j].texts[0];
                        
                        applyCharStyleToFootnoteText(footnoteText, REGEX.boldItalic, styleMapping.bolditalic);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.boldItalicUnderscore, styleMapping.bolditalic);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.boldItalicMixed1, styleMapping.bolditalic);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.boldItalicMixed2, styleMapping.bolditalic);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.boldItalicMixed3, styleMapping.bolditalic);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.boldItalicMixed4, styleMapping.bolditalic);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.bold, styleMapping.bold);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.boldUnderscore, styleMapping.bold);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.italic, styleMapping.italic);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.italicUnderscore, styleMapping.italic);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.underline, styleMapping.underline);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.smallCapsAttr, styleMapping.smallcaps);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.superscript, styleMapping.superscript);
                        applyCharStyleToFootnoteText(footnoteText, REGEX.subscript, styleMapping.subscript);
                    }
                } catch(e) {
                    // Skip stories with no footnotes
                    $.writeln("Non-critical error processing footnote styles: " + e.message);
                }
            }
        } catch (e) {
            $.writeln("Error in processFootnoteStyles: " + e.message);
        }
    }
    
    /**
     * Apply character style to text in a footnote
     * @param {Text} text - The footnote text
     * @param {RegExp} regex - The pattern to match
     * @param {CharacterStyle} style - The style to apply
     */
    function applyCharStyleToFootnoteText(text, regex, style) {
        try {
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = regex.source;
            
            var matches = text.findGrep();
            
            // Process in reverse order to avoid index issues
            for (var i = matches.length - 1; i >= 0; i--) {
                var match = matches[i];
                // Extract the content between markup using regex
                var regexMatch = match.contents.match(regex);
                if (regexMatch && regexMatch[1]) {
                    // Replace the entire matched text with just the content
                    match.contents = regexMatch[1];
                    // Apply the style
                    match.appliedCharacterStyle = style;
                }
            }
        } catch(e) {
            // Skip if there's an error finding text
            $.writeln("Non-critical error in applyCharStyleToFootnoteText: " + e.message);
        }
    }
    
    /**
     * Clean up text and restore escaped characters
     * @param {Story} target - The story to modify
     */
    function cleanupText(target) {
        try {
            var oldOpt = app.findChangeGrepOptions.includeFootnotes;
            app.findChangeGrepOptions.includeFootnotes = false; // Don't include footnotes here
    
            // Replace multiple line breaks with single one
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = REGEX.lineBreaks.source;
            app.changeGrepPreferences.changeTo = "\\r";
            target.changeGrep();
    
            // Convert double hyphens to em dash
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = "\\x{2013}-";
            app.changeGrepPreferences.changeTo = "\\x{2014}";
            target.changeGrep();
    
            app.findChangeGrepOptions.includeFootnotes = oldOpt;
            
            // CRITICAL: Restore escaped characters using find/replace (preserves formatting)
            restoreEscapedCharacters(target);
            
        } catch (e) {
            $.writeln("Error in cleanupText: " + e.message);
            throw new Error("Failed to clean up text: " + e.message);
        }
    }
    
    /**
     * Supprime les pages après la fin du texte principal
     * @param {Document} doc - Le document InDesign
     * @return {Number} Le nombre de pages supprimées
     */
    function removeBlankPagesAfterTextEnd(doc) {
        try {
            var hasFacingPages = doc.documentPreferences.facingPages;
            var startFrame = null;
            var maxLength = 0;
            
            // Recherche du bloc de texte le plus long
            for (var p = 0; p < doc.pages.length; p++) {
                for (var i = 0; i < doc.pages[p].textFrames.length; i++) {
                    var frame = doc.pages[p].textFrames[i];
                    if (frame.contents && frame.parentStory.length > maxLength) {
                        maxLength = frame.parentStory.length;
                        startFrame = frame;
                    }
                }
            }
            
            if (!startFrame) {
                return 0; // Aucun bloc de texte trouvé
            }
            
            var story = startFrame.parentStory;
            var lastCharIndex = story.characters.length - 1;
            
            // Recherche du dernier caractère non-blanc
            while (lastCharIndex >= 0) {
                var charContent = story.characters[lastCharIndex].contents;
                if (charContent !== " " && charContent !== "\r" && charContent !== "\n" && charContent !== "\t") {
                    break;
                }
                lastCharIndex--;
            }
            
            if (lastCharIndex < 0) {
                return 0; // Pas de caractère significatif
            }
            
            var lastChar = story.characters[lastCharIndex];
            var endFrames = lastChar.parentTextFrames;
            
            if (endFrames.length === 0) {
                return 0; // Impossible de trouver le cadre
            }
            
            var endFrame = endFrames[0];
            var endPage = null;
            var endPageIndex = -1;
            
            // Recherche de la page contenant la fin du texte
            try {
                endPage = endFrame.parentPage;
                
                if (endPage) {
                    for (var j = 0; j < doc.pages.length; j++) {
                        if (doc.pages[j] === endPage) {
                            endPageIndex = j;
                            break;
                        }
                    }
                }
            } catch (e) {
                for (var j = 0; j < doc.pages.length && !endPage; j++) {
                    var page = doc.pages[j];
                    for (var k = 0; k < page.textFrames.length; k++) {
                        if (page.textFrames[k] === endFrame) {
                            endPage = page;
                            endPageIndex = j;
                            break;
                        }
                    }
                }
            }
            
            if (!endPage || endPageIndex === -1) {
                return 0; // Page non trouvée
            }
            
            var firstPageToDeleteIndex = endPageIndex + 1;
            
            if (firstPageToDeleteIndex >= doc.pages.length) {
                return 0; // Pas de pages à supprimer
            }
            
            var pagesToRemove = doc.pages.length - firstPageToDeleteIndex;
            
            // Suppression des pages
            for (var i = doc.pages.length - 1; i >= firstPageToDeleteIndex; i--) {
                doc.pages[i].remove();
            }
            
            // Gestion des documents à pages en vis-à-vis
            if (hasFacingPages && doc.pages.length > 0) {
                var lastPage = doc.pages[doc.pages.length - 1];
                if (lastPage.side === PageSideOptions.RIGHT_HAND) {
                    doc.pages.add(LocationOptions.AFTER, lastPage);
                    return pagesToRemove - 1; // Une page a été ajoutée
                }
            }
            
            return pagesToRemove;
        } catch (e) {
            $.writeln("Error in removeBlankPagesAfterTextEnd: " + e.message);
            return 0; // En cas d'erreur
        }
    }
    
    /**
     * Collect all styles from the document
     * @param {Document} doc - The InDesign document
     * @return {Object} Object containing paragraph and character styles
     */
    function collectStyles(doc) {
        try {
            function collectParagraphStyles(group) {
                var styles = [];
                var pStyles = group.paragraphStyles;
                for (var i = 0; i < pStyles.length; i++) {
                    if (!pStyles[i].name.match(/^\[/)) styles.push(pStyles[i]);
                }
                var pGroups = group.paragraphStyleGroups;
                for (var j = 0; j < pGroups.length; j++) {
                    styles = styles.concat(collectParagraphStyles(pGroups[j]));
                }
                return styles;
            }
    
            function collectCharacterStyles(group) {
                var styles = [];
                var cStyles = group.characterStyles;
                for (var i = 0; i < cStyles.length; i++) {
                    if (!cStyles[i].name.match(/^\[/)) styles.push(cStyles[i]);
                }
                var cGroups = group.characterStyleGroups;
                for (var j = 0; j < cGroups.length; j++) {
                    styles = styles.concat(collectCharacterStyles(cGroups[j]));
                }
                return styles;
            }
    
            return {
                paragraph: collectParagraphStyles(doc),
                character: collectCharacterStyles(doc)
            };
        } catch (e) {
            $.writeln("Error in collectStyles: " + e.message);
            throw new Error("Failed to collect document styles: " + e.message);
        }
    }
    
    /**
     * Shows UI and gets style mapping from user
     * @param {Object} styles - Object containing paragraph and character styles
     * @param {Object} preloadedConfig - Optional preloaded configuration
     * @return {Object|null} The selected style mapping or null if canceled
     */
    function showUI(styles, preloadedConfig) {
    try {
        var noneText = I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]";
        var paraStyleNames = [noneText], charStyleNames = [noneText];
        
        for (var i = 0; i < styles.paragraph.length; i++) {
            paraStyleNames.push(styles.paragraph[i].name);
        }
        for (var i = 0; i < styles.character.length; i++) {
            charStyleNames.push(styles.character[i].name);
        }
        
        // Utiliser la configuration préchargée ou deviner les styles
        var guessed = preloadedConfig || guessDefaultStyles(styles);
    
        var w = new Window("dialog", I18n.__("title", VERSION));
        w.orientation = "column";
        w.alignChildren = "fill";
        
       // Groupe simple pour l'attribution et le sélecteur de langue
       var langGroup = w.add('group');
       langGroup.orientation = "row";
       langGroup.alignment = "right";
       
       // Ajouter le texte d'attribution directement dans le groupe de langue
       langGroup.add("statictext", undefined, "entremonde / Spectral lab");
       // Ajouter un petit espace entre le texte et le dropdown
       langGroup.add("statictext", undefined, "  ");
       // Ajouter le dropdown
       var langDropdown = langGroup.add('dropdownlist', undefined, ['En', 'Fr']);
        
        // Sélectionner la langue actuelle
        langDropdown.selection = I18n.getLanguage() === 'fr' ? 1 : 0;
        
        langDropdown.onChange = function() {
            // Changer la langue
            I18n.setLanguage(langDropdown.selection.index === 1 ? 'fr' : 'en');
            
            // Fermer et rouvrir la fenêtre pour appliquer les changements immédiatement
            var currentLanguage = I18n.getLanguage();
            w.close();
            var newWindow = showUI(styles, preloadedConfig);
            newWindow.show();
        };
        
        // Panneau de configuration
        var configPanel = w.add("panel", undefined, I18n.__("configuration"));
        configPanel.orientation = "row";
        configPanel.alignChildren = "top";
        configPanel.margins = [10, 15, 10, 10];
        
        var configButtons = configPanel.add("group");
        configButtons.orientation = "row";
        configButtons.alignment = "center";
        configButtons.alignChildren = "fill";
        
        var loadConfigBtn = configButtons.add("button", undefined, I18n.__("load"));
        var saveConfigBtn = configButtons.add("button", undefined, I18n.__("save"));
        
        // Texte indiquant si une configuration a été chargée automatiquement
        if (preloadedConfig) {
            var autoLoadText = configButtons.add("statictext", undefined, I18n.__("configDetected"));
        }
    
        // Création des onglets
        var tpanel = w.add("tabbedpanel");
        tpanel.alignChildren = "fill";
        
        // Onglet des styles de paragraphe
        var tab1 = tpanel.add("tab", undefined, I18n.__("paragraphStyles"));
        tab1.orientation = "column";
        tab1.alignChildren = "left";
        
        // Onglet des styles de caractère
        var tab2 = tpanel.add("tab", undefined, I18n.__("characterStyles"));
        tab2.orientation = "column";
        tab2.alignChildren = "left";
        
        // Onglet des notes de bas de page
        var tab3 = tpanel.add("tab", undefined, I18n.__("footnotes"));
        tab3.orientation = "column";
        tab3.alignChildren = "left";
        
        // Sélection de l'onglet par défaut
        tpanel.selection = tab1;
    
        function addStyleSelector(parent, label, items) {
            var g = parent.add("group");
            g.orientation = "row";
            g.alignChildren = "left";
            var st = g.add("statictext", undefined, label);
            st.preferredSize.width = 120; // Largeur fixe pour l'alignement
            var dropdown = g.add("dropdownlist", undefined, items);
            dropdown.selection = 0;
            dropdown.preferredSize.width = 200;
            return dropdown;
        }
    
        // Ajout des sélecteurs de style dans l'onglet des paragraphes
        var sH1 = addStyleSelector(tab1, I18n.__("heading1"), paraStyleNames);
        var sH2 = addStyleSelector(tab1, I18n.__("heading2"), paraStyleNames);
        var sH3 = addStyleSelector(tab1, I18n.__("heading3"), paraStyleNames);
        var sH4 = addStyleSelector(tab1, I18n.__("heading4"), paraStyleNames);
        var sH5 = addStyleSelector(tab1, I18n.__("heading5"), paraStyleNames);
        var sH6 = addStyleSelector(tab1, I18n.__("heading6"), paraStyleNames);
        var sQuote = addStyleSelector(tab1, I18n.__("blockquote"), paraStyleNames);
        var sBulletList = addStyleSelector(tab1, I18n.__("bulletlist"), paraStyleNames);
        var sNormal = addStyleSelector(tab1, I18n.__("bodytext"), paraStyleNames);
    
        // Ajout des sélecteurs de style dans l'onglet des caractères
        var sItalic = addStyleSelector(tab2, I18n.__("italic"), charStyleNames);
        var sBold = addStyleSelector(tab2, I18n.__("bold"), charStyleNames);
        var sBoldItalic = addStyleSelector(tab2, I18n.__("bolditalic"), charStyleNames);
        var sUnderline = addStyleSelector(tab2, I18n.__("underline"), charStyleNames);
        var sSmallCaps = addStyleSelector(tab2, I18n.__("smallcaps"), charStyleNames);
        var sSubscript = addStyleSelector(tab2, I18n.__("subscript"), charStyleNames);
        var sSuperscript = addStyleSelector(tab2, I18n.__("superscript"), charStyleNames);
    
        // Ajout du sélecteur de style dans l'onglet des notes de bas de page
        var sFootnotePara = addStyleSelector(tab3, I18n.__("footnoteStyle"), paraStyleNames);
        
        // Fonction d'aide pour définir la sélection du menu déroulant par valeur de texte
        function setDropdownByText(dropdown, text) {
            // Si le texte est null, sélectionner l'option [aucun]/[None]
            if (text === null) {
                var noneText = I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]";
                for (var i = 0; i < dropdown.items.length; i++) {
                    if (dropdown.items[i].text === noneText) {
                        dropdown.selection = dropdown.items[i];
                        return true;
                    }
                }
                dropdown.selection = dropdown.items[0]; // Option de secours
                return true;
            }
            
            // Recherche normale par texte
            for (var i = 0; i < dropdown.items.length; i++) {
                if (dropdown.items[i].text === text) {
                    dropdown.selection = dropdown.items[i];
                    return true;
                }
            }
            return false;
        }
        
        // Présélection automatique - ne pas modifier ces lignes, elles sont bien
        setDropdownByText(sH1, guessed.h1 ? guessed.h1.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sH2, guessed.h2 ? guessed.h2.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sH3, guessed.h3 ? guessed.h3.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sH4, guessed.h4 ? guessed.h4.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sH5, guessed.h5 ? guessed.h5.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sH6, guessed.h6 ? guessed.h6.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sQuote, guessed.quote ? guessed.quote.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sBulletList, guessed.bulletlist ? guessed.bulletlist.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sNormal, guessed.normal ? guessed.normal.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sItalic, guessed.italic ? guessed.italic.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sBold, guessed.bold ? guessed.bold.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sBoldItalic, guessed.bolditalic ? guessed.bolditalic.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sUnderline, guessed.underline ? guessed.underline.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sSmallCaps, guessed.smallcaps ? guessed.smallcaps.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sSubscript, guessed.subscript ? guessed.subscript.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sSuperscript, guessed.superscript ? guessed.superscript.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        setDropdownByText(sFootnotePara, guessed.note ? guessed.note.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
        
        // Ajout d'une option pour supprimer les pages après la fin du texte
        var removeBlankPagesGroup = w.add("group");
        removeBlankPagesGroup.orientation = "row";
        removeBlankPagesGroup.alignment = "left";
        removeBlankPagesGroup.alignChildren = "center";
        var removeBlankPagesCheck = removeBlankPagesGroup.add("checkbox", undefined, I18n.__("removeBlankPages"));
        if (preloadedConfig && preloadedConfig.removeBlankPages === true) {
            removeBlankPagesCheck.value = true;
        }
        
        var btns = w.add("group");
        btns.orientation = "row";
        btns.alignment = "right";
        var cancelBtn = btns.add("button", undefined, I18n.__("cancel"), {name: "cancel"});
        var okBtn = btns.add("button", undefined, I18n.__("apply"), {name: "ok"});
            
            function getStyleByName(list, name) {
                // Si l'option est la valeur "aucun" dans la langue courante
                var noneText = I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]";
                if (name === noneText) return null;
                
                for (var i = 0; i < list.length; i++) {
                    if (list[i].name === name) return list[i];
                }
                return null;
            }
            
            // Configuration du bouton de chargement
            loadConfigBtn.onClick = function() {
                var config = loadConfiguration(styles);
                if (config) {
                    // Mise à jour de tous les menus déroulants avec les valeurs chargées
                    setDropdownByText(sH1, config.h1.name);
                    setDropdownByText(sH2, config.h2.name);
                    setDropdownByText(sH3, config.h3.name);
                    setDropdownByText(sH4, config.h4.name);
                    setDropdownByText(sH5, config.h5.name);
                    setDropdownByText(sH6, config.h6.name);
                    setDropdownByText(sQuote, config.quote.name);
                    setDropdownByText(sBulletList, config.bulletlist.name);
                    setDropdownByText(sNormal, config.normal.name);
                    setDropdownByText(sItalic, config.italic.name);
                    setDropdownByText(sBold, config.bold.name);
                    setDropdownByText(sBoldItalic, config.bolditalic.name);  // Ajout de cette ligne
                    setDropdownByText(sUnderline, config.underline.name);
                    setDropdownByText(sSmallCaps, config.smallcaps.name);
                    setDropdownByText(sSuperscript, config.superscript.name);
                    setDropdownByText(sSubscript, config.subscript.name);
                    setDropdownByText(sFootnotePara, config.note.name);
                    
                    alert(I18n.__("configLoaded"));
                }
            };
            
            // Configuration du bouton de sauvegarde
            saveConfigBtn.onClick = function() {
                // Création d'un objet de configuration à partir des sélections actuelles
                var currentConfig = {
                    h1: getStyleByName(styles.paragraph, sH1.selection.text),
                    h2: getStyleByName(styles.paragraph, sH2.selection.text),
                    h3: getStyleByName(styles.paragraph, sH3.selection.text),
                    h4: getStyleByName(styles.paragraph, sH4.selection.text),
                    h5: getStyleByName(styles.paragraph, sH5.selection.text),
                    h6: getStyleByName(styles.paragraph, sH6.selection.text),
                    quote: getStyleByName(styles.paragraph, sQuote.selection.text),
                    bulletlist: getStyleByName(styles.paragraph, sBulletList.selection.text),
                    normal: getStyleByName(styles.paragraph, sNormal.selection.text),
                    italic: getStyleByName(styles.character, sItalic.selection.text),
                    bold: getStyleByName(styles.character, sBold.selection.text),
                    bolditalic: getStyleByName(styles.character, sBoldItalic.selection.text), // Ajout de cette ligne
                    underline: getStyleByName(styles.character, sUnderline.selection.text),
                    smallcaps: getStyleByName(styles.character, sSmallCaps.selection.text),
                    superscript: getStyleByName(styles.character, sSuperscript.selection.text),
                    subscript: getStyleByName(styles.character, sSubscript.selection.text),
                    note: getStyleByName(styles.paragraph, sFootnotePara.selection.text),
                    removeBlankPages: removeBlankPagesCheck.value 
                };
                
                if (saveConfiguration(currentConfig)) {
                    alert(I18n.__("configSaved"));
                }
            };
            
            cancelBtn.onClick = function() {
                w.close();
                return null;
            };
            
            if (w.show() !== 1) return null;
             
            return {
                h1: getStyleByName(styles.paragraph, sH1.selection.text),
                h2: getStyleByName(styles.paragraph, sH2.selection.text),
                h3: getStyleByName(styles.paragraph, sH3.selection.text),
                h4: getStyleByName(styles.paragraph, sH4.selection.text),
                h5: getStyleByName(styles.paragraph, sH5.selection.text),
                h6: getStyleByName(styles.paragraph, sH6.selection.text),
                quote: getStyleByName(styles.paragraph, sQuote.selection.text),
                bulletlist: getStyleByName(styles.paragraph, sBulletList.selection.text),
                normal: getStyleByName(styles.paragraph, sNormal.selection.text),
                italic: getStyleByName(styles.character, sItalic.selection.text),
                bold: getStyleByName(styles.character, sBold.selection.text),
                bolditalic: getStyleByName(styles.character, sBoldItalic.selection.text),
                underline: getStyleByName(styles.character, sUnderline.selection.text),
                smallcaps: getStyleByName(styles.character, sSmallCaps.selection.text),
                superscript: getStyleByName(styles.character, sSuperscript.selection.text),
                subscript: getStyleByName(styles.character, sSubscript.selection.text),
                note: getStyleByName(styles.paragraph, sFootnotePara.selection.text),
                removeBlankPages: removeBlankPagesCheck.value
            };
            
        } catch (e) {
            alert(I18n.__("genericError", e.message, e.line));
            return null;
        }
    }
    
    /**
     * Write to log file in silent mode
     * @param {String} message - Message to log
     * @param {Boolean} isError - Whether this is an error message
     */
    function logToFile(message, isError) {
    if (!enableLogging) return;
    
    try {
        var logFile = new File(File($.fileName).parent.fsName + "/markdown-import.log");
            logFile.open("a"); // Append mode
            var timestamp = new Date().toLocaleString();
            var prefix = isError ? "ERROR" : "INFO";
            logFile.writeln(timestamp + " - " + prefix + ": " + message);
            logFile.close();
        } catch (e) {
            // Silent fail - can't log the logging error
        }
    }
    
    /**
     * Main function to organize script flow
     * @param {Array} args - Arguments passed to the script
     */
    function main(args) {
    // Vérifier si un document est ouvert
    if (app.documents.length === 0) {
        alert(I18n.__("noDocument"));
        return;
    }
    
    var doc = app.activeDocument;
    
    try {
        // Vérifier le mode silencieux
        var silentMode = false;
        
        // Méthode 1: Vérifier les arguments directs
        if (args && args.length > 0) {
            for (var i = 0; i < args.length; i++) {
                if (args[i] === "silent") {
                    silentMode = true;
                    break;
                }
            }
        }
        
        // Méthode 2: Vérifier scriptArgs
        if (!silentMode && app.scriptArgs.isDefined("caller")) {
            if (app.scriptArgs.getValue("caller") === "BookCreator") {
                silentMode = true;
            }
        }
        
        // Recueillir les styles du document
        var styles = collectStyles(doc);
        
        // Vérifier si les collections de styles sont vides
        if (styles.paragraph.length === 0 || styles.character.length === 0) {
            var errorMsg = I18n.__("noStyles");
            if (silentMode) {
                logToFile(errorMsg, true);
            } else {
                alert(errorMsg);
            }
            return;
        }
            
            // Charger la configuration automatiquement
            var autoConfig = autoLoadConfig(styles);
            
            // NOUVELLE FONCTIONNALITÉ: Vérifier si la configuration se trouve dans un dossier nommé "config"
            var configInConfigFolder = false;
            
            if (autoConfig) {
                try {
                    // Vérifier si le document est enregistré
                    if (app.activeDocument.saved) {
                        // Obtenir le chemin du document actif
                        var docPath = app.activeDocument.filePath;
                        if (docPath) {
                            // Parcourir les dossiers parents pour trouver un dossier "config"
                            var folder = new Folder(docPath);
                            var foundConfigFiles = findConfigFilesRecursively(folder, 3, 0);
                            
                            if (foundConfigFiles && foundConfigFiles.length > 0) {
                                // Vérifier si le fichier de configuration se trouve dans un dossier nommé "config"
                                for (var i = 0; i < foundConfigFiles.length; i++) {
                                    var configFile = foundConfigFiles[i];
                                    var parentFolder = configFile.parent;
                                    
                                    if (parentFolder.name.toLowerCase() === "config") {
                                        configInConfigFolder = true;
                                        silentMode = true; // Activer le mode silencieux
                                        break;
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    $.writeln("Erreur lors de la vérification du dossier config: " + e.message);
                    // Continuer avec le comportement par défaut
                }
            }
            
            // Mode silencieux avec configuration
            if (silentMode && autoConfig) {
                try {
                    // Utiliser la configuration trouvée directement
                    var styleMapping = autoConfig;
                    var logMessage = configInConfigFolder ? 
                        "Exécution automatique du script: configuration trouvée dans le dossier config" : 
                        "Using auto-loaded configuration";
                    logToFile(logMessage, false);
                    
                    // Encapsuler le traitement dans une transaction unique
                    app.doScript(function() {
                        var target = getTargetStory();
                        
                        resetStyles(target, styleMapping);
                        applyParagraphStyles(target, styleMapping);
                        applyCharacterStyles(target, styleMapping);
                        processFootnotes(target, styleMapping);
                        cleanupText(target);
                        processFootnoteStyles(styleMapping);
                        restoreEscapedCharactersInFootnotes();
                        
                        // Ajouter la suppression des pages blanches si configurée
                        if (styleMapping && styleMapping.removeBlankPages) {
                            try {
                                var pagesRemoved = removeBlankPagesAfterTextEnd(doc);
                                if (pagesRemoved > 0) {
                                    logToFile(pagesRemoved + " blank pages removed", false);
                                }
                            } catch (e) {
                                logToFile("Error while removing blank pages: " + e.message, true);
                            }
                        }
                        
                    }, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Markdown Import");
                    
                    // Enregistrer explicitement le document
                    doc.save();
                    logToFile("Document processed and saved successfully", false);
                    
                    return;
                } catch (e) {
                    // En mode silencieux, enregistrer les erreurs dans un fichier
                    logToFile("Error: " + e.message + " (Line: " + e.line + ")", true);
                    return;
                }
            }
            
            // Interactive mode
            var styleMapping = showUI(styles, autoConfig);
            
            // Check if user canceled the dialog
            if (styleMapping) {
                // Create progress bar
                createProgressBar(11);
                
                try {
                    // Wrap the core operations in a transaction
                    app.doScript(function() {
                        // Get target story from selected frame, labeled frame, or first story
                        updateProgressBar(1, I18n.__("gettingTargetStory"));
                        var target = getTargetStory();
                        
                        // Reset to normal style before processing
                        updateProgressBar(2, I18n.__("resettingStyles"));
                        resetStyles(target, styleMapping);
                        
                        // Apply paragraph styles (headings, quotes, lists)
                        updateProgressBar(3, I18n.__("applyingParagraphStyles"));
                        applyParagraphStyles(target, styleMapping);
                        
                        // Apply character styles (bold, italic, etc.)
                        updateProgressBar(4, I18n.__("applyingCharacterStyles"));
                        applyCharacterStyles(target, styleMapping);
                        
                        // Process footnotes - collect definitions and create InDesign footnotes
                        updateProgressBar(5, I18n.__("processingFootnotes"));
                        processFootnotes(target, styleMapping);
                        
                        // Clean up text - remove multiple line breaks, escape chars, fix dashes
                        updateProgressBar(7, I18n.__("cleaningUpText"));
                        cleanupText(target);
                        
                        // Apply styles within footnotes
                        updateProgressBar(8, I18n.__("processingFootnoteStyles"));
                        processFootnoteStyles(styleMapping);
                        
                        // Restore escaped characters in footnotes
                        updateProgressBar(9, "Restoring escaped characters in footnotes...");
                        restoreEscapedCharactersInFootnotes();
                        
                        // À l'intérieur de la fonction main, après le traitement des styles
                        if (styleMapping && styleMapping.removeBlankPages) {
                            try {
                                // Mettre à jour la barre de progression
                                updateProgressBar(10, I18n.__("removingBlankPages"));
                                
                                // Supprimer les pages blanches
                                var pagesRemoved = removeBlankPagesAfterTextEnd(doc);
                                
                                // Ajouter l'information au message de fin si des pages ont été supprimées
                                if (pagesRemoved > 0) {
                                    var pagesRemovedText = I18n.__("pagesRemoved", pagesRemoved);
                                    updateProgressBar(11, I18n.__("done") + " " + pagesRemovedText);
                                } else {
                                    updateProgressBar(11, I18n.__("done"));
                                }
                            } catch (e) {
                                $.writeln("Error while removing blank pages: " + e.message);
                                // Continuer même en cas d'erreur
                                updateProgressBar(11, I18n.__("done"));
                            }
                            
                        // Complete!
                        } else {
                            updateProgressBar(11, I18n.__("done"));
                        }
                    }, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Markdown Import");
                } finally {
                    // Always ensure progress bar is closed, even if an error occurs
                    closeProgressBar();
                }
            }
            
        } catch (e) {
            // S'assurer de fermer la barre de progression en cas d'erreur
            closeProgressBar();
            if (silentMode) {
                logToFile("Critical error: " + e.message + " (Line: " + e.line + ")", true);
            } else {
                alert(I18n.__("genericError", e.message, e.line));
            }
        }
    }
    
    // Public API
    return {
        run: function(args) {
            main(args || []);
        }
    };
})();

// Run the script
MarkdownImport.run();
