function toggleEditing(orderId) {
  var productName = document.getElementById(`productName_${orderId}`);
  var userName = document.getElementById(`userName_${orderId}`);
  var userEmail = document.getElementById(`userEmail_${orderId}`);
  var price = document.getElementById(`price_${orderId}`);
  var paid = document.getElementById(`paid_${orderId}`);
  var createdAt = document.getElementById(`createdAt_${orderId}`);

  if (productName.getElementsByTagName("input").length === 0) {
    // Enter editing mode
    var originalProductName = productName.innerHTML;
    var originalUserName = userName.innerHTML;
    var originalUserEmail = userEmail.innerHTML;
    var originalPrice = price.innerHTML;
    var originalPaid = paid.innerHTML;
    var originalCreatedAt = createdAt.innerHTML;

    productName.innerHTML = '<input type="text" value="' + originalProductName + '" />';
    userName.innerHTML = '<input type="text" value="' + originalUserName + '" />';
    userEmail.innerHTML = '<input type="text" value="' + originalUserEmail + '" />';
    price.innerHTML = '<input type="text" value="' + originalPrice + '" />';
    paid.innerHTML = '<input type="text" value="' + originalPaid + '" />';
  } else {
    // Exit editing mode
    var updatedProductName = productName.getElementsByTagName("input")[0].value;
    var updatedUserName = userName.getElementsByTagName("input")[0].value;
    var updatedUserEmail = userEmail.getElementsByTagName("input")[0].value;
    var updatedPrice = price.getElementsByTagName("input")[0].value;
    var updatedPaid = paid.getElementsByTagName("input")[0].value;


    productName.innerHTML = updatedProductName;
    userName.innerHTML = updatedUserName;
    userEmail.innerHTML = updatedUserEmail;
    price.innerHTML = updatedPrice;
    paid.innerHTML = updatedPaid;

  }
}