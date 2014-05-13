describe("SYSTEM TESTS", function() {
	// SETUP
	var originalValidateByArgument = $OK.getValidateByArgument()
	
	beforeEach(function(){
		// noop	
	});
	
	afterEach(function(){
		// Clean up our spies between tests so we get our default behavior back.
		$OK.setValidateByArgument(originalValidateByArgument);
	});
  
	it('Jasmine runs once the DOM is done loading', function() {
	    var submitButton = document.getElementById('submitButton');
        expect($OK.validateNode(submitButton).valid).toBe(true);
	});
	
	it('clicking Submit button causes validation to run', function(){
		// I know, I know, but testing private methods is tricky in JS. Cut me some slack.
		spyOn($OK, 'validateByArgument')();
		$OK.setValidateByArgument($OK.validateByArgument);
		
		var submitButton = document.getElementById('submitButton');
		submitButton.click();
		
		expect($OK.validateByArgument).toHaveBeenCalled();
	});
	
	it('an input that has an invalid value should have the invalid class', function(){
		var submitButton = document.getElementById('submitButton');
		var emptyRequiredInput = document.getElementById('emptyRequiredInput');
		
		submitButton.click();
		expect(emptyRequiredInput.className).toBe('okInvalid');
	});
	
	it('an input that had the invalid class should not still have it after its value is corrected.', function(){
		var submitButton = document.getElementById('submitButton');
		var emptyRequiredInput = document.getElementById('emptyRequiredInput');
		emptyRequiredInput.value = 'something';
		
		submitButton.click();
		expect(emptyRequiredInput.className).toBe('');
		emptyRequiredInput.value = '';
	});
	
	it('an element that has an invalid value should display a tooltip on hover', function(){
		var submitButton = document.getElementById('submitButton');
		var emptyRequiredInput = document.getElementById('emptyRequiredInput');
		var tooltip = document.getElementById('okValidationTooltip');
		
		submitButton.click();
		raiseMouseEvent(emptyRequiredInput, 'mouseover');	
		expect(tooltip.style.display).not.toBe('none');
	});
	
	it('an element that is displaying a tooltip should hide it on mouseout', function(){
		var submitButton = document.getElementById('submitButton');
		var emptyRequiredInput = document.getElementById('emptyRequiredInput');
		var tooltip = document.getElementById('okValidationTooltip');
		
		submitButton.click();
		raiseMouseEvent(emptyRequiredInput, 'mouseover');
		raiseMouseEvent(emptyRequiredInput, 'mouseout');		
		expect(tooltip.style.display).toBe('none');
	});
	
	it('an element that is displaying a tooltip should not show it on hover after its value is corrected and submitted', function(){
		var submitButton = document.getElementById('submitButton');
		var emptyRequiredInput = document.getElementById('emptyRequiredInput');
		var tooltip = document.getElementById('okValidationTooltip');
		
		emptyRequiredInput.value = 'something';
		
		submitButton.click();
		raiseMouseEvent(emptyRequiredInput, 'mouseover');	
		expect(tooltip.style.display).toBe('none');
		
		emptyRequiredInput.value = '';
	});
	
	it('an element that has a valid value should NOT have the invalid class', function(){
		var submitButton = document.getElementById('submitButton');
		var requiredInputWithValue = document.getElementById('requiredInputWithValue');
		
		submitButton.click();
		expect(requiredInputWithValue.className).not.toBe('okInvalid');
	});	
});

function raiseMouseEvent(element, eventName){
	if( document.createEvent ) {
		var evObj = document.createEvent('MouseEvents');
        evObj.initEvent(eventName, true, false );
        element.dispatchEvent(evObj);
    } else if( document.createEventObject ) {
        element.fireEvent('on' + eventName);
    }	
}