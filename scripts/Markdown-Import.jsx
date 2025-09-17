/**
 * Markdown Import
 * 
 * Automatically imports and transforms Markdown-formatted text into an InDesign document,
 * replacing Markdown tags with corresponding paragraph and character styles,
 * and converting Markdown footnotes into real InDesign footnotes.
 * 
 * @version 1.0 beta 11
 * @license MIT
 * @author entremonde / Spectral lab
 * @website http://lab.spectral.art
 */

// Create a namespace to avoid polluting global scope
var MarkdownImport = (function() {
    "use strict";
    var VERSION = "1.0b11";
    
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
                'strikethrough': 'Strikethrough',
                
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
                'processingPandocAttributes': 'Processing Pandoc attributes...',
                'processingImages': 'Processing images...',
                'imageConfiguration': 'Images',
                'aspectRatio': 'Aspect Ratio',
                'freeRatio': 'Free (auto)',
                'imageStyle': 'Image Style',
                'imageObjectStyle': 'Object style:',
                'captionSettings': 'Caption Settings', 
                'captionObjectStyle': 'Frame style:',
                'captionParagraphStyle': 'Text style:',
                'captionGap': 'Gap (pt):',
                'captionMaxHeight': 'Max height (pt):',
                'selectImageFolder': 'Select image folder',
                'imageNotFound': 'Image not found: %s',
                'errorProcessingImage': 'Error processing image: %s',
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
                'pagesRemoved': '(%d pages removed)',
                'tables': 'Tables',
                'tableConfiguration': 'Table Configuration', 
                'processTablesEnabled': 'Process Markdown tables',
                'tableStyle': 'Table style:',
                'useTableAlignment': 'Use Markdown alignment (:--- | :---: | ---:)',
                'tablesProcessed': '%d table(s) processed'
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
                'strikethrough': 'Barr\u00E9',
                
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
                'processingPandocAttributes': 'Traitement des attributs Pandoc...',
                'processingImages': 'Traitement des images...',
                'imageConfiguration': 'Images',
                'aspectRatio': 'Format d\'image',
                'freeRatio': 'Libre (auto)',
                'imageStyle': 'Style d\'image',
                'imageObjectStyle': 'Style d\'objet :',
                'captionSettings': 'Style de l\u00E9gende',
                'captionObjectStyle': 'Style d\'objet :',
                'captionParagraphStyle': 'Style de texte :',
                'captionGap': '\u00C9cart avec l\'image (pt) :',
                'captionMaxHeight': 'Hauteur max du bloc (pt) :',
                'selectImageFolder': 'Choisir dossier images',
                'imageNotFound': 'Image introuvable : %s',
                'errorProcessingImage': 'Erreur traitement image : %s',
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
                'pagesRemoved': '(%d pages supprim\u00E9es)',
                'tables': 'Tableaux',
                'tableConfiguration': 'Configuration des tableaux',
                'processTablesEnabled': 'Traiter les tableaux Markdown',
                'tableStyle': 'Style de tableau :',
                'useTableAlignment': 'Utiliser l\'alignement Markdown (:--- | :---: | ---:)',
                'tablesProcessed': '%d tableau(x) trait\u00E9(s)'
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
        quote: /^>[ \t]?(.*)/,
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
        strikethrough: /~~([^~]+)~~/,
        footnoteRef: /\[\^([^\]]+)\]/,
        footnoteDefinition: /^\[\^([^\]]+)\]:\s*(.+)/,
        lineBreaks: /\r\r+/,
        backslash: /\\/,
        pandocInline: /\[([^\]]+)\]\{([^}]+)\}/,
        pandocFenceOpen: /^:::\s*\{([^}]*)\}\s*$/,
        pandocFenceClose: /^:::\s*$/
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
     * Split a table row into cells, handling escaped pipes and code spans
     * @param {String} line - Raw table row line
     * @return {Array} Array of cell contents
     * @private
     */
    function splitTableRow(line) {
        // Strip outer pipes: | a | b |
        line = String(line).replace(/^\s*\|/, "").replace(/\|\s*$/, "");
        var out = [], buf = "", i = 0, inCode = false, ch = "";
        
        while (i < line.length) {
            ch = line.charAt(i);
            
            // Handle escape sequences: only \|, \`, \\ are special
            if (ch === "\\") {
                var next = (i + 1 < line.length) ? line.charAt(i + 1) : "";
                if (next === "|" || next === "`" || next === "\\") {
                    buf += next;
                    i += 2;
                    continue;
                }
                // Literal backslash
                buf += "\\";
                i++;
                continue;
            }
            
            // Toggle code span state
            if (ch === "`") {
                inCode = !inCode;
                buf += ch;
                i++;
                continue;
            }
            
            // Split on pipe only if not in code span
            if (ch === "|" && !inCode) {
                out.push(buf.replace(/^\s+|\s+$/g, "")); // trim
                buf = "";
                i++;
                continue;
            }
            
            buf += ch;
            i++;
        }
        
        out.push(buf.replace(/^\s+|\s+$/g, "")); // trim last cell
        return out;
    }
    
    /**
     * Check if a line is a table alignment ruler
     * @param {String} line - Line to check
     * @return {Boolean} True if line is a ruler
     * @private
     */
    function isTableRuler(line) {
        var cells = splitTableRow(line);
        if (cells.length < 1) return false;
        
        for (var i = 0; i < cells.length; i++) {
            var cleaned = String(cells[i]).replace(/\s+/g, "").replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
            // Must be at least 2 dashes, optionally preceded/followed by colons
            if (!/^:?[-\u2013\u2014]{2,}:?$/.test(cleaned)) return false;
        }
        return true;
    }
    
    /**
     * Get alignment from a ruler cell
     * @param {String} cell - Ruler cell content
     * @return {String} Alignment: "left", "center", or "right"
     * @private
     */
    function getTableAlignment(cell) {
        var cleaned = String(cell).replace(/\s+/g, "").replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
        var hasLeftColon = cleaned.length > 0 && cleaned.charAt(0) === ":";
        var hasRightColon = cleaned.length > 0 && cleaned.charAt(cleaned.length - 1) === ":";
        
        if (hasLeftColon && hasRightColon) return "center";
        if (hasRightColon) return "right";
        return "left";
    }
    
    /**
     * Convert alignment string to InDesign Justification
     * @param {String} align - Alignment string
     * @return {Justification} InDesign justification constant
     * @private
     */
    function alignmentToJustification(align) {
        if (align === "center") return Justification.CENTER_ALIGN;
        if (align === "right") return Justification.RIGHT_ALIGN;
        return Justification.LEFT_ALIGN;
    }
    
    /**
     * Find all Markdown tables in text lines
     * @param {Array} lines - Array of text lines
     * @return {Object} Object with tables array and original lines
     * @private
     */
    function findMarkdownTables(lines) {
        var tables = [];
        var i = 0;
        
        while (i < lines.length - 1) {
            var currentLine = lines[i];
            var nextLine = lines[i + 1];
            
            // Check if current line has pipes and next line is a ruler
            if (/\|/.test(currentLine) && isTableRuler(nextLine)) {
                // Parse table starting at position i
                var header = splitTableRow(currentLine);
                var ruler = splitTableRow(nextLine);
                
                // Ensure ruler has same number of columns as header
                while (ruler.length < header.length) {
                    ruler.push("---");
                }
                
                // Extract alignments from ruler
                var alignments = [];
                for (var c = 0; c < header.length; c++) {
                    alignments.push(getTableAlignment(ruler[c] || "---"));
                }
                
                // Collect body rows
                var rows = [];
                var j = i + 2;
                
                while (j < lines.length && /\|/.test(lines[j])) {
                    var lineContent = lines[j].replace(/^\s+|\s+$/g, ""); // trim
                    if (lineContent === "") break;
                    
                    var cells = splitTableRow(lines[j]);
                    
                    // Normalize cell count to match header
                    while (cells.length < header.length) {
                        cells.push("");
                    }
                    if (cells.length > header.length) {
                        cells = cells.slice(0, header.length);
                    }
                    
                    rows.push(cells);
                    j++;
                }
                
                tables.push({
                    start: i,
                    end: j - 1,
                    header: header,
                    alignments: alignments,
                    rows: rows
                });
                
                i = j; // Continue after this table
            } else {
                i++;
            }
        }
        
        return {
            tables: tables,
            lines: lines
        };
    }
    
    /**
     * Build an InDesign table from parsed Markdown table data
     * @param {InsertionPoint} insertionPoint - Where to insert the table
     * @param {Object} tableData - Parsed table data
     * @param {Object} config - Table configuration
     * @return {Table} Created InDesign table
     * @private
     */
    function buildInDesignTable(insertionPoint, tableData, config) {
        var columnCount = tableData.header.length;
        var bodyRowCount = tableData.rows.length;
        
        try {
            // Create table with header + body rows
            var table = insertionPoint.tables.add({
                bodyRowCount: bodyRowCount,
                columnCount: columnCount,
                headerRowCount: 1
            });
            
            // Apply table style if specified
            if (config.tableStyle) {
                try {
                    table.appliedTableStyle = config.tableStyle;
                } catch (styleError) {
                    $.writeln("Error applying table style: " + styleError.message);
                }
            }
            
            // Populate header row
            for (var c = 0; c < columnCount; c++) {
                var headerCell = table.rows[0].cells[c];
                headerCell.contents = tableData.header[c] || "";
            }
            
            // Populate body rows
            for (var r = 0; r < bodyRowCount; r++) {
                for (var c2 = 0; c2 < columnCount; c2++) {
                    var bodyCell = table.rows[r + 1].cells[c2];
                    bodyCell.contents = tableData.rows[r][c2] || "";
                }
            }
            
            // Apply column alignments if requested
            if (config.useAlignment) {
                for (var col = 0; col < columnCount; col++) {
                    var justification = alignmentToJustification(tableData.alignments[col]);
                    
                    // Apply to all cells in this column
                    for (var row = 0; row < table.rows.length; row++) {
                        try {
                            var cellText = table.rows[row].cells[col].texts[0];
                            cellText.paragraphs.everyItem().justification = justification;
                            cellText.justification = justification;
                        } catch (alignError) {
                            $.writeln("Error applying alignment to cell: " + alignError.message);
                        }
                    }
                }
            }
            
            // Set equal column widths
            try {
                if (columnCount > 0) {
                    var equalWidth = table.width / columnCount;
                    for (var k = 0; k < columnCount; k++) {
                        table.columns[k].width = equalWidth;
                    }
                }
            } catch (widthError) {
                $.writeln("Error setting column widths: " + widthError.message);
            }
            
            return table;
            
        } catch (tableError) {
            $.writeln("Error creating table: " + tableError.message);
            throw new Error("Failed to create InDesign table: " + tableError.message);
        }
    }
    
    /**
     * Process all Markdown tables in a story
     * @param {Story} story - InDesign story to process
     * @param {Object} config - Table processing configuration
     * @return {Number} Number of tables processed
     */
    function processMarkdownTables(story, config) {
        try {
            if (!config || !config.processTablesEnabled) {
                return 0; // Tables processing disabled
            }
            
            var rawText = story.texts[0].contents || "";
            var normalizedText = String(rawText).replace(/\r\n|\n/g, "\r");
            var lines = normalizedText.split("\r");
            
            var result = findMarkdownTables(lines);
            
            if (!result.tables.length) {
                $.writeln("No Markdown tables found");
                return 0;
            }
            
            $.writeln("Found " + result.tables.length + " Markdown table(s)");
            
            // Process tables in reverse order to preserve character positions
            for (var i = result.tables.length - 1; i >= 0; i--) {
                var tableData = result.tables[i];
                
                try {
                    // Calculate absolute character positions
                    var startPos = 0;
                    for (var l = 0; l < tableData.start; l++) {
                        startPos += result.lines[l].length + 1; // +1 for line separator
                    }
                    
                    var endPosExclusive = startPos;
                    for (var m = tableData.start; m <= tableData.end; m++) {
                        endPosExclusive += result.lines[m].length;
                        if (m < tableData.end) {
                            endPosExclusive += 1; // Add separator between lines
                        }
                    }
                    
                    // Get insertion point and text range
                    var insertionPoint = story.insertionPoints[startPos];
                    var textRange = story.characters.itemByRange(startPos, Math.max(startPos, endPosExclusive - 1));
                    
                    // Remove original Markdown table text
                    try {
                        textRange.remove();
                    } catch (removeError) {
                        try {
                            textRange.contents = "";
                        } catch (clearError) {
                            $.writeln("Error clearing table text: " + clearError.message);
                        }
                    }
                    
                    // Insert new InDesign table
                    buildInDesignTable(insertionPoint, tableData, config);
                    
                } catch (processError) {
                    $.writeln("Error processing table " + (i + 1) + ": " + processError.message);
                }
            }
            
            return result.tables.length;
            
        } catch (error) {
            $.writeln("Error in processMarkdownTables: " + error.message);
            throw new Error("Failed to process Markdown tables: " + error.message);
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
        strikethrough:["strikethrough", "strike", "barré", "barre"],
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
            return null;
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
            strikethrough: findByPreset(styleLists.character, STYLE_PRESELECTION.strikethrough),
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
                    config.strikethrough = configData.strikethrough !== null ? findStyleByName(styles.character, configData.strikethrough) : null;
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
            var defaultFile = new File(app.activeDocument.filePath + "/mapping" );
            var saveFile = defaultFile.saveDlg("Save Configuration", "Config files:*" + CONFIG_EXT);
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
                        strikethrough: config.strikethrough ? config.strikethrough.name : null,
                        note: config.note ? config.note.name : null,
                        removeBlankPages: config.removeBlankPages,
                        
                        imageConfig: config.imageConfig ? {
                            ratio: config.imageConfig.ratio,
                            imageObjectStyle: config.imageConfig.imageObjectStyle ? config.imageConfig.imageObjectStyle.name : null,
                            captionObjectStyle: config.imageConfig.captionObjectStyle ? config.imageConfig.captionObjectStyle.name : null,
                            captionParagraphStyle: config.imageConfig.captionParagraphStyle ? config.imageConfig.captionParagraphStyle.name : null,
                            captionGap: config.imageConfig.captionGap,
                            captionMaxHeight: config.imageConfig.captionMaxHeight,
                            imageFolderPath: config.imageConfig.imageFolderPath
                            } : null,
                            tableConfig: config.tableConfig ? {
                                processTablesEnabled: config.tableConfig.processTablesEnabled,
                                tableStyle: config.tableConfig.tableStyle ? config.tableConfig.tableStyle.name : null,
                                useAlignment: config.tableConfig.useAlignment
                            } : null
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
                    config.strikethrough = configData.strikethrough !== null ? findStyleByName(styles.character, configData.strikethrough) || styles.character[0] : null;
                    config.note = configData.note !== null ? findStyleByName(styles.paragraph, configData.note) || styles.paragraph[0] : null;
                    config.removeBlankPages = configData.removeBlankPages === true;
                    
                    if (configData.imageConfig) {
                        config.imageConfig = {
                            ratio: configData.imageConfig.ratio || 0,
                            imageObjectStyle: configData.imageConfig.imageObjectStyle ? 
                                findObjectStyleByNameInsensitive(app.activeDocument, configData.imageConfig.imageObjectStyle) : null,
                            captionObjectStyle: configData.imageConfig.captionObjectStyle ? 
                                findObjectStyleByNameInsensitive(app.activeDocument, configData.imageConfig.captionObjectStyle) : null,
                            captionParagraphStyle: configData.imageConfig.captionParagraphStyle ? 
                                findStyleByName(styles.paragraph, configData.imageConfig.captionParagraphStyle) : null,
                            captionGap: configData.imageConfig.captionGap || 4,
                            captionMaxHeight: configData.imageConfig.captionMaxHeight || 50,
                            imageFolderPath: configData.imageConfig.imageFolderPath || ""
                        };
                    }
                        
                    // Load table configuration
                    if (configData.tableConfig) {
                        config.tableConfig = {
                            processTablesEnabled: configData.tableConfig.processTablesEnabled !== false,
                            tableStyle: configData.tableConfig.tableStyle ? 
                                findTableStyleByNameInsensitive(app.activeDocument, configData.tableConfig.tableStyle) : null,
                            useAlignment: configData.tableConfig.useAlignment !== false
                        };
                    }
                        
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
            if (styleMapping.normal) {
                target.texts[0].appliedParagraphStyle = styleMapping.normal;
            }
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
                { regex: REGEX.superscript, style: styleMapping.superscript },
                { regex: REGEX.strikethrough, style: styleMapping.strikethrough }
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
     * Find character style by name (case insensitive)
     * @param {Document} doc - The InDesign document
     * @param {String} name - The style name to find
     * @return {CharacterStyle|null} The found style or null
     * @private
     */
    function findCharacterStyleByNameInsensitive(doc, name) {
        if (!name) return null;
        
        try {
            // Try exact match first
            var style = doc.characterStyles.itemByName(name);
            if (style && style.isValid) return style;
        } catch (e) {
            // Style doesn't exist, continue
        }
        
        try {
            // Try capitalized version
            var capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            var styleCapitalized = doc.characterStyles.itemByName(capitalized);
            if (styleCapitalized && styleCapitalized.isValid) return styleCapitalized;
        } catch (e) {
            // Style doesn't exist
        }
        
        // Try case-insensitive search through all styles
        try {
            var allCharStyles = doc.characterStyles.everyItem().getElements();
            var lowerName = name.toLowerCase();
            
            for (var i = 0; i < allCharStyles.length; i++) {
                if (allCharStyles[i].name.toLowerCase() === lowerName) {
                    return allCharStyles[i];
                }
            }
        } catch (e) {
            $.writeln("Error in case-insensitive character style search: " + e.message);
        }
        
        return null;
    }
    
    /**
     * Find paragraph style by name (case insensitive)
     * @param {Document} doc - The InDesign document
     * @param {String} name - The style name to find
     * @return {ParagraphStyle|null} The found style or null
     * @private
     */
    function findParagraphStyleByNameInsensitive(doc, name) {
        if (!name) return null;
        
        try {
            // Try exact match first
            var style = doc.paragraphStyles.itemByName(name);
            if (style && style.isValid) return style;
        } catch (e) {
            // Style doesn't exist, continue
        }
        
        try {
            // Try capitalized version
            var capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            var styleCapitalized = doc.paragraphStyles.itemByName(capitalized);
            if (styleCapitalized && styleCapitalized.isValid) return styleCapitalized;
        } catch (e) {
            // Style doesn't exist
        }
        
        // Try case-insensitive search through all styles
        try {
            var allParaStyles = doc.paragraphStyles.everyItem().getElements();
            var lowerName = name.toLowerCase();
            
            for (var i = 0; i < allParaStyles.length; i++) {
                if (allParaStyles[i].name.toLowerCase() === lowerName) {
                    return allParaStyles[i];
                }
            }
        } catch (e) {
            $.writeln("Error in case-insensitive paragraph style search: " + e.message);
        }
        
        return null;
    }
    
    /**
     * Parse Pandoc attribute string {#id .class1 .class2 key=val}
     * @param {String} attrStr - The attribute string to parse
     * @return {Object} Object with id and classes properties
     * @private
     */
    function parsePandocAttributes(attrStr) {
        var result = { id: null, classes: [] };
        if (!attrStr) return result;
        
        // Remove surrounding whitespace
        attrStr = attrStr.replace(/^\s+|\s+$/g, '');
        
        // Split by whitespace and process each token
        var tokens = attrStr.split(/\s+/);
        
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (!token) continue;
            
            if (token.charAt(0) === '#') {
                // ID attribute
                result.id = token.slice(1);
            } else if (token.charAt(0) === '.') {
                // Class attribute
                result.classes.push(token.slice(1));
            }
            // Ignore key=value pairs for now
        }
        
        return result;
    }
    
    /**
     * Apply Pandoc inline classes: [Text]{.class1 .class2 #id}
     * Applies character styles corresponding to classes and sets label if ID present
     * @param {Story} target - The story to process
     * @private
     */
    function applyPandocInlineClasses(target) {
        try {
            var doc = app.activeDocument;
            
            // Save current search preferences
            var oldIncludeFootnotes = app.findChangeGrepOptions.includeFootnotes;
            
            // Configure search to exclude footnotes for now
            app.findChangeGrepOptions.includeFootnotes = false;
            app.findGrepPreferences = app.changeGrepPreferences = null;
            
            // Find all Pandoc inline attribute patterns
            app.findGrepPreferences.findWhat = REGEX.pandocInline.source;
            var matches = target.findGrep();
            
            // Process matches in reverse order to avoid index shifting
            for (var i = matches.length - 1; i >= 0; i--) {
                var match = matches[i];
                var fullText = match.contents;
                
                // Parse the matched text to extract content and attributes
                var regexMatch = fullText.match(REGEX.pandocInline);
                if (!regexMatch) continue;
                
                var content = regexMatch[1];
                var attrString = regexMatch[2];
                var attrs = parsePandocAttributes(attrString);
                
                // Replace the matched text with just the content
                match.contents = content;
                
                // Apply character styles for each class (last one wins visually)
                if (attrs.classes && attrs.classes.length > 0) {
                    for (var c = 0; c < attrs.classes.length; c++) {
                        var className = attrs.classes[c];
                        var charStyle = findCharacterStyleByNameInsensitive(doc, className);
                        
                        if (charStyle) {
                            try {
                                match.appliedCharacterStyle = charStyle;
                                $.writeln("Applied character style '" + charStyle.name + "' to inline span");
                            } catch (e) {
                                $.writeln("Error applying character style '" + className + "': " + e.message);
                            }
                        } else {
                            $.writeln("Character style not found: " + className);
                        }
                    }
                }
                
                // Set label if ID is present
                if (attrs.id) {
                    try {
                        match.label = attrs.id;
                        $.writeln("Set label '" + attrs.id + "' on inline span");
                    } catch (e) {
                        $.writeln("Error setting label '" + attrs.id + "': " + e.message);
                    }
                }
            }
            
            // Restore search preferences
            app.findChangeGrepOptions.includeFootnotes = oldIncludeFootnotes;
            app.findGrepPreferences = app.changeGrepPreferences = null;
            
        } catch (e) {
            $.writeln("Error in applyPandocInlineClasses: " + e.message);
            // Ensure search preferences are reset
            try {
                app.findGrepPreferences = app.changeGrepPreferences = null;
            } catch (resetError) {
                // Ignore reset errors
            }
        }
    }
    
    /**
     * Apply Pandoc fenced divs (blocks): ::: {.class1 .class2 #id} ... :::
     * Applies paragraph style to content and sets label on text frame if ID present
     * @param {Story} target - The story to process
     * @private
     */
    function applyPandocBlockClasses(target) {
        try {
            var doc = app.activeDocument;
            var paragraphs = target.paragraphs;
            if (!paragraphs || paragraphs.length === 0) return;
            
            var fencesToRemove = []; // Store fences to remove after processing
            
            // Process paragraphs forward, but skip processed sections
            for (var i = 0; i < paragraphs.length; i++) {
                var paragraph = paragraphs[i];
                var line = String(paragraph.contents).replace(/\r$/, "");
                
                // Check for opening fence
                var openMatch = line.match(REGEX.pandocFenceOpen);
                if (!openMatch) continue;
                
                var attrs = parsePandocAttributes(openMatch[1]);
                
                // Find closing fence
                var closingIndex = -1;
                for (var j = i + 1; j < paragraphs.length; j++) {
                    var closeLine = String(paragraphs[j].contents).replace(/\r$/, "");
                    if (REGEX.pandocFenceClose.test(closeLine)) {
                        closingIndex = j;
                        break;
                    }
                }
                
                if (closingIndex === -1) {
                    // Malformed block - no closing fence found
                    $.writeln("Warning: Pandoc fenced div opened but not closed at paragraph " + (i + 1));
                    continue;
                }
                
                // Determine paragraph style to apply (first available class)
                var paragraphStyle = null;
                if (attrs.classes && attrs.classes.length > 0) {
                    for (var c = 0; c < attrs.classes.length; c++) {
                        var className = attrs.classes[c];
                        paragraphStyle = findParagraphStyleByNameInsensitive(doc, className);
                        if (paragraphStyle) {
                            $.writeln("Found paragraph style '" + paragraphStyle.name + "' for class '" + className + "'");
                            break;
                        }
                    }
                    
                    if (!paragraphStyle) {
                        $.writeln("No paragraph styles found for classes: " + attrs.classes.join(", "));
                    }
                }
                
                // Apply paragraph style to content between fences
                if (paragraphStyle) {
                    for (var k = i + 1; k < closingIndex; k++) {
                        try {
                            paragraphs[k].appliedParagraphStyle = paragraphStyle;
                        } catch (e) {
                            $.writeln("Error applying paragraph style to paragraph " + (k + 1) + ": " + e.message);
                        }
                    }
                }
                
                // Set label on text frame of first inner paragraph if ID present
                if (attrs.id && (i + 1) < closingIndex) {
                    try {
                        var firstInnerParagraph = paragraphs[i + 1];
                        var textFrames = firstInnerParagraph.parentTextFrames;
                        
                        if (textFrames && textFrames.length > 0) {
                            textFrames[0].label = attrs.id;
                            $.writeln("Set label '" + attrs.id + "' on text frame");
                        }
                    } catch (e) {
                        $.writeln("Error setting label '" + attrs.id + "' on text frame: " + e.message);
                    }
                }
                
                // Mark fences for removal
                fencesToRemove.push(paragraphs[i]);      // Opening fence
                fencesToRemove.push(paragraphs[closingIndex]); // Closing fence
                
                // Skip to after the closing fence
                i = closingIndex;
            }
            
            // Remove fences in reverse order to avoid index issues
            for (var r = fencesToRemove.length - 1; r >= 0; r--) {
                try {
                    fencesToRemove[r].remove();
                } catch (e) {
                    $.writeln("Error removing fence: " + e.message);
                }
            }
            
        } catch (e) {
            $.writeln("Error in applyPandocBlockClasses: " + e.message);
        }
    }
    
    /**
     * Process Markdown images in story
     * @param {Story} story - Story to process
     * @param {Folder} baseFolder - Base folder for image resolution
     * @param {Object} config - Processing configuration
     * @param {Boolean} silentMode - Whether to suppress UI messages
     * @return {Number} Number of images processed
     */
    function processStoryImages(story, baseFolder, config, silentMode) {
        var processedCount = 0;
        var errorCount = 0;
        
        try {
            var paragraphs = story.paragraphs;
            if (!paragraphs || !paragraphs.length) return processedCount;
            
            // Process backwards to avoid index issues when removing text
            for (var pi = paragraphs.length - 1; pi >= 0; pi--) {
                var paragraph = paragraphs[pi];
                if (!paragraph.isValid) continue;
                
                var text = String(paragraph.contents);
                var searchPos = 0;
                
                // Find all Markdown images in this paragraph
                while (true) {
                    // Find image start: ![
                    var imageStart = text.indexOf("![", searchPos);
                    if (imageStart < 0) break;
                    
                    // Find alt text end: ] followed by (
                    var altEnd = -1;
                    var i = imageStart + 2;
                    var bracketDepth = 1;
                    
                    while (i < text.length) {
                        var character = text.charAt(i);
                        if (character === '[') {
                            bracketDepth++;
                        } else if (character === ']') {
                            bracketDepth--;
                            if (bracketDepth === 0 && (i + 1) < text.length && text.charAt(i + 1) === '(') {
                                altEnd = i;
                                break;
                            }
                        } else if (character === '\r' || character === '\n') {
                            // Line break interrupts image syntax
                            break;
                        }
                        i++;
                    }
                    
                    if (altEnd < 0) {
                        searchPos = imageStart + 2;
                        continue;
                    }
                    
                    // Extract alt text (may contain rich formatting)
                    var altText = text.substring(imageStart + 2, altEnd);
                    
                    // Find URL end: closing )
                    var urlStart = altEnd + 2;
                    var urlEnd = -1;
                    var j = urlStart;
                    var parenDepth = 1;
                    
                    while (j < text.length) {
                        var urlChar = text.charAt(j);
                        if (urlChar === '(') {
                            parenDepth++;
                        } else if (urlChar === ')') {
                            parenDepth--;
                            if (parenDepth === 0) {
                                urlEnd = j;
                                break;
                            }
                        } else if (urlChar === '\r' || urlChar === '\n') {
                            // Line break interrupts image syntax
                            break;
                        }
                        j++;
                    }
                    
                    if (urlEnd < 0) {
                        searchPos = imageStart + 2;
                        continue;
                    }
                    
                    // Parse URL and optional title
                    var urlContent = text.substring(urlStart, urlEnd).replace(/^\s+|\s+$/g, "");
                    var imagePath = urlContent;
                    var imageTitle = "";
                    
                    // Check for title in quotes: path "title" or path 'title'
                    var titleMatch = urlContent.match(/^([^"'\s]+)\s+["']([^"']*)["']$/);
                    if (titleMatch) {
                        imagePath = titleMatch[1];
                        imageTitle = titleMatch[2];
                    }
                    
                    // Validate image file extension
                    if (!isValidImageFile(imagePath)) {
                        searchPos = imageStart + 2;
                        continue;
                    }
                    
                    try {
                        // Get character range for the entire image syntax
                        var startChar = paragraph.characters[imageStart];
                        var endChar = paragraph.characters[urlEnd];
                        
                        if (!startChar || !endChar || !startChar.isValid || !endChar.isValid) {
                            searchPos = imageStart + 2;
                            continue;
                        }
                        
                        var textRange = paragraph.texts.itemByRange(startChar, endChar);
                        if (!textRange || !textRange.isValid) {
                            searchPos = imageStart + 2;
                            continue;
                        }
                        
                        // Resolve image file path
                        var imageFile = resolvePath(baseFolder, imagePath);
                        if (!imageFile) {
                            // Replace with error message
                            textRange.contents = "[" + I18n.__("imageNotFound", imagePath) + "]";
                            errorCount++;
                            searchPos = imageStart + 2;
                            continue;
                        }
                        
                        // Get context for placement
                        var insertionPoint = startChar.insertionPoints[0];
                        var page = findPageOfInsertionPoint(insertionPoint);
                        var columnWidth = getColumnWidthFromInsertionPoint(insertionPoint);
                        
                        // Create image frame
                        var frameHeight = (config.ratio > 0) ? (columnWidth * config.ratio) : (columnWidth * 0.6);
                        
                        var imageRect = page.rectangles.add({
                            geometricBounds: [0, 0, frameHeight, columnWidth],
                            strokeWeight: 0,
                            strokeColor: app.activeDocument.swatches.itemByName("None"),
                            fillColor: app.activeDocument.swatches.itemByName("None")
                        });
                        
                        // Place image
                        imageRect.place(imageFile);
                        
                        // Handle aspect ratio
                        if (config.ratio > 0) {
                            // Fixed ratio: may crop image to fit
                            imageRect.fit(FitOptions.FILL_PROPORTIONALLY);
                            imageRect.fit(FitOptions.CENTER_CONTENT);
                        } else {
                            // Free ratio: preserve full image, adjust frame height
                            try {
                                var image = imageRect.images[0];
                                var imageBounds = image.geometricBounds;
                                var imageWidth = imageBounds[3] - imageBounds[1];
                                var imageHeight = imageBounds[2] - imageBounds[0];
                                var imageRatio = (imageWidth > 0) ? (imageHeight / imageWidth) : 0.75;
                                
                                // Adjust frame to match image ratio
                                var newHeight = columnWidth * imageRatio;
                                var frameBounds = imageRect.geometricBounds;
                                var top = frameBounds[0];
                                var left = frameBounds[1];
                                imageRect.geometricBounds = [top, left, top + newHeight, left + columnWidth];
                                
                                // Fit without cropping
                                imageRect.fit(FitOptions.PROPORTIONALLY);
                                imageRect.fit(FitOptions.CENTER_CONTENT);
                            } catch (fitError) {
                                // Fallback to proportional fit
                                imageRect.fit(FitOptions.PROPORTIONALLY);
                                imageRect.fit(FitOptions.CENTER_CONTENT);
                            }
                        }
                        
                        // Apply image object style
                        if (config.imageObjectStyle) {
                            try {
                                imageRect.appliedObjectStyle = config.imageObjectStyle;
                            } catch (styleError) {
                                $.writeln("Failed to apply image object style: " + styleError.message);
                            }
                        }
                        
                        var finalObject = imageRect;
                        
                        // Create caption if alt text exists
                        if (altText && altText.length > 0) {
                            var imageBounds = imageRect.geometricBounds;
                            var captionLeft = imageBounds[1];
                            var captionTop = imageBounds[2] + config.captionGap;
                            var captionRight = captionLeft + columnWidth;
                            var captionBottom = captionTop + config.captionMaxHeight;
                            
                            var captionFrame = page.textFrames.add();
                            captionFrame.geometricBounds = [captionTop, captionLeft, captionBottom, captionRight];
                            
                            // Copy alt text with rich formatting (may include footnotes and styles)
                            try {
                                var altStartChar = paragraph.characters[imageStart + 2];
                                var altEndChar = paragraph.characters[altEnd - 1];
                                
                                if (altStartChar && altEndChar && altStartChar.isValid && altEndChar.isValid) {
                                    var altRange = paragraph.texts.itemByRange(altStartChar, altEndChar);
                                    if (altRange && altRange.isValid) {
                                        // Duplicate preserves formatting, footnotes, etc.
                                        altRange.duplicate(LocationOptions.AT_BEGINNING, captionFrame.insertionPoints[0]);
                                    } else {
                                        captionFrame.contents = altText;
                                    }
                                } else {
                                    captionFrame.contents = altText;
                                }
                            } catch (copyError) {
                                $.writeln("Error copying alt text: " + copyError.message);
                                captionFrame.contents = altText;
                            }
                            
                            // Apply caption paragraph style
                            if (config.captionParagraphStyle) {
                                try {
                                    captionFrame.texts[0].appliedParagraphStyle = config.captionParagraphStyle;
                                } catch (paraStyleError) {
                                    $.writeln("Failed to apply caption paragraph style: " + paraStyleError.message);
                                }
                            }
                            
                            // Set caption frame to auto-resize
                            try {
                                captionFrame.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_LEFT_POINT;
                                captionFrame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
                            } catch (autoSizeError) {
                                $.writeln("Failed to set caption auto-sizing: " + autoSizeError.message);
                            }
                            
                            // Apply caption object style
                            if (config.captionObjectStyle) {
                                try {
                                    captionFrame.appliedObjectStyle = config.captionObjectStyle;
                                } catch (objStyleError) {
                                    $.writeln("Failed to apply caption object style: " + objStyleError.message);
                                }
                            }
                            
                            // Group image and caption
                            try {
                                finalObject = app.activeDocument.groups.add([imageRect, captionFrame]);
                            } catch (groupError) {
                                $.writeln("Failed to group image and caption: " + groupError.message);
                                finalObject = imageRect; // Use image alone
                            }
                        }
                        
                        // Anchor the final object
                        if (finalObject && finalObject.isValid) {
                            anchorAt(finalObject, insertionPoint);
                        }
                        
                        // Remove the Markdown syntax from text
                        textRange.remove();
                        
                        // Update text and search position for next iteration
                        text = String(paragraph.contents);
                        searchPos = imageStart;
                        processedCount++;
                        
                        // Clean up object references
                        imageRect = null;
                        captionFrame = null;
                        finalObject = null;
                        
                    } catch (imageError) {
                        // Replace with error message and continue
                        try {
                            var errorStartChar = paragraph.characters[imageStart];
                            var errorEndChar = paragraph.characters[urlEnd];
                            
                            if (errorStartChar && errorEndChar && errorStartChar.isValid && errorEndChar.isValid) {
                                var errorRange = paragraph.texts.itemByRange(errorStartChar, errorEndChar);
                                errorRange.contents = "[" + I18n.__("errorProcessingImage", imageError.message) + "]";
                            }
                        } catch (replaceError) {
                            $.writeln("Failed to insert error message: " + replaceError.message);
                        }
                        
                        errorCount++;
                        searchPos = imageStart + 2;
                        $.writeln("Error processing image: " + imageError.message);
                    }
                }
            }
            
        } catch (e) {
            $.writeln("Critical error in processStoryImages: " + e.message);
            throw e;
        }
        
        if (errorCount > 0 && !silentMode) {
            $.writeln("Processing completed with " + errorCount + " errors");
        }
        
        return processedCount;
    }
    
    /**
     * Find object style by name (case insensitive) 
     * @param {Document} doc - The InDesign document
     * @param {String} name - The style name to find
     * @return {ObjectStyle|null} The found style or null
     * @private
     */
    function findObjectStyleByNameInsensitive(doc, name) {
        if (!name) return null;
        
        try {
            // Try exact match first
            var style = doc.objectStyles.itemByName(name);
            if (style && style.isValid) return style;
        } catch (e) {
            // Style doesn't exist, continue
        }
        
        try {
            // Try capitalized version
            var capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            var styleCapitalized = doc.objectStyles.itemByName(capitalized);
            if (styleCapitalized && styleCapitalized.isValid) return styleCapitalized;
        } catch (e) {
            // Style doesn't exist
        }
        
        // Try case-insensitive search through all styles
        try {
            var allObjStyles = doc.objectStyles.everyItem().getElements();
            var lowerName = name.toLowerCase();
            
            for (var i = 0; i < allObjStyles.length; i++) {
                if (allObjStyles[i].name.toLowerCase() === lowerName) {
                    return allObjStyles[i];
                }
            }
        } catch (e) {
            $.writeln("Error in case-insensitive object style search: " + e.message);
        }
        
        return null;
    }
    
    /**
     * Find table style by name (case insensitive)
     * @param {Document} doc - The InDesign document
     * @param {String} name - The style name to find
     * @return {TableStyle|null} The found style or null
     * @private
     */
    function findTableStyleByNameInsensitive(doc, name) {
        if (!name) return null;
        
        try {
            // Try exact match first
            var style = doc.tableStyles.itemByName(name);
            if (style && style.isValid) return style;
        } catch (e) {
            // Style doesn't exist, continue
        }
        
        try {
            // Try case-insensitive search through all styles
            var allTableStyles = doc.tableStyles.everyItem().getElements();
            var lowerName = name.toLowerCase();
            
            for (var i = 0; i < allTableStyles.length; i++) {
                if (allTableStyles[i].name.toLowerCase() === lowerName) {
                    return allTableStyles[i];
                }
            }
        } catch (e) {
            $.writeln("Error in case-insensitive table style search: " + e.message);
        }
        
        return null;
    }
    
    /**
     * Resolve file path relative to base folder
     * @param {Folder} baseFolder - Base folder for relative paths
     * @param {String} pathStr - Path string to resolve
     * @return {File|null} Resolved file or null if not found
     */
    function resolvePath(baseFolder, pathStr) {
        // Clean path
        pathStr = String(pathStr).replace(/^\s+|\s+$/g, "");
    
        // Try absolute path first
        var file = new File(pathStr);
        if (file.exists) return file;
    
        // Try relative to base folder
        if (baseFolder) {
            file = new File(baseFolder.fsName + "/" + pathStr);
            if (file.exists) return file;
    
            // Fallback: use only basename (filename without path)
            var basename = pathStr.replace(/^.*[\/\\]/, "");
            if (basename && basename !== pathStr) {
                file = new File(baseFolder.fsName + "/" + basename);
                if (file.exists) return file;
            }
        }
        
        return null;
    }
    
    /**
     * Check if file has valid image extension
     * @param {String} path - File path to check
     * @return {Boolean} True if valid image file
     */
    function isValidImageFile(path) {
        return /\.(jpg|jpeg|png|gif|tif|tiff|psd|ai|eps|pdf|bmp|webp)$/i.test(path);
    }
    
    /**
     * Find page containing insertion point
     * @param {InsertionPoint} ip - Insertion point
     * @return {Page} Page object
     */
    function findPageOfInsertionPoint(ip) {
        try {
            var textFrames = ip.parentTextFrames;
            if (textFrames && textFrames.length > 0) {
                var textFrame = textFrames[0];
                if (textFrame.parentPage) return textFrame.parentPage;
                if (textFrame.parent && textFrame.parent.constructor.name === "Spread") {
                    return textFrame.parent.pages[0];
                }
            }
        } catch (e) {
            $.writeln("Error finding page: " + e.message);
        }
        
        // Fallback to active or first page
        try {
            return app.activeWindow.activePage || app.activeDocument.pages[0];
        } catch (e2) {
            $.writeln("Error getting fallback page: " + e2.message);
            return app.activeDocument.pages[0];
        }
    }
    
    /**
     * Get column width from insertion point context
     * @param {InsertionPoint} ip - Insertion point
     * @return {Number} Column width in points
     */
    function getColumnWidthFromInsertionPoint(ip) {
        try {
            var textFrames = ip.parentTextFrames;
            if (!textFrames || textFrames.length === 0) return 200;
            
            var textFrame = textFrames[0];
            var bounds = textFrame.geometricBounds;
            var insets = textFrame.textFramePreferences.insetSpacing;
            var innerWidth = (bounds[3] - bounds[1]) - (insets[1] + insets[3]);
            var columns = textFrame.textFramePreferences.textColumnCount || 1;
            var gutter = textFrame.textFramePreferences.textColumnGutter || 0;
            
            if (columns > 1) {
                return (innerWidth - gutter * (columns - 1)) / columns;
            }
            return innerWidth;
        } catch (e) {
            $.writeln("Error calculating column width: " + e.message);
            return 200; // Fallback width
        }
    }
    
    /**
     * Anchor object at insertion point using "Above Line" position
     * @param {PageItem} pageItem - Object to anchor
     * @param {InsertionPoint} ip - Insertion point for anchoring
     */
    function anchorAt(pageItem, ip) {
        try {
            var anchorPos = AnchorPosition;
            
            // Handle different InDesign versions
            var aboveLine = (typeof anchorPos.ABOVE_LINE_POSITION !== "undefined") ? 
                           anchorPos.ABOVE_LINE_POSITION : anchorPos.ABOVE_LINE;
            
            // Insert anchored object
            pageItem.anchoredObjectSettings.insertAnchoredObject(ip, aboveLine);
            
            // Ensure position is set correctly
            pageItem.anchoredObjectSettings.anchoredPosition = aboveLine;
            
            // Optional fine-tuning
            try {
                pageItem.anchoredObjectSettings.spaceAbove = 0;
                pageItem.anchoredObjectSettings.spaceBelow = 0;
            } catch (e) {
                // These properties might not be available in all versions
            }
            
        } catch (e) {
            $.writeln("Error anchoring object: " + e.message);
            throw e; // Re-throw to handle in calling function
        }
    }
    
    /**
     * Get base folder for image resolution
     * @param {Document} doc - InDesign document
     * @param {Boolean} silentMode - Whether to suppress dialogs
     * @return {Folder|null} Base folder or null
     */
    function getBaseFolder(doc, silentMode) {
        var baseFolder = null;
        
        // Priority 1: User-saved path in document label
        try {
            var savedPath = doc.extractLabel("__img_base__");
            if (savedPath) {
                var folder = new Folder(savedPath);
                if (folder && folder.exists) {
                    baseFolder = folder;
                }
            }
        } catch (e) {
            $.writeln("Error reading image base label: " + e.message);
        }
        
        // Priority 2: Document folder if saved
        if (!baseFolder && app.activeDocument.saved) {
            try {
                baseFolder = app.activeDocument.fullName.parent;
            } catch (e) {
                $.writeln("Error getting document folder: " + e.message);
            }
        }
        
        // Priority 3: Ask user (if not in silent mode)
        if (!baseFolder && !silentMode) {
            baseFolder = Folder.selectDialog(I18n.__("selectImageFolder"));
            if (!baseFolder) return null;
        }
        
        // Save for next time (only if we found a valid folder)
        if (baseFolder) {
            try {
                doc.insertLabel("__img_base__", baseFolder.fsName);
            } catch (e) {
                $.writeln("Error saving image base label: " + e.message);
            }
        }
        
        return baseFolder;
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
                        try {
                            applyPandocInlineClasses(footnoteText.parentStory);
                        } catch (pandocError) {
                            $.writeln("Error applying Pandoc inline classes in footnote: " + pandocError.message);
                        }
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

            // Hard line breaks (Markdown): two spaces (U+0020) + return -> forced line break (~S)
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findChangeGrepOptions.includeFootnotes = false;
            app.findGrepPreferences.findWhat = "\\x{0020}{2,}\\r";
            app.changeGrepPreferences.changeTo = "\\n";
            target.changeGrep();
            app.findGrepPreferences = app.changeGrepPreferences = null;
            
            // Replace multiple line breaks with single one
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = REGEX.lineBreaks.source;
            app.changeGrepPreferences.changeTo = "\\r";
            target.changeGrep();
            
            app.findGrepPreferences = app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = "--";
            app.changeGrepPreferences.changeTo = "\\x{2013}";
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
            
            function collectTableStyles() {
                var styles = [];
                try {
                    var tStyles = doc.tableStyles.everyItem().getElements();
                    for (var i = 0; i < tStyles.length; i++) {
                        if (!tStyles[i].name.match(/^\[/)) {
                            styles.push(tStyles[i]);
                        }
                    }
                } catch(e) {
                    $.writeln("Error collecting table styles: " + e.message);
                }
                return styles;
            }
            
            function collectObjectStyles(group) {
                var styles = [];
                var oStyles = group.objectStyles;
                for (var i = 0; i < oStyles.length; i++) {
                    if (!oStyles[i].name.match(/^\[/)) styles.push(oStyles[i]);
                }
                var oGroups = group.objectStyleGroups;
                for (var j = 0; j < oGroups.length; j++) {
                    styles = styles.concat(collectObjectStyles(oGroups[j]));
                }
                return styles;
            }
    
            return {
                paragraph: collectParagraphStyles(doc),
                character: collectCharacterStyles(doc),
                object: collectObjectStyles(doc),
                table: collectTableStyles()
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
        var tableStyleNames = [noneText];
        for (var i = 0; i < styles.table.length; i++) {
            tableStyleNames.push(styles.table[i].name);
        }
        
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
        
        // Onglet des images
        var tab4 = tpanel.add("tab", undefined, I18n.__("imageConfiguration"));
        tab4.orientation = "column";
        tab4.alignChildren = "left";
        
        // Onglet des tableaux
        var tab5 = tpanel.add("tab", undefined, I18n.__("tables"));
        tab5.orientation = "column";
        tab5.alignChildren = "left";
        
        // Enable tables processing
        var tablesEnabledGroup = tab5.add("group");
        tablesEnabledGroup.orientation = "row";
        tablesEnabledGroup.alignChildren = "left";
        var tablesEnabledCheck = tablesEnabledGroup.add("checkbox", undefined, I18n.__("processTablesEnabled"));
        tablesEnabledCheck.value = true; // Enabled by default
        
        // Table style selection
        var tableStyleGroup = tab5.add("group");
        tableStyleGroup.orientation = "row";
        tableStyleGroup.alignChildren = "left";
        var tableStyleLabel = tableStyleGroup.add("statictext", undefined, I18n.__("tableStyle"));
        tableStyleLabel.preferredSize.width = 120;
        var tableStyleList = tableStyleGroup.add("dropdownlist", undefined, tableStyleNames);
        tableStyleList.preferredSize.width = 200;
        tableStyleList.selection = 0;
        
        // Table alignment option
        var alignmentGroup = tab5.add("group");
        alignmentGroup.orientation = "row";
        alignmentGroup.alignChildren = "left";
        var alignmentCheck = alignmentGroup.add("checkbox", undefined, I18n.__("useTableAlignment"));
        alignmentCheck.value = true; // Enabled by default
        
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
        var sSmallCaps = addStyleSelector(tab2, I18n.__("smallcaps"), charStyleNames);
        var sSuperscript = addStyleSelector(tab2, I18n.__("superscript"), charStyleNames);
        var sSubscript = addStyleSelector(tab2, I18n.__("subscript"), charStyleNames);
        var sUnderline = addStyleSelector(tab2, I18n.__("underline"), charStyleNames);
        var sStrikethrough = addStyleSelector(tab2, I18n.__("strikethrough"), charStyleNames);
    
        // Ajout du sélecteur de style dans l'onglet des notes de bas de page
        var sFootnotePara = addStyleSelector(tab3, I18n.__("footnoteStyle"), paraStyleNames);
        
        // Créer un groupe principal avec deux colonnes
        var imageMainGroup = tab4.add("group");
        imageMainGroup.orientation = "row";
        imageMainGroup.alignChildren = "top";
        imageMainGroup.spacing = 15;
        
        // === COLONNE GAUCHE ===
        var leftColumn = imageMainGroup.add("group");
        leftColumn.orientation = "column";
        leftColumn.alignChildren = "fill";
        leftColumn.preferredSize.width = 250;
        
        // Image folder panel (colonne gauche)
        var imgFolderPanel = leftColumn.add("panel", undefined, I18n.__("selectImageFolder"));
        imgFolderPanel.orientation = "column";
        imgFolderPanel.alignChildren = "fill";
        imgFolderPanel.margins = 10;
        imgFolderPanel.spacing = 8;
        
        var pathField = imgFolderPanel.add("edittext", undefined, "");
        pathField.characters = 25;
        
        var buttonGroup = imgFolderPanel.add("group");
        buttonGroup.orientation = "row";
        buttonGroup.alignment = "center";
        var browseBtn = buttonGroup.add("button", undefined, I18n.getLanguage() === 'fr' ? "Parcourir" : "Browse");
        var resetBtn = buttonGroup.add("button", undefined, I18n.getLanguage() === 'fr' ? "Par d\u00E9faut" : "Default");
        
        // Pre-populate image root path (reste identique)
        (function preloadImageRoot() {
            var baseFolder = null;
            try {
                var doc = app.activeDocument;
                var savedPath = doc.extractLabel("__img_base__");
                if (savedPath) {
                    var f = new Folder(savedPath);
                    if (f && f.exists) baseFolder = f;
                }
            } catch (e) {}
        
            if (!baseFolder && app.activeDocument.saved) {
                try {
                    baseFolder = app.activeDocument.fullName.parent;
                } catch (e) {}
            }
        
            pathField.text = baseFolder ? baseFolder.fsName : "";
        })();
        
        browseBtn.onClick = function() {
            var picked = Folder.selectDialog(I18n.__("selectImageFolder"));
            if (picked) pathField.text = picked.fsName;
        };
        
        resetBtn.onClick = function() {
            try {
                if (app.activeDocument.saved) pathField.text = app.activeDocument.fullName.parent.fsName;
                else pathField.text = "";
            } catch (e) { 
                pathField.text = ""; 
            }
        };
        
        // Aspect ratio panel (colonne gauche)
        var ratioPanel = leftColumn.add("panel", undefined, I18n.__("aspectRatio"));
        ratioPanel.alignChildren = "fill";
        var ratioList = ratioPanel.add("dropdownlist", undefined, [
            I18n.__("freeRatio"), "3:2", "4:3", "16:9", "1:1"
        ]);
        ratioList.selection = 0;
        
        // === COLONNE DROITE ===
        var rightColumn = imageMainGroup.add("group");
        rightColumn.orientation = "column";
        rightColumn.alignChildren = "fill";
        rightColumn.preferredSize.width = 250;
        
        // Image style panel (colonne droite - DÉPLACÉ ICI)
        var imgStylePanel = rightColumn.add("panel", undefined, I18n.__("imageStyle"));
        imgStylePanel.alignChildren = "left";
        imgStylePanel.add("statictext", undefined, I18n.__("imageObjectStyle"));
        
        var objStyleNames = ["[None]"];
        for (var i = 0; i < styles.object.length; i++) {
            objStyleNames.push(styles.object[i].name);
        }
        var imgObjStyleList = imgStylePanel.add("dropdownlist", undefined, objStyleNames);
        imgObjStyleList.preferredSize.width = 200;
        imgObjStyleList.selection = 0;
        
        // Caption panel (colonne droite)
        var imgCaptionPanel = rightColumn.add("panel", undefined, I18n.__("captionSettings"));
        imgCaptionPanel.alignChildren = "left";
        
        imgCaptionPanel.add("statictext", undefined, I18n.__("captionObjectStyle"));
        var capObjStyleList = imgCaptionPanel.add("dropdownlist", undefined, objStyleNames);
        capObjStyleList.preferredSize.width = 200;
        capObjStyleList.selection = 0;
        
        imgCaptionPanel.add("statictext", undefined, I18n.__("captionParagraphStyle"));
        var capParaStyleList = imgCaptionPanel.add("dropdownlist", undefined, paraStyleNames);
        capParaStyleList.preferredSize.width = 200;
        capParaStyleList.selection = 0;
        
        var gapGroup = imgCaptionPanel.add("group");
        gapGroup.add("statictext", undefined, I18n.__("captionGap"));
        var gapInput = gapGroup.add("edittext", undefined, "4");
        gapInput.characters = 5;
        
        var heightGroup = imgCaptionPanel.add("group");
        heightGroup.add("statictext", undefined, I18n.__("captionMaxHeight"));
        var maxHeightInput = heightGroup.add("edittext", undefined, "50");
        maxHeightInput.characters = 5;
        
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
        setDropdownByText(sStrikethrough, guessed.strikethrough ? guessed.strikethrough.name : (I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]"));
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
            
            function getObjectStyleByName(name) {
                var noneText = I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]";
                if (name === noneText) return null;
                
                for (var i = 0; i < styles.object.length; i++) {
                    if (styles.object[i].name === name) return styles.object[i];
                }
                return null;
            }
            
            function getTableStyleByName(name) {
                var noneText = I18n.getLanguage() === 'fr' ? "[aucun]" : "[None]";
                if (name === noneText) return null;
                
                for (var i = 0; i < styles.table.length; i++) {
                    if (styles.table[i].name === name) return styles.table[i];
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
                    // Load table configuration
                    if (config.tableConfig) {
                        tablesEnabledCheck.value = config.tableConfig.processTablesEnabled !== false;
                        if (config.tableConfig.tableStyle) {
                            setDropdownByText(tableStyleList, config.tableConfig.tableStyle.name);
                        }
                        alignmentCheck.value = config.tableConfig.useAlignment !== false;
                    }
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
                    strikethrough: getStyleByName(styles.character, sStrikethrough.selection.text),
                    note: getStyleByName(styles.paragraph, sFootnotePara.selection.text),
                    removeBlankPages: removeBlankPagesCheck.value,
                    tableConfig: {
                        processTablesEnabled: tablesEnabledCheck.value,
                        tableStyle: getTableStyleByName(tableStyleList.selection ? tableStyleList.selection.text : "[None]"),
                        useAlignment: alignmentCheck.value
                    }
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
               removeBlankPages: removeBlankPagesCheck.value,
               
               imageConfig: {
                   ratio: (function() {
                       if (!ratioList.selection) return 0;
                       switch (ratioList.selection.index) {
                           case 1: return 2/3; // 3:2
                           case 2: return 3/4; // 4:3  
                           case 3: return 9/16; // 16:9
                           case 4: return 1; // 1:1
                           default: return 0; // Free
                       }
                   })(),
                   imageObjectStyle: getObjectStyleByName(imgObjStyleList.selection ? imgObjStyleList.selection.text : "[None]"),
                   captionObjectStyle: getObjectStyleByName(capObjStyleList.selection ? capObjStyleList.selection.text : "[None]"),
                   captionParagraphStyle: getStyleByName(styles.paragraph, capParaStyleList.selection ? capParaStyleList.selection.text : "[None]"),
                   captionGap: parseInt(gapInput.text, 10) || 4,
                   captionMaxHeight: parseInt(maxHeightInput.text, 10) || 50,
                   imageFolderPath: pathField.text
                   },
                   tableConfig: {
                       processTablesEnabled: tablesEnabledCheck.value,
                       tableStyle: getTableStyleByName(tableStyleList.selection ? tableStyleList.selection.text : "[None]"),
                       useAlignment: alignmentCheck.value
                   }
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
    
    app.scriptPreferences.enableRedraw = false;
    var oldPreflight = app.preflightOptions.preflightOff;
    app.preflightOptions.preflightOff = true;
    
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
                                
                                if (parentFolder.name.toLowerCase() === "config" && configFile.name === "mapping.mdconfig") {
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
                    applyPandocInlineClasses(target);
                    applyPandocBlockClasses(target);
                    processFootnotes(target, styleMapping);
                    cleanupText(target);
                    processFootnoteStyles(styleMapping);
                    restoreEscapedCharactersInFootnotes();
                    
                    try {
                        var baseFolder = getBaseFolder(doc, true);
                        if (baseFolder) {
                            var defaultImageConfig = {
                                ratio: 0, // Free ratio
                                imageObjectStyle: null,
                                captionObjectStyle: null, 
                                captionParagraphStyle: null,
                                captionGap: 4,
                                captionMaxHeight: 50
                            };
                            var imageCount = processStoryImages(target, baseFolder, defaultImageConfig, true);
                            logToFile("Processed " + imageCount + " images", false);
                        }
                    } catch (imageError) {
                        logToFile("Error processing images: " + imageError.message, true);
                    }
                    
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
            // Create progress bar with correct maximum value
            createProgressBar(13);
            
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
                    
                    // Process Pandoc attributes (inline and block classes)
                    updateProgressBar(5, I18n.__("processingPandocAttributes"));
                    applyPandocInlineClasses(target);
                    applyPandocBlockClasses(target);
                    
                    // Process Markdown tables
                    if (styleMapping.tableConfig && styleMapping.tableConfig.processTablesEnabled) {
                        updateProgressBar(6, "Processing Markdown tables...");
                        try {
                            var tableCount = processMarkdownTables(target, {
                                processTablesEnabled: true,
                                tableStyle: styleMapping.tableConfig.tableStyle,
                                useAlignment: styleMapping.tableConfig.useAlignment
                            });
                            $.writeln("Processed " + tableCount + " Markdown table(s)");
                        } catch (tableError) {
                            $.writeln("Error processing tables: " + tableError.message);
                        }
                    }
                    
                    // Process footnotes - collect definitions and create InDesign footnotes
                    updateProgressBar(7, I18n.__("processingFootnotes"));
                    processFootnotes(target, styleMapping);
                    
                    // Clean up text - remove multiple line breaks, escape chars, fix dashes
                    updateProgressBar(8, I18n.__("cleaningUpText"));
                    cleanupText(target);
                    
                    // Apply styles within footnotes
                    updateProgressBar(9, I18n.__("processingFootnoteStyles"));
                    processFootnoteStyles(styleMapping);
                    
                    // Restore escaped characters in footnotes
                    updateProgressBar(10, "Restoring escaped characters in footnotes...");
                    restoreEscapedCharactersInFootnotes();
                    
                    // Process Markdown images
                    if (styleMapping.imageConfig) {
                        updateProgressBar(11, I18n.__("processingImages"));
                        try {
                            // Save image folder path to document
                            if (styleMapping.imageConfig.imageFolderPath) {
                                var folder = new Folder(styleMapping.imageConfig.imageFolderPath);
                                if (folder.exists) {
                                    app.activeDocument.insertLabel("__img_base__", folder.fsName);
                                }
                            }
                            
                            var baseFolder = getBaseFolder(app.activeDocument, true); // Silent mode
                            if (baseFolder) {
                                var imageCount = processStoryImages(target, baseFolder, styleMapping.imageConfig, true);
                                $.writeln("Processed " + imageCount + " images");
                            }
                        } catch (imageError) {
                            $.writeln("Error processing images: " + imageError.message);
                        }
                    }
                    
                    // Remove blank pages if requested
                    if (styleMapping && styleMapping.removeBlankPages) {
                        try {
                            updateProgressBar(12, I18n.__("removingBlankPages"));
                            var pagesRemoved = removeBlankPagesAfterTextEnd(doc);
                            
                            if (pagesRemoved > 0) {
                                var pagesRemovedText = I18n.__("pagesRemoved", pagesRemoved);
                                updateProgressBar(13, I18n.__("done") + " " + pagesRemovedText);
                            } else {
                                updateProgressBar(13, I18n.__("done"));
                            }
                        } catch (e) {
                            $.writeln("Error while removing blank pages: " + e.message);
                            updateProgressBar(13, I18n.__("done"));
                        }
                    } else {
                        // Complete without removing pages
                        updateProgressBar(13, I18n.__("done"));
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
        
        app.scriptPreferences.enableRedraw = true;
        app.preflightOptions.preflightOff = oldPreflight;    
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
