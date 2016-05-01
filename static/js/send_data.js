$( document ).ready(function() {
 
    // se o checkbox ta apertado dataentrada e datasaida recebem null
    // 		+ desativa as caixas
    $('.alert .close').on('click', function(e) {
    	$(this).parent().hide();
	});


	ALERT = {
		show: function(message) {
			$("#alertMessage").html("<strong>Erro!</strong> "+message);
			$("#alert").show();
			window.setTimeout(function () {
       			$("#alert").hide();
    		}, 2000);
		}
	}

    $("#inputLocal").autocomplete({
    	source: function(request, response) {
    		$.ajax({
            	type: 'POST',
            	data: { term: request.term },
            	dataType: 'text',
            	url: "http://localhost:3000/suggest",
                success: function (data)
            	{
            		var out = $.parseJSON(data);
					response(out);
            	}
        	});
    	}
    });

 	$(".inputData").datepicker({
 		dateFormat: 'yy-mm-dd',
 		defaultDate: '-1y'
 	});

    $("#inputCheckbox").click(function() {

    	$(".inputData").attr("disabled", this.checked);

    	if (this.checked) {
    		$("#inputData").val('');
    	}

	});

 	$("#buttonBuscar").click(function() {

    	var data = JSON.stringify({"local":$('#inputLocal').val(),
    						"inicio":$('#inputInicio').val(),
    						"fim":$("#inputFim").val() });

    	if ($('#inputInicio').val() > $('#inputFim').val()) {
    		ALERT.show("A data de entrada deve ser anterior à da saída!");
    		return;
    	}

    	if ($("#inputLocal").val() == '') {
    		ALERT.show("É preciso inserir um destino!");
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