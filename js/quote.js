---
---

$(function () {
  $('[data-toggle="popover"]').popover()
  quoteBadge();
})

//------------------------------------------------------------------------------
// add new item to the quote
function saveItem(category, product) {
  var sku = $("#sku-" + product + " option:selected").text();
  var name = $("#name-" + product).text();
  var key = sku + "|!|" + product + "|!|" + name + "|!|" + category;
  var val = 1;
  localStorage.setItem("bae_" + btoa(key), val);
  $("#btn-" + product).popover('show');
  quoteBadge();
}

//-------------------------------------------------------------------------
// delete an item from the quote
function removeItem(key) {
  localStorage.removeItem("bae_" + key);
  quoteShowAll();
  quoteBadge();
}

//------------------------------------------------------------------------------
// increase item quantity
function increaseItem(key) {
  var val = parseInt(localStorage.getItem("bae_" + key));
  val += 1
  localStorage.setItem("bae_" + key, val);
  quoteShowAll();
  quoteBadge();
}

//------------------------------------------------------------------------------
// decrease item quantity
function decreaseItem(key) {
  var val = parseInt(localStorage.getItem("bae_" + key));
  if (val == 1) {
    return;
  }
  val -= 1
  localStorage.setItem("bae_" + key, val);
  quoteShowAll();
  quoteBadge();
}

//-------------------------------------------------------------------------------------
// empty quote
function emptyQuote() {
  localStorage.clear();
  quoteShowAll();
  quoteBadge();
}

//-------------------------------------------------------------------------------------
// return total quote item quantity
function totalQuantity() {
  var count = 0
  for (i = 0; i <= localStorage.length-1; i++) {
    if (!localStorage.key(i).includes('bae_')) {
      continue;
    }
    _key = atob(localStorage.key(i).replace('bae_', ''));
    qty = parseInt(localStorage.getItem("bae_" + btoa(_key)));
    count += qty;
  }
  return count;
}

//-------------------------------------------------------------------------------------
// display quote item count badge
//
function quoteBadge() {
  count = totalQuantity();
  if (count > 0) {
    $('#nav-quote').html('Quote<span class="mx-1"></span><span class="badge badge-pill badge-warning">' + count + '</span>');
  } else {
    $('#nav-quote').html('Quote');
  }
}

//--------------------------------------------------------------------------------------
// dynamically populate the table with shopping list items
function quoteShowAll() {
  if (CheckBrowser()) {
    var name = "";
    var sku = "";
    var qty = "";
    var i = 0;
    var list = "";
    var item = "";
    for (i = 0; i <= localStorage.length-1; i++) {
      if (!localStorage.key(i).includes('bae_')) {
        continue;
      }
      _key = atob(localStorage.key(i).replace('bae_', ''));
      key = _key.split('|!|');
      sku = key[0];
      slug = key[1];
      name = key[2];
      category = key[3];
      qty = parseInt(localStorage.getItem("bae_" + btoa(_key)));
      item = qty + '|!|' + _key;
      var decreaseButtonDisabled = "";
      if (qty == 1) {
        decreaseButtonDisabled = ' disabled aria-disabled="true"';
      }
      list += '<tr>'
        + '<th scope="row">'
        + '<div class="mb-4">'
        + '<input type="hidden" name="item-' + slug + '" value="' + btoa(item) + '" />'
        + '<a href="/products/' + category + '.html#' + slug + '">' + name + '</a>'
        + '</div>'
        + '<div class="btn-group mr-2" role="group">'
        + '<button type="button" class="btn btn-sm btn-secondary"' + decreaseButtonDisabled + ' onclick="decreaseItem(' + "'" + btoa(_key) + "'" + ');"><i class="fas fa-minus"></i></button>'
        + '<input type="text" class="form-control form-control-sm text-center" value="' + qty + '" size="1" />'
        + '<button type="button" class="btn btn-sm btn-secondary" onclick="increaseItem(' + "'" + btoa(_key) + "'" + ');"><i class="fas fa-plus"></i></button>'
        + '</div>'
        + '<div class="btn-group mr-2" role="group">'
        + '<button type="button" class="btn btn-sm btn-secondary" onclick="removeItem(' + "'" + btoa(_key) + "'" + ');"><i class="far fa-trash-alt"></i></button>'
        + '</div>'
        + '</th>'
        + '<td class="text-center">' + sku + '</td>'
        + '</tr>\n';
    }
    // if no item exists in the quote
    if (list == "") {
      list += '<tr><th scope="row" class="text-center" colspan=4><i>No Items in Quote</i></th></tr>\n';
      $("#quote-form-client").removeClass('visible');
      $("#quote-form-client").addClass('invisible');
    } else {
      $("#quote-form-client").removeClass('invisible');
      $("#quote-form-client").addClass('visible');
    }
    // bind the data to html table
    $("#quote-table > tbody").html(list);
  } else {
    error = '<tr><th scope="row" colspan=4>Cannot save shopping list. Your browser does not support HTML 5</th></tr>';
    $("#quote-table > tbody").html(error);
  }
}

//--------------------------------------------------------------------------------------
// Checking browser support
// this step may not be required as most of modern browsers do support HTML5
function CheckBrowser() {
  if ('localStorage' in window && window['localStorage'] !== null) {
    // we can use localStorage object to store data
    return true;
  } else {
    return false;
  }
}

//--------------------------------------------------------------------------------------
// Contact form handler
$("#submit-contact").click(function(e) {
  var valid = this.form.checkValidity();
  if (valid) {
    e.preventDefault();
    $('#submit-contact').prop('value', 'Sending...').prop('disabled', true);
    grecaptcha.ready(function() {
      grecaptcha.execute('{{ site.recaptcha.site_key }}', {action: 'submit'}).then(function(token) {
        payload = {
          recaptcha: token,
          name: $("#name").val(),
          company: $("#company").val(),
          email: $("#email").val(),
          phone: $("#phone").val(),
          message: $("#message").val(),
          type: $(":hidden#form-type").val()
        };
        $.ajax({
          type: "POST",
          url: "{{ site.mailer.url }}",
          data: JSON.stringify(payload),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function(data) {
            $('#contact-form-div').hide();
            $('#contact-form-success').removeClass('invisible');
            $('#contact-form-success').addClass('visible');
          },
          error: function(data) {
            $('#contact-form-div').hide();
            $('#contact-form-error').removeClass('invisible');
            $('#contact-form-error').addClass('visible');
          }
        });
      });
    });
  } else {
    this.form.reportValidity();
  }
});

//--------------------------------------------------------------------------------------
// Quote form handler
$("#submit-quote").click(function(e) {
  var valid = this.form.checkValidity();
  if (valid) {
    e.preventDefault();
    $('#submit-quote').prop('value', 'Requesting...').prop('disabled', true);
    grecaptcha.ready(function() {
      grecaptcha.execute('{{ site.recaptcha.site_key }}', {action: 'submit'}).then(function(token) {
        payload = {
          recaptcha: token,
          name: $("#name").val(),
          company: $("#company").val(),
          email: $("#email").val(),
          phone: $("#phone").val(),
          address: $("#address").val(),
          address2: $("#address2").val(),
          city: $("#city").val(),
          state: $("#state").val(),
          zip: $("#zip").val(),
          items: $('input[name^="item-"]').map(function(idx, elem) { return $(elem).val(); }).get(),
          type: $(":hidden#form-type").val()
        };
        $.ajax({
          type: "POST",
          url: "{{ site.mailer.url }}",
          data: JSON.stringify(payload),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function(data) {
            emptyQuote();
            $('#quote-form-client').hide();
            $('#quote-form-success').removeClass('invisible');
            $('#quote-form-success').addClass('visible');
          },
          error: function(data) {
            $('#quote-form-client').hide();
            $('#quote-form-error').removeClass('invisible');
            $('#quote-form-error').addClass('visible');
          }
        });
      });
    });
  } else {
    this.form.reportValidity();
  }
});
