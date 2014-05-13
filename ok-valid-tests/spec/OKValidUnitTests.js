describe("FUNCTION: validateNode", function() {
  var blankNode;
  blankNode = document.createElement('form');
  
  var emptyRequired;
  emptyRequired = document.createElement('form');
  emptyRequired.setAttribute('ok-validation', 'required');
  
  var requiredWithValue;
  requiredWithValue = document.createElement('form');
  requiredWithValue.setAttribute('ok-validation', 'required');
  requiredWithValue.value = 'w-0erjti3mnls';
  
  beforeEach(function() {
  });

  it('node with no validation attribute should pass', function() {
    expect($OK.validateNode(blankNode).valid).toBe(true);
  });
  
  it('node with "required" attribute should fail if it has no value', function() {
    expect($OK.validateNode(emptyRequired).valid).toBe(false);
  });
  
  it('node with "required" attribute should pass if it has any value', function() {
    expect($OK.validateNode(requiredWithValue).valid).toBe(true);
  });
  
  describe('VALIDATION ATTRIBUTES:', function() {
	var node = document.createElement('form');
  
    it('node with no validation attribute should pass', function() {
      expect($OK.validateNode(node).valid).toBe(true);
	});
	
	describe('integer:', function() {
	  var node = document.createElement('form');
	  node.setAttribute('ok-validation', 'integer');
  
      it('node with value "123456" should pass', function() {
	    node.value = '123456';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "12sdkl34" should fail', function() {
	    node.value = '12sdkl34';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "one" should fail', function() {
	    node.value = 'one';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('hexadecimal:', function() {
	  var node = document.createElement('form');
	  node.setAttribute('ok-validation', 'hexadecimal');
  
      it('node with value "1D4A6" should pass', function() {
	    node.value = '1D4A6';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "a2bc9d3" should pass', function() {
	    node.value = 'a2bc9d3';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "12sl34" should fail', function() {
	    node.value = '12sl34';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "abcdefg" should fail', function() {
	    node.value = 'abcdefg';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('octal:', function() {
	  var node = document.createElement('form');
	  node.setAttribute('ok-validation', 'octal');
  
      it('node with value "01234567" should pass', function() {
	    node.value = '01234567';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "81234" should fail', function() {
	    node.value = '81234';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('binary:', function() {
	  var node = document.createElement('form');
	  node.setAttribute('ok-validation', 'binary');
  
      it('node with value "01001100" should pass', function() {
	    node.value = '01001100';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "01001200" should fail', function() {
	    node.value = '01001200';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('size:', function() {
	  var node = document.createElement('form');	  
  
      it('node with value "13 characters" and argument "13-13" should pass', function() {
	    node.setAttribute('ok-validation', 'size:13-13');
	    node.value = '13 characters';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "" and argument "2-10" should pass', function() {
	    node.setAttribute('ok-validation', 'size:2-10');
	    node.value = '01001200';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "1" and argument "2-10" should fail', function() {
	    node.setAttribute('ok-validation', 'size:2-10');
	    node.value = '1';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "13 characters" and argument "2-10" should fail', function() {
	    node.setAttribute('ok-validation', 'size:2-10');
	    node.value = '13 characters';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('domain:', function() {
	  var node = document.createElement('form');
	  node.setAttribute('ok-validation', 'domain');
  
      it('node with value "example.com" should pass', function() {
	    node.value = 'example.com';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "longtld.example" should pass', function() {
	    node.value = 'longtld.example';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "test@example.com" should fail', function() {
	    node.value = 'test@example.com';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "word" should fail', function() {
	    node.value = 'word';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "doubledot..com" should fail', function() {
	    node.value = 'doubledot..com';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('email:', function() {
	  var node = document.createElement('form');
	  node.setAttribute('ok-validation', 'email');
  
      it('node with value "example@test.com" should pass', function() {
	    node.value = 'example@test.com';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "example*test.com" should fail', function() {
	    node.value = 'example*test.com';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "example@testcom" should fail', function() {
	    node.value = 'example@testcom';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('sameAs:', function() {
	  var nodeA = document.createElement('form');
	  nodeA.setAttribute('ok-validation', 'sameAs:node2');
	  nodeA.setAttribute('id', 'nodeA');
	  
	  var nodeB = document.createElement('form');
	  nodeB.setAttribute('id', 'node2');
	  
  
      it('nodeA with same value as nodeB should pass', function() {
	    nodeA.value = 'example@test.com';
		nodeB.value = 'example@test.com';
		var body = document.getElementsByTagName("body")[0]
		body.appendChild(nodeB);
	  
        expect($OK.validateNode(nodeA).valid).toBe(true);
	  });
	  
	  it('nodeA with different value from nodeB should fail', function() {
	    nodeA.value = 'example@test.com';
		nodeB.value = 'different';
		var body = document.getElementsByTagName("body")[0]
		body.appendChild(nodeB);
	  
        expect($OK.validateNode(nodeA).valid).toBe(false);
	  });
    });
	
	describe('zipCode:', function() {
	  var node = document.createElement('form');	  
	  node.setAttribute('ok-validation', 'zipCode');
	  
      it('node with value "12345" should pass', function() {
	    node.value = '12345';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "123456" should fail', function() {
	    node.value = '123456';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "1234" should fail', function() {
	    node.value = '1234';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "12A45" should fail', function() {
	    node.value = '12A45';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('ipv4:', function() {
	  var node = document.createElement('form');
	  node.setAttribute('ok-validation', 'ipv4');
  
      it('node with value "1.2.3.4" should pass', function() {
	    node.value = '1.2.3.4';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "1.2.3.4.5.6" should fail', function() {
	    node.value = '1.2.3.4.5.6';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "300.1.1.1" should fail', function() {
	    node.value = '300.1.1.1';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with value "1.2.3." should fail', function() {
	    node.value = '1.2.3.';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
	
	describe('ipv6:', function() {
	  var node = document.createElement('form');
	  node.setAttribute('ok-validation', 'ipv6');
  
      it('node with value "2001:0db8:85a3:0042:1000:8a2e:0370:7334" should pass', function() {
	    node.value = '2001:0db8:85a3:0042:1000:8a2e:0370:7334';
        expect($OK.validateNode(node).valid).toBe(true);
	  });
	  
	  it('node with value "1.2.3.4" should fail', function() {
	    node.value = '1.2.3.4';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with a non-hex character should fail', function() {
	    node.value = 'X001:0db8:85a3:0042:1000:8a2e:0370:7334';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with too few segments should fail', function() {
	    node.value = '2001:0db8:85a3';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with too many segments should fail', function() {
	    node.value = '2001:0db8:85a3:2001:0db8:85a3:2001:0db8:85a3';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with too few characters in any segment should fail', function() {
	    node.value = '201:0db8:85a3:2001:0db8:85a3:2001:0db8';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
	  
	  it('node with too many characters in any segment should fail', function() {
	    node.value = '20031:0db8:85a3:2001:0db8:85a3:2001:0db8';
        expect($OK.validateNode(node).valid).toBe(false);
	  });
    });
  });
});
