$( document ).ready(function() {
 
    // se o checkbox ta apertado dataentrada e datasaida recebem null
    // 		+ desativa as caixas

    $('#inputCheckbox').click(function() {

    	$('#inputInicio').attr('disabled', this.checked);
    	$('#inputFim').attr('disabled', this.checked);

    	if (this.checked) {
    		$('#inputInicio').val(null);
    		$('#inputFim').val('');
    	}

	});

 	$("#buttonBuscar").click(function() {

    	var data = JSON.stringify({"local":$('#inputLocal').val(),"inicio":$('#inputInicio').val(),"fim":$("#inputFim").val()});

    	$.ajax({
    		type: 'POST',
    		data: data,
    		contentType: "application/json",
    		dataType: 'json',
    		url: "http://localhost:3000/select",
    		success: function(data) {
    			//console.log(data);
    			console.log("Cliente recebeu os dados!");
    			
    			$(data).each(function(index, value) {
    				console.log(value["nome"]); 
    				$("#listaHoteis").append("<li>"+value["nome"]+", "+value["cidade"]+"</li>");
    			});
    		},
    		error: function(err) {
    			console.log("Cliente nao recebeu nada!");
    		}
    	});

	});

});