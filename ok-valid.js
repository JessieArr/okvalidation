/* LICENSE
OK Validation is proudly published as open source software under the MIT License

The MIT License (MIT)

Copyright (c) 2013 by Shawn Morrison

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

$OK = (function(){
	
    var _validateByArgument = function (validationArgument) {
		// Add nodes to the collection of nodes to be validate.
        var validationCollection = _getValidationCollectionByArgument(validationArgument);
		
		// Remove nodes from the collection as needed
		var nodesToValidate = _pruneValidationCollection(validationCollection);
		
		// We take care of any pre-validation work we need to, such as removing invalid classes
		_beforeCollectionValidation(nodesToValidate);
		
		// We run validation of all attributes on each node in turn, storing their result objects in an array
		var validationResultArray = _duringCollectionValidation(nodesToValidate);
		
		// Here we do any work that needs to be done after validation, such as applying invalid classes and tooltips
		_afterCollectionValidation(nodesToValidate, validationResultArray);
    };
	
	// BUILD VALIDATION COLLECTION
	var _getValidationCollectionByArgument = function(validationArgument){
		var subtreesToValidate = _getDOMSubtreesFromArgument(validationArgument);
        var nodesToValidate = _getDOMNodesFromSubtrees(subtreesToValidate);
		return nodesToValidate;
	}
	
	// PRUNE VALIDATION COLLECTION
	var _pruneValidationCollection = function(nodesToPrune){
		return nodesToPrune;
	}
	
	// COLLECTION VALIDATION LIFE CYCLE
	// BEFORE
	var _beforeCollectionValidation = function(nodesToValidate){
		for(var i = 0; i < nodesToValidate.length; i++){
			var node = nodesToValidate[i];
			node.classList.remove(_settings.invalidClassName);
		}
		_clearValidationTooltips();
	}
	
	// DURING
	var _duringCollectionValidation = function (nodesToValidate){
		var validationResultArray = [];
		for(var i = 0; i < nodesToValidate.length; i++){
			var result = _runValidationAttributes(nodesToValidate[i]);
			validationResultArray.push(result);
		}
		return validationResultArray;
	}
	
    var _runValidationAttributes = function (node) {
		var nodeIsValid = true;
		var resultObject = {node: node, failedResults: []};
        for (var i = 0; i < _settings.validationAttributes.length; i++) {
            var lifecycleResult = _validationLifeCycle(node, _settings.validationAttributes[i]);
			if(!lifecycleResult.valid){
				nodeIsValid = false;
				resultObject.failedResults.push(lifecycleResult);
			}
        }
		
		resultObject.valid = nodeIsValid;
		return resultObject;
    }
	
	// AFTER
	var _afterCollectionValidation = function(nodesToValidate, validationResultArray){
		for(var i = 0; i < validationResultArray.length; i++){
			var resultObject = validationResultArray[i];
			if (resultObject.failedResults.length > 0) {
                resultObject.node.className += ' ' + $OK.settings.invalidClassName;
				resultObject.node.className = resultObject.node.className.trim();
				
				// apply the tooltip with our info about what validation failed.
				// TODO: make this work for more than one failed result (multiple validation attributes failed)
				_setValidationTooltip(resultObject.node, resultObject.failedResults[0]);
				
				if(!$OK.state.event){
					return; // no event to do this to
				}
				// If preventDefault is not available, we can't stop it.
				// YOU WIN THIS TIME, EVENT! *shakes fist*
				// TODO: this.preventDefault should be migrated out of the validationAttribute and into the validation lifecycle.
                if (this.preventDefault && $OK.state.event.preventDefault) {
                    $OK.state.event.preventDefault();
                }
            }
		}
		
	}
	
	// SUBTREE VALIDATION LIFE CYCLE HELPERS
	var _getDOMSubtreesFromArgument = function (validationArgument) {
		if(validationArgument){
			var nodeById = document.getElementById(validationArgument);
			if (nodeById) {
				return [nodeById];
			}
			var nodesByClassName = document.getElementsByClassName(validationArgument)
			if (nodesByClassName.length > 0) {
				return nodesByClassName;
			}
		} else{
			if(!publicObject.state.event){
				// How did we get here?
				console.log('validateByArgument called programmatically with no argument. Unable to determine what to validate.');
				return [];
			}
			return [_findDefaultParentForValidation(publicObject.state.event.target)];
		}        
    };

    var _findDefaultParentForValidation = function (node) {
        if (node.tagName == 'FORM' || node.tagName == 'BODY') {
            return node;
        }
        return _findDefaultParentForValidation(node.parentNode);
    }

    var _getDOMNodesFromSubtrees = function (subtreesToValidate) {
        var nodes = [];
        for (var i = 0; i < subtreesToValidate.length; i++) {
            nodes = nodes.concat(_getDOMNodesFromSingleSubtree(subtreesToValidate[i]));
        }
        return nodes;
    };

    var _getDOMNodesFromSingleSubtree = function (subtree) {
        var nodes = [];
        if (subtree.children.length == 0) {
            nodes.push(subtree);
            return nodes;
        }
        for (var i = 0; i < subtree.children.length; i++) {
            var subtreeNodes = _getDOMNodesFromSingleSubtree(subtree.children[i]);
            nodes = nodes.concat(subtreeNodes);
        }
        return nodes;
    }

	// NODE VALIDATION LIFECYCLE
    var _validationLifeCycle = function (node, validationAttribute) {

        if (!node.getAttribute(validationAttribute.attribute))
            return {valid: true}; // This node does not contain the attribute, we return valid

        // Result object will be passed into each step in the lifecycle to allow for statefulness if needed
        var resultObject = { valid: true };

        // the validationAttribute is given a chance to handle any actions needed before doing validation
        if (validationAttribute.beforeValidate) {
            var returnedObject = validationAttribute.beforeValidate(node);
            if (returnedObject) {
                resultObject = returnedObject;
            }
        }

        // the validationAttribute is given a chance to handle any actions needed during validation
        if (validationAttribute.validate) {
            var returnedObject = validationAttribute.validate(node, resultObject);
            if (returnedObject) {
                resultObject = returnedObject;
            }               
        }

        // the validationAttribute is given a chance to handle any actions needed after doing validation
        if (validationAttribute.afterValidate) {
            var returnedObject = validationAttribute.afterValidate(node, resultObject);
            if (returnedObject) {
                resultObject = returnedObject;
            }
        }

        if (validationAttribute.valid && resultObject.valid) {
            validationAttribute.valid(node, resultObject);
        }

        if (validationAttribute.invalid && !resultObject.valid) {
            validationAttribute.invalid(node, resultObject);
        }

        if (!resultObject) {
            resultObject = {};
        }

        resultObject.node = node;
        resultObject.validationAttribute = validationAttribute;
        return resultObject;
    };
	
	createCSSSelector('.okInvalid', 'background-color: #FAA;');
	createCSSSelector('#okValidationTooltip', 'background-color: #FFC; border-style:solid; border-color:#000; padding:10px; border-radius:5px;');

	var _settings = {
	    setupAttributes: [],
        validationAttributes: [],
		invalidClassName: 'okInvalid'
	};

    // SETUP ATTRIBUTES
	var _setSetupAttribute = function (newSetupAttribute) {
	    if (!newSetupAttribute.attribute) {
	        throw new Error('ERROR: an attempt to add a new Setup Attribute without an attribute property. The attribute property is the HTML attribute used to determine where to set up a custom Setup Attribute.')
	    }
	    if (!newSetupAttribute.setup) {
	        throw new Error('ERROR: an attempt to add a new Setup Attribute without a setup method. This method is required.')
	    }
        _settings.setupAttributes.push(newSetupAttribute);
	}
	
	var _state = {};

	var _runSetupAttributes = function (node) {
	    for (var i = 0; i < _settings.setupAttributes.length; i++) {
	        _settings.setupAttributes[i].setup(node);
	    }
	}

    // VALIDATION ATTRIBUTES
	var _setValidationAttribute = function (newValidationAttribute) {
	    if (!newValidationAttribute.attribute) {
	        throw new Error('ERROR: an attempt to add a new Validation Attribute without an attribute property. The attribute property is the HTML attribute used to determine when to invoke the validation lifecycle of a custom Validation Attribute.')
	    }
	    _settings.validationAttributes.push(newValidationAttribute);
		
		if(newValidationAttribute.attribute == 'ok-validation'){
			publicObject.okValidationInstance = newValidationAttribute;
		}
	}
	
	var tooltipObjects = [];
	var _setValidationTooltip = function(node, resultObject){
		var tooltip = document.getElementById('okValidationTooltip');
		if(!tooltip){
			tooltip = document.createElement('div');
			tooltip.setAttribute('id', 'okValidationTooltip');
			tooltip.setAttribute('style', 'display: none;');
			document.getElementsByTagName('body')[0].appendChild(tooltip);
		}
		
		var tooltipInnerHTML = '';
		for(var i = 0; i < resultObject.validationMessages.length; i++){
			tooltipInnerHTML += '<li>' + resultObject.validationMessages[i] + '</li>\n';
		}
		
		var tooltipMouseover = function(){
			var tooltip = document.getElementById('okValidationTooltip');
			tooltip.innerHTML = tooltipInnerHTML;
			tooltip.setAttribute('style', 'display: block; position: absolute;');
		}
		node.addEventListener("mouseover", tooltipMouseover);
		
		var tooltipMousemove = function(event){
			var tooltip = document.getElementById('okValidationTooltip');
			var x = event.pageX + 20;
			var y = event.pageY - 10;
			tooltip.style.left = x + 'px';
			tooltip.style.top = y + 'px';
		}
		node.addEventListener("mousemove", tooltipMousemove);
		
		var tooltipMouseout = function(){
			var tooltip = document.getElementById('okValidationTooltip');
			tooltip.setAttribute('style', 'display: none;');
		}
		node.addEventListener("mouseout", tooltipMouseout);
		
		var tooltipObject = {node: node, mouseover: tooltipMouseover, mousemove: tooltipMousemove, mouseout: tooltipMouseout};
		tooltipObjects.push(tooltipObject);
	}
	
	var _clearValidationTooltips = function(){
		for(var i = 0; i < tooltipObjects.length; i++){
			var obj = tooltipObjects[i];
			obj.node.removeEventListener("mouseover", obj.mouseover);
			obj.node.removeEventListener("mousemove", obj.mousemove);
			obj.node.removeEventListener("mouseout", obj.mouseout);
		}
	}

    // OKVALIDATION SETUP AND HELPERS
	var _setOKValidationArgument = function (newOKValidationArgument) {
		var okValidationInstance = publicObject.okValidationInstance;
		var existingValidationArgument = okValidationInstance.validationTypes[newOKValidationArgument.argument];
		if(existingValidationArgument &&
			existingValidationArgument !== newOKValidationArgument){
			// If we're overwriting another instance of this validation type, we log it to help with debugging.
			console.log('overwriting ' + newOKValidationArgument.argument + ' validationArgument for okValidation.');
		}
	    okValidationInstance.validationTypes[newOKValidationArgument.argument] = newOKValidationArgument;
	}	
	
	// **** Page Setup
    var _okSetup = function () {
        var body = document.getElementsByTagName('body')[0];
        var nodesForSetup = _getDOMNodesFromSingleSubtree(body);
        nodesForSetup.forEach(_runSetupAttributes);
    };
	// We run this once the DOM is finished loading, but before waiting for content such as images to load.
	document.addEventListener('DOMContentLoaded', _okSetup);
    // ****
	
	var publicObject = {
		settings: _settings,
		validateByArgument: _validateByArgument,
	    setSetupAttribute: _setSetupAttribute,
		setValidationAttribute: _setValidationAttribute,
		setOKValidationArgument: _setOKValidationArgument, // We give the OKValidation attribute some special treatment here
		okValidationInstance: {},
		validateNode: _runValidationAttributes,
		state: {}
	};
	if(this.describe){
		// If Jasmine exists, we assume we're testing and expose some extra bits. Don't judge me, testing JS closures is hard.
		publicObject.getValidateByArgument = function(){
			return _validateByArgument;
		}
		
		publicObject.setValidateByArgument = function(externalFunction){
			_validateByArgument = externalFunction;
		}
	}
	return publicObject;
})();

// ADDING SETUP ATTRIBUTES
var okValidate = function () {
    return {
        attribute: 'ok-validate',
        events: ['click'],
        setup: function (node) {
            var validateArgument = node.getAttribute(this.attribute);
            // We check against undefined since an empty string is falsey yet is a valid argument here.
            if (validateArgument != undefined) {
                for (var i = 0; i < this.events.length; i++) {
                    node.addEventListener(this.events[i], function (event) {
						$OK.state.event = event;
                        $OK.validateByArgument(validateArgument);
                    }, false);
                }
            }
        }
    };
}
$OK.setSetupAttribute(okValidate());

// ADDING VALIDATION ARRTIBUTES
var okValidation = function () {
    return {
        attribute: 'ok-validation',
        pageSetup: function () {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.cssClass { color: #F00; }';
            document.getElementsByTagName('head')[0].appendChild(style);
        },
        beforeValidate: function (node, resultObject) {  },
        validate: function (node, resultObject) {
			// We set this here so that if a user forgets to set it, it defaults to true.
            resultObject.valid = true;
			resultObject.validationMessages = [];
            var okValidationAttribute = node.getAttribute(this.attribute);
            var arguments = okValidationAttribute.split(' ');
            for (var i = 0; i < arguments.length; i++) {
                var argumentParts = arguments[i].split(this.delimiter);

                if (!this.validationTypes[argumentParts[0]]) {
                    var nodeLogId = node.id;
                    var nodeTagName = node.tagName;
                    if (nodeLogId) {
                        console.log('Unknown argument to ' + this.attribute + ': ' + arguments[i] + ' on ' + nodeTagName + ' element with ID: ' + nodeLogId + '.');
                    }
                    else {
                        console.log('Unknown argument to ' + this.attribute + ': ' + arguments[i] + ' on ' + nodeTagName + 'element.');
                    }	                    
                    continue;
                }
                var passedValidation = this.validationTypes[argumentParts[0]].validate(node, argumentParts[1]);
                if (!passedValidation) {
                    this.logFailedValidation(node, this.validationTypes[argumentParts[0]]);
					resultObject.validationMessages.push(this.validationTypes[argumentParts[0]].validationMessage);
                    resultObject.valid = false;
                }
            }
            return resultObject;
        },
        afterValidate: function (node, resultObject) {  },
        valid: function (node, resultObject) { if (resultObject.valid) console.log('valid!'); },
        invalid: function (node, resultObject){  },
        validationTypes: {},
        logFailedValidation: function(node, validationType){
            var nodeLogId = node.id;
            var nodeTagName = node.tagName;
            if (nodeLogId) {
                console.log(validationType.argument + ' validation failed with value: "' + node.value + '" for ' + nodeTagName + ' element with ID: ' + nodeLogId + '.');
            }
            else {
                console.log(validationType.argument + ' validation failed with value: "' + node.value + '" for ' + nodeTagName + ' element.');
            }	
        },
        delimiter: ':',
        preventDefault: true,
        invalidClassName: 'okInvalid'
    }
}
$OK.setValidationAttribute(okValidation());

// Here we set some default ValidationArguments for the OKValidation attribute. Overwrite these if you want other behavior.
var required = function () {
    return {
        argument: 'required',
        validate: function (node) { if (node.value) return true; return false; },
		validationMessage: 'This field is required.'
    }
}
$OK.setOKValidationArgument(required());

var integer = function () {
    return {
        argument: 'integer',
        validate: function (node) {
            var remainder = node.value % 1;
            if (remainder == 0)
                return true;
            return false;
        },
		validationMessage: 'This field must be an integer.'
    }
}
$OK.setOKValidationArgument(integer());

var hexadecimal = function () {
    return {
        argument: 'hexadecimal',
        validate: function (node) {
            var hexRegex = /[^0-9a-fA-F]/g;
            var matchResult = node.value.match(hexRegex);
            return matchResult == null;
        },
		validationMessage: 'This field must be a hexadecimal value.'
    }
}
$OK.setOKValidationArgument(hexadecimal());

var octal = function () {
    return {
        argument: 'octal',
        validate: function (node) {
            var hexRegex = /[^0-7]/g;
            var matchResult = node.value.match(hexRegex);
            return matchResult == null;
        },
		validationMessage: 'This field must be an octal number.'
    }
}
$OK.setOKValidationArgument(octal());

var binary = function () {
    return {
        argument: 'binary',
        validate: function (node) {
            var binRegex = /[^01]/g;
            var matchResult = node.value.match(binRegex);
            return matchResult == null;
        },
		validationMessage: 'This field must be a binary number.'
    }
}
$OK.setOKValidationArgument(binary());

var size = function () {
    return {
        argument: 'size',
        validate: function (node, parameters) {
            var params = parameters.split('-');
            return node.value.length >= params[0] && node.value.length <= params[1]
        },
		validationMessage: 'This field does not meet length requirements.'
    }
}
$OK.setOKValidationArgument(size());

var domain = function () {
    return {
        argument: 'domain',
        validate: function (node) {
            if (!node.value) {
                return true;
            }
            var binRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
            var matchResult = node.value.match(binRegex);
            return matchResult != null;
        },
		validationMessage: 'This field must be a domain.'
    }
}
$OK.setOKValidationArgument(domain());

var hostName = function () {
    return {
        argument: 'hostName',
        validate: function (node) {
            if (!node.value) {
                return true;
            }
            var hostNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-.]+[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
            var matchResult = node.value.match(hostNameRegex);
            return matchResult != null;
        },
		validationMessage: 'This field must be a valid host name.'
    }
}
$OK.setOKValidationArgument(hostName());

var email = function () {
    return {
        argument: 'email',
        validate: function (node) {
            var emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
            var matchResult = node.value.match(emailRegex);
            return matchResult != null;
        },
		validationMessage: 'This field must be a valid email address.'
    }
}
$OK.setOKValidationArgument(email());

var sameAs = function () {
    return {
        argument: 'sameAs',
        validate: function (node, parameters) {
            var params = parameters.split(',');
            var sameAsNodes = [];

            for (var i = 0; i < params.length; i++) {
                var otherNode = document.getElementById(params[i]);
                if (!otherNode) {
                    console.log(argument + ' validation failed to find an element with id: ' + params[i]);
                    return false;
                }
                sameAsNodes.push(document.getElementById(params[i]))
            };

            for (i = 0; i < sameAsNodes.length; i++) {
                if (node.value != sameAsNodes[i].value) {
                    return false;
                };
            };

            return true;
        },
		validationMessage: 'This field must match another field on this page.'
    }
}
$OK.setOKValidationArgument(sameAs());

var zipCode = function () {
    return {
        argument: 'zipCode',
        validate: function (node) {
            var zipCodeRegex = /\b\d{5}\b/;
            var matchResult = node.value.match(zipCodeRegex);
            return matchResult != null;
        },
		validationMessage: 'This field must be a zip code.'
    }
}
$OK.setOKValidationArgument(zipCode());

var ipv4 = function () {
    return {
        argument: 'ipv4',
        validate: function (node) {
            if (!node.value) {
                return true;
            }

            var octets = node.value.split('.');
            if (octets.length != 4) {
                return false;
            }

            for (var i = 0; i < octets.length; i++) {
				if(!octets[i]){
					return false;
				}
                if (octets[i] < 0 || octets[i] > 255) {
                    return false;
                }
            }
            return true;
        },
		validationMessage: 'This field must be a valid IPv4 address.'
    }
}
$OK.setOKValidationArgument(ipv4());

var ipv6 = function () {
    return {
        argument: 'ipv6',
        validate: function (node) {
            if (!node.value) {
                return true;
            }

            var groups = node.value.split(':');
            if (groups.length < 4 || groups.length > 8) {
                return false;
            }

				var hexRegex = /[^0-9a-fA-F]/g;
            for (var i = 0; i < groups.length; i++) {	  
                if(groups[i].length != 4){
                    return false;
                }
                var matchResult = groups[i].match(hexRegex);
                if (matchResult) {
                    return false;
                }
            }
            return true;
        },
		validationMessage: 'This field must be a valid IPv6 address.'
    }
}
$OK.setOKValidationArgument(ipv6());

// Remove this later or refactor
function createCSSSelector(selector, style) {
    if (!document.styleSheets) {
        return;
    }

    if (document.getElementsByTagName("head").length == 0) {
        return;
    }

    var stylesheet;
    var mediaType;
    if (document.styleSheets.length > 0) {
        for (i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
                continue;
            }
            var media = document.styleSheets[i].media;
            mediaType = typeof media;

            if (mediaType == "string") {
                if (media == "" || (media.indexOf("screen") != -1)) {
                    styleSheet = document.styleSheets[i];
                }
            } else if (mediaType == "object") {
                if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
                    styleSheet = document.styleSheets[i];
                }
            }

            if (typeof styleSheet != "undefined") {
                break;
            }
        }
    }

    if (typeof styleSheet == "undefined") {
        var styleSheetElement = document.createElement("style");
        styleSheetElement.type = "text/css";

        document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

        for (i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
                continue;
            }
            styleSheet = document.styleSheets[i];
        }

        var media = styleSheet.media;
        mediaType = typeof media;
    }

    if (mediaType == "string") {
		if(styleSheet.cssRules){
			for (i = 0; i < styleSheet.rules.length; i++) {
				if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
					styleSheet.rules[i].style.cssText = style;
					return;
				}
			}
		}

        styleSheet.addRule(selector, style);
    } else if (mediaType == "object") {
		if(styleSheet.cssRules){
			for (i = 0; i < styleSheet.cssRules.length; i++) {
				if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
					styleSheet.cssRules[i].style.cssText = style;
					return;
				}
			}
		}
        

        styleSheet.insertRule(selector + "{" + style + "}", 0);
    }
}

