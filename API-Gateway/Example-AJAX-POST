<script>
  $(document).ready(function(){
    $("#emailForm").submit(function(event){
      event.preventDefault();
      var emailInput = $("input#emailInput").val()
      var productIdInput = document.querySelector('[itemprop=productID]').textContent.split('#')[1].replace(/\s/g, '');

      var resultEmailProduct = {
        "email": emailInput,
        "productid": productIdInput,
        "siteid": 'aml'
      }

      var api = 'https://8cr5vzgtq5.execute-api.us-west-2.amazonaws.com/prod';

      $.ajax({
          url: api ,
          type: 'POST',
          data: JSON.stringify(resultEmailProduct),
          dataType: 'json',
          crossDomain: true,
          contentType: "application/json",
          success: function (data) {
              console.log(data);
              console.log(JSON.stringify(resultEmailProduct));
          },
          error: function(e){
              alert('Error: '+e);
          }
      });

    });
  });
</script>
