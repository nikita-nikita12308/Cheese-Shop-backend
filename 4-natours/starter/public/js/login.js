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

// REGISTER
const signup = async (name, email, password, passwordConfirm) => {
    try {
        const resultSignup = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        console.log(resultSignup.data.status)
        if (resultSignup.data.status === 'success') {
            showAlert('success', 'Register successfully! Please, Sign In');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

if(document.querySelector('.registerUser')){
    document.querySelector('.registerUser').addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
    });
}

// Sign in
const login = async (email, password) => {
    try{
        const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/v1/users/login',
        data: {
            email,
            password
        }
    });
    if(res.data.status === 'success') {
        showAlert('success', 'Logged in successfully');
        window.setTimeout(() => {
            location.assign('/');
        }, 1500);
    }
    }catch(e){
        showAlert('error', e.response.data.message);
    }
};

if(document.querySelector('.loginUser')){
    document.querySelector('.loginUser').addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login( email, password )
    });
}

// Log Out
const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout'
        });
        if(res.data.status === 'success') {
            showAlert('success', 'Logged out successfully');
            location.reload(true);
        }
    }catch(e){
        showAlert('error', 'Error logging out! Try again')
    }
};

if( document.querySelector('.nav__el--logout')) {
    document.querySelector('.nav__el--logout').addEventListener('click', logout);
}


