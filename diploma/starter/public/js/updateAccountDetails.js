// Alert
const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

// type success or error
const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};

// Update User Account
// Update User Data

const updateUserData = async (name, email) => {
    try{
        const updateRes = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/updateMe',
            data: {
                name,
                email
            }
        });
        if (updateRes.data.status === 'success') {
            showAlert('success', 'Updated Successfully');
            window.reload(true)
        }
    }catch(e){
        showAlert('error', err.response.data.message);
    }
};

if(document.querySelector('.updateCurrentUser')){
    document.querySelector('.updateCurrentUser').addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        updateUserData(name, email);
    });
}