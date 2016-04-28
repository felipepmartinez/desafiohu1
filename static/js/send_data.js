$( document ).ready(function() {
 
    alert("funcionando!");

 	$("#buttonBuscar").click(function() {
    	
    	alert("enviando dados!");

    	$.ajax({
    		type: 'POST',
    		data: JSON.stringify({"nome": "Felipe"}),
    		contentType: "application/json",
    		dataType: 'json',
    		url: "http://localhost:3000/receive",
    		success: function(data) {
    			alert(data);
    			console.log("Cliente recebeu os dados!");
    		},
    		error: function(err) {
    			console.log("Cliente nao recebeu nada!");
    		}
    	});

	});

});