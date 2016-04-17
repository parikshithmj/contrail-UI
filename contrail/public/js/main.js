//utility function to validate the IPAddress
function validateIPAddress(ipaddress) {
    var octets = ipaddress.split(".");
    if (octets.length == 4) {
        for (i = 0; i < 4; i++) {

            var num = parseInt(octets[i]);
            console.log("num is" + num);
            if (isNaN(num) || num < 0 && num > 255) {
                break;
            }
        }
        if (i == 4)
            return true;
    }
    alert("Invalid IP Address");
}

function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}

//convert from epoch time to readable format.
function convertToDate(timestamp) {
    var date = new Date(timestamp * 1000);
    //Get date of the week
    var dateWeek = date.getDate();
    //Get month 
    var month = date.getMonth();
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0 " + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0 " + date.getSeconds();
    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + "  (" + month + "/ " + dateWeek + ") ";
    return formattedTime;
}


function trafficViewModel() {
    var self = this;
    self.trafficList = ko.observableArray();
    self.trafficListByTime = ko.observableArray();
	self.resultList = ko.observableArray();
    self.getTraffic = function() {
        var protocol = $('#protocol').val().split(':')[1];
        var destination_ip = $('#destination_ip').val();

        if (destination_ip == "")
            destination_ip = "*"; // match all
        else if (!validateIPAddress(destination_ip))
            return;
        var source_ip = $('#source_ip').val();
        console.log(destination_ip + "aaa");
        if (source_ip == "")
            source_ip = "*"; // match all    
        else if (!validateIPaddress(source_ip))
            return;
        $.ajax({
            type: 'GET',
            url: '/traffics/' + protocol + "/" + destination_ip + "/" + source_ip,
            success: function(data) {
                var observableData = ko.mapping.fromJS(data);

                var array = observableData();
                self.trafficList(array);
            },
            error: function(jq, st, error) {
                alert(error);
            }
        });
    };

	 self.getQuery = function() {
		 
        var whereStr = $('#where').val();  
		var f1 =  $('#timestamp').val() == ""? "":"timestamp,";
        var f2 =  $('#dest_ip').val() == ""? "": "destination_ip,";
		var f3 =  $('#dest_vn').val() == ""? "": "destination_vn,";
		var f4 =  $('#dest_port').val() == ""? "": "destination_port,";
        var f5 =  $('#src_ip').val() == ""? "":"source_ip,";
		var f6 =  $('#src_vn').val() == ""? "":"source_vn,";
		var f7 =  $('#src_port').val() == ""? "": "source_port,";
		var f8 =  $('#prot').val() == ""? "": "protocol,";
		var f9 =  $('#sumKb').val() == ""? "": "sum_bytes_kb,";
		var f10 =  $('#sumPack').val() == ""? "": "sum_packets,";
		var f11 =  $('#dir_ingress').val() == ""? "": "direction_ingress,"; 
		var queryStr = "select ";
		 
		if(f1 == "" && f2 == "" && f3 == "" && f4 == "" && f5 == "" 
		   && f6 == "" && f7 =="" && f8 =="" && f9 =="" && f10 == "" && f11 == ""){
			queryStr = queryStr + "*";
		}
		else{
			var allFields = f1 +f2 + f3 + f4 + f5 + f6 + f7 + f8 + f9 + f10 + f11;	
			queryStr = queryStr + allFields;
			queryStr = queryStr.substring(0,queryStr.length-1);
		}
		 
		queryStr = queryStr + " from Contrail"   
		var where = $('#where').val() == ""? "": " where "+$('#where').val() ;
        
		queryStr = queryStr + where;        
        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/traffic/query/q?q= '+ queryStr,
            success: function(data) {
                var observableData = ko.mapping.fromJS(data);
                var array = observableData();
                self.resultList(array);
				var template = $('.table');
				var headers = allFields.split(",");
				for(var i =0 ; i< headers.length ;i++){
					$('.tbody').append("<td>"+headers[i]+"</td>").css("font-weight", "bold");
				}
         			for(var key in data){
         				template.append("<tr>");
         				for(var s_key in data[key]){
         				template.append("<td>"+data[key][s_key]+"</td>");
         				template.append("</tr>");					
         			}

			}						
            },
            error: function(jq, st, error) {
                alert(error);
            }
        });
    };

    self.getTrafficByTimeStamp = function() {
        var date1 = new Date($('#date1').val());
        date1 = date1.getTime() / 1000;
        $.ajax({
            type: "GET",
            url: 'traffic/timeRange/' + date1 + "/" + date1,

            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                var observableData = ko.mapping.fromJS(data);
                var array = observableData();
                self.trafficListByTime(array);
                console.log("yay" + data);
            },
            error: function(data) {
                console.log("no");
            }
        });
    }

}


$(document).ready(function() {
    ko.applyBindings(new trafficViewModel());
});