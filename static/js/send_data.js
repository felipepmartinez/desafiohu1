$( document ).ready(function() {
 
    // se o checkbox ta apertado dataentrada e datasaida recebem null
    // 		+ desativa as caixas

 	$(".inputData").datepicker({
 		dateFormat: 'yy-mm-dd',
 		defaultDate: '-1y'
 	});

 	/** nao funciona de jeito nenhum

 	$("#inputInicio").datepicker({
 		onClose: function(selectedDate) {
        	alert("entrou");
        	$("#inputFim").datepicker("option", "minDate", selectedDate);
      	}
    });

 	$("#inputFim").datepicker({
 		onClose: function(selectedDate) {
        	$("#inputInicio").datepicker("option", "maxDate", selectedDate);
      	}
    });
	
	**/

    $('#inputCheckbox').click(function() {

    	$('.inputData').attr('disabled', this.checked);

    	if (this.checked) {
    		$('#inputData').val('');
    	}

	});

 	$("#buttonBuscar").click(function() {

    	var data = JSON.stringify({"local":$('#inputLocal').val(),
    						"inicio":$('#inputInicio').val(),
    						"fim":$("#inputFim").val() });

    	if ($('#inputInicio').val() > $('#inputFim').val()) {
    		alert("A data de entrada deve ser menor que a de saída!");
    		return;
    	}

    	if ($("#inputLocal").val() == '') {
    		alert("É preciso entrar com um valor para o local!");
    		return;
    	}

    	$('#listaHoteis').empty();

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