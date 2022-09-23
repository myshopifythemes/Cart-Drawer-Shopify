var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
{% raw %}
Shopify.money_format = "{{amount}} €";
{% endraw %}
Shopify.formatMoney = function (cents, format) {
	if (typeof cents == 'string') { cents = cents.replace('.', ''); }
	var value = '';
	var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
	var formatString = (format || this.money_format);
	function defaultOption(opt, def) {
		return (typeof opt == 'undefined' ? def : opt);
	}
	function formatWithDelimiters(number, precision, thousands, decimal) {
		precision = defaultOption(precision, 2);
		thousands = defaultOption(thousands, ',');
		decimal = defaultOption(decimal, '.');
		if (isNaN(number) || number == null) { return 0; }
		number = (number / 100.0).toFixed(precision);
		var parts = number.split('.'),
			dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
			cents = parts[1] ? (decimal + parts[1]) : '';
		return dollars + cents;
	}
	switch (formatString.match(placeholderRegex)[1]) {
		case 'amount':
			value = formatWithDelimiters(cents, 2);
			break;
		case 'amount_no_decimals':
			value = formatWithDelimiters(cents, 0);
			break;
		case 'amount_with_comma_separator':
			value = formatWithDelimiters(cents, 2, '.', ',');
			break;
		case 'amount_no_decimals_with_comma_separator':
			value = formatWithDelimiters(cents, 0, '.', ',');
			break;
	}
	return formatString.replace(placeholderRegex, value);
};


// Function for side cart start
function do_cart_refresh() {
	$.ajax({
		url: "/cart.json",
		method: "GET",
		success: function (cartdata) {
			console.log(cartdata);
			window.cartdata = cartdata;
			if (cartdata.item_count == 0) {
				$(".cart_product_wrapper").hide();
				$(".popupsubttl").hide();
				$(".emty_msg, .cartpopup-empty").show();
				$('.js-cart-count').text(cartdata.item_count);

			} else {

				var cart_markup = "";
				var cart_total = 0;
				$(cartdata.items).each(function (ix, em) {
                 
                  
                  var additional_handle="";
                  var additional_handle_child="";
                  if(em.properties != null && em.product_type == 'Multivariat' ){
                    additional_handle = "parent_";
                  }
                  if(em.properties != null && em.product_type == 'child_vatiant' ){
                  additional_handle_child = "child_";
                  }
					console.log(em);     
                    var child_key= em.key.split(':');
                  console.log(child_key); 
                  var additional_attr="";
                  if(em.properties != null && typeof em.properties.parentcls !== 'undefined'){
                    additional_attr = em.properties.parentcls;
                    console.log("additional_attr", additional_attr);
                  }
					let current_line_price = 0;
					if (em.properties != null && typeof em.properties._ro_unformatted_price !== 'undefined') {
						current_line_price = em.quantity * parseInt(em.properties._ro_unformatted_price);
					} else {
						current_line_price = em.quantity * parseInt(em.original_price);
					}
					cart_total += current_line_price;
					var price = Shopify.formatMoney(current_line_price, $('body').data('money-format'))
					cart_markup += `
<div class="d-flex cart_detail-popup">
    <div class="item">
        <div class="row" style="width:100%;">
           <div class='proimg-wrap col-15 col-miniphone-24'>
              <div class="proimg-cart">
                 <img class="" alt="proimg2" src="${em.image}">
              </div>              
           </div>
           <div class="prodetail col-9 col-miniphone-24 price-amount" data-var = "${em.id}">
           <div class="text-wrapper">
                  <h4 class="semibold proname mb-3"  ><a href="${em.url}">${em.title}</a></h4>
                  <h5 class="variant_name">${em.variant_title }</h5>
              </div>
              <div class="counter qtybtns mb-3" data-var = "${em.id}">
                 <div class="quantity buttons_added ${additional_handle}quantity" data-var = "${em.id}">
					<button class="minus  ${additional_handle}minus ${additional_handle_child}minus ${additional_handle}minus_${additional_attr}"  type="button" data-line-key="${child_key[1]}" data-key-var="${em.id}" data-minus-id="minus_${em.id}" ${additional_handle}data-close-id="close_${additional_attr}">-</button>
                    <input  class="${em.id}_${child_key[1]} input-text qty text ${additional_handle_child}_readonly" min="0"  name="quantity" pattern="" size="2" step="1" title="Qty" type="number" data-qty-id="${em.id}" value="${em.quantity}" data-line-itemkey="${em.key}">
                    <button  class=" plus ${additional_handle}plus ${additional_handle_child}plus ${additional_handle}plus_${additional_attr}" type="button" data-line-key="${child_key[1]}" data-key-var="${em.id}" data-qty-id="${em.id}" data-plus-id="plus_${em.id}">+</button>
                 </div>
                 <p class="price_11">${price}</p>
              </div>
              <div class="price pricepop" style="display:flex;justify-content: end;">
                 <p class="price_111" style="display:none;">${price}</p>
                <div class="close_btn remove-from-cart"  data-remove>
                     
 <div href="#" class= " ${additional_handle} close_${additional_attr} ${additional_handle}remove ${additional_handle}remove_${additional_attr} js-remove"  data-close-id="close_${em.id}" ${additional_handle_child}${additional_handle}data-variantid="${em.id}" data-variantids="${em.key}" style="color: #000;">
         Entfernen
                     </div>
                </div>
              </div>
           </div>
        </div>   
    </div>
</div>`;
				});



              
				$(".cart_product_wrapper").html(cart_markup);
				$(".js-gross-total").text(parseFloat(cart_total / 100) + " €");
				$(".popupsubttl").show();
				$(".cart_product_wrapper").show();
				$(".emty_msg, .cartpopup-empty").hide();
				$('.js-cart-count').text(cartdata.item_count);
			}
			$('.cartpopup').addClass('activepopup');
			$('body').toggleClass('open_modal');
                  $('.cart-count, .numitems').html(cartdata.item_count);
          if(cartdata.item_count > 0){
            $('.announce_dra').show();
          }else{
            $('.announce_dra').hide();
          }
          
		}
	});
}
// Function for side cart end


$(document).ready(function(){
  $('.cart_dra, .numitems').on('click', function () {
    // alert("hello");
    do_cart_refresh();
    $('.cartpopup').addClass('activepopup');
    $('.overlay').addClass('active');
  });
  $('.remove-popup, .close-pop-cart').on('click', function () {
    $('.cartpopup').removeClass('activepopup');
    $('.overlay').removeClass('active');
  });
});

$(document).ready(function(){
  String.prototype.getDecimals || (String.prototype.getDecimals = function () {
		var a = this,
			b = ("" + a).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
		return b ? Math.max(0, (b[1] ? b[1].length : 0) - (b[2] ? +b[2] : 0)) : 0
	});
	$(document).on('click',".plus, .minus", function () {
		var a = jQuery(this).closest(".quantity").find(".qty"),
			b = parseFloat(a.val()),
			c = parseFloat(a.attr("max")),
			d = parseFloat(a.attr("min")),
			e = a.attr("step");
		b && "" !== b && "NaN" !== b || (b = 0), "" !== c && "NaN" !== c || (c = ""), "" !== d && "NaN" !== d || (d = 0), "any" !== e && "" !== e && void 0 !== e && "NaN" !== parseFloat(e) || (e = 1), jQuery(this).is(".plus") ? c && b >= c ? a.val(c) : a.val((b + parseFloat(e)).toFixed(e.getDecimals())) : d && b <= d ? a.val(d) : b > 0 && a.val((b - parseFloat(e)).toFixed(e.getDecimals())), a.trigger("change")
		a.attr('value', a.val());
	});
});



$(document).on('click', '.js-remove', function (e) {
  e.preventDefault();

  let variant_id = $(e.target).attr('data-variantid');
  let quantity = 0;
  let current_item = {};
  current_item[variant_id] = 0;
  $.ajax({
    url: "/cart/update.js",
    data: { 'updates': current_item },
    dataType: "JSON",
    method: "POST",
    success: function (cartdata) {
      do_cart_refresh(cartdata);
    }
  });
});






//redirect cart form data to cart drawer
$(document).ready(function () {
  
  $('#addToCart').submit(function() {
    // alert("hello");
    console.log("product form data to drawer");
    $.ajax({
      url: '/cart/add.js',
      type: 'post',
      dataType: 'json',
      data: $('#addToCart').serialize(),
      success: function(data) { 
        
        do_cart_refresh();

      }
    });
    return false;
  });
});



$(document).ready(function () {
  $(document).on("click",".parent_plus",function(){
//     console.log('plus called');
    var Prod_data_id = $(this).attr("data-plus-id");
//     console.log(Prod_data_id);
    var childProd = `.${Prod_data_id}:first`;
//     console.log("chl+",childProd);
  var childvar= $(childProd).attr("data-key-var");
   var childkey= $(childProd).attr("data-line-key");
    var plus_child="."+childvar+"_"+childkey;
   var chldkey="'"+childvar+":"+childkey+"'";
   var chlqty=  $(plus_child).val();
    var plc= $(plus_child).attr("data-line-itemkey");
    
    setTimeout(function () {
   // $(plus_child).click();
    //  $.post('/cart/change.js', { quantity: chlqty+1, id: plc });

          $.ajax({
        url: "/cart/change.js",

        data: {quantity: parseInt(chlqty)+1, id: plc },

        dataType: "JSON",
        method: "POST",
        success: function (data) {
          $.get('/cart.json', function (data) {
            do_cart_refresh(data);
            
          });
        }

      })
      },2000);
  });


    $(document).on("click",".parent_minus",function(){
    console.log('minus called');
    var Prod_data_id = $(this).attr("data-minus-id");
//     console.log(Prod_data_id);
    var childProd = `.${Prod_data_id}:first`;
//     console.log(childProd);
    var childvar= $(childProd).attr("data-key-var");
   var childkey= $(childProd).attr("data-line-key");
    var plus_child="."+childvar+"_"+childkey;
   var chldkey="'"+childvar+":"+childkey+"'";
   var chlqty=  $(plus_child).val();
    var plc= $(plus_child).attr("data-line-itemkey");
    
    setTimeout(function () {
   // $(plus_child).click();
    //  $.post('/cart/change.js', { quantity: chlqty+1, id: plc });

          $.ajax({
        url: "/cart/change.js",

        data: {quantity: parseInt(chlqty)-1, id: plc },

        dataType: "JSON",
        method: "POST",
        success: function (data) {
          $.get('/cart.json', function (data) {
            do_cart_refresh(data);
            
          });
        }

      })
      },2000);
  });

});


$(document).ready(function () {
  $(document).on("click",".parent_remove",function(e) {
    var childDataId = $(this).attr("data-close-id");
//     console.log(childDataId);
//     console.log("parent remove 1");
    
    var childClose = `.${childDataId}`;
//     console.log(childClose);
//     console.log("parent remove 2");
    var clslen = $(childClose).length;
    // alert(clslen);
  let variants_id = $(childClose).attr('data-variantids');
    // alert(variant_id);
  let quantity = 0;
  let current_item = {};
  current_item[variants_id] = 0;
    
    $.ajax({  
    url: "/cart/update.js",
    data: { 'updates': current_item },
    dataType: "JSON",
    method: "POST",
    success: function (cartdata) {
        $(childClose).click();
        do_cart_refresh(cartdata);
     console.log($(childClose).length);
      if( $(childClose).length <= 1){
      $(".remove-popup").click(function () {
        location.reload();
      });
      }
    }
     
  });
  });
});




$(document).ready(function () {
  function updateCart_item($this) {
    var $parent = $this.parents('.cartItemContent');

    var id = $parent.attr('data-var');
    var qty = $parent.find('input[name="quantity"]').val();
    console.log(qty);
    $.ajax({
      url: '/cart/change.js',
      data: { quantity: qty, line: id },
      dataType: 'json',
      success: function (data) {

        jQuery.getJSON('/cart.js', function (data) {
          do_cart_refresh(data);
        });
      }
    });
  }


  $(document).on('change', '.parent_quantity [name="quantity"]', function (e) {
    setTimeout(function () {
    $('#loader').addClass("hide-loader");
      }, 4000);
    $('#loader').removeClass("hide-loader");
    setTimeout(function () {
      var cur_em = e.target;
      var parent_em = $(cur_em).parents('[data-var]').eq(0);


      var cur_qty = $(cur_em).val();

      var variant_id = $(cur_em).parents('[data-var]').eq(0).attr('data-var');

//       console.log('got called');

      $.ajax({
        url: "/cart/change.js",

        data: { id: variant_id, quantity: cur_qty },

        dataType: "JSON",
        method: "POST",
        success: function (data) {
          $.get('/cart.json', function (data) {
            do_cart_refresh(data);
            
          });
        }

      })
    }, 0);
  });



  $(document).on('change', '.quantity [name="quantity"]', function (e) {

    setTimeout(function () {
      var cur_em = e.target;
      var parent_em = $(cur_em).parents('[data-var]').eq(0);
      var cur_qty = $(cur_em).val();

      var variant_id = $(cur_em).parents('[data-var]').eq(0).attr('data-var');

//       console.log('got called');

      $.ajax({
        url: "/cart/change.js",

        data: { id: variant_id, quantity: cur_qty },

        dataType: "JSON",
        method: "POST",
        success: function (data) {
          $.get('/cart.json', function (data) {
            do_cart_refresh(data);
            
          });
        }

      })
    }, 0);
  });


});
