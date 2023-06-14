function toggleEditing(orderId) {

  let price = document.getElementById(`price_${orderId}`);
  let paid = document.getElementById(`paid_${orderId}`);
  let createdAt = document.getElementById(`createdAt_${orderId}`);
  let userId = document.getElementById(`userId_${orderId}`);
  let productId = document.getElementById(`productId_${orderId}`);
  if (price.getElementsByTagName("input").length === 0) {
    // Enter editing mode

    let originalPrice = price.innerHTML;
    let originalPaid = paid.innerHTML;
    let originalCreatedAt = createdAt.innerHTML;
    let originalUserId = userId.innerHTML;
    let originalProductId = productId.innerHTML;

    price.innerHTML = '<input type="text" value="' + originalPrice + '" />';
    paid.innerHTML = '<input type="text" value="' + originalPaid + '" />';
    userId.innerHTML = '<input type="text" value="' + originalUserId + '" />';
    productId.innerHTML = '<input type="text" value="' + originalProductId + '" />';

  } else {
    // Exit editing mode

    const updatedPrice = price.getElementsByTagName("input")[0].value;
    const updatedPaid = paid.getElementsByTagName("input")[0].value;
    const updatedUserId = userId.getElementsByTagName("input")[0].value;
    const updatedProductId = productId.getElementsByTagName("input")[0].value;

    price.innerHTML = updatedPrice;
    paid.innerHTML = updatedPaid;
    userId.innerHTML = updatedUserId;
    productId.innerHTML = updatedProductId;
  }
}

const updateOrder = async (orderId) => {
  try{
    const price = document.getElementById(`price_${orderId}`).innerHTML;
    const paid = document.getElementById(`paid_${orderId}`).innerHTML;
    const product = document.getElementById(`productId_${orderId}`).innerHTML;
    const user = document.getElementById(`userId_${orderId}`).innerHTML;
    console.log('Product => ' + product);
    console.log('User => ' + user);

    const updateRes = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/booking/${orderId}`,
      data: {
        product,
        user,
        price,
        paid
      }
    });

    if (updateRes.data.status === 'success') {
      showAlert('success', `Updated successfully`);
      window.setTimeout(() => {
        location.reload(true)
      }, 1500);

    }
  }catch(e){
    showAlert('error', e.message)
  }
};

const deleteOrder = async (orderId) => {
  try{
    const res = await axios({
      method: 'DELETE',
      url: `http://127.0.0.1:8000/api/v1/booking/${orderId}`
    });
    showAlert('success', 'Deleted successfully');
    window.setTimeout(() => {
      location.reload(true)
    }, 1500);
  }catch(e) {
    showAlert('error', e.message)
  }
};